import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Send, 
  Image as ImageIcon, 
  Smile, 
  Paperclip, 
  MoreVertical, 
  CheckCheck,
  User,
  Tag,
  FileText,
  Clock
} from "lucide-react";
import { ChatThread, ChatMessage } from "@/types/schema";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// Mock Data
const MOCK_THREADS: ChatThread[] = [
  {
    id: "t1",
    tenant_id: "tenant1",
    contact_id: "c1",
    last_message_at: new Date().toISOString(),
    last_message_preview: "ありがとうございます。確認します。",
    unread_count: 2,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t2",
    tenant_id: "tenant1",
    contact_id: "c2",
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    last_message_preview: "予約の変更をお願いしたいのですが...",
    unread_count: 0,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t3",
    tenant_id: "tenant1",
    contact_id: "c3",
    last_message_at: new Date(Date.now() - 86400000).toISOString(),
    last_message_preview: "承知いたしました。",
    unread_count: 0,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    tenant_id: "tenant1",
    thread_id: "t1",
    sender_type: "contact",
    content_type: "text",
    content: "こんにちは。次回の予約について相談です。",
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "m2",
    tenant_id: "tenant1",
    thread_id: "t1",
    sender_type: "user",
    content_type: "text",
    content: "こんにちは！どのようなご相談でしょうか？",
    read_at: new Date(Date.now() - 7100000).toISOString(),
    created_at: new Date(Date.now() - 7150000).toISOString(),
  },
  {
    id: "m3",
    tenant_id: "tenant1",
    thread_id: "t1",
    sender_type: "contact",
    content_type: "text",
    content: "来週の水曜日に変更可能でしょうか？",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "m4",
    tenant_id: "tenant1",
    thread_id: "t1",
    sender_type: "contact",
    content_type: "text",
    content: "ありがとうございます。確認します。",
    created_at: new Date().toISOString(),
  },
];

export default function ChatPage() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>("t1");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedThreadId) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "tenant1",
      thread_id: selectedThreadId,
      sender_type: "user",
      content_type: "text",
      content: messageInput,
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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Sidebar: Thread List */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg mb-4">チャット</h2>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input placeholder="名前やメッセージで検索" className="pl-8" />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="divide-y">
            {MOCK_THREADS.map((thread) => (
              <div
                key={thread.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedThreadId === thread.id ? "bg-blue-50 hover:bg-blue-50" : ""
                }`}
                onClick={() => setSelectedThreadId(thread.id)}
              >
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.contact_id}`} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium truncate">ユーザー {thread.contact_id}</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {format(new Date(thread.last_message_at), "HH:mm", { locale: ja })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 truncate pr-2">
                        {thread.last_message_preview}
                      </p>
                      {thread.unread_count > 0 && (
                        <Badge className="bg-red-500 hover:bg-red-600 h-5 min-w-[20px] px-1 flex items-center justify-center">
                          {thread.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content: Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedThreadId ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b bg-white flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=c1`} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold">ユーザー {MOCK_THREADS.find(t => t.id === selectedThreadId)?.contact_id}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Badge variant="outline" className="text-xs font-normal bg-green-50 text-green-700 border-green-200">
                      対応中
                    </Badge>
                    <span>タグ: VIP, 1月購入</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Search className="w-5 h-5 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 bg-[#7494C0] p-4">
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((message) => {
                  const isMe = message.sender_type === "user";
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {!isMe && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.thread_id}`} />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}>
                        <div
                          className={`px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                            isMe
                              ? "bg-[#8DE055] text-black rounded-tr-none"
                              : "bg-white text-black rounded-tl-none"
                          }`}
                        >
                          {message.content}
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-[10px] text-white/80">
                            {format(new Date(message.created_at), "HH:mm")}
                          </span>
                          {isMe && message.read_at && (
                            <span className="text-[10px] text-white/80">既読</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="bg-white border-t p-4">
              <div className="max-w-3xl mx-auto">
                <div className="flex gap-2 mb-2">
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                    <Smile className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 ml-auto text-xs">
                    テンプレート
                  </Button>
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
                    onClick={handleSendMessage} 
                    className="h-[80px] w-20 bg-[#06C755] hover:bg-[#05b34c] text-white flex flex-col gap-1"
                  >
                    <Send className="w-5 h-5" />
                    <span className="text-xs">送信</span>
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
            チャットを選択してください
          </div>
        )}
      </div>

      {/* Right Sidebar: Contact Info */}
      {selectedThreadId && (
        <div className="w-72 bg-white border-l flex flex-col overflow-y-auto">
          <div className="p-6 text-center border-b">
            <Avatar className="h-20 w-20 mx-auto mb-4">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=c1`} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <h3 className="font-bold text-lg mb-1">ユーザー {MOCK_THREADS.find(t => t.id === selectedThreadId)?.contact_id}</h3>
            <div className="flex justify-center gap-2 mt-3">
              <Button variant="outline" size="sm" className="h-8">
                <User className="w-3 h-3 mr-1" />
                詳細
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-red-500 hover:text-red-600">
                ブロック
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Status */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                対応ステータス
              </h4>
              <Select defaultValue="active">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">新規</SelectItem>
                  <SelectItem value="active">対応中</SelectItem>
                  <SelectItem value="pending">保留</SelectItem>
                  <SelectItem value="resolved">解決済み</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                <Tag className="w-3 h-3" />
                タグ
              </h4>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">VIP</Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">1月購入</Badge>
              </div>
              <Button variant="ghost" size="sm" className="w-full text-xs text-gray-500 border border-dashed">
                <Plus className="w-3 h-3 mr-1" />
                タグを追加
              </Button>
            </div>

            {/* Notes */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                <FileText className="w-3 h-3" />
                メモ
              </h4>
              <Textarea 
                placeholder="メモを入力..." 
                className="text-sm min-h-[100px] bg-yellow-50 border-yellow-200 focus:border-yellow-300 focus:ring-yellow-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components for Select (needed because they are not imported)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
