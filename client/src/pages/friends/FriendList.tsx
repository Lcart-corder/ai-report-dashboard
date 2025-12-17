import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, StatusBadge } from "@/components/common/ui-kit";
import { FolderManager } from "@/components/common/folder-manager";
import { Folder } from "@/types/schema";
import { Search, Filter, Download, User, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock Data
const MOCK_FOLDERS: Folder[] = [
  { id: "f1", tenant_id: "t1", name: "重要顧客", scope: "friends", sort_order: 1, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "f2", tenant_id: "t1", name: "要注意", scope: "friends", sort_order: 2, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

interface Friend {
  id: string;
  line_user_id: string;
  display_name: string;
  picture_url?: string;
  status: "active" | "blocked";
  tags: string[];
  folder_id?: string;
  created_at: string;
  last_active_at: string;
}

const MOCK_FRIENDS: Friend[] = [
  { id: "1", line_user_id: "U123456", display_name: "山田 太郎", picture_url: "", status: "active", tags: ["VIP", "1月購入"], folder_id: "f1", created_at: "2024-01-01T10:00:00Z", last_active_at: "2024-02-15T09:30:00Z" },
  { id: "2", line_user_id: "U234567", display_name: "鈴木 花子", picture_url: "", status: "active", tags: ["クーポン利用"], folder_id: "f1", created_at: "2024-01-15T14:30:00Z", last_active_at: "2024-02-14T18:20:00Z" },
  { id: "3", line_user_id: "U345678", display_name: "佐藤 次郎", picture_url: "", status: "blocked", tags: [], folder_id: "f2", created_at: "2024-02-01T11:00:00Z", last_active_at: "2024-02-01T11:05:00Z" },
  { id: "4", line_user_id: "U456789", display_name: "田中 美咲", picture_url: "", status: "active", tags: ["メルマガ購読"], folder_id: undefined, created_at: "2024-02-10T16:45:00Z", last_active_at: "2024-02-16T10:15:00Z" },
];

export default function FriendListPage() {
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Folder Handlers
  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "t1",
      name,
      scope: "friends",
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
    setFriends(friends.map(f => f.folder_id === id ? { ...f, folder_id: undefined } : f));
    toast.success("フォルダを削除しました");
  };

  const filteredFriends = selectedFolderId
    ? friends.filter(f => f.folder_id === selectedFolderId)
    : friends;

  const columns = [
    {
      header: "ユーザー",
      cell: (friend: Friend) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={friend.picture_url} />
            <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{friend.display_name}</span>
            {friend.folder_id && (
              <span className="text-xs text-gray-400">
                {folders.find(f => f.id === friend.folder_id)?.name}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "タグ",
      cell: (friend: Friend) => (
        <div className="flex flex-wrap gap-1">
          {friend.tags.map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "ステータス",
      cell: (friend: Friend) => <StatusBadge status={friend.status} />,
    },
    {
      header: "登録日",
      cell: (friend: Friend) => new Date(friend.created_at).toLocaleDateString(),
    },
    {
      header: "最終アクティブ",
      cell: (friend: Friend) => new Date(friend.last_active_at).toLocaleString(),
    },
    {
      header: "操作",
      className: "text-right",
      cell: (friend: Friend) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" title="チャットを開く">
            <MessageCircle className="w-4 h-4 text-blue-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTemplate 
      title="友だちリスト" 
      description="友だち追加したユーザーの一覧を表示・管理します。"
      breadcrumbs={[{ label: "友だち管理" }, { label: "友だちリスト" }]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            CSVエクスポート
          </Button>
        </div>
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
          <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center">
            <h2 className="font-bold text-lg">
              {selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : "すべての友だち"}
              <span className="ml-2 text-sm font-normal text-gray-500">({filteredFriends.length}人)</span>
            </h2>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input placeholder="名前で検索..." className="pl-8" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <DataTable 
              data={filteredFriends} 
              columns={columns} 
              searchable={false}
              pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => {} }}
            />
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
