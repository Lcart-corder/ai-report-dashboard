import React from "react";
import { PageTemplate } from "@/components/page-template";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function AnalysisDashboard() {
  const features = [
    {
      title: "友だち分析",
      description: "友だち追加数、ブロック数、属性分布などの推移を確認します。",
      icon: Users,
      href: "/analysis/friends",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "メッセージ分析",
      description: "配信数、開封率、クリック率などのパフォーマンスを分析します。",
      icon: MessageSquare,
      href: "/analysis/messages",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "AIレポート",
      description: "AIがデータを分析し、改善提案や施策案を自動生成します。",
      icon: TrendingUp,
      href: "/ai/reports",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <PageTemplate 
      title="分析" 
      description="LINE公式アカウントの運用データを分析し、改善に役立てます。"
      breadcrumbs={[{ label: "分析" }]}
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
                  詳細を見る <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PageTemplate>
  );
}
