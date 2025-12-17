import { useState, useEffect, useRef } from "react";
import { 
  Search, Send, Paperclip, Smile, Image as ImageIcon, 
  MoreVertical, Phone, Video, Check, CheckCheck, 
  Clock, Calendar, Tag, User, AlertCircle, FileText,
  ChevronRight, X, Filter, Settings, Plus, PlusCircle,
  Link as LinkIcon, LayoutTemplate, GitMerge, Menu,
  Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChatThread, ChatMessage, Contact, Tag as TagType } from "@/types/schema";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ActionBuilder } from "@/components/actions/ActionBuilder";
import { toast } from "sonner";

// Mock Data
const mockThreads: ChatThread[] = [
  {
    id: "1",
    tenant_id: "tenant1",
    contact_id: "contact1",
    last_message_at: new Date().toISOString(),
    last_message_preview: "ありがとうございます。確認します。",
    unread_count: 2,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    tenant_id: "tenant1",
    contact_id: "contact2",
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    last_message_preview: "予約の変更をお願いしたいのですが...",
    unread_count: 0,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockContacts: Record<string, Contact> = {
  "contact1": {
    id: "contact1",
    tenant_id: "tenant1",
    line_user_id: "U123456",
    display_name: "山田 太郎",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    status: "active",
    tags: ["tag1", "tag2"],
    attributes: { "会員ランク": "ゴールド", "来店回数": 5 },
    last_active_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  "contact2": {
    id: "contact2",
    tenant_id: "tenant1",
    line_user_id: "U789012",
    display_name: "鈴木 花子",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    status: "active",
    tags: ["tag3"],
    attributes: { "会員ランク": "シルバー", "来店回数": 2 },
    last_active_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
};

const mockMessages: ChatMessage[] = [
  {
    id: "msg1",
    tenant_id: "tenant1",
    thread_id: "1",
    sender_type: "user",
    content_type: "text",
    content: "ご予約ありがとうございます。当日はお気をつけてお越しください。",
    status: "sent",
    read_at: new Date(Date.now() - 7200000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "msg2",
    tenant_id: "tenant1",
    thread_id: "1",
    sender_type: "contact",
    content_type: "text",
    content: "ありがとうございます。確認します。",
    status: "sent",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "msg3",
    tenant_id: "tenant1",
    thread_id: "1",
    sender_type: "contact",
    content_type: "text",
    content: "駐車場はありますか？",
    status: "sent",
    created_at: new Date().toISOString(),
  },
];

const mockTags: TagType[] = [
  { id: "tag1", tenant_id: "tenant1", name: "重要顧客", color: "#ef4444", count: 10, created_at: new Date().toISOString() },
  { id: "tag2", tenant_id: "tenant1", name: "リピーター", color: "#3b82f6", count: 25, created_at: new Date().toISOString() },
  { id: "tag3", tenant_id: "tenant1", name: "新規", color: "#22c55e", count: 5, created_at: new Date().toISOString() },
  { id: "tag4", tenant_id: "tenant1", name: "要注意", color: "#f59e0b", count: 2, created_at: new Date().toISOString() },
  { id: "tag5", tenant_id: "tenant1", name: "キャンペーン対象", color: "#8b5cf6", count: 15, created_at: new Date().toISOString() },
];

// Status definitions
const STATUS_OPTIONS = [
  { value: "unhandled", label: "未対応", color: "bg-gray-100 text-gray-800" },
  { value: "active", label: "対応中", color: "bg-blue-100 text-blue-800" },
  { value: "completed", label: "完了", color: "bg-green-100 text-green-800" },
  { value: "pending", label: "保留", color: "bg-yellow-100 text-yellow-800" },
];

export default function ChatPage() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>("1");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [urlToShorten, setUrlToShorten] = useState("");
  const [isShortenDialogOpen, setIsShortenDialogOpen] = useState(false);
  const [contacts, setContacts] = useState(mockContacts);
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [contactStatus, setContactStatus] = useState<string>("active");
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
  const [editingAttributes, setEditingAttributes] = useState<Record<string, any>>({});

  const selectedThread = mockThreads.find(t => t.id === selectedThreadId);
  const selectedContact = selectedThread ? contacts[selectedThread.contact_id] : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedThreadId]);

  useEffect(() => {
    if (selectedContact) {
      // In a real app, status would be part of the contact or thread data
      // For now, we just reset it to 'active' when switching contacts
      setContactStatus("active");
      setEditingAttributes(selectedContact.attributes);
    }
  }, [selectedContact?.id]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedThreadId) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      tenant_id: "tenant1",
      thread_id: selectedThreadId,
      sender_type: "user",
      content_type: "text",
      content: messageInput,
      status: "sent",
      created_at: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleShortenUrl = () => {
    if (!urlToShorten) return;
    
    // Mock URL shortening logic
    const shortUrl = `https://lme.jp/${Math.random().toString(36).substr(2, 6)}`;
    setMessageInput(prev => prev + (prev ? " " : "") + shortUrl);
    setIsShortenDialogOpen(false);
    setUrlToShorten("");
    toast.success("短縮URLを挿入しました");
  };

  const handleAddTag = (tagId: string) => {
    if (!selectedContact) return;
    
    if (selectedContact.tags.includes(tagId)) {
      toast.error("このタグは既に追加されています");
      return;
    }

    setContacts(prev => ({
      ...prev,
      [selectedContact.id]: {
        ...selectedContact,
        tags: [...selectedContact.tags, tagId]
      }
    }));
    setIsTagPopoverOpen(false);
    toast.success("タグを追加しました");
  };

  const handleRemoveTag = (tagId: string) => {
    if (!selectedContact) return;

    setContacts(prev => ({
      ...prev,
      [selectedContact.id]: {
        ...selectedContact,
        tags: selectedContact.tags.filter(id => id !== tagId)
      }
    }));
    toast.success("タグを削除しました");
  };

  const handleStatusChange = (status: string) => {
    setContactStatus(status);
    toast.success("ステータスを更新しました");
  };

  const handleSaveAttributes = () => {
    if (!selectedContact) return;

    setContacts(prev => ({
      ...prev,
      [selectedContact.id]: {
        ...selectedContact,
        attributes: editingAttributes
      }
    }));
    setIsEditInfoOpen(false);
    toast.success("友だち情報を更新しました");
  };

  const handleAction = (actionName: string) => {
    toast.success(`${actionName}を実行しました`);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Left Panel: Thread List */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">チャット</h2>
            <Button variant="ghost" size="icon" asChild>
              <a href="/chats/settings">
                <Settings className="h-5 w-5" />
              </a>
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="名前やタグで検索" className="pl-8" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Badge variant="secondary" className="cursor-pointer whitespace-nowrap">全て</Badge>
            <Badge variant="outline" className="cursor-pointer whitespace-nowrap">未読</Badge>
            <Badge variant="outline" className="cursor-pointer whitespace-nowrap">要対応</Badge>
            <Badge variant="outline" className="cursor-pointer whitespace-nowrap">対応中</Badge>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="divide-y">
            {mockThreads.map((thread) => {
              const contact = contacts[thread.contact_id];
              return (
                <div
                  key={thread.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedThreadId === thread.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedThreadId(thread.id)}
                >
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={contact.avatar_url} />
                      <AvatarFallback>{contact.display_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium truncate">{contact.display_name}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(thread.last_message_at), "HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {thread.last_message_preview}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {contact.tags.slice(0, 2).map(tagId => {
                          const tag = mockTags.find(t => t.id === tagId);
                          return tag ? (
                            <Badge key={tagId} variant="outline" className="text-[10px] px-1 py-0 h-5" style={{ borderColor: tag.color, color: tag.color }}>
                              {tag.name}
                            </Badge>
                          ) : null;
                        })}
                        {thread.unread_count > 0 && (
                          <Badge variant="destructive" className="ml-auto h-5 px-1.5">
                            {thread.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Center Panel: Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedThread && selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedContact.avatar_url} />
                  <AvatarFallback>{selectedContact.display_name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedContact.display_name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        contactStatus === 'active' ? 'bg-blue-500' :
                        contactStatus === 'completed' ? 'bg-green-500' :
                        contactStatus === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      {STATUS_OPTIONS.find(s => s.value === contactStatus)?.label}
                    </span>
                    <span>•</span>
                    <span>最終アクティブ: {format(new Date(selectedContact.last_active_at), "MM/dd HH:mm")}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-2" />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className={showRightPanel ? "bg-muted" : ""}
                >
                  <User className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.sender_type === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8 mt-1">
                      {msg.sender_type === "user" ? (
                        <AvatarFallback>Me</AvatarFallback>
                      ) : (
                        <>
                          <AvatarImage src={selectedContact.avatar_url} />
                          <AvatarFallback>{selectedContact.display_name[0]}</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div className={`flex flex-col max-w-[70%] ${
                      msg.sender_type === "user" ? "items-end" : "items-start"
                    }`}>
                      <div
                        className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${
                          msg.sender_type === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-muted rounded-tl-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                        <span>{format(new Date(msg.created_at), "HH:mm")}</span>
                        {msg.sender_type === "user" && (
                          <span>
                            {msg.read_at ? (
                              <span className="text-green-600 font-medium">既読</span>
                            ) : (
                              "送信済"
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <FileText className="h-5 w-5" />
                </Button>
                
                {/* URL Shortener Dialog */}
                <Dialog open={isShortenDialogOpen} onOpenChange={setIsShortenDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <LinkIcon className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>短縮URLの作成</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">短縮したいURL</label>
                        <Input 
                          placeholder="https://example.com/..." 
                          value={urlToShorten}
                          onChange={(e) => setUrlToShorten(e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ※短縮URLを使用すると、クリック数を計測できます。
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsShortenDialogOpen(false)}>キャンセル</Button>
                      <Button onClick={handleShortenUrl} disabled={!urlToShorten}>作成して挿入</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="flex-1" />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      予約送信
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>予約送信の設定</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        指定した日時にメッセージを送信します。
                      </p>
                      {/* Date picker would go here */}
                      <Button className="w-full">設定する</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="メッセージを入力 (Shift+Enterで改行)"
                  className="min-h-[80px] resize-none"
                />
                <Button 
                  className="h-[80px] w-20" 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            チャットを選択してください
          </div>
        )}
      </div>

      {/* Right Panel: Contact Details */}
      {showRightPanel && selectedContact && (
        <div className="w-80 border-l bg-muted/10 flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-background">
            <h3 className="font-semibold mb-4">友だち情報</h3>
            <div className="flex flex-col items-center mb-4">
              <Avatar className="h-20 w-20 mb-2">
                <AvatarImage src={selectedContact.avatar_url} />
                <AvatarFallback>{selectedContact.display_name[0]}</AvatarFallback>
              </Avatar>
              <span className="font-bold text-lg">{selectedContact.display_name}</span>
              <span className="text-xs text-muted-foreground mt-1">ID: {selectedContact.line_user_id}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="w-full">
                <AlertCircle className="h-4 w-4 mr-2" />
                ブロック
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Tag className="h-4 w-4 mr-2" />
                タグ編集
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Status */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">対応ステータス</h4>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(status => (
                    <Badge 
                      key={status.value}
                      variant={contactStatus === status.value ? "default" : "secondary"}
                      className={`cursor-pointer ${contactStatus === status.value ? "" : "hover:bg-secondary/80"}`}
                      onClick={() => handleStatusChange(status.value)}
                    >
                      {status.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">タグ</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedContact.tags.map(tagId => {
                    const tag = mockTags.find(t => t.id === tagId);
                    return tag ? (
                      <Badge 
                        key={tagId} 
                        variant="outline" 
                        className="cursor-pointer hover:opacity-80 group"
                        style={{ borderColor: tag.color, color: tag.color }}
                        onClick={() => handleRemoveTag(tagId)}
                      >
                        {tag.name}
                        <X className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Badge>
                    ) : null;
                  })}
                  
                  <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 px-2 text-xs border border-dashed">
                        <PlusCircle className="h-3 w-3 mr-1" />
                        追加
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-52" align="start">
                      <Command>
                        <CommandInput placeholder="タグを検索..." />
                        <CommandList>
                          <CommandEmpty>タグが見つかりません</CommandEmpty>
                          <CommandGroup>
                            {mockTags
                              .filter(tag => !selectedContact.tags.includes(tag.id))
                              .map(tag => (
                                <CommandItem
                                  key={tag.id}
                                  onSelect={() => handleAddTag(tag.id)}
                                >
                                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: tag.color }} />
                                  {tag.name}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Attributes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-muted-foreground">友だち情報</h4>
                  <Dialog open={isEditInfoOpen} onOpenChange={setIsEditInfoOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>友だち情報の編集</DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        {Object.entries(editingAttributes).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <label className="text-sm font-medium">{key}</label>
                            <Input 
                              value={value} 
                              onChange={(e) => setEditingAttributes({...editingAttributes, [key]: e.target.value})}
                            />
                          </div>
                        ))}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">新規項目を追加</label>
                          <div className="flex gap-2">
                            <Input placeholder="項目名" id="new-attr-key" />
                            <Input placeholder="値" id="new-attr-value" />
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                const keyInput = document.getElementById('new-attr-key') as HTMLInputElement;
                                const valueInput = document.getElementById('new-attr-value') as HTMLInputElement;
                                if (keyInput.value && valueInput.value) {
                                  setEditingAttributes({...editingAttributes, [keyInput.value]: valueInput.value});
                                  keyInput.value = '';
                                  valueInput.value = '';
                                }
                              }}
                            >
                              追加
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditInfoOpen(false)}>キャンセル</Button>
                        <Button onClick={handleSaveAttributes}>保存</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-2">
                  {Object.entries(selectedContact.attributes).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm border-b pb-1">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">アクション実行</h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleAction("テンプレート送信")}
                  >
                    <LayoutTemplate className="h-4 w-4 mr-2" />
                    テンプレート送信
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleAction("ステップ配信開始")}
                  >
                    <GitMerge className="h-4 w-4 mr-2" />
                    ステップ配信開始
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleAction("リッチメニュー切替")}
                  >
                    <Menu className="h-4 w-4 mr-2" />
                    リッチメニュー切替
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
