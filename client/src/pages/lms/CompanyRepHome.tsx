import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Users, CheckCircle2, Clock, LogIn, Send, AlertTriangle } from "lucide-react";
import { KpiCard, StatusPill } from "./ui";
import { cn } from "@/lib/utils";

export default function LmsCompanyRepHome({ companyId }: { companyId: number }) {
  const utils = trpc.useUtils();
  const home = trpc.lms.companyHome.useQuery({ companyId });
  const targets = trpc.lms.notifications.reminderTargets.useQuery({ companyId });
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const send = trpc.lms.notifications.send.useMutation({
    onSuccess: r => { toast.success(`送信: 成功 ${r.sent} / キュー ${r.queued} / 失敗 ${r.failed}`); setSelected(new Set()); utils.lms.notifications.reminderTargets.invalidate({ companyId }); },
    onError: e => toast.error(e.message),
  });

  const s = home.data?.stats;
  const courseName = (home.data?.courses ?? {}) as Record<string, string>;
  const toggle = (id: number) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n); };
  const targetList = targets.data ?? [];

  return (
    <LmsLayout
      title={home.data?.company?.name ?? "自社ダッシュボード"}
      description="自社スタッフの受講状況を確認し、未受講者へリマインドを送れます（代表）。"
      actions={
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" disabled={selected.size === 0 || send.isPending} onClick={() => send.mutate({ learnerIds: Array.from(selected), channel: "auto" })}>
          <Send className="mr-1.5 h-4 w-4" /> リマインド送信（{selected.size}）
        </Button>
      }
    >
      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="自社の受講者" value={s?.learners ?? 0} unit="名" icon={Users} tone="blue" />
        <KpiCard label="修了者" value={s?.completed ?? 0} unit="名" icon={CheckCircle2} tone="emerald" />
        <KpiCard label="未修了" value={s?.incomplete ?? 0} unit="名" icon={Clock} tone="amber" />
        <KpiCard label="未ログイン" value={s?.neverLoggedIn ?? 0} unit="名" icon={LogIn} tone="rose" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* 受講者一覧 */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-base">受講者一覧（{home.data?.learners.length ?? 0}）</CardTitle></CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800">
                  <TableHead className="pl-6">氏名</TableHead><TableHead>部署</TableHead><TableHead>状態</TableHead><TableHead className="pr-6">コース進捗</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {home.data?.learners.length === 0 && <TableRow><TableCell colSpan={4} className="py-10 text-center text-slate-400">受講者がいません</TableCell></TableRow>}
                {home.data?.learners.map(l => (
                  <TableRow key={l.id} className="border-slate-100 dark:border-slate-800">
                    <TableCell className="pl-6 font-medium">{l.name}</TableCell>
                    <TableCell className="text-sm text-slate-500">{l.department}</TableCell>
                    <TableCell><StatusPill status={l.status} /></TableCell>
                    <TableCell className="pr-6">
                      {l.enrollments.length === 0 ? <span className="text-xs text-slate-400">未割当</span> : (
                        <div className="space-y-1">
                          {l.enrollments.map(e => (
                            <div key={e.enrollmentId} className="flex items-center gap-2">
                              <span className="w-36 truncate text-xs text-slate-500">{courseName[String(e.courseId)] ?? `コース#${e.courseId}`}</span>
                              <Progress value={e.progressRate} className="h-1.5 w-20" />
                              <span className="text-xs tabular-nums text-slate-500">{e.progressRate}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* リマインド対象 */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4 text-amber-500" /> リマインド対象（{targetList.length}）</CardTitle></CardHeader>
          <CardContent className="px-0">
            {targetList.length === 0 ? <p className="px-6 pb-4 text-sm text-slate-400">リマインド対象はいません。</p> : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 dark:border-slate-800">
                    <TableHead className="w-10 pl-6"></TableHead><TableHead>受講者</TableHead><TableHead className="pr-6">理由</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targetList.map(t => (
                    <TableRow key={`${t.enrollmentId}-${t.reason}`} className="border-slate-100 dark:border-slate-800">
                      <TableCell className="pl-6"><Checkbox checked={selected.has(t.learnerId)} onCheckedChange={() => toggle(t.learnerId)} /></TableCell>
                      <TableCell className="font-medium">{t.learnerName}</TableCell>
                      <TableCell className="pr-6">
                        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", t.reason === "expired" ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300")}>{t.reasonLabel}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </LmsLayout>
  );
}
