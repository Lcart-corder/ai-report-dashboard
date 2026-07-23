// 画面5: シミュレーション結果（サマリー）

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { FileDown, Save } from "lucide-react";
import { useState } from "react";
import { useSimulator } from "@/contexts/SimulatorContext";
import { formatPercent, formatYen } from "@/lib/simulator/calc";
import { BrandHeader, GhostButton, Panel, PrimaryButton } from "./_ui";

const COLORS = ["#60a5fa", "#2563eb", "#34d399"];

export default function Result() {
  const { result } = useSimulator();
  const [saved, setSaved] = useState(false);

  const segments = [
    { name: "営業報酬（5万円プラン）", value: result.reward5man },
    { name: "営業報酬（10万円プラン）", value: result.reward10man },
    { name: "紹介料（派生案件）", value: result.referralFee },
  ];
  const total = result.totalMonthly || 1;

  return (
    <div className="pb-6">
      <BrandHeader title="シミュレーション結果" subtitle="2025年5月 シミュレーション" />

      <div className="space-y-4 px-4 pt-4">
        <Panel className="text-center">
          <div className="text-xs text-slate-500">月間の見込み収益（合計）</div>
          <div className="mt-1 text-4xl font-extrabold text-blue-600">
            {formatYen(result.totalMonthly)}
          </div>

          <div className="mx-auto mt-3 h-40 w-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segments}
                  dataKey="value"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                >
                  {segments.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-2 text-left">
            {segments.map((s, i) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: COLORS[i] }}
                />
                <span className="flex-1 text-slate-600">{s.name}</span>
                <span className="font-bold text-slate-800">
                  {formatYen(s.value)}
                </span>
                <span className="w-10 text-right text-slate-400">
                  {Math.round((s.value / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </Panel>

        {/* 目標達成率 */}
        <Panel>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">目標達成率</div>
              <div className="text-3xl font-extrabold text-blue-600">
                {formatPercent(result.achievementRate)}
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              目標金額
              <div className="text-base font-bold text-slate-800">
                {formatYen(result.goalAmount)}
              </div>
            </div>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${Math.min(100, result.achievementRate * 100)}%` }}
            />
          </div>
          {result.remainingToGoal > 0 ? (
            <div className="mt-2 text-xs text-slate-500">
              あと{" "}
              <span className="font-bold text-blue-600">
                {formatYen(result.remainingToGoal)}
              </span>{" "}
              で目標達成！
            </div>
          ) : (
            <div className="mt-2 text-xs font-bold text-emerald-600">
              目標達成済みです 🎉
            </div>
          )}
        </Panel>

        <div className="grid grid-cols-2 gap-3">
          <GhostButton href="/simulator/breakdown">詳細内訳</GhostButton>
          <GhostButton href="/simulator/goal">目標シミュ</GhostButton>
          <GhostButton href="/simulator/compare">ランク比較</GhostButton>
          <PrimaryButton onClick={() => setSaved(true)}>
            <Save className="h-4 w-4" />
            {saved ? "保存しました" : "条件を保存"}
          </PrimaryButton>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          <FileDown className="h-4 w-4" />
          PDFで出力
        </button>
      </div>
    </div>
  );
}
