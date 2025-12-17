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
import { MessageTemplate } from "@/types/schema";
import { Plus, Edit2, Trash2, Layout, Image as ImageIcon, Type } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const MOCK_TEMPLATES: MessageTemplate[] = [
  { id: "1", tenant_id: "t1", name: "来店予約完了", content_type: "text", content_json: "ご予約ありがとうございます...", created_at: "2024-01-01T10:00:00Z", updated_at: "2024-01-01T10:00:00Z" },
  { id: "2", tenant_id: "t1", name: "商品紹介カード", content_type: "card", content_json: {}, created_at: "2024-01-15T14:30:00Z", updated_at: "2024-01-15T14:30:00Z" },
  { id: "3", tenant_id: "t1", name: "クーポン画像", content_type: "image", content_json: {}, created_at: "2024-02-01T11:00:00Z", updated_at: "2024-02-01T11:00:00Z" },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>(MOCK_TEMPLATES);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", content: "" });

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
          <span className="font-medium">{item.name}</span>
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
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
          <Plus className="w-4 h-4" />
          新規作成
        </Button>
      }
    >
      <DataTable 
        data={templates} 
        columns={columns} 
        searchable 
        pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => {} }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新規テンプレート作成</DialogTitle>
            <DialogDescription>
              テンプレート名と内容を設定してください。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">テンプレート名</Label>
                <Input 
                  id="name" 
                  placeholder="例: 来店予約完了メッセージ" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">内容</Label>
                <Textarea 
                  id="content" 
                  placeholder="メッセージ内容を入力..." 
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                />
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
