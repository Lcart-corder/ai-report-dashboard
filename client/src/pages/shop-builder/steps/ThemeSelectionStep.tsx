import { CheckCircle } from "lucide-react";

interface ThemeSelectionStepProps {
  shopData: any;
  setShopData: (data: any) => void;
}

const themes = [
  {
    id: "modern",
    name: "モダン",
    description: "シンプルで洗練されたデザイン",
    preview: "https://placehold.co/400x300/06C755/FFFFFF?text=Modern+Theme",
    features: ["ミニマルデザイン", "大きな商品画像", "スムーズなアニメーション"],
  },
  {
    id: "classic",
    name: "クラシック",
    description: "伝統的で信頼感のあるデザイン",
    preview: "https://placehold.co/400x300/4A5568/FFFFFF?text=Classic+Theme",
    features: ["落ち着いた配色", "読みやすいレイアウト", "安心感のあるデザイン"],
  },
  {
    id: "vibrant",
    name: "ビビッド",
    description: "カラフルで活気のあるデザイン",
    preview: "https://placehold.co/400x300/F59E0B/FFFFFF?text=Vibrant+Theme",
    features: ["鮮やかな色使い", "ダイナミックなレイアウト", "目を引くデザイン"],
  },
  {
    id: "minimal",
    name: "ミニマル",
    description: "余白を活かしたシンプルなデザイン",
    preview: "https://placehold.co/400x300/E5E7EB/1F2937?text=Minimal+Theme",
    features: ["余白重視", "タイポグラフィ中心", "洗練された印象"],
  },
];

export default function ThemeSelectionStep({ shopData, setShopData }: ThemeSelectionStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600">
        ショップのデザインテーマを選択してください。後から変更することもできます。
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {themes.map((theme) => {
          const isSelected = shopData.theme === theme.id;

          return (
            <button
              key={theme.id}
              onClick={() => setShopData({ ...shopData, theme: theme.id })}
              className={`relative p-4 rounded-lg border-2 transition-all text-left hover:shadow-lg ${
                isSelected
                  ? "border-[#06C755] bg-[#06C755]/5"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-[#06C755] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Theme Preview */}
              <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-gray-100">
                <img
                  src={theme.preview}
                  alt={theme.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Theme Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-900">{theme.name}</h3>
                <p className="text-sm text-gray-600">{theme.description}</p>

                {/* Features */}
                <ul className="space-y-1 mt-3">
                  {theme.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#06C755]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
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
              テーマは後から変更できます。まずは直感で好きなデザインを選んでみましょう。各テーマは、商品の種類やターゲット層に合わせて最適化されています。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
