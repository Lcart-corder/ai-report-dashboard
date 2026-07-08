import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Users, CheckCircle2, Clock, LogIn, Send } from "lucide-react";

const STATUS_LABEL: Record<string, string> = { invited: "招待済", active: "受講中", delayed: "遅延", completed: "修了", expired: "期限切れ", suspended: "停止" };

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

  const cards = [
    { label: "自社の受講者", value: s?.learners ?? 0, icon: Users, color: "text-blue-600" },
    { label: "修了者", value: s?.completed ?? 0, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "未修了", value: s?.incomplete ?? 0, icon: Clock, color: "text-amber-600" },
    { label: "未ログイン", value: s?.neverLoggedIn ?? 0, icon: LogIn, color: "text-rose-600" },
  ];

  return (
    <LmsLayout title={home.data?.company?.name ?? "自社ダッシュボード"} description="自社スタッフの受講状況を確認し、未受講者へリマインドを送れます（代表）。">
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <Card key={c.label}><CardContent className="p-4">
              <Icon className={`h-5 w-5 ${c.color}`} />
              <div className="mt-2 text-2xl font-bold">{c.value}</div>
              <div className="mt-0.5 text-xs text-slate-500">{c.label}</div>
            </CardContent></Card>
          );
        })}
      </div>

      {/* リマインド */}
      <Card className="mb-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">リマインド対象（{targets.data?.length ?? 0}）</CardTitle>
          <Button size="sm" disabled={selected.size === 0 || send.isPending} onClick={() => send.mutate({ learnerIds: Array.from(selected), channel: "auto" })}>
            <Send className="mr-1 h-4 w-4" /> 送信（{selected.size}）
          </Button>
        </CardHeader>
        <CardContent>
          {(targets.data?.length ?? 0) === 0 ? <p className="text-sm text-slate-400">リマインド対象はいません。</p> : (
            <Table>
              <TableHeader><TableRow><TableHead className="w-8"></TableHead><TableHead>受講者</TableHead><TableHead>理由</TableHead><TableHead>期限</TableHead></TableRow></TableHeader>
              <TableBody>
                {targets.data?.map(t => (
                  <TableRow key={`${t.enrollmentId}-${t.reason}`}>
                    <TableCell><Checkbox checked={selected.has(t.learnerId)} onCheckedChange={() => toggle(t.learnerId)} /></TableCell>
                    <TableCell className="font-medium">{t.learnerName}</TableCell>
                    <TableCell><Badge variant={t.reason === "expired" ? "destructive" : "secondary"}>{t.reasonLabel}</Badge></TableCell>
                    <TableCell className="text-sm text-slate-500">{t.dueDate ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 受講者一覧 */}
      <Card>
        <CardHeader><CardTitle className="text-base">受講者一覧（{home.data?.learners.length ?? 0}）</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>氏名</TableHead><TableHead>部署</TableHead><TableHead>状態</TableHead><TableHead>コース進捗</TableHead></TableRow></TableHeader>
            <TableBody>
              {home.data?.learners.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-slate-400">受講者がいません</TableCell></TableRow>}
              {home.data?.learners.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell className="text-sm text-slate-500">{l.department}</TableCell>
                  <TableCell><Badge variant={l.status === "completed" ? "default" : "secondary"} className={l.status === "completed" ? "bg-emerald-600" : ""}>{STATUS_LABEL[l.status] ?? l.status}</Badge></TableCell>
                  <TableCell>
                    {l.enrollments.length === 0 ? <span className="text-xs text-slate-400">未割当</span> : (
                      <div className="space-y-1">
                        {l.enrollments.map(e => (
                          <div key={e.enrollmentId} className="flex items-center gap-2">
                            <span className="w-40 truncate text-xs text-slate-500">{courseName[String(e.courseId)] ?? `コース#${e.courseId}`}</span>
                            <Progress value={e.progressRate} className="h-1.5 w-24" />
                            <span className="text-xs tabular-nums">{e.progressRate}%</span>
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
    </LmsLayout>
  );
}
