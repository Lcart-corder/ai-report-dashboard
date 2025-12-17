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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, StatusBadge } from "@/components/common/ui-kit";
import { FolderManager } from "@/components/common/folder-manager";
import { Broadcast, Folder } from "@/types/schema";
import { Plus, Send, Clock, Edit2, Trash2, PlayCircle } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const MOCK_FOLDERS: Folder[] = [
  { id: "f1", tenant_id: "t1", name: "キャンペーン", scope: "broadcasts", sort_order: 1, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "f2", tenant_id: "t1", name: "定期配信", scope: "broadcasts", sort_order: 2, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

const MOCK_BROADCASTS: Broadcast[] = [
  { id: "1", tenant_id: "t1", name: "新春キャンペーン告知", folder_id: "f1", status: "sent", target_filter_json: {}, messages_json: [], sent_count: 2124, created_at: "2025-01-15T10:00:00Z", scheduled_at: "2025-01-15T10:00:00Z" },
  { id: "2", tenant_id: "t1", name: "2月セール予告", folder_id: "f1", status: "scheduled", target_filter_json: {}, messages_json: [], sent_count: 0, created_at: "2025-01-20T14:00:00Z", scheduled_at: "2025-02-01T09:00:00Z" },
  { id: "3", tenant_id: "t1", name: "未購入者向けクーポン", folder_id: undefined, status: "draft", target_filter_json: {}, messages_json: [], sent_count: 0, created_at: "2025-01-22T11:30:00Z" },
];

export default function BroadcastPage() {
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(MOCK_BROADCASTS);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", message: "", schedule: "" });

  // Folder Handlers
  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "t1",
      name,
      scope: "broadcasts",
      sort_order: folders.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setFolders([...folders, newFolder]);
    toast.success("フォルダを作成しました");
  };

  const handleUpdateFolder = (id: string, name: string) => {
    setFolders(folders.map(f => f.id === id ? { ...f, name } : f));
    toast.success("フォルダ名を変更しました");
  };

  const handleDeleteFolder = (id: string) => {
    setFolders(folders.filter(f => f.id !== id));
    setBroadcasts(broadcasts.map(b => b.folder_id === id ? { ...b, folder_id: undefined } : b));
    toast.success("フォルダを削除しました");
  };

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
      folder_id: selectedFolderId || undefined,
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

  const filteredBroadcasts = selectedFolderId
    ? broadcasts.filter(b => b.folder_id === selectedFolderId)
    : broadcasts;

  const columns = [
    {
      header: "配信名",
      cell: (item: Broadcast) => (
        <div>
          <div className="font-medium">{item.name}</div>
          {item.folder_id && (
            <span className="text-xs text-gray-400 block mt-1">
              {folders.find(f => f.id === item.folder_id)?.name}
            </span>
          )}
        </div>
      ),
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
      <div className="flex h-[calc(100vh-220px)] border rounded-lg bg-white overflow-hidden">
        <FolderManager
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onCreateFolder={handleCreateFolder}
          onUpdateFolder={handleUpdateFolder}
          onDeleteFolder={handleDeleteFolder}
        />
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-white">
            <h2 className="font-bold text-lg">
              {selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : "すべての項目"}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <DataTable 
              data={filteredBroadcasts} 
              columns={columns} 
              searchable 
              pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => {} }}
            />
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新規メッセージ配信</DialogTitle>
            <DialogDescription>
              配信内容と対象を設定してください。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">基本設定</TabsTrigger>
                <TabsTrigger value="advanced">詳細設定</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="grid gap-6 py-4">
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
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 py-4">
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2 text-sm">除外条件設定</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="exclude_blocked" defaultChecked />
                        <Label htmlFor="exclude_blocked" className="text-sm font-normal">ブロック中のユーザーを除外</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="exclude_recent" />
                        <Label htmlFor="exclude_recent" className="text-sm font-normal">24時間以内にメッセージを送信したユーザーを除外</Label>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2 text-sm">配信後アクション</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="action_tag" />
                        <Label htmlFor="action_tag" className="text-sm font-normal">配信完了時にタグを付与する</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="action_notify" />
                        <Label htmlFor="action_notify" className="text-sm font-normal">管理者に完了通知を送る</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
