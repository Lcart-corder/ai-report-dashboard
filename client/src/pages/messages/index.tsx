import React from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, Zap, LayoutTemplate, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function MessagesDashboard() {
  const features = [
    {
      title: "一斉配信",
      description: "友だち全員または条件で絞り込んでメッセージを一斉送信します。",
      icon: Send,
      href: "/messages/broadcast",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "ステップ配信",
      description: "友だち追加やタグ付与をトリガーに、あらかじめ設定したシナリオを自動配信します。",
      icon: Zap,
      href: "/messages/step",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "自動応答",
      description: "ユーザーからのメッセージに含まれるキーワードに反応して自動で返信します。",
      icon: MessageSquare,
      href: "/messages/auto-reply",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "テンプレート",
      description: "よく使うメッセージやリッチメニュー、カードタイプメッセージを作成・管理します。",
      icon: LayoutTemplate,
      href: "/messages/templates",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <PageTemplate 
      title="メッセージ配信" 
      description="LINE公式アカウントのメッセージ配信機能を管理します。"
      breadcrumbs={[{ label: "メッセージ" }]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, i) => (
          <Link key={i} href={feature.href}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-gray-200">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`p-3 rounded-lg ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm mb-4">{feature.description}</p>
                <div className="flex items-center text-sm font-medium text-[#06C755]">
                  設定へ移動 <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">最近の配信履歴</h3>
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">配信名</th>
                <th className="px-4 py-3 font-medium text-gray-500">タイプ</th>
                <th className="px-4 py-3 font-medium text-gray-500">対象</th>
                <th className="px-4 py-3 font-medium text-gray-500">日時</th>
                <th className="px-4 py-3 font-medium text-gray-500">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">新春キャンペーン告知</td>
                <td className="px-4 py-3">一斉配信</td>
                <td className="px-4 py-3">全友だち (2,124人)</td>
                <td className="px-4 py-3">2025/01/15 10:00</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">配信完了</span></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">購入後サンクスメール</td>
                <td className="px-4 py-3">ステップ配信</td>
                <td className="px-4 py-3">購入者タグ</td>
                <td className="px-4 py-3">自動</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">稼働中</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageTemplate>
  );
}
