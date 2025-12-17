import React from "react";
import { PageTemplate } from "@/components/page-template";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, CreditCard, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const features = [
    {
      title: "アカウント設定",
      description: "企業情報、タイムゾーン、セキュリティ設定を管理します。",
      icon: User,
      href: "/admin/account",
      color: "bg-gray-100 text-gray-600",
    },
    {
      title: "メンバー管理",
      description: "スタッフの招待、権限設定、削除を行います。",
      icon: Users,
      href: "/admin/members",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "プラン・支払い",
      description: "利用プランの変更、請求書の確認、支払い方法の管理を行います。",
      icon: CreditCard,
      href: "/admin/billing",
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  return (
    <PageTemplate 
      title="管理設定" 
      description="アカウント全体の設定や契約情報を管理します。"
      breadcrumbs={[{ label: "管理" }]}
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
                  設定へ <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PageTemplate>
  );
}
