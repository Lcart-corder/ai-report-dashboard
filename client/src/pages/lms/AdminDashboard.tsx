import { trpc } from "@/lib/trpc";
import { LmsLayout } from "./LmsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, CheckCircle2, Clock, LogIn, FileQuestion, AlertTriangle, TrendingUp, Download, Sparkles } from "lucide-react";

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LmsAdminDashboard() {
  const utils = trpc.useUtils();
  const stats = trpc.lms.dashboard.useQuery(undefined);
  const seed = trpc.lms.seedDemo.useMutation({
    onSuccess: res => {
      if (res.seeded) {
        toast.success(`デモデータを投入しました（マスターキー: ${res.masterKey}）`);
        utils.lms.invalidate();
      } else {
        toast.info("既にデータがあるため投入をスキップしました");
      }
    },
    onError: e => toast.error(e.message),
  });
  const exportTenHour = trpc.lms.exports.tenHourCompletersCsv.useMutation({
    onSuccess: res => {
      downloadCsv("受講10時間以上修了者一覧.csv", res.csv);
      toast.success("CSVを出力しました");
    },
    onError: e => toast.error(e.message),
  });

  const s = stats.data;
  const cards = [
    { label: "受講者数", value: s?.learners ?? 0, icon: Users, color: "text-blue-600" },
    { label: "平均進捗率", value: `${s?.avgProgress ?? 0}%`, icon: TrendingUp, color: "text-emerald-600" },
    { label: "修了者数", value: s?.completed ?? 0, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "未修了者数", value: s?.incomplete ?? 0, icon: Clock, color: "text-amber-600" },
    { label: "未ログイン者", value: s?.neverLoggedIn ?? 0, icon: LogIn, color: "text-rose-600" },
    { label: "テスト未受験", value: s?.quizPending ?? 0, icon: FileQuestion, color: "text-purple-600" },
    { label: "期限切れリスク", value: s?.expiringSoon ?? 0, icon: AlertTriangle, color: "text-red-600" },
  ];

  return (
    <LmsLayout title="ダッシュボード" description="全体進捗・アラート・証跡出力（FR-13 / FR-15）">
      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => seed.mutate()} disabled={seed.isPending}>
          <Sparkles className="mr-1.5 h-4 w-4" /> デモデータ投入
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportTenHour.mutate({})} disabled={exportTenHour.isPending}>
          <Download className="mr-1.5 h-4 w-4" /> 受講10時間以上修了者一覧CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardContent className="p-4">
                <Icon className={`h-5 w-5 ${c.color}`} />
                <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{c.value}</div>
                <div className="mt-0.5 text-xs text-slate-500">{c.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">設計の要（7原則）</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-600 dark:text-slate-300">
              <li>受講者ごとのID管理</li>
              <li>企業別マスターキーによる登録制限</li>
              <li>LMSによる視聴・進捗ログ保存（改ざん不可）</li>
              <li>10時間以上・期間内修了の管理</li>
              <li>確認チェック・テスト・レポートによる修了判定</li>
              <li>修了証・LMS証跡・受講者一覧の出力</li>
              <li>協業先研修売上20%の成果報酬（助成金受給額に非連動）</li>
            </ol>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">はじめかた</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>1. 「デモデータ投入」で企業・コース・受講者のサンプルを作成</p>
            <p>2. 「企業・受講者」でマスターキー発行と受講者登録</p>
            <p>3. 「コース・教材」で動画レッスンと確認テストを設定</p>
            <p>4. 受講者フローで視聴→チェック→テスト→レポート→修了証を確認</p>
            <p className="text-xs text-slate-400">※ 数値表示にはデータベース接続（DATABASE_URL）が必要です。</p>
          </CardContent>
        </Card>
      </div>
    </LmsLayout>
  );
}
