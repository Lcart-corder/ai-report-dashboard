import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { KpiCard } from "./ui";
import { cn } from "@/lib/utils";
import {
  Bell, Plus, Send, AlertTriangle, Mail, MessageCircle, Smartphone,
  MessageSquare, Hash, Zap, ListChecks, History,
} from "lucide-react";

const TRIGGER_OPTIONS = [
  { value: "registered", label: "登録直後" },
  { value: "no_login_3d", label: "未ログイン3日" },
  { value: "delayed", label: "進捗遅延" },
  { value: "due_7d", label: "期限7日前" },
  { value: "due_3d", label: "期限3日前" },
  { value: "due_1d", label: "期限前日" },
  { value: "quiz_pending", label: "テスト未受験" },
  { value: "completed", label: "修了後" },
];
const CHANNELS = [
  { value: "email", label: "メール" },
  { value: "line", label: "LINE" },
  { value: "sms", label: "SMS" },
  { value: "app", label: "アプリ内" },
  { value: "chatwork", label: "Chatwork" },
  { value: "slack", label: "Slack" },
  { value: "googlechat", label: "Google Chat" },
];
// 送信チャネル(多社セグメント配信): 既定はメール主軸、autoは受講者の希望チャネル
const SEND_CHANNELS = [
  { value: "email", label: "メール（推奨）" },
  { value: "line", label: "LINE" },
  { value: "app", label: "アプリ内" },
  { value: "auto", label: "受講者の希望チャネル" },
];
const channelLabel = (v: string) => CHANNELS.find(c => c.value === v)?.label ?? (v === "auto" ? "希望チャネル" : v);
const triggerLabel = (v: string) => TRIGGER_OPTIONS.find(t => t.value === v)?.label ?? v;

// チャネルごとのアイコン+配色(モックのチャネルバッジに対応)
const CHANNEL_META: Record<string, { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  email: { icon: Mail, cls: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300" },
  line: { icon: MessageCircle, cls: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300" },
  sms: { icon: Smartphone, cls: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300" },
  app: { icon: Bell, cls: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300" },
  chatwork: { icon: MessageSquare, cls: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300" },
  slack: { icon: Hash, cls: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300" },
  googlechat: { icon: MessageSquare, cls: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300" },
  auto: { icon: Zap, cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
};

function ChannelBadge({ channel }: { channel: string }) {
  const m = CHANNEL_META[channel] ?? CHANNEL_META.auto;
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium", m.cls)}>
      <Icon className="h-3.5 w-3.5" /> {channelLabel(channel)}
    </span>
  );
}

type Panel = "rules" | "targets" | "history";

export default function LmsNotifications() {
  const utils = trpc.useUtils();
  const rules = trpc.lms.notifications.list.useQuery();
  const companies = trpc.lms.companies.list.useQuery();
  const [panel, setPanel] = useState<Panel>("rules");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const targets = trpc.lms.notifications.reminderTargets.useQuery(
    companyFilter === "all" ? {} : { companyId: Number(companyFilter) },
  );
  const logs = trpc.lms.notifications.logs.useQuery({ limit: 100 });

  const [nr, setNr] = useState({ name: "", trigger: "due_7d", channel: "email", template: "" });
  const [dlgOpen, setDlgOpen] = useState(false);
  const createRule = trpc.lms.notifications.create.useMutation({
    onSuccess: () => { toast.success("通知ルールを作成しました"); utils.lms.notifications.list.invalidate(); setNr({ name: "", trigger: "due_7d", channel: "email", template: "" }); setDlgOpen(false); },
    onError: e => toast.error(e.message),
  });
  const updateRule = trpc.lms.notifications.update.useMutation({
    onSuccess: () => utils.lms.notifications.list.invalidate(),
    onError: e => toast.error(e.message),
  });
  const deleteRule = trpc.lms.notifications.delete.useMutation({
    onSuccess: () => { toast.success("削除しました"); utils.lms.notifications.list.invalidate(); },
  });

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sendChannel, setSendChannel] = useState("email");
  const send = trpc.lms.notifications.send.useMutation({
    onSuccess: r => {
      toast.success(`送信: 成功 ${r.sent} / キュー ${r.queued} / 失敗 ${r.failed}`);
      setSelected(new Set());
      utils.lms.notifications.logs.invalidate();
    },
    onError: e => toast.error(e.message),
  });

  const toggle = (id: number) => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };
  const targetList = targets.data ?? [];
  const selectableLearnerIds = Array.from(new Set(targetList.map(t => t.learnerId)));

  const ruleList = rules.data ?? [];
  const activeRules = ruleList.filter(r => r.isActive).length;
  const logList = logs.data ?? [];
  const sentCount = logList.filter(l => l.status === "sent").length;

  const TABS: Array<{ key: Panel; label: string; icon: React.ComponentType<{ className?: string }>; count: number }> = [
    { key: "rules", label: "通知ルール", icon: ListChecks, count: ruleList.length },
    { key: "targets", label: "リマインド配信", icon: Send, count: targetList.length },
    { key: "history", label: "送信履歴", icon: History, count: logList.length },
  ];

  return (
    <LmsLayout
      title="コミュニケーションセンター"
      description="通知ルール・セグメント配信・送信履歴を一元管理（FR-14）"
      actions={
        <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
          <DialogTrigger asChild><Button size="sm" className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-1.5 h-4 w-4" /> 通知ルール追加</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>通知ルールの作成</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>ルール名 *</Label><Input value={nr.name} onChange={e => setNr({ ...nr, name: e.target.value })} placeholder="例: 期限7日前リマインド" /></div>
              <div>
                <Label>トリガー</Label>
                <Select value={nr.trigger} onValueChange={v => setNr({ ...nr, trigger: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TRIGGER_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>チャネル</Label>
                <Select value={nr.channel} onValueChange={v => setNr({ ...nr, channel: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CHANNELS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>本文テンプレート</Label><Input value={nr.template} onChange={e => setNr({ ...nr, template: e.target.value })} placeholder="{name}様 受講期限が近づいています" /></div>
            </div>
            <DialogFooter><Button className="bg-blue-600 hover:bg-blue-700" onClick={() => createRule.mutate({ name: nr.name, trigger: nr.trigger, channel: nr.channel, template: nr.template || undefined })} disabled={!nr.name || createRule.isPending}>作成</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="通知ルール" value={ruleList.length} unit="件" icon={ListChecks} tone="blue" />
        <KpiCard label="有効ルール" value={activeRules} unit="件" icon={Zap} tone="emerald" />
        <KpiCard label="リマインド対象" value={targetList.length} unit="名" icon={AlertTriangle} tone="amber" />
        <KpiCard label="送信済み" value={sentCount} unit="件" icon={Send} tone="teal" />
      </div>

      {/* パネルタブ */}
      <Card className="mt-5 border-slate-200 dark:border-slate-800">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-1 border-b px-4 pt-3 dark:border-slate-800">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setPanel(t.key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-sm font-medium transition-colors",
                    panel === t.key ? "border-b-2 border-blue-600 text-blue-700 dark:text-blue-300" : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  <Icon className="h-4 w-4" /> {t.label}<span className="ml-0.5 text-xs text-slate-400">({t.count})</span>
                </button>
              );
            })}
          </div>

          {/* 通知ルール */}
          {panel === "rules" && (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800">
                  <TableHead className="pl-4">ルール名</TableHead><TableHead>トリガー</TableHead><TableHead>チャネル</TableHead><TableHead>テンプレート</TableHead><TableHead>状態</TableHead><TableHead className="pr-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ruleList.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-slate-400">通知ルールがありません。「通知ルール追加」から作成できます。</TableCell></TableRow>}
                {ruleList.map(r => (
                  <TableRow key={r.id} className="border-slate-100 dark:border-slate-800">
                    <TableCell className="pl-4 font-medium">{r.name}</TableCell>
                    <TableCell><span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{triggerLabel(r.trigger)}</span></TableCell>
                    <TableCell><ChannelBadge channel={r.channel} /></TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm text-slate-500">{r.template || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={r.isActive} onCheckedChange={v => updateRule.mutate({ id: r.id, isActive: v })} />
                        <span className={cn("text-xs font-medium", r.isActive ? "text-emerald-600" : "text-slate-400")}>{r.isActive ? "有効" : "停止中"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-4 text-right"><Button size="sm" variant="ghost" className="text-slate-400 hover:text-rose-600" onClick={() => deleteRule.mutate({ id: r.id })}>削除</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* リマインド配信(会社別セグメント) */}
          {panel === "targets" && (
            <div>
              <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3 dark:border-slate-800">
                <Select value={companyFilter} onValueChange={v => { setCompanyFilter(v); setSelected(new Set()); }}>
                  <SelectTrigger className="h-9 w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全企業</SelectItem>
                    {companies.data?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <button className="text-xs text-slate-500 underline" onClick={() => setSelected(new Set(selectableLearnerIds))}>全選択</button>
                <button className="text-xs text-slate-500 underline" onClick={() => setSelected(new Set())}>解除</button>
                <div className="ml-auto flex items-center gap-2">
                  <Select value={sendChannel} onValueChange={setSendChannel}>
                    <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>{SEND_CHANNELS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700" disabled={selected.size === 0 || send.isPending} onClick={() => send.mutate({ learnerIds: Array.from(selected), channel: sendChannel })}>
                    <Send className="mr-1 h-4 w-4" /> 配信（{selected.size}）
                  </Button>
                </div>
              </div>
              <p className="px-4 pt-3 text-xs text-slate-500">企業で絞り込み → 対象を選択 → チャネルを選んで配信。メール主軸で会社/個人単位に送れます（多社セグメント配信）。</p>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 dark:border-slate-800">
                    <TableHead className="w-10 pl-4"></TableHead><TableHead>受講者</TableHead><TableHead>理由</TableHead><TableHead className="pr-4">期限</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targetList.length === 0 && <TableRow><TableCell colSpan={4} className="py-10 text-center text-slate-400">対象者はいません（DB接続時に自動抽出）</TableCell></TableRow>}
                  {targetList.map(t => (
                    <TableRow key={`${t.enrollmentId}-${t.reason}`} className="border-slate-100 dark:border-slate-800">
                      <TableCell className="pl-4"><Checkbox checked={selected.has(t.learnerId)} onCheckedChange={() => toggle(t.learnerId)} /></TableCell>
                      <TableCell className="font-medium">{t.learnerName}</TableCell>
                      <TableCell>
                        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", t.reason === "expired" ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300")}>{t.reasonLabel}</span>
                      </TableCell>
                      <TableCell className="pr-4 text-sm text-slate-500">{t.dueDate ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* 送信履歴 */}
          {panel === "history" && (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800">
                  <TableHead className="pl-4">日時</TableHead><TableHead>受講者ID</TableHead><TableHead>チャネル</TableHead><TableHead className="pr-4">状態</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logList.length === 0 && <TableRow><TableCell colSpan={4} className="py-10 text-center text-slate-400">送信履歴がありません</TableCell></TableRow>}
                {logList.map(l => (
                  <TableRow key={l.id} className="border-slate-100 dark:border-slate-800">
                    <TableCell className="pl-4 text-xs text-slate-500">{new Date(l.createdAt).toLocaleString("ja-JP")}</TableCell>
                    <TableCell className="text-sm">#{l.learnerId}</TableCell>
                    <TableCell><ChannelBadge channel={l.channel} /></TableCell>
                    <TableCell className="pr-4">
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", l.status === "sent" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : l.status === "failed" ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")}>
                        {l.status === "sent" ? "送信済" : l.status === "queued" ? "キュー" : l.status === "failed" ? "失敗" : l.status}
                      </span>
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
