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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, StatusBadge } from "@/components/common/ui-kit";
import { FolderManager } from "@/components/common/folder-manager";
import { Folder } from "@/types/schema";
import { Plus, Edit2, Trash2, CalendarClock, Clock, Repeat, Users, Zap, History, Calendar } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const MOCK_FOLDERS: Folder[] = [
  { id: "f1", tenant_id: "t1", name: "定期配信", scope: "action_schedule", sort_order: 1, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "f2", tenant_id: "t1", name: "リマインダー", scope: "action_schedule", sort_order: 2, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

interface ActionConfig {
  type: "message" | "tag_add" | "tag_remove" | "update_field" | "rich_menu";
  message_content?: string;
  tag_ids?: string[];
  field_name?: string;
  field_value?: string;
  rich_menu_id?: string;
}

interface ActionSchedule {
  id: string;
  name: string;
  start_date: string;
  start_time: string;
  end_type: "none" | "date" | "count";
  end_date?: string;
  end_count?: number;
  repeat_type: "daily" | "weekly" | "monthly";
  repeat_interval: number;
  repeat_weekdays?: string[];
  repeat_monthly_type?: "day" | "last_day" | "weekday";
  folder_id?: string;
  is_active: boolean;
  actions: ActionConfig[];
  target_count: number;
  created_at: string;
  executions?: ScheduleExecution[];
}

interface ScheduleExecution {
  id: string;
  schedule_id: string;
  execute_date: string;
  execute_time: string;
  target_count: number;
  status: "pending" | "completed" | "skipped";
  executed_at?: string;
}

const MOCK_SCHEDULES: ActionSchedule[] = [
  { 
    id: "1", 
    name: "毎週月曜日の朝8時配信", 
    start_date: "2026-01-13", 
    start_time: "08:00",
    end_type: "none",
    repeat_type: "weekly",
    repeat_interval: 1,
    repeat_weekdays: ["月"],
    folder_id: "f1", 
    is_active: true, 
    target_count: 1250,
    created_at: "2024-01-01T10:00:00Z",
    actions: [{ type: "message", message_content: "毎週月曜日のお知らせです" }],
    executions: [
      { id: "e1", schedule_id: "1", execute_date: "2026-01-13", execute_time: "08:00", target_count: 1250, status: "pending" },
      { id: "e2", schedule_id: "1", execute_date: "2026-01-20", execute_time: "08:00", target_count: 1250, status: "pending" },
    ]
  },
  { 
    id: "2", 
    name: "毎月1日のキャンペーン告知", 
    start_date: "2026-02-01", 
    start_time: "10:00",
    end_type: "count",
    end_count: 12,
    repeat_type: "monthly",
    repeat_interval: 1,
    repeat_monthly_type: "day",
    folder_id: "f1", 
    is_active: true, 
    target_count: 3500,
    created_at: "2024-01-15T14:30:00Z",
    actions: [{ type: "message", message_content: "毎月のキャンペーン告知" }]
  },
];

const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"];

export default function ActionScheduleNewPage() {
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [schedules, setSchedules] = useState<ActionSchedule[]>(MOCK_SCHEDULES);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ActionSchedule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // フォーム状態
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    start_time: "08:00",
    end_type: "none" as "none" | "date" | "count",
    end_date: "",
    end_count: "1",
    repeat_type: "daily" as "daily" | "weekly" | "monthly",
    repeat_interval: "1",
    repeat_weekdays: [] as string[],
    repeat_monthly_type: "day" as "day" | "last_day" | "weekday",
  });

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
    if (!formData.name || !formData.start_date) {
      toast.error("スケジュール名と開始日時を入力してください");
      return;
    }

    const newSchedule: ActionSchedule = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      start_date: formData.start_date,
      start_time: formData.start_time,
      end_type: formData.end_type,
      end_date: formData.end_type === "date" ? formData.end_date : undefined,
      end_count: formData.end_type === "count" ? parseInt(formData.end_count) : undefined,
      repeat_type: formData.repeat_type,
      repeat_interval: parseInt(formData.repeat_interval),
      repeat_weekdays: formData.repeat_type === "weekly" ? formData.repeat_weekdays : undefined,
      repeat_monthly_type: formData.repeat_type === "monthly" ? formData.repeat_monthly_type : undefined,
      folder_id: selectedFolderId || undefined,
      is_active: true,
      target_count: 0,
      created_at: new Date().toISOString(),
      actions: [],
    };

    setSchedules([newSchedule, ...schedules]);
    toast.success("アクションスケジュールを作成しました");
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      start_date: "",
      start_time: "08:00",
      end_type: "none",
      end_date: "",
      end_count: "1",
      repeat_type: "daily",
      repeat_interval: "1",
      repeat_weekdays: [],
      repeat_monthly_type: "day",
    });
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

  const handleViewDetail = (schedule: ActionSchedule) => {
    setSelectedSchedule(schedule);
    setIsDetailDialogOpen(true);
  };

  const getRepeatText = (schedule: ActionSchedule) => {
    if (schedule.repeat_type === "daily") {
      return `${schedule.repeat_interval}日ごと`;
    } else if (schedule.repeat_type === "weekly") {
      return `${schedule.repeat_interval}週ごと（${schedule.repeat_weekdays?.join("・")}）`;
    } else {
      if (schedule.repeat_monthly_type === "day") {
        return `${schedule.repeat_interval}か月ごと（毎月${new Date(schedule.start_date).getDate()}日）`;
      } else if (schedule.repeat_monthly_type === "last_day") {
        return `${schedule.repeat_interval}か月ごと（毎月月末日）`;
      } else {
        return `${schedule.repeat_interval}か月ごと（第○×曜日）`;
      }
    }
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
      header: "開始日時",
      cell: (item: ActionSchedule) => (
        <div className="text-sm">
          <div>{item.start_date}</div>
          <div className="text-gray-500">{item.start_time}</div>
        </div>
      ),
    },
    {
      header: "繰り返し",
      cell: (item: ActionSchedule) => (
        <span className="text-sm text-gray-600">
          {getRepeatText(item)}
        </span>
      ),
    },
    {
      header: "終了設定",
      cell: (item: ActionSchedule) => (
        <span className="text-sm text-gray-600">
          {item.end_type === "none" && "無期限"}
          {item.end_type === "date" && `${item.end_date}まで`}
          {item.end_type === "count" && `${item.end_count}回`}
        </span>
      ),
    },
    {
      header: "対象数",
      cell: (item: ActionSchedule) => (
        <span className="text-sm font-medium">{item.target_count}人</span>
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
          <Button variant="ghost" size="sm" onClick={() => handleViewDetail(item)}>
            詳細
          </Button>
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
      description="友だちに対して一定の間隔で指定したアクションを実行できます。"
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

      {/* 作成ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>アクションスケジュール登録</DialogTitle>
            <DialogDescription>
              スケジュール設定を行います。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="grid gap-6 py-4">
              {/* スケジュール名 */}
              <div className="grid gap-2">
                <Label htmlFor="name">スケジュール名（管理用）</Label>
                <Input 
                  id="name" 
                  placeholder="例: 毎週月曜日の朝8時配信" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* 開始日時 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    開始日時
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start_date">開始日</Label>
                      <Input 
                        id="start_date" 
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="start_time">時刻</Label>
                      <Input 
                        id="start_time" 
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 繰り返し設定 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Repeat className="w-4 h-4" />
                    繰り返し設定
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="repeat_type">繰り返し</Label>
                      <Select 
                        value={formData.repeat_type} 
                        onValueChange={(v: any) => setFormData({...formData, repeat_type: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">日ごと</SelectItem>
                          <SelectItem value="weekly">週ごと</SelectItem>
                          <SelectItem value="monthly">か月ごと</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="repeat_interval">間隔</Label>
                      <Input 
                        id="repeat_interval" 
                        type="number"
                        min="1"
                        value={formData.repeat_interval}
                        onChange={(e) => setFormData({...formData, repeat_interval: e.target.value})}
                      />
                    </div>
                  </div>

                  {formData.repeat_type === "weekly" && (
                    <div className="grid gap-2">
                      <Label>曜日指定</Label>
                      <div className="flex gap-2">
                        {WEEKDAYS.map((day) => (
                          <div key={day} className="flex items-center space-x-2">
                            <Checkbox
                              id={`day-${day}`}
                              checked={formData.repeat_weekdays.includes(day)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    repeat_weekdays: [...formData.repeat_weekdays, day]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    repeat_weekdays: formData.repeat_weekdays.filter(d => d !== day)
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={`day-${day}`} className="cursor-pointer">{day}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.repeat_type === "monthly" && (
                    <div className="grid gap-2">
                      <Label htmlFor="repeat_monthly_type">月次設定</Label>
                      <Select 
                        value={formData.repeat_monthly_type} 
                        onValueChange={(v: any) => setFormData({...formData, repeat_monthly_type: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">毎月○日</SelectItem>
                          <SelectItem value="last_day">毎月月末日</SelectItem>
                          <SelectItem value="weekday">毎月第○×曜日</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 終了設定 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    終了設定
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="end_type">終了タイプ</Label>
                    <Select 
                      value={formData.end_type} 
                      onValueChange={(v: any) => setFormData({...formData, end_type: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">設定しない（無期限）</SelectItem>
                        <SelectItem value="date">日付指定</SelectItem>
                        <SelectItem value="count">回数指定</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.end_type === "date" && (
                    <div className="grid gap-2">
                      <Label htmlFor="end_date">終了日</Label>
                      <Input 
                        id="end_date" 
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      />
                    </div>
                  )}

                  {formData.end_type === "count" && (
                    <div className="grid gap-2">
                      <Label htmlFor="end_count">実行回数</Label>
                      <Input 
                        id="end_count" 
                        type="number"
                        min="1"
                        value={formData.end_count}
                        onChange={(e) => setFormData({...formData, end_count: e.target.value})}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* アクション設定 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    アクション設定
                  </CardTitle>
                  <CardDescription>
                    スケジュール実行時に行うアクションを設定します
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="action_type">アクションタイプ</Label>
                    <Select defaultValue="message">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="message">メッセージ送信</SelectItem>
                        <SelectItem value="tag_add">タグ追加</SelectItem>
                        <SelectItem value="tag_remove">タグ削除</SelectItem>
                        <SelectItem value="update_field">友だち情報更新</SelectItem>
                        <SelectItem value="rich_menu">リッチメニュー切り替え</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="message_content">メッセージ内容</Label>
                    <Textarea 
                      id="message_content" 
                      placeholder="送信するメッセージを入力してください"
                      rows={4}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ※ 現在はメッセージ送信のみ表示しています。他のアクションタイプを選択すると対応するフォームが表示されます。
                  </div>
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>キャンセル</Button>
              <Button type="submit" className="bg-[#06C755] hover:bg-[#05b34c] text-white">
                保存
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 詳細ダイアログ（実行予定・履歴） */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSchedule?.name}</DialogTitle>
            <DialogDescription>
              実行予定と履歴を確認できます
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="schedule">実行予定</TabsTrigger>
              <TabsTrigger value="history">実行履歴</TabsTrigger>
            </TabsList>
            <TabsContent value="schedule" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                今後実行されるアクションスケジュールの一覧です
              </div>
              {selectedSchedule?.executions?.filter(e => e.status === "pending").map((exec) => (
                <Card key={exec.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{exec.execute_date} {exec.execute_time}</div>
                        <div className="text-sm text-muted-foreground">対象: {exec.target_count}人</div>
                      </div>
                      <StatusBadge status="pending" label="予定" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!selectedSchedule?.executions || selectedSchedule.executions.filter(e => e.status === "pending").length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  実行予定はありません
                </div>
              )}
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                既に実行されたアクションスケジュールの一覧です
              </div>
              {selectedSchedule?.executions?.filter(e => e.status === "completed").map((exec) => (
                <Card key={exec.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{exec.execute_date} {exec.execute_time}</div>
                        <div className="text-sm text-muted-foreground">実行済: {exec.target_count}人</div>
                      </div>
                      <StatusBadge status="completed" label="完了" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!selectedSchedule?.executions || selectedSchedule.executions.filter(e => e.status === "completed").length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  実行履歴はありません
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
