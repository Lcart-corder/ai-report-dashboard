import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, StatusBadge } from "@/components/common/ui-kit";
import { FolderManager } from "@/components/common/folder-manager";
import { Folder } from "@/types/schema";
import { Plus, Edit2, Trash2, Database } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const MOCK_FOLDERS: Folder[] = [
  { id: "f1", tenant_id: "t1", name: "基本情報", scope: "friend_info", sort_order: 1, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "f2", tenant_id: "t1", name: "アンケート回答", scope: "friend_info", sort_order: 2, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

interface FriendInfo {
  id: string;
  name: string;
  key: string;
  type: "text" | "number" | "date" | "select";
  folder_id?: string;
  is_active: boolean;
  created_at: string;
}

const MOCK_INFOS: FriendInfo[] = [
  { id: "1", name: "氏名", key: "full_name", type: "text", folder_id: "f1", is_active: true, created_at: "2024-01-01T10:00:00Z" },
  { id: "2", name: "電話番号", key: "phone", type: "text", folder_id: "f1", is_active: true, created_at: "2024-01-01T10:00:00Z" },
  { id: "3", name: "生年月日", key: "birthday", type: "date", folder_id: "f1", is_active: true, created_at: "2024-01-01T10:00:00Z" },
  { id: "4", name: "来店きっかけ", key: "source", type: "select", folder_id: "f2", is_active: true, created_at: "2024-02-01T11:00:00Z" },
  { id: "5", name: "興味のある商品", key: "interest", type: "select", folder_id: "f2", is_active: true, created_at: "2024-02-01T11:00:00Z" },
];

export default function FriendInfoListPage() {
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [infos, setInfos] = useState<FriendInfo[]>(MOCK_INFOS);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", key: "", type: "text" });

  // Folder Handlers
  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "t1",
      name,
      scope: "friend_info",
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
    setInfos(infos.map(i => i.folder_id === id ? { ...i, folder_id: undefined } : i));
    toast.success("フォルダを削除しました");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.key) {
      toast.error("項目名とキーを入力してください");
      return;
    }

    const newInfo: FriendInfo = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      key: formData.key,
      type: formData.type as any,
      folder_id: selectedFolderId || undefined,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setInfos([newInfo, ...infos]);
    toast.success("友だち情報項目を作成しました");
    setIsDialogOpen(false);
    setFormData({ name: "", key: "", type: "text" });
  };

  const filteredInfos = selectedFolderId
    ? infos.filter(i => i.folder_id === selectedFolderId)
    : infos;

  const columns = [
    {
      header: "項目名",
      cell: (item: FriendInfo) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-xs text-gray-500 font-mono">{item.key}</div>
            {item.folder_id && (
              <span className="text-xs text-gray-400 block mt-1">
                {folders.find(f => f.id === item.folder_id)?.name}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "データ型",
      cell: (item: FriendInfo) => (
        <span className="text-sm text-gray-600 capitalize">
          {item.type === "text" && "テキスト"}
          {item.type === "number" && "数値"}
          {item.type === "date" && "日付"}
          {item.type === "select" && "選択肢"}
        </span>
      ),
    },
    {
      header: "ステータス",
      cell: (item: FriendInfo) => <StatusBadge status={item.is_active ? "active" : "inactive"} label={item.is_active ? "有効" : "無効"} />,
    },
    {
      header: "作成日",
      cell: (item: FriendInfo) => new Date(item.created_at).toLocaleDateString(),
    },
    {
      header: "操作",
      className: "text-right",
      cell: (item: FriendInfo) => (
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
      title="友だち情報管理" 
      description="友だちに紐づける情報項目（カスタムフィールド）を管理します。"
      breadcrumbs={[{ label: "友だち管理" }, { label: "友だち情報管理" }]}
      actions={
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
          <Plus className="w-4 h-4" />
          新規項目作成
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
              data={filteredInfos} 
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
            <DialogTitle>新規項目作成</DialogTitle>
            <DialogDescription>
              友だち情報の項目名とデータ型を設定してください。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">項目名</Label>
                <Input 
                  id="name" 
                  placeholder="例: 氏名" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="key">管理キー（英数字）</Label>
                <Input 
                  id="key" 
                  placeholder="例: full_name" 
                  value={formData.key}
                  onChange={(e) => setFormData({...formData, key: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">データ型</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => setFormData({...formData, type: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">テキスト（1行）</SelectItem>
                    <SelectItem value="number">数値</SelectItem>
                    <SelectItem value="date">日付</SelectItem>
                    <SelectItem value="select">選択肢</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
