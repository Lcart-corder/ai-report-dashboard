import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types/schema";
import { Package, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MyPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => {
        setOrders(data.sort((a: Order, b: Order) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-500">決済完了</Badge>;
      case 'awaiting_payment': return <Badge variant="outline" className="text-yellow-600 border-yellow-600">未払い</Badge>;
      case 'fulfilled': return <Badge className="bg-blue-500">発送済み</Badge>;
      case 'canceled': return <Badge variant="destructive">キャンセル</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <ShopLayout>
        <div className="p-4 text-center text-gray-500">読み込み中...</div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="p-4 pb-24">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
          </div>
          <div>
            <h1 className="text-xl font-bold">ゲスト ユーザー</h1>
            <p className="text-sm text-gray-500">会員ランク: レギュラー</p>
          </div>
        </div>

        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          注文履歴
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-dashed">
            <p className="text-gray-500">まだ注文履歴がありません</p>
            <Button asChild variant="link" className="mt-2">
              <Link href="/shop">買い物を始める</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 py-3 px-4 flex flex-row items-center justify-between space-y-0">
                  <div className="text-sm font-medium text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                  {getStatusBadge(order.status)}
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-sm">{order.order_no}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(order as any).items?.length}点の商品
                      </p>
                    </div>
                    <p className="font-bold">¥{order.grand_total.toLocaleString()}</p>
                  </div>
                  
                  <div className="space-y-2">
                    {(order as any).items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        <span className="line-clamp-1 flex-1">{item.product_name}</span>
                        <span className="text-xs">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t flex justify-end">
                    <Button variant="ghost" size="sm" className="text-blue-600 h-8">
                      詳細を見る <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
