// 画面9: 案件管理（パイプライン）

import { useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useSimulator } from "@/contexts/SimulatorContext";
import { formatYen } from "@/lib/simulator/calc";
import { PLAN_LABEL, PLAN_PRICE } from "@/lib/simulator/constants";
import type { DealStatus, PlanKey } from "@/lib/simulator/types";
import { cn } from "@/lib/utils";
import { PlainHeader, PrimaryButton } from "./_ui";

const STATUS_META: Record<
  DealStatus,
  { label: string; badge: string; dot: string }
> = {
  negotiating: {
    label: "商談中",
    badge: "bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-500",
  },
  waiting: {
    label: "契約待ち",
    badge: "bg-amber-50 text-amber-600",
    dot: "bg-amber-500",
  },
  contracted: {
    label: "契約済み",
    badge: "bg-slate-100 text-slate-500",
    dot: "bg-slate-400",
  },
};

type Filter = "all" | DealStatus;

export default function Pipeline() {
  const { deals, addDeal, removeDeal } = useSimulator();
  const [filter, setFilter] = useState<Filter>("all");
  const [showForm, setShowForm] = useState(false);

  const counts = useMemo(
    () => ({
      all: deals.length,
      negotiating: deals.filter((d) => d.status === "negotiating").length,
      waiting: deals.filter((d) => d.status === "waiting").length,
      contracted: deals.filter((d) => d.status === "contracted").length,
    }),
    [deals]
  );

  const filtered = deals.filter((d) => filter === "all" || d.status === filter);

  const TABS: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "すべて", count: counts.all },
    { key: "negotiating", label: "商談中", count: counts.negotiating },
    { key: "waiting", label: "契約待ち", count: counts.waiting },
    { key: "contracted", label: "契約済み", count: counts.contracted },
  ];

  return (
    <div className="pb-6">
      <PlainHeader title="案件パイプライン" backHref="/simulator" />

      {/* フィルタタブ */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilter(t.key)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
              filter === t.key
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-500"
            )}
          >
            {t.label} {t.count}
          </button>
        ))}
      </div>

      <div className="space-y-3 px-4">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
            案件がありません
          </div>
        )}

        {filtered.map((d) => {
          const meta = STATUS_META[d.status];
          return (
            <div
              key={d.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
                  <span className="font-bold text-slate-800">
                    {d.companyName}
                  </span>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-bold",
                    meta.badge
                  )}
                >
                  {meta.label}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>
                  {PLAN_LABEL[d.plan]}　月額 {formatYen(d.monthlyAmount)}
                </span>
                <button
                  type="button"
                  onClick={() => removeDeal(d.id)}
                  className="text-slate-300 hover:text-rose-500"
                  aria-label="削除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {d.status === "contracted" ? "契約日" : "契約見込み"}：{d.date}
              </div>
            </div>
          );
        })}

        <PrimaryButton onClick={() => setShowForm(true)} className="w-full">
          <Plus className="h-4 w-4" />
          新規案件を追加
        </PrimaryButton>
      </div>

      {showForm && (
        <AddDealForm
          onClose={() => setShowForm(false)}
          onAdd={(deal) => {
            addDeal(deal);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function AddDealForm({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (deal: {
    companyName: string;
    plan: PlanKey;
    monthlyAmount: number;
    status: DealStatus;
    date: string;
  }) => void;
}) {
  const [companyName, setCompanyName] = useState("");
  const [plan, setPlan] = useState<PlanKey>("10man");
  const [status, setStatus] = useState<DealStatus>("negotiating");
  const [date, setDate] = useState("");

  const submit = () => {
    if (!companyName.trim()) return;
    onAdd({
      companyName: companyName.trim(),
      plan,
      monthlyAmount: PLAN_PRICE[plan],
      status,
      date: date || "未定",
    });
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">新規案件を追加</h3>
          <button type="button" onClick={onClose} aria-label="閉じる">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              企業名
            </label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="株式会社サンプル"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              プラン
            </label>
            <div className="flex gap-2">
              {(Object.keys(PLAN_LABEL) as PlanKey[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={cn(
                    "flex-1 rounded-lg border py-2 text-sm font-bold",
                    plan === p
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-slate-300 text-slate-500"
                  )}
                >
                  {PLAN_LABEL[p]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              ステータス
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DealStatus)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              {(Object.keys(STATUS_META) as DealStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              契約（見込み）日
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-bold text-slate-600"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!companyName.trim()}
            className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-40"
          >
            追加する
          </button>
        </div>
      </div>
    </div>
  );
}
