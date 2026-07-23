// 画面8: ランク比較シミュレーション

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useSimulator } from "@/contexts/SimulatorContext";
import { compareRanks, formatPercent, formatYen } from "@/lib/simulator/calc";
import { RANK_LABEL } from "@/lib/simulator/constants";
import { cn } from "@/lib/utils";
import { GhostButton, PlainHeader } from "./_ui";

export default function RankCompare() {
  const { input, result } = useSimulator();
  const rows = compareRanks(input);

  const chartData = rows.map((r) => ({
    name: RANK_LABEL[r.rank].replace("営業", "").replace("パートナー", "P"),
    total: r.totalMonthly,
    rank: r.rank,
  }));

  return (
    <div className="pb-6">
      <PlainHeader title="ランク別 収益比較" backHref="/simulator/result" />

      <div className="space-y-4 px-4 pt-3">
        <div className="text-center text-[11px] text-slate-500">
          同じ条件での比較（契約件数：5万×{input.count5man}件 / 10万×
          {input.count10man}件 / 派生案件{input.referralCount}件）
        </div>

        {/* 比較表 */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-2 py-2 text-left text-[11px] font-semibold text-slate-500">
                  ランク
                </th>
                <th className="px-2 py-2 text-right text-[11px] font-semibold text-slate-500">
                  営業報酬
                </th>
                <th className="px-2 py-2 text-right text-[11px] font-semibold text-slate-500">
                  紹介料
                </th>
                <th className="px-2 py-2 text-right text-[11px] font-semibold text-slate-500">
                  合計
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => {
                const current = r.rank === input.rank;
                return (
                  <tr
                    key={r.rank}
                    className={cn(current && "bg-blue-50")}
                  >
                    <td className="px-2 py-2.5 text-[12px]">
                      <div
                        className={cn(
                          "font-bold",
                          current ? "text-blue-700" : "text-slate-700"
                        )}
                      >
                        {RANK_LABEL[r.rank]}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatPercent(r.rewardRate)}
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-right text-[12px] text-slate-600">
                      {formatYen(r.salesReward)}
                    </td>
                    <td className="px-2 py-2.5 text-right text-[12px] text-slate-600">
                      {formatYen(r.referralFee)}
                    </td>
                    <td
                      className={cn(
                        "px-2 py-2.5 text-right text-[12px] font-extrabold",
                        current ? "text-blue-600" : "text-slate-800"
                      )}
                    >
                      {formatYen(r.totalMonthly)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 棒グラフ */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 text-xs font-bold text-slate-800">
            合計収益の比較グラフ
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 8, left: 8, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell
                      key={d.rank}
                      fill={d.rank === input.rank ? "#2563eb" : "#93c5fd"}
                    />
                  ))}
                  <LabelList
                    dataKey="total"
                    position="top"
                    formatter={(v: number) => formatYen(v)}
                    style={{ fontSize: 10, fontWeight: 700, fill: "#334155" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg bg-slate-100 p-3 text-center text-[11px] text-slate-500">
          あなたの現在ランク（{RANK_LABEL[input.rank]}）での合計は{" "}
          <span className="font-bold text-blue-600">
            {formatYen(result.totalMonthly)}
          </span>
        </div>

        <div className="flex justify-center">
          <GhostButton href="/simulator/result">戻る</GhostButton>
        </div>
      </div>
    </div>
  );
}
