import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Image as ImageIcon, LayoutGrid, Plus, Save, Smartphone, Settings } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { PageTemplate } from "@/components/page-template";
import { ActionBuilder } from "@/components/actions/ActionBuilder";
import { ActionSetStep } from "@/types/schema";

export default function RichMenuCreatePage() {
  const [selectedTemplate, setSelectedTemplate] = useState("large_6");
  const [isActionBuilderOpen, setIsActionBuilderOpen] = useState(false);
  const [currentAreaIndex, setCurrentAreaIndex] = useState<number | null>(null);
  const [areaActions, setAreaActions] = useState<Record<number, ActionSetStep[]>>({});

  const handleOpenActionBuilder = (index: number) => {
    setCurrentAreaIndex(index);
    setIsActionBuilderOpen(true);
  };

  const handleSaveActions = (steps: ActionSetStep[]) => {
    if (currentAreaIndex !== null) {
      setAreaActions({
        ...areaActions,
        [currentAreaIndex]: steps
      });
    }
  };

  return (
    <PageTemplate title="リッチメニュー作成" breadcrumbs={[{ label: "メッセージ", href: "/messages" }, { label: "リッチメニュー", href: "/messages/rich-menus" }, { label: "作成" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">管理タイトル <span className="text-red-500">*</span></Label>
                <Input id="title" placeholder="例：2024年春キャンペーン用メニュー" />
                <p className="text-xs text-muted-foreground">管理用です。ユーザーには表示されません。</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chat-bar-text">メニューバーのテキスト <span className="text-red-500">*</span></Label>
                <Input id="chat-bar-text" defaultValue="メニュー" placeholder="メニュー" />
                <p className="text-xs text-muted-foreground">トーク画面下部のメニューバーに表示されるテキストです。</p>
              </div>

              <div className="space-y-2">
                <Label>メニューのデフォルト表示</Label>
                <RadioGroup defaultValue="show" className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="show" id="show" />
                    <Label htmlFor="show">表示する</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hide" id="hide" />
                    <Label htmlFor="hide">表示しない</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>期間設定</Label>
                <div className="flex gap-2 items-center">
                  <Input type="datetime-local" className="w-auto" />
                  <span>〜</span>
                  <Input type="datetime-local" className="w-auto" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>コンテンツ設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>テンプレート選択</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["large_6", "large_4", "large_3", "compact_2", "compact_3"].map((type) => (
                    <Button
                      key={type}
                      variant={selectedTemplate === type ? "default" : "outline"}
                      className="h-20 flex flex-col gap-1"
                      onClick={() => setSelectedTemplate(type)}
                    >
                      <LayoutGrid className="h-6 w-6" />
                      <span className="text-xs">{type}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>背景画像</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">画像をアップロード</span>
                    <span className="text-xs text-muted-foreground">推奨サイズ: 2500px × 1686px</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>アクション設定</Label>
                  <div className="space-y-4 border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">エリア A</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">左上</span>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded text-sm mb-2">
                      {areaActions[0] && areaActions[0].length > 0 ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <Settings className="w-4 h-4" />
                          <span>{areaActions[0].length}個のアクションが設定されています</span>
                        </div>
                      ) : (
                        <div className="text-slate-500">アクション未設定</div>
                      )}
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleOpenActionBuilder(0)}
                    >
                      <Settings className="mr-2 h-4 w-4" /> 
                      詳細アクション設定（エルメアクション）
                    </Button>
                  </div>
                
                {/* More areas would be generated based on template */}
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> 全エリアのアクションを設定
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>プレビュー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-3xl overflow-hidden bg-white shadow-xl max-w-[300px] mx-auto aspect-[9/19] relative">
                {/* Mock Phone Header */}
                <div className="bg-slate-800 text-white p-3 text-xs flex justify-between items-center">
                  <span>9:41</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-white rounded-full opacity-20"></div>
                    <div className="w-3 h-3 bg-white rounded-full opacity-20"></div>
                  </div>
                </div>
                
                {/* Chat Area */}
                <div className="bg-[#8c9bb4] h-full p-2 flex flex-col justify-end pb-20">
                  {/* Rich Menu Area */}
                  <div className="bg-white absolute bottom-0 left-0 right-0 border-t">
                    <div className="bg-slate-100 py-2 px-4 text-center text-xs text-slate-500 border-b">
                      メニュー
                    </div>
                    <div className="aspect-[2500/1686] bg-slate-200 flex items-center justify-center text-slate-400">
                      <ImageIcon className="h-12 w-12" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline" asChild>
          <Link href="/messages/rich-menus">キャンセル</Link>
        </Button>
        <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white">
          <Save className="mr-2 h-4 w-4" /> 保存する
        </Button>
      </div>

      <ActionBuilder
        isOpen={isActionBuilderOpen}
        onClose={() => setIsActionBuilderOpen(false)}
        onSave={handleSaveActions}
        initialSteps={currentAreaIndex !== null ? areaActions[currentAreaIndex] : []}
        triggerName={`エリア ${currentAreaIndex !== null ? String.fromCharCode(65 + currentAreaIndex) : ''} タップ`}
      />
    </PageTemplate>
  );
}
