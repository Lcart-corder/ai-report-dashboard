import { useState } from "react"
import { Link } from "wouter"
import { AppSidebar } from "@/components/app-sidebar"
import { FileDrawer } from "@/components/file-drawer"
import { useLayout } from "@/contexts/layout-context"
import {
  ChevronRight,
  Download,
  Copy,
  Trash2,
  FolderOpen,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
  BarChart3,
  Users,
  ShoppingCart,
  Plus,
  FileText,
  AlertTriangle,
  ArrowRight,
  MoreHorizontal,
  Calendar,
  Clock,
  Database,
  ShieldCheck,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"

type RecommendationStatus = "pending" | "accepted" | "on-hold" | "rejected"
type ArtifactType = "broadcast" | "scenario" | "tag" | "segment" | "form" | "event" | "template" | "shopify"

interface Recommendation {
  id: string
  title: string
  targetKPI: string
  expectedImpact: string
  effort: string
  risk: string
  evidence: string
  status: RecommendationStatus
}

interface Artifact {
  id: string
  type: ArtifactType
  name: string
  folder: string
  status: "draft" | "active"
  recommendationId: string
}

export default function AIReportDetailPage() {
  const { sidebarCollapsed, fileDrawerOpen, setFileDrawerOpen } = useLayout()
  const [folderModalOpen, setFolderModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [generateModalOpen, setGenerateModalOpen] = useState(false)
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | null>(null)
  const [sidePanelOpen, setSidePanelOpen] = useState(true)
  const [currentFolder, setCurrentFolder] = useState("未分類")
  const [assignee, setAssignee] = useState("")
  const [deadline, setDeadline] = useState("")
  const [toastMessage, setToastMessage] = useState("")

  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: "r1",
      title: "新規会員向けウェルカム配信の最適化",
      targetKPI: "初回購入率",
      expectedImpact: "+15%",
      effort: "中（3日）",
      risk: "低",
      evidence: "流入分析：新規友だちの48%が初回配信未開封",
      status: "pending",
    },
    {
      id: "r2",
      title: "カート放棄ユーザーへのリマインドシナリオ",
      targetKPI: "購入完了率",
      expectedImpact: "+22%",
      effort: "高（5日）",
      risk: "中",
      evidence: "チャネル分析：カート放棄後24h以内のリマインドで回収率35%",
      status: "pending",
    },
    {
      id: "r3",
      title: "VIP顧客セグメントの細分化とパーソナライズ",
      targetKPI: "LTV",
      expectedImpact: "+18%",
      effort: "中（4日）",
      risk: "低",
      evidence: "商品分析：上位20%顧客の購入パターンに3つのクラスタ",
      status: "pending",
    },
    {
      id: "r4",
      title: "イベント申込フォームの項目削減",
      targetKPI: "申込完了率",
      expectedImpact: "+12%",
      effort: "低（1日）",
      risk: "低",
      evidence: "フォーム分析：項目数8→5で離脱率-40%",
      status: "pending",
    },
    {
      id: "r5",
      title: "流入経路別のメッセージテンプレート作成",
      targetKPI: "エンゲージメント率",
      expectedImpact: "+25%",
      effort: "中（3日）",
      risk: "低",
      evidence: "流入分析：経路別で反応率に2.5倍の差",
      status: "pending",
    },
    {
      id: "r6",
      title: "Shopify連携による在庫連動配信",
      targetKPI: "在庫回転率",
      expectedImpact: "+30%",
      effort: "高（7日）",
      risk: "中",
      evidence: "商品分析：在庫過多商品への配信で売上+45%",
      status: "pending",
    },
  ])

  const [artifacts, setArtifacts] = useState<Artifact[]>([])

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(""), 3000)
  }

  const handleRecommendationAction = (id: string, action: "accept" | "hold" | "reject") => {
    if (action === "accept") {
      setSelectedRecommendationId(id)
      setGenerateModalOpen(true)
    } else {
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: action === "hold" ? "on-hold" : "rejected" } : r)),
      )
      showToast(action === "hold" ? "施策を保留にしました" : "施策を却下しました")
    }
  }

  const handleGenerateArtifact = (type: ArtifactType) => {
    if (!selectedRecommendationId) return

    const recommendation = recommendations.find((r) => r.id === selectedRecommendationId)
    if (!recommendation) return

    setRecommendations((prev) =>
      prev.map((r) => (r.id === selectedRecommendationId ? { ...r, status: "accepted" as RecommendationStatus } : r)),
    )

    const typeLabels: Record<ArtifactType, string> = {
      broadcast: "一斉配信",
      scenario: "シナリオ",
      tag: "タグ",
      segment: "セグメント",
      form: "フォーム",
      event: "イベント",
      template: "テンプレート",
      shopify: "Shopify販促",
    }

    const newArtifact: Artifact = {
      id: `artifact-${Date.now()}`,
      type,
      name: `【AI生成】${recommendation.title}`,
      folder: "未分類",
      status: "draft",
      recommendationId: selectedRecommendationId,
    }

    setArtifacts((prev) => [...prev, newArtifact])
    setGenerateModalOpen(false)
    setSelectedRecommendationId(null)
    showToast(`${typeLabels[type]}の下書きを生成しました`)
  }

  const handleDuplicate = () => {
    showToast("レポートを複製しました")
  }

  const handleDelete = () => {
    setDeleteModalOpen(false)
    showToast("レポートを削除しました")
  }

  const handleExport = (format: "csv" | "pdf") => {
    setExportModalOpen(false)
    showToast(`${format.toUpperCase()}でエクスポートしました`)
  }

  const handleAddToBacklog = () => {
    showToast("施策バックログに追加しました")
  }

  const getStatusBadge = (status: RecommendationStatus) => {
    const styles = {
      pending: "bg-muted text-muted-foreground border-muted-foreground/20",
      accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
      "on-hold": "bg-amber-50 text-amber-700 border-amber-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
    }
    const labels = {
      pending: "検討中",
      accepted: "採用済み",
      "on-hold": "保留",
      rejected: "却下",
    }
    return (
      <span className={cn("px-2.5 py-0.5 text-xs font-medium rounded-full border", styles[status])}>
        {labels[status]}
      </span>
    )
  }

  const getArtifactTypeLabel = (type: ArtifactType) => {
    const labels: Record<ArtifactType, string> = {
      broadcast: "一斉配信",
      scenario: "シナリオ",
      tag: "タグ",
      segment: "セグメント",
      form: "フォーム",
      event: "イベント",
      template: "テンプレート",
      shopify: "Shopify販促",
    }
    return labels[type]
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <AppSidebar currentPath="/ai/reports" />
      <FileDrawer />

      <main 
        className={cn(
          "flex-1 overflow-y-auto transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "ml-16" : "ml-60"
        )}
      >
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">ホーム</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/ai" className="hover:text-primary transition-colors">AI</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/ai/reports" className="hover:text-primary transition-colors">レポート</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">詳細</span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-border pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  AI分析レポート：2025年1月の成長機会分析
                </h1>
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  Completed
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  2024/12/01 - 2024/12/31
                </span>
                <span className="w-px h-4 bg-border" />
                <span>対象KPI：売上、CVR、LTV</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFolderModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2 shadow-sm"
              >
                <FolderOpen className="w-4 h-4" />
                {currentFolder}
              </button>
              <button
                onClick={() => setExportModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                エクスポート
              </button>
              <div className="h-8 w-px bg-border mx-1" />
              <button
                onClick={handleDuplicate}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                title="複製"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                title="削除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-8 items-start">
            {/* Main Content */}
            <div className="flex-1 space-y-8 min-w-0">
              
              {/* Executive Summary */}
              <section className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    エグゼクティブサマリ
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 mt-0.5">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-lg">新規顧客の初回購入率が業界平均を15%下回る</p>
                      <p className="text-muted-foreground mt-1">
                        ウェルカム配信の最適化により月間<span className="font-semibold text-emerald-600">+450万円</span>の売上増が見込める
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-amber-50/50 border border-amber-100">
                    <div className="p-2 bg-amber-100 rounded-full text-amber-600 mt-0.5">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-lg">カート放棄率が68%に上昇（前月比+12pt）</p>
                      <p className="text-muted-foreground mt-1">
                        リマインドシナリオの導入で購入完了率を<span className="font-semibold text-amber-600">22%改善</span>可能
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600 mt-0.5">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-lg">VIP顧客の購入パターンに3つの明確なクラスタ</p>
                      <p className="text-muted-foreground mt-1">
                        セグメント別のパーソナライズでLTVを<span className="font-semibold text-blue-600">18%向上</span>させる機会
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Evidence */}
              <section className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-muted/30">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    根拠データ（Evidence）
                  </h2>
                </div>
                <div className="p-6 space-y-8">
                  {/* Evidence Set 1 */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2" id="evidence-channel">
                        <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">1</span>
                        チャネル別コンバージョン
                      </h3>
                      <div className="bg-muted/30 rounded-lg p-4 border border-border">
                        <div className="h-40 flex items-end gap-4 px-4 pb-2">
                          <div className="flex-1 flex flex-col justify-end gap-2 group">
                            <div className="w-full bg-primary/40 rounded-t-sm h-[34%] group-hover:bg-primary/60 transition-colors relative">
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold">8.2%</span>
                            </div>
                            <span className="text-xs text-center text-muted-foreground">LINE配信</span>
                          </div>
                          <div className="flex-1 flex flex-col justify-end gap-2 group">
                            <div className="w-full bg-primary/60 rounded-t-sm h-[52%] group-hover:bg-primary/80 transition-colors relative">
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold">12.5%</span>
                            </div>
                            <span className="text-xs text-center text-muted-foreground">シナリオ</span>
                          </div>
                          <div className="flex-1 flex flex-col justify-end gap-2 group">
                            <div className="w-full bg-primary rounded-t-sm h-full group-hover:bg-primary/90 transition-colors relative">
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold">24.1%</span>
                            </div>
                            <span className="text-xs text-center text-muted-foreground">1to1</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-blue-50/50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <p className="text-sm text-foreground leading-relaxed">
                          <span className="font-bold block mb-1 text-blue-700">AI Insight:</span>
                          1to1チャットのCV率が24.1%と最も高く、シナリオ（12.5%）の約2倍。パーソナライズされた対応がコンバージョンに大きく寄与していることが分かる。LINE一斉配信は8.2%にとどまり、セグメント配信への移行余地がある。
                        </p>
                      </div>
                      <table className="w-full text-sm">
                        <thead className="border-b border-border">
                          <tr>
                            <th className="text-left py-2 font-medium text-muted-foreground">チャネル</th>
                            <th className="text-right py-2 font-medium text-muted-foreground">CV率</th>
                            <th className="text-right py-2 font-medium text-muted-foreground">前期間比</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border/50">
                            <td className="py-2">LINE配信</td>
                            <td className="text-right py-2 font-mono">8.2%</td>
                            <td className="text-right py-2 text-emerald-600 font-medium">+2.1%</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2">シナリオ</td>
                            <td className="text-right py-2 font-mono">12.5%</td>
                            <td className="text-right py-2 text-emerald-600 font-medium">+5.3%</td>
                          </tr>
                          <tr>
                            <td className="py-2">1to1チャット</td>
                            <td className="text-right py-2 font-mono">24.1%</td>
                            <td className="text-right py-2 text-emerald-600 font-medium">+8.7%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Evidence Set 2 */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2" id="evidence-product">
                        <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">2</span>
                        商品カテゴリ別売上
                      </h3>
                      <div className="bg-muted/30 rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-1 h-12 rounded-md overflow-hidden">
                          <div className="h-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: "48%" }}>48%</div>
                          <div className="h-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: "32%" }}>32%</div>
                          <div className="h-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: "20%" }}>20%</div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"/>アパレル</span>
                          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink-500"/>コスメ</span>
                          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"/>雑貨</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-blue-50/50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <p className="text-sm text-foreground leading-relaxed">
                          <span className="font-bold block mb-1 text-blue-700">AI Insight:</span>
                          アパレルが売上の48%を占め、前期間比+12%と好調。コスメも堅調だが、雑貨は-5%と減少傾向。アパレルの成功施策を他カテゴリに横展開する余地がある。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recommendations */}
              <section className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-muted/30">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    施策提案（Recommendations）
                  </h2>
                </div>
                <div className="p-6 grid gap-4">
                  {recommendations.map((rec) => (
                    <div 
                      key={rec.id} 
                      className={cn(
                        "group border rounded-lg p-5 transition-all hover:shadow-md",
                        rec.status === "pending" ? "bg-card border-border" : "bg-muted/10 border-border/50"
                      )}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg text-foreground">{rec.title}</h3>
                            {getStatusBadge(rec.status)}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 rounded-lg p-3 border border-border/50">
                            <div>
                              <span className="text-xs text-muted-foreground block mb-1">期待改善幅</span>
                              <span className="font-bold text-emerald-600">{rec.expectedImpact}</span>
                              <span className="text-xs text-muted-foreground ml-1">({rec.targetKPI})</span>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block mb-1">工数</span>
                              <span className="text-sm font-medium">{rec.effort}</span>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block mb-1">リスク</span>
                              <span className={cn(
                                "text-sm font-medium",
                                rec.risk === "低" ? "text-emerald-600" : rec.risk === "中" ? "text-amber-600" : "text-red-600"
                              )}>{rec.risk}</span>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block mb-1">優先度</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary">
                                {rec.risk === "低" && rec.effort.includes("低") ? "高" : rec.risk === "低" ? "中" : "低"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">根拠:</span>
                            <span>{rec.evidence}</span>
                            <a href="#" className="text-primary hover:underline flex items-center gap-1 text-xs font-medium">
                              <ExternalLink className="w-3 h-3" />
                              詳細
                            </a>
                          </div>
                        </div>

                        {rec.status === "pending" && (
                          <div className="flex md:flex-col gap-2 min-w-[120px]">
                            <button
                              onClick={() => handleRecommendationAction(rec.id, "accept")}
                              className="flex-1 px-4 py-2 text-sm font-bold text-white bg-primary rounded-md hover:bg-primary/90 shadow-sm transition-all active:scale-95"
                            >
                              採用
                            </button>
                            <button
                              onClick={() => handleRecommendationAction(rec.id, "hold")}
                              className="flex-1 px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors"
                            >
                              保留
                            </button>
                            <button
                              onClick={() => handleRecommendationAction(rec.id, "reject")}
                              className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
                            >
                              却下
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Artifacts */}
              <section className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-muted/30">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    生成済み成果物（Artifacts）
                  </h2>
                </div>
                <div className="p-0">
                  {artifacts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-muted/5">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium">施策を採用すると、ここに生成された成果物が表示されます</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/20">
                            <th className="text-left py-3 px-6 font-medium text-muted-foreground">種別</th>
                            <th className="text-left py-3 px-6 font-medium text-muted-foreground">名称</th>
                            <th className="text-left py-3 px-6 font-medium text-muted-foreground">フォルダ</th>
                            <th className="text-left py-3 px-6 font-medium text-muted-foreground">状態</th>
                            <th className="text-right py-3 px-6 font-medium text-muted-foreground">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {artifacts.map((artifact) => (
                            <tr key={artifact.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                              <td className="py-3 px-6">
                                <span className="px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700 border border-blue-100">
                                  {getArtifactTypeLabel(artifact.type)}
                                </span>
                              </td>
                              <td className="py-3 px-6 font-medium text-foreground">{artifact.name}</td>
                              <td className="py-3 px-6 text-muted-foreground flex items-center gap-1">
                                <FolderOpen className="w-3 h-3" />
                                {artifact.folder}
                              </td>
                              <td className="py-3 px-6">
                                <span className="px-2 py-1 text-xs font-medium rounded bg-muted text-muted-foreground">
                                  {artifact.status === "draft" ? "下書き" : "公開中"}
                                </span>
                              </td>
                              <td className="py-3 px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setArtifacts((prev) => prev.filter((a) => a.id !== artifact.id))
                                      showToast("成果物を削除しました")
                                    }}
                                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Side Panel */}
            {sidePanelOpen && (
              <div className="w-80 space-y-6 shrink-0 hidden xl:block">
                <div className="bg-card rounded-xl shadow-sm border border-border p-5 sticky top-6">
                  <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    施策管理
                  </h3>
                  <button
                    onClick={handleAddToBacklog}
                    className="w-full px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    施策バックログに追加
                  </button>
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">担当者</label>
                      <input
                        type="text"
                        value={assignee}
                        onChange={(e) => setAssignee(e.target.value)}
                        placeholder="担当者名"
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">期限</label>
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      レポート情報
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">作成日時</span>
                        <span className="font-mono text-foreground">2025/01/01 09:30</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">実行時間</span>
                        <span className="font-mono text-foreground">3m 42s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">データ量</span>
                        <span className="font-mono text-foreground">15,234 records</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">信頼度</span>
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">High</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Generate Modal */}
      {generateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-lg border border-border animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">生成先を選択</h3>
            </div>
            <div className="px-6 py-6">
              <p className="text-sm text-muted-foreground mb-4">この施策から生成する成果物の種類を選択してください</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: "broadcast" as ArtifactType, label: "一斉配信" },
                  { type: "scenario" as ArtifactType, label: "シナリオ" },
                  { type: "tag" as ArtifactType, label: "タグ" },
                  { type: "segment" as ArtifactType, label: "セグメント" },
                  { type: "form" as ArtifactType, label: "フォーム" },
                  { type: "event" as ArtifactType, label: "イベント" },
                  { type: "template" as ArtifactType, label: "テンプレート" },
                  { type: "shopify" as ArtifactType, label: "Shopify販促" },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleGenerateArtifact(item.type)}
                    className="px-4 py-3 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-primary/5 hover:border-primary hover:text-primary transition-all text-left flex items-center justify-between group"
                  >
                    {item.label}
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end bg-muted/20 rounded-b-xl">
              <button
                onClick={() => {
                  setGenerateModalOpen(false)
                  setSelectedRecommendationId(null)
                }}
                className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folder Modal */}
      {folderModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md border border-border animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">フォルダを変更</h3>
            </div>
            <div className="px-6 py-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">移動先フォルダ</label>
              <select
                value={currentFolder}
                onChange={(e) => setCurrentFolder(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option>未分類</option>
                <option>月次レポート</option>
                <option>施策検討</option>
                <option>完了済み</option>
              </select>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-2 bg-muted/20 rounded-b-xl">
              <button
                onClick={() => setFolderModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  setFolderModalOpen(false)
                  showToast(`フォルダを「${currentFolder}」に変更しました`)
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-md hover:bg-primary/90 shadow-sm"
              >
                変更
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md border border-border animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">エクスポート</h3>
            </div>
            <div className="px-6 py-6">
              <p className="text-sm text-muted-foreground mb-4">エクスポート形式を選択してください</p>
              <div className="space-y-2">
                <button
                  onClick={() => handleExport("csv")}
                  className="w-full px-4 py-3 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors text-left flex items-center gap-3"
                >
                  <div className="p-2 bg-green-100 text-green-600 rounded">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">CSV（データのみ）</span>
                    <span className="text-xs text-muted-foreground">生データをCSV形式でダウンロード</span>
                  </div>
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full px-4 py-3 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors text-left flex items-center gap-3"
                >
                  <div className="p-2 bg-red-100 text-red-600 rounded">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold">PDF（レポート全体）</span>
                    <span className="text-xs text-muted-foreground">現在の表示レイアウトでPDF化</span>
                  </div>
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end bg-muted/20 rounded-b-xl">
              <button
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md border border-border animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                レポートを削除
              </h3>
            </div>
            <div className="px-6 py-6">
              <p className="text-sm text-muted-foreground">
                このレポートと関連する成果物を削除してもよろしいですか？<br/>
                <span className="font-bold text-destructive mt-2 block">この操作は取り消せません。</span>
              </p>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-2 bg-muted/20 rounded-b-xl">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-bold text-white bg-destructive rounded-md hover:bg-destructive/90 shadow-sm"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-foreground text-background px-4 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  )
}
