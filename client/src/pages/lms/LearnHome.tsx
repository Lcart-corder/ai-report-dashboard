import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, BookOpen, TrendingUp, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";
import { KpiCard, StatusPill, Donut } from "./ui";
import { RoleSwitcher } from "./RoleSwitcher";
import { cn } from "@/lib/utils";

// 受講期限までの残り日数ラベル(緊急度つき)。
function dueInfo(due: string | null | undefined): { label: string; tone: "normal" | "warn" | "danger" } | null {
  if (!due) return null;
  const d = Math.ceil((new Date(`${due}T00:00:00`).getTime() - Date.now()) / 86400000);
  if (d < 0) return { label: "期限切れ", tone: "danger" };
  if (d === 0) return { label: "本日まで", tone: "danger" };
  if (d <= 7) return { label: `残り${d}日`, tone: "warn" };
  return { label: `残り${d}日`, tone: "normal" };
}

export default function LmsLearnHome() {
  const params = useParams();
  const learnerId = Number(params.learnerId);
  const learner = trpc.lms.learners.getById.useQuery({ id: learnerId }, { enabled: !!learnerId });
  const enrollments = trpc.lms.enrollments.byLearner.useQuery({ learnerId }, { enabled: !!learnerId });
  const courses = trpc.lms.courses.list.useQuery();

  const courseName = (id: number) => courses.data?.find(c => c.id === id)?.name ?? `コース#${id}`;

  const list = enrollments.data ?? [];
  const completed = list.filter(e => e.status === "completed").length;
  const inProgress = list.filter(e => e.status !== "completed").length;
  const avgProgress = list.length ? Math.round(list.reduce((s, e) => s + e.progressRate, 0) / list.length) : 0;
  const dueSoon = list.filter(e => e.status !== "completed" && (dueInfo(e.dueDate)?.tone === "warn" || dueInfo(e.dueDate)?.tone === "danger")).length;

  return (
    <div className="min-h-screen bg-[#f4f6fa] dark:bg-slate-950">
      <header className="border-b bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white"><GraduationCap className="h-5 w-5" /></div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">L cart 学習ポータル</div>
            <div className="text-xs text-slate-500">{learner.data?.name ?? ""} さん</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {dueSoon > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" /> 期限が近いコースが{dueSoon}件
              </span>
            )}
            <RoleSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* 進捗サマリー */}
        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="受講中のコース" value={inProgress} unit="件" icon={BookOpen} tone="blue" />
          <KpiCard label="修了" value={completed} unit="件" icon={CheckCircle2} tone="emerald" />
          <KpiCard label="平均進捗率" value={avgProgress} unit="%" icon={TrendingUp} tone="teal" />
          <KpiCard label="期限が近い" value={dueSoon} unit="件" icon={AlertTriangle} tone="amber" />
        </div>

        <h1 className="mb-3 text-lg font-bold text-slate-900 dark:text-slate-100">受講中のコース</h1>
        <div className="space-y-3">
          {list.length === 0 && <Card className="border-slate-200 dark:border-slate-800"><CardContent className="p-10 text-center text-slate-400">割り当てられたコースがありません。会社の担当者にご確認ください。</CardContent></Card>}
          {list.map(e => {
            const di = dueInfo(e.dueDate);
            return (
              <a key={e.id} href={`/lms/learn/enrollment/${e.id}`} className="block">
                <Card className="border-slate-200 transition-shadow hover:shadow-md dark:border-slate-800">
                  <CardContent className="flex items-center gap-4 p-4">
                    <Donut value={e.progressRate} size={64} color={e.status === "completed" ? "#059669" : "#2563eb"} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="truncate font-semibold text-slate-900 dark:text-slate-100">{courseName(e.courseId)}</span>
                        <StatusPill status={e.status} />
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <Progress value={e.progressRate} className="h-1.5 w-40" />
                        <span className="text-xs tabular-nums text-slate-500">{e.progressRate}%</span>
                        {e.dueDate && (
                          <span className={cn("text-xs", di?.tone === "danger" ? "font-semibold text-rose-600" : di?.tone === "warn" ? "font-semibold text-amber-600" : "text-slate-400")}>
                            受講期限 {e.dueDate}{di ? `（${di.label}）` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
                      {e.status === "completed" ? "確認する" : e.progressRate > 0 ? "続きから" : "受講開始"}<ChevronRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>
      </main>
    </div>
  );
}
