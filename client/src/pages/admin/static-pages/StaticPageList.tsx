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
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">公開中</span>;
    } else if (page.status === "scheduled") {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">予約済み</span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">下書き</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between pt-4">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">ページ</h1>
          <Button onClick={() => setLocation("/admin/static-pages/new")} className="bg-[#008060] hover:bg-[#006e52] text-white shadow-sm h-9 px-4 font-medium">
            <Plus className="mr-2 h-4 w-4" />
            ページを追加
          </Button>
        </div>

        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-0">
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
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="w-[40%] font-medium text-gray-600 text-xs uppercase tracking-wider pl-6">タイトル</TableHead>
                    <TableHead className="font-medium text-gray-600 text-xs uppercase tracking-wider">ステータス</TableHead>
                    <TableHead className="font-medium text-gray-600 text-xs uppercase tracking-wider">URL</TableHead>
                    <TableHead className="font-medium text-gray-600 text-xs uppercase tracking-wider">最終更新日</TableHead>
                    <TableHead className="text-right font-medium text-gray-600 text-xs uppercase tracking-wider pr-6">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0 group">
                      <TableCell className="font-medium pl-6 py-3">
                        <Link href={`/admin/static-pages/${page.id}`} className="hover:underline text-gray-900 font-semibold text-sm">
                          {page.title}
                        </Link>
                      </TableCell>
                      <TableCell className="py-3">{getStatusBadge(page)}</TableCell>
                      <TableCell className="text-sm text-gray-500 py-3">
                        /pages/{page.handle}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 py-3">
                        {format(new Date(page.updated_at), "yyyy/MM/dd HH:mm")}
                      </TableCell>
                      <TableCell className="text-right pr-6 py-3">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {page.status === "published" && (
                            <Button variant="ghost" size="icon" asChild className="text-gray-500 hover:text-gray-900">
                              <a href={`/pages/${page.handle}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(page.id)} className="text-gray-400 hover:text-red-600">
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
      </div>
    </DashboardLayout>
  );
}
