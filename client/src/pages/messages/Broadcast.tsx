import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { DataTable, StatusBadge } from "@/components/common/ui-kit";
import { Broadcast } from "@/types/schema";
import { Plus, Send, Clock, Edit2, Trash2, PlayCircle } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const MOCK_BROADCASTS: Broadcast[] = [
  { id: "1", tenant_id: "t1", name: "新春キャンペーン告知", status: "sent", target_filter_json: {}, messages_json: [], sent_count: 2124, created_at: "2025-01-15T10:00:00Z", scheduled_at: "2025-01-15T10:00:00Z" },
  { id: "2", tenant_id: "t1", name: "2月セール予告", status: "scheduled", target_filter_json: {}, messages_json: [], sent_count: 0, created_at: "2025-01-20T14:00:00Z", scheduled_at: "2025-02-01T09:00:00Z" },
  { id: "3", tenant_id: "t1", name: "未購入者向けクーポン", status: "draft", target_filter_json: {}, messages_json: [], sent_count: 0, created_at: "2025-01-22T11:30:00Z" },
];

export default function BroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(MOCK_BROADCASTS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", message: "", schedule: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("配信名を入力してください");
      return;
    }

    const newBroadcast: Broadcast = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "t1",
      name: formData.name,
      status: formData.schedule ? "scheduled" : "draft",
      target_filter_json: {},
      messages_json: [{ type: "text", text: formData.message }],
      sent_count: 0,
      created_at: new Date().toISOString(),
      scheduled_at: formData.schedule || undefined,
    };

    setBroadcasts([newBroadcast, ...broadcasts]);
    toast.success(formData.schedule ? "配信を予約しました" : "下書きを保存しました");
    setIsDialogOpen(false);
    setFormData({ name: "", message: "", schedule: "" });
  };

  const handleTestSend = () => {
    toast.success("テスト送信を実行しました", {
      description: "あなたのLINEアカウントにテストメッセージを送信しました。"
    });
  };

  const columns = [
    {
      header: "配信名",
      accessorKey: "name" as keyof Broadcast,
      className: "font-medium",
    },
    {
      header: "ステータス",
      cell: (item: Broadcast) => <StatusBadge status={item.status} />,
    },
    {
      header: "配信日時",
      cell: (item: Broadcast) => item.scheduled_at ? new Date(item.scheduled_at).toLocaleString() : "-",
    },
    {
      header: "配信数",
      accessorKey: "sent_count" as keyof Broadcast,
      cell: (item: Broadcast) => item.status === "sent" ? `${item.sent_count}通` : "-",
    },
    {
      header: "操作",
      className: "text-right",
      cell: (item: Broadcast) => (
        <div className="flex justify-end gap-2">
          {item.status === "draft" && (
            <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(true)}>
              <Edit2 className="w-4 h-4 text-gray-500" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="text-red-500">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTemplate 
      title="一斉配信" 
      description="友だち全員または条件で絞り込んでメッセージを一斉送信します。"
      breadcrumbs={[{ label: "メッセージ" }, { label: "一斉配信" }]}
      actions={
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
          <Plus className="w-4 h-4" />
          新規配信作成
        </Button>
      }
    >
      <DataTable 
        data={broadcasts} 
        columns={columns} 
        searchable 
        pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => {} }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新規メッセージ配信</DialogTitle>
            <DialogDescription>
              配信内容と対象を設定してください。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">配信管理名 <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  placeholder="例: 3月セール告知" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid gap-2">
                <Label>メッセージ内容</Label>
                <div className="border rounded-md p-4 bg-gray-50">
                  <Textarea 
                    placeholder="ここにメッセージを入力..." 
                    className="min-h-[150px] bg-white"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                  <div className="flex justify-between mt-2">
                    <div className="text-xs text-gray-500">文字数: {formData.message.length}</div>
                    <Button type="button" variant="outline" size="sm" onClick={handleTestSend} className="gap-2">
                      <PlayCircle className="w-3 h-3" />
                      テスト送信
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="schedule">配信日時（空欄で即時配信）</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <Input 
                    id="schedule" 
                    type="datetime-local" 
                    className="w-auto"
                    value={formData.schedule}
                    onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>キャンセル</Button>
              <Button type="submit" className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
                <Send className="w-4 h-4" />
                {formData.schedule ? "予約する" : "配信する"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
