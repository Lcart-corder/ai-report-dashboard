import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { GraduationCap, PlayCircle, CheckCircle2, Circle, FileText, Award, ArrowLeft, ListChecks, Target, ClipboardCheck, Lock, Paperclip } from "lucide-react";
import { Donut } from "./ui";
import { LessonPlayer } from "./LessonPlayer";

export default function LmsLearnCourse() {
  const params = useParams();
  const enrollmentId = Number(params.enrollmentId);
  const utils = trpc.useUtils();

  const enrollment = trpc.lms.enrollments.getById.useQuery({ id: enrollmentId }, { enabled: !!enrollmentId });
  const courseId = enrollment.data?.courseId;
  const learnerId = enrollment.data?.learnerId ?? 0;

  const course = trpc.lms.courses.getById.useQuery({ id: courseId! }, { enabled: !!courseId });
  const lessons = trpc.lms.courses.lessons.useQuery({ courseId: courseId! }, { enabled: !!courseId });
  const materials = trpc.lms.courses.materials.useQuery({ courseId: courseId! }, { enabled: !!courseId });
  const checks = trpc.lms.enrollments.checks.useQuery({ enrollmentId }, { enabled: !!enrollmentId });
  const progressLogs = trpc.lms.enrollments.progressLogs.useQuery({ enrollmentId }, { enabled: !!enrollmentId });
  const quizzes = trpc.lms.quizzes.byCourse.useQuery({ courseId: courseId! }, { enabled: !!courseId });
  const quizResults = trpc.lms.quizzes.results.useQuery({ enrollmentId }, { enabled: !!enrollmentId });
  const report = trpc.lms.reports.get.useQuery({ enrollmentId }, { enabled: !!enrollmentId });
  const practical = trpc.lms.practical.get.useQuery({ enrollmentId }, { enabled: !!enrollmentId });
  const certificate = trpc.lms.certificates.getByEnrollment.useQuery({ enrollmentId }, { enabled: !!enrollmentId });

  const refreshAll = () => {
    utils.lms.enrollments.getById.invalidate({ id: enrollmentId });
    utils.lms.enrollments.checks.invalidate({ enrollmentId });
    utils.lms.enrollments.progressLogs.invalidate({ enrollmentId });
  };

  const recordCheck = trpc.lms.recordCheck.useMutation({
    onSuccess: () => { toast.success("確認チェックを記録しました"); refreshAll(); },
    onError: e => toast.error(e.message),
  });
  const [playerLesson, setPlayerLesson] = useState<null | { id: number; title: string; chapter?: string | null; videoUrl?: string | null; durationMinutes: number }>(null);
  const issueCert = trpc.lms.certificates.issue.useMutation({
    onSuccess: () => { toast.success("修了証を発行しました"); utils.lms.certificates.getByEnrollment.invalidate({ enrollmentId }); refreshAll(); },
    onError: e => toast.error(e.message),
  });

  const checkedLessonIds = new Set(checks.data?.map(c => c.lessonId) ?? []);
  const watchedLessonIds = new Set((progressLogs.data ?? []).filter(l => l.completedAt != null).map(l => l.lessonId));
  // レッスンID → 視聴ログ(続きから再開・視聴率の初期値に使用)
  const logByLesson = new Map<number, { watchRate: number; lastPositionSec: number; completed: boolean }>();
  for (const l of progressLogs.data ?? []) logByLesson.set(l.lessonId, { watchRate: l.watchRate, lastPositionSec: l.lastPositionSec ?? 0, completed: l.completedAt != null });

  const e = enrollment.data;
  const allLessons = lessons.data ?? [];
  const requiredLessons = allLessons.filter(l => l.isRequired);
  const requiredTotal = requiredLessons.length;
  const watchedCount = requiredLessons.filter(l => watchedLessonIds.has(l.id)).length;
  const checkedCount = requiredLessons.filter(l => checkedLessonIds.has(l.id)).length;
  const quizPassed = (quizzes.data?.length ?? 0) > 0 && quizzes.data!.every(q => quizResults.data?.some(r => r.quizId === q.id && r.passed));
  const reportSubmitted = report.data?.status === "submitted" || report.data?.status === "approved";
  const practicalRequired = !!course.data?.requirePracticalTest;
  const practicalDone = practical.data?.status === "submitted" || practical.data?.status === "approved";
  const remainVideos = Math.max(0, requiredTotal - watchedCount);
  const remainChecks = Math.max(0, requiredTotal - checkedCount);
  const quizTaken = (quizResults.data?.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-[#f4f6fa] dark:bg-slate-950">
      <header className="border-b bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <a href={`/lms/learn/${learnerId}`} className="text-slate-400 hover:text-slate-600"><ArrowLeft className="h-5 w-5" /></a>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white"><GraduationCap className="h-5 w-5" /></div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold">{course.data?.name ?? "コース"}</div>
            <div className="text-xs text-slate-500">L cart 学習ポータル ・ 合格点 {course.data?.passingScore ?? 80}%</div>
          </div>
          {e?.status === "completed" && <Badge className="ml-auto bg-emerald-600">修了</Badge>}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* コース概要 */}
        <Card className="mb-5 border-slate-200 dark:border-slate-800">
          <CardContent className="flex items-center gap-5 p-5">
            <Donut value={e?.progressRate ?? 0} size={72} color="#2563eb" />
            <div className="min-w-0 flex-1">
              <div className="text-lg font-bold">{course.data?.name ?? "コース"}</div>
              <div className="mt-1 text-sm text-slate-500">
                受講期限: {e?.dueDate ?? "-"}
                {e?.dueDate && <span className="ml-2 text-rose-500">{daysLeftLabel(e.dueDate)}</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
          {/* チャプター一覧 */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2"><CardTitle className="text-base">チャプター一覧</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {allLessons.map((l, i) => {
                const log = logByLesson.get(l.id);
                const watched = watchedLessonIds.has(l.id);
                const checked = checkedLessonIds.has(l.id);
                const wr = log?.watchRate ?? 0;
                const prevLesson = i > 0 ? allLessons[i - 1] : undefined;
                const locked = !!l.requireSequential && !!prevLesson && !watchedLessonIds.has(prevLesson.id);
                const lessonMaterials = materials.data?.filter(m => m.lessonId === l.id) ?? [];
                return (
                  <div key={l.id} className={`rounded-lg border border-slate-200 p-3 dark:border-slate-800 ${locked ? "opacity-60" : ""}`}>
                    <div className="flex items-center gap-3">
                      {locked
                        ? <Lock className="h-5 w-5 shrink-0 text-slate-300" />
                        : <PlayCircle className={`h-5 w-5 shrink-0 ${watched ? "text-blue-600" : wr > 0 ? "text-blue-400" : "text-slate-300"}`} />}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{l.chapter ? `${l.chapter} ` : ""}{l.title}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{l.durationMinutes}分</span>
                          {locked
                            ? <span className="text-amber-600">「{prevLesson?.title}」の視聴完了が必要です</span>
                            : wr > 0 && !watched && <span className="text-blue-500">視聴率 {wr}%</span>}
                        </div>
                      </div>
                      {checked
                        ? <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">視聴済み</span>
                        : watched
                          ? <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">視聴中</span>
                          : <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800">未視聴</span>}
                      <Button size="sm" variant="ghost" className="h-7 text-blue-600 hover:text-blue-700" disabled={locked} onClick={() => setPlayerLesson(l)}>
                        <PlayCircle className="mr-1 h-4 w-4" /> {wr > 0 && !watched ? "続きから" : "視聴"}
                      </Button>
                      <Button size="sm" className="h-7" variant={checked ? "secondary" : "default"} disabled={locked || !watched || checked || recordCheck.isPending} onClick={() => recordCheck.mutate({ enrollmentId, lessonId: l.id, learnerId })}>
                        {checked ? "済" : "視聴完了"}
                      </Button>
                    </div>
                    {lessonMaterials.length > 0 && (
                      <div className="ml-8 mt-2 flex flex-wrap gap-1.5">
                        {lessonMaterials.map(m => (
                          m.fileUrl
                            ? <a key={m.id} href={m.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"><Paperclip className="h-3 w-3" /> {m.name}</a>
                            : <span key={m.id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800"><Paperclip className="h-3 w-3" /> {m.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {allLessons.length === 0 && <p className="text-sm text-slate-400">レッスンがありません。</p>}
            </CardContent>
          </Card>

          {/* 未完了タスク + 修了条件 */}
          <div className="space-y-5">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><ListChecks className="h-4 w-4 text-slate-400" /> 未完了タスク</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <TaskRow label="動画を視聴する" sub={`残り${remainVideos}本`} count={remainVideos} done={remainVideos === 0} />
                <TaskRow label="確認チェックを行う" sub={`残り${remainChecks}回`} count={remainChecks} done={remainChecks === 0} />
                <TaskRow label="確認テストを受験する" sub={quizPassed ? "合格済" : quizTaken ? "再受験可" : "未受験"} count={quizPassed ? 0 : (quizzes.data?.length ?? 0)} done={quizPassed} />
                {course.data?.requireReport && <TaskRow label="学習レポートを提出する" sub={reportSubmitted ? "提出済" : "未提出"} count={reportSubmitted ? 0 : 1} done={!!reportSubmitted} />}
                {practicalRequired && <TaskRow label="実務課題を提出する" sub={practical.data?.status === "approved" ? "承認済" : practical.data?.status === "returned" ? "差戻し" : practicalDone ? "提出済" : "未提出"} count={practicalDone ? 0 : 1} done={practicalDone} />}
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Target className="h-4 w-4 text-slate-400" /> 修了条件</CardTitle></CardHeader>
              <CardContent className="space-y-2.5">
                <CondRow ok={requiredTotal > 0 && watchedCount === requiredTotal} label="すべての動画を視聴" value={`${watchedCount}/${requiredTotal}`} />
                <CondRow ok={requiredTotal > 0 && checkedCount === requiredTotal} label="確認チェックを完了" value={`${checkedCount}/${requiredTotal}`} />
                <CondRow ok={quizPassed} label="確認テストに合格" value={quizPassed ? "合格" : `${quizTaken ? "未合格" : "-"}/${quizzes.data?.length ?? 0}`} />
                {course.data?.requireReport && <CondRow ok={!!reportSubmitted} label="学習レポートを提出" value={reportSubmitted ? "済" : "未"} />}
                {practicalRequired && <CondRow ok={practicalDone} label="実務課題を提出" value={practical.data?.status === "approved" ? "承認" : practicalDone ? "済" : "未"} />}
                <p className="pt-1 text-[11px] text-slate-400">※ すべての条件を満たすと修了となります。</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* テスト */}
        <div className="mt-5 space-y-5">
          {quizzes.data?.map(q => <QuizTaker key={q.id} quizId={q.id} enrollmentId={enrollmentId} learnerId={learnerId} onDone={refreshAll} />)}
          <ReportForm enrollmentId={enrollmentId} learnerId={learnerId} initial={report.data} onDone={() => { utils.lms.reports.get.invalidate({ enrollmentId }); refreshAll(); }} />
          {practicalRequired && <PracticalForm enrollmentId={enrollmentId} learnerId={learnerId} initial={practical.data} onDone={() => { utils.lms.practical.get.invalidate({ enrollmentId }); refreshAll(); }} />}

          {/* 修了証 */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Award className="h-4 w-4" /> 修了証</CardTitle></CardHeader>
            <CardContent>
              {certificate.data ? (
                <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950">
                  <div className="text-sm text-slate-600 dark:text-slate-300">証明番号: <span className="font-mono">{certificate.data.certificateNumber}</span></div>
                  <div className="mt-1 text-lg font-bold">{certificate.data.learnerName} 様</div>
                  <div className="text-sm">{certificate.data.courseName}（標準学習時間 {(certificate.data.standardMinutes / 60).toFixed(1)}時間）を修了</div>
                  <div className="mt-1 text-sm text-slate-500">修了日: {certificate.data.completionDate} ／ 発行: {certificate.data.issuer}</div>
                  <a href={`/lms/certificate/${enrollmentId}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">
                    <Award className="h-4 w-4" /> 修了証を開く（印刷 / PDF保存）
                  </a>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  <p>全レッスンの視聴完了・確認チェック・テスト合格・レポート提出が揃うと<strong>自動的に発行</strong>されます。</p>
                  <Button className="mt-3 bg-blue-600 hover:bg-blue-700" onClick={() => issueCert.mutate({ enrollmentId })} disabled={issueCert.isPending || e?.status !== "completed"}>
                    <Award className="mr-1.5 h-4 w-4" /> 修了証を発行
                  </Button>
                  {e?.status !== "completed" && <p className="mt-2 text-xs text-amber-600">※ まだ修了条件を満たしていません。</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* レッスン動画プレイヤー */}
        {playerLesson && (
          <LessonPlayer
            open={!!playerLesson}
            onOpenChange={o => { if (!o) setPlayerLesson(null); }}
            enrollmentId={enrollmentId}
            lessonId={playerLesson.id}
            learnerId={learnerId}
            title={playerLesson.title}
            chapter={playerLesson.chapter}
            videoUrl={playerLesson.videoUrl}
            durationMinutes={playerLesson.durationMinutes}
            initial={logByLesson.get(playerLesson.id) ?? { watchRate: 0, lastPositionSec: 0, completed: false }}
            onProgress={refreshAll}
          />
        )}
      </main>
    </div>
  );
}

function daysLeftLabel(due: string): string {
  const d = Math.ceil((new Date(`${due}T00:00:00`).getTime() - Date.now()) / 86400000);
  if (d < 0) return "期限切れ";
  if (d === 0) return "本日まで";
  return `残り${d}日`;
}

function TaskRow({ label, sub, count, done }: { label: string; sub: string; count: number; done: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-slate-300" />}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm">{label}</div>
        <div className="text-xs text-slate-400">{sub}</div>
      </div>
      {!done && count > 0 && <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white">{count}</span>}
    </div>
  );
}

function CondRow({ ok, label, value }: { ok: boolean; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <Circle className="h-4 w-4 shrink-0 text-slate-300" />}
      <span className="flex-1 text-slate-600 dark:text-slate-300">{label}</span>
      <span className={`tabular-nums font-medium ${ok ? "text-emerald-600" : "text-slate-400"}`}>{value}</span>
    </div>
  );
}

// options はJSONカラム。ドライバによって配列/文字列いずれでも返り得るため頑健に配列化する。
function parseOptions(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
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
          const opts = parseOptions(qq.options);
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

function ReportForm({ enrollmentId, learnerId, initial, onDone }: { enrollmentId: number; learnerId: number; initial: { whatLearned?: string | null; howToApply?: string | null; status?: string } | null | undefined; onDone: () => void }) {
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

// 実務課題(実技テスト)の提出フォーム。提出で修了条件を満たす(講師承認/差戻しにも対応)。
function PracticalForm({ enrollmentId, learnerId, initial, onDone }: {
  enrollmentId: number; learnerId: number;
  initial: { title?: string | null; content?: string | null; fileUrl?: string | null; status?: string; reviewComment?: string | null } | null | undefined;
  onDone: () => void;
}) {
  const [content, setContent] = useState(initial?.content ?? "");
  const [fileUrl, setFileUrl] = useState(initial?.fileUrl ?? "");

  const upsert = trpc.lms.practical.upsert.useMutation({
    onSuccess: () => { toast.success("実務課題を保存しました"); onDone(); },
    onError: e => toast.error(e.message),
  });

  const status = initial?.status;
  const submitted = status === "submitted" || status === "approved";

  return (
    <Card className="border-blue-200 dark:border-blue-950">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base"><ClipboardCheck className="h-4 w-4 text-blue-600" /> 実務課題（実技テスト）</CardTitle>
        <p className="text-xs text-slate-500">受講内容を実務で実践した結果を提出してください。提出をもって修了条件を満たします。</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {status === "approved" && <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">講師が承認しました。</div>}
        {status === "returned" && <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">差戻しされました。修正のうえ再提出してください。{initial?.reviewComment ? `（${initial.reviewComment}）` : ""}</div>}
        <div>
          <div className="mb-1 text-sm font-medium">実施内容・成果</div>
          <Textarea rows={4} value={content} onChange={e => setContent(e.target.value)} placeholder="学んだ内容を実務でどのように適用し、どんな成果が出たかを具体的に記入してください" />
        </div>
        <div>
          <div className="mb-1 text-sm font-medium">成果物URL（任意）</div>
          <Input value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://… 資料・スクリーンショット等の共有リンク" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => upsert.mutate({ enrollmentId, learnerId, content, fileUrl: fileUrl || undefined, submit: false })} disabled={upsert.isPending}>下書き保存</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => upsert.mutate({ enrollmentId, learnerId, content, fileUrl: fileUrl || undefined, submit: true })} disabled={upsert.isPending || !content}>提出して完了にする</Button>
          {submitted && <Badge className="bg-emerald-600">{status === "approved" ? "承認済" : "提出済"}</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
