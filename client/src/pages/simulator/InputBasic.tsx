// 画面2: シミュレーション入力（基本設定）

import { Sliders } from "lucide-react";
import { useSimulator } from "@/contexts/SimulatorContext";
import { formatPercent, formatYen } from "@/lib/simulator/calc";
import {
  BASIS_LABEL,
  CONTINUATION_LABEL,
  PLAN_FOCUS_LABEL,
  RANK_LABEL,
  RANK_RATE,
} from "@/lib/simulator/constants";
import type {
  CalcBasis,
  ContinuationType,
  PlanFocus,
  Rank,
} from "@/lib/simulator/types";
import { cn } from "@/lib/utils";
import { GhostButton, Panel, PlainHeader, PrimaryButton, StepIndicator } from "./_ui";

const STEPS = ["基本設定", "契約件数入力", "案件紹介入力", "結果確認"];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex-1 text-right">{children}</div>
    </label>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-bold transition-colors",
            value === o.value
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-500"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SelectInput<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default function InputBasic() {
  const { input, updateInput, resetInput } = useSimulator();

  return (
    <div className="pb-6">
      <PlainHeader title="シミュレーション入力" backHref="/simulator" />
      <StepIndicator current={1} steps={STEPS} />

      <div className="space-y-4 px-4">
        <Panel>
          <div className="mb-1 flex items-center gap-1.5 text-sm font-bold text-slate-800">
            <Sliders className="h-4 w-4 text-blue-600" />
            基本設定
          </div>
          <div className="divide-y divide-slate-100">
            <Row label="会員ランク">
              <SelectInput<Rank>
                value={input.rank}
                onChange={(rank) => updateInput({ rank })}
                options={(Object.keys(RANK_LABEL) as Rank[]).map((r) => ({
                  value: r,
                  label: `${RANK_LABEL[r]}（報酬率${Math.round(RANK_RATE[r] * 100)}%）`,
                }))}
              />
            </Row>
            <Row label="契約プラン（主力）">
              <Segmented<PlanFocus>
                value={input.planFocus}
                onChange={(planFocus) => updateInput({ planFocus })}
                options={(Object.keys(PLAN_FOCUS_LABEL) as PlanFocus[]).map(
                  (p) => ({ value: p, label: PLAN_FOCUS_LABEL[p] })
                )}
              />
            </Row>
            <Row label="継続報酬の期間">
              <SelectInput<ContinuationType>
                value={input.continuation}
                onChange={(continuation) => updateInput({ continuation })}
                options={(
                  Object.keys(CONTINUATION_LABEL) as ContinuationType[]
                ).map((c) => ({ value: c, label: CONTINUATION_LABEL[c] }))}
              />
            </Row>
            <Row label="計算の基準">
              <SelectInput<CalcBasis>
                value={input.basis}
                onChange={(basis) => updateInput({ basis })}
                options={(Object.keys(BASIS_LABEL) as CalcBasis[]).map((b) => ({
                  value: b,
                  label: BASIS_LABEL[b],
                }))}
              />
            </Row>
          </div>
        </Panel>

        {/* 報酬率の詳細 */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="mb-2 text-xs font-bold text-blue-700">報酬率の詳細</div>
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>営業報酬率</span>
              <span className="font-bold text-slate-800">
                {formatPercent(RANK_RATE[input.rank])}
              </span>
            </div>
            <div className="flex justify-between">
              <span>紹介料率（受注金額に対して）</span>
              <span className="font-bold text-slate-800">
                {formatPercent(input.referralRate)}
              </span>
            </div>
            <div className="flex justify-between border-t border-blue-100 pt-1">
              <span>5万円プラン 1件あたり</span>
              <span className="font-bold text-slate-800">
                {formatYen(50000 * RANK_RATE[input.rank])}
              </span>
            </div>
            <div className="flex justify-between">
              <span>10万円プラン 1件あたり</span>
              <span className="font-bold text-slate-800">
                {formatYen(100000 * RANK_RATE[input.rank])}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <GhostButton onClick={resetInput}>リセット</GhostButton>
          <PrimaryButton href="/simulator/input/contracts" className="flex-1">
            次へ
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
