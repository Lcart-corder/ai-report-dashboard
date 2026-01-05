import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Save, Settings, QrCode, Link as LinkIcon, Copy, Download } from "lucide-react";
import { Link } from "wouter";
import { PageTemplate } from "@/components/page-template";
import { ActionBuilder } from "@/components/actions/ActionBuilder";
import { ActionSetStep } from "@/types/schema";
import { useState } from "react";
import { toast } from "sonner";

export default function TrafficSourceCreate() {
  const [actions, setActions] = useState<ActionSetStep[]>([]);
  const [isActionBuilderOpen, setIsActionBuilderOpen] = useState(false);
  const [sourceType, setSourceType] = useState("qr"); // qr or url

  const handleSave = () => {
    toast.success("流入経路を作成しました");
  };

  return (
    <PageTemplate 
      title="流入経路作成" 
      description="新しい友だち追加経路を作成し、アクションを設定します。"
      breadcrumbs={[{ label: "分析", href: "/analysis" }, { label: "流入経路分析", href: "/analysis/traffic" }, { label: "作成" }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">管理名 <span className="text-red-500">*</span></Label>
                <Input id="name" placeholder="例：InstagramキャンペーンA" />
                <p className="text-xs text-muted-foreground">管理用です。友だちには表示されません。</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>フォルダ</Label>
                  <Select defaultValue="uncategorized">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uncategorized">未分類</SelectItem>
                      <SelectItem value="sns">SNS</SelectItem>
                      <SelectItem value="store">店舗</SelectItem>
                      <SelectItem value="web">Webサイト</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>タイプ</Label>
                  <RadioGroup defaultValue="qr" className="flex gap-4 pt-2" onValueChange={setSourceType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="qr" id="r1" />
                      <Label htmlFor="r1" className="cursor-pointer">QRコード</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="url" id="r2" />
                      <Label htmlFor="r2" className="cursor-pointer">URLのみ</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label>メモ</Label>
                <Textarea placeholder="キャンペーンの詳細などを記録できます" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle>アクション設定</CardTitle>
                <CardDescription>この経路から友だち追加・アクセスされた時の動作を設定します。</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsActionBuilderOpen(true)}>
                <Settings className="mr-2 h-4 w-4" /> アクション編集
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 pb-4 border-b">
                <Switch id="action-trigger" defaultChecked />
                <Label htmlFor="action-trigger">すでに友だちの場合もアクションを実行する</Label>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">設定済みのアクション: {actions.length}件</span>
                </div>
                {actions.length === 0 ? (
                  <div className="text-sm text-slate-500 text-center py-4">
                    アクションは設定されていません。<br />
                    「アクション編集」ボタンから設定してください。
                  </div>
                ) : (
                  <div className="space-y-2">
                    {actions.map((action, index) => (
                      <div key={index} className="text-sm bg-white p-2 rounded border flex items-center gap-2">
                        <span className="bg-slate-100 text-xs px-2 py-1 rounded text-slate-600">
                          {index + 1}
                        </span>
                        <span>
                          {action.action_type === 'tag' && '【タグ操作】'}
                          {action.action_type === 'text_message' && '【メッセージ送信】'}
                          {action.action_type === 'template_message' && '【テンプレート送信】'}
                          {action.action_type === 'step_scenario' && '【シナリオ操作】'}
                          {action.action_type === 'rich_menu' && '【リッチメニュー変更】'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preview & Publish */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>発行URL / QRコード</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>友だち追加URL</Label>
                <div className="flex gap-2">
                  <Input value="https://lin.ee/example123" readOnly className="bg-slate-50" />
                  <Button variant="outline" size="icon" onClick={() => {
                    navigator.clipboard.writeText("https://lin.ee/example123");
                    toast.success("コピーしました");
                  }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {sourceType === 'qr' && (
                <div className="space-y-2">
                  <Label>QRコード</Label>
                  <div className="border rounded-lg p-4 flex flex-col items-center bg-white">
                    <div className="w-40 h-40 bg-slate-100 rounded flex items-center justify-center mb-4">
                      <QrCode className="w-20 h-20 text-slate-400" />
                    </div>
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" className="flex-1 text-xs">
                        <Download className="mr-2 h-3 w-3" /> PNG
                      </Button>
                      <Button variant="outline" className="flex-1 text-xs">
                        <Download className="mr-2 h-3 w-3" /> EPS
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" /> 保存する
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ActionBuilder
        isOpen={isActionBuilderOpen}
        onClose={() => setIsActionBuilderOpen(false)}
        onSave={(newActions) => {
          setActions(newActions);
          setIsActionBuilderOpen(false);
        }}
        initialSteps={actions}
        triggerName="流入時アクション"
      />
    </PageTemplate>
  );
}
