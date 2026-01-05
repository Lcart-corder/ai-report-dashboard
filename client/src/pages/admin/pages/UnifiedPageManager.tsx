import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Page, StaticPage } from "@/types/schema";
import { 
  Plus, 
  Edit, 
  ExternalLink, 
  FileText, 
  Trash2, 
  Search,
  LayoutTemplate,
  Shield,
  FileCheck,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function UnifiedPageManagerPage() {
  const [, setLocation] = useLocation();
  const [shopPages, setShopPages] = useState<Page[]>([]);
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const [shopRes, staticRes] = await Promise.all([
        fetch("/api/admin/pages"),
        fetch("/api/admin/static-pages")
      ]);
      
      const shopData = await shopRes.json();
      const staticData = await staticRes.json();
      
      setShopPages(shopData);
      setStaticPages(staticData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error("ページの読み込みに失敗しました");
    }
  };

  const handleDeleteStatic = async (id: string) => {
    if (!confirm("このページを削除してもよろしいですか？")) return;
    
    try {
      const res = await fetch(`/api/admin/static-pages/${id}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        toast.success("ページを削除しました");
        fetchPages();
      } else {
        toast.error("削除に失敗しました");
      }
    } catch (err) {
      console.error(err);
      toast.error("エラーが発生しました");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
      case "published":
        return <Badge className="bg-green-500">公開中</Badge>;
      case "DRAFT":
      case "draft":
        return <Badge variant="secondary">下書き</Badge>;
      case "scheduled":
        return <Badge className="bg-orange-500">予約済み</Badge>;
      case "ARCHIVED":
        return <Badge variant="outline">アーカイブ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredShopPages = shopPages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStaticPages = staticPages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ページ管理</h1>
            <p className="text-muted-foreground">
              ショップページと固定ページを一元管理します
            </p>
          </div>
          <Button onClick={() => setLocation("/shop-builder")} className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
            <Sparkles className="w-4 h-4" />
            ショップページを作成
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ページを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="shop" className="space-y-4">
          <TabsList>
            <TabsTrigger value="shop" className="gap-2">
              <LayoutTemplate className="w-4 h-4" />
              ショップページ ({shopPages.length})
            </TabsTrigger>
            <TabsTrigger value="static" className="gap-2">
              <FileText className="w-4 h-4" />
              固定ページ ({staticPages.length})
            </TabsTrigger>
          </TabsList>

          {/* Shop Pages Tab */}
          <TabsContent value="shop">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>ショップページ</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setLocation("/admin/pages/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  新規作成
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">読み込み中...</div>
                ) : filteredShopPages.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <LayoutTemplate className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">
                      {searchQuery ? "ページが見つかりません" : "ショップページがありません"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery 
                        ? "別のキーワードで検索してみてください" 
                        : "ショップページビルダーで簡単に作成できます"}
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => setLocation("/shop-builder")} className="bg-[#06C755] hover:bg-[#05b34c] text-white">
                        <Sparkles className="mr-2 h-4 w-4" />
                        ショップページを作成
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>タイトル / URL</TableHead>
                        <TableHead>ステータス</TableHead>
                        <TableHead>テンプレート</TableHead>
                        <TableHead>最終更新日</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredShopPages.map((page) => (
                        <TableRow key={page.id}>
                          <TableCell>
                            <div className="font-medium">{page.title}</div>
                            <div className="text-xs text-gray-500">/s/{page.slug}</div>
                          </TableCell>
                          <TableCell>{getStatusBadge(page.status)}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {page.template_key}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {format(new Date(page.updated_at), "yyyy/MM/dd HH:mm")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {page.status === "PUBLISHED" && (
                                <Button variant="ghost" size="icon" asChild>
                                  <a href={`/s/${page.slug}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              <Button variant="outline" size="sm" onClick={() => setLocation(`/admin/pages/${page.id}`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                編集
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Static Pages Tab */}
          <TabsContent value="static">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>固定ページ</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setLocation("/admin/static-pages/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  新規作成
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">読み込み中...</div>
                ) : filteredStaticPages.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">
                      {searchQuery ? "ページが見つかりません" : "固定ページがありません"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery 
                        ? "別のキーワードで検索してみてください" 
                        : "利用規約やプライバシーポリシーなどの固定ページを作成しましょう"}
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => setLocation("/admin/static-pages/new")}>
                        <Plus className="mr-2 h-4 w-4" />
                        固定ページを作成
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>タイトル</TableHead>
                        <TableHead>ステータス</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>最終更新日</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaticPages.map((page) => (
                        <TableRow key={page.id} className="group">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {page.handle === "terms" && <FileCheck className="w-4 h-4 text-gray-400" />}
                              {page.handle === "privacy" && <Shield className="w-4 h-4 text-gray-400" />}
                              {page.handle === "law" && <FileText className="w-4 h-4 text-gray-400" />}
                              <span className="font-medium">{page.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(page.status)}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            /pages/{page.handle}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {format(new Date(page.updated_at), "yyyy/MM/dd HH:mm")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {page.status === "published" && (
                                <Button variant="ghost" size="icon" asChild>
                                  <a href={`/pages/${page.handle}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              <Button variant="outline" size="sm" onClick={() => setLocation(`/admin/static-pages/${page.id}`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                編集
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteStatic(page.id)} className="text-red-500 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation("/shop-builder")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#06C755]/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#06C755]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">ショップページ作成</h3>
                  <p className="text-sm text-gray-500">ウィザードで簡単作成</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation("/admin/pages/new")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <LayoutTemplate className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">カスタムページ</h3>
                  <p className="text-sm text-gray-500">自由にデザイン</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation("/admin/static-pages/new")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">固定ページ</h3>
                  <p className="text-sm text-gray-500">規約・ポリシー等</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
