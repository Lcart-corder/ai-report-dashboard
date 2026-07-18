import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Download, FileText, Award, Printer, Receipt, ClipboardList, FileSpreadsheet, ScrollText } from "lucide-react";

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// CSV文字列を印刷用HTMLテーブルに変換し、ブラウザの「PDFに保存」で証跡PDFを生成(日本語安全)
function printCsvAsPdf(title: string, csv: string) {
  const rows = csv.trim().split(/\r?\n/).map(line => {
    const cells: string[] = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQ) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') inQ = false;
        else cur += ch;
      } else if (ch === '"') inQ = true;
      else if (ch === ",") { cells.push(cur); cur = ""; }
      else cur += ch;
    }
    cells.push(cur);
    return cells;
  });
  if (rows.length === 0) { toast.error("出力対象がありません"); return; }
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const head = rows[0].map(c => `<th>${esc(c)}</th>`).join("");
  const body = rows.slice(1).map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("");
  const today = new Date().toLocaleDateString("ja-JP");
  const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  body{font-family:"Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",sans-serif;color:#0f172a;margin:32px;}
  h1{font-size:18px;margin:0 0 4px;} .meta{font-size:12px;color:#64748b;margin-bottom:16px;}
  table{border-collapse:collapse;width:100%;font-size:11px;}
  th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:left;}
  th{background:#0f2547;color:#fff;font-weight:600;}
  tr:nth-child(even) td{background:#f8fafc;}
  @media print{body{margin:12mm;}}
</style></head><body>
  <h1>${esc(title)}</h1><div class="meta">出力日: ${today} ／ 助成金対応リスキリングLMS 証跡</div>
  <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
  <script>window.onload=function(){window.print();}</script>
</body></html>`;
  const w = window.open("", "_blank");
  if (!w) { toast.error("ポップアップがブロックされました"); return; }
  w.document.write(html); w.document.close();
}

const TONE = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
  teal: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
} as const;

export default function LmsExports() {
  const me = trpc.lms.me.useQuery();
  const isOperator = me.data?.role === "operator_admin";
  const courses = trpc.lms.courses.list.useQuery();
  const [courseId, setCourseId] = useState("");
  const selectedCourse = courses.data?.find(c => String(c.id) === courseId);
  const certs = trpc.lms.certificates.byCourse.useQuery({ courseId: Number(courseId) }, { enabled: !!courseId });

  const needCourse = () => { if (!courseId) { toast.error("先にコースを選択してください"); return false; } return true; };

  const courseCsv = trpc.lms.exports.courseProgressCsv.useMutation({
    onSuccess: r => { downloadCsv(`LMS受講状況レポート_${selectedCourse?.name ?? "course"}.csv`, r.csv); toast.success("CSVを出力しました"); },
    onError: e => toast.error(e.message),
  });
  const coursePdf = trpc.lms.exports.courseProgressCsv.useMutation({
    onSuccess: r => printCsvAsPdf(`LMS受講状況レポート（${selectedCourse?.name ?? ""}）`, r.csv),
    onError: e => toast.error(e.message),
  });
  const quizCsv = trpc.lms.exports.quizResultsCsv.useMutation({
    onSuccess: r => { downloadCsv(`テスト結果一覧_${selectedCourse?.name ?? "course"}.csv`, r.csv); toast.success("CSVを出力しました"); },
    onError: e => toast.error(e.message),
  });
  const quizPdf = trpc.lms.exports.quizResultsCsv.useMutation({
    onSuccess: r => printCsvAsPdf(`テスト結果一覧（${selectedCourse?.name ?? ""}）`, r.csv),
    onError: e => toast.error(e.message),
  });
  const tenHourCsv = trpc.lms.exports.tenHourCompletersCsv.useMutation({
    onSuccess: r => { downloadCsv("eラーニング訓練実施結果報告書用データ.csv", r.csv); toast.success("CSVを出力しました"); },
    onError: e => toast.error(e.message),
  });
  const tenHourPdf = trpc.lms.exports.tenHourCompletersCsv.useMutation({
    onSuccess: r => printCsvAsPdf("eラーニング訓練実施結果報告書用データ", r.csv),
    onError: e => toast.error(e.message),
  });
  const priceCsv = trpc.lms.exports.priceJustificationCsv.useMutation({
    onSuccess: r => { downloadCsv("価格疎明データ.csv", r.csv); toast.success("CSVを出力しました"); },
    onError: e => toast.error(e.message),
  });
  const pricePdf = trpc.lms.exports.priceJustificationCsv.useMutation({
    onSuccess: r => printCsvAsPdf("価格疎明データ", r.csv),
    onError: e => toast.error(e.message),
  });

  return (
    <LmsLayout
      title="証跡出力"
      description="助成金申請に必要な証跡を、提出の有無に関わらず整備・保管できる状態で出力します（FR-15）"
      actions={
        <div className="w-64">
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger className="h-9"><SelectValue placeholder="コースを選択（必須の帳票用）" /></SelectTrigger>
            <SelectContent>{courses.data?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      }
    >
      {/* 証跡レポートカード(PDF=赤 / CSV=緑) */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ReportCard
          icon={FileText} tone="blue"
          title="LMS受講状況レポート"
          desc="コース別の進捗率・受講開始/修了日時・受講期限。担当企業分のみ出力されます。"
          badge={courseId ? undefined : "コース選択が必要"}
          onPdf={() => needCourse() && coursePdf.mutate({ courseId: Number(courseId) })}
          onCsv={() => needCourse() && courseCsv.mutate({ courseId: Number(courseId) })}
          loading={coursePdf.isPending || courseCsv.isPending}
        />
        <ReportCard
          icon={ClipboardList} tone="teal"
          title="テスト結果一覧"
          desc="コース内テストの得点・合否・受験回数の一覧。理解度確認の証跡に。"
          badge={courseId ? undefined : "コース選択が必要"}
          onPdf={() => needCourse() && quizPdf.mutate({ courseId: Number(courseId) })}
          onCsv={() => needCourse() && quizCsv.mutate({ courseId: Number(courseId) })}
          loading={quizPdf.isPending || quizCsv.isPending}
        />
        <ReportCard
          icon={FileSpreadsheet} tone="amber"
          title="eラーニング訓練実施結果報告書用データ"
          desc="受講時間10時間以上の修了者一覧。定額制サービス向けの必須書類。"
          onPdf={() => tenHourPdf.mutate({})}
          onCsv={() => tenHourCsv.mutate({})}
          loading={tenHourPdf.isPending || tenHourCsv.isPending}
        />
        {isOperator && (
          <ReportCard
            icon={Receipt} tone="violet"
            title="価格疎明データ"
            desc="研修費・LMS利用料・運用支援費を分離した根拠データ（運営のみ）。"
            onPdf={() => pricePdf.mutate({})}
            onCsv={() => priceCsv.mutate({})}
            loading={pricePdf.isPending || priceCsv.isPending}
          />
        )}
        {isOperator && (
          <a href="/lms/audit" className="group">
            <Card className="h-full border-slate-200 transition-shadow hover:shadow-md dark:border-slate-800">
              <CardContent className="flex h-full flex-col p-4">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", TONE.slate)}><ScrollText className="h-5 w-5" /></div>
                <div className="mt-3 font-semibold text-slate-900 dark:text-slate-100">操作監査ログ</div>
                <div className="mt-1 flex-1 text-xs text-slate-500">誰が・いつ・何をしたかの操作履歴。監査ログ画面で確認・出力できます。</div>
                <div className="mt-3 text-sm font-medium text-blue-600 group-hover:underline">監査ログ画面へ ›</div>
              </CardContent>
            </Card>
          </a>
        )}
      </div>

      {/* 修了証(コース別・個別PDF) */}
      <Card className="mt-6 border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base"><Award className="h-4 w-4 text-slate-400" /> 修了証（コース別）</CardTitle>
          <p className="text-xs text-slate-500">{courseId ? `${selectedCourse?.name ?? ""}の発行済み修了証` : "上部でコースを選択すると、発行済みの修了証を一覧表示します。"}</p>
        </CardHeader>
        <CardContent className="px-0">
          {!courseId ? (
            <p className="px-6 pb-4 text-sm text-slate-400">コース未選択です。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800">
                  <TableHead className="pl-6">証明番号</TableHead><TableHead>受講者</TableHead><TableHead>修了日</TableHead><TableHead>DL回数</TableHead><TableHead className="pr-6">修了証PDF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certs.data?.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center text-slate-400">このコースの修了証はまだありません。</TableCell></TableRow>}
                {certs.data?.map(c => (
                  <TableRow key={c.id} className="border-slate-100 dark:border-slate-800">
                    <TableCell className="pl-6 font-mono text-xs">{c.certificateNumber}</TableCell>
                    <TableCell className="font-medium">{c.learnerName}</TableCell>
                    <TableCell className="text-sm text-slate-500">{c.completionDate}</TableCell>
                    <TableCell className="text-sm text-slate-500">{c.downloadCount}</TableCell>
                    <TableCell className="pr-6">
                      <a className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950" href={`/lms/certificate/${c.enrollmentId}`} target="_blank" rel="noreferrer">
                        <Printer className="h-3.5 w-3.5" /> PDF出力
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </LmsLayout>
  );
}

function ReportCard({ icon: Icon, tone, title, desc, badge, onPdf, onCsv, loading }: {
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof TONE;
  title: string; desc: string; badge?: string;
  onPdf: () => void; onCsv: () => void; loading?: boolean;
}) {
  return (
    <Card className="h-full border-slate-200 dark:border-slate-800">
      <CardContent className="flex h-full flex-col p-4">
        <div className="flex items-start justify-between">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", TONE[tone])}><Icon className="h-5 w-5" /></div>
          {badge && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">{badge}</span>}
        </div>
        <div className="mt-3 font-semibold leading-snug text-slate-900 dark:text-slate-100">{title}</div>
        <div className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">{desc}</div>
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950" onClick={onPdf} disabled={loading}>
            <Printer className="mr-1.5 h-3.5 w-3.5" /> PDF出力
          </Button>
          <Button size="sm" variant="outline" className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950" onClick={onCsv} disabled={loading}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> CSV出力
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
