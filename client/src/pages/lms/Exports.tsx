import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, FileText, Award, Printer, Receipt } from "lucide-react";

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function LmsExports() {
  const me = trpc.lms.me.useQuery();
  const isOperator = me.data?.role === "operator_admin";
  const courses = trpc.lms.courses.list.useQuery();
  const [courseId, setCourseId] = useState("");
  const selectedCourse = courses.data?.find(c => String(c.id) === courseId);
  const certs = trpc.lms.certificates.byCourse.useQuery({ courseId: Number(courseId) }, { enabled: !!courseId });

  const tenHour = trpc.lms.exports.tenHourCompletersCsv.useMutation({ onSuccess: r => { downloadCsv("受講10時間以上修了者一覧.csv", r.csv); toast.success("出力しました"); }, onError: e => toast.error(e.message) });
  const price = trpc.lms.exports.priceJustificationCsv.useMutation({ onSuccess: r => { downloadCsv("価格疎明データ.csv", r.csv); toast.success("出力しました"); }, onError: e => toast.error(e.message) });
  const courseCsv = trpc.lms.exports.courseProgressCsv.useMutation({ onSuccess: r => { downloadCsv(`受講状況_${selectedCourse?.name ?? "course"}.csv`, r.csv); toast.success("出力しました"); }, onError: e => toast.error(e.message) });

  return (
    <LmsLayout title="証跡出力センター" description="LMS証跡・修了証・価格疎明データを一括出力（FR-15）。提出の有無に関わらず整備・保管できる状態にします。">
      <div className="grid gap-4 md:grid-cols-3">
        <ExportCard icon={FileText} title="受講時間10時間以上 修了者一覧" desc="定額制サービス向けの必須書類（CSV）。担当企業分のみ出力されます。" onClick={() => tenHour.mutate({})} loading={tenHour.isPending} />
        {isOperator && <ExportCard icon={Receipt} title="価格疎明データ" desc="研修費・LMS利用料・運用支援費を分離（CSV／運営のみ）" onClick={() => price.mutate({})} loading={price.isPending} />}
        {isOperator && <ExportCard icon={Download} title="操作監査ログ" desc="監査ログ画面から確認・出力できます" href="/lms/audit" />}
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">コース別 証跡出力</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="w-72">
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger><SelectValue placeholder="コースを選択" /></SelectTrigger>
                <SelectContent>{courses.data?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button variant="outline" disabled={!courseId || courseCsv.isPending} onClick={() => courseCsv.mutate({ courseId: Number(courseId) })}>
              <Download className="mr-1.5 h-4 w-4" /> 受講状況レポートCSV
            </Button>
          </div>

          {courseId && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium"><Award className="h-4 w-4" /> 発行済み修了証（{certs.data?.length ?? 0}）</div>
              <Table>
                <TableHeader><TableRow><TableHead>証明番号</TableHead><TableHead>受講者</TableHead><TableHead>修了日</TableHead><TableHead>DL回数</TableHead><TableHead>修了証PDF</TableHead></TableRow></TableHeader>
                <TableBody>
                  {certs.data?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-slate-400">修了証がありません</TableCell></TableRow>}
                  {certs.data?.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">{c.certificateNumber}</TableCell>
                      <TableCell>{c.learnerName}</TableCell>
                      <TableCell>{c.completionDate}</TableCell>
                      <TableCell>{c.downloadCount}</TableCell>
                      <TableCell><a className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline" href={`/lms/certificate/${c.enrollmentId}`} target="_blank" rel="noreferrer"><Printer className="h-3.5 w-3.5" /> 開く</a></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </LmsLayout>
  );
}

function ExportCard({ icon: Icon, title, desc, onClick, href, loading }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string; onClick?: () => void; href?: string; loading?: boolean }) {
  const inner = (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col p-4">
        <Icon className="h-6 w-6 text-emerald-600" />
        <div className="mt-2 font-medium">{title}</div>
        <div className="mt-1 flex-1 text-xs text-slate-500">{desc}</div>
        {onClick && <Button className="mt-3" size="sm" variant="outline" onClick={onClick} disabled={loading}><Download className="mr-1.5 h-4 w-4" /> CSV出力</Button>}
        {href && <Badge variant="secondary" className="mt-3 w-fit">画面へ →</Badge>}
      </CardContent>
    </Card>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}
