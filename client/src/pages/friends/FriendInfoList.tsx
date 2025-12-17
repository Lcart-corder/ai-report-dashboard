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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, StatusBadge } from "@/components/common/ui-kit";
import { FolderManager } from "@/components/common/folder-manager";
import { ActionBuilder } from "@/components/actions/ActionBuilder";
import { Folder, ActionSetStep } from "@/types/schema";
import { Plus, Edit2, Trash2, Database, AlertTriangle, PlusCircle, X } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const MOCK_FOLDERS: Folder[] = [
  { id: "f1", tenant_id: "t1", name: "基本情報", scope: "friend_info", sort_order: 1, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "f2", tenant_id: "t1", name: "アンケート回答", scope: "friend_info", sort_order: 2, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

interface FriendInfoOption {
  label: string;
  value: string;
  actions?: ActionSetStep[];
}

interface FriendInfo {
  id: string;
  name: string;
  key: string;
  type: "text" | "number" | "date" | "select";
  options?: FriendInfoOption[];
  folder_id?: string;
  is_active: boolean;
  created_at: string;
}

const MOCK_INFOS: FriendInfo[] = [
  { id: "1", name: "氏名", key: "full_name", type: "text", folder_id: "f1", is_active: true, created_at: "2024-01-01T10:00:00Z" },
  { id: "2", name: "電話番号", key: "phone", type: "text", folder_id: "f1", is_active: true, created_at: "2024-01-01T10:00:00Z" },
  { id: "3", name: "生年月日", key: "birthday", type: "date", folder_id: "f1", is_active: true, created_at: "2024-01-01T10:00:00Z" },
  { 
    id: "4", 
    name: "来店きっかけ", 
    key: "source", 
    type: "select", 
    folder_id: "f2", 
    is_active: true, 
    created_at: "2024-02-01T11:00:00Z",
    options: [
      { label: "Instagram", value: "instagram" },
      { label: "知人の紹介", value: "referral" },
      { label: "Web検索", value: "search" }
    ]
  },
  { id: "5", name: "興味のある商品", key: "interest", type: "select", folder_id: "f2", is_active: true, created_at: "2024-02-01T11:00:00Z" },
];

export default function FriendInfoListPage() {
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [infos, setInfos] = useState<FriendInfo[]>(MOCK_INFOS);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState<FriendInfo | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: "", key: "", type: "text" });
  const [options, setOptions] = useState<FriendInfoOption[]>([{ label: "", value: "" }]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);

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

  const handleOpenDialog = (info?: FriendInfo) => {
    if (info) {
      setEditingInfo(info);
      setFormData({ name: info.name, key: info.key, type: info.type });
      setOptions(info.options || [{ label: "", value: "" }]);
    } else {
      setEditingInfo(null);
      setFormData({ name: "", key: "", type: "text" });
      setOptions([{ label: "", value: "" }]);
    }
    setSelectedOptionIndex(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.key) {
      toast.error("項目名とキーを入力してください");
      return;
    }

    if (formData.type === "select") {
      const validOptions = options.filter(o => o.label && o.value);
      if (validOptions.length === 0) {
        toast.error("選択肢を少なくとも1つ設定してください");
        return;
      }
    }

    if (editingInfo) {
      // Update
      setInfos(infos.map(i => i.id === editingInfo.id ? {
        ...i,
        ...formData,
        type: formData.type as any,
        options: formData.type === "select" ? options : undefined
      } : i));
      toast.success("友だち情報項目を更新しました");
    } else {
      // Create
      const newInfo: FriendInfo = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        key: formData.key,
        type: formData.type as any,
        folder_id: selectedFolderId || undefined,
        is_active: true,
        created_at: new Date().toISOString(),
        options: formData.type === "select" ? options : undefined
      };
      setInfos([newInfo, ...infos]);
      toast.success("友だち情報項目を作成しました");
    }
    setIsDialogOpen(false);
  };

  const handleAddOption = () => {
    setOptions([...options, { label: "", value: "" }]);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
    if (selectedOptionIndex === index) {
      setSelectedOptionIndex(null);
    }
  };

  const handleOptionChange = (index: number, field: keyof FriendInfoOption, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleOptionActionsChange = (actions: ActionSetStep[]) => {
    if (selectedOptionIndex === null) return;
    const newOptions = [...options];
    newOptions[selectedOptionIndex] = { ...newOptions[selectedOptionIndex], actions };
    setOptions(newOptions);
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
          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
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
        <Button onClick={() => handleOpenDialog()} className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
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
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>{editingInfo ? "項目を編集" : "新規項目作成"}</DialogTitle>
            <DialogDescription>
              友だち情報の項目名とデータ型を設定してください。
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="basic">基本設定</TabsTrigger>
                <TabsTrigger value="actions" disabled={formData.type !== "select"}>
                  アクション設定 {formData.type !== "select" && "(選択肢のみ)"}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid gap-4">
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

                  {formData.type === "select" && (
                    <div className="border rounded-lg p-4 bg-slate-50">
                      <div className="flex items-center justify-between mb-2">
                        <Label>選択肢の設定</Label>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                          <PlusCircle className="w-4 h-4 mr-1" />
                          選択肢を追加
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {options.map((option, index) => (
                          <div key={index} className="flex gap-2 items-start">
                            <div className="grid gap-1 flex-1">
                              <Input 
                                placeholder="表示ラベル" 
                                value={option.label}
                                onChange={(e) => handleOptionChange(index, "label", e.target.value)}
                              />
                            </div>
                            <div className="grid gap-1 flex-1">
                              <Input 
                                placeholder="保存値" 
                                value={option.value}
                                onChange={(e) => handleOptionChange(index, "value", e.target.value)}
                              />
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 mt-1"
                              onClick={() => handleRemoveOption(index)}
                              disabled={options.length === 1}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="actions" className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3 text-sm text-amber-800 mb-4">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold mb-1">アクション実行の注意点</p>
                    <p>ここで設定したアクションは、<span className="font-bold">「この選択肢が選ばれたタイミング」</span>でのみ実行されます。</p>
                  </div>
                </div>

                <div className="flex h-[500px] border rounded-lg overflow-hidden">
                  {/* Option List */}
                  <div className="w-1/3 border-r bg-slate-50 p-4 overflow-y-auto">
                    <h3 className="font-medium mb-3 text-sm text-slate-500">選択肢一覧</h3>
                    <div className="space-y-2">
                      {options.map((option, index) => (
                        <div 
                          key={index}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedOptionIndex === index 
                              ? "bg-white border-blue-500 shadow-sm ring-1 ring-blue-500" 
                              : "bg-white border-slate-200 hover:border-blue-300"
                          }`}
                          onClick={() => setSelectedOptionIndex(index)}
                        >
                          <div className="font-medium">{option.label || "(未設定)"}</div>
                          <div className="text-xs text-slate-500">{option.value}</div>
                          {option.actions && option.actions.length > 0 && (
                            <div className="mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded inline-block">
                              {option.actions.length}個のアクション
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Builder */}
                  <div className="flex-1 bg-white">
                    {selectedOptionIndex !== null ? (
                      <div className="h-full flex flex-col">
                        <div className="p-4 border-b bg-slate-50">
                          <h3 className="font-bold">
                            「{options[selectedOptionIndex].label}」選択時のアクション
                          </h3>
                        </div>
                        <div className="flex-1 overflow-hidden p-4">
                          <ActionBuilder 
                            mode="inline"
                            actions={options[selectedOptionIndex].actions || []}
                            onChange={handleOptionActionsChange}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400">
                        左側から選択肢を選んでください
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="px-6 py-4 border-t mt-auto">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>キャンセル</Button>
            <Button type="button" onClick={handleSubmit} className="bg-[#06C755] hover:bg-[#05b34c] text-white">
              {editingInfo ? "更新する" : "作成する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
