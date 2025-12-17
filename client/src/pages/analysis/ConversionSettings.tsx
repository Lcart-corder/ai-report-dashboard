import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MoreHorizontal, Pencil, Trash2, Copy, ExternalLink, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { FolderManager } from "@/components/common/folder-manager";
import { Folder } from "@/types/schema";
import { toast } from "sonner";

export default function ConversionSettingsPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([
    { id: "1", name: "ECサイト", tenant_id: "1", scope: "conversions", parent_id: null, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "2", name: "LP", tenant_id: "1", scope: "conversions", parent_id: null, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]);

  const [conversions, setConversions] = useState<{
    id: number;
    name: string;
    type: string;
    value: number;
    status: string;
    count: number;
    last_tracked: string;
    folderId?: string;
  }[]>([
    { id: 1, name: "商品購入完了", type: "url", value: 5000, status: "active", count: 124, last_tracked: "2025-12-18 10:30", folderId: "1" },
    { id: 2, name: "資料請求", type: "action", value: 0, status: "active", count: 45, last_tracked: "2025-12-17 15:20", folderId: "2" },
    { id: 3, name: "会員登録", type: "url", value: 0, status: "inactive", count: 890, last_tracked: "2025-11-30 09:15", folderId: "1" },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredConversions = selectedFolderId
    ? conversions.filter(c => c.folderId === selectedFolderId)
    : conversions;

  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      tenant_id: "1",
      scope: "conversions",
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
    setConversions(conversions.map(c => c.folderId === id ? { ...c, folderId: undefined } : c));
    toast.success("フォルダを削除しました");
  };

  return (
    <PageTemplate title="コンバージョン設定" breadcrumbs={[{ label: "分析", href: "/analysis" }, { label: "コンバージョン設定" }]}>
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
        <div className="flex-1 space-y-6 overflow-y-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="コンバージョンを検索..." className="pl-8" />
              </div>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white">
                  <Plus className="mr-2 h-4 w-4" /> 新規作成
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>コンバージョン新規作成</DialogTitle>
                  <DialogDescription>
                    新しいコンバージョン計測ポイントを作成します。
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      名前 <span className="text-red-500">*</span>
                    </Label>
                    <Input id="name" placeholder="例：商品購入完了" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="folder" className="text-right">
                      フォルダ
                    </Label>
                    <Select defaultValue={selectedFolderId || undefined}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="フォルダを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {folders.map(f => (
                          <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      計測タイプ
                    </Label>
                    <Select defaultValue="url">
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="url">URL到達（サンクスページなど）</SelectItem>
                        <SelectItem value="action">アクション実行（ボタンクリックなど）</SelectItem>
                        <SelectItem value="time">滞在時間</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="url" className="text-right">
                      到達URL
                    </Label>
                    <div className="col-span-3 space-y-2">
                      <Select defaultValue="exact">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exact">完全一致</SelectItem>
                          <SelectItem value="prefix">前方一致</SelectItem>
                          <SelectItem value="contains">部分一致</SelectItem>
                          <SelectItem value="regex">正規表現</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="https://example.com/thanks" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="value" className="text-right">
                      コンバージョン値
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input id="value" type="number" defaultValue={0} className="w-32" />
                      <span className="text-sm text-muted-foreground">円</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">有効/無効</Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Switch id="status" defaultChecked />
                      <Label htmlFor="status">有効にする</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>キャンセル</Button>
                  <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white" onClick={() => setIsCreateOpen(false)}>作成する</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : "すべてのコンバージョン"}
                <span className="ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                  {filteredConversions.length}件
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名前</TableHead>
                    <TableHead>タイプ</TableHead>
                    <TableHead>値</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>計測数</TableHead>
                    <TableHead>最終計測</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConversions.map((cv) => (
                    <TableRow key={cv.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{cv.name}</span>
                          {cv.folderId && (
                            <span className="text-xs text-gray-400">
                              {folders.find(f => f.id === cv.folderId)?.name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {cv.type === "url" && <Badge variant="outline">URL到達</Badge>}
                        {cv.type === "action" && <Badge variant="outline">アクション</Badge>}
                      </TableCell>
                      <TableCell>¥{cv.value.toLocaleString()}</TableCell>
                      <TableCell>
                        {cv.status === "active" ? (
                          <Badge className="bg-[#06C755]">有効</Badge>
                        ) : (
                          <Badge variant="secondary">無効</Badge>
                        )}
                      </TableCell>
                      <TableCell>{cv.count.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{cv.last_tracked}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" /> 編集
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" /> 計測タグ取得
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

          <Card>
            <CardHeader>
              <CardTitle>計測タグ設置</CardTitle>
              <CardDescription>
                以下のタグを計測したいWebサイトの全ページの &lt;head&gt; タグ内に設置してください。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-xs overflow-x-auto relative group">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy className="h-3 w-3 mr-1" /> コピー
                </Button>
                <pre>{`<script>
  (function(l,m,e,s,s_id) {
    l['LMessageObject'] = s; l[s] = l[s] || function() {
      (l[s].q = l[s].q || []).push(arguments)
    };
    l[s].l = 1 * new Date();
    var a = m.createElement(e);
    var m = m.getElementsByTagName(e)[0];
    a.async = 1; a.src = "https://l-message.jp/js/lme.js?id=" + s_id;
    m.parentNode.insertBefore(a, m)
  })(window, document, 'script', 'lme', 'YOUR_ACCOUNT_ID');
</script>`}</pre>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" /> 設置マニュアルを見る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}
