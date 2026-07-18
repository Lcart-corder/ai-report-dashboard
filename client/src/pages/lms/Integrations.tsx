import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Webhook, Plus, Send, Info, Trash2 } from "lucide-react";

const CHANNEL_LABEL: Record<string, string> = { slack: "Slack", googlechat: "Google Chat", chatwork: "Chatwork" };
const TARGET_LABEL: Record<string, string> = { operator: "運営全体", partner: "協業先", company: "導入企業" };

export default function LmsIntegrations() {
  const utils = trpc.useUtils();
  const hooks = trpc.lms.webhooks.list.useQuery();
  const partners = trpc.lms.partners.list.useQuery();
  const companies = trpc.lms.companies.list.useQuery();

  const [f, setF] = useState({ targetType: "operator" as "operator" | "partner" | "company", targetId: "", channel: "slack" as "slack" | "googlechat" | "chatwork", label: "", webhookUrl: "", apiToken: "", roomId: "" });
  const create = trpc.lms.webhooks.create.useMutation({
    onSuccess: () => { toast.success("Webhookを登録しました"); utils.lms.webhooks.list.invalidate(); setF({ ...f, label: "", webhookUrl: "", apiToken: "", roomId: "" }); },
    onError: e => toast.error(e.message),
  });
  const del = trpc.lms.webhooks.delete.useMutation({ onSuccess: () => { toast.success("削除しました"); utils.lms.webhooks.list.invalidate(); } });
  const test = trpc.lms.webhooks.test.useMutation({
    onSuccess: r => toast[r.status === "sent" ? "success" : r.status === "failed" ? "error" : "info"](`テスト送信: ${r.status === "sent" ? "成功" : r.status === "failed" ? "失敗" : "未設定（キュー）"}`),
    onError: e => toast.error(e.message),
  });

  const isChatwork = f.channel === "chatwork";

  return (
    <LmsLayout title="内部通知連携（無料Webhook）" description="協業先・企業管理者・運営向けの内部通知。Slack / Google Chat / Chatwork はすべて無料。修了検知などを自動連絡します。">
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>これは<strong>社内・協業先向けの内部通知</strong>です（受講者本人への配信はメール/LINEを使用）。Slack・Google Chatは「Incoming Webhook URL」、Chatworkは「APIトークン＋ルームID」を登録します。いずれも<strong>送信無料</strong>です。</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* 登録フォーム */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Plus className="h-4 w-4" /> Webhookを登録</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>通知先スコープ</Label>
              <Select value={f.targetType} onValueChange={(v: "operator" | "partner" | "company") => setF({ ...f, targetType: v, targetId: "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="operator">運営全体（すべての通知を受信）</SelectItem>
                  <SelectItem value="partner">協業先（担当案件の通知）</SelectItem>
                  <SelectItem value="company">導入企業（自社の通知）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {f.targetType === "partner" && (
              <div>
                <Label>協業先</Label>
                <Select value={f.targetId} onValueChange={v => setF({ ...f, targetId: v })}>
                  <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
                  <SelectContent>{partners.data?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            {f.targetType === "company" && (
              <div>
                <Label>導入企業</Label>
                <Select value={f.targetId} onValueChange={v => setF({ ...f, targetId: v })}>
                  <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
                  <SelectContent>{companies.data?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>チャネル</Label>
              <Select value={f.channel} onValueChange={(v: "slack" | "googlechat" | "chatwork") => setF({ ...f, channel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="googlechat">Google Chat</SelectItem>
                  <SelectItem value="chatwork">Chatwork</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>ラベル</Label><Input value={f.label} onChange={e => setF({ ...f, label: e.target.value })} placeholder="例: 運営Slack #lms通知" /></div>
            {!isChatwork ? (
              <div><Label>Incoming Webhook URL</Label><Input value={f.webhookUrl} onChange={e => setF({ ...f, webhookUrl: e.target.value })} placeholder="https://hooks.slack.com/services/..." /></div>
            ) : (
              <>
                <div><Label>Chatwork APIトークン</Label><Input value={f.apiToken} onChange={e => setF({ ...f, apiToken: e.target.value })} /></div>
                <div><Label>ルームID</Label><Input value={f.roomId} onChange={e => setF({ ...f, roomId: e.target.value })} placeholder="123456789" /></div>
              </>
            )}
            <Button
              className="w-full"
              disabled={create.isPending || (f.targetType !== "operator" && !f.targetId) || (isChatwork ? !f.apiToken || !f.roomId : !f.webhookUrl)}
              onClick={() => create.mutate({
                targetType: f.targetType,
                targetId: f.targetId ? Number(f.targetId) : undefined,
                channel: f.channel,
                label: f.label || undefined,
                webhookUrl: isChatwork ? undefined : f.webhookUrl,
                apiToken: isChatwork ? f.apiToken : undefined,
                roomId: isChatwork ? f.roomId : undefined,
              })}
            >登録</Button>
          </CardContent>
        </Card>

        {/* 一覧 */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Webhook className="h-4 w-4" /> 登録済みWebhook（{hooks.data?.length ?? 0}）</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>ラベル</TableHead><TableHead>スコープ</TableHead><TableHead>チャネル</TableHead><TableHead>状態</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {hooks.data?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-slate-400">Webhookが未登録です</TableCell></TableRow>}
                {hooks.data?.map(w => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.label || "(無名)"}</TableCell>
                    <TableCell className="text-sm text-slate-500">{TARGET_LABEL[w.targetType]}{w.targetId != null ? ` #${w.targetId}` : ""}</TableCell>
                    <TableCell><Badge variant="secondary">{CHANNEL_LABEL[w.channel]}</Badge></TableCell>
                    <TableCell>{w.isActive ? <Badge className="bg-emerald-600">有効</Badge> : <Badge variant="secondary">停止</Badge>}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => test.mutate({ id: w.id })} disabled={test.isPending}><Send className="mr-1 h-3.5 w-3.5" /> テスト</Button>
                      <Button size="sm" variant="ghost" onClick={() => del.mutate({ id: w.id })}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-900">
              <div className="font-medium text-slate-600 dark:text-slate-300">自動通知のタイミング</div>
              <p className="mt-1">受講者が修了（修了証発行）すると、運営全体＋該当協業先＋該当企業のWebhookに自動連絡します。「テスト」ボタンで疎通確認できます。</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </LmsLayout>
  );
}
