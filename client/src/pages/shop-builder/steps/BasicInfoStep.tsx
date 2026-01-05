import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface BasicInfoStepProps {
  shopData: any;
  setShopData: (data: any) => void;
}

export default function BasicInfoStep({ shopData, setShopData }: BasicInfoStepProps) {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement actual file upload
      const reader = new FileReader();
      reader.onload = (event) => {
        setShopData({ ...shopData, logo: event.target?.result as string });
        toast.success("ロゴをアップロードしました");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="shopName" className="text-base font-medium">
          ショップ名 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="shopName"
          placeholder="例: マイショップ"
          value={shopData.shopName}
          onChange={(e) => setShopData({ ...shopData, shopName: e.target.value })}
          className="text-base"
        />
        <p className="text-sm text-gray-500">
          お客様に表示されるショップの名前です。後から変更できます。
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-medium">
          ショップの説明
        </Label>
        <Textarea
          id="description"
          placeholder="例: 厳選された商品をお届けするオンラインショップです"
          value={shopData.description}
          onChange={(e) => setShopData({ ...shopData, description: e.target.value })}
          rows={4}
          className="text-base"
        />
        <p className="text-sm text-gray-500">
          ショップの特徴や魅力を簡潔に説明してください。
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-base font-medium">ロゴ画像</Label>
        <div className="flex items-center gap-4">
          {shopData.logo ? (
            <div className="relative w-32 h-32 rounded-lg border-2 border-gray-200 overflow-hidden">
              <img src={shopData.logo} alt="ショップロゴ" className="w-full h-full object-cover" />
              <button
                onClick={() => setShopData({ ...shopData, logo: "" })}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("logo-upload")?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {shopData.logo ? "ロゴを変更" : "ロゴをアップロード"}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              推奨サイズ: 500×500px、PNG または JPG 形式
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="primaryColor" className="text-base font-medium">
          メインカラー
        </Label>
        <div className="flex items-center gap-4">
          <input
            type="color"
            id="primaryColor"
            value={shopData.primaryColor}
            onChange={(e) => setShopData({ ...shopData, primaryColor: e.target.value })}
            className="w-16 h-16 rounded-lg border-2 border-gray-200 cursor-pointer"
          />
          <div className="flex-1">
            <Input
              value={shopData.primaryColor}
              onChange={(e) => setShopData({ ...shopData, primaryColor: e.target.value })}
              placeholder="#06C755"
              className="font-mono"
            />
            <p className="text-sm text-gray-500 mt-1">
              ボタンやリンクなどに使用されるメインカラーです。
            </p>
          </div>
        </div>
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
              ショップ名とロゴは、お客様が最初に目にする重要な要素です。ブランドイメージを表現する名前とデザインを選びましょう。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
