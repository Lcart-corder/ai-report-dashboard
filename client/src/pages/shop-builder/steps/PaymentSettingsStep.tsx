import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, CheckCircle, ExternalLink, Banknote, Package } from "lucide-react";
import { toast } from "sonner";

interface PaymentSettingsStepProps {
  shopData: any;
  setShopData: (data: any) => void;
}

export default function PaymentSettingsStep({ shopData, setShopData }: PaymentSettingsStepProps) {
  const [paymentMethods, setPaymentMethods] = useState(shopData.paymentMethods || {
    stripe: true,
    bankTransfer: false,
    cod: false,
  });

  const togglePaymentMethod = (methodKey: string) => {
    const updated = { ...paymentMethods, [methodKey]: !paymentMethods[methodKey] };
    setPaymentMethods(updated);
    setShopData({ ...shopData, paymentMethods: updated });
  };

  const handleStripeSetup = () => {
    toast.info("Stripe設定ページに移動します");
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600">
        お客様が利用できる決済方法を選択してください。Stripe決済を有効にすると、すぐにクレジットカード決済を受け付けられます。
      </div>

      {/* Stripe Status */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg">Stripe決済</CardTitle>
                <Badge className="bg-green-500">設定済み</Badge>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Stripeアカウントは既に接続されています。クレジットカード決済をすぐに開始できます。
              </p>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleStripeSetup} className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Stripe設定を確認
                </Button>
                <span className="text-xs text-gray-600">
                  テストモード: 4242 4242 4242 4242
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Payment Methods */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">決済方法</h3>
        
        {/* Stripe */}
        <Card className={`border-2 transition-all ${
          paymentMethods.stripe ? "border-[#06C755] bg-[#06C755]/5" : "border-gray-200"
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  paymentMethods.stripe ? "bg-[#06C755] text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="payment-stripe" className="text-base font-medium cursor-pointer">
                      Stripe
                    </Label>
                    <Badge variant="secondary" className="text-xs">おすすめ</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    クレジットカード決済（Visa, Mastercard, JCB等）
                  </p>
                </div>
              </div>
              <Switch
                id="payment-stripe"
                checked={paymentMethods.stripe}
                onCheckedChange={() => togglePaymentMethod('stripe')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bank Transfer */}
        <Card className={`border-2 transition-all ${
          paymentMethods.bankTransfer ? "border-[#06C755] bg-[#06C755]/5" : "border-gray-200"
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  paymentMethods.bankTransfer ? "bg-[#06C755] text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <Label htmlFor="payment-bank" className="text-base font-medium cursor-pointer">
                    銀行振込
                  </Label>
                  <p className="text-sm text-gray-500 mt-0.5">
                    銀行口座への振込（手動確認）
                  </p>
                </div>
              </div>
              <Switch
                id="payment-bank"
                checked={paymentMethods.bankTransfer}
                onCheckedChange={() => togglePaymentMethod('bankTransfer')}
              />
            </div>
          </CardContent>
        </Card>

        {/* COD */}
        <Card className={`border-2 transition-all ${
          paymentMethods.cod ? "border-[#06C755] bg-[#06C755]/5" : "border-gray-200"
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  paymentMethods.cod ? "bg-[#06C755] text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <Label htmlFor="payment-cod" className="text-base font-medium cursor-pointer">
                    代金引換
                  </Label>
                  <p className="text-sm text-gray-500 mt-0.5">
                    商品受け取り時に現金で支払い
                  </p>
                </div>
              </div>
              <Switch
                id="payment-cod"
                checked={paymentMethods.cod}
                onCheckedChange={() => togglePaymentMethod('cod')}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Summary */}
      <Card className="bg-gray-50 border border-gray-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">選択中の決済方法</h4>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.stripe && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="w-3 h-3" />
                Stripe
              </Badge>
            )}
            {paymentMethods.bankTransfer && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="w-3 h-3" />
                銀行振込
              </Badge>
            )}
            {paymentMethods.cod && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="w-3 h-3" />
                代金引換
              </Badge>
            )}
            {!paymentMethods.stripe && !paymentMethods.bankTransfer && !paymentMethods.cod && (
              <p className="text-sm text-gray-500">決済方法が選択されていません</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      {paymentMethods.stripe && (
        <Card className="bg-blue-50 border border-blue-200">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Stripe決済について</h4>
                <p className="text-sm text-blue-700">
                  Stripeは世界中で利用されている安全な決済プラットフォームです。主要なクレジットカードブランドに対応し、セキュリティも万全です。決済手数料は3.6%です。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-yellow-50 border border-yellow-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-900 mb-1">注意事項</h4>
              <p className="text-sm text-yellow-700">
                銀行振込や代金引換を選択する場合は、入金確認や配送手配を手動で行う必要があります。Stripe決済を有効にすることで、決済処理が自動化されます。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
