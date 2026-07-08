import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, TrendingUp, Receipt } from "lucide-react";

const yen = (n: number) => `¥${n.toLocaleString()}`;

export default function LmsPartnerHome({ partnerId }: { partnerId: number }) {
  const home = trpc.lms.partnerHome.useQuery({ partnerId });
  const d = home.data;

  const totalLearners = (d?.companies ?? []).reduce((s, c) => s + c.learners, 0);
  const totalCompleted = (d?.companies ?? []).reduce((s, c) => s + c.completed, 0);

  return (
    <LmsLayout title={d?.partner?.name ?? "協業先ダッシュボード"} description="担当企業の受講状況と、自社の研修売上・成果報酬（研修売上×報酬率／助成金受給額には非連動）を確認できます。">
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4"><Building2 className="h-5 w-5 text-blue-600" /><div className="mt-2 text-2xl font-bold">{d?.companies.length ?? 0}</div><div className="text-xs text-slate-500">担当企業</div></CardContent></Card>
        <Card><CardContent className="p-4"><TrendingUp className="h-5 w-5 text-emerald-600" /><div className="mt-2 text-2xl font-bold">{totalLearners}</div><div className="text-xs text-slate-500">受講者合計</div></CardContent></Card>
        <Card><CardContent className="p-4"><TrendingUp className="h-5 w-5 text-emerald-600" /><div className="mt-2 text-2xl font-bold">{totalCompleted}</div><div className="text-xs text-slate-500">修了者合計</div></CardContent></Card>
        <Card><CardContent className="p-4"><Receipt className="h-5 w-5 text-amber-600" /><div className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-400">{yen(d?.forecastTotal ?? 0)}</div><div className="text-xs text-slate-500">請求予定額 合計（{d?.feeRate ?? 20}%）</div></CardContent></Card>
      </div>

      <Card className="mb-6">
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
                  <TableCell><Badge variant={m.status === "入金済" ? "default" : "secondary"} className={m.status === "入金済" ? "bg-emerald-600" : ""}>{m.status}</Badge></TableCell>
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
