import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CATEGORY_LABEL: Record<string, string> = {
  login: "ログイン", progress: "受講", check: "チェック", quiz: "テスト",
  completion: "修了", export: "証跡出力", user_change: "ユーザー変更", admin: "管理者操作",
};

export default function LmsAuditLog() {
  const logs = trpc.lms.auditLogs.useQuery({ limit: 300 });

  return (
    <LmsLayout title="監査ログ" description="ログイン・受講・チェック・テスト・修了・出力・変更・管理者操作の記録（FR-19）">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow><TableHead className="w-40">日時</TableHead><TableHead>分類</TableHead><TableHead>操作</TableHead><TableHead>対象</TableHead><TableHead>実行者</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {logs.data?.length === 0 && <TableRow><TableCell colSpan={5} className="p-8 text-center text-slate-400">ログがありません。</TableCell></TableRow>}
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
