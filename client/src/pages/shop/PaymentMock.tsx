import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function PaymentMockPage() {
  const [, setLocation] = useLocation();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');

  useEffect(() => {
    const data = sessionStorage.getItem("current_payment");
    if (!data) {
      setLocation("/shop");
      return;
    }
    setPaymentData(JSON.parse(data));
  }, []);

  const handlePayment = async (success: boolean) => {
    if (!paymentData) return;

    try {
      // Call Webhook Mock
      await fetch("/api/payments/webhook/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: paymentData.payment_id,
          status: success ? "succeeded" : "failed"
        })
      });

      if (success) {
        setStatus('success');
        setTimeout(() => {
          setLocation("/shop/checkout/complete");
        }, 1500);
      } else {
        setStatus('failed');
      }
    } catch (err) {
      console.error(err);
      setStatus('failed');
    }
  };

  if (!paymentData) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center border-b">
          <CardTitle>L-Cart Payment Gateway</CardTitle>
          <p className="text-sm text-gray-500">安全な決済処理を実行中...</p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">お支払い金額</p>
            <p className="text-3xl font-bold">¥{paymentData.amount.toLocaleString()}</p>
          </div>

          {status === 'processing' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 text-blue-700 rounded-md text-sm text-center">
                これはデモ用の決済画面です。<br/>
                実際のカード情報は入力されません。
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-12 border-red-200 hover:bg-red-50 text-red-600"
                  onClick={() => handlePayment(false)}
                >
                  <XCircle className="mr-2 w-4 h-4" />
                  失敗させる
                </Button>
                <Button 
                  className="h-12 bg-blue-600 hover:bg-blue-700"
                  onClick={() => handlePayment(true)}
                >
                  <CheckCircle2 className="mr-2 w-4 h-4" />
                  決済成功
                </Button>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8 text-green-600 animate-in zoom-in duration-300">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold">決済完了</h3>
              <p className="text-sm text-gray-500 mt-2">ショップへ戻ります...</p>
            </div>
          )}

          {status === 'failed' && (
            <div className="text-center py-8 text-red-600 animate-in zoom-in duration-300">
              <XCircle className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold">決済失敗</h3>
              <p className="text-sm text-gray-500 mt-2">もう一度お試しください</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setStatus('processing')}
              >
                再試行
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
