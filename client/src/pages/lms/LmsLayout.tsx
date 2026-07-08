import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { GraduationCap, LayoutDashboard, Building2, BookOpen, Handshake, ClipboardCheck, ScrollText } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { href: "/lms", label: "ダッシュボード", icon: LayoutDashboard, exact: true },
  { href: "/lms/companies", label: "企業・受講者", icon: Building2 },
  { href: "/lms/courses", label: "コース・教材", icon: BookOpen },
  { href: "/lms/partners", label: "協業先・成果報酬", icon: Handshake },
  { href: "/lms/checklist", label: "申請準備チェック", icon: ClipboardCheck },
  { href: "/lms/audit", label: "監査ログ", icon: ScrollText },
];

export function LmsLayout({ children, title, description }: { children: ReactNode; title: string; description?: string }) {
  const [location] = useLocation();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">助成金対応リスキリングLMS</div>
              <div className="text-xs text-slate-500">受講管理・証跡出力・成果報酬管理</div>
            </div>
          </div>
          <nav className="mt-4 flex flex-wrap gap-1">
            {NAV.map(item => {
              const active = item.exact ? location === item.href : location.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      active ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}
