import React from "react";
import { PageTemplate } from "@/components/page-template";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { StatusBadge } from "@/components/common/ui-kit";

export default function IntegrationsPage() {
  return (
    <PageTemplate 
      title="連携設定" 
      description="外部サービスとの連携状態を管理します。"
      breadcrumbs={[{ label: "連携設定" }]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#06C755] bg-opacity-10 rounded-lg text-[#06C755]">
                <MessageCircle className="w-6 h-6" />
              </div>
              <CardTitle className="text-lg">LINE公式アカウント</CardTitle>
            </div>
            <StatusBadge status="active" label="連携中" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm mb-4">
              メッセージ配信、友だち情報の同期、自動応答機能を利用するために必要です。
            </p>
            <div className="bg-gray-50 p-3 rounded text-sm mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">アカウント名:</span>
                <span className="font-medium">Lカート公式デモ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Channel ID:</span>
                <span className="font-medium">1657****89</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">設定を変更</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#95BF47] bg-opacity-10 rounded-lg text-[#95BF47]">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <CardTitle className="text-lg">Shopify</CardTitle>
            </div>
            <StatusBadge status="inactive" label="未連携" variant="neutral" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm mb-4">
              商品情報、注文履歴、顧客情報を同期し、購入に基づいたセグメント配信を可能にします。
            </p>
            <Button className="w-full bg-[#95BF47] hover:bg-[#85AB3E] text-white">連携する</Button>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
