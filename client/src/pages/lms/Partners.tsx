import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Handshake, Plus, Calculator, Info } from "lucide-react";

const yen = (n: number) => `¥${n.toLocaleString()}`;

export default function LmsPartners() {
  const utils = trpc.useUtils();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const partners = trpc.lms.partners.list.useQuery();

  const [np, setNp] = useState({ name: "", contactName: "", successFeeRate: 20 });
  const createPartner = trpc.lms.partners.create.useMutation({
    onSuccess: () => { toast.success("協業先を登録しました"); utils.lms.partners.list.invalidate(); setNp({ name: "", contactName: "", successFeeRate: 20 }); },
    onError: e => toast.error(e.message),
  });

  const selected = partners.data?.find(p => p.id === selectedId) ?? partners.data?.[0] ?? null;

  return (
    <LmsLayout title="協業先・成果報酬" description="協業先の研修売上と成果報酬（基本20%）を管理。助成金受給額には連動させません（FR-17 / FR-18）">
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>成果報酬は「協業先の<strong>研修売上</strong> × 報酬率」で計算します。<strong>助成金受給額には一切連動させません</strong>（実質無料スキーム等の制度リスク回避）。</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Dialog>
            <DialogTrigger asChild><Button className="w-full"><Plus className="mr-1.5 h-4 w-4" /> 協業先を登録</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>協業先の登録</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>会社名 *</Label><Input value={np.name} onChange={e => setNp({ ...np, name: e.target.value })} /></div>
                <div><Label>担当者</Label><Input value={np.contactName} onChange={e => setNp({ ...np, contactName: e.target.value })} /></div>
                <div><Label>成果報酬率(%)</Label><Input type="number" value={np.successFeeRate} onChange={e => setNp({ ...np, successFeeRate: Number(e.target.value) })} /></div>
              </div>
              <DialogFooter><Button onClick={() => createPartner.mutate({ name: np.name, contactName: np.contactName || undefined, successFeeRate: np.successFeeRate })} disabled={!np.name || createPartner.isPending}>登録</Button></DialogFooter>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">協業先（{partners.data?.length ?? 0}）</CardTitle></CardHeader>
            <CardContent className="space-y-1 p-2">
              {partners.data?.length === 0 && <p className="p-3 text-sm text-slate-400">協業先がありません。</p>}
              {partners.data?.map(p => (
                <button key={p.id} onClick={() => setSelectedId(p.id)} className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${selected?.id === p.id ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                  <Handshake className="h-4 w-4 shrink-0 text-slate-400" /><span className="truncate">{p.name}</span>
                  <Badge variant="secondary" className="ml-auto">{p.successFeeRate}%</Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {selected ? <PartnerDetail key={selected.id} partnerId={selected.id} partnerName={selected.name} feeRate={selected.successFeeRate} /> : <Card><CardContent className="p-12 text-center text-slate-400">左から協業先を選択してください。</CardContent></Card>}
      </div>
    </LmsLayout>
  );
}

function PartnerDetail({ partnerId, partnerName, feeRate }: { partnerId: number; partnerName: string; feeRate: number }) {
  const utils = trpc.useUtils();
  const sales = trpc.lms.partners.sales.useQuery({ partnerId });
  const fees = trpc.lms.partners.fees.useQuery({ partnerId });
  const monthly = trpc.lms.partners.monthlyReport.useQuery({ partnerId });

  const nowMonth = new Date().toISOString().slice(0, 7);
  const [ns, setNs] = useState({ yearMonth: nowMonth, trainingSales: 1000000 });
  const recordSale = trpc.lms.partners.recordSale.useMutation({
    onSuccess: () => { toast.success("研修売上を登録しました"); utils.lms.partners.sales.invalidate({ partnerId }); },
    onError: e => toast.error(e.message),
  });
  const calcFee = trpc.lms.partners.calcFee.useMutation({
    onSuccess: r => { toast.success(`成果報酬を計算しました: ${yen(r.feeAmount)}（${r.feeRate}%）`); utils.lms.partners.fees.invalidate({ partnerId }); },
    onError: e => toast.error(e.message),
  });

  const feeByStatus: Record<string, string> = { draft: "下書き", invoiced: "請求済", paid: "入金済" };
  const totalForecast = (monthly.data ?? []).reduce((s, m) => s + m.feeAmount, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">研修売上の登録 — {partnerName}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 rounded-lg border p-3 md:grid-cols-[160px_1fr_auto]">
            <div><Label className="text-xs">対象月</Label><Input type="month" value={ns.yearMonth} onChange={e => setNs({ ...ns, yearMonth: e.target.value })} /></div>
            <div><Label className="text-xs">研修売上額(円)</Label><Input type="number" value={ns.trainingSales} onChange={e => setNs({ ...ns, trainingSales: Number(e.target.value) })} /></div>
            <div className="flex items-end"><Button onClick={() => recordSale.mutate({ partnerId, yearMonth: ns.yearMonth, trainingSales: ns.trainingSales })} disabled={recordSale.isPending}>登録</Button></div>
          </div>
          <p className="mt-2 text-xs text-slate-500">予定成果報酬（{feeRate}%）: <strong>{yen(Math.floor((ns.trainingSales * feeRate) / 100))}</strong></p>

          <Table className="mt-4">
            <TableHeader><TableRow><TableHead>対象月</TableHead><TableHead>研修売上</TableHead><TableHead>予定報酬({feeRate}%)</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {sales.data?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-slate-400">売上がありません</TableCell></TableRow>}
              {sales.data?.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.yearMonth}</TableCell>
                  <TableCell>{yen(s.trainingSales)}</TableCell>
                  <TableCell className="font-medium text-emerald-700 dark:text-emerald-400">{yen(Math.floor((s.trainingSales * feeRate) / 100))}</TableCell>
                  <TableCell><Button size="sm" variant="outline" onClick={() => calcFee.mutate({ partnerSaleId: s.id })} disabled={calcFee.isPending}><Calculator className="mr-1 h-4 w-4" /> 報酬確定</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">成果報酬（確定分）</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>対象月</TableHead><TableHead>算定基礎(研修売上)</TableHead><TableHead>報酬率</TableHead><TableHead>報酬額</TableHead><TableHead>状態</TableHead></TableRow></TableHeader>
            <TableBody>
              {fees.data?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-slate-400">確定した報酬がありません</TableCell></TableRow>}
              {fees.data?.map(f => (
                <TableRow key={f.id}>
                  <TableCell>{f.yearMonth}</TableCell>
                  <TableCell>{yen(f.baseSales)}</TableCell>
                  <TableCell>{f.feeRate}%</TableCell>
                  <TableCell className="font-bold text-emerald-700 dark:text-emerald-400">{yen(f.feeAmount)}</TableCell>
                  <TableCell><Badge variant="secondary">{feeByStatus[f.status] ?? f.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">月次レポート・請求予定額</CardTitle>
          <div className="text-right">
            <div className="text-xs text-slate-500">請求予定額 合計</div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{yen(totalForecast)}</div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>対象月</TableHead><TableHead>研修売上</TableHead><TableHead>報酬率</TableHead><TableHead>請求予定額</TableHead><TableHead>状態</TableHead></TableRow></TableHeader>
            <TableBody>
              {monthly.data?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-slate-400">データがありません</TableCell></TableRow>}
              {monthly.data?.map(m => (
                <TableRow key={m.yearMonth}>
                  <TableCell className="font-medium">{m.yearMonth}</TableCell>
                  <TableCell>{yen(m.trainingSales)}</TableCell>
                  <TableCell>{m.feeRate}%</TableCell>
                  <TableCell className="font-bold text-emerald-700 dark:text-emerald-400">{yen(m.feeAmount)}</TableCell>
                  <TableCell><Badge variant={m.status === "入金済" ? "default" : "secondary"} className={m.status === "入金済" ? "bg-emerald-600" : ""}>{m.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-2 text-xs text-slate-400">※ 請求予定額は「協業先の研修売上 × 報酬率」。助成金受給額には連動しません（FR-18）。</p>
        </CardContent>
      </Card>
    </div>
  );
}
