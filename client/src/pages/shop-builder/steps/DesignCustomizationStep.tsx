import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Type, Layout, Code } from "lucide-react";

interface DesignCustomizationStepProps {
  shopData: any;
  setShopData: (data: any) => void;
}

const fontOptions = [
  { value: "noto-sans", label: "Noto Sans JP（標準）" },
  { value: "noto-serif", label: "Noto Serif JP（明朝体）" },
  { value: "zen-kaku", label: "Zen角ゴシック（モダン）" },
  { value: "zen-maru", label: "Zen丸ゴシック（丸ゴシック）" },
  { value: "sawarabi", label: "さわらびゴシック（柔らか）" },
];

const layoutOptions = [
  { value: "standard", label: "標準レイアウト", description: "バランスの取れたレイアウト" },
  { value: "wide", label: "ワイドレイアウト", description: "画面幅を広く使用" },
  { value: "narrow", label: "ナローレイアウト", description: "コンパクトな表示" },
  { value: "full", label: "フルスクリーン", description: "画面全体を使用" },
];

export default function DesignCustomizationStep({ shopData, setShopData }: DesignCustomizationStepProps) {
  const handleColorChange = (key: string, value: string) => {
    setShopData({
      ...shopData,
      customization: {
        ...shopData.customization,
        colors: {
          ...shopData.customization?.colors,
          [key]: value,
        },
      },
    });
  };

  const handleFontChange = (value: string) => {
    setShopData({
      ...shopData,
      customization: {
        ...shopData.customization,
        font: value,
      },
    });
  };

  const handleLayoutChange = (value: string) => {
    setShopData({
      ...shopData,
      customization: {
        ...shopData.customization,
        layout: value,
      },
    });
  };

  const handleCustomCSSChange = (value: string) => {
    setShopData({
      ...shopData,
      customization: {
        ...shopData.customization,
        customCSS: value,
      },
    });
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
      <div className="text-sm text-gray-600">
        ショップページのデザインを細かくカスタマイズできます。カラー、フォント、レイアウト、カスタムCSSを設定してください。
      </div>

      {/* Color Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#06C755]" />
            カラーカスタマイズ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary-color">プライマリーカラー</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="primary-color"
                  type="color"
                  value={colors.primary}
                  onChange={(e) => handleColorChange("primary", e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={colors.primary}
                  onChange={(e) => handleColorChange("primary", e.target.value)}
                  className="flex-1"
                  placeholder="#06C755"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">メインボタンやリンクの色</p>
            </div>

            <div>
              <Label htmlFor="secondary-color">セカンダリーカラー</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="secondary-color"
                  type="color"
                  value={colors.secondary}
                  onChange={(e) => handleColorChange("secondary", e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={colors.secondary}
                  onChange={(e) => handleColorChange("secondary", e.target.value)}
                  className="flex-1"
                  placeholder="#4F46E5"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">サブボタンやアクセントの色</p>
            </div>

            <div>
              <Label htmlFor="accent-color">アクセントカラー</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="accent-color"
                  type="color"
                  value={colors.accent}
                  onChange={(e) => handleColorChange("accent", e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={colors.accent}
                  onChange={(e) => handleColorChange("accent", e.target.value)}
                  className="flex-1"
                  placeholder="#F59E0B"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">バッジやハイライトの色</p>
            </div>

            <div>
              <Label htmlFor="background-color">背景カラー</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="background-color"
                  type="color"
                  value={colors.background}
                  onChange={(e) => handleColorChange("background", e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={colors.background}
                  onChange={(e) => handleColorChange("background", e.target.value)}
                  className="flex-1"
                  placeholder="#FFFFFF"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">ページ全体の背景色</p>
            </div>

            <div>
              <Label htmlFor="text-color">テキストカラー</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="text-color"
                  type="color"
                  value={colors.text}
                  onChange={(e) => handleColorChange("text", e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={colors.text}
                  onChange={(e) => handleColorChange("text", e.target.value)}
                  className="flex-1"
                  placeholder="#1F2937"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">本文テキストの色</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Font Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5 text-[#06C755]" />
            フォント設定
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="font-family">フォントファミリー</Label>
            <Select
              value={shopData.customization?.font || "noto-sans"}
              onValueChange={handleFontChange}
            >
              <SelectTrigger id="font-family" className="mt-1">
                <SelectValue placeholder="フォントを選択" />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              サイト全体で使用するフォントを選択してください
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Layout Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-[#06C755]" />
            レイアウト設定
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {layoutOptions.map((layout) => {
              const isSelected = (shopData.customization?.layout || "standard") === layout.value;
              return (
                <div
                  key={layout.value}
                  onClick={() => handleLayoutChange(layout.value)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#06C755] bg-[#06C755]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{layout.label}</h4>
                    {isSelected && (
                      <div className="w-5 h-5 bg-[#06C755] rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{layout.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom CSS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-[#06C755]" />
            カスタムCSS（上級者向け）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="custom-css">カスタムCSSコード</Label>
            <Textarea
              id="custom-css"
              value={shopData.customization?.customCSS || ""}
              onChange={(e) => handleCustomCSSChange(e.target.value)}
              placeholder="/* カスタムCSSをここに記述 */&#10;.custom-button {&#10;  background-color: #06C755;&#10;  border-radius: 8px;&#10;}"
              className="mt-1 font-mono text-sm"
              rows={8}
            />
            <p className="text-xs text-gray-500 mt-1">
              CSSの知識がある方は、独自のスタイルを追加できます
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview Colors */}
      <Card>
        <CardHeader>
          <CardTitle>カラープレビュー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg border border-gray-200"
                style={{ backgroundColor: colors.primary }}
              />
              <div>
                <p className="text-xs font-medium text-gray-700">プライマリー</p>
                <p className="text-xs text-gray-500">{colors.primary}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg border border-gray-200"
                style={{ backgroundColor: colors.secondary }}
              />
              <div>
                <p className="text-xs font-medium text-gray-700">セカンダリー</p>
                <p className="text-xs text-gray-500">{colors.secondary}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg border border-gray-200"
                style={{ backgroundColor: colors.accent }}
              />
              <div>
                <p className="text-xs font-medium text-gray-700">アクセント</p>
                <p className="text-xs text-gray-500">{colors.accent}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg border border-gray-200"
                style={{ backgroundColor: colors.background }}
              />
              <div>
                <p className="text-xs font-medium text-gray-700">背景</p>
                <p className="text-xs text-gray-500">{colors.background}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg border border-gray-200"
                style={{ backgroundColor: colors.text }}
              />
              <div>
                <p className="text-xs font-medium text-gray-700">テキスト</p>
                <p className="text-xs text-gray-500">{colors.text}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
