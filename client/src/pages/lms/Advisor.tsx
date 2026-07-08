import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ShieldCheck, Building2, CheckCircle2, XCircle, FileText, Printer } from "lucide-react";

export default function LmsAdvisor() {
  const overview = trpc.lms.advisor.companyOverview.useQuery();
  const [companyId, setCompanyId] = useState<number | null>(null);
  const selected = overview.data?.find(c => c.id === companyId) ?? overview.data?.[0] ?? null;

  return (
    <LmsLayout title="社労士・申請確認者" description="企業ごとの受講証跡・修了証・申請準備状況を確認し、差戻しコメントを残せます。">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">確認対象企業（{overview.data?.length ?? 0}）</CardTitle></CardHeader>
          <CardContent className="space-y-1 p-2">
            {overview.data?.length === 0 && <p className="p-3 text-sm text-slate-400">企業がありません。</p>}
            {overview.data?.map(c => (
              <button key={c.id} onClick={() => setCompanyId(c.id)} className={`w-full rounded-md px-3 py-2 text-left text-sm ${selected?.id === c.id ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                <div className="flex items-center gap-2"><Building2 className="h-4 w-4 shrink-0 text-slate-400" /><span className="truncate">{c.name}</span></div>
                <div className="mt-1 flex gap-2 pl-6 text-xs text-slate-500">
                  <span>受講 {c.enrollments}</span><span className="text-emerald-600">修了 {c.completed}</span><span>証 {c.certificates}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {selected ? <AdvisorCompany key={selected.id} companyId={selected.id} companyName={selected.name} /> : <Card><CardContent className="p-12 text-center text-slate-400">企業を選択してください。</CardContent></Card>}
      </div>
    </LmsLayout>
  );
}

function AdvisorCompany({ companyId, companyName }: { companyId: number; companyName: string }) {
  const learners = trpc.lms.learners.listByCompany.useQuery({ companyId });
  const certs = trpc.lms.advisor.certificatesByCompany.useQuery({ companyId });
  const courses = trpc.lms.courses.list.useQuery();
  const [evidenceEnrollment, setEvidenceEnrollment] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4" /> {companyName} — 受講者証跡</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-slate-500">受講者を選ぶとLMS証跡（視聴ログ・チェック・テスト・レポート・修了証）を確認できます。</p>
          <div className="space-y-2">
            {learners.data?.map(l => <LearnerEvidenceRow key={l.id} learnerId={l.id} learnerName={l.name} openEnrollment={evidenceEnrollment} setOpen={setEvidenceEnrollment} />)}
            {learners.data?.length === 0 && <p className="text-sm text-slate-400">受講者がいません。</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">発行済み修了証（{certs.data?.length ?? 0}）</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>証明番号</TableHead><TableHead>受講者</TableHead><TableHead>コース</TableHead><TableHead>修了日</TableHead><TableHead>確認</TableHead></TableRow></TableHeader>
            <TableBody>
              {certs.data?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-slate-400">修了証がありません</TableCell></TableRow>}
              {certs.data?.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.certificateNumber}</TableCell>
                  <TableCell>{c.learnerName}</TableCell>
                  <TableCell className="text-sm">{c.courseName}</TableCell>
                  <TableCell>{c.completionDate}</TableCell>
                  <TableCell><a className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline" href={`/lms/certificate/${c.enrollmentId}`} target="_blank" rel="noreferrer"><Printer className="h-3.5 w-3.5" /> 開く</a></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdvisorChecklist companyId={companyId} courses={courses.data ?? []} />
    </div>
  );
}

function LearnerEvidenceRow({ learnerId, learnerName, openEnrollment, setOpen }: { learnerId: number; learnerName: string; openEnrollment: number | null; setOpen: (id: number | null) => void }) {
  const enrollments = trpc.lms.enrollments.byLearner.useQuery({ learnerId });
  return (
    <div className="rounded-lg border p-3">
      <div className="text-sm font-medium">{learnerName}</div>
      <div className="mt-2 space-y-2">
        {enrollments.data?.map(e => (
          <div key={e.id}>
            <button className="text-sm text-emerald-600 hover:underline" onClick={() => setOpen(openEnrollment === e.id ? null : e.id)}>
              enrollment #{e.id}（進捗 {e.progressRate}% / {e.status}）{openEnrollment === e.id ? " ▲" : " ▼"}
            </button>
            {openEnrollment === e.id && <EvidenceDetail enrollmentId={e.id} />}
          </div>
        ))}
        {enrollments.data?.length === 0 && <div className="text-xs text-slate-400">受講割当なし</div>}
      </div>
    </div>
  );
}

function EvidenceDetail({ enrollmentId }: { enrollmentId: number }) {
  const ev = trpc.lms.advisor.learnerEvidence.useQuery({ enrollmentId });
  if (!ev.data) return <div className="mt-2 text-xs text-slate-400">読込中...</div>;
  const d = ev.data;
  const j = d.judgment?.breakdown;
  const Item = ({ ok, label }: { ok: boolean; label: string }) => (
    <span className={`inline-flex items-center gap-1 text-xs ${ok ? "text-emerald-600" : "text-rose-500"}`}>{ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}{label}</span>
  );
  return (
    <div className="mt-2 rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-900">
      <div className="mb-2 flex flex-wrap gap-3">
        <Item ok={!!j && j.watched === j.requiredLessons && j.requiredLessons > 0} label={`視聴 ${j?.watched ?? 0}/${j?.requiredLessons ?? 0}`} />
        <Item ok={!!j && j.checked === j.requiredLessons && j.requiredLessons > 0} label={`チェック ${j?.checked ?? 0}/${j?.requiredLessons ?? 0}`} />
        <Item ok={!!j?.quizPassed} label="テスト合格" />
        <Item ok={!!j?.reportOk} label="レポート提出" />
        <Item ok={!!j?.withinPeriod} label="期間内" />
        <Item ok={!!d.certificate} label="修了証発行" />
      </div>
      <div className="grid gap-2 text-xs text-slate-600 dark:text-slate-300 md:grid-cols-2">
        <div>視聴ログ: {d.logs.length}件 / 確認チェック: {d.checks.length}件</div>
        <div>テスト結果: {d.quizResults.length}件（最新 {d.quizResults[0]?.score ?? "-"}点）</div>
        {d.report && (
          <div className="md:col-span-2 rounded border bg-white p-2 dark:bg-slate-950">
            <div className="flex items-center gap-1 font-medium"><FileText className="h-3.5 w-3.5" /> 学習レポート（{d.report.status}）</div>
            <div className="mt-1"><span className="text-slate-400">学んだこと:</span> {d.report.whatLearned || "-"}</div>
            <div><span className="text-slate-400">活かし方:</span> {d.report.howToApply || "-"}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdvisorChecklist({ companyId, courses }: { companyId: number; courses: Array<{ id: number; name: string }> }) {
  const [courseId, setCourseId] = useState("");
  const [comment, setComment] = useState("");
  const checklist = trpc.lms.checklist.compute.useQuery({ companyId, courseId: Number(courseId) }, { enabled: !!courseId });
  const setReview = trpc.lms.checklist.setAdvisorReview.useMutation({
    onSuccess: () => { toast.success("社労士確認を更新しました"); checklist.refetch(); },
    onError: e => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">申請準備チェック・差戻しコメント</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger className="w-72"><SelectValue placeholder="コースを選択" /></SelectTrigger>
          <SelectContent>{courses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
        {courseId && checklist.data && (
          <>
            <div className="text-sm">申請準備率: <strong>{checklist.data.readyRate}%</strong>（{checklist.data.passed}/{checklist.data.totalItems}）</div>
            <Textarea placeholder="差戻し・確認コメント（例: レポートの記載が不十分な受講者がいます）" value={comment} onChange={e => setComment(e.target.value)} rows={3} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setReview.mutate({ companyId, courseId: Number(courseId), reviewed: true, comment: comment || undefined })} disabled={setReview.isPending}>
                <ShieldCheck className="mr-1.5 h-4 w-4" /> 社労士確認済みにする
              </Button>
              <Button variant="ghost" onClick={() => setReview.mutate({ companyId, courseId: Number(courseId), reviewed: false, comment: comment || undefined })} disabled={setReview.isPending}>差戻し（未確認）</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
