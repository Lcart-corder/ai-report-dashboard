import React from "react";
import { PageTemplate } from "@/components/page-template";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, History, Settings, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function AIDashboard() {
  const features = [
    {
      title: "AIレポート生成",
      description: "現在のデータを分析し、改善提案を含むレポートを作成します。",
      icon: Sparkles,
      href: "/ai/reports",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "生成履歴",
      description: "過去に生成したレポートやコンテンツの履歴を確認します。",
      icon: History,
      href: "/ai/history",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "モデル設定",
      description: "使用するAIモデルやプロンプトのカスタマイズを行います。",
      icon: Settings,
      href: "/ai/settings",
      color: "bg-gray-100 text-gray-600",
    },
  ];

  return (
    <PageTemplate 
      title="AI機能" 
      description="AIを活用して運用を効率化・高度化します。"
      breadcrumbs={[{ label: "AI" }]}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <Link key={i} href={feature.href}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-gray-200 h-full">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`p-3 rounded-lg ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm mb-4">{feature.description}</p>
                <div className="flex items-center text-sm font-medium text-[#06C755]">
                  利用する <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PageTemplate>
  );
}
