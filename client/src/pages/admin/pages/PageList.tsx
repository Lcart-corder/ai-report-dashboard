import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Page } from "@/types/schema";
import { Plus, Edit, ExternalLink, FileText } from "lucide-react";
import { format } from "date-fns";

export default function PageListPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetch("/api/admin/pages")
      .then(res => res.json())
      .then(data => {
        setPages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-green-500">公開中</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">下書き</Badge>;
      case "ARCHIVED":
        return <Badge variant="outline">アーカイブ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ショップページ管理</h1>
            <p className="text-muted-foreground">
              ショップの特設ページやLPを作成・管理します。
            </p>
          </div>
          <Button onClick={() => setLocation("/admin/pages/new")}>
            <Plus className="mr-2 h-4 w-4" />
            新規ページ作成
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
                <p className="text-gray-500 mb-4">新しいページを作成してショップを充実させましょう。</p>
                <Button onClick={() => setLocation("/admin/pages/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  新規ページ作成
                </Button>
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
                  {pages.map((page) => (
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
      </div>
    </DashboardLayout>
  );
}
