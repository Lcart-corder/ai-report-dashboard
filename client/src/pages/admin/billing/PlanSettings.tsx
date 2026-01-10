import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Zap, ShoppingCart, MessageSquare, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const plans = [
  {
    id: 'free',
    name: 'フリープラン',
    price: '0',
    description: '個人や小規模なテスト運用に最適',
    features: [
      '月間配信数 1,000通まで',
      '友だち登録数 200人まで',
      '基本機能（一斉配信、自動応答）',
      'チャットサポート（平日のみ）'
    ],
    current: true
  },
  {
    id: 'starter',
    name: 'スタータープラン',
    price: '9,800',
    description: '本格的な運用を始めたい方向け',
    features: [
      '月間配信数 無制限',
      '友だち登録数 5,000人まで',
      'ステップ配信機能',
      'リッチメニュー作成',
      'メールサポート（24時間受付）'
    ],
    current: false
  },
  {
    id: 'pro',
    name: 'プロプラン',
    price: '29,800',
    description: '高度な分析と自動化が必要な企業向け',
    features: [
      '友だち登録数 無制限',
      '高度な分析レポート',
      'セグメント配信',
      'API連携（Shopify, 楽天など）',
      '優先サポート'
    ],
    current: false,
    popular: true
  },
  {
    id: 'enterprise',
    name: 'エンタープライズ',
    price: '要相談',
    description: '大規模運用やカスタマイズが必要な場合',
    features: [
      '専任担当者によるサポート',
      'カスタム機能開発',
      'SLA（品質保証）',
      '請求書払い対応',
      'オンボーディング支援'
    ],
    current: false
  }
];

const optionFeatures = [
  {
    id: 'rakuten',
    name: '楽天連携',
    description: '楽天市場の商品データと連携し、在庫管理や注文情報を自動同期',
    price: '5,000',
    icon: ShoppingCart,
    features: [
      '商品データの自動同期',
      '在庫管理の自動化',
      '注文情報のリアルタイム連携',
      '楽天ポイント連携'
    ]
  },
  {
    id: 'shopify',
    name: 'Shopify連携',
    description: 'Shopifyストアと連携し、商品管理や顧客データを統合',
    price: '5,000',
    icon: ShoppingCart,
    features: [
      'Shopify商品の自動インポート',
      '顧客データの統合管理',
      '注文ステータスの自動更新',
      'カート放棄リカバリー'
    ]
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT連携',
    description: 'AI搭載の自動応答で顧客対応を効率化',
    price: '8,000',
    icon: MessageSquare,
    features: [
      'AI自動応答（24時間対応）',
      '自然な会話生成',
      'よくある質問の自動対応',
      '多言語対応'
    ]
  }
];

export default function PlanSettingsPage() {
  const [enabledOptions, setEnabledOptions] = useState<Record<string, boolean>>({
    rakuten: false,
    shopify: false,
    chatgpt: false
  });

  const handleUpgrade = (planName: string) => {
    toast.info(`${planName}への変更リクエストを受け付けました。`);
  };

  const handleToggleOption = (optionId: string, enabled: boolean) => {
    setEnabledOptions(prev => ({ ...prev, [optionId]: enabled }));
    const option = optionFeatures.find(o => o.id === optionId);
    if (enabled) {
      toast.success(`${option?.name}を有効化しました`);
    } else {
      toast.info(`${option?.name}を無効化しました`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">プラン・支払い設定</h1>
        <p className="text-muted-foreground">
          ご利用状況に合わせて最適なプランをお選びください。
        </p>
      </div>

      {/* Current Plan Status */}
      <Card className="mb-10 border-l-4 border-l-[#06C755]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#06C755]" />
            現在のプラン
          </CardTitle>
          <CardDescription>
            現在 <span className="font-bold text-foreground">フリープラン</span> をご利用中です。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">次回更新日</span>
              <span className="font-medium">2026年2月1日</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">月間配信数</span>
              <span className="font-medium">124 / 1,000通</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Selection */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={`flex flex-col relative ${plan.popular ? 'border-[#06C755] shadow-md' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#06C755] text-white text-xs font-bold px-3 py-1 rounded-full">
                一番人気
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-6">
                <span className="text-3xl font-bold">¥{plan.price}</span>
                {plan.price !== '要相談' && <span className="text-muted-foreground">/月</span>}
              </div>
              <ul className="space-y-3 text-sm">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#06C755] mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={plan.current ? "outline" : (plan.popular ? "default" : "secondary")}
                disabled={plan.current}
                onClick={() => handleUpgrade(plan.name)}
              >
                {plan.current ? "利用中" : "プラン変更"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Optional Features */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          オプション機能
        </h2>
        <p className="text-muted-foreground mb-6">
          必要な連携機能を追加して、さらに便利にご利用いただけます。
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {optionFeatures.map((option) => {
            const Icon = option.icon;
            const isEnabled = enabledOptions[option.id];
            return (
              <Card key={option.id} className={`flex flex-col ${isEnabled ? 'border-[#06C755] bg-green-50/50' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isEnabled ? 'bg-[#06C755] text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{option.name}</CardTitle>
                        <div className="mt-1">
                          <span className="text-xl font-bold">¥{option.price}</span>
                          <span className="text-muted-foreground text-sm">/月</span>
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => handleToggleOption(option.id, checked)}
                    />
                  </div>
                  <CardDescription className="mt-3">{option.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2 text-sm">
                    {option.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#06C755] mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isEnabled && (
                    <Badge className="w-full justify-center bg-[#06C755] hover:bg-[#05b34c]">
                      有効
                    </Badge>
                  )}
                  {!isEnabled && (
                    <Badge variant="outline" className="w-full justify-center">
                      無効
                    </Badge>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment Method */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          支払い方法
        </h2>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-16 bg-gray-100 rounded flex items-center justify-center border">
                <span className="font-bold text-xs text-gray-500">VISA</span>
              </div>
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">有効期限: 12/2028</p>
              </div>
            </div>
            <Button variant="outline" size="sm">変更</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
