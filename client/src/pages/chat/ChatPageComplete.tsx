import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Filter,
  CheckCheck,
  Bookmark,
  Tag,
  UserCircle,
  Send,
  Paperclip,
  Settings,
  MoreVertical,
  Star,
  Ban,
  EyeOff,
  Image,
  FileText,
  Smile,
  Clock,
  Share2,
  Edit,
  X,
  Plus,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Friend {
  id: string;
  name: string;
  lineName: string;
  systemName: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  bookmarked: boolean;
  status: string;
  tags: string[];
  addedDate: string;
  friendType: "new" | "existing";
  inflowRoute: string;
  stepDelivery: string;
  richMenu: string;
  friendInfo: Record<string, string>;
  formResponses: any[];
  memo: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: "sent" | "received";
  trigger?: {
    feature: string;
    name: string;
    detail: string;
    datetime: string;
  };
}

export default function ChatPageComplete() {
  const [friends] = useState<Friend[]>([
    {
      id: "1",
      name: "山田太郎",
      lineName: "Taro Y",
      systemName: "山田太郎",
      avatar: "",
      lastMessage: "ありがとうございます！",
      lastMessageTime: "10:30",
      unread: true,
      bookmarked: false,
      status: "対応中",
      tags: ["VIP", "リピーター"],
      addedDate: "2026-01-05",
      friendType: "new",
      inflowRoute: "店舗来店キャンペーン",
      stepDelivery: "ウェルカムメッセージ（3/5）",
      richMenu: "メインメニュー",
      friendInfo: {
        email: "yamada@example.com",
        phone: "090-1234-5678",
      },
      formResponses: [],
      memo: "VIP顧客、定期的に来店",
    },
    {
      id: "2",
      name: "佐藤花子",
      lineName: "Hanako S",
      systemName: "佐藤花子",
      avatar: "",
      lastMessage: "予約の変更をお願いします",
      lastMessageTime: "09:15",
      unread: true,
      bookmarked: true,
      status: "予約済み",
      tags: ["予約済み"],
      addedDate: "2025-12-20",
      friendType: "existing",
      inflowRoute: "通常友だち追加",
      stepDelivery: "なし",
      richMenu: "予約メニュー",
      friendInfo: {
        email: "sato@example.com",
      },
      formResponses: [],
      memo: "",
    },
  ]);

  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(friends[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: "1",
      senderName: "山田太郎",
      content: "こんにちは、予約について質問があります",
      timestamp: "10:25",
      type: "received",
    },
    {
      id: "2",
      senderId: "system",
      senderName: "サポート",
      content: "ご質問ありがとうございます。どのようなご質問でしょうか？",
      timestamp: "10:26",
      type: "sent",
      trigger: {
        feature: "自動応答",
        name: "予約関連キーワード",
        detail: "キーワード「予約」に反応",
        datetime: "2026-01-10 10:26:00",
      },
    },
    {
      id: "3",
      senderId: "1",
      senderName: "山田太郎",
      content: "ありがとうございます！",
      timestamp: "10:30",
      type: "received",
    },
  ]);

  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showSendOptions, setShowSendOptions] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sendUserName, setSendUserName] = useState("サポート担当");
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "system",
      senderName: sendUserName,
      content: messageInput,
      timestamp: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      type: "sent",
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");
    setShowAISuggestions(false);
    toast.success("メッセージを送信しました");
  };

  const handleGenerateAISuggestions = async () => {
    setShowAISuggestions(true);
    // AI返信候補を生成（シミュレーション）
    const suggestions = [
      "承知いたしました。予約の変更を承ります。ご希望の日時をお教えいただけますでしょうか？",
      "ご連絡ありがとうございます。予約変更の件、対応させていただきます。",
      "お問い合わせありがとうございます。予約変更につきまして、詳細をお伺いできますでしょうか？",
    ];
    setAiSuggestions(suggestions);
  };

  const handleSelectAISuggestion = (suggestion: string) => {
    setMessageInput(suggestion);
    setShowAISuggestions(false);
  };

  const handleMarkAsRead = () => {
    toast.success("確認済みに変更しました");
  };

  const handleToggleBookmark = () => {
    toast.success(selectedFriend?.bookmarked ? "ブックマークを解除しました" : "ブックマークしました");
  };

  const handleCopyShareLink = () => {
    toast.success("共有リンクをコピーしました");
  };

  const filteredFriends = friends.filter((friend) => {
    if (filterType === "unread" && !friend.unread) return false;
    if (filterType === "read" && friend.unread) return false;
    if (filterType === "bookmarked" && !friend.bookmarked) return false;
    if (searchQuery && !friend.name.includes(searchQuery) && !friend.lineName.includes(searchQuery))
      return false;
    if (selectedTags.length > 0 && !selectedTags.some((tag) => friend.tags.includes(tag))) return false;
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(friend.status)) return false;
    return true;
  });

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* 左側：友だち一覧 */}
      <div className="w-80 border-r flex flex-col bg-gray-50">
        {/* ヘッダー */}
        <div className="p-4 border-b bg-white space-y-3">
          <div className="flex items-center justify-between">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全ての友だち（非表示除く）</SelectItem>
                <SelectItem value="unread">未確認</SelectItem>
                <SelectItem value="read">確認済み</SelectItem>
                <SelectItem value="hidden">非表示中</SelectItem>
                <SelectItem value="bookmarked">ブックマーク</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilterDialog(true)}
              >
                <Filter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => toast.success("全て確認済みに変更しました")}>
                <CheckCheck className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="友だちを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 友だちリスト */}
        <ScrollArea className="flex-1">
          {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                selectedFriend?.id === friend.id ? "bg-blue-50" : "bg-white"
              }`}
              onClick={() => setSelectedFriend(friend)}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={friend.avatar} />
                    <AvatarFallback>{friend.name[0]}</AvatarFallback>
                  </Avatar>
                  {friend.unread && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                      1
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{friend.name}</span>
                      {friend.bookmarked && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                    </div>
                    <span className="text-xs text-gray-500">{friend.lastMessageTime}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{friend.lastMessage}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {friend.status && (
                      <Badge variant="outline" className="text-xs">
                        {friend.status}
                      </Badge>
                    )}
                    {friend.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>

        {/* 送信ユーザー名 */}
        <div className="p-3 border-t bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{sendUserName}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => toast.info("送信ユーザー名設定")}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 中央：チャット画面 */}
      <div className="flex-1 flex flex-col">
        {selectedFriend ? (
          <>
            {/* チャットヘッダー */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">{selectedFriend.lineName}</h2>
                <Button variant="ghost" size="icon" onClick={handleToggleBookmark}>
                  <Star
                    className={`w-4 h-4 ${
                      selectedFriend.bookmarked ? "fill-yellow-400 text-yellow-400" : ""
                    }`}
                  />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleCopyShareLink}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedFriend.status} onValueChange={(value) => toast.success(`対応ステータスを「${value}」に変更しました`)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="対応ステータス" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="対応中">対応中</SelectItem>
                    <SelectItem value="予約済み">予約済み</SelectItem>
                    <SelectItem value="クレーム">クレーム</SelectItem>
                    <SelectItem value="完了">完了</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* メッセージエリア */}
            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "sent" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        message.type === "sent" ? "bg-blue-500 text-white" : "bg-white"
                      } rounded-lg p-3 shadow-sm group relative`}
                    >
                      {message.type === "received" && (
                        <p className="text-xs text-gray-500 mb-1">{message.senderName}</p>
                      )}
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs ${message.type === "sent" ? "text-blue-100" : "text-gray-400"}`}>
                          {message.timestamp}
                        </span>
                        {message.type === "sent" && message.trigger && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 h-6 px-2 text-xs"
                            onClick={() => toast.info(`送信トリガー: ${message.trigger?.feature} - ${message.trigger?.name}`)}
                          >
                            詳細情報
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* AI返信候補 */}
            {showAISuggestions && aiSuggestions.length > 0 && (
              <div className="border-t bg-blue-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">AI返信候補</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowAISuggestions(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <Card
                      key={index}
                      className="cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => handleSelectAISuggestion(suggestion)}
                    >
                      <CardContent className="p-3">
                        <p className="text-sm">{suggestion}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* メッセージ入力エリア */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Button variant="outline" size="sm" onClick={() => setShowSendOptions(!showSendOptions)}>
                  送信オプション
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600"
                  onClick={handleGenerateAISuggestions}
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  AI返信候補
                </Button>
              </div>

              {showSendOptions && (
                <div className="flex flex-wrap gap-2 mb-3">
                  <Button variant="outline" size="sm">
                    <Image className="w-4 h-4 mr-1" />
                    メディア送信
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-1" />
                    テンプレート
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-1" />
                    PDF送信
                  </Button>
                  <Button variant="outline" size="sm">
                    <Smile className="w-4 h-4 mr-1" />
                    スタンプ
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-1" />
                    アクション
                  </Button>
                  <Button variant="outline" size="sm">
                    <Clock className="w-4 h-4 mr-1" />
                    送信予約
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Textarea
                  placeholder="メッセージを入力..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 min-h-[80px]"
                />
                <div className="flex flex-col gap-2">
                  <Button variant="ghost" size="icon">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleSendMessage} className="flex-1">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-2">
                <Button variant="ghost" size="sm" onClick={() => toast.info("非表示にしました")}>
                  <EyeOff className="w-4 h-4 mr-1" />
                  非表示
                </Button>
                <Button variant="ghost" size="sm" onClick={handleMarkAsRead}>
                  <CheckCheck className="w-4 h-4 mr-1" />
                  {selectedFriend.unread ? "確認済みにする" : "未確認にする"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            友だちを選択してください
          </div>
        )}
      </div>

      {/* 右側：友だち情報パネル */}
      {selectedFriend && (
        <div className="w-80 border-l bg-white">
          <Tabs defaultValue="basic" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">基本</TabsTrigger>
              <TabsTrigger value="info">情報</TabsTrigger>
              <TabsTrigger value="tags">タグ</TabsTrigger>
              <TabsTrigger value="memo">メモ</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <TabsContent value="basic" className="p-4 space-y-4 mt-0">
                <div className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-3">
                    <AvatarImage src={selectedFriend.avatar} />
                    <AvatarFallback className="text-2xl">{selectedFriend.name[0]}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{selectedFriend.lineName}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedFriend.addedDate} · {selectedFriend.friendType === "new" ? "新規友だち" : "既存友だち"}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500">システム表示名</Label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm">{selectedFriend.systemName}</span>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">流入経路</Label>
                    <p className="text-sm mt-1">{selectedFriend.inflowRoute}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">ステップ配信</Label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm">{selectedFriend.stepDelivery}</span>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">リッチメニュー</Label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm">{selectedFriend.richMenu}</span>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="info" className="p-4 space-y-3 mt-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">友だち情報</h4>
                  <Button variant="ghost" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
                {Object.entries(selectedFriend.friendInfo).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">{key}</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-1" />
                  友だち情報を追加
                </Button>
              </TabsContent>

              <TabsContent value="tags" className="p-4 space-y-3 mt-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">タグ管理</h4>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedFriend.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => toast.success(`タグ「${tag}」を削除しました`)} />
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-1" />
                  タグを追加
                </Button>
              </TabsContent>

              <TabsContent value="memo" className="p-4 space-y-3 mt-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">メモ</h4>
                </div>
                <Textarea
                  placeholder="メモを入力..."
                  value={selectedFriend.memo}
                  className="min-h-[200px]"
                />
                <Button size="sm" className="w-full">
                  保存
                </Button>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      )}

      {/* 絞り込みダイアログ */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>絞り込み</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>タグ</Label>
              <div className="space-y-2 mt-2">
                {["VIP", "リピーター", "予約済み", "新規"].map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTags([...selectedTags, tag]);
                        } else {
                          setSelectedTags(selectedTags.filter((t) => t !== tag));
                        }
                      }}
                    />
                    <Label htmlFor={`tag-${tag}`}>{tag}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>対応ステータス</Label>
              <div className="space-y-2 mt-2">
                {["対応中", "予約済み", "クレーム", "完了"].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStatuses([...selectedStatuses, status]);
                        } else {
                          setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
                        }
                      }}
                    />
                    <Label htmlFor={`status-${status}`}>{status}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => {
                setSelectedTags([]);
                setSelectedStatuses([]);
              }}>
                クリア
              </Button>
              <Button className="flex-1" onClick={() => setShowFilterDialog(false)}>
                適用
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
