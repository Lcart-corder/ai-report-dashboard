"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/KpiCard";

interface DashboardData {
  isDeliveryDay: boolean;
  pendingTasks: string[];
  kpi: {
    wasteRate: string;
    wasteWarning: boolean;
    shippedPacks: number;
    totalPackA: number;
    totalPackB: number;
    complaintCount: number;
    electricityCost: number | null;
    electricityWarning: boolean;
    avgWorkMinutes: number;
    deviationCount: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <p className="text-gray-400">読み込み中...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">ダッシュボード</h1>

      {/* 今日の情報 */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold text-gray-700 mb-2">本日の情報</h2>
        <p className="text-sm">
          {data.isDeliveryDay ? (
            <span className="text-green-700 font-semibold">本日は納品日です（月水金）</span>
          ) : (
            <span className="text-gray-500">本日は納品日ではありません</span>
          )}
        </p>
      </div>

      {/* 未完了タスク */}
      {data.pendingTasks.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <h2 className="font-semibold text-yellow-800 mb-2">未完了タスク</h2>
          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
            {data.pendingTasks.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      {/* KPI */}
      <h2 className="font-semibold text-gray-700">今月のKPI</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="廃棄率"
          value={data.kpi.wasteRate}
          subtitle="目標: 5%以下"
          warning={data.kpi.wasteWarning}
        />
        <KpiCard
          title="出荷パック数"
          value={`${data.kpi.shippedPacks}パック`}
          subtitle={`A: ${data.kpi.totalPackA} / B: ${data.kpi.totalPackB}`}
        />
        <KpiCard
          title="クレーム件数"
          value={`${data.kpi.complaintCount}件`}
          warning={data.kpi.complaintCount > 0}
        />
        <KpiCard
          title="追加電気代"
          value={
            data.kpi.electricityCost !== null
              ? `${data.kpi.electricityCost.toLocaleString()}円`
              : "未入力"
          }
          subtitle="目標: 月5万円以内"
          warning={data.kpi.electricityWarning}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard
          title="平均作業時間"
          value={`${data.kpi.avgWorkMinutes}分/日`}
        />
        <KpiCard
          title="温湿度逸脱回数"
          value={`${data.kpi.deviationCount}回`}
          warning={data.kpi.deviationCount > 0}
        />
      </div>
    </div>
  );
}
