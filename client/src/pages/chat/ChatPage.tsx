import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { toast } from "sonner";

interface Friend {
  id: string;
  name: string;
  lineName: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  bookmarked: boolean;
  status: "active" | "pending" | "blocked";
  tags: string[];
  statusLabel: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: "sent" | "received";
}

export default function ChatPage() {
  const [friends] = useState<Friend[]>([
    {
      id: "1",
      name: "山田太郎",
      lineName: "Taro Y",
      avatar: "",
      lastMessage: "ありがとうございます！",
      lastMessageTime: "10:30",
      unread: true,
      bookmarked: false,
      status: "active",
      tags: ["VIP", "リピーター"],
      statusLabel: "対応中",
    },
    {
      id: "2",
      name: "佐藤花子",
      lineName: "Hanako S",
      avatar: "",
      lastMessage: "予約の変更をお願いします",
      lastMessageTime: "09:15",
      unread: true,
      bookmarked: true,
      status: "active",
      tags: ["予約済み"],
      statusLabel: "予約済み",
    },
    {
      id: "3",
      name: "鈴木一郎",
      lineName: "Ichiro S",
      avatar: "",
      lastMessage: "了解しました",
      lastMessageTime: "昨日",
      unread: false,
      bookmarked: false,
      status: "active",
      tags: [],
      statusLabel: "",
    },
  ]);

  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(friends[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: "1",
      senderName: "山田太郎",
      content: "こんにちは！商品について質問があります。",
      timestamp: "10:25",
      type: "received",
    },
    {
      id: "2",
      senderId: "staff",
      senderName: "スタッフ",
      content: "はい、どのようなご質問でしょうか？",
      timestamp: "10:27",
      type: "sent",
    },
    {
      id: "3",
      senderId: "1",
      senderName: "山田太郎",
      content: "在庫はありますか？",
      timestamp: "10:28",
      type: "received",
    },
    {
      id: "4",
      senderId: "staff",
      senderName: "スタッフ",
      content: "はい、在庫がございます。ご注文いただけます。",
      timestamp: "10:29",
      type: "sent",
    },
    {
      id: "5",
      senderId: "1",
      senderName: "山田太郎",
      content: "ありがとうございます！",
      timestamp: "10:30",
      type: "received",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSender, setSelectedSender] = useState("default");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isSenderDialogOpen, setIsSenderDialogOpen] = useState(false);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: "staff",
      senderName: "スタッフ",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      type: "sent",
    };

    setMessages([...messages, message]);
    setNewMessage("");
    toast.success("メッセージを送信しました");
  };

  const filteredFriends = friends.filter((friend) => {
    if (filterStatus === "unread" && !friend.unread) return false;
    if (filterStatus === "read" && friend.unread) return false;
    if (filterStatus === "hidden" && friend.status !== "blocked") return false;
    if (filterStatus === "bookmarked" && !friend.bookmarked) return false;
    if (searchQuery && !friend.name.includes(searchQuery) && !friend.lineName.includes(searchQuery))
      return false;
    return true;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex gap-4 h-[calc(100vh-120px)]">
        {/* 左側：友だち一覧 */}
        <Card className="w-80 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全ての友だち</SelectItem>
                  <SelectItem value="unread">未確認</SelectItem>
                  <SelectItem value="read">確認済み</SelectItem>
                  <SelectItem value="hidden">非表示中</SelectItem>
                  <SelectItem value="bookmarked">ブックマーク</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>絞り込み</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>タグで絞り込み</Label>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="tag-vip" />
                            <label htmlFor="tag-vip">VIP</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="tag-repeat" />
                            <label htmlFor="tag-repeat">リピーター</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="tag-reserved" />
                            <label htmlFor="tag-reserved">予約済み</label>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>対応ステータスで絞り込み</Label>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="status-handling" />
                            <label htmlFor="status-handling">対応中</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="status-reserved" />
                            <label htmlFor="status-reserved">予約済み</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="status-complaint" />
                            <label htmlFor="status-complaint">クレーム</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toast.success("全て確認済みに変更しました")}
                >
                  <CheckCheck className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="友だちを検索"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="divide-y">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedFriend?.id === friend.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => setSelectedFriend(friend)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback>{friend.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{friend.name}</span>
                          {friend.bookmarked && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                        </div>
                        <span className="text-xs text-gray-500">{friend.lastMessageTime}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-2">{friend.lastMessage}</p>
                      <div className="flex flex-wrap gap-1">
                        {friend.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {friend.statusLabel && (
                          <Badge variant="outline" className="text-xs">
                            {friend.statusLabel}
                          </Badge>
                        )}
                        {friend.unread && (
                          <Badge variant="default" className="text-xs">
                            未読
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="p-4 border-t">
            <Dialog open={isSenderDialogOpen} onOpenChange={setIsSenderDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {selectedSender === "default" ? "初期設定" : "カスタムスタッフ"}
                    </span>
                  </div>
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>送信ユーザー名を変更</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer ${
                      selectedSender === "default" ? "border-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedSender("default")}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>初</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">初期設定</p>
                        <p className="text-sm text-gray-500">LINE公式アカウント名</p>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full">+ 追加</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* 中央：チャット画面 */}
        <Card className="flex-1 flex flex-col">
          {selectedFriend ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedFriend.avatar} />
                      <AvatarFallback>{selectedFriend.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedFriend.name}</h3>
                      <p className="text-sm text-gray-500">{selectedFriend.lineName}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "sent" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.type === "sent"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.type === "sent" ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Textarea
                    placeholder="メッセージを入力..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 min-h-[60px] resize-none"
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              友だちを選択してください
            </div>
          )}
        </Card>

        {/* 右側：友だち情報 */}
        {selectedFriend && (
          <Card className="w-80">
            <CardHeader>
              <CardTitle className="text-base">友だち情報</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">基本</TabsTrigger>
                  <TabsTrigger value="tags">タグ</TabsTrigger>
                  <TabsTrigger value="memo">メモ</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4">
                  <div className="text-center py-4">
                    <Avatar className="w-20 h-20 mx-auto mb-3">
                      <AvatarImage src={selectedFriend.avatar} />
                      <AvatarFallback className="text-2xl">{selectedFriend.name[0]}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{selectedFriend.name}</h3>
                    <p className="text-sm text-gray-500">{selectedFriend.lineName}</p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-gray-500">対応ステータス</Label>
                      <Select defaultValue={selectedFriend.statusLabel || "none"}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">なし</SelectItem>
                          <SelectItem value="対応中">対応中</SelectItem>
                          <SelectItem value="予約済み">予約済み</SelectItem>
                          <SelectItem value="クレーム">クレーム</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Bookmark className="w-4 h-4 mr-1" />
                        ブックマーク
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Tag className="w-4 h-4 mr-1" />
                        タグ編集
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <EyeOff className="w-4 h-4 mr-1" />
                        非表示
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Ban className="w-4 h-4 mr-1" />
                        ブロック
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="tags" className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedFriend.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Tag className="w-4 h-4 mr-1" />
                    タグを追加
                  </Button>
                </TabsContent>
                <TabsContent value="memo" className="space-y-2">
                  <Textarea placeholder="メモを入力..." className="min-h-[200px]" />
                  <Button size="sm" className="w-full">
                    保存
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
