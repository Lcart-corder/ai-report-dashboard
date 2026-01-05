import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface StaticPagesStepProps {
  shopData: any;
  setShopData: (data: any) => void;
}

const pageTemplates: Record<string, string> = {
  terms: `# 利用規約

## 第1条（適用）
本規約は、当ショップが提供するサービスの利用条件を定めるものです。

## 第2条（利用登録）
利用登録は、登録希望者が当ショップの定める方法によって利用登録の申請を行い、当ショップがこれを承認することによって完了するものとします。

## 第3条（禁止事項）
ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
- 法令または公序良俗に違反する行為
- 犯罪行為に関連する行為
- 当ショップのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為

## 第4条（免責事項）
当ショップは、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。`,

  privacy: `# プライバシーポリシー

## 個人情報の収集
当ショップでは、お客様から以下の個人情報を収集する場合があります。
- 氏名
- メールアドレス
- 住所
- 電話番号
- 購入履歴

## 個人情報の利用目的
収集した個人情報は、以下の目的で利用いたします。
- 商品の発送
- お問い合わせへの対応
- サービスの改善

## 個人情報の第三者提供
当ショップは、お客様の同意を得ずに、個人情報を第三者に提供することはありません。ただし、法令に基づく場合を除きます。

## お問い合わせ
個人情報の取り扱いに関するお問い合わせは、当ショップまでご連絡ください。`,

  law: `# 特定商取引法に基づく表記

## 販売業者
[ショップ名を入力してください]

## 運営責任者
[責任者名を入力してください]

## 所在地
[住所を入力してください]

## 電話番号
[電話番号を入力してください]

## メールアドレス
[メールアドレスを入力してください]

## 販売価格
各商品ページに記載

## 商品代金以外の必要料金
送料、消費税

## 支払方法
クレジットカード、銀行振込、代金引換

## 支払時期
クレジットカード：各カード会社の引き落とし日
銀行振込：注文後7日以内
代金引換：商品配送時

## 商品の引渡時期
ご注文確認後、3〜7営業日以内に発送

## 返品・交換について
商品到着後7日以内にご連絡いただいた場合のみ、返品・交換を承ります。`,
};

export default function StaticPagesStep({ shopData, setShopData }: StaticPagesStepProps) {
  const [expandedPage, setExpandedPage] = useState<string | null>(null);

  const togglePage = (pageId: string) => {
    const updatedPages = shopData.staticPages.map((page: any) =>
      page.id === pageId ? { ...page, enabled: !page.enabled } : page
    );
    setShopData({ ...shopData, staticPages: updatedPages });
  };

  const updatePageContent = (pageId: string, content: string) => {
    const updatedPages = shopData.staticPages.map((page: any) =>
      page.id === pageId ? { ...page, content } : page
    );
    setShopData({ ...shopData, staticPages: updatedPages });
  };

  const loadTemplate = (pageId: string) => {
    const template = pageTemplates[pageId];
    if (template) {
      updatePageContent(pageId, template);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600">
        法的に必要な固定ページを作成します。テンプレートを使用して簡単に作成できます。
      </div>

      <div className="space-y-3">
        {shopData.staticPages.map((page: any) => {
          const Icon = page.icon;
          const isExpanded = expandedPage === page.id;

          return (
            <div
              key={page.id}
              className={`rounded-lg border-2 transition-all ${
                page.enabled
                  ? "border-[#06C755] bg-[#06C755]/5"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      page.enabled ? "bg-[#06C755] text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`static-page-${page.id}`} className="text-base font-medium cursor-pointer">
                      {page.name}
                    </Label>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {page.id === "terms" && "サービス利用に関する規約"}
                      {page.id === "privacy" && "個人情報の取り扱いについて"}
                      {page.id === "law" && "特定商取引法に基づく表記"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id={`static-page-${page.id}`}
                    checked={page.enabled}
                    onCheckedChange={() => togglePage(page.id)}
                  />
                  {page.enabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedPage(isExpanded ? null : page.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Content Editor */}
              {page.enabled && isExpanded && (
                <div className="border-t border-gray-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">ページ内容</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadTemplate(page.id)}
                    >
                      テンプレートを読み込む
                    </Button>
                  </div>
                  <Textarea
                    value={page.content || ""}
                    onChange={(e) => updatePageContent(page.id, e.target.value)}
                    placeholder="ページの内容を入力するか、テンプレートを読み込んでください"
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Markdown形式で記述できます。テンプレートは参考例です。実際の内容はご自身の状況に合わせて編集してください。
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

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
            <h4 className="text-sm font-medium text-yellow-900 mb-1">重要</h4>
            <p className="text-sm text-yellow-700">
              特に「特定商取引法に基づく表記」は、オンライン販売を行う際に法律で義務付けられています。テンプレートの内容を必ずご自身の情報に書き換えてください。
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
              これらのページは後から編集できます。まずはテンプレートを使って基本的な内容を設定し、ショップ公開後に詳細を調整することもできます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
