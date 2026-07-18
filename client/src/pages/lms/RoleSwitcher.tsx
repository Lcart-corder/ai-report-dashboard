import { UserCog } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ROLE_LABEL, type RoleCode } from "./roles-data";

// ゲスト閲覧モードで切り替え可能なロール(サーバーの PREVIEW_ROLES と一致)
const PREVIEW_ROLE_OPTIONS: RoleCode[] = ["operator_admin", "project_manager", "partner_admin", "company_rep", "instructor", "advisor", "employee"];

/**
 * ゲスト閲覧モード専用のロール切替。選択した立場をCookieに保存し、
 * 入口(/lms)へ遷移してロール別ホームの出し分けを反映する。
 * 管理画面・受講生画面のどちらのヘッダーにも配置できる共有コンポーネント。
 * ゲスト(guest@preview.local)以外では何も表示しない。
 */
export function RoleSwitcher({ className }: { className?: string }) {
  const me = trpc.lms.me.useQuery();
  const isGuest = me.data?.email === "guest@preview.local";
  if (!isGuest) return null;
  const current = (me.data?.role as RoleCode | undefined) ?? "operator_admin";

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    document.cookie = `lms_preview_role=${e.target.value}; path=/; max-age=86400`;
    // 役割によってホームが変わるため、入口(/lms)へ遷移して出し分けを反映
    window.location.href = "/lms";
  }

  return (
    <label
      className={`flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300 ${className ?? ""}`}
      title="見る立場を切り替える"
    >
      <UserCog className="h-4 w-4" />
      <span className="hidden sm:inline">ロール切替</span>
      <select value={current} onChange={onChange} className="cursor-pointer bg-transparent pr-1 text-xs font-semibold focus:outline-none">
        {PREVIEW_ROLE_OPTIONS.map(r => (
          <option key={r} value={r} className="text-slate-800">{ROLE_LABEL[r] ?? r}</option>
        ))}
      </select>
    </label>
  );
}
