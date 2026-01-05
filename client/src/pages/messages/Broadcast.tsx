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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, StatusBadge } from "@/components/common/ui-kit";
import { FolderManager } from "@/components/common/folder-manager";
import { Broadcast, Folder } from "@/types/schema";
import { Plus, Send, Clock, Edit2, Trash2, PlayCircle, Sparkles, X, Image, MessageSquare, LayoutGrid } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const MOCK_FOLDERS: Folder[] = [
  { id: "f1", tenant_id: "t1", name: "キャンペーン", scope: "broadcasts", sort_order: 1, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "f2", tenant_id: "t1", name: "定期配信", scope: "broadcasts", sort_order: 2, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

const MOCK_BROADCASTS: Broadcast[] = [
  { id: "1", tenant_id: "t1", name: "新春キャンペーン告知", folder_id: "f1", status: "sent", target_filter_json: {}, messages_json: [], sent_count: 2124, created_at: "2025-01-15T10:00:00Z", scheduled_at: "2025-01-15T10:00:00Z" },
  { id: "2", tenant_id: "t1", name: "2月セール予告", folder_id: "f1", status: "scheduled", target_filter_json: {}, messages_json: [], sent_count: 0, created_at: "2025-01-20T14:00:00Z", scheduled_at: "2025-02-01T09:00:00Z" },
  { id: "3", tenant_id: "t1", name: "未購入者向けクーポン", folder_id: undefined, status: "draft", target_filter_json: {}, messages_json: [], sent_count: 0, created_at: "2025-01-22T11:30:00Z" },
];

interface Message {
  id: string;
  type: 'text' | 'image' | 'carousel';
  content: string;
  imageUrl?: string;
}

export default function BroadcastPage() {
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(MOCK_BROADCASTS);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    senderName: "",
    schedule: "",
    targetFilter: "all" as "all" | "filtered"
  });
  
  // メッセージ管理
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", type: "text", content: "" }
  ]);

  // AI生成関連
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  // Folder Handlers
  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "t1",
      name,
      scope: "broadcasts",
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
    setBroadcasts(broadcasts.map(b => b.folder_id === id ? { ...b, folder_id: undefined } : b));
    toast.success("フォルダを削除しました");
  };

  // メッセージ操作
  const addMessage = (type: 'text' | 'image' | 'carousel') => {
    if (messages.length >= 5) {
      toast.error("メッセージは最大5つまでです");
      return;
    }
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: ""
    };
    setMessages([...messages, newMessage]);
  };

  const updateMessage = (id: string, content: string) => {
    setMessages(messages.map(m => m.id === id ? { ...m, content } : m));
  };

  const removeMessage = (id: string) => {
    if (messages.length === 1) {
      toast.error("最低1つのメッセージが必要です");
      return;
    }
    setMessages(messages.filter(m => m.id !== id));
  };

  // AI文章生成
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error("生成したい内容を入力してください");
      return;
    }

    setIsGenerating(true);
    try {
      // TODO: 実際のOpenAI API呼び出しに置き換える
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedText = `【${aiPrompt}】\n\nこんにちは！\n\n${aiPrompt}に関する特別なお知らせです。\n\n期間限定で特別価格にてご提供いたします。\nこの機会をお見逃しなく！\n\n詳細はこちら↓\nhttps://example.com`;
      
      if (selectedMessageId) {
        updateMessage(selectedMessageId, generatedText);
      }
      
      toast.success("AI文章を生成しました");
      setShowAiDialog(false);
      setAiPrompt("");
    } catch (error) {
      toast.error("文章生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("配信名を入力してください");
      return;
    }

    if (messages.every(m => !m.content.trim())) {
      toast.error("メッセージ内容を入力してください");
      return;
    }

    const newBroadcast: Broadcast = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "t1",
      name: formData.name,
      folder_id: selectedFolderId || undefined,
      status: formData.schedule ? "scheduled" : "draft",
      target_filter_json: {},
      messages_json: messages.map(m => ({ type: m.type, text: m.content, ...(m.imageUrl ? { imageUrl: m.imageUrl } : {}) })),
      sent_count: 0,
      created_at: new Date().toISOString(),
      scheduled_at: formData.schedule || undefined,
    };

    setBroadcasts([newBroadcast, ...broadcasts]);
    toast.success(formData.schedule ? "配信を予約しました" : "下書きを保存しました");
    setIsDialogOpen(false);
    setFormData({ name: "", senderName: "", schedule: "", targetFilter: "all" });
    setMessages([{ id: "1", type: "text", content: "" }]);
  };

  const handleTestSend = () => {
    toast.success("テスト送信を実行しました", {
      description: "あなたのLINEアカウントにテストメッセージを送信しました。"
    });
  };

  const filteredBroadcasts = selectedFolderId
    ? broadcasts.filter(b => b.folder_id === selectedFolderId)
    : broadcasts;

  const columns = [
    {
      header: "配信名",
      cell: (item: Broadcast) => (
        <div>
          <div className="font-medium">{item.name}</div>
          {item.folder_id && (
            <span className="text-xs text-gray-400 block mt-1">
              {folders.find(f => f.id === item.folder_id)?.name}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "ステータス",
      cell: (item: Broadcast) => <StatusBadge status={item.status} />,
    },
    {
      header: "配信日時",
      cell: (item: Broadcast) => item.scheduled_at ? new Date(item.scheduled_at).toLocaleString() : "-",
    },
    {
      header: "配信数",
      accessorKey: "sent_count" as keyof Broadcast,
      cell: (item: Broadcast) => item.status === "sent" ? `${item.sent_count}通` : "-",
    },
    {
      header: "操作",
      className: "text-right",
      cell: (item: Broadcast) => (
        <div className="flex justify-end gap-2">
          {item.status === "draft" && (
            <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(true)}>
              <Edit2 className="w-4 h-4 text-gray-500" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="text-red-500">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTemplate 
      title="一斉配信" 
      description="友だち全員または条件で絞り込んでメッセージを一斉送信します。"
      breadcrumbs={[{ label: "メッセージ" }, { label: "一斉配信" }]}
      actions={
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
          <Plus className="w-4 h-4" />
          新規配信作成
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
              data={filteredBroadcasts} 
              columns={columns} 
              searchable 
              pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => {} }}
            />
          </div>
        </div>
      </div>

      {/* メイン配信作成ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新規メッセージ配信</DialogTitle>
            <DialogDescription>
              配信内容と対象を設定してください。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">基本設定</TabsTrigger>
                <TabsTrigger value="message">メッセージ</TabsTrigger>
                <TabsTrigger value="advanced">詳細設定</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">配信管理名 <span className="text-red-500">*</span></Label>
                  <Input 
                    id="name" 
                    placeholder="例: 3月セール告知" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="senderName">送信者名</Label>
                  <Input 
                    id="senderName" 
                    placeholder="例: カスタマーサポート" 
                    value={formData.senderName}
                    onChange={(e) => setFormData({...formData, senderName: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">空欄の場合はLINE公式アカウント名が表示されます</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="schedule">配信タイミング</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <Input 
                      id="schedule" 
                      type="datetime-local" 
                      className="w-auto"
                      value={formData.schedule}
                      onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                    />
                  </div>
                  <p className="text-xs text-gray-500">空欄の場合は登録後すぐに配信されます</p>
                </div>

                <div className="grid gap-2">
                  <Label>配信先絞り込み</Label>
                  <Select value={formData.targetFilter} onValueChange={(value: any) => setFormData({...formData, targetFilter: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべての友だち</SelectItem>
                      <SelectItem value="filtered">絞り込み</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.targetFilter === "filtered" && (
                    <div className="border rounded-md p-3 bg-gray-50 text-sm text-gray-600">
                      タグ、友だち情報、行動履歴などで絞り込み条件を設定できます。
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="message" className="space-y-4 py-4">
                <div className="flex justify-between items-center">
                  <Label>メッセージ内容（最大5つ）</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => addMessage('text')} className="gap-2">
                      <MessageSquare className="w-3 h-3" />
                      テキスト
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => addMessage('image')} className="gap-2">
                      <Image className="w-3 h-3" />
                      画像
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => addMessage('carousel')} className="gap-2">
                      <LayoutGrid className="w-3 h-3" />
                      カルーセル
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={message.id} className="border rounded-md p-4 bg-gray-50 relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {index + 1}つ目の吹き出し ({message.type === 'text' ? 'テキスト' : message.type === 'image' ? '画像' : 'カルーセル'})
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedMessageId(message.id);
                              setShowAiDialog(true);
                            }}
                            className="gap-2 text-purple-600 hover:text-purple-700"
                          >
                            <Sparkles className="w-3 h-3" />
                            AI生成
                          </Button>
                          {messages.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeMessage(message.id)}
                              className="h-8 w-8"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {message.type === 'text' && (
                        <Textarea 
                          placeholder="ここにメッセージを入力..." 
                          className="min-h-[120px] bg-white"
                          value={message.content}
                          onChange={(e) => updateMessage(message.id, e.target.value)}
                        />
                      )}
                      
                      {message.type === 'image' && (
                        <div className="space-y-2">
                          <Input 
                            placeholder="画像URLを入力..." 
                            className="bg-white"
                            value={message.imageUrl || ""}
                            onChange={(e) => setMessages(messages.map(m => m.id === message.id ? { ...m, imageUrl: e.target.value } : m))}
                          />
                          <Textarea 
                            placeholder="画像の説明（オプション）" 
                            className="min-h-[60px] bg-white"
                            value={message.content}
                            onChange={(e) => updateMessage(message.id, e.target.value)}
                          />
                        </div>
                      )}
                      
                      {message.type === 'carousel' && (
                        <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                          カルーセル設定は別途テンプレート作成画面で作成してください。
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mt-2">文字数: {message.content.length}</div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={handleTestSend} className="gap-2">
                    <PlayCircle className="w-3 h-3" />
                    テスト送信
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 py-4">
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2 text-sm">除外条件設定</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="exclude_blocked" defaultChecked />
                        <Label htmlFor="exclude_blocked" className="text-sm font-normal">ブロック中のユーザーを除外</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="exclude_recent" />
                        <Label htmlFor="exclude_recent" className="text-sm font-normal">24時間以内にメッセージを送信したユーザーを除外</Label>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2 text-sm">配信後アクション</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="action_tag" />
                        <Label htmlFor="action_tag" className="text-sm font-normal">配信完了時にタグを付与する</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="action_notify" />
                        <Label htmlFor="action_notify" className="text-sm font-normal">管理者に完了通知を送る</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="action_richmenu" />
                        <Label htmlFor="action_richmenu" className="text-sm font-normal">リッチメニューを変更する</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>キャンセル</Button>
              <Button type="button" variant="outline" onClick={handleCreate}>下書き保存</Button>
              <Button type="submit" className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
                <Send className="w-4 h-4" />
                {formData.schedule ? "予約する" : "配信する"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI文章生成ダイアログ */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI文章自動生成
            </DialogTitle>
            <DialogDescription>
              配信の目的や内容を入力すると、AIが適切な文章を生成します。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">生成したい内容</Label>
              <Textarea
                id="ai-prompt"
                placeholder="例: 春の新商品セールのお知らせ"
                className="min-h-[100px]"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-md p-3 text-sm text-purple-800">
              <p className="font-medium mb-1">💡 ヒント</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>配信の目的を具体的に記載してください</li>
                <li>ターゲットや訴求ポイントを含めるとより効果的です</li>
                <li>生成後に編集・調整が可能です</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowAiDialog(false)}>キャンセル</Button>
            <Button 
              type="button" 
              onClick={handleAiGenerate} 
              disabled={isGenerating}
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  生成する
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
