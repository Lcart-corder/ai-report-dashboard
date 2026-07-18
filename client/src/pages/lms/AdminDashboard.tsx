import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Users, TrendingUp, GraduationCap, AlertTriangle, LogIn, FileQuestion, Sparkles, Download, FileText, BarChart3, Award } from "lucide-react";
import { KpiCard, StatusPill, AlertPill } from "./ui";

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const BAR_COLORS = ["#2563eb", "#0d9488", "#7c3aed", "#d97706", "#0284c7", "#db2777"];

export default function LmsAdminDashboard() {
  const utils = trpc.useUtils();
  const stats = trpc.lms.dashboard.useQuery(undefined);
  const detail = trpc.lms.dashboardDetail.useQuery();

  const seed = trpc.lms.seedDemo.useMutation({
    onSuccess: res => { res.seeded ? toast.success(`デモデータを投入しました（マスターキー: ${res.masterKey}）`) : toast.info("既にデータがあります"); utils.lms.invalidate(); },
    onError: e => toast.error(e.message),
  });
  const exportTenHour = trpc.lms.exports.tenHourCompletersCsv.useMutation({
    onSuccess: r => { downloadCsv("受講10時間以上修了者一覧.csv", r.csv); toast.success("CSVを出力しました"); },
    onError: e => toast.error(e.message),
  });

  const s = stats.data;
  const comparison = detail.data?.companyComparison ?? [];
  const list = detail.data?.learners ?? [];

  return (
    <LmsLayout
      title="ダッシュボード"
      description="誰が危ないか、何が不足しているかをひと目で把握"
      actions={
        <Button variant="outline" size="sm" onClick={() => seed.mutate()} disabled={seed.isPending} className="hidden md:inline-flex">
          <Sparkles className="mr-1.5 h-4 w-4" /> デモデータ投入
        </Button>
      }
    >
      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="受講者数" value={s?.learners ?? 0} unit="名" icon={Users} tone="blue" />
        <KpiCard label="平均進捗率" value={`${s?.avgProgress ?? 0}`} unit="%" icon={TrendingUp} tone="teal" />
        <KpiCard label="修了者数" value={s?.completed ?? 0} unit="名" icon={GraduationCap} tone="emerald" />
        <KpiCard label="未修了者" value={s?.incomplete ?? 0} unit="名" icon={AlertTriangle} tone="amber" />
        <KpiCard label="未ログイン" value={s?.neverLoggedIn ?? 0} unit="名" icon={LogIn} tone="rose" />
        <KpiCard label="期限切れリスク" value={s?.expiringSoon ?? 0} unit="件" icon={FileQuestion} tone="purple" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* 受講者ステータス一覧 */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">受講者ステータス一覧</CardTitle>
            <a href="/lms/companies" className="text-xs font-medium text-blue-600 hover:underline">すべての受講者を表示 ›</a>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800">
                  <TableHead className="pl-6">氏名</TableHead><TableHead>所属</TableHead><TableHead>進捗率</TableHead><TableHead>受講状況</TableHead><TableHead>期限</TableHead><TableHead className="pr-6">アラート</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-slate-400">データがありません。「デモデータ投入」で確認できます。</TableCell></TableRow>}
                {list.map(l => (
                  <TableRow key={l.id} className="border-slate-100 dark:border-slate-800">
                    <TableCell className="pl-6 font-medium">{l.name}</TableCell>
                    <TableCell className="text-sm text-slate-500">{l.company}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2"><Progress value={l.progress} className="h-1.5 w-20" /><span className="text-xs tabular-nums text-slate-500">{l.progress}%</span></div>
                    </TableCell>
                    <TableCell><StatusPill status={l.status} /></TableCell>
                    <TableCell className="text-sm text-slate-500">{l.due ?? "-"}</TableCell>
                    <TableCell className="pr-6">
                      {l.status === "expired" ? <AlertPill tone="danger">期限切れ</AlertPill>
                        : l.status === "not_started" ? <AlertPill tone="danger">未開始</AlertPill>
                        : l.status === "delayed" ? <AlertPill tone="warn">進捗遅延</AlertPill>
                        : <span className="text-xs text-slate-300">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-5">
          {/* 会社別 進捗率比較 */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-4 w-4 text-slate-400" /> 会社別 進捗率比較</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {comparison.length === 0 && <p className="text-sm text-slate-400">データがありません</p>}
              {comparison.slice(0, 6).map((c, i) => (
                <div key={c.id}>
                  <div className="mb-1 flex items-center justify-between text-sm"><span className="truncate text-slate-600 dark:text-slate-300">{c.name}</span><span className="font-semibold tabular-nums" style={{ color: BAR_COLORS[i % BAR_COLORS.length] }}>{c.avgProgress}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full" style={{ width: `${c.avgProgress}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 証跡出力 */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2"><CardTitle className="text-base">証跡出力</CardTitle><p className="text-xs text-slate-500">助成金申請に必要な証跡を出力できます。</p></CardHeader>
            <CardContent className="space-y-2">
              <ExportRow icon={Award} label="受講10時間以上 修了者一覧" onCsv={() => exportTenHour.mutate({})} loading={exportTenHour.isPending} />
              <a href="/lms/exports" className="flex items-center gap-2 rounded-lg border border-dashed p-2.5 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                <FileText className="h-4 w-4 text-slate-400" /> 証跡出力センター（コース別CSV・PDF）<span className="ml-auto text-blue-600">›</span>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </LmsLayout>
  );
}

function ExportRow({ icon: Icon, label, onCsv, loading }: { icon: React.ComponentType<{ className?: string }>; label: string; onCsv: () => void; loading?: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border p-2.5 dark:border-slate-700">
      <Icon className="h-4 w-4 text-slate-400" />
      <span className="flex-1 truncate text-sm">{label}</span>
      <Button size="sm" variant="outline" className="h-7 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300" onClick={onCsv} disabled={loading}>
        <Download className="mr-1 h-3.5 w-3.5" /> CSV
      </Button>
    </div>
  );
}
