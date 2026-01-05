import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Tablet, Smartphone } from "lucide-react";

interface LivePreviewStepProps {
  shopData: any;
  setShopData: (data: any) => void;
}

export default function LivePreviewStep({ shopData }: LivePreviewStepProps) {
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const deviceSizes = {
    desktop: "w-full",
    tablet: "w-[768px] mx-auto",
    mobile: "w-[375px] mx-auto",
  };

  const colors = shopData.customization?.colors || {
    primary: shopData.primaryColor || "#06C755",
    secondary: "#4F46E5",
    accent: "#F59E0B",
    background: "#FFFFFF",
    text: "#1F2937",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          作成したショップページのリアルタイムプレビューです。デバイスを切り替えて表示を確認できます。
        </div>
        <div className="flex gap-2">
          <Button
            variant={previewDevice === "desktop" ? "default" : "outline"}
            size="sm"
            onClick={() => setPreviewDevice("desktop")}
            className="gap-2"
          >
            <Monitor className="w-4 h-4" />
            デスクトップ
          </Button>
          <Button
            variant={previewDevice === "tablet" ? "default" : "outline"}
            size="sm"
            onClick={() => setPreviewDevice("tablet")}
            className="gap-2"
          >
            <Tablet className="w-4 h-4" />
            タブレット
          </Button>
          <Button
            variant={previewDevice === "mobile" ? "default" : "outline"}
            size="sm"
            onClick={() => setPreviewDevice("mobile")}
            className="gap-2"
          >
            <Smartphone className="w-4 h-4" />
            モバイル
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <Card>
        <CardHeader>
          <CardTitle>リアルタイムプレビュー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg p-8 min-h-[600px]">
            <div className={`${deviceSizes[previewDevice]} transition-all duration-300`}>
              <div
                className="bg-white rounded-lg shadow-lg overflow-hidden"
                style={{
                  fontFamily: shopData.customization?.font === "noto-serif" ? "'Noto Serif JP', serif" : "'Noto Sans JP', sans-serif",
                }}
              >
                {/* Header */}
                <div
                  className="p-6 border-b"
                  style={{
                    backgroundColor: colors.primary,
                    color: "white",
                  }}
                >
                  <div className="flex items-center gap-3">
                    {shopData.logo && (
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                        <img src={shopData.logo} alt="Logo" className="w-8 h-8 object-contain" />
                      </div>
                    )}
                    <h1 className="text-2xl font-bold">{shopData.shopName || "ショップ名"}</h1>
                  </div>
                </div>

                {/* Navigation */}
                <div className="bg-white border-b">
                  <div className="flex gap-4 px-6 py-3 overflow-x-auto">
                    {shopData.pages?.filter((p: any) => p.enabled).map((page: any) => (
                      <span
                        key={page.id}
                        className="text-sm font-medium cursor-pointer hover:opacity-80 whitespace-nowrap"
                        style={{ color: colors.text }}
                      >
                        {page.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hero Section */}
                <div
                  className="p-8 text-center"
                  style={{
                    backgroundColor: colors.background,
                  }}
                >
                  <h2
                    className="text-3xl font-bold mb-4"
                    style={{ color: colors.text }}
                  >
                    {shopData.shopName || "ショップ名"}
                  </h2>
                  <p
                    className="text-lg mb-6"
                    style={{ color: colors.text, opacity: 0.7 }}
                  >
                    {shopData.description || "ショップの説明文がここに表示されます"}
                  </p>
                  <button
                    className="px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{
                      backgroundColor: colors.primary,
                    }}
                  >
                    商品を見る
                  </button>
                </div>

                {/* Products Grid */}
                <div
                  className="p-8"
                  style={{
                    backgroundColor: colors.background,
                  }}
                >
                  <h3
                    className="text-2xl font-bold mb-6"
                    style={{ color: colors.text }}
                  >
                    おすすめ商品
                  </h3>
                  <div className={`grid ${previewDevice === "mobile" ? "grid-cols-1" : "grid-cols-3"} gap-6`}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">商品画像</span>
                        </div>
                        <div className="p-4">
                          <h4
                            className="font-semibold mb-2"
                            style={{ color: colors.text }}
                          >
                            商品名 {i}
                          </h4>
                          <p
                            className="text-sm mb-3"
                            style={{ color: colors.text, opacity: 0.7 }}
                          >
                            商品の説明文がここに表示されます
                          </p>
                          <div className="flex items-center justify-between">
                            <span
                              className="font-bold text-lg"
                              style={{ color: colors.primary }}
                            >
                              ¥{(i * 1000).toLocaleString()}
                            </span>
                            <button
                              className="px-4 py-2 rounded text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                              style={{
                                backgroundColor: colors.accent,
                              }}
                            >
                              カート
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features Section */}
                <div
                  className="p-8 border-t"
                  style={{
                    backgroundColor: colors.background,
                  }}
                >
                  <h3
                    className="text-2xl font-bold mb-6 text-center"
                    style={{ color: colors.text }}
                  >
                    当店の特徴
                  </h3>
                  <div className={`grid ${previewDevice === "mobile" ? "grid-cols-1" : "grid-cols-3"} gap-6`}>
                    {[
                      { title: "送料無料", desc: "全国どこでも送料無料" },
                      { title: "安心の品質", desc: "厳選された商品のみ" },
                      { title: "迅速配送", desc: "最短翌日お届け" },
                    ].map((feature, i) => (
                      <div key={i} className="text-center">
                        <div
                          className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                          style={{ backgroundColor: colors.primary, opacity: 0.1 }}
                        >
                          <div
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: colors.primary }}
                          />
                        </div>
                        <h4
                          className="font-semibold mb-2"
                          style={{ color: colors.text }}
                        >
                          {feature.title}
                        </h4>
                        <p
                          className="text-sm"
                          style={{ color: colors.text, opacity: 0.7 }}
                        >
                          {feature.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="p-6 border-t text-center text-sm"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.text,
                    opacity: 0.8,
                  }}
                >
                  <p>© 2024 {shopData.shopName || "ショップ名"}. All rights reserved.</p>
                  <div className="flex justify-center gap-4 mt-2 flex-wrap">
                    {shopData.staticPages?.filter((p: any) => p.enabled).map((page: any) => (
                      <span key={page.id} className="hover:underline cursor-pointer">
                        {page.name}
                      </span>
                    ))}
                  </div>
                  {shopData.paymentMethods?.filter((m: any) => m.enabled).length > 0 && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: colors.text, opacity: 0.2 }}>
                      <p className="text-xs">
                        お支払い方法: {shopData.paymentMethods.filter((m: any) => m.enabled).map((m: any) => m.name).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
