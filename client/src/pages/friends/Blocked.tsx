import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { DataTable, StatusBadge } from "@/components/common/ui-kit";
import { Contact } from "@/types/schema";
import { UserX, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const MOCK_BLOCKED_USERS: Contact[] = [
  { id: "U003", tenant_id: "t1", line_user_id: "L003", display_name: "鈴木 一郎", status: "blocked", tags: [], attributes: {}, last_active_at: "2024-01-10T10:00:00Z", created_at: "2023-12-01T00:00:00Z" },
  { id: "U009", tenant_id: "t1", line_user_id: "L009", display_name: "Unknown User", status: "blocked", tags: [], attributes: {}, last_active_at: "2023-11-20T15:00:00Z", created_at: "2023-11-01T00:00:00Z" },
];

export default function BlockedPage() {
  const [users, setUsers] = useState<Contact[]>(MOCK_BLOCKED_USERS);

  const handleUnblock = (id: string) => {
    if (confirm("このユーザーのブロックを解除しますか？")) {
      setUsers(users.filter(u => u.id !== id));
      toast.success("ブロックを解除しました");
    }
  };

  const columns = [
    {
      header: "ユーザー",
      cell: (user: Contact) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
            {user.display_name.slice(0, 1)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.display_name}</div>
            <div className="text-xs text-gray-400">ID: {user.line_user_id}</div>
          </div>
        </div>
      ),
    },
    {
      header: "ステータス",
      cell: (user: Contact) => <StatusBadge status={user.status} label="ブロック中" variant="error" />,
    },
    {
      header: "ブロック日時",
      cell: (user: Contact) => new Date(user.last_active_at).toLocaleDateString(),
    },
    {
      header: "操作",
      className: "text-right",
      cell: (user: Contact) => (
        <Button variant="outline" size="sm" onClick={() => handleUnblock(user.id)} className="text-gray-600 hover:text-gray-900">
          <RefreshCw className="w-3 h-3 mr-1" />
          解除
        </Button>
      ),
    },
  ];

  return (
    <PageTemplate 
      title="ブロックリスト" 
      description="ブロックされたユーザーの一覧です。必要に応じて解除できます。"
      breadcrumbs={[{ label: "友だち管理" }, { label: "ブロックリスト" }]}
    >
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg flex items-start gap-3">
          <UserX className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-yellow-800">ブロックユーザーについて</h4>
            <p className="text-sm text-yellow-700 mt-1">
              ここには、あなたのアカウントをブロックしたユーザー、または管理画面から手動でブロックしたユーザーが表示されます。
              ブロック中のユーザーにはメッセージを配信できません。
            </p>
          </div>
        </div>

        <DataTable 
          data={users} 
          columns={columns} 
          searchable 
          emptyMessage="ブロック中のユーザーはいません"
          pagination={{
            currentPage: 1,
            totalPages: 1,
            onPageChange: () => {},
          }}
        />
      </div>
    </PageTemplate>
  );
}
