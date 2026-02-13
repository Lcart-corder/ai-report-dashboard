"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { hasPermission } from "@/lib/roles";

const NAV_ITEMS = [
  { href: "/dashboard", label: "ダッシュボード", page: "dashboard" },
  { href: "/checklist", label: "日次チェックリスト", page: "checklist" },
  { href: "/production", label: "生産記録", page: "production" },
  { href: "/shipments", label: "納品管理", page: "shipments" },
  { href: "/inspections", label: "店舗検収", page: "inspections" },
  { href: "/complaints", label: "クレーム", page: "complaints" },
  { href: "/incidents", label: "ヒヤリハット", page: "incidents" },
  { href: "/inventory", label: "資材在庫", page: "inventory" },
  { href: "/exports", label: "帳票出力", page: "exports" },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "管理者",
  WELFARE_MANAGER: "福祉運営",
  QUALITY_MANAGER: "支援品質",
  STAFF: "現場職員",
  STORE: "提携店舗",
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";

  return (
    <aside className="w-60 min-h-screen bg-green-800 text-white flex flex-col shrink-0">
      <div className="p-4 border-b border-green-700">
        <h1 className="text-lg font-bold">やとみいちご運営</h1>
        {session?.user && (
          <p className="text-xs mt-1 text-green-200">
            {session.user.name}（{ROLE_LABELS[role] ?? role}）
          </p>
        )}
      </div>
      <nav className="flex-1 py-2">
        {NAV_ITEMS.filter((item) => hasPermission(role, item.page)).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 text-sm hover:bg-green-700 ${
                active ? "bg-green-700 font-semibold" : ""
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-green-700">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-green-200 hover:text-white"
        >
          ログアウト
        </button>
      </div>
    </aside>
  );
}
