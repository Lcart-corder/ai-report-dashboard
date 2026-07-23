// 画面10: 収益履歴

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { useSimulator } from "@/contexts/SimulatorContext";
import { formatYen } from "@/lib/simulator/calc";
import { cn } from "@/lib/utils";
import { PlainHeader } from "./_ui";

export default function History() {
  const { history } = useSimulator();
  const [tab, setTab] = useState<"monthly" | "payment">("monthly");

  const total = useMemo(
    () => history.reduce((sum, r) => sum + r.amount, 0),
    [history]
  );

  const chartData = [...history]
    .reverse()
    .map((r) => ({ name: r.month.slice(5) + "月", amount: r.amount }));

  return (
    <div className="pb-6">
      <PlainHeader title="収益履歴" backHref="/simulator" />

      <div className="space-y-4 px-4 pt-4">
        {/* 合計 */}
        <div className="rounded-xl bg-gradient-to-br from-blue-700 to-blue-600 p-5 text-white">
          <div className="text-xs text-blue-100">2025年 合計受取見込み</div>
          <div className="mt-1 text-3xl font-extrabold">{formatYen(total)}</div>
          <div className="mt-4 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "rgba(255,255,255,0.7)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.1)" }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [formatYen(v), "収益"]}
                />
                <Bar dataKey="amount" fill="rgba(255,255,255,0.85)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* タブ */}
        <div className="flex rounded-lg border border-slate-300 bg-slate-100 p-0.5">
          {(
            [
              { v: "monthly", l: "月別" },
              { v: "payment", l: "入金履歴" },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setTab(o.v)}
              className={cn(
                "flex-1 rounded-md py-2 text-xs font-bold transition-colors",
                tab === o.v ? "bg-blue-600 text-white shadow-sm" : "text-slate-500"
              )}
            >
              {o.l}
            </button>
          ))}
        </div>

        <div>
          <div className="mb-2 text-sm font-bold text-slate-800">
            {tab === "monthly" ? "月別サマリー" : "入金履歴"}
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {history.map((r, i) => (
              <div
                key={r.month}
                className={cn(
                  "flex items-center justify-between px-4 py-3.5",
                  i > 0 && "border-t border-slate-100"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-700">
                    {r.month.slice(0, 4)}年{Number(r.month.slice(5))}月
                  </span>
                  {r.projected && (
                    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                      見込み
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-slate-800">
                  {formatYen(r.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
