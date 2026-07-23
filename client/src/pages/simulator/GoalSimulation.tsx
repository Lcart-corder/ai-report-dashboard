// 画面7: 目標達成シミュレーション

import { useState } from "react";
import { Lightbulb, Plus } from "lucide-react";
import { useSimulator } from "@/contexts/SimulatorContext";
import { formatYen } from "@/lib/simulator/calc";
import { cn } from "@/lib/utils";
import { GhostButton, Panel, PlainHeader } from "./_ui";

export default function GoalSimulation() {
  const { input, result, updateInput } = useSimulator();
  const [mode, setMode] = useState<"count" | "sales">("count");
  const achieved = result.remainingToGoal <= 0;

  const options = [
    {
      key: "5man" as const,
      label: "5万円プランをあと",
      cases: result.casesNeeded5man,
      apply: () =>
        updateInput({ count5man: input.count5man + result.casesNeeded5man }),
    },
    {
      key: "10man" as const,
      label: "10万円プランをあと",
      cases: result.casesNeeded10man,
      apply: () =>
        updateInput({ count10man: input.count10man + result.casesNeeded10man }),
    },
    {
      key: "referral" as const,
      label: `派生案件（${formatYen(input.referralAvgAmount)}平均）をあと`,
      cases: result.referralsNeeded,
      apply: () =>
        updateInput({
          referralCount: input.referralCount + result.referralsNeeded,
        }),
    },
  ];

  return (
    <div className="pb-6">
      <PlainHeader title="目標達成シミュレーション" backHref="/simulator/result" />

      <div className="space-y-4 px-4 pt-2">
        <div className="text-center text-sm text-slate-500">
          目標金額：
          <span className="font-bold text-slate-800">
            {formatYen(result.goalAmount)}
          </span>{" "}
          / 月
        </div>

        {/* トグル */}
        <div className="flex rounded-lg border border-slate-300 bg-slate-100 p-0.5">
          {(
            [
              { v: "count", l: "契約件数で見る" },
              { v: "sales", l: "売上で見る" },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setMode(o.v)}
              className={cn(
                "flex-1 rounded-md py-2 text-xs font-bold transition-colors",
                mode === o.v ? "bg-blue-600 text-white shadow-sm" : "text-slate-500"
              )}
            >
              {o.l}
            </button>
          ))}
        </div>

        <Panel>
          <div className="mb-3 text-sm font-bold text-slate-800">
            現在の条件で目標達成するには
          </div>

          {achieved ? (
            <div className="rounded-lg bg-emerald-50 p-4 text-center text-sm font-bold text-emerald-600">
              すでに目標を達成しています 🎉
            </div>
          ) : (
            <div className="space-y-3">
              {options.map((o, i) => (
                <div key={o.key}>
                  {i > 0 && (
                    <div className="mb-3 text-center text-[11px] text-slate-400">
                      または
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-slate-600">{o.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-blue-50 px-2.5 py-1 text-sm font-extrabold text-blue-600">
                        {Number.isFinite(o.cases) ? `+${o.cases}件` : "—"}
                      </span>
                      <button
                        type="button"
                        onClick={o.apply}
                        disabled={!Number.isFinite(o.cases)}
                        className="flex items-center gap-0.5 rounded-md bg-blue-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-blue-700 disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" />
                        追加
                      </button>
                    </div>
                  </div>
                  {mode === "sales" && Number.isFinite(o.cases) && (
                    <div className="mt-1 text-right text-[11px] text-slate-400">
                      売上換算 {formatYen(
                        o.key === "5man"
                          ? o.cases * 50000
                          : o.key === "10man"
                          ? o.cases * 100000
                          : o.cases * input.referralAvgAmount
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* アクションのヒント */}
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-700">
            <Lightbulb className="h-4 w-4" />
            アクションのヒント
          </div>
          <ul className="space-y-1 text-xs text-slate-600">
            <li>・10万円プランの提案数を増やしましょう</li>
            <li>・既存顧客からの紹介で派生案件を狙いましょう</li>
            <li>・高単価案件（開発・構築）の提案を強化しましょう</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <GhostButton href="/simulator/result">戻る</GhostButton>
        </div>
      </div>
    </div>
  );
}
