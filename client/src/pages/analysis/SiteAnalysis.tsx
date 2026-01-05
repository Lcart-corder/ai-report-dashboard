import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Globe,
  Users,
  MousePointerClick,
  Clock,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  RefreshCw,
} from "lucide-react";

// Mock data for site analytics
const pageViewsData = [
  { date: "3/1", views: 1240, users: 890 },
  { date: "3/2", views: 1580, users: 1120 },
  { date: "3/3", views: 1320, users: 950 },
  { date: "3/4", views: 1890, users: 1340 },
  { date: "3/5", views: 2100, users: 1520 },
  { date: "3/6", views: 1750, users: 1280 },
  { date: "3/7", views: 1650, users: 1190 },
];

const topPagesData = [
  { page: "/products/item-001", views: 3240, rate: "18.5%", avgTime: "3:24" },
  { page: "/", views: 2890, rate: "16.2%", avgTime: "2:15" },
  { page: "/products", views: 2450, rate: "13.8%", avgTime: "4:12" },
  { page: "/about", views: 1820, rate: "10.3%", avgTime: "1:45" },
  { page: "/contact", views: 1560, rate: "8.9%", avgTime: "2:30" },
];

const deviceData = [
  { name: "スマートフォン", value: 65, color: "#06C755" },
  { name: "デスクトップ", value: 25, color: "#00B900" },
  { name: "タブレット", value: 10, color: "#85E0A3" },
];

const trafficSourceData = [
  { source: "LINE", sessions: 4520, rate: "45.2%", bounce: "32.4%" },
  { source: "Google検索", sessions: 2340, rate: "23.4%", bounce: "45.8%" },
  { source: "直接アクセス", sessions: 1890, rate: "18.9%", bounce: "28.3%" },
  { source: "Facebook", sessions: 780, rate: "7.8%", bounce: "52.1%" },
  { source: "その他", sessions: 470, rate: "4.7%", bounce: "48.9%" },
];

export default function SiteAnalysisPage() {
  const [dateRange, setDateRange] = useState("7days");

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">サイト分析</h1>
            <p className="text-sm text-gray-500 mt-1">
              Webサイトのアクセス状況とユーザー行動を分析します
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">今日</SelectItem>
                <SelectItem value="7days">過去7日間</SelectItem>
                <SelectItem value="30days">過去30日間</SelectItem>
                <SelectItem value="90days">過去90日間</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              エクスポート
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                ページビュー
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">11,430</span>
                <span className="text-xs text-green-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +15.3%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">前期比</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Users className="w-4 h-4" />
                ユニークユーザー
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">8,290</span>
                <span className="text-xs text-green-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +12.8%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">前期比</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                平均滞在時間
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">2:45</span>
                <span className="text-xs text-red-600 flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" />
                  -5.2%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">前期比</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <MousePointerClick className="w-4 h-4" />
                直帰率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">38.5%</span>
                <span className="text-xs text-green-600 flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" />
                  -3.1%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">前期比</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="pages">ページ別</TabsTrigger>
            <TabsTrigger value="traffic">流入元</TabsTrigger>
            <TabsTrigger value="devices">デバイス</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Page Views Chart */}
            <Card>
              <CardHeader>
                <CardTitle>ページビュー推移</CardTitle>
                <CardDescription>日別のページビューとユーザー数の推移</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={pageViewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#06C755"
                      strokeWidth={2}
                      name="ページビュー"
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#00B900"
                      strokeWidth={2}
                      name="ユーザー数"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>人気ページランキング</CardTitle>
                <CardDescription>アクセス数の多いページTOP5</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ページURL</TableHead>
                      <TableHead>ページビュー</TableHead>
                      <TableHead>割合</TableHead>
                      <TableHead>平均滞在時間</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPagesData.map((page, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{page.page}</TableCell>
                        <TableCell>{page.views.toLocaleString()}</TableCell>
                        <TableCell>{page.rate}</TableCell>
                        <TableCell>{page.avgTime}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traffic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>流入元分析</CardTitle>
                <CardDescription>トラフィックソース別のセッション数</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>流入元</TableHead>
                      <TableHead>セッション数</TableHead>
                      <TableHead>割合</TableHead>
                      <TableHead>直帰率</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trafficSourceData.map((source, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{source.source}</TableCell>
                        <TableCell>{source.sessions.toLocaleString()}</TableCell>
                        <TableCell>{source.rate}</TableCell>
                        <TableCell>{source.bounce}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>デバイス別アクセス</CardTitle>
                <CardDescription>使用デバイスの内訳</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
