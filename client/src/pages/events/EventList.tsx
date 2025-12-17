import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Copy, Eye, Calendar, MapPin, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Link } from "wouter";
import { PageTemplate } from "@/components/page-template";
import { FolderManager } from "@/components/common/folder-manager";
import { Folder, Event } from "@/types/schema";
import { toast } from "sonner";

export default function EventListPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([
    { id: "1", name: "セミナー", tenant_id: "1", scope: "events", parent_id: null, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "2", name: "キャンペーン", tenant_id: "1", scope: "events", parent_id: null, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]);
  
  const [events, setEvents] = useState<Event[]>([
    { 
      id: "1", 
      tenant_id: "1", 
      title: "LINE活用セミナー 2025冬", 
      folder_id: "1", 
      start_at: "2025-12-20T14:00:00Z", 
      end_at: "2025-12-20T16:00:00Z", 
      capacity: 50, 
      current_participants: 42, 
      location: "オンライン (Zoom)", 
      status: "published", 
      created_at: "2025-11-01T10:00:00Z" 
    },
    { 
      id: "2", 
      tenant_id: "1", 
      title: "新商品発表会", 
      folder_id: "2", 
      start_at: "2026-01-15T13:00:00Z", 
      end_at: "2026-01-15T15:00:00Z", 
      capacity: 100, 
      current_participants: 15, 
      location: "東京本社", 
      status: "draft", 
      created_at: "2025-12-01T10:00:00Z" 
    },
  ]);

  const filteredEvents = selectedFolderId
    ? events.filter(e => e.folder_id === selectedFolderId)
    : events;

  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      tenant_id: "1",
      scope: "events",
      parent_id: null,
      sort_order: folders.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
    setEvents(events.map(e => e.folder_id === id ? { ...e, folder_id: undefined } : e));
    toast.success("フォルダを削除しました");
  };

  return (
    <PageTemplate title="イベント管理" breadcrumbs={[{ label: "予約・イベント", href: "/events" }, { label: "イベント一覧" }]}>
      <div className="flex h-[calc(100vh-200px)]">
        {/* Folder Manager */}
        <div className="w-64 shrink-0 border-r pr-4 mr-6">
          <FolderManager
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
            onCreateFolder={handleCreateFolder}
            onUpdateFolder={handleUpdateFolder}
            onDeleteFolder={handleDeleteFolder}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="イベントを検索..." className="pl-8" />
              </div>
            </div>
            <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white" asChild>
              <Link href="/events/create">
                <Plus className="mr-2 h-4 w-4" /> 新規イベント作成
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : "すべてのイベント"}
                <span className="ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                  {filteredEvents.length}件
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>イベント名</TableHead>
                    <TableHead>開催日時</TableHead>
                    <TableHead>場所</TableHead>
                    <TableHead>参加状況</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{event.title}</span>
                          {event.folder_id && (
                            <span className="text-xs text-gray-400">
                              {folders.find(f => f.id === event.folder_id)?.name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-2 h-3 w-3" />
                          {new Date(event.start_at).toLocaleDateString()} {new Date(event.start_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="mr-2 h-3 w-3" />
                          {event.location || "未定"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="mr-2 h-3 w-3" />
                          {event.current_participants} / {event.capacity}
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.status === "published" ? (
                          <Badge className="bg-[#06C755]">公開中</Badge>
                        ) : event.status === "draft" ? (
                          <Badge variant="secondary">下書き</Badge>
                        ) : (
                          <Badge variant="outline">終了</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" /> 詳細・参加者
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" /> 編集
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" /> 複製
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> 削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}
