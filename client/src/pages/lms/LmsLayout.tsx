import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { GraduationCap, LayoutDashboard, Building2, BookOpen, Handshake, ClipboardCheck, ScrollText, Bell, ShieldCheck, Download, Webhook, FolderKanban, KeyRound } from "lucide-react";
import type { ReactNode } from "react";
import { ROLE_LABEL, type RoleCode } from "./roles-data";

// 各ナビ項目を閲覧できるロール(未指定=全ロール)
const NAV = [
  { href: "/lms", label: "ダッシュボード", icon: LayoutDashboard, exact: true, roles: ["operator_admin", "project_manager", "partner_admin", "company_rep", "advisor"] },
  { href: "/lms/roles", label: "ロール設計", icon: KeyRound },
  { href: "/lms/projects", label: "プロジェクト・権限", icon: FolderKanban, roles: ["operator_admin"] },
  { href: "/lms/companies", label: "企業・受講者", icon: Building2, roles: ["operator_admin", "project_manager", "partner_admin", "company_rep"] },
  { href: "/lms/courses", label: "コース・教材", icon: BookOpen, roles: ["operator_admin", "project_manager", "instructor"] },
  { href: "/lms/notifications", label: "通知・リマインド", icon: Bell, roles: ["operator_admin", "project_manager", "company_rep"] },
  { href: "/lms/partners", label: "協業先・成果報酬", icon: Handshake, roles: ["operator_admin", "partner_admin"] },
  { href: "/lms/checklist", label: "申請準備チェック", icon: ClipboardCheck, roles: ["operator_admin", "project_manager", "advisor"] },
  { href: "/lms/advisor", label: "社労士確認", icon: ShieldCheck, roles: ["operator_admin", "advisor"] },
  { href: "/lms/integrations", label: "内部通知連携", icon: Webhook, roles: ["operator_admin"] },
  { href: "/lms/exports", label: "証跡出力", icon: Download, roles: ["operator_admin", "project_manager", "partner_admin", "company_rep", "advisor"] },
  { href: "/lms/audit", label: "監査ログ", icon: ScrollText, roles: ["operator_admin"] },
] as const;

export function LmsLayout({ children, title, description }: { children: ReactNode; title: string; description?: string }) {
  const [location] = useLocation();
  const me = trpc.lms.me.useQuery();
  const role = me.data?.role as RoleCode | undefined;
  const visibleNav = NAV.filter(item => !("roles" in item) || !item.roles || (role && (item.roles as readonly string[]).includes(role)));

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
            {role && (
              <div className="ml-auto flex items-center gap-2 rounded-full border bg-slate-50 px-3 py-1 dark:bg-slate-800">
                <span className="text-xs text-slate-500">現在のロール</span>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{ROLE_LABEL[role] ?? role}</span>
                {me.data?.name && <span className="text-xs text-slate-400">/ {me.data.name}</span>}
              </div>
            )}
          </div>
          <nav className="mt-4 flex flex-wrap gap-1">
            {visibleNav.map(item => {
              const active = "exact" in item && item.exact ? location === item.href : location.startsWith(item.href);
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
