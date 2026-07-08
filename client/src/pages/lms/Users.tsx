import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPill } from "./ui";
import { ROLE_LABEL, type RoleCode } from "./roles-data";
import { Search, UserPlus, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS: Array<{ key: string; label: string; role?: RoleCode }> = [
  { key: "all", label: "すべて" },
  { key: "operator_admin", label: "運営管理者", role: "operator_admin" },
  { key: "partner_admin", label: "協業先管理者", role: "partner_admin" },
  { key: "company_rep", label: "代表", role: "company_rep" },
  { key: "employee", label: "会社員", role: "employee" },
  { key: "instructor", label: "講師", role: "instructor" },
  { key: "advisor", label: "社労士", role: "advisor" },
];

const STATUS_LABEL: Record<string, string> = { active: "アクティブ", invited: "招待中", not_started: "未登録", completed: "修了", suspended: "停止", delayed: "遅延", expired: "期限切れ" };

export default function LmsUsers() {
  const people = trpc.lms.people.useQuery();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  const all = people.data ?? [];
  const counts = (role?: RoleCode) => role ? all.filter(p => p.role === role).length : all.length;
  const filtered = all
    .filter(p => tab === "all" || p.role === tab)
    .filter(p => !q.trim() || p.name.includes(q) || (p.email ?? "").includes(q) || p.affiliation.includes(q));

  return (
    <LmsLayout
      title="ユーザー管理"
      description="マスターキー方式で、登録制限と情報統制を実現（FR-01 / FR-02）"
      actions={
        <>
          <a href="/lms/projects"><Button size="sm" variant="outline" className="hidden md:inline-flex"><UserPlus className="mr-1.5 h-4 w-4" /> メンバー追加</Button></a>
          <a href="/lms/companies"><Button size="sm" className="bg-blue-600 hover:bg-blue-700"><KeyRound className="mr-1.5 h-4 w-4" /> ID発行</Button></a>
        </>
      }
    >
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-0">
          {/* タブ */}
          <div className="flex flex-wrap items-center gap-1 border-b px-4 pt-3 dark:border-slate-800">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "rounded-t-lg px-3 py-2 text-sm font-medium transition-colors",
                  tab === t.key ? "border-b-2 border-blue-600 text-blue-700 dark:text-blue-300" : "text-slate-500 hover:text-slate-700",
                )}
              >
                {t.label} <span className="ml-0.5 text-xs text-slate-400">({counts(t.role)})</span>
              </button>
            ))}
          </div>

          {/* 検索 */}
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-8" placeholder="氏名・メール・所属で検索" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <span className="ml-auto text-sm text-slate-400">{filtered.length} 件</span>
          </div>

          {/* テーブル */}
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 dark:border-slate-800">
                <TableHead className="pl-4">氏名</TableHead><TableHead>メール</TableHead><TableHead>所属</TableHead><TableHead>役割</TableHead><TableHead>状態</TableHead><TableHead className="pr-4">種別</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-slate-400">該当するユーザーがいません。</TableCell></TableRow>}
              {filtered.map(p => (
                <TableRow key={`${p.kind}-${p.id}`} className="border-slate-100 dark:border-slate-800">
                  <TableCell className="pl-4 font-medium">{p.name}</TableCell>
                  <TableCell className="text-sm text-slate-500">{p.email ?? "-"}</TableCell>
                  <TableCell className="text-sm text-slate-500">{p.affiliation}</TableCell>
                  <TableCell><span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{ROLE_LABEL[p.role]}</span></TableCell>
                  <TableCell><StatusPill status={p.status}>{STATUS_LABEL[p.status] ?? p.status}</StatusPill></TableCell>
                  <TableCell className="pr-4 text-xs text-slate-400">{p.kind === "member" ? "管理アカウント" : "受講者"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="mt-3 text-xs text-slate-400">※ 管理アカウント（運営/協業先/代表/講師/社労士）は「プロジェクト・権限」で、受講者（会社員）は「企業・受講者」で登録します。</p>
    </LmsLayout>
  );
}
