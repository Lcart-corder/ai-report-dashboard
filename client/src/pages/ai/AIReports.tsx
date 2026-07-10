import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Sparkles,
  FileText,
  Calendar,
  Eye,
  Plus,
  CircleDollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// レポートタイプ → タスク文への埋め込み。表示用のtitle/typeはtaskテキストから復元する。
const REPORT_TYPE_LABELS: Record<string, string> = {
  weekly: "週次レポート",
  monthly: "月次レポート",
  custom: "カスタムレポート",
};

const TYPE_MARKER = /<!--type:(weekly|monthly|custom)-->/;

function parseReportTask(task: string): { title: string; type: string } {
  const typeMatch = task.match(TYPE_MARKER);
  const title = task.split("\n")[0].trim() || "無題のレポート";
  return { title, type: typeMatch?.[1] ?? "custom" };
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />完了
        </Badge>
      );
    case "pending":
    case "running":
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          <Clock className="w-3 h-3 mr-1" />生成中
        </Badge>
      );
    case "escalated":
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-200">
          <HelpCircle className="w-3 h-3 mr-1" />要確認
        </Badge>
      );
    default:
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <AlertCircle className="w-3 h-3 mr-1" />失敗
        </Badge>
      );
  }
}

export default function AIReportsPage() {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);

  // Form state
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState<string>("weekly");
  const [reportFocus, setReportFocus] = useState("");

  const utils = trpc.useUtils();

  // 実行中のレポートがあれば自動更新し続ける
  const runsQuery = trpc.agent.listRuns.useQuery(undefined, {
    refetchInterval: query => {
      const hasActive = (query.state.data ?? []).some(
        r =>
          (r.taskType === "report" || r.taskType === "analysis") &&
          (r.status === "pending" || r.status === "running")
      );
      return hasActive ? 3000 : false;
    },
  });

  const reports = (runsQuery.data ?? [])
    .filter(r => r.taskType === "report" || r.taskType === "analysis")
    .map(r => ({ run: r, ...parseReportTask(r.task) }));

  const selectedRun = reports.find(r => r.run.id === selectedRunId)?.run;
  const selectedRunDetailQuery = trpc.agent.getRun.useQuery(
    { id: selectedRunId ?? 0 },
    { enabled: selectedRunId !== null }
  );

  const startMutation = trpc.agent.start.useMutation({
    onSuccess: () => {
      toast.success("レポート生成を開始しました", {
        description: "完了まで数分かかる場合があります",
      });
      setIsGenerateDialogOpen(false);
      setReportTitle("");
      setReportFocus("");
      utils.agent.listRuns.invalidate();
    },
    onError: () => toast.error("レポート生成の開始に失敗しました"),
  });

  const handleGenerate = () => {
    if (!reportTitle.trim()) {
      toast.error("レポートタイトルを入力してください");
      return;
    }
    const typeLabel = REPORT_TYPE_LABELS[reportType];
    startMutation.mutate({
      task:
        `${reportTitle}\n\n` +
        `あなたはLINE公式アカウント・Shopify連携ECサイト「Lカート」のビジネス分析担当です。\n` +
        `以下の観点で${typeLabel}を作成してください。\n\n` +
        `【レポート種別】${typeLabel}\n` +
        (reportFocus.trim() ? `【重点分析軸】${reportFocus}\n\n` : "\n") +
        `【出力形式】\n` +
        `- サマリー(300字程度)\n` +
        `- 主要な洞察(3〜5点、箇条書き)\n` +
        `- 推奨アクション(3〜5点、箇条書き。それぞれ具体的な実行手段を含める)\n\n` +
        `<!--type:${reportType}-->`,
      taskType: "report",
      maxIterations: 3,
      targetScore: 85,
      budgetUsd: 1.0,
    });
  };

  const handleView = (runId: number) => {
    setSelectedRunId(runId);
    setIsViewDialogOpen(true);
  };

  return (
    <PageTemplate
      title="AI分析レポート"
      description="自己改善型AIエージェントが生成するビジネス分析レポートを確認・管理します。"
      breadcrumbs={[{ label: "AI" }, { label: "分析レポート" }]}
      actions={
        <Button
          onClick={() => setIsGenerateDialogOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          新規レポート生成
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Reports List */}
        <div className="grid grid-cols-1 gap-4">
          {reports.map(({ run, title, type }) => (
            <Card key={run.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold">{title}</h3>
                      {getStatusBadge(run.status)}
                      <Badge variant="outline">{REPORT_TYPE_LABELS[type] ?? type}</Badge>
                    </div>

                    {run.status === "completed" && run.output && (
                      <>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{run.output}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-4 h-4" />
                            品質スコア {run.finalScore}点
                          </span>
                          <span className="flex items-center gap-1">
                            <CircleDollarSign className="w-4 h-4" />
                            ${Number(run.costUsd).toFixed(4)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(run.createdAt).toLocaleString("ja-JP")}
                          </span>
                        </div>
                      </>
                    )}

                    {(run.status === "pending" || run.status === "running") && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">
                          AIがレポートを生成しています... ({run.currentIteration}/{run.maxIterations}回目)
                        </span>
                      </div>
                    )}

                    {run.status === "escalated" && (
                      <p className="text-sm text-orange-600">{run.error ?? "目標品質に届かず確認が必要です"}</p>
                    )}
                    {run.status === "failed" && (
                      <p className="text-sm text-red-600">{run.error ?? "生成に失敗しました"}</p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => handleView(run.id)}>
                      <Eye className="w-4 h-4 mr-1" />
                      表示
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {reports.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">レポートがありません</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                AIが自動でビジネス分析レポートを生成します。
                まずは新規レポートを作成してみましょう。
              </p>
              <Button
                onClick={() => setIsGenerateDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                新規レポート生成
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Generate Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              新規レポート生成
            </DialogTitle>
            <DialogDescription>
              自己改善型AIエージェントが目標品質(85点)に達するまで自動で推敲を重ねてレポートを生成します。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">レポートタイトル</Label>
              <Input
                id="title"
                placeholder="例: 2024年1月第3週 売上分析レポート"
                value={reportTitle}
                onChange={e => setReportTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="type">レポートタイプ</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="focus">分析の焦点（任意）</Label>
              <Textarea
                id="focus"
                placeholder="例: カート放棄率の改善、新規顧客獲得施策の効果測定"
                value={reportFocus}
                onChange={e => setReportFocus(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                特定のテーマに焦点を当てたい場合は入力してください。
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGenerateDialogOpen(false)}
              disabled={startMutation.isPending}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={startMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
              {startMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  開始中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  レポート生成
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRun ? parseReportTask(selectedRun.task).title : ""}</DialogTitle>
            <DialogDescription>
              {selectedRun && new Date(selectedRun.createdAt).toLocaleString("ja-JP")} に生成
              {selectedRun?.status === "completed" && ` ・ 品質スコア ${selectedRun.finalScore}点`}
            </DialogDescription>
          </DialogHeader>

          {selectedRun?.output && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                {selectedRun.output}
              </div>
              {selectedRunDetailQuery.data?.steps && selectedRunDetailQuery.data.steps.length > 0 && (
                <details className="text-xs text-gray-500">
                  <summary className="cursor-pointer">生成プロセスの詳細を表示</summary>
                  <div className="mt-2 space-y-1">
                    {selectedRunDetailQuery.data.steps.map(step => (
                      <div key={step.id}>
                        [{step.stepType}] {step.score !== null ? `スコア${step.score}点` : ""}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
          {!selectedRun?.output && (
            <p className="py-8 text-center text-gray-400 text-sm">
              まだ成果物がありません(生成中またはエラー)
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
