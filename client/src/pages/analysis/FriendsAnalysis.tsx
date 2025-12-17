import React from "react";
import { PageTemplate } from "@/components/page-template";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FriendsAnalysisPage() {
  return (
    <PageTemplate 
      title="友だち分析" 
      description="友だちの増減や属性分布を確認します。"
      breadcrumbs={[{ label: "分析" }, { label: "友だち分析" }]}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">友だち追加数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">+124</div>
            <p className="text-xs text-green-600 mt-1">↑ 12.5% (前期間比)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">ブロック数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">18</div>
            <p className="text-xs text-red-600 mt-1">↑ 2.1% (前期間比)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">有効友だち数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">2,124</div>
            <p className="text-xs text-green-600 mt-1">↑ 5.3% (前期間比)</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>友だち推移</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md border border-dashed">
          <p className="text-gray-400">グラフが表示されます（Recharts等のライブラリを使用）</p>
        </CardContent>
      </Card>
    </PageTemplate>
  );
}
