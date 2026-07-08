import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Bell, Plus, Send, AlertTriangle } from "lucide-react";

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

export default function LmsNotifications() {
  const utils = trpc.useUtils();
  const rules = trpc.lms.notifications.list.useQuery();
  const companies = trpc.lms.companies.list.useQuery();
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const targets = trpc.lms.notifications.reminderTargets.useQuery(
    companyFilter === "all" ? {} : { companyId: Number(companyFilter) },
  );
  const logs = trpc.lms.notifications.logs.useQuery({ limit: 100 });

  const [nr, setNr] = useState({ name: "", trigger: "due_7d", channel: "email", template: "" });
  const createRule = trpc.lms.notifications.create.useMutation({
    onSuccess: () => { toast.success("通知ルールを作成しました"); utils.lms.notifications.list.invalidate(); setNr({ name: "", trigger: "due_7d", channel: "email", template: "" }); },
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

  return (
    <LmsLayout title="通知・リマインド" description="リマインドルール管理と未受講者への自動リマインド（FR-14）">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* リマインド対象（会社別セグメント配信） */}
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4 text-amber-500" /> リマインド対象（{targetList.length}）</CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={companyFilter} onValueChange={v => { setCompanyFilter(v); setSelected(new Set()); }}>
                <SelectTrigger className="h-8 w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全企業</SelectItem>
                  {companies.data?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="ml-auto flex items-center gap-2">
                <Select value={sendChannel} onValueChange={setSendChannel}>
                  <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>{SEND_CHANNELS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
                <Button size="sm" disabled={selected.size === 0 || send.isPending} onClick={() => send.mutate({ learnerIds: Array.from(selected), channel: sendChannel })}>
                  <Send className="mr-1 h-4 w-4" /> 送信（{selected.size}）
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-500">企業で絞り込み → 対象を選択 → チャネルを選んで配信。メール主軸で会社/個人単位に送れます（多社セグメント配信）。</p>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
              <button className="underline" onClick={() => setSelected(new Set(selectableLearnerIds))}>全選択</button>
              <button className="underline" onClick={() => setSelected(new Set())}>解除</button>
            </div>
            <Table>
              <TableHeader><TableRow><TableHead className="w-8"></TableHead><TableHead>受講者</TableHead><TableHead>理由</TableHead><TableHead>期限</TableHead></TableRow></TableHeader>
              <TableBody>
                {targetList.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-slate-400">対象者はいません（DB接続時に自動抽出）</TableCell></TableRow>}
                {targetList.map(t => (
                  <TableRow key={`${t.enrollmentId}-${t.reason}`}>
                    <TableCell><Checkbox checked={selected.has(t.learnerId)} onCheckedChange={() => toggle(t.learnerId)} /></TableCell>
                    <TableCell className="font-medium">{t.learnerName}</TableCell>
                    <TableCell><Badge variant={t.reason === "expired" ? "destructive" : "secondary"}>{t.reasonLabel}</Badge></TableCell>
                    <TableCell className="text-sm text-slate-500">{t.dueDate ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 通知ルール */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4" /> 通知ルール（{rules.data?.length ?? 0}）</CardTitle>
            <Dialog>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> ルール追加</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>通知ルールの作成</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>ルール名 *</Label><Input value={nr.name} onChange={e => setNr({ ...nr, name: e.target.value })} /></div>
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
                <DialogFooter><Button onClick={() => createRule.mutate({ name: nr.name, trigger: nr.trigger, channel: nr.channel, template: nr.template || undefined })} disabled={!nr.name || createRule.isPending}>作成</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>ルール名</TableHead><TableHead>トリガー</TableHead><TableHead>チャネル</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {rules.data?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-slate-400">ルールがありません</TableCell></TableRow>}
                {rules.data?.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-sm text-slate-500">{TRIGGER_OPTIONS.find(t => t.value === r.trigger)?.label ?? r.trigger}</TableCell>
                    <TableCell><Badge variant="secondary">{channelLabel(r.channel)}</Badge></TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => deleteRule.mutate({ id: r.id })}>削除</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* 通知履歴 */}
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">通知履歴</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>日時</TableHead><TableHead>受講者ID</TableHead><TableHead>チャネル</TableHead><TableHead>状態</TableHead></TableRow></TableHeader>
            <TableBody>
              {logs.data?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-slate-400">履歴がありません</TableCell></TableRow>}
              {logs.data?.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs text-slate-500">{new Date(l.createdAt).toLocaleString("ja-JP")}</TableCell>
                  <TableCell className="text-sm">#{l.learnerId}</TableCell>
                  <TableCell><Badge variant="secondary">{channelLabel(l.channel)}</Badge></TableCell>
                  <TableCell><Badge className={l.status === "sent" ? "bg-emerald-600" : ""} variant={l.status === "sent" ? "default" : "secondary"}>{l.status === "sent" ? "送信済" : l.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </LmsLayout>
  );
}
