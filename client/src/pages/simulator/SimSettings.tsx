// 設定画面: 目標金額・紹介料率など、報酬制度のパラメータを調整する

import { useSimulator } from "@/contexts/SimulatorContext";
import { formatPercent, formatYen } from "@/lib/simulator/calc";
import { RANK_LABEL, RANK_RATE } from "@/lib/simulator/constants";
import type { Rank } from "@/lib/simulator/types";
import { GhostButton, Panel, PlainHeader, SectionTitle } from "./_ui";

export default function SimSettings() {
  const { input, updateInput, resetInput } = useSimulator();

  return (
    <div className="pb-6">
      <PlainHeader title="設定" backHref="/simulator" />

      <div className="space-y-4 px-4 pt-4">
        <Panel>
          <SectionTitle>目標・報酬パラメータ</SectionTitle>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                月収目標（円）
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={input.goalAmount}
                onChange={(e) =>
                  updateInput({ goalAmount: Math.max(0, Number(e.target.value) || 0) })
                }
                step={10000}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>派生案件の紹介料率</span>
                <span className="font-bold text-blue-600">
                  {formatPercent(input.referralRate, 1)}
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={0.2}
                step={0.005}
                value={input.referralRate}
                onChange={(e) =>
                  updateInput({ referralRate: Number(e.target.value) })
                }
                className="w-full accent-blue-600"
              />
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>0%</span>
                <span>20%</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* 会費の回収ライン */}
        <Panel>
          <SectionTitle>報酬率（ランク別）</SectionTitle>
          <div className="space-y-1.5 text-sm">
            {(Object.keys(RANK_LABEL) as Rank[]).map((r) => (
              <div
                key={r}
                className="flex items-center justify-between border-b border-slate-100 pb-1.5 last:border-0"
              >
                <span className="text-slate-600">{RANK_LABEL[r]}</span>
                <span className="font-bold text-slate-800">
                  {formatPercent(RANK_RATE[r])}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-blue-50 p-3 text-xs text-slate-600">
            現在のランク：
            <span className="font-bold text-blue-600">
              {RANK_LABEL[input.rank]}
            </span>
            （1件あたり最大 {formatYen(100000 * RANK_RATE[input.rank])}）
          </div>
        </Panel>

        <div className="flex justify-center">
          <GhostButton onClick={resetInput}>初期条件に戻す</GhostButton>
        </div>
      </div>
    </div>
  );
}
