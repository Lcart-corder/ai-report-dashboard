import React from "react";
import { PageTemplate } from "@/components/page-template";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, History, Settings, ArrowRight, TrendingUp, TrendingDown, Users, MessageSquare, ShoppingCart, Target } from "lucide-react";
import { Link } from "wouter";
import { MultiLineChart, CategoryPieChart } from "@/components/charts/AnalyticsCharts";

export default function AIDashboard() {
  const features = [
    {
      title: "AIレポート生成",
      description: "現在のデータを分析し、改善提案を含むレポートを作成します。",
      icon: Sparkles,
      href: "/ai/reports",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "生成履歴",
      description: "過去に生成したレポートやコンテンツの履歴を確認します。",
      icon: History,
      href: "/ai/history",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "モデル設定",
      description: "使用するAIモデルやプロンプトのカスタマイズを行います。",
      icon: Settings,
      href: "/ai/settings",
      color: "bg-gray-100 text-gray-600",
    },
  ];

  // Mock KPI data
  const kpis = [
    {
      title: "友だち総数",
      value: "12,458",
      change: "+8.3%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "メッセージ開封率",
      value: "68.5%",
      change: "+5.2%",
      trend: "up",
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "コンバージョン率",
      value: "4.2%",
      change: "-1.2%",
      trend: "down",
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "月間売上",
      value: "¥3,200,000",
      change: "+15.7%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  // Mock trend data
  const trendData = [
    { name: "1週", friends: 11200, messages: 2400, conversions: 450 },
    { name: "2週", friends: 11450, messages: 2650, conversions: 480 },
    { name: "3週", friends: 11800, messages: 2300, conversions: 420 },
    { name: "4週", friends: 12100, messages: 2850, conversions: 520 },
    { name: "5週", friends: 12458, messages: 3100, conversions: 580 },
  ];

  // Mock distribution data
  const distributionData = [
    { name: "新規友だち", value: 35 },
    { name: "アクティブ", value: 45 },
    { name: "休眠中", value: 15 },
    { name: "ブロック", value: 5 },
  ];

  // AI insights
  const insights = [
    {
      type: "positive",
      title: "友だち増加が加速",
      description: "先週比+8.3%で友だちが増加。Instagram広告の効果が顕著です。",
    },
    {
      type: "warning",
      title: "コンバージョン率が低下",
      description: "カート放棄率が上昇中。決済フローの改善を推奨します。",
    },
    {
      type: "positive",
      title: "メッセージ開封率が向上",
      description: "パーソナライズ配信の効果で開封率が5.2%向上しました。",
    },
  ];

  return (
    <PageTemplate 
      title="AI分析ダッシュボード" 
      description="AIを活用してビジネスデータを分析し、改善提案を提供します。"
      breadcrumbs={[{ label: "AI" }]}
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <Card key={i} className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-2">{kpi.value}</p>
                    <div className="flex items-center gap-1">
                      {kpi.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          kpi.trend === "up" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {kpi.change}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">vs 先週</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                    <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>週次トレンド</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiLineChart 
                data={trendData.map(d => ({
                  name: d.name,
                  友だち: d.friends,
                  メッセージ: d.messages,
                  CV: d.conversions,
                }))} 
              />
            </CardContent>
          </Card>

          {/* Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>友だち状態分布</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryPieChart data={distributionData} />
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <CardTitle>AI インサイト</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.type === "positive"
                      ? "bg-green-50 border-green-500"
                      : "bg-yellow-50 border-yellow-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {insight.type === "positive" ? (
                      <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-700">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Link key={i} href={feature.href}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow border-gray-200 h-full">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className={`p-3 rounded-lg ${feature.color}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 text-sm mb-4">{feature.description}</p>
                    <div className="flex items-center text-sm font-medium text-[#06C755]">
                      利用する <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
