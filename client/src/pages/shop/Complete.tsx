import React from "react";
import { Link } from "wouter";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag } from "lucide-react";

export default function CompletePage() {
  return (
    <ShopLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">ご注文ありがとうございます</h1>
        <p className="text-gray-500 mb-8">
          決済が完了し、注文が確定しました。<br/>
          発送準備が整い次第、ご連絡いたします。
        </p>

        <div className="w-full space-y-3">
          <Button asChild className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
            <Link href="/shop/mypage">注文履歴を見る</Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-12 text-lg">
            <Link href="/shop">トップに戻る</Link>
          </Button>
        </div>
      </div>
    </ShopLayout>
  );
}
