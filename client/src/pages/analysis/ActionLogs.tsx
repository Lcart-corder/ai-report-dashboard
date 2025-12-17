import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { DataTable, StatusBadge } from "@/components/common/ui-kit";
import { ActionExecution } from "@/types/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, RefreshCw, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Mock Data
const MOCK_LOGS: ActionExecution[] = [
  {
    id: "log1",
    tenant_id: "t1",
    action_set_id: "as1",
    trigger_binding_id: "tb1",
    contact_id: "c1",
    status: "succeeded",
    started_at: "2024-03-15T10:00:00Z",
    finished_at: "2024-03-15T10:00:02Z",
    request_id: "req_123",
    meta_json: { trigger: "rich_menu_tap", action_count: 3 }
  },
  {
    id: "log2",
    tenant_id: "t1",
    action_set_id: "as2",
    trigger_binding_id: "tb2",
    contact_id: "c2",
    status: "failed",
    started_at: "2024-03-15T10:05:00Z",
    finished_at: "2024-03-15T10:05:01Z",
    error: "API Rate Limit Exceeded",
    request_id: "req_124",
    meta_json: { trigger: "friend_added", action_count: 1 }
  },
  {
    id: "log3",
    tenant_id: "t1",
    action_set_id: "as3",
    trigger_binding_id: "tb3",
    contact_id: "c3",
    status: "running",
    started_at: "2024-03-15T10:10:00Z",
    request_id: "req_125",
    meta_json: { trigger: "form_submit", action_count: 5 }
  }
];

export default function ActionLogsPage() {
  const [logs, setLogs] = useState<ActionExecution[]>(MOCK_LOGS);
  const [selectedLog, setSelectedLog] = useState<ActionExecution | null>(null);

  const columns = [
    {
      header: "実行ID",
      accessorKey: "id" as keyof ActionExecution,
      className: "font-mono text-xs",
    },
    {
      header: "実行日時",
      cell: (item: ActionExecution) => new Date(item.started_at!).toLocaleString(),
    },
    {
      header: "トリガー",
      cell: (item: ActionExecution) => (item.meta_json as any)?.trigger || "-",
    },
    {
      header: "ステータス",
      cell: (item: ActionExecution) => <StatusBadge status={item.status} />,
    },
    {
      header: "所要時間",
      cell: (item: ActionExecution) => {
        if (!item.finished_at || !item.started_at) return "-";
        const diff = new Date(item.finished_at).getTime() - new Date(item.started_at).getTime();
        return `${diff}ms`;
      },
    },
    {
      header: "詳細",
      cell: (item: ActionExecution) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(item)}>
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <PageTemplate 
      title="アクション実行ログ" 
      description="エルメアクションの実行履歴とステータスを確認します。"
      breadcrumbs={[{ label: "分析" }, { label: "アクションログ" }]}
      actions={
        <Button variant="outline" size="icon">
          <RefreshCw className="w-4 h-4" />
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-2 bg-white p-4 rounded-lg border">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input placeholder="実行IDやユーザーIDで検索..." className="pl-8" />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            フィルター
          </Button>
        </div>

        <DataTable 
          data={logs} 
          columns={columns} 
          searchable={false}
          pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => {} }}
        />
      </div>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>実行詳細</DialogTitle>
            <DialogDescription>
              ID: {selectedLog?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">ステータス</div>
                  <div className="mt-1"><StatusBadge status={selectedLog.status} /></div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">リクエストID</div>
                  <div className="mt-1 font-mono text-sm">{selectedLog.request_id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">開始日時</div>
                  <div className="mt-1 text-sm">{new Date(selectedLog.started_at!).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">終了日時</div>
                  <div className="mt-1 text-sm">{selectedLog.finished_at ? new Date(selectedLog.finished_at).toLocaleString() : "-"}</div>
                </div>
              </div>

              {selectedLog.error && (
                <div className="bg-red-50 p-4 rounded-md border border-red-100">
                  <div className="text-sm font-medium text-red-800 mb-1">エラー内容</div>
                  <pre className="text-xs text-red-600 whitespace-pre-wrap">{selectedLog.error}</pre>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">メタデータ</div>
                <pre className="bg-slate-50 p-4 rounded-md text-xs font-mono overflow-auto max-h-40">
                  {JSON.stringify(selectedLog.meta_json, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
