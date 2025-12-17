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
import { DataTable, AuditLogViewer } from "@/components/common/ui-kit";
import { FolderManager } from "@/components/common/folder-manager";
import { Tag, AuditLog, Folder } from "@/types/schema";
import { Plus, Edit2, Trash2, Tag as TagIcon } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const MOCK_FOLDERS: Folder[] = [
  { id: "f1", tenant_id: "t1", name: "顧客ランク", scope: "tags", sort_order: 1, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "f2", tenant_id: "t1", name: "行動履歴", scope: "tags", sort_order: 2, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

const MOCK_TAGS: Tag[] = [
  { id: "1", tenant_id: "t1", name: "VIP", folder_id: "f1", color: "#FFD700", count: 124, created_at: "2024-01-01T10:00:00Z" },
  { id: "2", tenant_id: "t1", name: "1月購入", folder_id: "f2", color: "#06C755", count: 45, created_at: "2024-01-15T14:30:00Z" },
  { id: "3", tenant_id: "t1", name: "クーポン利用", folder_id: "f2", color: "#3B82F6", count: 89, created_at: "2024-01-20T09:15:00Z" },
  { id: "4", tenant_id: "t1", name: "カート落ち", folder_id: "f2", color: "#EF4444", count: 12, created_at: "2024-02-01T11:00:00Z" },
  { id: "5", tenant_id: "t1", name: "メルマガ購読", folder_id: undefined, color: "#8B5CF6", count: 256, created_at: "2024-02-05T16:45:00Z" },
];

const MOCK_LOGS: AuditLog[] = [
  { id: "l1", tenant_id: "t1", actor_user_id: "u1", action: "create", target_type: "tag", target_id: "5", created_at: "2024-02-05T16:45:00Z" },
  { id: "l2", tenant_id: "t1", actor_user_id: "u1", action: "update", target_type: "tag", target_id: "1", diff_json: { color: "#FFD700" }, created_at: "2024-02-06T10:00:00Z" },
];

export default function TagsPage() {
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [tags, setTags] = useState<Tag[]>(MOCK_TAGS);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({ name: "", color: "#06C755" });

  // Folder Handlers
  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "t1",
      name,
      scope: "tags",
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
    setTags(tags.map(t => t.folder_id === id ? { ...t, folder_id: undefined } : t));
    toast.success("フォルダを削除しました");
  };

  const handleOpenDialog = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({ name: tag.name, color: tag.color });
    } else {
      setEditingTag(null);
      setFormData({ name: "", color: "#06C755" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("タグ名を入力してください");
      return;
    }

    if (editingTag) {
      // Update
      setTags(tags.map(t => t.id === editingTag.id ? { ...t, ...formData } : t));
      toast.success("タグを更新しました");
    } else {
      // Create
      const newTag: Tag = {
        id: Math.random().toString(36).substr(2, 9),
        tenant_id: "t1",
        name: formData.name,
        folder_id: selectedFolderId || undefined,
        color: formData.color,
        count: 0,
        created_at: new Date().toISOString(),
      };
      setTags([newTag, ...tags]);
      toast.success("タグを作成しました");
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("このタグを削除してもよろしいですか？")) {
      setTags(tags.filter(t => t.id !== id));
      toast.success("タグを削除しました");
    }
  };

  const filteredTags = selectedFolderId
    ? tags.filter(t => t.folder_id === selectedFolderId)
    : tags;

  const columns = [
    {
      header: "タグ名",
      cell: (tag: Tag) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }} />
            <span className="font-medium">{tag.name}</span>
          </div>
          {tag.folder_id && (
            <span className="text-xs text-gray-400 ml-6">
              {folders.find(f => f.id === tag.folder_id)?.name}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "対象人数",
      accessorKey: "count" as keyof Tag,
      cell: (tag: Tag) => <span>{tag.count}人</span>,
    },
    {
      header: "作成日",
      cell: (tag: Tag) => new Date(tag.created_at).toLocaleDateString(),
    },
    {
      header: "操作",
      className: "text-right",
      cell: (tag: Tag) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(tag)}>
            <Edit2 className="w-4 h-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(tag.id)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTemplate 
      title="タグ管理" 
      description="友だちを分類するためのタグを作成・管理します。"
      breadcrumbs={[{ label: "友だち管理" }, { label: "タグ管理" }]}
      actions={
        <Button onClick={() => handleOpenDialog()} className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DataTable 
                  data={filteredTags} 
                  columns={columns} 
                  searchable 
                  pagination={{
                    currentPage: 1,
                    totalPages: 1,
                    onPageChange: () => {},
                  }}
                />
              </div>
              <div>
                <AuditLogViewer logs={MOCK_LOGS} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTag ? "タグを編集" : "新規タグ作成"}</DialogTitle>
            <DialogDescription>
              タグの名前とカラーを設定してください。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">タグ名</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: VIP会員" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">カラー</Label>
                <div className="flex gap-2">
                  <Input 
                    id="color" 
                    type="color" 
                    value={formData.color} 
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer" 
                  />
                  <Input 
                    value={formData.color} 
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#000000" 
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>キャンセル</Button>
              <Button type="submit" className="bg-[#06C755] hover:bg-[#05b34c] text-white">
                {editingTag ? "更新する" : "作成する"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
