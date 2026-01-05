import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight,
  Users,
  ShoppingCart,
  DollarSign,
  Repeat,
  Target,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

// Types
interface KPI {
  name: string;
  value: string;
  change: number;
  status: 'good' | 'warning' | 'critical';
  benchmark: string;
}

interface Insight {
  id: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  actions: string[];
}

export default function AIInsightsPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Mock KPI Data
  const kpis: KPI[] = [
    { name: "セッション数", value: "125,430", change: +12.5, status: "good", benchmark: "目標: 150,000" },
    { name: "CVR（コンバージョン率）", value: "1.8%", change: -0.3, status: "warning", benchmark: "業界平均: 2-3%" },
    { name: "AOV（平均注文額）", value: "¥8,240", change: +5.2, status: "good", benchmark: "目標: ¥10,000" },
    { name: "CAC（顧客獲得コスト）", value: "¥3,200", change: +8.1, status: "critical", benchmark: "目標: ¥2,500" },
    { name: "LTV（顧客生涯価値）", value: "¥24,600", change: +3.4, status: "good", benchmark: "CAC比: 7.7倍" },
    { name: "リピート率", value: "28.5%", change: -2.1, status: "warning", benchmark: "目標: 35%" },
  ];

  // Mock Insights
  const insights: Insight[] = [
    {
      id: "1",
      category: "CVR改善",
      priority: "high",
      title: "カート放棄率が業界平均より15%高い状態です",
      description: "商品をカートに追加後、購入に至らないユーザーが85%います。決済フローの複雑さや送料の高さが原因と考えられます。",
      impact: "CVRを0.5%改善すると、月間売上が約¥625,000増加します",
      actions: [
        "送料無料ラインを¥5,000から¥3,000に引き下げる",
        "カート放棄時の自動リマインダーメッセージを設定する",
        "決済手段にPayPayやLINE Payを追加する",
        "ゲスト購入オプションを追加する"
      ]
    },
    {
      id: "2",
      category: "AOV向上",
      priority: "high",
      title: "クロスセル・アップセルの機会を活用できていません",
      description: "商品詳細ページで関連商品の提案が表示されていないため、単品購入が多い状況です。",
      impact: "AOVを¥1,000向上させると、月間売上が約¥2,250,000増加します",
      actions: [
        "「よく一緒に購入される商品」セクションを追加する",
        "¥10,000以上購入で10%OFFクーポンを提供する",
        "セット商品の提案を強化する",
        "カート内でアップセル商品を表示する"
      ]
    },
    {
      id: "3",
      category: "CAC削減",
      priority: "high",
      title: "広告費用対効果が低下しています",
      description: "新規顧客獲得コストが目標の¥2,500を大きく上回っています。特にディスプレイ広告のCPAが高騰しています。",
      impact: "CACを¥700削減すると、月間マーケティング予算を¥1,575,000削減できます",
      actions: [
        "効果の低い広告キャンペーンを停止する",
        "SNSでのオーガニック投稿を週3回に増やす",
        "既存顧客からの紹介プログラムを導入する",
        "SEO対策を強化して自然検索流入を増やす"
      ]
    },
    {
      id: "4",
      category: "リピート率向上",
      priority: "medium",
      title: "2回目購入までの期間が長すぎます",
      description: "初回購入から2回目購入まで平均90日かかっています。適切なタイミングでのフォローアップが不足しています。",
      impact: "リピート率を5%向上させると、年間売上が約¥18,000,000増加します",
      actions: [
        "購入後30日目にパーソナライズされたクーポンを送信する",
        "定期購入プランを導入する",
        "ポイントプログラムを開始する",
        "購入履歴に基づいたレコメンドメールを送信する"
      ]
    },
    {
      id: "5",
      category: "セッション増加",
      priority: "medium",
      title: "モバイルからのアクセスが伸び悩んでいます",
      description: "モバイルデバイスからのセッション数が前月比-3.2%と減少傾向にあります。",
      impact: "モバイルセッションを10%増加させると、月間売上が約¥1,125,000増加します",
      actions: [
        "モバイルページの読み込み速度を改善する",
        "Instagram広告を強化する",
        "LINE公式アカウントでの定期配信を開始する",
        "モバイルアプリの開発を検討する"
      ]
    }
  ];

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      // TODO: 実際のAI分析API呼び出しに置き換える
      await new Promise(resolve => setTimeout(resolve, 3000));
      setHasAnalyzed(true);
      toast.success("AI分析が完了しました", {
        description: "5件の改善提案を生成しました"
      });
    } catch (error) {
      toast.error("分析に失敗しました");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <PageTemplate
      title="AI分析・改善提案"
      description="AIがビジネス指標を分析し、具体的な改善アクションを提案します。"
      breadcrumbs={[{ label: "分析" }, { label: "AI分析" }]}
      actions={
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing}
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              分析中...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              AI分析を実行
            </>
          )}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              主要KPI一覧
            </CardTitle>
            <CardDescription>
              ECサイトの重要指標とベンチマーク比較
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kpis.map((kpi, index) => (
                <div 
                  key={index}
                  className={`border rounded-lg p-4 ${getStatusColor(kpi.status)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-700">{kpi.name}</span>
                    {getStatusIcon(kpi.status)}
                  </div>
                  <div className="text-2xl font-bold mb-1">{kpi.value}</div>
                  <div className="flex items-center gap-2 text-sm">
                    {kpi.change > 0 ? (
                      <span className="flex items-center text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{kpi.change}%
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        {kpi.change}%
                      </span>
                    )}
                    <span className="text-gray-500">前月比</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">{kpi.benchmark}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        {hasAnalyzed && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI改善提案
              </CardTitle>
              <CardDescription>
                データ分析に基づく具体的なアクションプラン
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">すべて</TabsTrigger>
                  <TabsTrigger value="high">優先度: 高</TabsTrigger>
                  <TabsTrigger value="medium">優先度: 中</TabsTrigger>
                  <TabsTrigger value="low">優先度: 低</TabsTrigger>
                </TabsList>

                {['all', 'high', 'medium', 'low'].map(tab => (
                  <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
                    {insights
                      .filter(insight => tab === 'all' || insight.priority === tab)
                      .map(insight => (
                        <div 
                          key={insight.id}
                          className="border rounded-lg p-5 bg-white hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(insight.priority)}>
                                {insight.priority === 'high' ? '優先度: 高' : insight.priority === 'medium' ? '優先度: 中' : '優先度: 低'}
                              </Badge>
                              <Badge variant="outline">{insight.category}</Badge>
                            </div>
                          </div>

                          <h3 className="text-lg font-semibold mb-2">{insight.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{insight.description}</p>

                          <div className="bg-purple-50 border border-purple-200 rounded-md p-3 mb-4">
                            <div className="flex items-center gap-2 text-purple-700 font-medium text-sm mb-1">
                              <Target className="w-4 h-4" />
                              期待される効果
                            </div>
                            <p className="text-sm text-purple-900">{insight.impact}</p>
                          </div>

                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">推奨アクション:</div>
                            <ul className="space-y-2">
                              {insight.actions.map((action, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                  <ArrowRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="mt-4 pt-4 border-t flex gap-2">
                            <Button size="sm" variant="outline">詳細を見る</Button>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                              アクションを実行
                            </Button>
                          </div>
                        </div>
                      ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!hasAnalyzed && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI分析を開始しましょう</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                ビジネス指標を分析し、売上向上のための具体的な改善提案を生成します。
                分析には約30秒かかります。
              </p>
              <Button 
                onClick={handleAnalyze}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
              >
                <Sparkles className="w-4 h-4" />
                AI分析を実行
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTemplate>
  );
}
