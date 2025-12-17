import React from "react";
import { PageTemplate } from "@/components/page-template";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MessagesAnalysisPage() {
  return (
    <PageTemplate 
      title="メッセージ分析" 
      description="配信メッセージの開封率やクリック率を確認します。"
      breadcrumbs={[{ label: "分析" }, { label: "メッセージ分析" }]}
      actions={
        <Select defaultValue="30days">
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="期間を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">過去7日間</SelectItem>
            <SelectItem value="30days">過去30日間</SelectItem>
            <SelectItem value="90days">過去90日間</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">総配信数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">15,420</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">開封率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">68.5%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">クリック率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">24.6%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">CV率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">3.2%</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>配信パフォーマンス推移</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md border border-dashed">
          <p className="text-gray-400">グラフが表示されます（Recharts等のライブラリを使用）</p>
        </CardContent>
      </Card>
    </PageTemplate>
  );
}
