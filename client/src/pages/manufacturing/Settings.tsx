import { useState } from "react"
import { useLayout } from "@/contexts/layout-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Settings,
  Bell,
  Users,
  Shield,
  Smartphone,
  Mail,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Key,
  Building,
  Wrench
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types
interface ManufacturingUser {
  id: string
  name: string
  email: string
  role: "operator" | "expert" | "admin"
  department: string
  expertise: string[]
  lineConnected: boolean
  notificationPreference: "dashboard" | "line" | "both"
  isActive: boolean
}

// Mock data
const mockUsers: ManufacturingUser[] = [
  {
    id: "1",
    name: "田中太郎",
    email: "tanaka@example.com",
    role: "operator",
    department: "製造1課",
    expertise: [],
    lineConnected: true,
    notificationPreference: "both",
    isActive: true
  },
  {
    id: "2",
    name: "山田先輩",
    email: "yamada@example.com",
    role: "expert",
    department: "製造1課",
    expertise: ["CNC加工", "プレス"],
    lineConnected: true,
    notificationPreference: "line",
    isActive: true
  },
  {
    id: "3",
    name: "佐藤管理者",
    email: "sato@example.com",
    role: "admin",
    department: "製造部",
    expertise: ["全般"],
    lineConnected: true,
    notificationPreference: "both",
    isActive: true
  },
  {
    id: "4",
    name: "鈴木花子",
    email: "suzuki@example.com",
    role: "operator",
    department: "製造2課",
    expertise: [],
    lineConnected: false,
    notificationPreference: "dashboard",
    isActive: true
  }
]

const roleLabels = {
  operator: { label: "オペレーター", color: "bg-blue-100 text-blue-700" },
  expert: { label: "エキスパート", color: "bg-green-100 text-green-700" },
  admin: { label: "管理者", color: "bg-purple-100 text-purple-700" }
}

export default function ManufacturingSettingsPage() {
  const { sidebarCollapsed } = useLayout()
  const [activeTab, setActiveTab] = useState("notifications")
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    escalationDashboard: true,
    escalationLine: true,
    newMessageDashboard: true,
    newMessageLine: false,
    resolutionDashboard: true,
    resolutionLine: false,
    urgentAlertDashboard: true,
    urgentAlertLine: true
  })

  // AI settings state
  const [aiSettings, setAiSettings] = useState({
    autoEscalateThreshold: 70,
    maxAiAttempts: 3,
    requireConfirmation: true,
    learnFromExpert: true
  })

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 transition-all duration-300",
      sidebarCollapsed ? "ml-16" : "ml-64"
    )}>
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Settings className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">製造AIシステム設定</h1>
            <p className="text-sm text-gray-500">通知、ユーザー、AI動作の設定を管理</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="notifications" className="gap-1">
              <Bell className="h-4 w-4" />
              通知設定
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1">
              <Users className="h-4 w-4" />
              ユーザー管理
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-1">
              <Wrench className="h-4 w-4" />
              AI設定
            </TabsTrigger>
            <TabsTrigger value="line" className="gap-1">
              <Smartphone className="h-4 w-4" />
              LINE連携
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">エスカレーション通知</CardTitle>
                  <CardDescription>
                    先輩エキスパートへの相談が発生した時の通知設定
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>ダッシュボード通知</Label>
                      <p className="text-sm text-gray-500">システム内で通知を表示</p>
                    </div>
                    <Switch
                      checked={notificationSettings.escalationDashboard}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, escalationDashboard: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>LINE通知</Label>
                      <p className="text-sm text-gray-500">LINEでプッシュ通知を送信</p>
                    </div>
                    <Switch
                      checked={notificationSettings.escalationLine}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, escalationLine: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">メッセージ通知</CardTitle>
                  <CardDescription>
                    チャットで新しいメッセージを受信した時の通知設定
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>ダッシュボード通知</Label>
                      <p className="text-sm text-gray-500">システム内で通知を表示</p>
                    </div>
                    <Switch
                      checked={notificationSettings.newMessageDashboard}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, newMessageDashboard: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>LINE通知</Label>
                      <p className="text-sm text-gray-500">LINEでプッシュ通知を送信</p>
                    </div>
                    <Switch
                      checked={notificationSettings.newMessageLine}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, newMessageLine: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">緊急アラート</CardTitle>
                  <CardDescription>
                    緊急度の高い問題が発生した時の通知設定
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>ダッシュボード通知</Label>
                      <p className="text-sm text-gray-500">システム内で通知を表示</p>
                    </div>
                    <Switch
                      checked={notificationSettings.urgentAlertDashboard}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, urgentAlertDashboard: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>LINE通知</Label>
                      <p className="text-sm text-gray-500">LINEでプッシュ通知を送信（推奨）</p>
                    </div>
                    <Switch
                      checked={notificationSettings.urgentAlertLine}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, urgentAlertLine: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button>設定を保存</Button>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">ユーザー一覧</CardTitle>
                  <CardDescription>
                    システムを利用するユーザーを管理
                  </CardDescription>
                </div>
                <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      ユーザーを追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>新しいユーザーを追加</DialogTitle>
                      <DialogDescription>
                        製造AIシステムを利用するユーザーを追加します
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>名前</Label>
                        <Input placeholder="山田太郎" />
                      </div>
                      <div className="space-y-2">
                        <Label>メールアドレス</Label>
                        <Input type="email" placeholder="yamada@example.com" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>役割</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="選択" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="operator">オペレーター（若手）</SelectItem>
                              <SelectItem value="expert">エキスパート（先輩）</SelectItem>
                              <SelectItem value="admin">管理者</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>部署</Label>
                          <Input placeholder="製造1課" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>専門分野（エキスパートの場合）</Label>
                        <Input placeholder="CNC加工, 溶接" />
                      </div>
                      <div className="space-y-2">
                        <Label>通知方法</Label>
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
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                        キャンセル
                      </Button>
                      <Button onClick={() => setIsAddUserDialogOpen(false)}>
                        追加
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ユーザー</TableHead>
                      <TableHead>役割</TableHead>
                      <TableHead>部署</TableHead>
                      <TableHead>専門分野</TableHead>
                      <TableHead>LINE連携</TableHead>
                      <TableHead>通知設定</TableHead>
                      <TableHead>状態</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map(user => {
                      const role = roleLabels[user.role]
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gray-100 text-sm">
                                  {user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("text-xs", role.color)}>
                              {role.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.department}</TableCell>
                          <TableCell>
                            {user.expertise.length > 0
                              ? user.expertise.join(", ")
                              : <span className="text-gray-400">-</span>
                            }
                          </TableCell>
                          <TableCell>
                            {user.lineConnected ? (
                              <Badge variant="outline" className="gap-1 text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                連携済み
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1 text-gray-400">
                                <XCircle className="h-3 w-3" />
                                未連携
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {user.notificationPreference === "both" ? "両方" :
                               user.notificationPreference === "line" ? "LINEのみ" : "ダッシュボード"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.isActive ? (
                              <Badge className="bg-green-100 text-green-700">有効</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-700">無効</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Settings Tab */}
          <TabsContent value="ai">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">自動エスカレーション</CardTitle>
                  <CardDescription>
                    AIが自動的に先輩にエスカレーションする条件を設定
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>信頼度しきい値</Label>
                    <p className="text-sm text-gray-500">
                      AIの回答の信頼度がこの値を下回った場合、自動でエスカレーションします
                    </p>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={aiSettings.autoEscalateThreshold}
                        onChange={(e) => setAiSettings(prev => ({
                          ...prev,
                          autoEscalateThreshold: parseInt(e.target.value)
                        }))}
                        className="w-24"
                        min={0}
                        max={100}
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>最大AI試行回数</Label>
                    <p className="text-sm text-gray-500">
                      この回数の質問応答後も解決しない場合、エスカレーションを推奨します
                    </p>
                    <Input
                      type="number"
                      value={aiSettings.maxAiAttempts}
                      onChange={(e) => setAiSettings(prev => ({
                        ...prev,
                        maxAiAttempts: parseInt(e.target.value)
                      }))}
                      className="w-24"
                      min={1}
                      max={10}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">学習設定</CardTitle>
                  <CardDescription>
                    AIの学習・改善に関する設定
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>先輩の回答から学習</Label>
                      <p className="text-sm text-gray-500">
                        エキスパートの回答を自動的にナレッジベースに蓄積
                      </p>
                    </div>
                    <Switch
                      checked={aiSettings.learnFromExpert}
                      onCheckedChange={(checked) =>
                        setAiSettings(prev => ({ ...prev, learnFromExpert: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>学習データの確認が必要</Label>
                      <p className="text-sm text-gray-500">
                        管理者の承認後に学習データとして使用
                      </p>
                    </div>
                    <Switch
                      checked={aiSettings.requireConfirmation}
                      onCheckedChange={(checked) =>
                        setAiSettings(prev => ({ ...prev, requireConfirmation: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button>設定を保存</Button>
              </div>
            </div>
          </TabsContent>

          {/* LINE Settings Tab */}
          <TabsContent value="line">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">LINE連携設定</CardTitle>
                <CardDescription>
                  エスカレーション通知用のLINE連携を設定
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">LINE連携済み</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    LINE公式アカウントと連携されています
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Channel ID</Label>
                    <Input value="17xxxxxx" disabled className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Channel Secret</Label>
                    <div className="flex gap-2">
                      <Input type="password" value="••••••••••••" disabled className="bg-gray-50" />
                      <Button variant="outline" size="icon">
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">通知テンプレート</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">エスカレーション通知</p>
                      <p className="text-xs text-gray-500 mt-1">
                        [緊急] トラブルシューティングの相談が届いています。{"\n"}
                        設備: {"{equipment}"}{"\n"}
                        担当: {"{operator}"}{"\n"}
                        詳細はダッシュボードを確認してください。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">テスト通知を送信</Button>
                  <Button>設定を保存</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
