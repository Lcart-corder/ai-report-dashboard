import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Smile, 
  Paperclip,
  Save,
  Smartphone,
  Info
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GreetingPage() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [message, setMessage] = useState(
    "友だち追加ありがとうございます！\n\n最新情報やお得なクーポンをお届けします。\nまずは簡単なアンケートにご協力ください。\n\n▼アンケートはこちら\nhttps://example.com/survey"
  );

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">挨拶メッセージ設定</h1>
            <p className="text-sm text-gray-500 mt-1">
              友だち追加時に自動で送信される最初のメッセージを設定します
            </p>
          </div>
          <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
            <Save className="w-4 h-4" />
            設定を保存
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">挨拶メッセージの配信</Label>
                    <p className="text-sm text-gray-500">
                      友だち追加時の自動応答を有効にします
                    </p>
                  </div>
                  <Switch 
                    checked={isEnabled}
                    onCheckedChange={setIsEnabled}
                  />
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>設定のヒント</AlertTitle>
                  <AlertDescription>
                    挨拶メッセージは、ユーザーが最初に目にする重要なメッセージです。
                    自己紹介や、これからどのような情報を配信するかを明確に伝えましょう。
                    また、アンケートやリッチメニューへの誘導を行うと効果的です。
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card className={!isEnabled ? "opacity-60 pointer-events-none" : ""}>
              <CardHeader>
                <CardTitle>メッセージ内容</CardTitle>
                <CardDescription>
                  最大5通まで吹き出しを設定できます
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="text" className="gap-2">
                      <MessageSquare className="w-4 h-4" />
                      テキスト
                    </TabsTrigger>
                    <TabsTrigger value="image" className="gap-2">
                      <ImageIcon className="w-4 h-4" />
                      画像
                    </TabsTrigger>
                    <TabsTrigger value="template" className="gap-2">
                      <Paperclip className="w-4 h-4" />
                      テンプレート
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text" className="space-y-4">
                    <div className="relative">
                      <Textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[200px] resize-y pr-10"
                        placeholder="メッセージを入力してください..."
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 bottom-2 text-gray-400 hover:text-gray-600"
                      >
                        <Smile className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{message.length} / 2000文字</span>
                      <span>※友だち名などの変数が使用可能です</span>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="image">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                      <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900">画像をアップロード</p>
                      <p className="text-xs text-gray-500 mt-1">
                        またはドラッグ＆ドロップ
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="template">
                    <div className="border rounded-lg p-8 text-center">
                      <p className="text-sm text-gray-500">
                        作成済みのテンプレートを選択してください
                      </p>
                      <Button variant="outline" className="mt-4">
                        テンプレートを選択
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 flex gap-2">
                  <Button variant="outline" className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    吹き出しを追加
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-gray-900 rounded-[3rem] p-4 shadow-xl border-4 border-gray-800 max-w-[320px] mx-auto aspect-[9/19] relative overflow-hidden">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-gray-900 z-10 flex items-end justify-between px-6 pb-2 text-white text-xs font-medium">
                  <span>9:41</span>
                  <div className="flex gap-1.5">
                    <div className="w-4 h-2.5 bg-white rounded-sm"></div>
                    <div className="w-4 h-2.5 bg-white rounded-sm"></div>
                    <div className="w-6 h-2.5 bg-white rounded-sm"></div>
                  </div>
                </div>

                {/* Chat Screen */}
                <div className="bg-[#89A6C8] h-full w-full rounded-[2.5rem] pt-14 pb-20 px-4 overflow-y-auto flex flex-col gap-4">
                  {/* Date Separator */}
                  <div className="flex justify-center my-2">
                    <span className="bg-black/20 text-white text-[10px] px-2 py-0.5 rounded-full">
                      今日
                    </span>
                  </div>

                  {/* System Message */}
                  <div className="flex justify-center">
                    <span className="bg-black/10 text-white text-[10px] px-3 py-1 rounded-full text-center max-w-[80%]">
                      "Lカート"が友だち追加されました
                    </span>
                  </div>

                  {/* Bot Message */}
                  {isEnabled && (
                    <div className="flex gap-2 items-start">
                      <div className="w-8 h-8 rounded-full bg-white flex-shrink-0 overflow-hidden border border-gray-200">
                        <img src="/placeholder-logo.png" alt="Bot" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col gap-1 max-w-[75%]">
                        <span className="text-[10px] text-white ml-1">Lカート</span>
                        <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm text-sm whitespace-pre-wrap break-words">
                          {message || "（メッセージを入力してください）"}
                        </div>
                        <span className="text-[10px] text-white self-end mr-1">既読 9:41</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#F5F5F5] z-10 border-t border-gray-200 px-4 pt-3">
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 text-gray-400">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div className="flex-1 h-9 bg-white rounded-full border border-gray-300"></div>
                    <div className="w-8 h-8 text-gray-400">
                      <Smartphone className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="w-32 h-1 bg-gray-900 rounded-full mx-auto mt-4 opacity-20"></div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">
                プレビュー
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
