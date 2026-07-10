import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { BookOpen, Plus, Clock, Download, CheckCircle2, XCircle, Video, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function LmsCourses() {
  const utils = trpc.useUtils();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const courses = trpc.lms.courses.list.useQuery();

  const [nc, setNc] = useState({ name: "", description: "", standardMinutes: 600, subsidyCategory: "リスキリング支援コース", tuitionFee: 50000, lmsFee: 10000 });
  const createCourse = trpc.lms.courses.create.useMutation({
    onSuccess: () => { toast.success("コースを作成しました"); utils.lms.courses.list.invalidate(); setNc({ name: "", description: "", standardMinutes: 600, subsidyCategory: "リスキリング支援コース", tuitionFee: 50000, lmsFee: 10000 }); },
    onError: e => toast.error(e.message),
  });

  const selected = courses.data?.find(c => c.id === selectedId) ?? courses.data?.[0] ?? null;

  return (
    <LmsLayout title="コース・教材" description="コース作成、動画レッスン、確認テスト、標準学習時間10時間判定（FR-05 / FR-06 / FR-09）">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Dialog>
            <DialogTrigger asChild><Button className="w-full bg-blue-600 hover:bg-blue-700"><Plus className="mr-1.5 h-4 w-4" /> コースを作成</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>コース作成</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>コース名 *</Label><Input value={nc.name} onChange={e => setNc({ ...nc, name: e.target.value })} /></div>
                <div><Label>説明</Label><Textarea value={nc.description} onChange={e => setNc({ ...nc, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>標準学習時間(分)</Label><Input type="number" value={nc.standardMinutes} onChange={e => setNc({ ...nc, standardMinutes: Number(e.target.value) })} /></div>
                  <div><Label>助成金区分</Label><Input value={nc.subsidyCategory} onChange={e => setNc({ ...nc, subsidyCategory: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>研修費(円)</Label><Input type="number" value={nc.tuitionFee} onChange={e => setNc({ ...nc, tuitionFee: Number(e.target.value) })} /></div>
                  <div><Label>LMS利用料(円)</Label><Input type="number" value={nc.lmsFee} onChange={e => setNc({ ...nc, lmsFee: Number(e.target.value) })} /></div>
                </div>
                {nc.standardMinutes < 600 && <p className="text-xs text-amber-600">※ 標準学習時間が10時間(600分)未満です。助成金要件を満たさない可能性があります。</p>}
              </div>
              <DialogFooter>
                <Button onClick={() => createCourse.mutate(nc)} disabled={!nc.name || createCourse.isPending}>作成</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">コース（{courses.data?.length ?? 0}）</CardTitle></CardHeader>
            <CardContent className="space-y-1 p-2">
              {courses.data?.length === 0 && <p className="p-3 text-sm text-slate-400">コースがありません。</p>}
              {courses.data?.map(c => (
                <button key={c.id} onClick={() => setSelectedId(c.id)} className={cn("flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm", (selected?.id === c.id) ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "hover:bg-slate-100 dark:hover:bg-slate-800")}>
                  <BookOpen className="h-4 w-4 shrink-0 text-slate-400" /><span className="truncate">{c.name}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {selected ? <CourseDetail key={selected.id} courseId={selected.id} courseName={selected.name} onExport={csv => downloadCsv(`受講状況_${selected.name}.csv`, csv)} /> : <Card><CardContent className="p-12 text-center text-slate-400">左からコースを選択してください。</CardContent></Card>}
      </div>
    </LmsLayout>
  );
}

function CourseDetail({ courseId, courseName, onExport }: { courseId: number; courseName: string; onExport: (csv: string) => void }) {
  const utils = trpc.useUtils();
  const course = trpc.lms.courses.getById.useQuery({ id: courseId });
  const lessons = trpc.lms.courses.lessons.useQuery({ courseId });
  const duration = trpc.lms.courses.duration.useQuery({ id: courseId });
  const quizzes = trpc.lms.quizzes.byCourse.useQuery({ courseId });

  const updateCourse = trpc.lms.courses.update.useMutation({
    onSuccess: () => { toast.success("修了条件を更新しました"); utils.lms.courses.getById.invalidate({ id: courseId }); },
    onError: e => toast.error(e.message),
  });

  const [nl, setNl] = useState({ title: "", chapter: "", videoUrl: "", durationMinutes: 100 });
  const createLesson = trpc.lms.courses.createLesson.useMutation({
    onSuccess: () => { toast.success("レッスンを追加しました"); utils.lms.courses.lessons.invalidate({ courseId }); utils.lms.courses.duration.invalidate({ id: courseId }); setNl({ title: "", chapter: "", videoUrl: "", durationMinutes: 100 }); },
    onError: e => toast.error(e.message),
  });
  const deleteLesson = trpc.lms.courses.deleteLesson.useMutation({
    onSuccess: () => { utils.lms.courses.lessons.invalidate({ courseId }); utils.lms.courses.duration.invalidate({ id: courseId }); },
  });

  const createQuiz = trpc.lms.quizzes.create.useMutation({
    onSuccess: () => { toast.success("確認テストを作成しました"); utils.lms.quizzes.byCourse.invalidate({ courseId }); },
    onError: e => toast.error(e.message),
  });

  const exportCsv = trpc.lms.exports.courseProgressCsv.useMutation({
    onSuccess: r => { onExport(r.csv); toast.success("受講状況CSVを出力しました"); },
    onError: e => toast.error(e.message),
  });

  const meets = duration.data?.meetsSubsidy ?? false;
  const totalMin = duration.data?.totalMinutes ?? 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{courseName}</CardTitle>
          <Button size="sm" variant="outline" onClick={() => exportCsv.mutate({ courseId })} disabled={exportCsv.isPending}><Download className="mr-1 h-4 w-4" /> 受講状況CSV</Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Clock className="h-5 w-5 text-slate-400" />
            <div>
              <div className="text-lg font-bold">{(totalMin / 60).toFixed(1)} 時間 <span className="text-sm font-normal text-slate-400">（{totalMin}分）</span></div>
              <div className="text-xs text-slate-500">合計標準学習時間</div>
            </div>
            <div className="ml-auto">
              {meets
                ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> 10時間以上（助成金要件を満たす）</span>
                : <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300"><XCircle className="h-3.5 w-3.5" /> 10時間未満</span>}
            </div>
          </div>

          {/* 修了条件の設定 */}
          <div className="mt-3 space-y-2 rounded-lg border p-3 dark:border-slate-800">
            <div className="text-xs font-medium text-slate-500">修了条件</div>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>学習レポートの提出を必須にする</span>
              <Switch checked={course.data?.requireReport ?? true} onCheckedChange={v => updateCourse.mutate({ id: courseId, requireReport: v })} disabled={updateCourse.isPending} />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>実務課題（実技テスト）の提出を必須にする</span>
              <Switch checked={course.data?.requirePracticalTest ?? false} onCheckedChange={v => updateCourse.mutate({ id: courseId, requirePracticalTest: v })} disabled={updateCourse.isPending} />
            </label>
            <p className="text-[11px] text-slate-400">※ 有効にすると、受講者は該当項目を提出しないと修了になりません。</p>
          </div>
        </CardContent>
      </Card>

      {/* レッスン */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Video className="h-4 w-4" /> 動画レッスン（{lessons.data?.length ?? 0}）</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_120px_120px_auto]">
            <Input placeholder="レッスン名 *" value={nl.title} onChange={e => setNl({ ...nl, title: e.target.value })} />
            <Input placeholder="章" value={nl.chapter} onChange={e => setNl({ ...nl, chapter: e.target.value })} />
            <Input type="number" placeholder="分" value={nl.durationMinutes} onChange={e => setNl({ ...nl, durationMinutes: Number(e.target.value) })} />
            <Button onClick={() => createLesson.mutate({ courseId, title: nl.title, chapter: nl.chapter || undefined, videoUrl: nl.videoUrl || undefined, durationMinutes: nl.durationMinutes, sortOrder: (lessons.data?.length ?? 0) + 1 })} disabled={!nl.title || createLesson.isPending}><Plus className="h-4 w-4" /></Button>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>章</TableHead><TableHead>レッスン名</TableHead><TableHead>時間</TableHead><TableHead>必須</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {lessons.data?.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-slate-400">レッスンがありません</TableCell></TableRow>}
              {lessons.data?.map((l, i) => (
                <TableRow key={l.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="text-sm text-slate-500">{l.chapter}</TableCell>
                  <TableCell className="font-medium">{l.title}</TableCell>
                  <TableCell>{l.durationMinutes}分</TableCell>
                  <TableCell>{l.isRequired ? <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">必須</span> : <span className="text-xs text-slate-400">任意</span>}</TableCell>
                  <TableCell><Button size="sm" variant="ghost" onClick={() => deleteLesson.mutate({ id: l.id })}>削除</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* テスト */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base"><FileQuestion className="h-4 w-4" /> 確認テスト（{quizzes.data?.length ?? 0}）</CardTitle>
          <Button size="sm" variant="outline" onClick={() => createQuiz.mutate({ courseId, title: "確認テスト", passingScore: 80 })} disabled={createQuiz.isPending}><Plus className="mr-1 h-4 w-4" /> テスト作成</Button>
        </CardHeader>
        <CardContent>
          {quizzes.data?.length === 0 && <p className="text-sm text-slate-400">テストがありません。「テスト作成」から合格点80%のテストを作成できます。</p>}
          {quizzes.data?.map(q => <QuizEditor key={q.id} quizId={q.id} title={q.title} passingScore={q.passingScore} />)}
        </CardContent>
      </Card>
    </div>
  );
}

function QuizEditor({ quizId, title, passingScore }: { quizId: number; title: string; passingScore: number }) {
  const utils = trpc.useUtils();
  const quiz = trpc.lms.quizzes.getWithQuestions.useQuery({ quizId });
  const [q, setQ] = useState({ questionText: "", options: "選択肢A\n選択肢B\n選択肢C", correctIndex: 0 });
  const addQuestion = trpc.lms.quizzes.addQuestion.useMutation({
    onSuccess: () => { toast.success("設問を追加しました"); utils.lms.quizzes.getWithQuestions.invalidate({ quizId }); setQ({ questionText: "", options: "選択肢A\n選択肢B\n選択肢C", correctIndex: 0 }); },
    onError: e => toast.error(e.message),
  });

  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="font-medium">{title}</span>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">合格 {passingScore}%</span>
        <span className="text-xs text-slate-400">設問 {quiz.data?.questions.length ?? 0}</span>
      </div>
      <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
        {quiz.data?.questions.map(qq => <li key={qq.id}>{qq.questionText} <span className="text-xs text-slate-400">（{qq.questionType === "single" ? "単一選択" : qq.questionType === "multiple" ? "複数選択" : "記述"} / {qq.points}点）</span></li>)}
      </ol>
      <div className="grid gap-2 rounded-md bg-slate-50 p-2 dark:bg-slate-900 md:grid-cols-[1fr_160px_auto]">
        <Input placeholder="設問文" value={q.questionText} onChange={e => setQ({ ...q, questionText: e.target.value })} />
        <Input placeholder="正解の行番号(1〜)" type="number" value={q.correctIndex + 1} onChange={e => setQ({ ...q, correctIndex: Math.max(0, Number(e.target.value) - 1) })} />
        <Button size="sm" onClick={() => {
          const options = q.options.split("\n").map(s => s.trim()).filter(Boolean);
          if (!q.questionText || options.length < 2) return toast.error("設問文と2つ以上の選択肢が必要です");
          addQuestion.mutate({ quizId, questionText: q.questionText, questionType: "single", options, correctAnswers: [q.correctIndex], points: 1 });
        }} disabled={addQuestion.isPending}>設問追加</Button>
        <Textarea className="md:col-span-3 text-xs" rows={3} placeholder="選択肢（1行に1つ）" value={q.options} onChange={e => setQ({ ...q, options: e.target.value })} />
      </div>
    </div>
  );
}
