import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface PaymentSettingsStepProps {
  shopData: any;
  setShopData: (data: any) => void;
}

const paymentMethods = [
  {
    id: "stripe",
    name: "Stripe",
    description: "クレジットカード決済（Visa, Mastercard, JCB等）",
    icon: CreditCard,
    enabled: true,
    recommended: true,
  },
  {
    id: "bank_transfer",
    name: "銀行振込",
    description: "銀行口座への振込（手動確認）",
    icon: CreditCard,
    enabled: false,
    recommended: false,
  },
  {
    id: "cod",
    name: "代金引換",
    description: "商品受け取り時に現金で支払い",
    icon: CreditCard,
    enabled: false,
    recommended: false,
  },
];

export default function PaymentSettingsStep({ shopData, setShopData }: PaymentSettingsStepProps) {
  const togglePaymentMethod = (methodId: string) => {
    const updatedMethods = shopData.paymentMethods?.map((method: any) =>
      method.id === methodId ? { ...method, enabled: !method.enabled } : method
    ) || paymentMethods.map((method) =>
      method.id === methodId ? { ...method, enabled: !method.enabled } : method
    );
    setShopData({ ...shopData, paymentMethods: updatedMethods });
  };

  const currentMethods = shopData.paymentMethods || paymentMethods;
  const stripeEnabled = currentMethods.find((m: any) => m.id === "stripe")?.enabled;

  const handleStripeSetup = () => {
    toast.info("Stripe設定ページに移動します");
    // TODO: Navigate to Stripe settings
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600">
        お客様が利用できる決済方法を選択してください。Stripe決済を有効にすると、すぐにクレジットカード決済を受け付けられます。
      </div>

      {/* Stripe Status */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900">Stripe決済</h3>
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
      </div>

      {/* Payment Methods */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">決済方法</h3>
        {currentMethods.map((method: any) => {
          const Icon = method.icon;
          const isEnabled = method.enabled;

          return (
            <div
              key={method.id}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                isEnabled
                  ? "border-[#06C755] bg-[#06C755]/5"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isEnabled ? "bg-[#06C755] text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`payment-${method.id}`} className="text-base font-medium cursor-pointer">
                      {method.name}
                    </Label>
                    {method.recommended && (
                      <Badge variant="secondary" className="text-xs">
                        おすすめ
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {method.description}
                  </p>
                </div>
              </div>
              <Switch
                id={`payment-${method.id}`}
                checked={isEnabled}
                onCheckedChange={() => togglePaymentMethod(method.id)}
              />
            </div>
          );
        })}
      </div>

      {/* Selected Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">選択中の決済方法</h4>
        <div className="flex flex-wrap gap-2">
          {currentMethods
            .filter((method: any) => method.enabled)
            .map((method: any) => (
              <Badge key={method.id} variant="secondary" className="gap-1">
                <CheckCircle className="w-3 h-3" />
                {method.name}
              </Badge>
            ))}
        </div>
        {currentMethods.filter((method: any) => method.enabled).length === 0 && (
          <p className="text-sm text-gray-500">決済方法が選択されていません</p>
        )}
      </div>

      {/* Stripe Info */}
      {stripeEnabled && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-1">Stripe決済について</h4>
              <p className="text-sm text-blue-700">
                Stripeは世界中で利用されている安全な決済プラットフォームです。主要なクレジットカードブランドに対応し、セキュリティも万全です。決済手数料は3.6%です。
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-yellow-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-yellow-900 mb-1">注意事項</h4>
            <p className="text-sm text-yellow-700">
              銀行振込や代金引換を選択する場合は、入金確認や配送手配を手動で行う必要があります。Stripe決済を有効にすることで、決済処理が自動化されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
