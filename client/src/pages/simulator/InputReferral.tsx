// 画面4: シミュレーション入力（案件紹介）

import { Handshake } from "lucide-react";
import { useSimulator } from "@/contexts/SimulatorContext";
import { formatPercent, formatYen, perReferralFee } from "@/lib/simulator/calc";
import {
  GhostButton,
  Panel,
  PlainHeader,
  PrimaryButton,
  StepIndicator,
  Stepper,
} from "./_ui";

const STEPS = ["基本設定", "契約件数入力", "案件紹介入力", "結果確認"];

const AMOUNT_STEP = 100000;

export default function InputReferral() {
  const { input, updateInput } = useSimulator();
  const perFee = perReferralFee(input.referralAvgAmount, input.referralRate);
  const total = perFee * input.referralCount;

  return (
    <div className="pb-6">
      <PlainHeader
        title="シミュレーション入力"
        backHref="/simulator/input/contracts"
      />
      <StepIndicator current={3} steps={STEPS} />

      <div className="space-y-4 px-4">
        <Panel>
          <div className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-800">
            <Handshake className="h-4 w-4 text-blue-600" />
            派生案件（紹介案件）見込み
          </div>

          <div className="mb-4">
            <div className="mb-1.5 text-xs font-semibold text-slate-500">
              見込み件数
            </div>
            <Stepper
              value={input.referralCount}
              onChange={(referralCount) => updateInput({ referralCount })}
              suffix="件"
            />
          </div>

          <div>
            <div className="mb-1.5 text-xs font-semibold text-slate-500">
              平均受注金額
            </div>
            <Stepper
              value={input.referralAvgAmount}
              onChange={(referralAvgAmount) => updateInput({ referralAvgAmount })}
              step={AMOUNT_STEP}
              suffix="円"
            />
          </div>
        </Panel>

        {/* 紹介料の計算 */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="mb-2 text-xs font-bold text-emerald-700">
            紹介料の計算
          </div>
          <div className="space-y-1 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>紹介料率</span>
              <span className="font-bold text-slate-800">
                受注金額の {formatPercent(input.referralRate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>1件あたり紹介料</span>
              <span className="font-bold text-slate-800">{formatYen(perFee)}</span>
            </div>
          </div>
          <div className="mt-2 border-t border-emerald-100 pt-2 text-xs text-slate-500">
            この条件での紹介料（見込み）
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {formatYen(total)}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <GhostButton href="/simulator/input/contracts">戻る</GhostButton>
          <PrimaryButton href="/simulator/result" className="flex-1">
            結果を見る
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
