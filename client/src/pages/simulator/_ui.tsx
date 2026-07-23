// シミュレーター画面で共通利用する小さなUI部品

import type { ReactNode } from "react";
import { Link } from "wouter";
import { Bell, ChevronLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** 白ヘッダー（戻るボタン付き）: 入力・詳細系の画面 */
export function PlainHeader({
  title,
  backHref,
}: {
  title: string;
  backHref?: string;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
      {backHref ? (
        <Link
          href={backHref}
          className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
          aria-label="戻る"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      ) : (
        <span className="w-7" />
      )}
      <h1 className="flex-1 text-center text-base font-bold text-slate-800">
        {title}
      </h1>
      <Search className="h-5 w-5 text-slate-400" />
    </header>
  );
}

/** 濃紺ヘッダー: ダッシュボード・結果サマリー画面 */
export function BrandHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="flex items-center gap-3 bg-gradient-to-br from-blue-700 to-blue-600 px-4 py-3 text-white">
      <div className="flex flex-col gap-0.5 rounded-md p-1">
        <span className="block h-0.5 w-5 bg-white" />
        <span className="block h-0.5 w-5 bg-white" />
        <span className="block h-0.5 w-5 bg-white" />
      </div>
      <div className="flex-1 text-center leading-tight">
        <div className="text-base font-bold">{title}</div>
        {subtitle ? (
          <div className="text-[11px] text-blue-100">{subtitle}</div>
        ) : null}
      </div>
      <Bell className="h-5 w-5" />
    </header>
  );
}

/** ステップインジケータ（1 → 2 → 3 → 4） */
export function StepIndicator({
  current,
  steps,
}: {
  current: number;
  steps: string[];
}) {
  return (
    <div className="flex items-start justify-between px-2 py-4">
      {steps.map((label, i) => {
        const step = i + 1;
        const active = step === current;
        const done = step < current;
        return (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-center">
              <span
                className={cn(
                  "h-[2px] flex-1",
                  i === 0 ? "opacity-0" : done || active ? "bg-blue-600" : "bg-slate-200"
                )}
              />
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  active
                    ? "bg-blue-600 text-white"
                    : done
                    ? "bg-blue-100 text-blue-600"
                    : "bg-slate-200 text-slate-500"
                )}
              >
                {step}
              </span>
              <span
                className={cn(
                  "h-[2px] flex-1",
                  i === steps.length - 1
                    ? "opacity-0"
                    : done
                    ? "bg-blue-600"
                    : "bg-slate-200"
                )}
              />
            </div>
            <span
              className={cn(
                "text-[10px]",
                active ? "font-bold text-blue-600" : "text-slate-400"
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** セクション見出し（アイコン + タイトル） */
export function SectionTitle({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-800">
      {icon}
      {children}
    </h2>
  );
}

/** カード枠 */
export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

/** プライマリボタン */
export function PrimaryButton({
  children,
  href,
  onClick,
  type = "button",
  className,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  const cls = cn(
    "inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700",
    className
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

/** セカンダリ（枠線）ボタン */
export function GhostButton({
  children,
  href,
  onClick,
  className,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const cls = cn(
    "inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50",
    className
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

/** ＋/－ ステッパー入力 */
export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  suffix?: string;
}) {
  const set = (v: number) => onChange(Math.max(min, v));
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => set(value - step)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-lg font-bold text-slate-600 hover:bg-slate-50"
        aria-label="減らす"
      >
        −
      </button>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2">
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => set(Number(e.target.value) || 0)}
          className="w-full bg-transparent text-center text-lg font-bold text-slate-800 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      <button
        type="button"
        onClick={() => set(value + step)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-lg font-bold text-slate-600 hover:bg-slate-50"
        aria-label="増やす"
      >
        +
      </button>
      {suffix ? (
        <span className="w-6 text-sm text-slate-500">{suffix}</span>
      ) : null}
    </div>
  );
}
