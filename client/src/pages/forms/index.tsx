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
import { DataTable, StatusBadge } from "@/components/common/ui-kit";
import { Form } from "@/types/schema";
import { Plus, Edit2, Trash2, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

// Mock Data
const MOCK_FORMS: Form[] = [
  { id: "1", tenant_id: "t1", title: "来店アンケート", description: "サービス向上のため...", fields_json: [], is_active: true, response_count: 45, created_at: "2024-01-01T10:00:00Z" },
  { id: "2", tenant_id: "t1", title: "キャンペーン応募", description: "抽選で...", fields_json: [], is_active: true, response_count: 128, created_at: "2024-01-15T14:30:00Z" },
  { id: "3", tenant_id: "t1", title: "お問い合わせ", description: "", fields_json: [], is_active: false, response_count: 12, created_at: "2024-02-01T11:00:00Z" },
];

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>(MOCK_FORMS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });

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
      <DataTable 
        data={forms} 
        columns={columns} 
        searchable 
        pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => {} }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新規フォーム作成</DialogTitle>
            <DialogDescription>
              フォームの基本情報を入力してください。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="grid gap-4 py-4">
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
                <Input 
                  id="description" 
                  placeholder="フォームの説明を入力..." 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
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
