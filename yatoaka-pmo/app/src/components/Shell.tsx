"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { navItems, currentUser } from "@/lib/mock";
import {
  IconHome,
  IconFolder,
  IconList,
  IconCalendar,
  IconChat,
  IconSparkles,
  IconUsers,
  IconDoc,
  IconChart,
  IconSettings,
  IconBell,
  IconSearch,
  IconHelp,
  IconMenu,
  IconChevronDown,
} from "./icons";
import { Avatar } from "./ui";

const ICONS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  home: IconHome,
  folder: IconFolder,
  list: IconList,
  calendar: IconCalendar,
  chat: IconChat,
  sparkles: IconSparkles,
  users: IconUsers,
  doc: IconDoc,
  chart: IconChart,
};

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { data: session } = useSession();

  // ログイン画面ではアプリのシェル（サイドバー等）を表示しない
  if (pathname === "/login") return <>{children}</>;

  const displayName = session?.user?.name ?? currentUser.name;
  const displayRole = session?.user?.email ?? currentUser.role;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const Sidebar = (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-navy text-slate-200">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white">
          <IconSparkles width={18} height={18} />
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-bold text-white">やとアカ運営</div>
          <div className="text-[11px] text-slate-300">AI-PMOシステム</div>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3 pb-4 scroll-thin">
        {navItems.map((item) => {
          const Icon = ICONS[item.icon] ?? IconHome;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-blue-600 font-semibold text-white shadow"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon width={19} height={19} />
              {item.label}
            </Link>
          );
        })}

        <div className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          管理
        </div>
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
            isActive("/settings")
              ? "bg-blue-600 font-semibold text-white"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <IconSettings width={19} height={19} />
          設定
        </Link>
      </nav>

      <div className="border-t border-white/10 px-5 py-3 text-[11px] text-slate-400">
        © 2025 やとアカ運営 AI-PMO
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block">{Sidebar}</div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">{Sidebar}</div>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 md:px-6">
          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="メニュー"
          >
            <IconMenu />
          </button>

          <div className="relative hidden max-w-md flex-1 sm:block">
            <IconSearch
              width={18}
              height={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="検索（プロジェクト、タスク、資料など）"
              className="h-10 w-full rounded-xl bg-slate-100 pl-10 pr-16 text-sm outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-200"
            />
            <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] text-slate-500 lg:block">
              Ctrl + K
            </kbd>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <IconBell />
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                3
              </span>
            </button>
            <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <IconHelp />
            </button>
            <div className="relative">
              <button
                onClick={() => setUserMenu((v) => !v)}
                className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-slate-100"
              >
                <Avatar name={displayName} size={34} />
                <div className="hidden max-w-[160px] leading-tight sm:block">
                  <div className="truncate text-[13px] font-semibold text-slate-700">
                    {displayName}
                  </div>
                  <div className="truncate text-[11px] text-slate-400">{displayRole}</div>
                </div>
                <IconChevronDown
                  width={16}
                  height={16}
                  className="hidden text-slate-400 sm:block"
                />
              </button>
              {userMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenu(false)} />
                  <div className="absolute right-0 top-12 z-20 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-slate-700">{displayName}</p>
                      <p className="truncate text-xs text-slate-400">{displayRole}</p>
                    </div>
                    {session ? (
                      <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        ログアウト
                      </button>
                    ) : (
                      <Link
                        href="/login"
                        className="block px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setUserMenu(false)}
                      >
                        ログイン
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-100 scroll-thin">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="flex shrink-0 items-center justify-around border-t border-slate-200 bg-white py-1.5 md:hidden">
          {[
            { href: "/", label: "ホーム", icon: IconHome },
            { href: "/tasks", label: "タスク", icon: IconList },
            { href: "/meetings", label: "会議", icon: IconChat },
            { href: "/documents", label: "資料", icon: IconDoc },
            { href: "/reports", label: "その他", icon: IconChart },
          ].map((t) => {
            const active = isActive(t.href);
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[11px] ${
                  active ? "text-blue-600" : "text-slate-500"
                }`}
              >
                <Icon width={20} height={20} />
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
