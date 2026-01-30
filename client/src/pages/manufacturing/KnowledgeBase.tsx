import { useState } from "react"
import { useLayout } from "@/contexts/layout-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Search,
  Plus,
  FileText,
  Book,
  History,
  Upload,
  Tag,
  Calendar,
  User,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertTriangle,
  Wrench,
  FileUp,
  Database
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Types
interface KnowledgeDocument {
  id: string
  title: string
  category: "manual" | "troubleshooting" | "procedure" | "expert_answer"
  content: string
  tags: string[]
  author: string
  createdAt: Date
  updatedAt: Date
  usageCount: number
  fileType?: string
}

interface TroubleshootingHistory {
  id: string
  title: string
  problem: string
  solution: string
  equipmentType: string
  errorCode?: string
  resolvedBy: string
  severity: "low" | "medium" | "high" | "critical"
  resolutionTime: number // in minutes
  createdAt: Date
}

// Mock data
const mockDocuments: KnowledgeDocument[] = [
  {
    id: "1",
    title: "CNC加工機 操作マニュアル",
    category: "manual",
    content: "CNC加工機の基本操作手順について説明します...",
    tags: ["CNC", "加工機", "操作"],
    author: "山田太郎",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-03-10"),
    usageCount: 156,
    fileType: "pdf"
  },
  {
    id: "2",
    title: "エラーコード E-1234 対処法",
    category: "troubleshooting",
    content: "冷却水不足が原因の場合の対処手順...",
    tags: ["エラー", "冷却水", "E-1234"],
    author: "佐藤花子",
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-03-15"),
    usageCount: 89
  },
  {
    id: "3",
    title: "溶接ロボット 定期点検手順",
    category: "procedure",
    content: "月次点検の実施手順について...",
    tags: ["溶接", "ロボット", "点検"],
    author: "鈴木一郎",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-02-28"),
    usageCount: 67
  },
  {
    id: "4",
    title: "主軸モーター過熱時の緊急対応",
    category: "expert_answer",
    content: "先輩エキスパートの回答を蓄積...",
    tags: ["モーター", "過熱", "緊急"],
    author: "田中先輩",
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
    usageCount: 45
  }
]

const mockHistory: TroubleshootingHistory[] = [
  {
    id: "1",
    title: "CNC加工機 冷却水不足エラー",
    problem: "エラーコード E-1234 が発生し、生産が停止した",
    solution: "冷却水タンクに純水を補充し、5分待機後に再起動",
    equipmentType: "CNC加工機 #3",
    errorCode: "E-1234",
    resolvedBy: "佐藤花子",
    severity: "high",
    resolutionTime: 15,
    createdAt: new Date("2024-03-15")
  },
  {
    id: "2",
    title: "溶接ロボット アーム動作不良",
    problem: "アーム第3関節の動作が遅くなり、溶接精度が低下",
    solution: "グリースの補充と関節部品の清掃を実施",
    equipmentType: "溶接ロボット #1",
    resolvedBy: "鈴木一郎",
    severity: "medium",
    resolutionTime: 45,
    createdAt: new Date("2024-03-14")
  },
  {
    id: "3",
    title: "プレス機 油圧系統警告",
    problem: "油圧警告ランプが点灯し、プレス圧力が不安定",
    solution: "油圧フィルターの交換と作動油の補充",
    equipmentType: "プレス機 #2",
    errorCode: "H-0567",
    resolvedBy: "山田太郎",
    severity: "critical",
    resolutionTime: 60,
    createdAt: new Date("2024-03-13")
  }
]

const categoryLabels = {
  manual: { label: "マニュアル", color: "bg-blue-100 text-blue-700" },
  troubleshooting: { label: "トラブル対応", color: "bg-red-100 text-red-700" },
  procedure: { label: "手順書", color: "bg-green-100 text-green-700" },
  expert_answer: { label: "先輩の回答", color: "bg-purple-100 text-purple-700" }
}

const severityLabels = {
  low: { label: "低", color: "bg-gray-100 text-gray-700" },
  medium: { label: "中", color: "bg-yellow-100 text-yellow-700" },
  high: { label: "高", color: "bg-orange-100 text-orange-700" },
  critical: { label: "緊急", color: "bg-red-100 text-red-700" }
}

function DocumentCard({ doc }: { doc: KnowledgeDocument }) {
  const category = categoryLabels[doc.category]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              {doc.category === "manual" ? <Book className="h-5 w-5 text-blue-600" /> :
               doc.category === "troubleshooting" ? <Wrench className="h-5 w-5 text-red-600" /> :
               doc.category === "procedure" ? <FileText className="h-5 w-5 text-green-600" /> :
               <User className="h-5 w-5 text-purple-600" />}
            </div>
            <div>
              <h3 className="font-medium">{doc.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn("text-xs", category.color)}>
                  {category.label}
                </Badge>
                {doc.fileType && (
                  <Badge variant="outline" className="text-xs uppercase">
                    {doc.fileType}
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
              <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> 詳細を見る</DropdownMenuItem>
              <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> 編集</DropdownMenuItem>
              <DropdownMenuItem><Download className="h-4 w-4 mr-2" /> ダウンロード</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> 削除</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-gray-600 mt-3 line-clamp-2">{doc.content}</p>

        <div className="flex flex-wrap gap-1 mt-3">
          {doc.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {doc.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {doc.updatedAt.toLocaleDateString("ja-JP")}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {doc.usageCount}回参照
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function HistoryCard({ history }: { history: TroubleshootingHistory }) {
  const severity = severityLabels[history.severity]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium">{history.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={cn("text-xs", severity.color)}>
                {severity.label}
              </Badge>
              {history.errorCode && (
                <Badge variant="outline" className="text-xs">
                  {history.errorCode}
                </Badge>
              )}
              <span className="text-xs text-gray-500">{history.equipmentType}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> 詳細を見る</DropdownMenuItem>
              <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> 編集</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> 削除</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 space-y-2">
          <div>
            <span className="text-xs font-medium text-gray-500">問題:</span>
            <p className="text-sm">{history.problem}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500">解決策:</span>
            <p className="text-sm text-green-700">{history.solution}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {history.resolvedBy}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              解決まで{history.resolutionTime}分
            </span>
          </div>
          <span>{history.createdAt.toLocaleDateString("ja-JP")}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function KnowledgeBasePage() {
  const { sidebarCollapsed } = useLayout()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("documents")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isAddHistoryDialogOpen, setIsAddHistoryDialogOpen] = useState(false)

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 transition-all duration-300",
      sidebarCollapsed ? "ml-16" : "ml-64"
    )}>
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ナレッジベース</h1>
              <p className="text-sm text-gray-500">マニュアル・トラブル対応履歴・先輩の知見を管理</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Book className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-gray-500">マニュアル</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Wrench className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-gray-500">トラブル対応履歴</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">89</p>
                <p className="text-xs text-gray-500">先輩の回答</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-xs text-gray-500">AI解決率</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="documents" className="gap-1">
                <FileText className="h-4 w-4" />
                ドキュメント
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1">
                <History className="h-4 w-4" />
                対応履歴
              </TabsTrigger>
              <TabsTrigger value="expert" className="gap-1">
                <User className="h-4 w-4" />
                先輩の知見
              </TabsTrigger>
            </TabsList>

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
              {activeTab === "documents" && (
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      アップロード
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>ドキュメントをアップロード</DialogTitle>
                      <DialogDescription>
                        マニュアルや手順書をアップロードしてナレッジベースに追加します
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>タイトル</Label>
                        <Input placeholder="ドキュメントのタイトル" />
                      </div>
                      <div className="space-y-2">
                        <Label>カテゴリ</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="カテゴリを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">マニュアル</SelectItem>
                            <SelectItem value="procedure">手順書</SelectItem>
                            <SelectItem value="troubleshooting">トラブル対応</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>ファイル</Label>
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          <FileUp className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">
                            ファイルをドラッグ＆ドロップ、またはクリックして選択
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PDF, Word, Excelに対応
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>タグ</Label>
                        <Input placeholder="タグをカンマ区切りで入力" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                        キャンセル
                      </Button>
                      <Button onClick={() => setIsUploadDialogOpen(false)}>
                        アップロード
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {activeTab === "history" && (
                <Dialog open={isAddHistoryDialogOpen} onOpenChange={setIsAddHistoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      対応履歴を追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>トラブル対応履歴を追加</DialogTitle>
                      <DialogDescription>
                        解決した問題の情報を記録してナレッジとして蓄積します
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>タイトル</Label>
                        <Input placeholder="問題の概要" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>設備タイプ</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="設備を選択" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cnc">CNC加工機</SelectItem>
                              <SelectItem value="welding">溶接ロボット</SelectItem>
                              <SelectItem value="press">プレス機</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>エラーコード（任意）</Label>
                          <Input placeholder="E-XXXX" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>問題の詳細</Label>
                        <Textarea placeholder="発生した問題を詳しく記述" rows={3} />
                      </div>
                      <div className="space-y-2">
                        <Label>解決策</Label>
                        <Textarea placeholder="どのように解決したかを記述" rows={3} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>重要度</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="重要度を選択" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">低</SelectItem>
                              <SelectItem value="medium">中</SelectItem>
                              <SelectItem value="high">高</SelectItem>
                              <SelectItem value="critical">緊急</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>解決時間（分）</Label>
                          <Input type="number" placeholder="30" />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddHistoryDialogOpen(false)}>
                        キャンセル
                      </Button>
                      <Button onClick={() => setIsAddHistoryDialogOpen(false)}>
                        保存
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <TabsContent value="documents">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {mockDocuments.map(doc => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {mockHistory.map(history => (
                <HistoryCard key={history.id} history={history} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="expert">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {mockDocuments
                .filter(doc => doc.category === "expert_answer")
                .map(doc => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
