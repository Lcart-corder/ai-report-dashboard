import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  DollarSign, 
  Truck, 
  FileText, 
  Image as ImageIcon, 
  Settings, 
  Eye,
  Check,
  Plus,
  X,
  Upload
} from "lucide-react";
import { toast } from "sonner";

interface ProductData {
  // 基本情報
  productCode: string;
  productName: string;
  category: string;
  
  // 価格情報
  salePrice: string;
  displayPrice: string;
  pointRate: string;
  
  // 在庫・配送
  stock: string;
  deliveryDays: string;
  
  // 製品情報
  janCode: string;
  genreId: string;
  
  // ページデザイン
  description: string;
  images: File[];
  
  // オプション
  variations: Array<{
    type: string;
    options: string[];
  }>;
}

export default function ProductRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [productData, setProductData] = useState<ProductData>({
    productCode: "",
    productName: "",
    category: "",
    salePrice: "",
    displayPrice: "",
    pointRate: "1",
    stock: "",
    deliveryDays: "",
    janCode: "",
    genreId: "",
    description: "",
    images: [],
    variations: []
  });

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { id: 1, title: "基本情報", icon: Package, description: "商品の基本情報を入力" },
    { id: 2, title: "価格設定", icon: DollarSign, description: "販売価格とポイントを設定" },
    { id: 3, title: "在庫・配送", icon: Truck, description: "在庫数と配送情報を設定" },
    { id: 4, title: "製品情報", icon: FileText, description: "JANコードとジャンルを設定" },
    { id: 5, title: "ページデザイン", icon: ImageIcon, description: "説明文と画像を登録" },
    { id: 6, title: "オプション設定", icon: Settings, description: "バリエーションを追加" },
    { id: 7, title: "プレビュー", icon: Eye, description: "最終確認と公開" }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePublish = () => {
    toast.success("商品を公開しました");
  };

  const addVariation = () => {
    setProductData({
      ...productData,
      variations: [...productData.variations, { type: "", options: [] }]
    });
  };

  const removeVariation = (index: number) => {
    const newVariations = productData.variations.filter((_, i) => i !== index);
    setProductData({ ...productData, variations: newVariations });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">商品登録</h1>
          <p className="text-muted-foreground mt-1">
            楽天市場のベストプラクティスに基づいた商品登録フロー
          </p>
        </div>
        <Button variant="outline">下書き保存</Button>
      </div>

      {/* プログレスバー */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">ステップ {currentStep} / {totalSteps}</span>
              <span className="text-muted-foreground">{Math.round(progress)}% 完了</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* ステップインジケーター */}
      <div className="grid grid-cols-7 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <Card 
              key={step.id}
              className={`cursor-pointer transition-all ${
                isActive ? "ring-2 ring-primary" : ""
              } ${isCompleted ? "bg-primary/5" : ""}`}
              onClick={() => setCurrentStep(step.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  isCompleted ? "bg-primary text-primary-foreground" :
                  isActive ? "bg-primary/20 text-primary" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <p className="text-xs font-medium">{step.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* メインコンテンツ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5" })}
            {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ステップ1: 基本情報 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productCode">商品管理番号 <Badge variant="destructive">必須</Badge></Label>
                  <Input
                    id="productCode"
                    placeholder="例: PROD-001"
                    value={productData.productCode}
                    onChange={(e) => setProductData({ ...productData, productCode: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    在庫管理用の共通番号（他モールと共通で使用可能）
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">カテゴリー <Badge variant="destructive">必須</Badge></Label>
                  <Select value={productData.category} onValueChange={(value) => setProductData({ ...productData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリーを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fashion">ファッション</SelectItem>
                      <SelectItem value="food">食品</SelectItem>
                      <SelectItem value="beauty">美容・コスメ</SelectItem>
                      <SelectItem value="electronics">家電</SelectItem>
                      <SelectItem value="home">ホーム・インテリア</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="productName">
                  商品名 <Badge variant="destructive">必須</Badge>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({productData.productName.length}/127文字、推奨30文字以内)
                  </span>
                </Label>
                <Input
                  id="productName"
                  placeholder="例: 【タイトスカート 裏地付き 全5色 M/L】"
                  value={productData.productName}
                  onChange={(e) => setProductData({ ...productData, productName: e.target.value })}
                  maxLength={127}
                />
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-blue-900 mb-1">💡 商品名の最適化のコツ</p>
                  <ul className="text-blue-800 space-y-1 text-xs">
                    <li>• 前半に重要なキーワードを配置（PC・スマホ両方で見やすく）</li>
                    <li>• 推奨構造: 【ブランド名_商品名称_対象性別_シーズン_仕様_色_サイズ】</li>
                    <li>• 30文字以内を推奨（検索結果で全文表示されやすい）</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ステップ2: 価格設定 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salePrice">販売価格 <Badge variant="destructive">必須</Badge></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">¥</span>
                    <Input
                      id="salePrice"
                      type="number"
                      placeholder="3980"
                      className="pl-8"
                      value={productData.salePrice}
                      onChange={(e) => setProductData({ ...productData, salePrice: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">実際の販売価格</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayPrice">表示価格（通常価格）</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">¥</span>
                    <Input
                      id="displayPrice"
                      type="number"
                      placeholder="5980"
                      className="pl-8"
                      value={productData.displayPrice}
                      onChange={(e) => setProductData({ ...productData, displayPrice: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">メーカー希望小売価格や当店通常価格</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pointRate">商品別ポイント変倍</Label>
                <Select value={productData.pointRate} onValueChange={(value) => setProductData({ ...productData, pointRate: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1倍（通常）</SelectItem>
                    <SelectItem value="2">2倍</SelectItem>
                    <SelectItem value="3">3倍</SelectItem>
                    <SelectItem value="5">5倍</SelectItem>
                    <SelectItem value="10">10倍</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  全商品の一律ポイントと差別化して販促に活用
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-yellow-900 mb-1">⚠️ 二重価格表示に関する注意</p>
                <p className="text-yellow-800 text-xs">
                  表示価格には根拠のあるものを記入してください。価格操作を防ぐためのガイドラインが設けられています。
                </p>
              </div>
            </div>
          )}

          {/* ステップ3: 在庫・配送 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">在庫数 <Badge variant="destructive">必須</Badge></Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="100"
                    value={productData.stock}
                    onChange={(e) => setProductData({ ...productData, stock: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryDays">最短お届け可能日</Label>
                  <Select value={productData.deliveryDays} onValueChange={(value) => setProductData({ ...productData, deliveryDays: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">翌日</SelectItem>
                      <SelectItem value="2">2日後</SelectItem>
                      <SelectItem value="3">3日後</SelectItem>
                      <SelectItem value="7">1週間後</SelectItem>
                      <SelectItem value="14">2週間後</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    楽天最強翌日配送ラベル取得に重要
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-green-900 mb-1">✨ 配送品質向上制度</p>
                <p className="text-green-800 text-xs">
                  最短お届け可能日の設定は、楽天最強翌日配送ラベルの取得に影響します。正確な設定で顧客満足度を向上させましょう。
                </p>
              </div>
            </div>
          )}

          {/* ステップ4: 製品情報 */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="janCode">JANコード <Badge variant="destructive">必須</Badge></Label>
                  <Input
                    id="janCode"
                    placeholder="4901234567890"
                    value={productData.janCode}
                    onChange={(e) => setProductData({ ...productData, janCode: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    13桁または8桁のバーコード番号
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genreId">ジャンルID <Badge variant="destructive">必須</Badge></Label>
                  <Input
                    id="genreId"
                    placeholder="100001"
                    value={productData.genreId}
                    onChange={(e) => setProductData({ ...productData, genreId: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    楽天市場のジャンル分類ID
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ステップ5: ページデザイン */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">商品説明文 <Badge variant="destructive">必須</Badge></Label>
                <Textarea
                  id="description"
                  placeholder="商品の魅力を分かりやすく説明してください..."
                  rows={8}
                  value={productData.description}
                  onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  ユーザーに分かりやすく、魅力的な説明を記入しましょう
                </p>
              </div>

              <div className="space-y-2">
                <Label>商品画像 <Badge variant="destructive">必須</Badge></Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">画像をドラッグ&ドロップ</p>
                  <p className="text-xs text-muted-foreground mt-1">または クリックしてファイルを選択</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    推奨: 最大10枚、各5MB以下、JPG/PNG形式
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-blue-900 mb-1">📸 商品写真のポイント</p>
                  <p className="text-blue-800 text-xs">
                    商品写真はコンバージョンに大きく影響します。複数角度からの写真、使用イメージ、サイズ感が分かる写真を用意しましょう。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ステップ6: オプション設定 */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">商品バリエーション</h3>
                  <p className="text-sm text-muted-foreground">サイズ・カラーなどの選択肢を追加</p>
                </div>
                <Button onClick={addVariation} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  バリエーション追加
                </Button>
              </div>

              {productData.variations.length === 0 ? (
                <Card className="bg-muted/50">
                  <CardContent className="py-8 text-center">
                    <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      バリエーションが設定されていません
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      サイズやカラーなどの選択肢を追加できます
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {productData.variations.map((variation, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label>バリエーション種類</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="選択" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="size">サイズ</SelectItem>
                                    <SelectItem value="color">カラー</SelectItem>
                                    <SelectItem value="material">素材</SelectItem>
                                    <SelectItem value="other">その他</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>オプション</Label>
                                <Input placeholder="例: S, M, L, XL" />
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariation(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ステップ7: プレビュー */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 text-center">
                <Check className="h-16 w-16 mx-auto text-green-600 mb-3" />
                <h3 className="text-xl font-bold text-green-900 mb-2">商品登録の準備が完了しました！</h3>
                <p className="text-green-800 text-sm">
                  下記の内容を確認して、問題がなければ公開してください
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>登録内容の確認</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">商品管理番号</p>
                      <p className="font-medium">{productData.productCode || "未設定"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">商品名</p>
                      <p className="font-medium">{productData.productName || "未設定"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">販売価格</p>
                      <p className="font-medium">¥{productData.salePrice || "0"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">在庫数</p>
                      <p className="font-medium">{productData.stock || "0"}個</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ナビゲーションボタン */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          前へ
        </Button>
        <div className="text-sm text-muted-foreground">
          ステップ {currentStep} / {totalSteps}
        </div>
        {currentStep < totalSteps ? (
          <Button onClick={handleNext}>
            次へ
          </Button>
        ) : (
          <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
            <Check className="h-4 w-4 mr-2" />
            商品を公開
          </Button>
        )}
      </div>
    </div>
  );
}
