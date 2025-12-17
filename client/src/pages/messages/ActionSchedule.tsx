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
import { Plus, Edit2, Trash2, CalendarClock } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const MOCK_FOLDERS: Folder[] = [
  { id: "f1", tenant_id: "t1", name: "リマインダー", scope: "action_schedule", sort_order: 1, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "f2", tenant_id: "t1", name: "フォローアップ", scope: "action_schedule", sort_order: 2, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

interface ActionSchedule {
  id: string;
  name: string;
  trigger_type: "tag_added" | "friend_added" | "form_submitted";
  action_type: "send_message" | "add_tag" | "notify_admin";
  delay_minutes: number;
  folder_id?: string;
  is_active: boolean;
  created_at: string;
}

const MOCK_SCHEDULES: ActionSchedule[] = [
  { id: "1", name: "来店翌日のお礼", trigger_type: "tag_added", action_type: "send_message", delay_minutes: 1440, folder_id: "f1", is_active: true, created_at: "2024-01-01T10:00:00Z" },
  { id: "2", name: "登録3日後のクーポン", trigger_type: "friend_added", action_type: "send_message", delay_minutes: 4320, folder_id: "f2", is_active: true, created_at: "2024-01-15T14:30:00Z" },
  { id: "3", name: "アンケート回答通知", trigger_type: "form_submitted", action_type: "notify_admin", delay_minutes: 0, folder_id: "f2", is_active: true, created_at: "2024-02-01T11:00:00Z" },
];

export default function ActionSchedulePage() {
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [schedules, setSchedules] = useState<ActionSchedule[]>(MOCK_SCHEDULES);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", trigger: "tag_added", action: "send_message", delay: "0" });

  // Folder Handlers
  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "t1",
      name,
      scope: "action_schedule",
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
    setSchedules(schedules.map(s => s.folder_id === id ? { ...s, folder_id: undefined } : s));
    toast.success("フォルダを削除しました");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("スケジュール名を入力してください");
      return;
    }

    const newSchedule: ActionSchedule = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      trigger_type: formData.trigger as any,
      action_type: formData.action as any,
      delay_minutes: parseInt(formData.delay) || 0,
      folder_id: selectedFolderId || undefined,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setSchedules([newSchedule, ...schedules]);
    toast.success("アクションスケジュールを作成しました");
    setIsDialogOpen(false);
    setFormData({ name: "", trigger: "tag_added", action: "send_message", delay: "0" });
  };

  const toggleStatus = (id: string) => {
    setSchedules(schedules.map(s => {
      if (s.id === id) {
        const newStatus = !s.is_active;
        toast.success(newStatus ? "スケジュールを有効化しました" : "スケジュールを停止しました");
        return { ...s, is_active: newStatus };
      }
      return s;
    }));
  };

  const filteredSchedules = selectedFolderId
    ? schedules.filter(s => s.folder_id === selectedFolderId)
    : schedules;

  const columns = [
    {
      header: "スケジュール名",
      cell: (item: ActionSchedule) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium">{item.name}</div>
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
      header: "トリガー",
      cell: (item: ActionSchedule) => (
        <span className="text-sm text-gray-600">
          {item.trigger_type === "tag_added" && "タグ付与時"}
          {item.trigger_type === "friend_added" && "友だち追加時"}
          {item.trigger_type === "form_submitted" && "フォーム回答時"}
        </span>
      ),
    },
    {
      header: "実行アクション",
      cell: (item: ActionSchedule) => (
        <span className="text-sm text-gray-600">
          {item.action_type === "send_message" && "メッセージ送信"}
          {item.action_type === "add_tag" && "タグ付与"}
          {item.action_type === "notify_admin" && "管理者通知"}
        </span>
      ),
    },
    {
      header: "実行タイミング",
      cell: (item: ActionSchedule) => (
        <span className="text-sm text-gray-600">
          {item.delay_minutes === 0 ? "即時" : `${Math.floor(item.delay_minutes / 60)}時間${item.delay_minutes % 60}分後`}
        </span>
      ),
    },
    {
      header: "ステータス",
      cell: (item: ActionSchedule) => (
        <div onClick={() => toggleStatus(item.id)} className="cursor-pointer">
          <StatusBadge status={item.is_active ? "active" : "inactive"} label={item.is_active ? "稼働中" : "停止中"} />
        </div>
      ),
    },
    {
      header: "操作",
      className: "text-right",
      cell: (item: ActionSchedule) => (
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
      title="アクションスケジュール" 
      description="特定の条件（トリガー）に基づいて、指定した時間後にアクションを自動実行します。"
      breadcrumbs={[{ label: "メッセージ" }, { label: "アクションスケジュール" }]}
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
              data={filteredSchedules} 
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
            <DialogTitle>新規スケジュール作成</DialogTitle>
            <DialogDescription>
              トリガー条件と実行するアクションを設定してください。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">スケジュール名</Label>
                <Input 
                  id="name" 
                  placeholder="例: 来店翌日のお礼" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="trigger">トリガー条件</Label>
                <Select 
                  value={formData.trigger} 
                  onValueChange={(v) => setFormData({...formData, trigger: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tag_added">タグが付与された時</SelectItem>
                    <SelectItem value="friend_added">友だち追加された時</SelectItem>
                    <SelectItem value="form_submitted">フォームが回答された時</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="delay">実行タイミング（分後）</Label>
                <Input 
                  id="delay" 
                  type="number"
                  min="0"
                  placeholder="0（即時）" 
                  value={formData.delay}
                  onChange={(e) => setFormData({...formData, delay: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="action">実行アクション</Label>
                <Select 
                  value={formData.action} 
                  onValueChange={(v) => setFormData({...formData, action: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="send_message">メッセージを送信</SelectItem>
                    <SelectItem value="add_tag">タグを付与</SelectItem>
                    <SelectItem value="notify_admin">管理者に通知</SelectItem>
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
