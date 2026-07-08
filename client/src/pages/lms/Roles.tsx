import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_GROUPS, ROLES, PERMISSION_ROWS, type Access, type RoleCode } from "./roles-data";
import { Building2, GraduationCap, ShieldCheck, FolderKanban, User, CheckCircle2, MinusCircle, XCircle, ChevronRight } from "lucide-react";

const GROUP_STYLES: Record<string, { badge: string; ring: string; icon: React.ComponentType<{ className?: string }> }> = {
  sky: { badge: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200", ring: "border-sky-200 dark:border-sky-900", icon: Building2 },
  emerald: { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200", ring: "border-emerald-200 dark:border-emerald-900", icon: GraduationCap },
  violet: { badge: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200", ring: "border-violet-200 dark:border-violet-900", icon: ShieldCheck },
  amber: { badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200", ring: "border-amber-200 dark:border-amber-900", icon: FolderKanban },
};

const ROLE_ORDER: RoleCode[] = ["operator_admin", "project_manager", "partner_admin", "instructor", "company_rep", "employee", "advisor"];

function AccessMark({ v }: { v: Access }) {
  if (v === "yes") return <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-600" />;
  if (v === "partial") return <MinusCircle className="mx-auto h-4 w-4 text-amber-500" />;
  return <XCircle className="mx-auto h-4 w-4 text-slate-300 dark:text-slate-600" />;
}

export default function LmsRoles() {
  return (
    <LmsLayout title="ロール設計（権限）" description="お客様・提供会社・社労士・プロジェクト管理の4グループ／5ロール。案件（プロジェクト）単位で全体管理できます。">
      {/* スコープ階層 */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">スコープ階層</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {[
              { label: "プロジェクト（案件）", icon: FolderKanban, note: "project_manager / 社労士" },
              { label: "導入企業", icon: Building2, note: "代表" },
              { label: "事業所", icon: Building2, note: "" },
              { label: "会社員（受講者）", icon: User, note: "employee" },
            ].map((s, i, arr) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-2">
                  <div className="rounded-lg border bg-slate-50 px-3 py-2 dark:bg-slate-900">
                    <div className="flex items-center gap-1.5 font-medium"><Icon className="h-4 w-4 text-slate-400" />{s.label}</div>
                    {s.note && <div className="mt-0.5 text-xs text-slate-400">{s.note}</div>}
                  </div>
                  {i < arr.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300" />}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">提供会社の<strong>管理者</strong>は全階層を横断。<strong>プロジェクト管理者</strong>は担当プロジェクト配下の全企業、<strong>社労士</strong>は担当プロジェクト/企業、<strong>代表</strong>は自社、<strong>会社員</strong>は自分の受講のみ。</p>
        </CardContent>
      </Card>

      {/* グループ×ロールカード */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {ROLE_GROUPS.map(g => {
          const style = GROUP_STYLES[g.color];
          const Icon = style.icon;
          const roles = ROLES.filter(r => r.groupColor === g.color);
          return (
            <Card key={g.key} className={`border ${style.ring}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-md ${style.badge}`}><Icon className="h-4 w-4" /></span>
                  {g.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {roles.map(r => (
                  <div key={r.code} className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{r.label}</span>
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500 dark:bg-slate-800">{r.code}</code>
                      <Badge variant="secondary" className="ml-auto text-xs">{r.accountType === "member" ? "管理アカウント" : "受講者アカウント"}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">スコープ: {r.scope}</div>
                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{r.summary}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 権限マトリクス */}
      <Card>
        <CardHeader><CardTitle className="text-base">権限マトリクス</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-medium">機能</th>
                  {ROLE_ORDER.map(rc => (
                    <th key={rc} className="px-2 py-2 text-center font-medium">{ROLES.find(r => r.code === rc)?.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_ROWS.map(row => (
                  <tr key={row.feature} className="border-b last:border-0">
                    <td className="py-2 pr-2 text-slate-700 dark:text-slate-200">{row.feature}</td>
                    {ROLE_ORDER.map(rc => <td key={rc} className="px-2 py-2"><AccessMark v={row.perms[rc]} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> 可</span>
            <span className="flex items-center gap-1"><MinusCircle className="h-4 w-4 text-amber-500" /> 一部（自分のスコープ内のみ）</span>
            <span className="flex items-center gap-1"><XCircle className="h-4 w-4 text-slate-300" /> 不可</span>
          </div>
        </CardContent>
      </Card>
    </LmsLayout>
  );
}
