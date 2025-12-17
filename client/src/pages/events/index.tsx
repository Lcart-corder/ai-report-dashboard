import React from "react";
import { PageTemplate } from "@/components/page-template";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, List, Users, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function EventsDashboard() {
  const features = [
    {
      title: "予約カレンダー",
      description: "カレンダー形式で予約状況を確認・管理します。",
      icon: Calendar,
      href: "/events/calendar",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "予約リスト",
      description: "予約一覧を表形式で確認し、ステータス変更やキャンセル処理を行います。",
      icon: List,
      href: "/events/list",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "参加者管理",
      description: "イベントごとの参加者リストを確認し、出欠管理を行います。",
      icon: Users,
      href: "/events/participants",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <PageTemplate 
      title="予約・イベント" 
      description="来店予約やイベント参加の受付・管理を行います。"
      breadcrumbs={[{ label: "予約・イベント" }]}
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
                  管理画面へ <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">本日の予約状況</h3>
        <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>本日の予約はありません</p>
        </div>
      </div>
    </PageTemplate>
  );
}
