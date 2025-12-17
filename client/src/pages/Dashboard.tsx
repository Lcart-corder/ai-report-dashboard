import { useLayout } from "@/contexts/layout-context"
import { AppSidebar } from "@/components/app-sidebar"
import { cn } from "@/lib/utils"
import { 
  Download, 
  FileText, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  MoreHorizontal,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  Search,
  Folder,
  Trash2,
  Copy
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DashboardPage() {
  const { sidebarCollapsed } = useLayout()
  const [timeRange, setTimeRange] = useState("過去30日")
  const [activeChartTab, setActiveChartTab] = useState("売上")
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)
  const [isCreateReportDialogOpen, setIsCreateReportDialogOpen] = useState(false)

  // Mock Data Generators based on Time Range
  const getKpiData = (range: string) => {
    const multiplier = range === "過去30日" ? 1 : range === "今月" ? 0.8 : range === "先月" ? 0.9 : 0.25
    return [
      { label: "総売上", value: `¥${(3.2 * multiplier).toFixed(1)}M`, change: "+22.5%", trend: "up", chart: "bg-emerald-500" },
      { label: "注文数", value: Math.floor(1842 * multiplier).toLocaleString(), change: "+18.3%", trend: "up", chart: "bg-blue-500" },
      { label: "転換率", value: "6.5%", change: "+5.2%", trend: "up", chart: "bg-purple-500" },
      { label: "平均注文額", value: "¥1,738", change: "+3.8%", trend: "up", chart: "bg-orange-500" },
      { label: "リピート率", value: "42.3%", change: "+12.4%", trend: "up", chart: "bg-teal-500" },
      { label: "友だち純増", value: `+${Math.floor(2124 * multiplier).toLocaleString()}`, change: "+8.7%", trend: "up", chart: "bg-emerald-400" },
      { label: "ブロック率", value: "7.8%", change: "-1.2%", trend: "down", chart: "bg-red-400", isGoodDown: true },
      { label: "配信クリック率", value: "24.6%", change: "+6.1%", trend: "up", chart: "bg-blue-600" },
    ]
  }

  const kpis = getKpiData(timeRange)

  // Chart Data Mock
  const getChartPath = (type: string) => {
    switch(type) {
      case "売上": return "M0,200 C100,180 200,220 300,150 C400,80 500,120 600,100 C700,80 800,40 900,60"
      case "注文": return "M0,220 C100,200 200,180 300,190 C400,160 500,140 600,150 C700,120 800,100 900,110"
      case "友だち追加": return "M0,240 C100,230 200,220 300,200 C400,180 500,160 600,140 C700,120 800,100 900,80"
      case "クリック": return "M0,250 C100,240 200,250 300,230 C400,200 500,220 600,180 C700,160 800,140 900,120"
      default: return "M0,200 C100,180 200,220 300,150 C400,80 500,120 600,100 C700,80 800,40 900,60"
    }
  }

  const handleExport = () => {
    toast.success("レポートのエクスポートを開始しました", {
      description: "完了次第、メールで通知されます。"
    })
    setIsExportDialogOpen(false)
  }

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("カスタムレポートを作成しました", {
      description: "「マイレポート」フォルダに保存されました。"
    })
    setIsCreateReportDialogOpen(false)
  }

  // Mock Data for Tables (unchanged)
  const topProducts = [
    { name: "ベーシックTシャツ", price: "¥513K", count: "342件", width: "85%" },
    { name: "デニムパンツ", price: "¥896K", count: "248件", width: "70%" },
    { name: "スニーカー", price: "¥743K", count: "186件", width: "55%" },
    { name: "キャップ", price: "¥149K", count: "124件", width: "40%" },
    { name: "トートバッグ", price: "¥196K", count: "98件", width: "30%" },
  ]

  const recentOrders = [
    { id: "#1842", customer: "田中太郎", amount: "¥14,800", status: "配送済み", statusColor: "bg-green-100 text-green-700" },
    { id: "#1841", customer: "佐藤花子", amount: "¥28,400", status: "配送中", statusColor: "bg-blue-100 text-blue-700" },
    { id: "#1840", customer: "鈴木一郎", amount: "¥9,800", status: "配送済み", statusColor: "bg-green-100 text-green-700" },
    { id: "#1839", customer: "高橋美咲", amount: "¥32,600", status: "処理中", statusColor: "bg-yellow-100 text-yellow-700" },
    { id: "#1838", customer: "伊藤健太", amount: "¥18,200", status: "配送済み", statusColor: "bg-green-100 text-green-700" },
  ]

  const deliveryPerformance = [
    { name: "誕生日クーポン", target: "892", ctr: "51.1%", cv: "456" },
    { name: "登録後フォロー（1日）", target: "2,156", ctr: "33%", cv: "712" },
    { name: "カート放棄リマインド", target: "624", ctr: "31.7%", cv: "198" },
    { name: "登録後フォロー（3日）", target: "1,842", ctr: "28.5%", cv: "524" },
    { name: "新春キャンペーン", target: "26,124", ctr: "26.2%", cv: "6,842" },
  ]

  const unreadChats = [
    { customer: "山田太郎", message: "在庫確認をお願いします", time: "5分前", status: "未読", statusColor: "bg-red-100 text-red-700" },
    { customer: "佐々木花子", message: "配送状況を教えてください", time: "12分前", status: "要対応", statusColor: "bg-orange-100 text-orange-700" },
    { customer: "中村健", message: "サイズ変更は可能ですか？", time: "28分前", status: "未読", statusColor: "bg-red-100 text-red-700" },
    { customer: "小林美咲", message: "返品の手続きについて", time: "1時間前", status: "要対応", statusColor: "bg-orange-100 text-orange-700" },
    { customer: "加藤誠", message: "クーポンコードが使えません", time: "2時間前", status: "未読", statusColor: "bg-red-100 text-red-700" },
  ]

  const upcomingEvents = [
    { name: "新商品発表会", date: "2025/01/18 14:00", count: "42名", status: "確定", statusColor: "bg-green-100 text-green-700" },
    { name: "セミナー", date: "2025/01/20 10:00", count: "28名", status: "確定", statusColor: "bg-green-100 text-green-700" },
    { name: "体験会", date: "2025/01/22 15:00", count: "15名", status: "承認待ち", statusColor: "bg-yellow-100 text-yellow-700" },
    { name: "ワークショップ", date: "2025/01/25 13:00", count: "35名", status: "確定", statusColor: "bg-green-100 text-green-700" },
    { name: "相談会", date: "2025/01/27 16:00", count: "8名", status: "承認待ち", statusColor: "bg-yellow-100 text-yellow-700" },
  ]

  const customReports = [
    { name: "月次売上レポート", author: "管理者", folder: "売上分析", date: "2025/01/15" },
    { name: "流入経路別CV分析", author: "田中", folder: "流入分析", date: "2025/01/14" },
  ]

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
      <AppSidebar />

      <main 
        className={cn(
          "flex-1 overflow-y-auto transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="p-8 max-w-[1600px] mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span>ホーム</span>
                <ChevronRight className="w-4 h-4" />
                <span>分析ダッシュボード</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">分析ダッシュボード</h1>
              <p className="text-sm text-gray-500 mt-1">売上・友だち・配信の状況をまとめて把握</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="期間を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="過去30日">過去30日</SelectItem>
                  <SelectItem value="今月">今月</SelectItem>
                  <SelectItem value="先月">先月</SelectItem>
                  <SelectItem value="過去7日">過去7日</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="bg-white" onClick={() => toast.info("比較モードは現在開発中です")}>
                比較
              </Button>
              
              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-white gap-2">
                    <Download className="w-4 h-4" />
                    エクスポート
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>データのエクスポート</DialogTitle>
                    <DialogDescription>
                      現在のダッシュボードデータをCSVまたはPDF形式でダウンロードします。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="format" className="text-right">形式</Label>
                      <Select defaultValue="csv">
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="形式を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV (Excel)</SelectItem>
                          <SelectItem value="pdf">PDF Report</SelectItem>
                          <SelectItem value="json">JSON Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="range" className="text-right">範囲</Label>
                      <Select defaultValue="all">
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="範囲を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全データ</SelectItem>
                          <SelectItem value="visible">表示中のみ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>キャンセル</Button>
                    <Button onClick={handleExport} className="bg-[#06C755] hover:bg-[#05b34c] text-white">エクスポート実行</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-white gap-2">
                    <FileText className="w-4 h-4" />
                    ファイル
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>ファイル管理</DialogTitle>
                    <DialogDescription>
                      アップロードされたファイルや生成されたレポートを管理します。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input placeholder="ファイルを検索..." className="pl-8" />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        フィルター
                      </Button>
                    </div>
                    <div className="border rounded-md">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">ファイル名</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">サイズ</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">更新日</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {[
                            { name: "2025-01_sales_report.pdf", size: "2.4 MB", date: "2025/01/15" },
                            { name: "customer_list_v2.csv", size: "856 KB", date: "2025/01/14" },
                            { name: "campaign_assets.zip", size: "14.2 MB", date: "2025/01/10" },
                          ].map((file, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                {file.name}
                              </td>
                              <td className="px-4 py-3 text-gray-500">{file.size}</td>
                              <td className="px-4 py-3 text-gray-500">{file.date}</td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isCreateReportDialogOpen} onOpenChange={setIsCreateReportDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#06C755] text-white hover:bg-[#05b34c] gap-2 shadow-sm">
                    <Plus className="w-4 h-4" />
                    カスタムレポートを作成
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新規カスタムレポート</DialogTitle>
                    <DialogDescription>
                      分析したい指標と期間を選択して、新しいレポートを作成します。
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateReport}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="report-name">レポート名</Label>
                        <Input id="report-name" placeholder="例: 2025年新春キャンペーン分析" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="report-type">分析タイプ</Label>
                        <Select defaultValue="sales">
                          <SelectTrigger>
                            <SelectValue placeholder="タイプを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sales">売上分析</SelectItem>
                            <SelectItem value="friends">友だち増減分析</SelectItem>
                            <SelectItem value="messages">配信パフォーマンス</SelectItem>
                            <SelectItem value="funnel">コンバージョンファネル</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="folder">保存先フォルダ</Label>
                        <Select defaultValue="my-reports">
                          <SelectTrigger>
                            <SelectValue placeholder="フォルダを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="my-reports">マイレポート</SelectItem>
                            <SelectItem value="shared">共有レポート</SelectItem>
                            <SelectItem value="sales">売上管理</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsCreateReportDialogOpen(false)}>キャンセル</Button>
                      <Button type="submit" className="bg-[#06C755] hover:bg-[#05b34c] text-white">作成する</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, index) => (
              <div key={index} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => toast.info(`${kpi.label}の詳細を表示します`)}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-500">{kpi.label}</span>
                  <div className={cn(
                    "flex items-center text-xs font-bold",
                    (kpi.trend === "up" && !kpi.isGoodDown) || (kpi.trend === "down" && kpi.isGoodDown) 
                      ? "text-emerald-600" 
                      : "text-red-600"
                  )}>
                    {kpi.trend === "up" ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {kpi.change}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-4">{kpi.value}</div>
                <div className="flex items-end gap-1 h-8">
                  {[40, 65, 45, 70, 55, 80, 60, 90].map((h, i) => (
                    <div 
                      key={i} 
                      className={cn("w-full rounded-t-sm opacity-80 transition-all duration-500", kpi.chart)} 
                      style={{ height: `${h * (timeRange === "過去30日" ? 1 : 0.7)}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">総売上の推移</h3>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {["売上", "注文", "友だち追加", "クリック"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveChartTab(tab)}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded transition-all",
                        activeChartTab === tab
                          ? "bg-white text-gray-900 shadow-sm font-bold"
                          : "text-gray-500 hover:text-gray-900"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64 w-full bg-gray-50 rounded-lg flex items-center justify-center relative overflow-hidden group">
                {/* Chart Line */}
                <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#06C755" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d={`${getChartPath(activeChartTab)} L900,256 L0,256 Z`} 
                    fill="url(#gradient)" 
                    className="transition-all duration-500 ease-in-out"
                  />
                  <path 
                    d={getChartPath(activeChartTab)} 
                    fill="none" 
                    stroke="#06C755" 
                    strokeWidth="3" 
                    className="transition-all duration-500 ease-in-out"
                  />
                </svg>
                
                {/* Interactive Overlay (Mock) */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="bg-white p-2 rounded shadow-lg border border-gray-100 text-xs">
                    <div className="font-bold text-gray-900">2025/01/15</div>
                    <div className="text-[#06C755] font-bold">¥128,400</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-[#06C755]"></span>
                  LINE経由
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Shopify経由
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  オフライン
                </div>
              </div>
            </div>

            {/* Highlights & Rankings */}
            <div className="space-y-6">
              {/* Highlights */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">ハイライト</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                    <span className="text-sm text-gray-600">今日の売上</span>
                    <span className="text-sm font-bold text-emerald-600">+¥128K</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                    <span className="text-sm text-gray-600">友だち追加</span>
                    <span className="text-sm font-bold text-emerald-600">+124</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                    <span className="text-sm text-gray-600">ブロック</span>
                    <span className="text-sm font-bold text-red-600">-18</span>
                  </div>
                </div>
              </div>

              {/* Channel Sales */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">チャネル別売上 Top5</h3>
                <div className="space-y-4">
                  {[
                    { label: "LINE経由", value: "¥1280K", width: "80%", color: "bg-[#06C755]" },
                    { label: "Shopify直販", value: "¥960K", width: "60%", color: "bg-blue-500" },
                    { label: "Instagram", value: "¥640K", width: "40%", color: "bg-pink-500" },
                    { label: "QRコード", value: "¥256K", width: "15%", color: "bg-gray-500" },
                    { label: "その他", value: "¥64K", width: "5%", color: "bg-gray-300" },
                  ].map((item, i) => (
                    <div key={i} className="cursor-pointer group">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 group-hover:text-gray-900">{item.label}</span>
                        <span className="font-bold text-gray-900">{item.value}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all group-hover:opacity-80", item.color)} style={{ width: item.width }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3 Column Grid for Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Referrers */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">上位参照元</h3>
              <div className="space-y-3">
                {[
                  { label: "QRコード", value: "842", width: "100%" },
                  { label: "公式サイトURL", value: "624", width: "74%" },
                  { label: "Instagram広告", value: "512", width: "60%" },
                  { label: "Twitter", value: "356", width: "42%" },
                  { label: "Google検索", value: "248", width: "29%" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded -mx-1">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-bold text-gray-900">{item.value}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-600 rounded-full" style={{ width: item.width }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device & Sales Composition */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">売上構成</h3>
              <div className="flex items-center justify-center py-4 relative group cursor-pointer">
                <div className="relative w-32 h-32 rounded-full border-8 border-gray-100 flex items-center justify-center transition-transform group-hover:scale-105">
                  <div className="absolute inset-0 rounded-full border-8 border-[#06C755] border-t-transparent border-l-transparent rotate-45"></div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Total</div>
                    <div className="font-bold text-gray-900">¥3.2M</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between items-center text-sm p-1 hover:bg-gray-50 rounded cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#06C755]"></span>
                    <span className="text-gray-600">LINE経由</span>
                  </div>
                  <span className="font-bold text-gray-900">50%</span>
                </div>
                <div className="flex justify-between items-center text-sm p-1 hover:bg-gray-50 rounded cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-gray-600">Shopify経由</span>
                  </div>
                  <span className="font-bold text-gray-900">30%</span>
                </div>
                <div className="flex justify-between items-center text-sm p-1 hover:bg-gray-50 rounded cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                    <span className="text-gray-600">その他</span>
                  </div>
                  <span className="font-bold text-gray-900">20%</span>
                </div>
              </div>
            </div>

            {/* Conversion Funnel */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">コンバージョンファネル</h3>
              <div className="space-y-4">
                {[
                  { label: "閲覧", value: "45,280", percent: "100%", color: "bg-blue-100 text-blue-700" },
                  { label: "友だち追加", value: "28,492", percent: "63%", color: "bg-blue-200 text-blue-800" },
                  { label: "クリック", value: "7,012", percent: "25%", color: "bg-blue-300 text-blue-900" },
                  { label: "購入", value: "1,842", percent: "26%", color: "bg-[#06C755] text-white" },
                ].map((item, i) => (
                  <div key={i} className="relative group cursor-pointer">
                    <div className="flex justify-between text-xs mb-1 z-10 relative px-2">
                      <span className="font-medium">{item.label}</span>
                      <span className="font-bold">{item.value}</span>
                    </div>
                    <div className={cn("h-8 rounded flex items-center justify-center text-xs font-bold transition-all group-hover:opacity-90", item.color)} style={{ width: item.percent }}>
                      {item.percent}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Tables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">上位商品</h3>
              <div className="space-y-4">
                {topProducts.map((product, i) => (
                  <div key={i} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                        <span className="text-sm font-bold text-gray-900">{product.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: product.width }}></div>
                        </div>
                        <span className="text-xs text-gray-500 w-10 text-right">{product.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">最新注文</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-3 py-2 font-medium">注文番号</th>
                      <th className="px-3 py-2 font-medium">顧客</th>
                      <th className="px-3 py-2 font-medium">金額</th>
                      <th className="px-3 py-2 font-medium">状態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentOrders.map((order, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => toast.info(`注文 ${order.id} の詳細を開きます`)}>
                        <td className="px-3 py-3 font-mono text-gray-600">{order.id}</td>
                        <td className="px-3 py-3 text-gray-900">{order.customer}</td>
                        <td className="px-3 py-3 font-medium text-gray-900">{order.amount}</td>
                        <td className="px-3 py-3">
                          <span className={cn("px-2 py-0.5 rounded text-xs font-medium", order.statusColor)}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delivery Performance */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">配信パフォーマンス Top</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-3 py-2 font-medium">配信名</th>
                      <th className="px-3 py-2 font-medium text-right">対象</th>
                      <th className="px-3 py-2 font-medium text-right">CTR</th>
                      <th className="px-3 py-2 font-medium text-right">CV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {deliveryPerformance.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => toast.info(`配信「${item.name}」の分析を開きます`)}>
                        <td className="px-3 py-3 text-gray-900">{item.name}</td>
                        <td className="px-3 py-3 text-right text-gray-600">{item.target}</td>
                        <td className="px-3 py-3 text-right font-medium text-blue-600">{item.ctr}</td>
                        <td className="px-3 py-3 text-right font-medium text-gray-900">{item.cv}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Unread Chats */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">未対応チャット</h3>
              <div className="space-y-4">
                {unreadChats.map((chat, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0 hover:bg-gray-50 p-2 -mx-2 rounded cursor-pointer transition-colors" onClick={() => toast.info(`${chat.customer}さんとのチャットを開きます`)}>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                      {chat.customer.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold text-gray-900">{chat.customer}</span>
                        <span className="text-xs text-gray-400">{chat.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{chat.message}</p>
                    </div>
                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium shrink-0", chat.statusColor)}>
                      {chat.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Events */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">予約（直近）</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-3 py-2 font-medium">イベント名</th>
                      <th className="px-3 py-2 font-medium">日時</th>
                      <th className="px-3 py-2 font-medium">人数</th>
                      <th className="px-3 py-2 font-medium">状態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {upcomingEvents.map((event, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => toast.info(`イベント「${event.name}」の詳細を開きます`)}>
                        <td className="px-3 py-3 text-gray-900">{event.name}</td>
                        <td className="px-3 py-3 text-gray-600">{event.date}</td>
                        <td className="px-3 py-3 text-gray-600">{event.count}</td>
                        <td className="px-3 py-3">
                          <span className={cn("px-2 py-0.5 rounded text-xs font-medium", event.statusColor)}>
                            {event.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Custom Reports */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">カスタムレポート</h3>
                <button 
                  onClick={() => setIsCreateReportDialogOpen(true)}
                  className="text-sm text-[#06C755] font-medium hover:underline flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  作成
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-3 py-2 font-medium">レポート名</th>
                      <th className="px-3 py-2 font-medium">作成者</th>
                      <th className="px-3 py-2 font-medium">フォルダ</th>
                      <th className="px-3 py-2 font-medium">更新日</th>
                      <th className="px-3 py-2 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {customReports.map((report, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 cursor-pointer">
                        <td className="px-3 py-3 font-medium text-gray-900">{report.name}</td>
                        <td className="px-3 py-3 text-gray-600">{report.author}</td>
                        <td className="px-3 py-3 text-gray-600">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-xs">
                            <Folder className="w-3 h-3" />
                            {report.folder}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-gray-600">{report.date}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <button className="text-gray-400 hover:text-gray-600" title="複製">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-red-600" title="削除">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
