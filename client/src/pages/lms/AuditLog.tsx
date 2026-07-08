import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Search } from "lucide-react";

const CATEGORY_LABEL: Record<string, string> = {
  login: "ログイン", progress: "受講", check: "チェック", quiz: "テスト",
  completion: "修了", export: "証跡出力", user_change: "ユーザー変更", admin: "管理者操作",
};

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function LmsAuditLog() {
  const [category, setCategory] = useState("all");
  const [actor, setActor] = useState("");
  const logs = trpc.lms.auditLogs.useQuery({
    limit: 300,
    category: category === "all" ? undefined : category,
    actor: actor.trim() || undefined,
  });
  const exportCsv = trpc.lms.exports.auditLogsCsv.useMutation({
    onSuccess: r => { downloadCsv("監査ログ.csv", r.csv); toast.success("CSVを出力しました"); },
    onError: e => toast.error(e.message),
  });

  return (
    <LmsLayout title="監査ログ" description="ログイン・受講・チェック・テスト・修了・出力・変更・管理者操作の記録（FR-19）">
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div>
            <div className="mb-1 text-xs text-slate-500">分類</div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {Object.entries(CATEGORY_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="mb-1 text-xs text-slate-500">実行者（メール等・完全一致）</div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="w-64 pl-8" value={actor} onChange={e => setActor(e.target.value)} placeholder="learner@example.com" />
            </div>
          </div>
          <Button variant="outline" onClick={() => exportCsv.mutate({ category: category === "all" ? undefined : category, actor: actor.trim() || undefined })} disabled={exportCsv.isPending}>
            <Download className="mr-1.5 h-4 w-4" /> CSV出力
          </Button>
          <div className="ml-auto text-sm text-slate-400">{logs.data?.length ?? 0} 件</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow><TableHead className="w-40">日時</TableHead><TableHead>分類</TableHead><TableHead>操作</TableHead><TableHead>対象</TableHead><TableHead>実行者</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {logs.data?.length === 0 && <TableRow><TableCell colSpan={5} className="p-8 text-center text-slate-400">該当するログがありません。</TableCell></TableRow>}
              {logs.data?.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs text-slate-500">{new Date(l.createdAt).toLocaleString("ja-JP")}</TableCell>
                  <TableCell><Badge variant="secondary">{CATEGORY_LABEL[l.category] ?? l.category}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{l.action}</TableCell>
                  <TableCell className="text-xs text-slate-500">{l.targetType}{l.targetId != null ? `#${l.targetId}` : ""}</TableCell>
                  <TableCell className="text-xs text-slate-500">{l.actor ?? "system"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </LmsLayout>
  );
}
