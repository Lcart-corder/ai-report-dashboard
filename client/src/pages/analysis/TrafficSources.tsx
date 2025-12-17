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
import { TrafficSource } from "@/types/schema";
import { Plus, Edit2, Trash2, Link as LinkIcon, Copy, BarChart2 } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const MOCK_SOURCES: TrafficSource[] = [
  { 
    id: "1", 
    tenant_id: "t1", 
    name: "Instagramプロフィール", 
    code: "ig_prof", 
    url: "https://liff.line.me/1234567890-AbCdEfGh?param=ig_prof",
    actions_json: { add_tags: ["Instagram", "Organic"] },
    stats: { visits: 1240, friends_added: 350, blocks: 12, conversions: 45 },
    is_active: true, 
    created_at: "2024-01-01T10:00:00Z" 
  },
  { 
    id: "2", 
    tenant_id: "t1", 
    name: "春のキャンペーンLP", 
    code: "spring_lp", 
    url: "https://liff.line.me/1234567890-AbCdEfGh?param=spring_lp",
    actions_json: { add_tags: ["Campaign", "Spring2024"], start_scenario_id: "sc_123" },
    stats: { visits: 5600, friends_added: 890, blocks: 45, conversions: 120 },
    is_active: true, 
    created_at: "2024-02-15T14:30:00Z" 
  },
];

export default function TrafficSourcesPage() {
  const [sources, setSources] = useState<TrafficSource[]>(MOCK_SOURCES);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast.error("名称とパラメータコードを入力してください");
      return;
    }

    const newSource: TrafficSource = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "t1",
      name: formData.name,
      code: formData.code,
      url: `https://liff.line.me/1234567890-AbCdEfGh?param=${formData.code}`,
      actions_json: {},
      stats: { visits: 0, friends_added: 0, blocks: 0, conversions: 0 },
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setSources([newSource, ...sources]);
    toast.success("流入経路リンクを作成しました");
    setIsDialogOpen(false);
    setFormData({ name: "", code: "" });
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("リンクをコピーしました");
  };

  const columns = [
    {
      header: "名称 / コード",
      cell: (item: TrafficSource) => (
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-xs text-gray-500 font-mono">{item.code}</div>
        </div>
      ),
    },
    {
      header: "アクション",
      cell: (item: TrafficSource) => (
        <div className="flex flex-wrap gap-1">
          {item.actions_json.add_tags?.map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-xs rounded border border-blue-100">
              {tag}
            </span>
          ))}
          {item.actions_json.start_scenario_id && (
            <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-xs rounded border border-purple-100">
              シナリオ開始
            </span>
          )}
        </div>
      ),
    },
    {
      header: "アクセス数",
      accessorKey: "stats.visits" as any,
      cell: (item: TrafficSource) => item.stats.visits.toLocaleString(),
    },
    {
      header: "友だち追加",
      accessorKey: "stats.friends_added" as any,
      cell: (item: TrafficSource) => (
        <div className="flex items-center gap-1">
          <span>{item.stats.friends_added.toLocaleString()}</span>
          <span className="text-xs text-gray-400">
            ({((item.stats.friends_added / Math.max(item.stats.visits, 1)) * 100).toFixed(1)}%)
          </span>
        </div>
      ),
    },
    {
      header: "操作",
      className: "text-right",
      cell: (item: TrafficSource) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => copyLink(item.url)} title="リンクをコピー">
            <Copy className="w-4 h-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" title="詳細分析">
            <BarChart2 className="w-4 h-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" title="編集">
            <Edit2 className="w-4 h-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" className="text-red-500" title="削除">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTemplate 
      title="流入経路分析" 
      description="パラメータ付きリンクを発行し、友だち追加経路やキャンペーン効果を測定します。"
      breadcrumbs={[{ label: "分析" }, { label: "流入経路分析" }]}
      actions={
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
          <Plus className="w-4 h-4" />
          新規リンク作成
        </Button>
      }
    >
      <DataTable 
        data={sources} 
        columns={columns} 
        searchable 
        pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => {} }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新規流入経路リンク作成</DialogTitle>
            <DialogDescription>
              リンクの名称と識別用パラメータを設定してください。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">管理名称</Label>
                <Input 
                  id="name" 
                  placeholder="例: Instagramプロフィール" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">パラメータコード（英数字）</Label>
                <Input 
                  id="code" 
                  placeholder="例: ig_prof" 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                />
                <p className="text-xs text-gray-500">URLの一部として使用されます。重複しない値を設定してください。</p>
              </div>
              
              <div className="border-t pt-4 mt-2">
                <Label className="mb-2 block">アクション設定（任意）</Label>
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-500">
                  リンククリック時に実行するアクション（タグ付与、シナリオ開始など）は、作成後に詳細画面から設定できます。
                </div>
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
