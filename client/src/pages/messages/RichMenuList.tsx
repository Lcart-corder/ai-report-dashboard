import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Copy, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Link } from "wouter";
import { PageTemplate } from "@/components/page-template";
import { FolderManager } from "@/components/common/folder-manager";
import { Folder } from "@/types/schema";

export default function RichMenuListPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([
    { id: "1", name: "基本メニュー", tenant_id: "1", scope: "rich_menus", parent_id: null, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "2", name: "キャンペーン", tenant_id: "1", scope: "rich_menus", parent_id: null, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]);
  
  const [richMenus, setRichMenus] = useState([
    { id: 1, name: "基本メニュー_2025冬", status: "active", period: "2025/12/01 - 2026/02/28", clicks: 1250, folderId: "1" },
    { id: 2, name: "キャンペーン用メニュー", status: "inactive", period: "2025/12/15 - 2025/12/25", clicks: 450, folderId: "2" },
    { id: 3, name: "会員限定メニュー", status: "active", period: "無期限", clicks: 3200, folderId: "1" },
    { id: 4, name: "新規登録者用", status: "active", period: "無期限", clicks: 890, folderId: null },
  ]);

  const filteredMenus = selectedFolderId
    ? richMenus.filter(m => m.folderId === selectedFolderId)
    : richMenus;

  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      tenant_id: "1",
      scope: "rich_menus",
      parent_id: null,
      sort_order: folders.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setFolders([...folders, newFolder]);
  };

  const handleUpdateFolder = (id: string, name: string) => {
    setFolders(folders.map(f => f.id === id ? { ...f, name } : f));
  };

  const handleDeleteFolder = (id: string) => {
    setFolders(folders.filter(f => f.id !== id));
    // Move items to root (null)
    setRichMenus(richMenus.map(m => m.folderId === id ? { ...m, folderId: null } : m));
  };

  return (
    <PageTemplate title="リッチメニュー" breadcrumbs={[{ label: "メッセージ", href: "/messages" }, { label: "リッチメニュー" }]}>
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
                <Input placeholder="リッチメニューを検索..." className="pl-8" />
              </div>
            </div>
            <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white" asChild>
              <Link href="/messages/rich-menus/create">
                <Plus className="mr-2 h-4 w-4" /> 新規作成
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : "すべてのリッチメニュー"}
                <span className="ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                  {filteredMenus.length}件
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>プレビュー</TableHead>
                    <TableHead>メニュー名</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>表示期間</TableHead>
                    <TableHead>クリック数</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMenus.map((menu) => (
                    <TableRow key={menu.id}>
                      <TableCell>
                        <div className="w-16 h-10 bg-slate-100 rounded border flex items-center justify-center text-xs text-slate-400">
                          Image
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{menu.name}</TableCell>
                      <TableCell>
                        {menu.status === "active" ? (
                          <Badge className="bg-[#06C755]">表示中</Badge>
                        ) : (
                          <Badge variant="secondary">停止中</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{menu.period}</TableCell>
                      <TableCell>{menu.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" /> 詳細・分析
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
