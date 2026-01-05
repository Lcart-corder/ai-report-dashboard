import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, MessageCircle, BarChart } from 'lucide-react';

export default function IntegrationHub() {
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">連携設定</h1>
        <p className="text-muted-foreground">
          外部サービスと連携して、ショップの機能を拡張します。
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Shopify Integration */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-[#95BF47]/10 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-[#95BF47]" />
              </div>
              <CardTitle>Shopify連携</CardTitle>
            </div>
            <CardDescription>
              Shopifyの商品・注文データを同期し、Lカート上で活用します。
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto pt-0">
            <Link href="/admin/integrations/shopify">
              <Button className="w-full" variant="outline">設定する</Button>
            </Link>
          </CardContent>
        </Card>

        {/* LINE Official Account */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-[#06C755]/10 rounded-lg">
                <MessageCircle className="h-6 w-6 text-[#06C755]" />
              </div>
              <CardTitle>LINE公式アカウント</CardTitle>
            </div>
            <CardDescription>
              Messaging APIを使用して、自動応答や通知メッセージを配信します。
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto pt-0">
            <Link href="/admin/integrations/line-official">
              <Button className="w-full" variant="outline">設定する</Button>
            </Link>
          </CardContent>
        </Card>

        {/* LINE Ads */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-[#06C755]/10 rounded-lg">
                <BarChart className="h-6 w-6 text-[#06C755]" />
              </div>
              <CardTitle>LINE広告</CardTitle>
            </div>
            <CardDescription>
              LINE Tagを設置し、コンバージョン計測やオーディエンス連携を行います。
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto pt-0">
            <Link href="/admin/integrations/line-ads">
              <Button className="w-full" variant="outline">設定する</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
