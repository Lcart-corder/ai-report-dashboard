import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import {
  LayoutDashboard, Building2, BookOpen, Handshake, ClipboardCheck, ScrollText,
  Bell, ShieldCheck, Download, Webhook, FolderKanban, KeyRound, HelpCircle,
  ChevronLeft, ChevronRight, GraduationCap,
} from "lucide-react";
import type { ReactNode } from "react";
import { ROLE_LABEL, type RoleCode } from "./roles-data";

// 各ナビ項目を閲覧できるロール(未指定=全ロール)
const NAV = [
  { href: "/lms", label: "ダッシュボード", icon: LayoutDashboard, exact: true, roles: ["operator_admin", "project_manager", "partner_admin", "company_rep", "instructor", "advisor"] },
  { href: "/lms/companies", label: "企業・受講者", icon: Building2, roles: ["operator_admin", "project_manager", "partner_admin", "company_rep"] },
  { href: "/lms/courses", label: "コース・教材", icon: BookOpen, roles: ["operator_admin", "project_manager", "instructor"] },
  { href: "/lms/notifications", label: "通知・リマインド", icon: Bell, roles: ["operator_admin", "project_manager", "company_rep"] },
  { href: "/lms/partners", label: "協業先・成果報酬", icon: Handshake, roles: ["operator_admin", "partner_admin"] },
  { href: "/lms/checklist", label: "申請準備チェック", icon: ClipboardCheck, roles: ["operator_admin", "project_manager", "advisor"] },
  { href: "/lms/advisor", label: "社労士確認", icon: ShieldCheck, roles: ["operator_admin", "advisor"] },
  { href: "/lms/exports", label: "証跡出力", icon: Download, roles: ["operator_admin", "project_manager", "partner_admin", "company_rep", "advisor"] },
  { href: "/lms/projects", label: "プロジェクト・権限", icon: FolderKanban, roles: ["operator_admin"] },
  { href: "/lms/integrations", label: "内部通知連携", icon: Webhook, roles: ["operator_admin"] },
  { href: "/lms/audit", label: "監査ログ", icon: ScrollText, roles: ["operator_admin"] },
  { href: "/lms/roles", label: "ロール設計", icon: KeyRound },
] as const;

export function LmsLayout({ children, title, description, actions }: { children: ReactNode; title: string; description?: string; actions?: ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const me = trpc.lms.me.useQuery();
  const role = me.data?.role as RoleCode | undefined;
  const visibleNav = NAV.filter(item => !("roles" in item) || !item.roles || (role && (item.roles as readonly string[]).includes(role)));

  return (
    <div className="flex min-h-screen bg-[#f4f6fa] text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {/* サイドバー(濃紺) */}
      <aside className={cn("sticky top-0 flex h-screen shrink-0 flex-col bg-[#0f2547] text-slate-200 transition-all", collapsed ? "w-[68px]" : "w-64")}>
        <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-white">L cart <span className="font-normal text-slate-300">LMS</span></div>
              <div className="truncate text-[10px] text-slate-400">助成金対応リスキリング</div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {visibleNav.map(item => {
            const active = "exact" in item && item.exact ? location === item.href : location.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  title={item.label}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-blue-600 text-white shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-2">
          {!collapsed && role && (
            <div className="mb-2 rounded-lg bg-white/5 px-3 py-2">
              <div className="text-[10px] text-slate-400">ログイン中</div>
              <div className="truncate text-xs font-semibold text-white">{me.data?.name}</div>
              <div className="mt-0.5 inline-block rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-medium text-blue-200">{ROLE_LABEL[role] ?? role}</div>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)} className={cn("flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/10 hover:text-white", collapsed && "justify-center px-0")}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /> メニューを閉じる</>}
          </button>
        </div>
      </aside>

      {/* メイン */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* トップバー */}
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h1>
            {description && <p className="truncate text-xs text-slate-500">{description}</p>}
          </div>
          {actions}
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" title="お知らせ">
            <Bell className="h-5 w-5" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" title="ヘルプ">
            <HelpCircle className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 border-l pl-3 dark:border-slate-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {(me.data?.name ?? "?").slice(0, 1)}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold leading-tight text-slate-700 dark:text-slate-200">{me.data?.name ?? "ゲスト"}</div>
              <div className="text-[10px] leading-tight text-slate-400">{role ? (ROLE_LABEL[role] ?? role) : "-"}</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-6">{children}</main>
      </div>
    </div>
  );
}
