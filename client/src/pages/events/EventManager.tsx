import { useState } from "react";
import { Link } from "wouter";
import { Plus, Search, MoreHorizontal, Copy, Trash2, ExternalLink, Calendar, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FolderManager } from "@/components/common/folder-manager";
import { PageTemplate } from "@/components/page-template";
import { Folder, Event } from "@/types/schema";

// Mock Data
const MOCK_FOLDERS: Folder[] = [
  { id: "1", tenant_id: "t1", name: "セミナー・説明会", scope: "event", sort_order: 1, created_at: new Date(), updated_at: new Date() },
  { id: "2", tenant_id: "t1", name: "個別相談", scope: "event", sort_order: 2, created_at: new Date(), updated_at: new Date() },
  { id: "3", tenant_id: "t1", name: "キャンペーン", scope: "event", sort_order: 3, created_at: new Date(), updated_at: new Date() },
];

const MOCK_EVENTS: Event[] = [
  {
    id: "e1",
    tenant_id: "t1",
    title: "【3月開催】Lステップ活用セミナー",
    folder_id: "1",
    description: "初心者向けの活用セミナーです",
    start_at: "2024-03-20T14:00:00Z",
    end_at: "2024-03-20T16:00:00Z",
    capacity: 30,
    current_participants: 12,
    location: "オンライン（Zoom）",
    status: "published",
    created_at: "2024-03-01T10:00:00Z",
  },
  {
    id: "e2",
    tenant_id: "t1",
    title: "無料個別相談会",
    folder_id: "2",
    description: "60分の個別相談です",
    start_at: "2024-03-01T00:00:00Z",
    end_at: "2024-03-31T23:59:59Z",
    capacity: 100,
    current_participants: 45,
    location: "オンライン",
    status: "published",
    created_at: "2024-02-28T15:00:00Z",
  },
  {
    id: "e3",
    tenant_id: "t1",
    title: "春の特別イベント",
    folder_id: "3",
    description: "準備中",
    start_at: "2024-04-01T10:00:00Z",
    end_at: "2024-04-01T18:00:00Z",
    capacity: 50,
    current_participants: 0,
    location: "東京本社",
    status: "draft",
    created_at: "2024-03-10T09:00:00Z",
  },
];

export default function EventManagerPage() {
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Folder Operations
  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      tenant_id: "t1",
      name,
      scope: "event",
      sort_order: folders.length + 1,
      created_at: new Date(),
      updated_at: new Date(),
    };
    setFolders([...folders, newFolder]);
  };

  const handleUpdateFolder = (id: string, name: string) => {
    setFolders(folders.map(f => f.id === id ? { ...f, name } : f));
  };

  const handleDeleteFolder = (id: string) => {
    setFolders(folders.filter(f => f.id !== id));
    setEvents(events.map(e => e.folder_id === id ? { ...e, folder_id: undefined } : e));
  };

  // Event Operations
  const handleDeleteEvent = (id: string) => {
    if (confirm("本当に削除しますか？")) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const handleDuplicateEvent = (event: Event) => {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
      title: `${event.title} (コピー)`,
      current_participants: 0,
      status: 'draft',
      created_at: new Date().toISOString(),
    };
    setEvents([...events, newEvent]);
  };

  const handleToggleStatus = (id: string) => {
    setEvents(events.map(e => {
      if (e.id === id) {
        return { ...e, status: e.status === 'published' ? 'draft' : 'published' };
      }
      return e;
    }));
  };

  // Filtering
  const filteredEvents = events.filter(event => {
    const matchesFolder = selectedFolderId ? event.folder_id === selectedFolderId : true;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <PageTemplate title="イベント予約管理" breadcrumbs={[{ label: "イベント", href: "/events" }]}>
      <div className="flex h-[calc(100vh-12rem)] border rounded-lg bg-white overflow-hidden shadow-sm">
        {/* Left Pane: Folder Manager */}
        <FolderManager
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onCreateFolder={handleCreateFolder}
          onUpdateFolder={handleUpdateFolder}
          onDeleteFolder={handleDeleteFolder}
          className="w-64 flex-shrink-0"
        />

        {/* Right Pane: Event List */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="p-4 border-b flex items-center justify-between gap-4 bg-white">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="イベント名で検索..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/events/reservations">
                  <Users className="mr-2 h-4 w-4" /> 予約者一覧
                </Link>
              </Button>
              <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white" asChild>
                <Link href="/events/create">
                  <Plus className="mr-2 h-4 w-4" /> 新規作成
                </Link>
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">状態</TableHead>
                  <TableHead>イベント名</TableHead>
                  <TableHead className="w-[150px]">開催日時</TableHead>
                  <TableHead className="w-[100px] text-center">予約数</TableHead>
                  <TableHead className="w-[120px] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                      イベントが見つかりません
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id} className="group">
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <div 
                            className={`w-3 h-3 rounded-full cursor-pointer ${event.status === 'published' ? 'bg-green-500' : 'bg-gray-300'}`}
                            title={event.status === 'published' ? "公開中" : "下書き"}
                            onClick={() => handleToggleStatus(event.id)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">{event.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[300px]">{event.location}</div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(event.start_at).toLocaleDateString('ja-JP')}
                        <br />
                        {new Date(event.start_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-normal">
                          {event.current_participants} / {event.capacity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild title="予約カレンダー">
                            <Link href={`/events/calendar`}>
                              <Calendar className="h-4 w-4 text-gray-500" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild>
                                <Link href={`/events/${event.id}/edit`}>
                                  <Settings className="mr-2 h-4 w-4" />
                                  設定・編集
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateEvent(event)}>
                                <Copy className="mr-2 h-4 w-4" />
                                複製
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a href={`https://l-message.jp/events/${event.id}`} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  予約ページを開く
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
