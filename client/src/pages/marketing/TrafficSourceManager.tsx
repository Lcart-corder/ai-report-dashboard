import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FolderPlus, QrCode, Link as LinkIcon, MoreHorizontal, Copy, Download } from "lucide-react";
import { Link } from "wouter";
import { PageTemplate } from "@/components/page-template";
import { useState } from "react";
import { toast } from "sonner";

// Mock Data
const trafficSources = [
  { id: 1, name: "InstagramキャンペーンA", type: "qr", folder: "SNS", created_at: "2024-01-15", friends: 124, blocks: 5, cv: 12 },
  { id: 2, name: "店舗POP（レジ前）", type: "qr", folder: "店舗", created_at: "2024-01-10", friends: 450, blocks: 12, cv: 85 },
  { id: 3, name: "Twitterプロフィール", type: "url", folder: "SNS", created_at: "2024-01-05", friends: 89, blocks: 2, cv: 5 },
  { id: 4, name: "メルマガ（1月号）", type: "url", folder: "メルマガ", created_at: "2024-01-20", friends: 56, blocks: 1, cv: 15 },
];

export default function TrafficSourceManager() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URLをコピーしました");
  };

  return (
    <PageTemplate 
      title="流入経路分析" 
      description="友だち追加の経路を作成・分析し、経路ごとのアクションを設定します。"
      breadcrumbs={[{ label: "分析", href: "/analysis" }, { label: "流入経路分析" }]}
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="流入経路を検索..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <FolderPlus className="mr-2 h-4 w-4" /> フォルダ管理
            </Button>
          </div>
          <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white" asChild>
            <Link href="/analysis/traffic/create">
              <Plus className="mr-2 h-4 w-4" /> 新規作成
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-muted-foreground">総流入数</div>
              <div className="text-2xl font-bold mt-2">719</div>
              <div className="text-xs text-green-600 mt-1">先月比 +12.5%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-muted-foreground">ブロック率</div>
              <div className="text-2xl font-bold mt-2">2.8%</div>
              <div className="text-xs text-red-600 mt-1">先月比 +0.2%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-muted-foreground">CV数</div>
              <div className="text-2xl font-bold mt-2">117</div>
              <div className="text-xs text-green-600 mt-1">先月比 +5.4%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-muted-foreground">CVR</div>
              <div className="text-2xl font-bold mt-2">16.2%</div>
              <div className="text-xs text-slate-500 mt-1">平均 15.0%</div>
            </CardContent>
          </Card>
        </div>

        {/* Traffic Sources List */}
        <Card>
          <CardHeader>
            <CardTitle>流入経路一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>管理名</TableHead>
                  <TableHead>タイプ</TableHead>
                  <TableHead>フォルダ</TableHead>
                  <TableHead className="text-right">友だち追加</TableHead>
                  <TableHead className="text-right">ブロック</TableHead>
                  <TableHead className="text-right">CV</TableHead>
                  <TableHead className="text-right">作成日</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trafficSources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{source.name}</span>
                        <span className="text-xs text-muted-foreground">ID: {1000 + source.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {source.type === 'qr' ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <QrCode className="w-3 h-3 mr-1" /> QRコード
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <LinkIcon className="w-3 h-3 mr-1" /> URL
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{source.folder}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">{source.friends}</TableCell>
                    <TableCell className="text-right text-red-600">{source.blocks}</TableCell>
                    <TableCell className="text-right text-green-600">{source.cv}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{source.created_at}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="URLをコピー" onClick={() => handleCopyUrl(`https://lin.ee/example${source.id}`)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        {source.type === 'qr' && (
                          <Button variant="ghost" size="icon" title="QRコードをダウンロード">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
