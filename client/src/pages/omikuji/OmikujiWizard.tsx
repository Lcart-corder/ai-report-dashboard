import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, ChevronLeft, Save, Plus, Trash2, 
  Gift, MessageSquare, AlertCircle, CheckCircle2,
  LayoutTemplate, Coins
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types for Wizard State
interface WizardState {
  // Step 1: Basic
  name: string;
  daily_limit: boolean;
  reset_time: string;
  
  // Step 2: Results
  results: {
    id: string;
    name: string;
    weight: number;
    points: number;
    message_text: string;
  }[];
  
  // Step 3: Block Message
  block_message_text: string;
  
  // Step 4: Rewards
  enable_rewards: boolean;
  rewards: {
    id: string;
    name: string;
    required_points: number;
    message_text: string;
  }[];
}

const INITIAL_STATE: WizardState = {
  name: "",
  daily_limit: true,
  reset_time: "00:00",
  results: [
    { id: "1", name: "大吉", weight: 10, points: 10, message_text: "大吉！おめでとうございます！10ポイントプレゼント！" },
    { id: "2", name: "中吉", weight: 30, points: 5, message_text: "中吉！いいことあるかも。5ポイントプレゼント！" },
    { id: "3", name: "小吉", weight: 60, points: 1, message_text: "小吉。コツコツ貯めよう。1ポイントプレゼント！" },
  ],
  block_message_text: "本日は既におみくじを引いています。\nまた明日チャレンジしてください！",
  enable_rewards: false,
  rewards: [
    { id: "1", name: "500円クーポン", required_points: 100, message_text: "500円クーポンと交換しました！\nクーポンコード: XXXXX" }
  ]
};

const STEPS = [
  { id: 1, title: "基本設定", icon: SettingsIcon },
  { id: 2, title: "結果設定", icon: Gift },
  { id: 3, title: "重複対策", icon: AlertCircle },
  { id: 4, title: "特典交換", icon: Coins },
  { id: 5, title: "確認・公開", icon: CheckCircle2 },
];

function SettingsIcon(props: any) {
  return <LayoutTemplate {...props} />;
}

export default function OmikujiWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<WizardState>(INITIAL_STATE);
  const [_, setLocation] = useLocation();

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = () => {
    // Mock save
    toast.success("おみくじを作成しました！");
    setLocation("/omikuji");
  };

  const updateResult = (index: number, field: string, value: any) => {
    const newResults = [...formData.results];
    newResults[index] = { ...newResults[index], [field]: value };
    setFormData({ ...formData, results: newResults });
  };

  const addResult = () => {
    setFormData({
      ...formData,
      results: [
        ...formData.results,
        { 
          id: Math.random().toString(36).substr(2, 9), 
          name: "新しい結果", 
          weight: 10, 
          points: 1, 
          message_text: "" 
        }
      ]
    });
  };

  const removeResult = (index: number) => {
    const newResults = [...formData.results];
    newResults.splice(index, 1);
    setFormData({ ...formData, results: newResults });
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">おみくじ新規作成</h1>
        <div className="flex items-center justify-between mt-6 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10" />
          {STEPS.map((s) => (
            <div 
              key={s.id} 
              className={cn(
                "flex flex-col items-center gap-2 bg-background px-2 transition-colors",
                step >= s.id ? "text-[#06C755]" : "text-gray-400"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                step >= s.id 
                  ? "bg-[#06C755] border-[#06C755] text-white shadow-md" 
                  : "bg-white border-gray-200 text-gray-400"
              )}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <Card className="min-h-[400px] flex flex-col">
        <CardContent className="flex-1 p-6">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label>おみくじ名</Label>
                <Input 
                  placeholder="例：毎日運試し！ログインおみくじ" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">管理用のおみくじ名です。友だちには表示されません。</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 p-4 border rounded-lg bg-slate-50">
                  <Label>1日1回制限</Label>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">同じ友だちは1日1回まで</span>
                    <Switch checked={formData.daily_limit} disabled />
                  </div>
                </div>
                <div className="space-y-2 p-4 border rounded-lg bg-slate-50">
                  <Label>リセット時刻</Label>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">毎日 00:00 にリセット</span>
                    <Badge variant="outline">固定</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between">
                <Label>抽選結果パターン</Label>
                <Button size="sm" variant="outline" onClick={addResult}>
                  <Plus className="w-4 h-4 mr-2" />
                  結果を追加
                </Button>
              </div>

              <div className="space-y-4">
                {formData.results.map((result, index) => (
                  <div key={result.id} className="border rounded-lg p-4 space-y-4 relative bg-white hover:shadow-sm transition-shadow">
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-bold text-slate-500">
                        {index + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>結果名</Label>
                          <Input 
                            value={result.name} 
                            onChange={(e) => updateResult(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>付与ポイント</Label>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number" 
                              value={result.points} 
                              onChange={(e) => updateResult(index, 'points', parseInt(e.target.value))}
                            />
                            <span className="text-sm text-muted-foreground">pt</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>当選確率 (重み)</Label>
                          <div className="flex items-center gap-2">
                            <Slider 
                              value={[result.weight]} 
                              max={100} 
                              step={1}
                              onValueChange={(val) => updateResult(index, 'weight', val[0])}
                              className="flex-1"
                            />
                            <span className="w-12 text-right text-sm font-mono">{result.weight}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-red-500"
                        onClick={() => removeResult(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="pl-12">
                      <Label className="text-xs text-muted-foreground mb-1.5 block">送信メッセージ</Label>
                      <Textarea 
                        placeholder="当選時に送信するメッセージ"
                        className="h-20 text-sm"
                        value={result.message_text}
                        onChange={(e) => updateResult(index, 'message_text', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg flex gap-3 text-yellow-800">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div className="text-sm">
                  <p className="font-bold mb-1">2回目以降のアクセスについて</p>
                  <p>1日1回制限のため、同じ日に2回目以降アクセスした友だちには、抽選を行わずに以下のメッセージを送信します。</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>ブロックメッセージ</Label>
                <Textarea 
                  className="min-h-[150px]"
                  value={formData.block_message_text}
                  onChange={(e) => setFormData({...formData, block_message_text: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  ※ 翌日0:00になるとリセットされ、再度おみくじを引けるようになります。
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                <div className="space-y-0.5">
                  <Label className="text-base">特典交換機能を有効にする</Label>
                  <p className="text-sm text-muted-foreground">
                    貯めたポイントを使って、クーポンや特典と交換できる機能を追加します。
                  </p>
                </div>
                <Switch 
                  checked={formData.enable_rewards}
                  onCheckedChange={(checked) => setFormData({...formData, enable_rewards: checked})}
                />
              </div>

              {formData.enable_rewards && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <Label>交換アイテム設定</Label>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      アイテムを追加
                    </Button>
                  </div>

                  {formData.rewards.map((reward, index) => (
                    <div key={reward.id} className="border rounded-lg p-4 space-y-4 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>特典名</Label>
                          <Input value={reward.name} />
                        </div>
                        <div className="space-y-2">
                          <Label>必要ポイント</Label>
                          <div className="flex items-center gap-2">
                            <Input type="number" value={reward.required_points} />
                            <span className="text-sm text-muted-foreground">pt</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>交換完了メッセージ</Label>
                        <Textarea 
                          value={reward.message_text}
                          className="h-20"
                          placeholder="交換完了時に送信するメッセージ（クーポンコードなど）"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 text-[#06C755] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold mb-2">設定完了！</h2>
                <p className="text-muted-foreground">
                  以下の内容でおみくじを作成します。<br/>
                  作成後、リッチメニュー設定から「おみくじ」アクションを割り当ててください。
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-6 space-y-4 text-sm">
                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                  <span className="text-muted-foreground">おみくじ名</span>
                  <span className="col-span-2 font-medium">{formData.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                  <span className="text-muted-foreground">結果パターン</span>
                  <span className="col-span-2 font-medium">{formData.results.length} パターン</span>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                  <span className="text-muted-foreground">特典交換</span>
                  <span className="col-span-2 font-medium">
                    {formData.enable_rewards ? "有効" : "無効"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t p-6 bg-slate-50/50">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={step === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
          
          {step < 5 ? (
            <Button onClick={handleNext} className="bg-[#06C755] hover:bg-[#05b34c]">
              次へ
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSave} className="bg-[#06C755] hover:bg-[#05b34c]">
              <Save className="w-4 h-4 mr-2" />
              作成して公開
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
