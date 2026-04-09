import { useState } from "react"
import { useLayout } from "@/contexts/layout-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  AlertTriangle,
  Clock,
  User,
  CheckCircle,
  XCircle,
  MessageSquare,
  ArrowRight,
  Bell,
  Filter,
  MoreHorizontal,
  Phone,
  Mail
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Types
interface Escalation {
  id: string
  sessionTitle: string
  operatorName: string
  operatorAvatar?: string
  reason: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "assigned" | "in_progress" | "resolved" | "cancelled"
  assignedTo?: {
    name: string
    avatar?: string
  }
  equipmentType: string
  errorCode?: string
  notificationMethod: "dashboard" | "line" | "both"
  createdAt: Date
  respondedAt?: Date
  resolvedAt?: Date
}

// Mock data
const mockEscalations: Escalation[] = [
  {
    id: "1",
    sessionTitle: "CNC加工機 冷却水エラー対応",
    operatorName: "田中太郎",
    reason: "AIの提案した対処法を試しましたが、エラーが解消されません。先輩の確認が必要です。",
    priority: "high",
    status: "pending",
    equipmentType: "CNC加工機 #3",
    errorCode: "E-1234",
    notificationMethod: "both",
    createdAt: new Date(Date.now() - 300000)
  },
  {
    id: "2",
    sessionTitle: "溶接ロボット アーム異常",
    operatorName: "佐藤花子",
    reason: "アーム第3関節から異音がします。安全確認が必要です。",
    priority: "urgent",
    status: "in_progress",
    assignedTo: { name: "鈴木一郎" },
    equipmentType: "溶接ロボット #1",
    notificationMethod: "line",
    createdAt: new Date(Date.now() - 1800000),
    respondedAt: new Date(Date.now() - 1200000)
  },
  {
    id: "3",
    sessionTitle: "プレス機 油圧警告",
    operatorName: "高橋次郎",
    reason: "マニュアルにない症状が発生しています。",
    priority: "medium",
    status: "resolved",
    assignedTo: { name: "山田太郎" },
    equipmentType: "プレス機 #2",
    errorCode: "H-0567",
    notificationMethod: "dashboard",
    createdAt: new Date(Date.now() - 7200000),
    respondedAt: new Date(Date.now() - 6600000),
    resolvedAt: new Date(Date.now() - 3600000)
  }
]

const mockExperts = [
  { id: "1", name: "山田太郎", expertise: ["CNC", "プレス"], available: true },
  { id: "2", name: "鈴木一郎", expertise: ["溶接", "ロボット"], available: false },
  { id: "3", name: "佐藤先輩", expertise: ["検査", "品質"], available: true }
]

const priorityLabels = {
  low: { label: "低", color: "bg-gray-100 text-gray-700" },
  medium: { label: "中", color: "bg-yellow-100 text-yellow-700" },
  high: { label: "高", color: "bg-orange-100 text-orange-700" },
  urgent: { label: "緊急", color: "bg-red-100 text-red-700 animate-pulse" }
}

const statusLabels = {
  pending: { label: "対応待ち", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  assigned: { label: "担当者割当", color: "bg-blue-100 text-blue-700", icon: User },
  in_progress: { label: "対応中", color: "bg-purple-100 text-purple-700", icon: MessageSquare },
  resolved: { label: "解決済み", color: "bg-green-100 text-green-700", icon: CheckCircle },
  cancelled: { label: "キャンセル", color: "bg-gray-100 text-gray-700", icon: XCircle }
}

function EscalationCard({ escalation, onAssign, onResolve }: {
  escalation: Escalation
  onAssign: (id: string) => void
  onResolve: (id: string) => void
}) {
  const priority = priorityLabels[escalation.priority]
  const status = statusLabels[escalation.status]
  const StatusIcon = status.icon

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}時間前`
    return `${minutes}分前`
  }

  return (
    <Card className={cn(
      "hover:shadow-md transition-shadow",
      escalation.priority === "urgent" && escalation.status === "pending" && "ring-2 ring-red-300"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {escalation.operatorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{escalation.sessionTitle}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn("text-xs", priority.color)}>
                  {priority.label}
                </Badge>
                <Badge className={cn("text-xs gap-1", status.color)}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
                {escalation.errorCode && (
                  <Badge variant="outline" className="text-xs">
                    {escalation.errorCode}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAssign(escalation.id)}>
                <User className="h-4 w-4 mr-2" /> 担当者を割り当て
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className="h-4 w-4 mr-2" /> セッションを見る
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onResolve(escalation.id)}>
                <CheckCircle className="h-4 w-4 mr-2" /> 解決済みにする
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{escalation.reason}</p>
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {escalation.operatorName}
          </span>
          <span>{escalation.equipmentType}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(escalation.createdAt)}
          </span>
          {escalation.notificationMethod !== "dashboard" && (
            <Badge variant="outline" className="text-xs">
              LINE通知
            </Badge>
          )}
        </div>

        {escalation.assignedTo && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            <span className="text-xs text-gray-500">担当:</span>
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                {escalation.assignedTo.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{escalation.assignedTo.name}</span>
            {escalation.respondedAt && (
              <span className="text-xs text-gray-400 ml-auto">
                応答時間: {Math.floor((escalation.respondedAt.getTime() - escalation.createdAt.getTime()) / 60000)}分
              </span>
            )}
          </div>
        )}

        {escalation.status === "pending" && (
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onAssign(escalation.id)}
            >
              <User className="h-4 w-4 mr-1" />
              担当する
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {}}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              対応を開始
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function EscalationsPage() {
  const { sidebarCollapsed } = useLayout()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedEscalation, setSelectedEscalation] = useState<string | null>(null)

  const handleAssign = (id: string) => {
    setSelectedEscalation(id)
    setIsAssignDialogOpen(true)
  }

  const handleResolve = (id: string) => {
    console.log("Resolve:", id)
  }

  const pendingCount = mockEscalations.filter(e => e.status === "pending").length
  const inProgressCount = mockEscalations.filter(e => e.status === "in_progress").length
  const resolvedCount = mockEscalations.filter(e => e.status === "resolved").length

  const filteredEscalations = mockEscalations.filter(e => {
    if (activeTab === "pending") return e.status === "pending"
    if (activeTab === "in_progress") return e.status === "in_progress" || e.status === "assigned"
    if (activeTab === "resolved") return e.status === "resolved"
    return true
  })

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 transition-all duration-300",
      sidebarCollapsed ? "ml-16" : "ml-64"
    )}>
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">エスカレーション管理</h1>
              <p className="text-sm text-gray-500">先輩エキスパートへの相談・対応状況を管理</p>
            </div>
          </div>
          {pendingCount > 0 && (
            <Badge className="bg-red-500 text-white animate-pulse">
              {pendingCount}件の対応待ち
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-gray-500">対応待ち</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-xs text-gray-500">対応中</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resolvedCount}</p>
                <p className="text-xs text-gray-500">本日解決</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">12分</p>
                <p className="text-xs text-gray-500">平均応答時間</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Expert Availability */}
      <div className="px-6 pb-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">エキスパート状況</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex gap-4">
              {mockExperts.map(expert => (
                <div key={expert.id} className="flex items-center gap-2">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-100 text-sm">
                        {expert.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                      expert.available ? "bg-green-500" : "bg-gray-400"
                    )} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{expert.name}</p>
                    <p className="text-xs text-gray-500">{expert.expertise.join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">
                すべて
              </TabsTrigger>
              <TabsTrigger value="pending" className="gap-1">
                対応待ち
                {pendingCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                対応中
              </TabsTrigger>
              <TabsTrigger value="resolved">
                解決済み
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredEscalations.map(escalation => (
            <EscalationCard
              key={escalation.id}
              escalation={escalation}
              onAssign={handleAssign}
              onResolve={handleResolve}
            />
          ))}
        </div>
      </div>

      {/* Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>担当者を割り当て</DialogTitle>
            <DialogDescription>
              このエスカレーションを担当するエキスパートを選択してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">エキスパートを選択</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="担当者を選択" />
                </SelectTrigger>
                <SelectContent>
                  {mockExperts.filter(e => e.available).map(expert => (
                    <SelectItem key={expert.id} value={expert.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                        {expert.name} ({expert.expertise.join(", ")})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">通知方法</label>
              <Select defaultValue="both">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">ダッシュボードのみ</SelectItem>
                  <SelectItem value="line">LINEのみ</SelectItem>
                  <SelectItem value="both">両方</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">メッセージ（任意）</label>
              <Textarea placeholder="担当者へのメッセージ" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={() => setIsAssignDialogOpen(false)}>
              割り当て
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
