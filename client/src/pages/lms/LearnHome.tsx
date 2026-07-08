import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen } from "lucide-react";

const STATUS_LABEL: Record<string, string> = { not_started: "未着手", in_progress: "受講中", completed: "修了", expired: "期限切れ" };

export default function LmsLearnHome() {
  const params = useParams();
  const learnerId = Number(params.learnerId);
  const learner = trpc.lms.learners.getById.useQuery({ id: learnerId }, { enabled: !!learnerId });
  const enrollments = trpc.lms.enrollments.byLearner.useQuery({ learnerId }, { enabled: !!learnerId });
  const courses = trpc.lms.courses.list.useQuery();

  const courseName = (id: number) => courses.data?.find(c => c.id === id)?.name ?? `コース#${id}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white"><GraduationCap className="h-5 w-5" /></div>
            <div>
              <div className="text-sm font-semibold">リスキリング学習ポータル</div>
              <div className="text-xs text-slate-500">{learner.data?.name ?? ""} さん</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="mb-4 text-xl font-bold">受講中のコース</h1>
        <div className="space-y-3">
          {enrollments.data?.length === 0 && <Card><CardContent className="p-8 text-center text-slate-400">割り当てられたコースがありません。</CardContent></Card>}
          {enrollments.data?.map(e => (
            <a key={e.id} href={`/lms/learn/enrollment/${e.id}`} className="block">
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4 text-emerald-600" /> {courseName(e.courseId)}</CardTitle>
                  <Badge className={e.status === "completed" ? "bg-emerald-600" : ""} variant={e.status === "completed" ? "default" : "secondary"}>{STATUS_LABEL[e.status] ?? e.status}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Progress value={e.progressRate} className="h-2" />
                    <span className="text-sm font-medium">{e.progressRate}%</span>
                  </div>
                  {e.dueDate && <p className="mt-2 text-xs text-slate-500">受講期限: {e.dueDate}</p>}
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
