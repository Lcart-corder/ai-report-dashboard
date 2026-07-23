// 画面1: ダッシュボード（サマリー）

import { Link } from "wouter";
import { Briefcase, FileText, Handshake, TrendingUp } from "lucide-react";
import { useSimulator } from "@/contexts/SimulatorContext";
import { formatPercent, formatYen } from "@/lib/simulator/calc";
import { BrandHeader, Panel } from "./_ui";

function Donut({ ratio }: { ratio: number }) {
  const pct = Math.min(100, Math.max(0, ratio * 100));
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="8" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * pct) / 100}
      />
    </svg>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Panel className="p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] text-slate-500">
        {icon}
        {label}
      </div>
      <div className="text-lg font-bold text-slate-800">{value}</div>
    </Panel>
  );
}

export default function Dashboard() {
  const { result, input } = useSimulator();
  const pct = Math.round(result.achievementRate * 100);

  return (
    <div className="pb-6">
      <BrandHeader title="AIコンシェルジュ" subtitle="営業シミュレーター" />

      {/* 見込み収入ヒーロー */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-600 px-4 pb-6 pt-2 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-100">今月の見込み収入</div>
            <div className="mt-1 text-4xl font-extrabold tracking-tight">
              {formatYen(result.totalMonthly)}
            </div>
            <div className="mt-1 text-xs text-blue-100">
              目標 {formatYen(result.goalAmount)} に対して {pct}%
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <Donut ratio={result.achievementRate} />
            <span className="absolute text-sm font-bold">{pct}%</span>
          </div>
        </div>
      </div>

      <div className="-mt-3 space-y-4 px-4">
        {/* メトリクス2x2 */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label="営業報酬（見込み）"
            value={formatYen(result.salesReward)}
          />
          <MetricCard
            icon={<Handshake className="h-3.5 w-3.5" />}
            label="紹介料（見込み）"
            value={formatYen(result.referralFee)}
          />
          <MetricCard
            icon={<FileText className="h-3.5 w-3.5" />}
            label="契約件数（見込み）"
            value={`${result.contractCount}件`}
          />
          <MetricCard
            icon={<Briefcase className="h-3.5 w-3.5" />}
            label="派生案件（見込み）"
            value={`${input.referralCount}件`}
          />
        </div>

        {/* 目標達成まで */}
        <Panel>
          <div className="text-sm font-bold text-slate-800">目標達成まであと</div>
          <div className="mt-1 text-3xl font-extrabold text-blue-600">
            {formatYen(result.remainingToGoal)}
          </div>
          {result.remainingToGoal > 0 ? (
            <div className="mt-1 text-xs text-slate-500">
              あと {result.casesNeeded10man} 件で目標達成！
            </div>
          ) : (
            <div className="mt-1 text-xs font-bold text-emerald-600">
              目標達成済みです 🎉
            </div>
          )}
          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all"
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-slate-400">
              <span>{formatPercent(result.achievementRate)}</span>
              <span>目標 {formatYen(result.goalAmount)}</span>
            </div>
          </div>
        </Panel>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/simulator/input/basic"
            className="rounded-lg bg-blue-600 py-3 text-center text-sm font-bold text-white hover:bg-blue-700"
          >
            シミュレーション
          </Link>
          <Link
            href="/simulator/result"
            className="rounded-lg border border-blue-600 bg-white py-3 text-center text-sm font-bold text-blue-600 hover:bg-blue-50"
          >
            結果を見る
          </Link>
        </div>
      </div>
    </div>
  );
}
