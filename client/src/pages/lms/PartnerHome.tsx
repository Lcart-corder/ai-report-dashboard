import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, TrendingUp, Receipt, GraduationCap } from "lucide-react";
import { KpiCard } from "./ui";
import { cn } from "@/lib/utils";

const yen = (n: number) => `¥${n.toLocaleString()}`;

export default function LmsPartnerHome({ partnerId }: { partnerId: number }) {
  const home = trpc.lms.partnerHome.useQuery({ partnerId });
  const d = home.data;

  const totalLearners = (d?.companies ?? []).reduce((s, c) => s + c.learners, 0);
  const totalCompleted = (d?.companies ?? []).reduce((s, c) => s + c.completed, 0);

  return (
    <LmsLayout title={d?.partner?.name ?? "協業先ダッシュボード"} description="担当企業の受講状況と、自社の研修売上・成果報酬（研修売上×報酬率／助成金受給額には非連動）を確認できます。">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="担当企業" value={d?.companies.length ?? 0} unit="社" icon={Building2} tone="blue" />
        <KpiCard label="受講者合計" value={totalLearners} unit="名" icon={TrendingUp} tone="teal" />
        <KpiCard label="修了者合計" value={totalCompleted} unit="名" icon={GraduationCap} tone="emerald" />
        <KpiCard label={`請求予定額 合計（${d?.feeRate ?? 20}%）`} value={yen(d?.forecastTotal ?? 0)} icon={Receipt} tone="amber" />
      </div>

      <Card className="mb-6 mt-5">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Building2 className="h-4 w-4" /> 担当企業の受講状況</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>企業名</TableHead><TableHead>受講者</TableHead><TableHead>修了</TableHead><TableHead>平均進捗</TableHead></TableRow></TableHeader>
            <TableBody>
              {(d?.companies.length ?? 0) === 0 && <TableRow><TableCell colSpan={4} className="text-center text-slate-400">担当企業がありません</TableCell></TableRow>}
              {d?.companies.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.learners}</TableCell>
                  <TableCell><span className="text-emerald-700 dark:text-emerald-400">{c.completed}</span> / {c.enrollments}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><Progress value={c.avgProgress} className="h-1.5 w-28" /><span className="text-xs tabular-nums">{c.avgProgress}%</span></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base"><Receipt className="h-4 w-4" /> 月次レポート・成果報酬</CardTitle>
          <div className="text-right"><div className="text-xs text-slate-500">請求予定額 合計</div><div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{yen(d?.forecastTotal ?? 0)}</div></div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>対象月</TableHead><TableHead>研修売上</TableHead><TableHead>報酬率</TableHead><TableHead>請求予定額</TableHead><TableHead>状態</TableHead></TableRow></TableHeader>
            <TableBody>
              {(d?.monthly.length ?? 0) === 0 && <TableRow><TableCell colSpan={5} className="text-center text-slate-400">データがありません</TableCell></TableRow>}
              {d?.monthly.map(m => (
                <TableRow key={m.yearMonth}>
                  <TableCell className="font-medium">{m.yearMonth}</TableCell>
                  <TableCell>{yen(m.trainingSales)}</TableCell>
                  <TableCell>{m.feeRate}%</TableCell>
                  <TableCell className="font-bold text-emerald-700 dark:text-emerald-400">{yen(m.feeAmount)}</TableCell>
                  <TableCell><span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", m.status === "入金済" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")}>{m.status}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-2 text-xs text-slate-400">※ 請求予定額は「研修売上 × 報酬率」。助成金受給額には連動しません。売上の登録・報酬確定は運営側で行います。</p>
        </CardContent>
      </Card>
    </LmsLayout>
  );
}
