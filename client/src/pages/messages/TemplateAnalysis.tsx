import React from "react";
import { PageTemplate } from "@/components/page-template";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageTemplate } from "@/types/schema";
import { MousePointer, Smartphone, Monitor, Eye } from "lucide-react";

// Mock Data for a specific template
const MOCK_TEMPLATE_STATS = {
  id: "1",
  name: "新春キャンペーンカード",
  total_sent: 15420,
  open_rate: 68.5,
  click_rate: 24.6,
  heatmap_data: [
    { area: "header_image", clicks: 1200, percentage: 45 },
    { area: "cta_button", clicks: 850, percentage: 32 },
    { area: "footer_link", clicks: 600, percentage: 23 },
  ],
  device_stats: {
    mobile: 85,
    desktop: 15,
  }
};

export default function TemplateAnalysisPage() {
  return (
    <PageTemplate 
      title={`分析: ${MOCK_TEMPLATE_STATS.name}`}
      description="テンプレートごとの詳細なパフォーマンス分析を表示します。"
      breadcrumbs={[
        { label: "メッセージ" }, 
        { label: "テンプレート", href: "/messages/templates" },
        { label: "詳細分析" }
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">総配信数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{MOCK_TEMPLATE_STATS.total_sent.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">開封率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{MOCK_TEMPLATE_STATS.open_rate}%</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Eye className="w-3 h-3 mr-1" /> ユニーク開封数: {(MOCK_TEMPLATE_STATS.total_sent * MOCK_TEMPLATE_STATS.open_rate / 100).toFixed(0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">クリック率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{MOCK_TEMPLATE_STATS.click_rate}%</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <MousePointer className="w-3 h-3 mr-1" /> ユニーククリック数: {(MOCK_TEMPLATE_STATS.total_sent * MOCK_TEMPLATE_STATS.click_rate / 100).toFixed(0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">デバイス比率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-gray-500" />
                <span className="font-bold">{MOCK_TEMPLATE_STATS.device_stats.mobile}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-gray-500" />
                <span className="font-bold">{MOCK_TEMPLATE_STATS.device_stats.desktop}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="heatmap" className="w-full">
        <TabsList>
          <TabsTrigger value="heatmap">クリックヒートマップ</TabsTrigger>
          <TabsTrigger value="timeline">時系列推移</TabsTrigger>
        </TabsList>
        
        <TabsContent value="heatmap" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>クリック分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MOCK_TEMPLATE_STATS.heatmap_data.map((area, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          {area.area === "header_image" ? "ヘッダー画像" : 
                           area.area === "cta_button" ? "CTAボタン" : "フッターリンク"}
                        </span>
                        <span className="text-gray-500">{area.clicks} clicks ({area.percentage}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${area.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50 border-dashed flex items-center justify-center min-h-[300px]">
              <div className="text-center text-gray-400">
                <MousePointer className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>ここにテンプレートのプレビューと<br/>ヒートマップオーバーレイが表示されます</p>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardContent className="h-[300px] flex items-center justify-center text-gray-400">
              時系列グラフエリア
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}
