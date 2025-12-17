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
import { Form, Folder } from "@/types/schema";
import { Plus, Edit2, Trash2, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

// Mock Data
const MOCK_FOLDERS: Folder[] = [
  { id: "f1", tenant_id: "t1", name: "アンケート", scope: "forms", sort_order: 1, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "f2", tenant_id: "t1", name: "キャンペーン", scope: "forms", sort_order: 2, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

const MOCK_FORMS: Form[] = [
  { id: "1", tenant_id: "t1", title: "来店アンケート", folder_id: "f1", description: "サービス向上のため...", fields_json: [], is_active: true, response_count: 45, created_at: "2024-01-01T10:00:00Z" },
  { id: "2", tenant_id: "t1", title: "キャンペーン応募", folder_id: "f2", description: "抽選で...", fields_json: [], is_active: true, response_count: 128, created_at: "2024-01-15T14:30:00Z" },
  { id: "3", tenant_id: "t1", title: "お問い合わせ", folder_id: undefined, description: "", fields_json: [], is_active: false, response_count: 12, created_at: "2024-02-01T11:00:00Z" },
];

export default function FormsPage() {
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [forms, setForms] = useState<Form[]>(MOCK_FORMS);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });

  // Folder Handlers
  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "t1",
      name,
      scope: "forms",
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
    setForms(forms.map(f => f.folder_id === id ? { ...f, folder_id: undefined } : f));
    toast.success("フォルダを削除しました");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("フォームタイトルを入力してください");
      return;
    }

    const newForm: Form = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "t1",
      title: formData.title,
      folder_id: selectedFolderId || undefined,
      description: formData.description,
      fields_json: [],
      is_active: true,
      response_count: 0,
      created_at: new Date().toISOString(),
    };

    setForms([newForm, ...forms]);
    toast.success("フォームを作成しました");
    setIsDialogOpen(false);
    setFormData({ title: "", description: "" });
  };

  const toggleStatus = (id: string) => {
    setForms(forms.map(f => {
      if (f.id === id) {
        const newStatus = !f.is_active;
        toast.success(newStatus ? "フォームを公開しました" : "フォームを非公開にしました");
        return { ...f, is_active: newStatus };
      }
      return f;
    }));
  };

  const filteredForms = selectedFolderId
    ? forms.filter(f => f.folder_id === selectedFolderId)
    : forms;

  const columns = [
    {
      header: "フォーム名",
      cell: (item: Form) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium">{item.title}</div>
            <div className="text-xs text-gray-500 truncate max-w-[200px]">{item.description}</div>
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
      header: "回答数",
      accessorKey: "response_count" as keyof Form,
      cell: (item: Form) => <span>{item.response_count}件</span>,
    },
    {
      header: "ステータス",
      cell: (item: Form) => (
        <div onClick={() => toggleStatus(item.id)} className="cursor-pointer">
          <StatusBadge 
            status={item.is_active ? "active" : "inactive"} 
            label={item.is_active ? "公開中" : "非公開"}
          />
        </div>
      ),
    },
    {
      header: "作成日",
      cell: (item: Form) => new Date(item.created_at).toLocaleDateString(),
    },
    {
      header: "操作",
      className: "text-right",
      cell: (item: Form) => (
        <div className="flex justify-end gap-2">
          <Link href={`/forms/responses?form_id=${item.id}`}>
            <Button variant="ghost" size="sm" className="text-blue-600">
              回答確認
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
      title="フォーム管理" 
      description="アンケートや申し込みフォームを作成・管理します。"
      breadcrumbs={[{ label: "フォーム" }]}
      actions={
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
          <Plus className="w-4 h-4" />
          新規フォーム作成
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
              data={filteredForms} 
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
            <DialogTitle>新規フォーム作成</DialogTitle>
            <DialogDescription>
              フォームの基本情報を入力してください。
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
                  <Label htmlFor="title">フォームタイトル</Label>
                  <Input 
                    id="title" 
                    placeholder="例: 来店アンケート" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">説明文（任意）</Label>
                  <Textarea 
                    id="description" 
                    placeholder="フォームの説明を入力..." 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 py-4">
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2 text-sm">受付設定</h4>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="limit">回答回数制限</Label>
                        <Input id="limit" type="number" placeholder="1人1回までなら「1」" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="deadline">回答期限</Label>
                        <Input id="deadline" type="datetime-local" />
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2 text-sm">回答後アクション</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="action_tag" />
                        <Label htmlFor="action_tag" className="text-sm font-normal">回答完了時にタグを付与する</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="action_notify" defaultChecked />
                        <Label htmlFor="action_notify" className="text-sm font-normal">管理者に回答通知を送る</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="action_message" />
                        <Label htmlFor="action_message" className="text-sm font-normal">回答者にサンクスメッセージを送る</Label>
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
