import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface PageStructureStepProps {
  shopData: any;
  setShopData: (data: any) => void;
}

export default function PageStructureStep({ shopData, setShopData }: PageStructureStepProps) {
  const togglePage = (pageId: string) => {
    const updatedPages = shopData.pages.map((page: any) =>
      page.id === pageId ? { ...page, enabled: !page.enabled } : page
    );
    setShopData({ ...shopData, pages: updatedPages });
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600">
        ショップに必要なページを選択してください。必須ページは自動的に含まれます。
      </div>

      <div className="space-y-3">
        {shopData.pages.map((page: any) => {
          const Icon = page.icon;

          return (
            <div
              key={page.id}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                page.enabled
                  ? "border-[#06C755] bg-[#06C755]/5"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    page.enabled ? "bg-[#06C755] text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`page-${page.id}`} className="text-base font-medium cursor-pointer">
                      {page.name}
                    </Label>
                    {page.required && (
                      <Badge variant="secondary" className="text-xs">
                        必須
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {page.id === "home" && "ショップのトップページです"}
                    {page.id === "products" && "商品の一覧を表示します"}
                    {page.id === "about" && "ショップの紹介や理念を掲載します"}
                    {page.id === "contact" && "お問い合わせフォームを設置します"}
                  </p>
                </div>
              </div>
              <Switch
                id={`page-${page.id}`}
                checked={page.enabled}
                onCheckedChange={() => !page.required && togglePage(page.id)}
                disabled={page.required}
              />
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">選択中のページ</h4>
        <div className="flex flex-wrap gap-2">
          {shopData.pages
            .filter((page: any) => page.enabled)
            .map((page: any) => (
              <Badge key={page.id} variant="secondary" className="gap-1">
                <page.icon className="w-3 h-3" />
                {page.name}
              </Badge>
            ))}
        </div>
        <p className="text-sm text-gray-600 mt-3">
          合計 {shopData.pages.filter((page: any) => page.enabled).length} ページ
        </p>
      </div>

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
            <h4 className="text-sm font-medium text-blue-900 mb-1">ヒント</h4>
            <p className="text-sm text-blue-700">
              最初はシンプルに始めて、必要に応じて後からページを追加することをおすすめします。「トップページ」と「商品一覧」があれば、すぐに販売を開始できます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
