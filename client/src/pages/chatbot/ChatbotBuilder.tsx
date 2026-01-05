import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  MessageSquare, 
  ShoppingCart, 
  Package, 
  HelpCircle, 
  Sparkles,
  Settings,
  Database,
  Brain,
  Eye,
  Rocket,
  CheckCircle2,
  ChevronRight,
  Plus,
  Trash2
} from "lucide-react";

export default function ChatbotBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [botConfig, setBotConfig] = useState({
    name: "",
    icon: "",
    greeting: "",
    tone: "friendly",
    enableProductRecommendation: true,
    enableInventoryCheck: true,
    enableOrderSupport: true,
    enableFAQ: true,
    enableCartRecovery: true,
  });

  const [faqs, setFaqs] = useState([
    { question: "", answer: "" }
  ]);

  const steps = [
    { id: 1, title: "基本設定", icon: Settings, description: "ボットの基本情報を設定" },
    { id: 2, title: "応答シナリオ", icon: MessageSquare, description: "応答パターンを設定" },
    { id: 3, title: "商品データ連携", icon: Database, description: "商品データを連携" },
    { id: 4, title: "トレーニング", icon: Brain, description: "AIをトレーニング" },
    { id: 5, title: "プレビュー", icon: Eye, description: "動作を確認" },
    { id: 6, title: "公開", icon: Rocket, description: "チャットボットを公開" },
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addFAQ = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const removeFAQ = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFAQ = (index: number, field: "question" | "answer", value: string) => {
    const newFAQs = [...faqs];
    newFAQs[index][field] = value;
    setFaqs(newFAQs);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="botName">ボット名</Label>
              <Input
                id="botName"
                placeholder="例: Lカートアシスタント"
                value={botConfig.name}
                onChange={(e) => setBotConfig({ ...botConfig, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="greeting">挨拶メッセージ</Label>
              <Textarea
                id="greeting"
                placeholder="例: こんにちは！Lカートアシスタントです。商品のご案内や在庫確認、ご注文のサポートなど、お気軽にお尋ねください。"
                value={botConfig.greeting}
                onChange={(e) => setBotConfig({ ...botConfig, greeting: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">トーン設定</Label>
              <Select
                value={botConfig.tone}
                onValueChange={(value) => setBotConfig({ ...botConfig, tone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">フレンドリー</SelectItem>
                  <SelectItem value="formal">フォーマル</SelectItem>
                  <SelectItem value="casual">カジュアル</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">商品推薦</div>
                    <div className="text-sm text-muted-foreground">ユーザーに最適な商品を推薦</div>
                  </div>
                </div>
                <Switch
                  checked={botConfig.enableProductRecommendation}
                  onCheckedChange={(checked) => 
                    setBotConfig({ ...botConfig, enableProductRecommendation: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">在庫確認</div>
                    <div className="text-sm text-muted-foreground">リアルタイムで在庫状況を確認</div>
                  </div>
                </div>
                <Switch
                  checked={botConfig.enableInventoryCheck}
                  onCheckedChange={(checked) => 
                    setBotConfig({ ...botConfig, enableInventoryCheck: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">注文サポート</div>
                    <div className="text-sm text-muted-foreground">注文状況の追跡とサポート</div>
                  </div>
                </div>
                <Switch
                  checked={botConfig.enableOrderSupport}
                  onCheckedChange={(checked) => 
                    setBotConfig({ ...botConfig, enableOrderSupport: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="font-medium">FAQ自動応答</div>
                    <div className="text-sm text-muted-foreground">よくある質問に自動で回答</div>
                  </div>
                </div>
                <Switch
                  checked={botConfig.enableFAQ}
                  onCheckedChange={(checked) => 
                    setBotConfig({ ...botConfig, enableFAQ: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-pink-600" />
                  <div>
                    <div className="font-medium">カート放棄リカバリー</div>
                    <div className="text-sm text-muted-foreground">カートに残った商品の購入を促進</div>
                  </div>
                </div>
                <Switch
                  checked={botConfig.enableCartRecovery}
                  onCheckedChange={(checked) => 
                    setBotConfig({ ...botConfig, enableCartRecovery: checked })
                  }
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">商品カタログ連携</CardTitle>
                <CardDescription>商品データベースと連携してチャットボットに商品情報を提供</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-green-900">商品マスタ</div>
                      <div className="text-sm text-green-700">1,234件の商品が連携済み</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                    連携済み
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-green-900">在庫データ</div>
                      <div className="text-sm text-green-700">リアルタイム同期中</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                    連携済み
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-green-900">注文データ</div>
                      <div className="text-sm text-green-700">過去30日分のデータを連携</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                    連携済み
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">よくある質問（FAQ）</CardTitle>
                <CardDescription>顧客からよく聞かれる質問と回答を登録してAIをトレーニング</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>質問 {index + 1}</Label>
                      {faqs.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFAQ(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder="例: 配送にはどのくらいかかりますか？"
                      value={faq.question}
                      onChange={(e) => updateFAQ(index, "question", e.target.value)}
                    />
                    <Textarea
                      placeholder="例: 通常、ご注文から2-3営業日でお届けします。地域によって異なる場合がございます。"
                      value={faq.answer}
                      onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                      rows={3}
                    />
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addFAQ}>
                  <Plus className="h-4 w-4 mr-2" />
                  質問を追加
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">チャットボットプレビュー</CardTitle>
                <CardDescription>実際の動作を確認してください</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-[400px]">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm">{botConfig.greeting || "こんにちは！何かお手伝いできることはありますか？"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 justify-end">
                      <div className="flex-1 bg-blue-600 text-white p-4 rounded-lg shadow-sm max-w-[80%] ml-auto">
                        <p className="text-sm">おすすめの商品を教えてください</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm">
                          {botConfig.enableProductRecommendation 
                            ? "お客様の閲覧履歴から、こちらの商品がおすすめです：\n\n1. 商品A - ¥2,980\n2. 商品B - ¥3,500\n3. 商品C - ¥1,800"
                            : "申し訳ございません。商品推薦機能が無効になっています。"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">公開設定</CardTitle>
                <CardDescription>チャットボットを公開してお客様が利用できるようにします</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">LINE連携</div>
                      <div className="text-sm text-muted-foreground">LINE公式アカウントでチャットボットを利用</div>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">ウェブサイト埋め込み</div>
                      <div className="text-sm text-muted-foreground">ECサイトにチャットウィジェットを表示</div>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-900">準備完了</div>
                      <div className="text-sm text-blue-700 mt-1">
                        チャットボットの設定が完了しました。公開ボタンをクリックして、お客様が利用できるようにしましょう。
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ECチャットボット作成</h1>
        <p className="text-muted-foreground">
          商品推薦、在庫確認、注文サポートなどのEC特化機能を持つAIチャットボットを作成
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ステップインジケーター */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">作成ステップ</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <div
                      key={step.id}
                      className={`p-4 cursor-pointer transition-colors ${
                        isActive
                          ? "bg-blue-50 border-l-4 border-blue-600"
                          : isCompleted
                          ? "bg-green-50 border-l-4 border-green-600"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setCurrentStep(step.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : isCompleted
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm ${isActive ? "text-blue-900" : ""}`}>
                            {step.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {step.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">進捗状況</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={(currentStep / steps.length) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {currentStep} / {steps.length} ステップ完了
              </p>
            </CardContent>
          </Card>
        </div>

        {/* メインコンテンツ */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                {React.createElement(steps[currentStep - 1].icon, { className: "h-6 w-6 text-blue-600" })}
                <div>
                  <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                  <CardDescription>{steps[currentStep - 1].description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderStepContent()}

              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  戻る
                </Button>

                {currentStep < steps.length ? (
                  <Button onClick={nextStep}>
                    次へ
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Rocket className="h-4 w-4 mr-2" />
                    チャットボットを公開
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
