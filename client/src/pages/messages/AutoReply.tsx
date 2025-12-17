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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, StatusBadge } from "@/components/common/ui-kit";
import { FolderManager } from "@/components/common/folder-manager";
import { AutoReply, Folder } from "@/types/schema";
import { Plus, Edit2, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const MOCK_FOLDERS: Folder[] = [
  { id: "f1", tenant_id: "t1", name: "店舗案内", scope: "auto_replies", sort_order: 1, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "f2", tenant_id: "t1", name: "キャンペーン", scope: "auto_replies", sort_order: 2, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

const MOCK_AUTO_REPLIES: AutoReply[] = [
  { id: "1", tenant_id: "t1", keyword: "営業時間", folder_id: "f1", match_type: "partial", response_type: "text", response_content: "営業時間は平日10:00〜18:00です。", is_active: true, created_at: "2024-01-01T10:00:00Z" },
  { id: "2", tenant_id: "t1", keyword: "アクセス", folder_id: "f1", match_type: "partial", response_type: "text", response_content: "東京都渋谷区...", is_active: true, created_at: "2024-01-15T14:30:00Z" },
  { id: "3", tenant_id: "t1", keyword: "キャンペーン", folder_id: "f2", match_type: "exact", response_type: "template", response_content: {}, is_active: false, created_at: "2024-02-01T11:00:00Z" },
];

export default function AutoReplyPage() {
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [replies, setReplies] = useState<AutoReply[]>(MOCK_AUTO_REPLIES);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ keyword: "", matchType: "partial", response: "" });

  // Folder Handlers
  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "t1",
      name,
      scope: "auto_replies",
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
    setReplies(replies.map(r => r.folder_id === id ? { ...r, folder_id: undefined } : r));
    toast.success("フォルダを削除しました");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.keyword || !formData.response) {
      toast.error("キーワードと応答内容を入力してください");
      return;
    }

    const newReply: AutoReply = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "t1",
      keyword: formData.keyword,
      folder_id: selectedFolderId || undefined,
      match_type: formData.matchType as any,
      response_type: "text",
      response_content: formData.response,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setReplies([newReply, ...replies]);
    toast.success("自動応答を作成しました");
    setIsDialogOpen(false);
    setFormData({ keyword: "", matchType: "partial", response: "" });
  };

  const toggleStatus = (id: string) => {
    setReplies(replies.map(r => {
      if (r.id === id) {
        const newStatus = !r.is_active;
        toast.success(newStatus ? "自動応答を有効化しました" : "自動応答を停止しました");
        return { ...r, is_active: newStatus };
      }
      return r;
    }));
  };

  const filteredReplies = selectedFolderId
    ? replies.filter(r => r.folder_id === selectedFolderId)
    : replies;

  const columns = [
    {
      header: "キーワード",
      cell: (item: AutoReply) => (
        <div>
          <div className="font-medium">{item.keyword}</div>
          {item.folder_id && (
            <span className="text-xs text-gray-400 block mt-1">
              {folders.find(f => f.id === item.folder_id)?.name}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "一致条件",
      cell: (item: AutoReply) => (
        <span className="text-sm text-gray-600">
          {item.match_type === "exact" ? "完全一致" : item.match_type === "partial" ? "部分一致" : "正規表現"}
        </span>
      ),
    },
    {
      header: "応答内容",
      cell: (item: AutoReply) => (
        <div className="text-sm text-gray-600 truncate max-w-[200px]">
          {typeof item.response_content === 'string' ? item.response_content : 'テンプレート'}
        </div>
      ),
    },
    {
      header: "ステータス",
      cell: (item: AutoReply) => (
        <div onClick={() => toggleStatus(item.id)} className="cursor-pointer">
          <StatusBadge 
            status={item.is_active ? "active" : "inactive"} 
            label={item.is_active ? "稼働中" : "停止中"}
          />
        </div>
      ),
    },
    {
      header: "操作",
      className: "text-right",
      cell: (item: AutoReply) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon">
            <Edit2 className="w-4 h-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" className="text-red-500">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTemplate 
      title="自動応答" 
      description="ユーザーからのメッセージに含まれるキーワードに反応して自動で返信します。"
      breadcrumbs={[{ label: "メッセージ" }, { label: "自動応答" }]}
      actions={
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
          <Plus className="w-4 h-4" />
          新規作成
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
              data={filteredReplies} 
              columns={columns} 
              searchable 
              pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => {} }}
            />
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新規自動応答作成</DialogTitle>
            <DialogDescription>
              反応するキーワードと返信内容を設定してください。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">基本設定</TabsTrigger>
                <TabsTrigger value="advanced">詳細設定</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="keyword">キーワード</Label>
                  <Input 
                    id="keyword" 
                    placeholder="例: 営業時間" 
                    value={formData.keyword}
                    onChange={(e) => setFormData({...formData, keyword: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="matchType">一致条件</Label>
                  <Select 
                    value={formData.matchType} 
                    onValueChange={(v) => setFormData({...formData, matchType: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="partial">部分一致（キーワードを含む）</SelectItem>
                      <SelectItem value="exact">完全一致（キーワードのみ）</SelectItem>
                      <SelectItem value="regex">正規表現</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="response">返信内容</Label>
                  <Textarea 
                    id="response" 
                    placeholder="返信するメッセージを入力..." 
                    value={formData.response}
                    onChange={(e) => setFormData({...formData, response: e.target.value})}
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 py-4">
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2 text-sm">稼働時間設定</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="always_active" defaultChecked />
                        <Label htmlFor="always_active" className="text-sm font-normal">24時間365日稼働</Label>
                      </div>
                      <div className="pl-6 text-xs text-gray-500">
                        チェックを外すと、曜日・時間帯を指定して稼働させることができます。
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2 text-sm">反応条件の詳細</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="exclude_tagged" />
                        <Label htmlFor="exclude_tagged" className="text-sm font-normal">特定のタグが付いているユーザーには反応しない</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="priority_high" />
                        <Label htmlFor="priority_high" className="text-sm font-normal">他の自動応答より優先して実行する</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>キャンセル</Button>
              <Button type="submit" className="bg-[#06C755] hover:bg-[#05b34c] text-white">
                作成する
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
