import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { ReactNode } from "react";

/** 受講状況のセマンティックなステータスピル(Lカートデザイン)。 */
const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  completed: { label: "修了", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  in_progress: { label: "受講中", cls: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  active: { label: "受講中", cls: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  not_started: { label: "未開始", cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
  invited: { label: "招待済", cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
  delayed: { label: "進捗遅延", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  expired: { label: "期限切れ", cls: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300" },
  suspended: { label: "停止", cls: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" },
};

export function StatusPill({ status, children }: { status: string; children?: ReactNode }) {
  const s = STATUS_STYLE[status] ?? { label: status, cls: "bg-slate-100 text-slate-600" };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", s.cls)}>{children ?? s.label}</span>;
}

/** アラートピル(進捗遅延/未開始/期限切れ等)。 */
export function AlertPill({ tone, children }: { tone: "warn" | "danger" | "muted"; children: ReactNode }) {
  const cls = tone === "danger" ? "text-rose-600 dark:text-rose-400" : tone === "warn" ? "text-amber-600 dark:text-amber-400" : "text-slate-400";
  return <span className={cn("text-xs font-semibold", cls)}>{children}</span>;
}

/** KPIカード。アイコン+数値+(任意)前週比デルタ。 */
export function KpiCard({ label, value, unit, icon: Icon, tone = "blue", delta }: {
  label: string; value: string | number; unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "blue" | "emerald" | "amber" | "rose" | "purple" | "teal";
  delta?: { value: string; up: boolean; good?: boolean };
}) {
  const toneCls: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300",
    teal: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300",
  };
  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-slate-500">{label}</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">{value}</span>
              {unit && <span className="text-xs text-slate-400">{unit}</span>}
            </div>
          </div>
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", toneCls[tone])}><Icon className="h-5 w-5" /></span>
        </div>
        {delta && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            <span className="text-slate-400">先週比</span>
            <span className={cn("flex items-center font-semibold", delta.good ? "text-emerald-600" : "text-rose-500")}>
              {delta.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{delta.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** ドーナツ(円環)進捗。SVGで軽量描画。 */
export function Donut({ value, size = 56, stroke = 7, color = "#2563eb" }: { value: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-slate-200 dark:text-slate-700" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="fill-slate-700 dark:fill-slate-200 text-[11px] font-bold">{value}%</text>
    </svg>
  );
}
