import { useState, useRef, useEffect } from "react"
import { useLayout } from "@/contexts/layout-context"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Send,
  Bot,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  GitBranch,
  MessageSquare,
  AlertCircle,
  Lightbulb,
  Wrench,
  HelpCircle,
  ChevronRight,
  Image as ImageIcon,
  Paperclip,
  Mic
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types
interface Message {
  id: string
  type: "user" | "ai" | "expert"
  content: string
  timestamp: Date
  confidence?: number
  sourceRefs?: string[]
  senderName?: string
}

interface FlowNode {
  id: string
  type: "start" | "problem" | "check" | "action" | "solution" | "escalation"
  title: string
  description?: string
  status: "pending" | "current" | "completed" | "failed"
}

interface TimelineEvent {
  id: string
  type: "session_start" | "message" | "ai_response" | "escalation" | "expert_join" | "solution_found"
  title: string
  description?: string
  timestamp: Date
  actor?: string
}

// Mock data
const mockMessages: Message[] = [
  {
    id: "1",
    type: "user",
    content: "加工機のエラーコード E-1234 が出ています。生産が停止してしまいました。",
    timestamp: new Date(Date.now() - 300000)
  },
  {
    id: "2",
    type: "ai",
    content: "エラーコード E-1234 について、過去のトラブル対応履歴を確認しました。\n\nこのエラーは主に以下の原因で発生することが多いです：\n\n1. **冷却水の循環不良** - 最も多い原因（67%）\n2. **主軸モーターの過熱** - 2番目に多い（23%）\n3. **制御基板の異常** - 稀なケース（10%）\n\nまず、冷却水タンクの水位を確認してください。正常な水位は緑のラインまでありますか？",
    timestamp: new Date(Date.now() - 280000),
    confidence: 85,
    sourceRefs: ["トラブル対応履歴 #127", "設備マニュアル P.45"]
  },
  {
    id: "3",
    type: "user",
    content: "確認しました。水位は緑のラインより下でした。",
    timestamp: new Date(Date.now() - 260000)
  },
  {
    id: "4",
    type: "ai",
    content: "冷却水不足が原因の可能性が高いです。以下の手順で対処してください：\n\n**手順1**: 加工機の電源を切る\n**手順2**: 冷却水タンクに純水を補充（緑ラインまで）\n**手順3**: 5分間待機\n**手順4**: 電源を入れ、エラーがクリアされるか確認\n\nこの手順で解決しない場合は、先輩エキスパートにエスカレーションしますか？",
    timestamp: new Date(Date.now() - 240000),
    confidence: 92,
    sourceRefs: ["設備マニュアル P.46-47"]
  }
]

const mockFlowNodes: FlowNode[] = [
  { id: "1", type: "start", title: "問題発生", description: "エラーコード E-1234", status: "completed" },
  { id: "2", type: "problem", title: "原因分析", description: "冷却水・モーター・基板", status: "completed" },
  { id: "3", type: "check", title: "冷却水確認", description: "水位チェック", status: "completed" },
  { id: "4", type: "action", title: "冷却水補充", description: "純水を緑ラインまで", status: "current" },
  { id: "5", type: "check", title: "動作確認", description: "エラークリア確認", status: "pending" },
  { id: "6", type: "solution", title: "解決", description: "正常稼働", status: "pending" }
]

const mockTimeline: TimelineEvent[] = [
  { id: "1", type: "session_start", title: "セッション開始", timestamp: new Date(Date.now() - 300000) },
  { id: "2", type: "message", title: "問題報告", description: "エラーコード E-1234", timestamp: new Date(Date.now() - 300000), actor: "田中太郎" },
  { id: "3", type: "ai_response", title: "AI分析完了", description: "原因候補3件を特定", timestamp: new Date(Date.now() - 280000), actor: "AI" },
  { id: "4", type: "message", title: "状況報告", description: "冷却水不足を確認", timestamp: new Date(Date.now() - 260000), actor: "田中太郎" },
  { id: "5", type: "ai_response", title: "解決手順提示", description: "4ステップの対処法", timestamp: new Date(Date.now() - 240000), actor: "AI" }
]

// Components
function FlowChart({ nodes }: { nodes: FlowNode[] }) {
  const getNodeIcon = (type: FlowNode["type"]) => {
    switch (type) {
      case "start": return <AlertCircle className="h-4 w-4" />
      case "problem": return <HelpCircle className="h-4 w-4" />
      case "check": return <Lightbulb className="h-4 w-4" />
      case "action": return <Wrench className="h-4 w-4" />
      case "solution": return <CheckCircle className="h-4 w-4" />
      case "escalation": return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getNodeColor = (status: FlowNode["status"]) => {
    switch (status) {
      case "completed": return "border-green-500 bg-green-50 text-green-700"
      case "current": return "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200"
      case "failed": return "border-red-500 bg-red-50 text-red-700"
      default: return "border-gray-300 bg-gray-50 text-gray-500"
    }
  }

  return (
    <div className="space-y-2">
      {nodes.map((node, index) => (
        <div key={node.id}>
          <div className={cn(
            "flex items-start gap-3 p-3 rounded-lg border-2 transition-all",
            getNodeColor(node.status)
          )}>
            <div className="mt-0.5">
              {getNodeIcon(node.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{node.title}</div>
              {node.description && (
                <div className="text-xs opacity-75 mt-0.5">{node.description}</div>
              )}
            </div>
            {node.status === "completed" && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            {node.status === "current" && (
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
            )}
          </div>
          {index < nodes.length - 1 && (
            <div className="flex justify-center py-1">
              <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function Timeline({ events }: { events: TimelineEvent[] }) {
  const getEventColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "session_start": return "bg-gray-500"
      case "message": return "bg-blue-500"
      case "ai_response": return "bg-purple-500"
      case "escalation": return "bg-orange-500"
      case "expert_join": return "bg-green-500"
      case "solution_found": return "bg-emerald-500"
      default: return "bg-gray-500"
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={cn("w-3 h-3 rounded-full", getEventColor(event.type))} />
            {index < events.length - 1 && (
              <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{event.title}</span>
              <span className="text-xs text-gray-500">{formatTime(event.timestamp)}</span>
            </div>
            {event.description && (
              <p className="text-xs text-gray-600 mt-0.5">{event.description}</p>
            )}
            {event.actor && (
              <span className="text-xs text-gray-400">{event.actor}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.type === "user"
  const isExpert = message.type === "expert"

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <Avatar className={cn("h-8 w-8", isUser ? "bg-blue-500" : isExpert ? "bg-green-500" : "bg-purple-500")}>
        <AvatarFallback>
          {isUser ? <User className="h-4 w-4 text-white" /> :
           isExpert ? <User className="h-4 w-4 text-white" /> :
           <Bot className="h-4 w-4 text-white" />}
        </AvatarFallback>
      </Avatar>
      <div className={cn("flex-1 max-w-[80%]", isUser && "flex flex-col items-end")}>
        <div className={cn(
          "rounded-2xl px-4 py-2.5",
          isUser ? "bg-blue-500 text-white" :
          isExpert ? "bg-green-50 border border-green-200" :
          "bg-gray-100"
        )}>
          <div className={cn("text-sm whitespace-pre-wrap", isUser && "text-white")}>
            {message.content}
          </div>
        </div>
        {message.confidence && (
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant="secondary" className="text-xs">
              信頼度: {message.confidence}%
            </Badge>
            {message.sourceRefs && message.sourceRefs.map((ref, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {ref}
              </Badge>
            ))}
          </div>
        )}
        <span className="text-xs text-gray-400 mt-1">
          {message.timestamp.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  )
}

export default function AITroubleshootingPage() {
  const { sidebarCollapsed } = useLayout()
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [inputValue, setInputValue] = useState("")
  const [flowNodes] = useState<FlowNode[]>(mockFlowNodes)
  const [timelineEvents] = useState<TimelineEvent[]>(mockTimeline)
  const [activeTab, setActiveTab] = useState("flow")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date()
    }

    setMessages([...messages, newMessage])
    setInputValue("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "ご報告ありがとうございます。状況を分析中です...\n\n引き続き、手順通りに作業を進めてください。何か異常があれば報告してください。",
        timestamp: new Date(),
        confidence: 88,
        sourceRefs: ["過去対応履歴"]
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn(
      "flex flex-col h-screen transition-all duration-300",
      sidebarCollapsed ? "ml-16" : "ml-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Bot className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI トラブルシューティング</h1>
            <p className="text-sm text-gray-500">製造現場の問題解決をAIがサポート</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <div className="h-2 w-2 bg-green-500 rounded-full" />
            セッション中
          </Badge>
          <Button variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-1" />
            エスカレーション
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel - AI Agent */}
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
            <div className="h-full flex flex-col bg-white border-r">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <GitBranch className="h-5 w-5 text-purple-600" />
                  <h2 className="font-semibold">AI エージェント</h2>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full">
                    <TabsTrigger value="flow" className="flex-1">
                      <GitBranch className="h-4 w-4 mr-1" />
                      フロー
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="flex-1">
                      <Clock className="h-4 w-4 mr-1" />
                      タイムライン
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <ScrollArea className="flex-1 p-4">
                <TabsContent value="flow" className="mt-0">
                  <FlowChart nodes={flowNodes} />
                </TabsContent>
                <TabsContent value="timeline" className="mt-0">
                  <Timeline events={timelineEvents} />
                </TabsContent>
              </ScrollArea>

              {/* Session Info */}
              <div className="p-4 border-t bg-gray-50">
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>設備:</span>
                    <span className="font-medium">CNC加工機 #3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>エラーコード:</span>
                    <span className="font-medium text-red-600">E-1234</span>
                  </div>
                  <div className="flex justify-between">
                    <span>セッション時間:</span>
                    <span className="font-medium">5分</span>
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Chat */}
          <ResizablePanel defaultSize={65}>
            <div className="h-full flex flex-col bg-gray-50">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-3xl mx-auto">
                  {messages.map(message => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              <div className="px-4 py-2 border-t bg-white">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    <Lightbulb className="h-4 w-4 mr-1" />
                    類似事例を検索
                  </Button>
                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    先輩に相談
                  </Button>
                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    解決済みにする
                  </Button>
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2 max-w-3xl mx-auto">
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <ImageIcon className="h-5 w-5 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Paperclip className="h-5 w-5 text-gray-500" />
                  </Button>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="症状や状況を入力してください..."
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Mic className="h-5 w-5 text-gray-500" />
                  </Button>
                  <Button onClick={handleSend} disabled={!inputValue.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
