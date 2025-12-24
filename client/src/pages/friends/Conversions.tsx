import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  MousePointerClick, 
  TrendingUp, 
  Calendar,
  Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for conversions
const MOCK_CONVERSIONS = [
  {
    id: "cv_001",
    name: "商品購入完了",
    trigger: "URLアクセス",
    url: "https://example.com/thanks",
    count: 124,
    rate: "2.4%",
    status: "active",
    last_updated: "2024-03-15 14:30"
  },
  {
    id: "cv_002",
    name: "資料請求",
    trigger: "フォーム回答",
    url: "-",
    count: 45,
    rate: "1.8%",
    status: "active",
    last_updated: "2024-03-14 11:20"
  },
  {
    id: "cv_003",
    name: "会員登録",
    trigger: "URLアクセス",
    url: "https://example.com/register/complete",
    count: 89,
    rate: "5.6%",
    status: "paused",
    last_updated: "2024-03-10 09:15"
  },
  {
    id: "cv_004",
    name: "来店予約",
    trigger: "イベント予約",
    url: "-",
    count: 32,
    rate: "3.2%",
    status: "active",
    last_updated: "2024-03-12 16:45"
  }
];

export default function ConversionsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversions = MOCK_CONVERSIONS.filter(cv => 
    cv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">コンバージョン管理</h1>
            <p className="text-sm text-gray-500 mt-1">
              友だちの行動を計測し、マーケティング施策の効果を可視化します
            </p>
          </div>
          <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
            <Plus className="w-4 h-4" />
            新規作成
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="コンバージョン名で検索..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            フィルター
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">総コンバージョン数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">290</span>
                <span className="text-xs text-green-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +12.5%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">先月比</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">平均CVR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">3.2%</span>
                <span className="text-xs text-green-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +0.4%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">全期間平均</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">アクティブ設定数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">3</span>
                <span className="text-xs text-gray-500">/ 5設定中</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">稼働中の計測設定</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>コンバージョン一覧</CardTitle>
            <CardDescription>登録済みのコンバージョン計測設定一覧です</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>コンバージョン名</TableHead>
                  <TableHead>トリガー</TableHead>
                  <TableHead>計測URL / 条件</TableHead>
                  <TableHead>発生回数</TableHead>
                  <TableHead>CVR</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>最終更新</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConversions.map((cv) => (
                  <TableRow key={cv.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MousePointerClick className="w-4 h-4 text-gray-400" />
                        {cv.name}
                      </div>
                    </TableCell>
                    <TableCell>{cv.trigger}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-gray-500">
                      {cv.url}
                    </TableCell>
                    <TableCell>{cv.count}回</TableCell>
                    <TableCell>{cv.rate}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={cv.status === 'active' ? 'default' : 'secondary'}
                        className={cv.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                      >
                        {cv.status === 'active' ? '稼働中' : '停止中'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {cv.last_updated}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuItem>詳細を確認</DropdownMenuItem>
                          <DropdownMenuItem>設定を編集</DropdownMenuItem>
                          <DropdownMenuItem>計測タグ発行</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">削除</DropdownMenuItem>
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
  );
}
