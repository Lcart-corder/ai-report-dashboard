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
  Copy, 
  Code, 
  TrendingUp, 
  Users, 
  MousePointerClick,
  ExternalLink,
  Plus
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock data for site measurements
const MOCK_SITES = [
  {
    id: "site_001",
    name: "公式サイトトップ",
    url: "https://example.com/",
    pv: 12500,
    uu: 4200,
    cv: 125,
    status: "active"
  },
  {
    id: "site_002",
    name: "キャンペーンLP",
    url: "https://example.com/campaign/spring",
    pv: 8500,
    uu: 6800,
    cv: 450,
    status: "active"
  },
  {
    id: "site_003",
    name: "商品詳細ページA",
    url: "https://example.com/products/a",
    pv: 3200,
    uu: 1500,
    cv: 45,
    status: "active"
  },
  {
    id: "site_004",
    name: "ブログ記事B",
    url: "https://example.com/blog/b",
    pv: 1200,
    uu: 980,
    cv: 12,
    status: "inactive"
  }
];

export default function SiteMeasurementPage() {
  const [trackingCode] = useState(`<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXX');
</script>`);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackingCode);
    // In a real app, show a toast here
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">サイト計測</h1>
            <p className="text-sm text-gray-500 mt-1">
              Webサイトへのアクセスを計測し、LINE友だちの行動を分析します
            </p>
          </div>
          <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
            <Plus className="w-4 h-4" />
            計測URLを追加
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Tracking Code Card */}
          <Card className="lg:col-span-3 bg-slate-50 border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-600" />
                <CardTitle>共通計測タグ</CardTitle>
              </div>
              <CardDescription>
                以下のコードを計測したいWebサイトの &lt;head&gt; タグ内に設置してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                  {trackingCode}
                </pre>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="absolute top-2 right-2 h-8 gap-2"
                  onClick={copyToClipboard}
                >
                  <Copy className="w-3 h-3" />
                  コピー
                </Button>
              </div>
              <Alert className="mt-4 bg-blue-50 border-blue-200 text-blue-800">
                <AlertTitle className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  設置のポイント
                </AlertTitle>
                <AlertDescription className="text-blue-700">
                  このタグを設置することで、友だちがWebサイトを訪問した際にLINEアカウントと紐付けることができます。
                  コンバージョン計測やリターゲティング配信に活用できます。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">総PV数（今月）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">25,400</span>
                <span className="text-xs text-green-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +12.5%
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">ユニークユーザー数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">12,800</span>
                <span className="text-xs text-green-600 flex items-center gap-0.5">
                  <Users className="w-3 h-3" />
                  +8.2%
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">紐付け完了数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">3,450</span>
                <span className="text-xs text-gray-500">（紐付け率 27%）</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>計測URL一覧</CardTitle>
            <CardDescription>個別に計測設定を行っているURLの一覧です</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ページ名</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>PV</TableHead>
                  <TableHead>UU</TableHead>
                  <TableHead>CV</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_SITES.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">{site.name}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-gray-500">
                      <a href={site.url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                        {site.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </TableCell>
                    <TableCell>{site.pv.toLocaleString()}</TableCell>
                    <TableCell>{site.uu.toLocaleString()}</TableCell>
                    <TableCell>{site.cv.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={site.status === 'active' ? 'default' : 'secondary'}
                        className={site.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                      >
                        {site.status === 'active' ? '計測中' : '停止中'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MousePointerClick className="w-4 h-4" />
                      </Button>
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
