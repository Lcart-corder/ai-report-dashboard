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
import { DataTable } from "@/components/common/ui-kit";
import { FolderManager } from "@/components/common/folder-manager";
import { MessageTemplate, Folder } from "@/types/schema";
import { Plus, Edit2, Trash2, Layout, Image as ImageIcon, Type } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

// Mock Data
const MOCK_FOLDERS: Folder[] = [
  { id: "f1", tenant_id: "t1", name: "予約関連", type: "template", created_at: "2024-01-01T00:00:00Z" },
  { id: "f2", tenant_id: "t1", name: "商品紹介", type: "template", created_at: "2024-01-01T00:00:00Z" },
];

const MOCK_TEMPLATES: MessageTemplate[] = [
  { id: "1", tenant_id: "t1", name: "来店予約完了", folder_id: "f1", content_type: "text", content_json: "ご予約ありがとうございます...", created_at: "2024-01-01T10:00:00Z", updated_at: "2024-01-01T10:00:00Z" },
  { id: "2", tenant_id: "t1", name: "商品紹介カード", folder_id: "f2", content_type: "card", content_json: {}, created_at: "2024-01-15T14:30:00Z", updated_at: "2024-01-15T14:30:00Z" },
  { id: "3", tenant_id: "t1", name: "クーポン画像", folder_id: undefined, content_type: "image", content_json: {}, created_at: "2024-02-01T11:00:00Z", updated_at: "2024-02-01T11:00:00Z" },
];

export default function TemplatesPage() {
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [templates, setTemplates] = useState<MessageTemplate[]>(MOCK_TEMPLATES);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", content: "" });

  // Folder Handlers
  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "t1",
      name,
      type: "template",
      created_at: new Date().toISOString(),
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
    // Move items to root (null folder)
    setTemplates(templates.map(t => t.folder_id === id ? { ...t, folder_id: undefined } : t));
    toast.success("フォルダを削除しました");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      toast.error("テンプレート名と内容を入力してください");
      return;
    }

    const newTemplate: MessageTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "t1",
      name: formData.name,
      folder_id: selectedFolderId || undefined, // Assign to selected folder
      content_type: "text",
      content_json: formData.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTemplates([newTemplate, ...templates]);
    toast.success("テンプレートを作成しました");
    setIsDialogOpen(false);
    setFormData({ name: "", content: "" });
  };

  const filteredTemplates = selectedFolderId
    ? templates.filter(t => t.folder_id === selectedFolderId)
    : templates;

  const columns = [
    {
      header: "テンプレート名",
      cell: (item: MessageTemplate) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
            {item.content_type === "text" && <Type className="w-4 h-4" />}
            {item.content_type === "image" && <ImageIcon className="w-4 h-4" />}
            {item.content_type === "card" && <Layout className="w-4 h-4" />}
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{item.name}</span>
            {item.folder_id && (
              <span className="text-xs text-gray-500">
                {folders.find(f => f.id === item.folder_id)?.name}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "タイプ",
      cell: (item: MessageTemplate) => (
        <span className="text-sm text-gray-600 capitalize">{item.content_type}</span>
      ),
    },
    {
      header: "更新日",
      cell: (item: MessageTemplate) => new Date(item.updated_at).toLocaleDateString(),
    },
    {
      header: "操作",
      className: "text-right",
      cell: (item: MessageTemplate) => (
        <div className="flex justify-end gap-2">
          <Link href={`/messages/templates/${item.id}/analysis`}>
            <Button variant="ghost" size="sm" className="text-blue-600">
              分析
            </Button>
          </Link>
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
      title="テンプレート管理" 
      description="よく使うメッセージやリッチメニュー、カードタイプメッセージを作成・管理します。"
      breadcrumbs={[{ label: "メッセージ" }, { label: "テンプレート" }]}
      actions={
        <Link href="/messages/templates/create">
          <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
            <Plus className="w-4 h-4" />
            新規作成
          </Button>
        </Link>
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
              data={filteredTemplates} 
              columns={columns} 
              searchable 
              pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => {} }}
            />
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
