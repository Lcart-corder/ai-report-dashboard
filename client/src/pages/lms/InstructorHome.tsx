import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Clock, CheckCircle2, XCircle, Plus, GraduationCap } from "lucide-react";
import { KpiCard } from "./ui";

export default function LmsInstructorHome() {
  const summary = trpc.lms.instructorHome.useQuery();
  const rows = summary.data ?? [];
  const meets = rows.filter(r => r.meetsSubsidy).length;

  return (
    <LmsLayout
      title="担当コース"
      description="コース・教材・確認テストの整備状況と受講状況（講師・研修担当）。"
      actions={<a href="/lms/courses"><Button size="sm" className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-1.5 h-4 w-4" /> コース・教材を編集</Button></a>}
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <KpiCard label="コース数" value={rows.length} unit="件" icon={BookOpen} tone="blue" />
        <KpiCard label="10時間以上のコース" value={meets} unit="件" icon={Clock} tone="teal" />
        <KpiCard label="修了者合計" value={rows.reduce((s, r) => s + r.completed, 0)} unit="名" icon={GraduationCap} tone="emerald" />
      </div>

      <Card className="mt-5 border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-2"><CardTitle className="text-base">コース一覧</CardTitle></CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 dark:border-slate-800">
                <TableHead className="pl-6">コース名</TableHead><TableHead>教材</TableHead><TableHead>学習時間</TableHead><TableHead>助成金要件</TableHead><TableHead>受講/修了</TableHead><TableHead className="pr-6">平均進捗</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-slate-400">コースがありません</TableCell></TableRow>}
              {rows.map(r => (
                <TableRow key={r.id} className="border-slate-100 dark:border-slate-800">
                  <TableCell className="pl-6 font-medium">{r.name}</TableCell>
                  <TableCell className="text-sm text-slate-500">動画 {r.lessons} ／ テスト {r.quizzes}</TableCell>
                  <TableCell className="tabular-nums">{(r.totalMinutes / 60).toFixed(1)}時間</TableCell>
                  <TableCell>
                    {r.meetsSubsidy
                      ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" />満たす</span>
                      : <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300"><XCircle className="h-3.5 w-3.5" />10時間未満</span>}
                  </TableCell>
                  <TableCell className="text-sm"><span className="font-medium text-emerald-700 dark:text-emerald-400">{r.completed}</span> <span className="text-slate-400">/ {r.enrollments}</span></TableCell>
                  <TableCell className="pr-6"><div className="flex items-center gap-2"><Progress value={r.avgProgress} className="h-1.5 w-24" /><span className="text-xs tabular-nums text-slate-500">{r.avgProgress}%</span></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </LmsLayout>
  );
}
