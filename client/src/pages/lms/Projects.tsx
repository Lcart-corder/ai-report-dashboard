import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FolderKanban, Plus, Building2, UserCog, Trash2 } from "lucide-react";
import { ROLE_LABEL, type RoleCode } from "./roles-data";
import { cn } from "@/lib/utils";

/** メンバー(管理アカウント)に割当可能なロール(会社員=受講者を除く)。 */
type MemberRole = Exclude<RoleCode, "employee">;

export default function LmsProjects() {
  const utils = trpc.useUtils();
  const projects = trpc.lms.projects.list.useQuery();
  const partners = trpc.lms.partners.list.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [np, setNp] = useState({ name: "", partnerId: "", description: "" });
  const createProject = trpc.lms.projects.create.useMutation({
    onSuccess: () => { toast.success("プロジェクトを作成しました"); utils.lms.projects.list.invalidate(); setNp({ name: "", partnerId: "", description: "" }); },
    onError: e => toast.error(e.message),
  });

  const selected = projects.data?.find(p => p.id === selectedId) ?? projects.data?.[0] ?? null;

  return (
    <LmsLayout title="プロジェクト・権限管理" description="案件（プロジェクト）単位で企業を束ね、メンバーにロールとスコープを割り当てます。">
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <Dialog>
            <DialogTrigger asChild><Button className="w-full bg-blue-600 hover:bg-blue-700"><Plus className="mr-1.5 h-4 w-4" /> プロジェクト作成</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>プロジェクト作成</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>プロジェクト名 *</Label><Input value={np.name} onChange={e => setNp({ ...np, name: e.target.value })} placeholder="例: 2026年度リスキリング支援 第1期" /></div>
                <div>
                  <Label>担当協業先（任意）</Label>
                  <Select value={np.partnerId} onValueChange={v => setNp({ ...np, partnerId: v })}>
                    <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
                    <SelectContent>{partners.data?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>説明</Label><Input value={np.description} onChange={e => setNp({ ...np, description: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={() => createProject.mutate({ name: np.name, partnerId: np.partnerId ? Number(np.partnerId) : undefined, description: np.description || undefined })} disabled={!np.name || createProject.isPending}>作成</Button></DialogFooter>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">プロジェクト（{projects.data?.length ?? 0}）</CardTitle></CardHeader>
            <CardContent className="space-y-1 p-2">
              {projects.data?.length === 0 && <p className="p-3 text-sm text-slate-400">プロジェクトがありません。</p>}
              {projects.data?.map(p => (
                <button key={p.id} onClick={() => setSelectedId(p.id)} className={cn("flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm", selected?.id === p.id ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "hover:bg-slate-100 dark:hover:bg-slate-800")}>
                  <FolderKanban className="h-4 w-4 shrink-0 text-slate-400" /><span className="truncate">{p.name}</span>
                  {p.status === "closed" && <span className="ml-auto inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">終了</span>}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {selected ? <ProjectDetail key={selected.id} projectId={selected.id} projectName={selected.name} /> : <Card><CardContent className="p-12 text-center text-slate-400">プロジェクトを選択または作成してください。</CardContent></Card>}
      </div>

      <MembersSection />
    </LmsLayout>
  );
}

function ProjectDetail({ projectId, projectName }: { projectId: number; projectName: string }) {
  const utils = trpc.useUtils();
  const companiesInProject = trpc.lms.projects.companies.useQuery({ projectId });
  const allCompanies = trpc.lms.companies.list.useQuery();
  const [addCompany, setAddCompany] = useState("");

  const assign = trpc.lms.projects.assignCompany.useMutation({
    onSuccess: () => { toast.success("企業を割り当てました"); utils.lms.projects.companies.invalidate({ projectId }); utils.lms.companies.list.invalidate(); setAddCompany(""); },
    onError: e => toast.error(e.message),
  });

  const unassigned = allCompanies.data?.filter(c => c.projectId !== projectId) ?? [];

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Building2 className="h-4 w-4" /> {projectName} — 対象企業（{companiesInProject.data?.length ?? 0}）</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label className="text-xs">企業をプロジェクトに追加</Label>
            <Select value={addCompany} onValueChange={setAddCompany}>
              <SelectTrigger><SelectValue placeholder="企業を選択" /></SelectTrigger>
              <SelectContent>{unassigned.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button disabled={!addCompany || assign.isPending} onClick={() => assign.mutate({ companyId: Number(addCompany), projectId })}>追加</Button>
        </div>

        <Table>
          <TableHeader><TableRow><TableHead>企業名</TableHead><TableHead>法人番号</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {companiesInProject.data?.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-slate-400">未割当</TableCell></TableRow>}
            {companiesInProject.data?.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-sm text-slate-500">{c.corporateNumber}</TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => assign.mutate({ companyId: c.id, projectId: null })}>解除</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function MembersSection() {
  const utils = trpc.useUtils();
  const members = trpc.lms.members.list.useQuery();
  const projects = trpc.lms.projects.list.useQuery();
  const companies = trpc.lms.companies.list.useQuery();
  const partners = trpc.lms.partners.list.useQuery();

  const [m, setM] = useState({ email: "", name: "", role: "company_rep" as MemberRole, projectId: "", companyId: "", partnerId: "" });
  const create = trpc.lms.members.create.useMutation({
    onSuccess: () => { toast.success("メンバーを追加しました"); utils.lms.members.list.invalidate(); setM({ email: "", name: "", role: "company_rep", projectId: "", companyId: "", partnerId: "" }); },
    onError: e => toast.error(e.message),
  });
  const del = trpc.lms.members.delete.useMutation({ onSuccess: () => { toast.success("削除しました"); utils.lms.members.list.invalidate(); } });

  const needsProject = m.role === "project_manager" || m.role === "advisor";
  const needsCompany = m.role === "company_rep";
  const needsPartner = m.role === "partner_admin";
  const ROLE_OPTIONS: MemberRole[] = ["operator_admin", "project_manager", "partner_admin", "instructor", "company_rep", "advisor"];

  const scopeLabel = (role: string, projectId: number | null, companyId: number | null, partnerId: number | null) => {
    if (role === "operator_admin") return "全体";
    if (role === "instructor") return "コンテンツのみ";
    if (role === "partner_admin") return partnerId != null ? `協業先:${partners.data?.find(p => p.id === partnerId)?.name ?? partnerId}` : "未設定";
    if (role === "project_manager" || role === "advisor") return projectId != null ? `PJ:${projects.data?.find(p => p.id === projectId)?.name ?? projectId}` : (companyId != null ? `企業:${companies.data?.find(c => c.id === companyId)?.name ?? companyId}` : "未設定");
    if (role === "company_rep") return companyId != null ? `企業:${companies.data?.find(c => c.id === companyId)?.name ?? companyId}` : "未設定";
    return "-";
  };

  return (
    <Card className="mt-6">
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><UserCog className="h-4 w-4" /> メンバー・ロール割当（{members.data?.length ?? 0}）</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_1fr_160px_1fr_auto]">
          <Input placeholder="氏名 *" value={m.name} onChange={e => setM({ ...m, name: e.target.value })} />
          <Input placeholder="メール *" value={m.email} onChange={e => setM({ ...m, email: e.target.value })} />
          <Select value={m.role} onValueChange={(v: MemberRole) => setM({ ...m, role: v, projectId: "", companyId: "", partnerId: "" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{ROLE_OPTIONS.map(r => <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>)}</SelectContent>
          </Select>
          {needsProject ? (
            <Select value={m.projectId} onValueChange={v => setM({ ...m, projectId: v })}>
              <SelectTrigger><SelectValue placeholder="担当プロジェクト" /></SelectTrigger>
              <SelectContent>{projects.data?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          ) : needsCompany ? (
            <Select value={m.companyId} onValueChange={v => setM({ ...m, companyId: v })}>
              <SelectTrigger><SelectValue placeholder="担当企業" /></SelectTrigger>
              <SelectContent>{companies.data?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          ) : needsPartner ? (
            <Select value={m.partnerId} onValueChange={v => setM({ ...m, partnerId: v })}>
              <SelectTrigger><SelectValue placeholder="担当協業先" /></SelectTrigger>
              <SelectContent>{partners.data?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          ) : (
            <div className="flex items-center px-2 text-xs text-slate-400">{m.role === "instructor" ? "コンテンツのみ" : "スコープ: 全体"}</div>
          )}
          <Button
            disabled={create.isPending || !m.name || !m.email || (needsProject && !m.projectId) || (needsCompany && !m.companyId) || (needsPartner && !m.partnerId)}
            onClick={() => create.mutate({ email: m.email, name: m.name, role: m.role, projectId: m.projectId ? Number(m.projectId) : undefined, companyId: m.companyId ? Number(m.companyId) : undefined, partnerId: m.partnerId ? Number(m.partnerId) : undefined })}
          >追加</Button>
        </div>

        <Table>
          <TableHeader><TableRow><TableHead>氏名</TableHead><TableHead>メール</TableHead><TableHead>ロール</TableHead><TableHead>スコープ</TableHead><TableHead>状態</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {members.data?.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-slate-400">メンバーがいません</TableCell></TableRow>}
            {members.data?.map(mm => (
              <TableRow key={mm.id}>
                <TableCell className="font-medium">{mm.name}</TableCell>
                <TableCell className="text-sm text-slate-500">{mm.email}</TableCell>
                <TableCell><span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{ROLE_LABEL[mm.role as RoleCode] ?? mm.role}</span></TableCell>
                <TableCell className="text-sm text-slate-500">{scopeLabel(mm.role, mm.projectId, mm.companyId, mm.partnerId)}</TableCell>
                <TableCell><span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", mm.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400")}>{mm.isActive ? "有効" : "停止"}</span></TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => del.mutate({ id: mm.id })}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
