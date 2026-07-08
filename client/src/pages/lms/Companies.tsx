import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Building2, KeyRound, Plus, Upload, UserPlus, Copy } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  invited: "招待済", active: "受講中", delayed: "遅延", completed: "修了", expired: "期限切れ", suspended: "停止",
};

export default function LmsCompanies() {
  const utils = trpc.useUtils();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const companies = trpc.lms.companies.list.useQuery();
  const partners = trpc.lms.partners.list.useQuery();

  const [newCompany, setNewCompany] = useState({ name: "", corporateNumber: "", contactName: "", partnerId: "" });
  const createCompany = trpc.lms.companies.create.useMutation({
    onSuccess: () => { toast.success("企業を登録しました"); utils.lms.companies.list.invalidate(); setNewCompany({ name: "", corporateNumber: "", contactName: "", partnerId: "" }); },
    onError: e => toast.error(e.message),
  });

  const selected = companies.data?.find(c => c.id === selectedId) ?? companies.data?.[0] ?? null;
  const companyId = selected?.id ?? null;

  return (
    <LmsLayout title="企業・受講者" description="導入企業の登録、マスターキー発行、受講者登録（FR-02 / FR-03 / FR-04）">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* 企業リスト */}
        <div className="space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full"><Plus className="mr-1.5 h-4 w-4" /> 導入企業を登録</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>導入企業の登録</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>企業名 *</Label><Input value={newCompany.name} onChange={e => setNewCompany({ ...newCompany, name: e.target.value })} /></div>
                <div><Label>法人番号</Label><Input value={newCompany.corporateNumber} onChange={e => setNewCompany({ ...newCompany, corporateNumber: e.target.value })} /></div>
                <div><Label>担当者</Label><Input value={newCompany.contactName} onChange={e => setNewCompany({ ...newCompany, contactName: e.target.value })} /></div>
                <div>
                  <Label>協業先</Label>
                  <Select value={newCompany.partnerId} onValueChange={v => setNewCompany({ ...newCompany, partnerId: v })}>
                    <SelectTrigger><SelectValue placeholder="（任意）" /></SelectTrigger>
                    <SelectContent>
                      {partners.data?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => createCompany.mutate({
                    name: newCompany.name,
                    corporateNumber: newCompany.corporateNumber || undefined,
                    contactName: newCompany.contactName || undefined,
                    partnerId: newCompany.partnerId ? Number(newCompany.partnerId) : undefined,
                  })}
                  disabled={!newCompany.name || createCompany.isPending}
                >登録</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">導入企業（{companies.data?.length ?? 0}）</CardTitle></CardHeader>
            <CardContent className="space-y-1 p-2">
              {companies.data?.length === 0 && <p className="p-3 text-sm text-slate-400">企業がありません。</p>}
              {companies.data?.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${companyId === c.id ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                >
                  <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 詳細 */}
        {companyId != null && selected ? (
          <CompanyDetail key={companyId} companyId={companyId} companyName={selected.name} />
        ) : (
          <Card><CardContent className="p-12 text-center text-slate-400">左から企業を選択してください。</CardContent></Card>
        )}
      </div>
    </LmsLayout>
  );
}

function CompanyDetail({ companyId, companyName }: { companyId: number; companyName: string }) {
  const utils = trpc.useUtils();
  const keys = trpc.lms.masterKeys.list.useQuery({ companyId });
  const learners = trpc.lms.learners.listByCompany.useQuery({ companyId });
  const courses = trpc.lms.courses.list.useQuery();

  const issueKey = trpc.lms.masterKeys.issue.useMutation({
    onSuccess: r => { toast.success(`マスターキーを発行しました: ${r.keyCode}`); utils.lms.masterKeys.list.invalidate({ companyId }); },
    onError: e => toast.error(e.message),
  });
  const deactivateKey = trpc.lms.masterKeys.deactivate.useMutation({
    onSuccess: () => { toast.success("キーを停止しました"); utils.lms.masterKeys.list.invalidate({ companyId }); },
  });

  const [newLearner, setNewLearner] = useState({ name: "", email: "", employeeNumber: "", department: "" });
  const createLearner = trpc.lms.learners.create.useMutation({
    onSuccess: () => { toast.success("受講者を登録しました"); utils.lms.learners.listByCompany.invalidate({ companyId }); setNewLearner({ name: "", email: "", employeeNumber: "", department: "" }); },
    onError: e => toast.error(e.message),
  });

  const [csv, setCsv] = useState("");
  const bulkCreate = trpc.lms.learners.bulkCreate.useMutation({
    onSuccess: r => { toast.success(`${r.inserted}名を一括登録しました`); utils.lms.learners.listByCompany.invalidate({ companyId }); setCsv(""); },
    onError: e => toast.error(e.message),
  });

  const [assignCourse, setAssignCourse] = useState("");
  const assign = trpc.lms.enrollments.assign.useMutation({
    onSuccess: r => toast[r.duplicated ? "info" : "success"](r.duplicated ? "既に割当済みです" : "コースを割り当てました"),
    onError: e => toast.error(e.message),
  });

  function parseCsv() {
    const rows = csv.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
      const [name, email, employeeNumber, department] = line.split(",").map(s => s?.trim());
      return { name, email, employeeNumber, department };
    }).filter(r => r.name);
    if (rows.length === 0) return toast.error("有効な行がありません（氏名,メール,社員番号,部署）");
    bulkCreate.mutate({ companyId, rows });
  }

  return (
    <div className="space-y-6">
      {/* マスターキー */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base"><KeyRound className="h-4 w-4" /> マスターキー（登録制限）</CardTitle>
          <Button size="sm" onClick={() => issueKey.mutate({ companyId, maxUses: null })} disabled={issueKey.isPending}>
            <Plus className="mr-1 h-4 w-4" /> 発行
          </Button>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-slate-500">マスターキー無しでの自由登録は不可（FR-02）。受講者はこのキーで所属企業が自動判定されます。</p>
          <Table>
            <TableHeader><TableRow><TableHead>キー</TableHead><TableHead>利用</TableHead><TableHead>状態</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {keys.data?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-slate-400">キーがありません</TableCell></TableRow>}
              {keys.data?.map(k => (
                <TableRow key={k.id}>
                  <TableCell className="font-mono text-sm">
                    {k.keyCode}
                    <button className="ml-2 text-slate-400 hover:text-slate-600" onClick={() => { navigator.clipboard.writeText(k.keyCode); toast.success("コピーしました"); }}><Copy className="inline h-3.5 w-3.5" /></button>
                  </TableCell>
                  <TableCell className="text-sm">{k.usedCount}{k.maxUses != null ? ` / ${k.maxUses}` : ""}</TableCell>
                  <TableCell>{k.isActive ? <Badge className="bg-emerald-600">有効</Badge> : <Badge variant="secondary">停止</Badge>}</TableCell>
                  <TableCell>{k.isActive && <Button size="sm" variant="ghost" onClick={() => deactivateKey.mutate({ id: k.id })}>停止</Button>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 受講者 */}
      <Card>
        <CardHeader><CardTitle className="text-base">受講者一覧（{learners.data?.length ?? 0}） — {companyName}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 rounded-lg border p-3 md:grid-cols-5">
            <Input placeholder="氏名 *" value={newLearner.name} onChange={e => setNewLearner({ ...newLearner, name: e.target.value })} />
            <Input placeholder="メール" value={newLearner.email} onChange={e => setNewLearner({ ...newLearner, email: e.target.value })} />
            <Input placeholder="社員番号" value={newLearner.employeeNumber} onChange={e => setNewLearner({ ...newLearner, employeeNumber: e.target.value })} />
            <Input placeholder="部署" value={newLearner.department} onChange={e => setNewLearner({ ...newLearner, department: e.target.value })} />
            <Button onClick={() => createLearner.mutate({ companyId, name: newLearner.name, email: newLearner.email || undefined, employeeNumber: newLearner.employeeNumber || undefined, department: newLearner.department || undefined })} disabled={!newLearner.name || createLearner.isPending}>
              <UserPlus className="mr-1 h-4 w-4" /> 追加
            </Button>
          </div>

          <details className="rounded-lg border p-3">
            <summary className="cursor-pointer text-sm font-medium">CSV一括登録（氏名,メール,社員番号,部署）</summary>
            <Textarea className="mt-2 font-mono text-xs" rows={4} placeholder={"田中太郎,tanaka@example.com,EMP010,営業部\n佐藤花子,sato@example.com,EMP011,開発部"} value={csv} onChange={e => setCsv(e.target.value)} />
            <Button className="mt-2" size="sm" onClick={parseCsv} disabled={bulkCreate.isPending}><Upload className="mr-1 h-4 w-4" /> 一括登録</Button>
          </details>

          <div className="flex items-end gap-2 rounded-lg border p-3">
            <div className="flex-1">
              <Label className="text-xs">コース割当（受講者全員に一括）</Label>
              <Select value={assignCourse} onValueChange={setAssignCourse}>
                <SelectTrigger><SelectValue placeholder="コースを選択" /></SelectTrigger>
                <SelectContent>{courses.data?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              disabled={!assignCourse || !learners.data?.length}
              onClick={async () => {
                if (!assignCourse || !learners.data) return;
                for (const l of learners.data) await assign.mutateAsync({ learnerId: l.id, courseId: Number(assignCourse) });
                toast.success("割当が完了しました");
              }}
            >一括割当</Button>
          </div>

          <Table>
            <TableHeader><TableRow><TableHead>氏名</TableHead><TableHead>社員番号</TableHead><TableHead>部署</TableHead><TableHead>状態</TableHead><TableHead>受講画面</TableHead></TableRow></TableHeader>
            <TableBody>
              {learners.data?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-slate-400">受講者がいません</TableCell></TableRow>}
              {learners.data?.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell className="text-sm text-slate-500">{l.employeeNumber}</TableCell>
                  <TableCell className="text-sm text-slate-500">{l.department}</TableCell>
                  <TableCell><Badge variant={l.status === "completed" ? "default" : "secondary"} className={l.status === "completed" ? "bg-emerald-600" : ""}>{STATUS_LABEL[l.status] ?? l.status}</Badge></TableCell>
                  <TableCell><a className="text-sm text-emerald-600 hover:underline" href={`/lms/learn/${l.id}`}>受講画面を開く →</a></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
