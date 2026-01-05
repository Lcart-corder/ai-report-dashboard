import { Badge } from "@/components/ui/badge";
import { CheckCircle, Store, Palette, Layout, FileText, ExternalLink } from "lucide-react";

interface PreviewStepProps {
  shopData: any;
  setShopData: (data: any) => void;
}

export default function PreviewStep({ shopData }: PreviewStepProps) {
  const enabledPages = shopData.pages.filter((page: any) => page.enabled);
  const enabledStaticPages = shopData.staticPages.filter((page: any) => page.enabled);

  const themeNames: Record<string, string> = {
    modern: "モダン",
    classic: "クラシック",
    vibrant: "ビビッド",
    minimal: "ミニマル",
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600">
        ショップの設定内容を確認してください。問題がなければ「ショップを公開」ボタンをクリックしてください。
      </div>

      {/* Shop Preview Card */}
      <div className="bg-gradient-to-br from-[#06C755]/10 to-[#06C755]/5 rounded-lg p-6 border-2 border-[#06C755]/20">
        <div className="flex items-start gap-4">
          {shopData.logo ? (
            <img
              src={shopData.logo}
              alt={shopData.shopName}
              className="w-20 h-20 rounded-lg object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center">
              <Store className="w-10 h-10 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{shopData.shopName || "ショップ名未設定"}</h2>
            {shopData.description && (
              <p className="text-gray-700 mb-3">{shopData.description}</p>
            )}
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: shopData.primaryColor }}
              />
              <span className="text-sm text-gray-600">メインカラー: {shopData.primaryColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#06C755]/10 flex items-center justify-center">
              <Store className="w-4 h-4 text-[#06C755]" />
            </div>
            <h3 className="font-semibold text-gray-900">基本情報</h3>
            <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
          </div>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">ショップ名</dt>
              <dd className="font-medium text-gray-900">{shopData.shopName}</dd>
            </div>
            {shopData.description && (
              <div>
                <dt className="text-gray-500">説明</dt>
                <dd className="font-medium text-gray-900">{shopData.description}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-500">ロゴ</dt>
              <dd className="font-medium text-gray-900">
                {shopData.logo ? "設定済み" : "未設定"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Theme */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#06C755]/10 flex items-center justify-center">
              <Palette className="w-4 h-4 text-[#06C755]" />
            </div>
            <h3 className="font-semibold text-gray-900">デザイン</h3>
            <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
          </div>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">テーマ</dt>
              <dd className="font-medium text-gray-900">{themeNames[shopData.theme] || shopData.theme}</dd>
            </div>
            <div>
              <dt className="text-gray-500">メインカラー</dt>
              <dd className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: shopData.primaryColor }}
                />
                <span className="font-medium text-gray-900 font-mono text-xs">
                  {shopData.primaryColor}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Pages */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#06C755]/10 flex items-center justify-center">
              <Layout className="w-4 h-4 text-[#06C755]" />
            </div>
            <h3 className="font-semibold text-gray-900">ページ構成</h3>
            <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
          </div>
          <div className="space-y-2">
            {enabledPages.map((page: any) => {
              const Icon = page.icon;
              return (
                <div key={page.id} className="flex items-center gap-2 text-sm">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{page.name}</span>
                  {page.required && (
                    <Badge variant="secondary" className="text-xs ml-auto">
                      必須
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
            合計 {enabledPages.length} ページ
          </div>
        </div>

        {/* Static Pages */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#06C755]/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#06C755]" />
            </div>
            <h3 className="font-semibold text-gray-900">固定ページ</h3>
            {enabledStaticPages.length > 0 && (
              <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
            )}
          </div>
          {enabledStaticPages.length > 0 ? (
            <>
              <div className="space-y-2">
                {enabledStaticPages.map((page: any) => {
                  const Icon = page.icon;
                  return (
                    <div key={page.id} className="flex items-center gap-2 text-sm">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{page.name}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                合計 {enabledStaticPages.length} ページ
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">固定ページは選択されていません</p>
          )}
        </div>
      </div>

      {/* Preview Notice */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <ExternalLink className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">ショップ公開について</h3>
            <p className="text-sm text-gray-600 mb-3">
              「ショップを公開」ボタンをクリックすると、設定した内容でショップが作成されます。公開後も、いつでも設定を変更したり、ページを追加・編集したりできます。
            </p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#06C755]" />
                商品はショップ管理画面から追加できます
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#06C755]" />
                デザインやページ構成は後から変更可能です
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#06C755]" />
                固定ページの内容も編集できます
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-green-900 mb-1">準備完了</h4>
            <p className="text-sm text-green-700">
              すべての設定が完了しました。「ショップを公開」ボタンをクリックして、あなたのショップを世界に公開しましょう！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
