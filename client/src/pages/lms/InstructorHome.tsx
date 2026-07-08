import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Clock, CheckCircle2, XCircle, Plus } from "lucide-react";

export default function LmsInstructorHome() {
  const summary = trpc.lms.instructorHome.useQuery();
  const rows = summary.data ?? [];
  const meets = rows.filter(r => r.meetsSubsidy).length;

  return (
    <LmsLayout title="担当コース" description="コース・教材・確認テストの整備状況と受講状況（講師・研修担当）。">
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4"><BookOpen className="h-5 w-5 text-emerald-600" /><div className="mt-2 text-2xl font-bold">{rows.length}</div><div className="text-xs text-slate-500">コース数</div></CardContent></Card>
        <Card><CardContent className="p-4"><Clock className="h-5 w-5 text-blue-600" /><div className="mt-2 text-2xl font-bold">{meets}</div><div className="text-xs text-slate-500">10時間以上のコース</div></CardContent></Card>
        <Card><CardContent className="p-4"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><div className="mt-2 text-2xl font-bold">{rows.reduce((s, r) => s + r.completed, 0)}</div><div className="text-xs text-slate-500">修了者合計</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">コース一覧</CardTitle>
          <a href="/lms/courses"><Button size="sm"><Plus className="mr-1 h-4 w-4" /> コース・教材を編集</Button></a>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>コース名</TableHead><TableHead>教材</TableHead><TableHead>学習時間</TableHead><TableHead>助成金要件</TableHead><TableHead>受講/修了</TableHead><TableHead>平均進捗</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-slate-400">コースがありません</TableCell></TableRow>}
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-sm text-slate-500">動画 {r.lessons} ／ テスト {r.quizzes}</TableCell>
                  <TableCell className="tabular-nums">{(r.totalMinutes / 60).toFixed(1)}時間</TableCell>
                  <TableCell>
                    {r.meetsSubsidy
                      ? <Badge className="bg-emerald-600"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />満たす</Badge>
                      : <Badge variant="destructive"><XCircle className="mr-1 h-3.5 w-3.5" />10時間未満</Badge>}
                  </TableCell>
                  <TableCell><span className="text-emerald-700 dark:text-emerald-400">{r.completed}</span> / {r.enrollments}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><Progress value={r.avgProgress} className="h-1.5 w-24" /><span className="text-xs tabular-nums">{r.avgProgress}%</span></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </LmsLayout>
  );
}
