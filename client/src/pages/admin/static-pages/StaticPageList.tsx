import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StaticPage } from "@/types/schema";
import { Plus, Edit, ExternalLink, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function StaticPageListPage() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = () => {
    fetch("/api/admin/static-pages")
      .then(res => res.json())
      .then(data => {
        setPages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = async (id: string) => {
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

  const getStatusBadge = (page: StaticPage) => {
    if (page.status === "published") {
      return <Badge className="bg-green-500">公開中</Badge>;
    } else if (page.status === "scheduled") {
      return <Badge variant="outline" className="text-orange-500 border-orange-500">予約済み</Badge>;
    } else {
      return <Badge variant="secondary">下書き</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ページ管理</h1>
            <p className="text-muted-foreground">
              About Us、プライバシーポリシーなどの固定ページを作成・管理します。
            </p>
          </div>
          <Button onClick={() => setLocation("/admin/static-pages/new")}>
            <Plus className="mr-2 h-4 w-4" />
            ページを追加
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ページ一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">読み込み中...</div>
            ) : pages.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">ページがありません</h3>
                <p className="text-gray-500 mb-4">新しいページを作成してショップの情報を充実させましょう。</p>
                <Button onClick={() => setLocation("/admin/static-pages/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  ページを追加
                </Button>
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
                  {pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/static-pages/${page.id}`} className="hover:underline">
                          {page.title}
                        </Link>
                      </TableCell>
                      <TableCell>{getStatusBadge(page)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        /pages/{page.handle}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(page.updated_at), "yyyy/MM/dd HH:mm")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {page.status === "published" && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={`/pages/${page.handle}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(page.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
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
      </div>
    </DashboardLayout>
  );
}
