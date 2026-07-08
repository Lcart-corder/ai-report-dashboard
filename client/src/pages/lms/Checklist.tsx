import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

const ITEM_LABELS: Record<string, string> = {
  courseRegistered: "コース登録済み",
  standardTime10h: "標準学習時間10時間以上",
  trainingPeriodSet: "訓練期間設定済み",
  learnersRegistered: "対象者登録済み",
  coursesCompleted: "受講完了",
  quizPassed: "テスト合格",
  reportSubmitted: "レポート入力済み",
  certificateIssued: "修了証発行済み",
  lmsLogAvailable: "LMSログ出力可能",
  priceRegistered: "価格情報登録済み",
  advisorReviewed: "社労士確認済み",
};

export default function LmsChecklist() {
  const utils = trpc.useUtils();
  const companies = trpc.lms.companies.list.useQuery();
  const courses = trpc.lms.courses.list.useQuery();
  const [companyId, setCompanyId] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");

  const ready = companyId && courseId;
  const checklist = trpc.lms.checklist.compute.useQuery(
    { companyId: Number(companyId), courseId: Number(courseId) },
    { enabled: !!ready },
  );

  const setAdvisor = trpc.lms.checklist.setAdvisorReview.useMutation({
    onSuccess: () => { toast.success("社労士確認を更新しました"); checklist.refetch(); },
    onError: e => toast.error(e.message),
  });

  const items = checklist.data?.items;

  return (
    <LmsLayout title="申請準備チェックリスト" description="助成金申請に必要な証跡の充足状況を自動判定（FR-16）">
      <Card className="mb-6">
        <CardContent className="grid gap-3 p-4 md:grid-cols-2">
          <div>
            <Label>導入企業</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger><SelectValue placeholder="企業を選択" /></SelectTrigger>
              <SelectContent>{companies.data?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>コース</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger><SelectValue placeholder="コースを選択" /></SelectTrigger>
              <SelectContent>{courses.data?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!ready && <Card><CardContent className="p-12 text-center text-slate-400">企業とコースを選択してください。</CardContent></Card>}

      {ready && items && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">申請準備率</CardTitle>
            <div className="mt-2 flex items-center gap-3">
              <Progress value={checklist.data?.readyRate ?? 0} className="h-2" />
              <span className="text-lg font-bold">{checklist.data?.readyRate ?? 0}%</span>
            </div>
            <p className="text-xs text-slate-500">{checklist.data?.passed} / {checklist.data?.totalItems} 項目が充足</p>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {Object.entries(items).map(([key, val]) => (
                <li key={key} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-slate-700 dark:text-slate-200">{ITEM_LABELS[key] ?? key}</span>
                  {val
                    ? <span className="flex items-center gap-1 text-sm font-medium text-emerald-600"><CheckCircle2 className="h-4 w-4" /> ○</span>
                    : <span className="flex items-center gap-1 text-sm font-medium text-rose-500"><XCircle className="h-4 w-4" /> ×</span>}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setAdvisor.mutate({ companyId: Number(companyId), courseId: Number(courseId), reviewed: true })} disabled={setAdvisor.isPending}>
                <ShieldCheck className="mr-1.5 h-4 w-4" /> 社労士確認済みにする
              </Button>
              <Button variant="ghost" onClick={() => setAdvisor.mutate({ companyId: Number(companyId), courseId: Number(courseId), reviewed: false })} disabled={setAdvisor.isPending}>確認を取消</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </LmsLayout>
  );
}
