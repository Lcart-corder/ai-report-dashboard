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
import { StepScenario } from "@/types/schema";
import { Plus, Edit2, Trash2, Zap, GitBranch } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const MOCK_SCENARIOS: StepScenario[] = [
  { id: "1", tenant_id: "t1", name: "友だち追加時あいさつ", is_active: true, trigger_type: "friend_added", nodes_json: {}, created_at: "2024-01-01T10:00:00Z" },
  { id: "2", tenant_id: "t1", name: "購入後フォローアップ", is_active: true, trigger_type: "tag_added", trigger_value: "購入者", nodes_json: {}, created_at: "2024-01-15T14:30:00Z" },
  { id: "3", tenant_id: "t1", name: "未購入者引き上げ", is_active: false, trigger_type: "tag_added", trigger_value: "カート落ち", nodes_json: {}, created_at: "2024-02-01T11:00:00Z" },
];

export default function StepPage() {
  const [scenarios, setScenarios] = useState<StepScenario[]>(MOCK_SCENARIOS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", trigger: "friend_added" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("シナリオ名を入力してください");
      return;
    }

    const newScenario: StepScenario = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "t1",
      name: formData.name,
      is_active: false,
      trigger_type: formData.trigger as any,
      nodes_json: {},
      created_at: new Date().toISOString(),
    };

    setScenarios([newScenario, ...scenarios]);
    toast.success("シナリオを作成しました");
    setIsDialogOpen(false);
    setFormData({ name: "", trigger: "friend_added" });
  };

  const toggleStatus = (id: string) => {
    setScenarios(scenarios.map(s => {
      if (s.id === id) {
        const newStatus = !s.is_active;
        toast.success(newStatus ? "シナリオを有効化しました" : "シナリオを停止しました");
        return { ...s, is_active: newStatus };
      }
      return s;
    }));
  };

  const columns = [
    {
      header: "シナリオ名",
      cell: (item: StepScenario) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
            <GitBranch className="w-4 h-4" />
          </div>
          <span className="font-medium">{item.name}</span>
        </div>
      ),
    },
    {
      header: "トリガー",
      cell: (item: StepScenario) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Zap className="w-3 h-3" />
          {item.trigger_type === "friend_added" ? "友だち追加時" : `タグ追加: ${item.trigger_value}`}
        </div>
      ),
    },
    {
      header: "ステータス",
      cell: (item: StepScenario) => (
        <div onClick={() => toggleStatus(item.id)} className="cursor-pointer">
          <StatusBadge 
            status={item.is_active ? "active" : "inactive"} 
            label={item.is_active ? "稼働中" : "停止中"}
          />
        </div>
      ),
    },
    {
      header: "作成日",
      cell: (item: StepScenario) => new Date(item.created_at).toLocaleDateString(),
    },
    {
      header: "操作",
      className: "text-right",
      cell: (item: StepScenario) => (
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
      title="ステップ配信" 
      description="友だち追加やタグ付与をきっかけに、あらかじめ設定したメッセージを順次配信します。"
      breadcrumbs={[{ label: "メッセージ" }, { label: "ステップ配信" }]}
      actions={
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
          <Plus className="w-4 h-4" />
          新規シナリオ作成
        </Button>
      }
    >
      <DataTable 
        data={scenarios} 
        columns={columns} 
        searchable 
        pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => {} }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新規シナリオ作成</DialogTitle>
            <DialogDescription>
              シナリオの開始条件を設定してください。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">シナリオ名</Label>
                <Input 
                  id="name" 
                  placeholder="例: 新規友だちあいさつ" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="trigger">開始トリガー</Label>
                <Select 
                  value={formData.trigger} 
                  onValueChange={(v) => setFormData({...formData, trigger: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="トリガーを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friend_added">友だち追加時</SelectItem>
                    <SelectItem value="tag_added">タグが付与された時</SelectItem>
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
