import React from "react";

/* ---------- Card ---------- */
export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl bg-white border border-slate-200/80 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
  className = "",
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between px-5 pt-5 ${className}`}>
      <h3 className="font-bold text-slate-800">{title}</h3>
      {action}
    </div>
  );
}

/* ---------- Status / Priority badges ---------- */
const STATUS_STYLE: Record<string, string> = {
  未着手: "bg-slate-100 text-slate-600",
  対応中: "bg-blue-50 text-blue-700",
  進行中: "bg-blue-50 text-blue-700",
  計画中: "bg-slate-100 text-slate-600",
  確認待ち: "bg-amber-50 text-amber-700",
  承認待ち: "bg-amber-50 text-amber-700",
  保留: "bg-slate-100 text-slate-500",
  完了: "bg-green-50 text-green-700",
  中止: "bg-slate-100 text-slate-400 line-through",
  順調: "bg-green-50 text-green-700",
  やや遅延: "bg-amber-50 text-amber-700",
  遅延: "bg-red-50 text-red-700",
  予定: "bg-slate-100 text-slate-600",
  開催中: "bg-amber-50 text-amber-700",
  定例: "bg-blue-50 text-blue-700",
  打ち合わせ: "bg-violet-50 text-violet-700",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLE[status] ?? "bg-slate-100 text-slate-600";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${style}`}
    >
      {status}
    </span>
  );
}

const PRIORITY_STYLE: Record<string, string> = {
  最高: "bg-violet-100 text-violet-700",
  高: "bg-red-100 text-red-600",
  中: "bg-amber-100 text-amber-700",
  低: "bg-green-100 text-green-700",
};

export function PriorityBadge({ level }: { level: string }) {
  const style = PRIORITY_STYLE[level] ?? "bg-slate-100 text-slate-600";
  return (
    <span
      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-2 text-xs font-bold ${style}`}
    >
      {level}
    </span>
  );
}

export function Tag({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 ${className}`}
    >
      {children}
    </span>
  );
}

/* ---------- Progress bar ---------- */
export function ProgressBar({
  value,
  className = "",
  color,
}: {
  value: number;
  className?: string;
  color?: string;
}) {
  const barColor =
    color ?? (value >= 100 ? "bg-green-500" : "bg-blue-500");
  return (
    <div className={`h-2 w-full rounded-full bg-slate-100 ${className}`}>
      <div
        className={`h-2 rounded-full ${barColor}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ---------- Donut / gauge ---------- */
export function Donut({
  value,
  size = 150,
  stroke = 16,
  color = "#2563eb",
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, value) / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

/* ---------- Avatar ---------- */
const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-cyan-600",
  "bg-indigo-500",
];

export function Avatar({
  name,
  size = 28,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initial = name.trim().charAt(0);
  const idx =
    name.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold text-white ${AVATAR_COLORS[idx]} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      title={name}
    >
      {initial}
    </span>
  );
}

/* ---------- Select (visual only) ---------- */
export function Select({
  children,
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

/* ---------- Buttons ---------- */
export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------- Page title ---------- */
export function PageTitle({
  title,
  subtitle,
  badge,
  action,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          {badge && (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-600">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
