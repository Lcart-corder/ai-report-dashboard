// 画面3: シミュレーション入力（契約件数）

import { FileText } from "lucide-react";
import { useSimulator } from "@/contexts/SimulatorContext";
import { formatYen, perCaseReward } from "@/lib/simulator/calc";
import { PLAN_FOCUS_LABEL, RANK_RATE } from "@/lib/simulator/constants";
import {
  GhostButton,
  Panel,
  PlainHeader,
  PrimaryButton,
  StepIndicator,
  Stepper,
} from "./_ui";

const STEPS = ["基本設定", "契約件数入力", "案件紹介入力", "結果確認"];

export default function InputContracts() {
  const { input, updateInput } = useSimulator();
  const rate = RANK_RATE[input.rank];
  const show5 = input.planFocus !== "10man";
  const show10 = input.planFocus !== "5man";

  return (
    <div className="pb-6">
      <PlainHeader title="シミュレーション入力" backHref="/simulator/input/basic" />
      <StepIndicator current={2} steps={STEPS} />

      <div className="space-y-4 px-4">
        <Panel>
          <div className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-800">
            <FileText className="h-4 w-4 text-blue-600" />
            月間契約件数（{PLAN_FOCUS_LABEL[input.planFocus]}）
          </div>

          {show5 && (
            <div className="mb-4">
              <div className="mb-1.5 text-xs font-semibold text-slate-500">
                5万円プラン
              </div>
              <Stepper
                value={input.count5man}
                onChange={(count5man) => updateInput({ count5man })}
                suffix="件"
              />
            </div>
          )}

          {show10 && (
            <div>
              <div className="mb-1.5 text-xs font-semibold text-slate-500">
                10万円プラン
              </div>
              <Stepper
                value={input.count10man}
                onChange={(count10man) => updateInput({ count10man })}
                suffix="件"
              />
            </div>
          )}
        </Panel>

        {/* 1件あたりの営業報酬 */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="mb-2 text-xs font-bold text-blue-700">
            1件あたりの営業報酬（あなたの報酬率：{Math.round(rate * 100)}%）
          </div>
          <div className="space-y-1 text-sm text-slate-600">
            {show5 && (
              <div className="flex justify-between">
                <span>5万円プラン</span>
                <span className="font-bold text-slate-800">
                  {formatYen(perCaseReward("5man", input.rank))} / 件
                </span>
              </div>
            )}
            {show10 && (
              <div className="flex justify-between">
                <span>10万円プラン</span>
                <span className="font-bold text-slate-800">
                  {formatYen(perCaseReward("10man", input.rank))} / 件
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-blue-100 pt-1.5 text-slate-700">
              <span className="font-semibold">この条件での営業報酬（見込み）</span>
              <span className="font-extrabold text-blue-600">
                {formatYen(
                  perCaseReward("5man", input.rank) * (show5 ? input.count5man : 0) +
                    perCaseReward("10man", input.rank) *
                      (show10 ? input.count10man : 0)
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <GhostButton href="/simulator/input/basic">戻る</GhostButton>
          <PrimaryButton href="/simulator/input/referral" className="flex-1">
            次へ
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
