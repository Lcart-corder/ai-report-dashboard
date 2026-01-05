import { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import {
  SalesBarChart,
  ComparisonBarChart,
  TrendLineChart,
  MultiLineChart,
  CategoryPieChart,
  DonutChart,
} from "@/components/charts/AnalyticsCharts";

export default function AIReportDetailPage() {
  // Mock chart data
  const salesData = [
    { name: "月", value: 450000 },
    { name: "火", value: 520000 },
    { name: "水", value: 480000 },
    { name: "木", value: 610000 },
    { name: "金", value: 720000 },
    { name: "土", value: 890000 },
    { name: "日", value: 780000 },
  ];

  const comparisonData = [
    { name: "月", current: 450000, previous: 420000 },
    { name: "火", current: 520000, previous: 480000 },
    { name: "水", current: 480000, previous: 510000 },
    { name: "木", current: 610000, previous: 550000 },
    { name: "金", current: 720000, previous: 680000 },
    { name: "土", current: 890000, previous: 820000 },
    { name: "日", current: 780000, previous: 750000 },
  ];

  const trendData = [
    { name: "1週", value: 3200000 },
    { name: "2週", value: 3450000 },
    { name: "3週", value: 3100000 },
    { name: "4週", value: 3800000 },
    { name: "5週", value: 4200000 },
  ];

  const multiLineData = [
    { name: "1週", sales: 3200000, orders: 142, customers: 98 },
    { name: "2週", sales: 3450000, orders: 158, customers: 112 },
    { name: "3週", sales: 3100000, orders: 135, customers: 89 },
    { name: "4週", sales: 3800000, orders: 172, customers: 125 },
    { name: "5週", sales: 4200000, orders: 189, customers: 138 },
  ];

  const categoryData = [
    { name: "アパレル", value: 35 },
    { name: "アクセサリー", value: 25 },
    { name: "シューズ", value: 20 },
    { name: "バッグ", value: 15 },
    { name: "その他", value: 5 },
  ];

  const channelData = [
    { name: "LINE", value: 45 },
    { name: "Instagram", value: 30 },
    { name: "Google", value: 15 },
    { name: "直接", value: 10 },
  ];

  const insights = [
    {
      type: "positive",
      title: "売上が前週比+15%増加",
      description: "特に週末の売上が好調で、土曜日は過去最高を記録しました。新規顧客の獲得が順調に進んでいます。",
    },
    {
      type: "positive",
      title: "Instagram広告のCVRが向上",
      description: "Instagram経由のコンバージョン率が前月比+8%改善。クリエイティブの最適化が効果を発揮しています。",
    },
    {
      type: "warning",
      title: "カート放棄率がやや上昇",
      description: "カート放棄率が78%→82%に上昇。決済ページの離脱が増加しているため、UI改善を検討してください。",
    },
    {
      type: "positive",
      title: "リピート率が目標達成",
      description: "既存顧客のリピート率が目標の25%を上回る28%を達成。ロイヤルティプログラムが奏功しています。",
    },
  ];

  const recommendations = [
    {
      priority: "high",
      title: "カート放棄対策の強化",
      description: "カート放棄後24時間以内にリマインダーメッセージを送信し、限定クーポンを提供することで、CVRを5-10%改善できる可能性があります。",
      impact: "売上+8-15%",
    },
    {
      priority: "medium",
      title: "週末限定キャンペーンの実施",
      description: "週末の売上が好調なため、金曜夜から日曜夜までの限定セールを実施することで、さらなる売上向上が期待できます。",
      impact: "売上+5-8%",
    },
    {
      priority: "medium",
      title: "Instagram広告予算の増額",
      description: "Instagram広告のROASが高いため、予算を20%増額することで、効率的に新規顧客を獲得できます。",
      impact: "新規顧客+15-20%",
    },
    {
      priority: "low",
      title: "商品レコメンデーションの最適化",
      description: "購入履歴に基づいたパーソナライズドレコメンデーションを強化することで、客単価を向上させることができます。",
      impact: "客単価+3-5%",
    },
  ];

  return (
    <PageTemplate
      title="AI分析レポート詳細"
      description="2024年1月第1週 売上分析レポート"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            PDFダウンロード
          </Button>
          <Link href="/ai/reports">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              一覧に戻る
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Report Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">2024年1月第1週 売上分析レポート</CardTitle>
                <p className="text-sm text-gray-500 mt-2">生成日時: 2024-01-07 10:30</p>
              </div>
              <Badge className="bg-green-500">完了</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              売上が前週比+15%増加。新規顧客獲得が好調で、特にInstagram広告経由のCVRが向上しています。
              週末の売上が過去最高を記録し、リピート率も目標を上回りました。
            </p>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Sales */}
          <Card>
            <CardHeader>
              <CardTitle>日別売上推移</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesBarChart data={salesData} />
            </CardContent>
          </Card>

          {/* Week Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>前週比較</CardTitle>
            </CardHeader>
            <CardContent>
              <ComparisonBarChart data={comparisonData} />
            </CardContent>
          </Card>

          {/* Weekly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>週次売上トレンド</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendLineChart data={trendData} />
            </CardContent>
          </Card>

          {/* Multi Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>複合指標推移</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiLineChart data={multiLineData} />
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>カテゴリー別売上構成</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryPieChart data={categoryData} />
            </CardContent>
          </Card>

          {/* Channel Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>流入チャネル別構成</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart data={channelData} />
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#06C755]" />
              主要インサイト
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
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
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
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

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              AI改善提案
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          rec.priority === "high"
                            ? "destructive"
                            : rec.priority === "medium"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {rec.priority === "high"
                          ? "高優先度"
                          : rec.priority === "medium"
                          ? "中優先度"
                          : "低優先度"}
                      </Badge>
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {rec.impact}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{rec.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
