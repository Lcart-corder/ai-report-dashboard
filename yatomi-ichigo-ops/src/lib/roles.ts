/** ロール別の許可設定 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ["*"],
  WELFARE_MANAGER: [
    "dashboard",
    "checklist",
    "production",
    "shipments",
    "inspections",
    "complaints",
    "incidents",
    "inventory",
    "exports",
  ],
  QUALITY_MANAGER: ["dashboard", "checklist", "production", "complaints", "incidents", "exports"],
  STAFF: ["dashboard", "checklist", "production", "complaints", "incidents", "inventory"],
  STORE: ["dashboard", "inspections"],
};

export function hasPermission(role: string, page: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes("*") || perms.includes(page);
}
