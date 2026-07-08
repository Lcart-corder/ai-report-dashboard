import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { GraduationCap, PlayCircle, CheckCircle2, Circle, FileText, Award, ArrowLeft } from "lucide-react";

export default function LmsLearnCourse() {
  const params = useParams();
  const enrollmentId = Number(params.enrollmentId);
  const utils = trpc.useUtils();

  const enrollment = trpc.lms.enrollments.getById.useQuery({ id: enrollmentId }, { enabled: !!enrollmentId });
  const courseId = enrollment.data?.courseId;
  const learnerId = enrollment.data?.learnerId ?? 0;

  const course = trpc.lms.courses.getById.useQuery({ id: courseId! }, { enabled: !!courseId });
  const lessons = trpc.lms.courses.lessons.useQuery({ courseId: courseId! }, { enabled: !!courseId });
  const checks = trpc.lms.enrollments.checks.useQuery({ enrollmentId }, { enabled: !!enrollmentId });
  const progressLogs = trpc.lms.enrollments.progressLogs.useQuery({ enrollmentId }, { enabled: !!enrollmentId });
  const quizzes = trpc.lms.quizzes.byCourse.useQuery({ courseId: courseId! }, { enabled: !!courseId });
  const report = trpc.lms.reports.get.useQuery({ enrollmentId }, { enabled: !!enrollmentId });
  const certificate = trpc.lms.certificates.getByEnrollment.useQuery({ enrollmentId }, { enabled: !!enrollmentId });

  const refreshAll = () => {
    utils.lms.enrollments.getById.invalidate({ id: enrollmentId });
    utils.lms.enrollments.checks.invalidate({ enrollmentId });
    utils.lms.enrollments.progressLogs.invalidate({ enrollmentId });
  };

  const recordProgress = trpc.lms.recordProgress.useMutation({ onSuccess: refreshAll });
  const recordCheck = trpc.lms.recordCheck.useMutation({
    onSuccess: () => { toast.success("視聴完了を記録しました"); refreshAll(); },
    onError: e => toast.error(e.message),
  });
  const issueCert = trpc.lms.certificates.issue.useMutation({
    onSuccess: () => { toast.success("修了証を発行しました"); utils.lms.certificates.getByEnrollment.invalidate({ enrollmentId }); refreshAll(); },
    onError: e => toast.error(e.message),
  });

  const checkedLessonIds = new Set(checks.data?.map(c => c.lessonId) ?? []);
  const watchedLessonIds = new Set((progressLogs.data ?? []).filter(l => l.completedAt != null).map(l => l.lessonId));

  function watchAndComplete(lessonId: number) {
    // デモ: 動画を最後まで視聴した想定で視聴率100%・完了を記録
    recordProgress.mutate({ enrollmentId, lessonId, watchRate: 100, completed: true, lastPositionSec: 0, playbackRate: "1.0" });
    toast.info("動画を視聴しました（視聴ログを保存）");
  }

  const e = enrollment.data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b bg-white dark:bg-slate-900">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4">
          <a href={`/lms/learn/${learnerId}`} className="text-slate-400 hover:text-slate-600"><ArrowLeft className="h-5 w-5" /></a>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white"><GraduationCap className="h-5 w-5" /></div>
          <div>
            <div className="text-sm font-semibold">{course.data?.name ?? "コース"}</div>
            <div className="text-xs text-slate-500">進捗 {e?.progressRate ?? 0}% ・ 合格点 {course.data?.passingScore ?? 80}%</div>
          </div>
          {e?.status === "completed" && <Badge className="ml-auto bg-emerald-600">修了</Badge>}
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <Progress value={e?.progressRate ?? 0} className="h-2" />

        {/* レッスン */}
        <Card>
          <CardHeader><CardTitle className="text-base">動画レッスンと確認チェック</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {lessons.data?.map(l => {
              const watched = watchedLessonIds.has(l.id);
              const checked = checkedLessonIds.has(l.id);
              return (
                <div key={l.id} className="flex items-center gap-3 rounded-lg border p-3">
                  {checked ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : <Circle className="h-5 w-5 shrink-0 text-slate-300" />}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{l.chapter ? `${l.chapter} ` : ""}{l.title}</div>
                    <div className="text-xs text-slate-500">{l.durationMinutes}分 {watched && "・視聴済"}</div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => watchAndComplete(l.id)} disabled={recordProgress.isPending}>
                    <PlayCircle className="mr-1 h-4 w-4" /> 視聴
                  </Button>
                  <Button size="sm" variant={checked ? "secondary" : "default"} disabled={!watched || checked || recordCheck.isPending} onClick={() => recordCheck.mutate({ enrollmentId, lessonId: l.id, learnerId })}>
                    {checked ? "チェック済" : "視聴完了"}
                  </Button>
                </div>
              );
            })}
            {lessons.data?.length === 0 && <p className="text-sm text-slate-400">レッスンがありません。</p>}
          </CardContent>
        </Card>

        {/* テスト */}
        {quizzes.data?.map(q => <QuizTaker key={q.id} quizId={q.id} enrollmentId={enrollmentId} learnerId={learnerId} onDone={refreshAll} />)}

        {/* 学習レポート */}
        <ReportForm enrollmentId={enrollmentId} learnerId={learnerId} initial={report.data} onDone={() => { utils.lms.reports.get.invalidate({ enrollmentId }); refreshAll(); }} />

        {/* 修了証 */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Award className="h-4 w-4" /> 修了証</CardTitle></CardHeader>
          <CardContent>
            {certificate.data ? (
              <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950">
                <div className="text-sm text-slate-600 dark:text-slate-300">証明番号: <span className="font-mono">{certificate.data.certificateNumber}</span></div>
                <div className="mt-1 text-lg font-bold">{certificate.data.learnerName} 様</div>
                <div className="text-sm">{certificate.data.courseName}（標準学習時間 {(certificate.data.standardMinutes / 60).toFixed(1)}時間）を修了</div>
                <div className="mt-1 text-sm text-slate-500">修了日: {certificate.data.completionDate} ／ 発行: {certificate.data.issuer}</div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">
                <p>全レッスンの視聴完了・確認チェック・テスト合格・レポート提出が揃うと発行できます。</p>
                <Button className="mt-3" onClick={() => issueCert.mutate({ enrollmentId })} disabled={issueCert.isPending || e?.status !== "completed"}>
                  <Award className="mr-1.5 h-4 w-4" /> 修了証を発行
                </Button>
                {e?.status !== "completed" && <p className="mt-2 text-xs text-amber-600">※ まだ修了条件を満たしていません。</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function QuizTaker({ quizId, enrollmentId, learnerId, onDone }: { quizId: number; enrollmentId: number; learnerId: number; onDone: () => void }) {
  const quiz = trpc.lms.quizzes.getWithQuestions.useQuery({ quizId });
  const results = trpc.lms.quizzes.results.useQuery({ enrollmentId });
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const utils = trpc.useUtils();

  const submit = trpc.lms.quizzes.submit.useMutation({
    onSuccess: r => {
      toast[r.passed ? "success" : "error"](`採点結果: ${r.score}点（${r.passed ? "合格" : "不合格"}）`);
      utils.lms.quizzes.results.invalidate({ enrollmentId });
      onDone();
    },
    onError: e => toast.error(e.message),
  });

  const passed = results.data?.some(r => r.quizId === quizId && r.passed);
  const attempts = results.data?.filter(r => r.quizId === quizId).length ?? 0;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4" /> {quiz.data?.title ?? "確認テスト"}</CardTitle>
        {passed ? <Badge className="bg-emerald-600">合格</Badge> : <Badge variant="secondary">合格点 {quiz.data?.passingScore ?? 80}%</Badge>}
      </CardHeader>
      <CardContent className="space-y-4">
        {quiz.data?.questions.map((qq, qi) => {
          const opts = (qq.options as string[] | null) ?? [];
          return (
            <div key={qq.id}>
              <div className="mb-1.5 text-sm font-medium">Q{qi + 1}. {qq.questionText}</div>
              <div className="space-y-1">
                {opts.map((opt, oi) => {
                  const selected = answers[String(qq.id)]?.includes(oi);
                  return (
                    <label key={oi} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${selected ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950" : ""}`}>
                      <input
                        type="radio"
                        name={`q${qq.id}`}
                        checked={!!selected}
                        onChange={() => setAnswers({ ...answers, [String(qq.id)]: [oi] })}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => submit.mutate({ quizId, enrollmentId, learnerId, answers })}
            disabled={submit.isPending || passed}
          >採点する</Button>
          <span className="text-xs text-slate-400">受験回数: {attempts}{quiz.data?.maxAttempts != null ? ` / ${quiz.data.maxAttempts}` : ""}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportForm({ enrollmentId, learnerId, initial, onDone }: { enrollmentId: number; learnerId: number; initial: { whatLearned?: string | null; howToApply?: string | null; status?: string } | undefined; onDone: () => void }) {
  const [whatLearned, setWhatLearned] = useState(initial?.whatLearned ?? "");
  const [howToApply, setHowToApply] = useState(initial?.howToApply ?? "");

  const upsert = trpc.lms.reports.upsert.useMutation({
    onSuccess: () => { toast.success("学習レポートを保存しました"); onDone(); },
    onError: e => toast.error(e.message),
  });

  const submitted = initial?.status === "submitted" || initial?.status === "approved";

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">学習レポート</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="mb-1 text-sm font-medium">学んだこと</div>
          <Textarea rows={3} value={whatLearned} onChange={e => setWhatLearned(e.target.value)} placeholder="このコースで学んだ内容を記入してください" />
        </div>
        <div>
          <div className="mb-1 text-sm font-medium">業務への活かし方</div>
          <Textarea rows={3} value={howToApply} onChange={e => setHowToApply(e.target.value)} placeholder="学んだ内容を今後の業務にどう活かすか記入してください" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => upsert.mutate({ enrollmentId, learnerId, whatLearned, howToApply, submit: false })} disabled={upsert.isPending}>下書き保存</Button>
          <Button onClick={() => upsert.mutate({ enrollmentId, learnerId, whatLearned, howToApply, submit: true })} disabled={upsert.isPending || !whatLearned || !howToApply}>提出</Button>
          {submitted && <Badge className="bg-emerald-600">提出済</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
