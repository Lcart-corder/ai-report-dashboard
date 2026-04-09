import { useState } from "react"
import { useLayout } from "@/contexts/layout-context"
import { Link } from "wouter"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Bot,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Database,
  ArrowRight,
  Wrench,
  Activity,
  Zap,
  BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data
const stats = {
  totalSessions: 156,
  aiResolvedRate: 78,
  avgResolutionTime: 8,
  pendingEscalations: 3,
  activeExperts: 4,
  knowledgeItems: 269
}

const recentSessions = [
  {
    id: "1",
    title: "CNC加工機 冷却水エラー",
    operator: "田中太郎",
    status: "resolved",
    equipment: "CNC #3",
    errorCode: "E-1234",
    resolvedBy: "AI",
    time: "5分前"
  },
  {
    id: "2",
    title: "溶接ロボット アーム異常",
    operator: "佐藤花子",
    status: "escalated",
    equipment: "溶接ロボット #1",
    expert: "鈴木一郎",
    time: "15分前"
  },
  {
    id: "3",
    title: "プレス機 油圧警告",
    operator: "高橋次郎",
    status: "active",
    equipment: "プレス機 #2",
    errorCode: "H-0567",
    time: "30分前"
  }
]

const topIssues = [
  { name: "冷却水関連", count: 24, trend: "down" },
  { name: "モーター過熱", count: 18, trend: "up" },
  { name: "センサー異常", count: 15, trend: "down" },
  { name: "油圧系統", count: 12, trend: "same" }
]

export default function ManufacturingDashboardPage() {
  const { sidebarCollapsed } = useLayout()

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 transition-all duration-300",
      sidebarCollapsed ? "ml-16" : "ml-64"
    )}>
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">製造AIアシスタント</h1>
              <p className="text-sm text-gray-500">トラブルシューティングを24時間AIがサポート</p>
            </div>
          </div>
          <Link href="/manufacturing/chat">
            <Button className="gap-2">
              <MessageSquare className="h-4 w-4" />
              新しい相談を開始
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalSessions}</p>
                  <p className="text-xs text-gray-500">今月の相談</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.aiResolvedRate}%</p>
                  <p className="text-xs text-gray-500">AI解決率</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgResolutionTime}分</p>
                  <p className="text-xs text-gray-500">平均解決時間</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingEscalations}</p>
                  <p className="text-xs text-gray-500">対応待ち</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeExperts}</p>
                  <p className="text-xs text-gray-500">稼働中エキスパート</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Database className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.knowledgeItems}</p>
                  <p className="text-xs text-gray-500">ナレッジ件数</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Recent Sessions */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">最近の相談</CardTitle>
                <CardDescription>リアルタイムのトラブルシューティング状況</CardDescription>
              </div>
              <Link href="/manufacturing/chat">
                <Button variant="ghost" size="sm">
                  すべて見る
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.map(session => (
                  <div key={session.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={cn(
                        session.status === "resolved" ? "bg-green-100 text-green-700" :
                        session.status === "escalated" ? "bg-orange-100 text-orange-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {session.status === "resolved" ? <CheckCircle className="h-5 w-5" /> :
                         session.status === "escalated" ? <AlertTriangle className="h-5 w-5" /> :
                         <Activity className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{session.title}</span>
                        {session.errorCode && (
                          <Badge variant="outline" className="text-xs">
                            {session.errorCode}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{session.operator}</span>
                        <span>•</span>
                        <span>{session.equipment}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={cn(
                        "text-xs",
                        session.status === "resolved" ? "bg-green-100 text-green-700" :
                        session.status === "escalated" ? "bg-orange-100 text-orange-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {session.status === "resolved" ? "解決済み" :
                         session.status === "escalated" ? "エスカレーション中" :
                         "対応中"}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">{session.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Side Cards */}
          <div className="space-y-6">
            {/* Top Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">よくある問題</CardTitle>
                <CardDescription>今月のトラブル傾向</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topIssues.map((issue, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-24 truncate">{issue.name}</span>
                      <div className="flex-1">
                        <Progress value={(issue.count / 30) * 100} className="h-2" />
                      </div>
                      <div className="flex items-center gap-1 w-12 justify-end">
                        <span className="text-sm">{issue.count}</span>
                        {issue.trend === "up" ? (
                          <TrendingUp className="h-3 w-3 text-red-500" />
                        ) : issue.trend === "down" ? (
                          <TrendingDown className="h-3 w-3 text-green-500" />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">クイックアクセス</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/manufacturing/chat">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <MessageSquare className="h-4 w-4" />
                    新しい相談
                  </Button>
                </Link>
                <Link href="/manufacturing/knowledge">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <BookOpen className="h-4 w-4" />
                    ナレッジベース
                  </Button>
                </Link>
                <Link href="/manufacturing/escalations">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    エスカレーション
                    {stats.pendingEscalations > 0 && (
                      <Badge className="ml-auto bg-red-500 text-white">
                        {stats.pendingEscalations}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link href="/manufacturing/settings">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Wrench className="h-4 w-4" />
                    設定
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* AI Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI パフォーマンス</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>解決率</span>
                      <span className="font-medium">{stats.aiResolvedRate}%</span>
                    </div>
                    <Progress value={stats.aiResolvedRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>ユーザー満足度</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>ナレッジ活用率</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
