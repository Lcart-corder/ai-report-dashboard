// 画面6: 詳細内訳

import { useSimulator } from "@/contexts/SimulatorContext";
import { formatPercent, formatYen } from "@/lib/simulator/calc";
import { GhostButton, PlainHeader, SectionTitle } from "./_ui";

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-2 py-2 text-left text-[11px] font-semibold text-slate-500">
      {children}
    </th>
  );
}
function Td({
  children,
  bold,
}: {
  children: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <td
      className={`px-2 py-2 text-[12px] ${
        bold ? "font-bold text-slate-800" : "text-slate-600"
      }`}
    >
      {children}
    </td>
  );
}

export default function Breakdown() {
  const { input, result } = useSimulator();
  const rate = result.rewardRate;

  return (
    <div className="pb-6">
      <PlainHeader title="詳細内訳" backHref="/simulator/result" />

      <div className="space-y-6 px-4 pt-4">
        {/* 営業報酬の内訳 */}
        <section>
          <SectionTitle>営業報酬の内訳</SectionTitle>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <Th>プラン</Th>
                  <Th>件数</Th>
                  <Th>月額料金</Th>
                  <Th>報酬率</Th>
                  <Th>あなたの報酬</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <Td>5万円プラン</Td>
                  <Td>{input.count5man}件</Td>
                  <Td>{formatYen(50000)}</Td>
                  <Td>{formatPercent(rate)}</Td>
                  <Td bold>{formatYen(result.reward5man)}</Td>
                </tr>
                <tr>
                  <Td>10万円プラン</Td>
                  <Td>{input.count10man}件</Td>
                  <Td>{formatYen(100000)}</Td>
                  <Td>{formatPercent(rate)}</Td>
                  <Td bold>{formatYen(result.reward10man)}</Td>
                </tr>
                <tr className="bg-slate-50">
                  <Td bold>小計</Td>
                  <Td bold>{result.contractCount}件</Td>
                  <Td>—</Td>
                  <Td>—</Td>
                  <Td bold>{formatYen(result.salesReward)}</Td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 紹介料の内訳 */}
        <section>
          <SectionTitle>紹介料の内訳</SectionTitle>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <Th>案件</Th>
                  <Th>件数</Th>
                  <Th>平均受注額</Th>
                  <Th>紹介料率</Th>
                  <Th>あなたの報酬</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <Td>派生案件</Td>
                  <Td>{input.referralCount}件</Td>
                  <Td>{formatYen(input.referralAvgAmount)}</Td>
                  <Td>{formatPercent(input.referralRate)}</Td>
                  <Td bold>{formatYen(result.referralFee)}</Td>
                </tr>
                <tr className="bg-slate-50">
                  <Td bold>小計</Td>
                  <Td bold>{input.referralCount}件</Td>
                  <Td>—</Td>
                  <Td>—</Td>
                  <Td bold>{formatYen(result.referralFee)}</Td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 合計 */}
        <div className="flex items-center justify-between rounded-xl bg-blue-600 px-5 py-4 text-white">
          <span className="text-base font-bold">合計</span>
          <span className="text-2xl font-extrabold">
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
