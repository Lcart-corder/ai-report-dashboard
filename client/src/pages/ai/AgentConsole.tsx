import { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Brain,
  CircleDollarSign,
  Loader2,
  Play,
  RefreshCw,
  Route,
  Sparkles,
  Wrench,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

type TaskType = "report" | "copywriting" | "analysis" | "general";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: "待機中", className: "bg-gray-100 text-gray-700" },
  running: { label: "実行中", className: "bg-blue-100 text-blue-700" },
  completed: { label: "完了", className: "bg-green-100 text-green-700" },
  failed: { label: "失敗", className: "bg-red-100 text-red-700" },
  budget_exceeded: { label: "予算上限", className: "bg-amber-100 text-amber-700" },
  escalated: { label: "要確認", className: "bg-orange-100 text-orange-700" },
  cancelled: { label: "キャンセル", className: "bg-gray-100 text-gray-500" },
};

// 品質ゲートプリセット(草稿 → レビュー → 本番)
const QUALITY_GATES = [
  { value: 70, label: "草稿 (70点)" },
  { value: 85, label: "レビュー (85点)" },
  { value: 93, label: "本番 (93点)" },
];

const RESUMABLE_STATUSES = ["failed", "budget_exceeded", "escalated"];

const STEP_LABELS: Record<string, string> = {
  route: "モデルルーティング",
  recall: "メモリ・スキル読込",
  generate: "生成",
  critique: "自己批評",
  revise: "改訂",
  distill: "スキル蒸留",
};

const TASK_TYPE_LABELS: Record<TaskType, string> = {
  report: "分析レポート",
  copywriting: "コピーライティング",
  analysis: "データ分析",
  general: "汎用",
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABELS[status] ?? STATUS_LABELS.pending;
  return <Badge className={s.className}>{s.label}</Badge>;
}

export default function AgentConsolePage() {
  const [task, setTask] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("general");
  const [maxIterations, setMaxIterations] = useState(3);
  const [targetScore, setTargetScore] = useState(85);
  const [budgetUsd, setBudgetUsd] = useState(0.5);
  const [activeRunId, setActiveRunId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const startMutation = trpc.agent.start.useMutation({
    onSuccess: data => {
      setActiveRunId(data.runId);
      utils.agent.listRuns.invalidate();
    },
  });

  const runQuery = trpc.agent.getRun.useQuery(
    { id: activeRunId ?? 0 },
    {
      enabled: activeRunId !== null,
      refetchInterval: query => {
        const status = query.state.data?.run?.status;
        return status === "pending" || status === "running" ? 2000 : false;
      },
    }
  );

  const resumeMutation = trpc.agent.resume.useMutation({
    onSuccess: data => {
      setActiveRunId(data.runId);
      utils.agent.getRun.invalidate({ id: data.runId });
      utils.agent.listRuns.invalidate();
    },
  });

  const runsQuery = trpc.agent.listRuns.useQuery();
  const memoriesQuery = trpc.agent.listMemories.useQuery();
  const skillsQuery = trpc.agent.listSkills.useQuery();

  const run = runQuery.data?.run;
  const steps = runQuery.data?.steps ?? [];
  const isActive = run?.status === "pending" || run?.status === "running";

  const handleStart = () => {
    if (!task.trim()) return;
    startMutation.mutate({ task, taskType, maxIterations, targetScore, budgetUsd });
  };

  return (
    <PageTemplate
      title="自己改善AIエージェント"
      description="自己修正ループ・永続メモリ・モデルルーティング・スキル自動生成を備えたエージェント実行基盤"
      breadcrumbs={[{ label: "AI", href: "/ai" }, { label: "エージェント" }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* タスク投入 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="h-5 w-5 text-blue-600" />
              新しいタスク
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>タスク内容</Label>
              <Textarea
                value={task}
                onChange={e => setTask(e.target.value)}
                placeholder="例: 今月のLINE配信結果を踏まえ、開封率を改善する次月の配信戦略レポートを作成してください"
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label>タスク種別</Label>
              <Select value={taskType} onValueChange={v => setTaskType(v as TaskType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">最大反復</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={maxIterations}
                  onChange={e => setMaxIterations(Number(e.target.value) || 3)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">品質ゲート</Label>
                <Select
                  value={String(targetScore)}
                  onValueChange={v => setTargetScore(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUALITY_GATES.map(gate => (
                      <SelectItem key={gate.value} value={String(gate.value)}>
                        {gate.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">予算 (USD)</Label>
                <Input
                  type="number"
                  min={0.01}
                  max={20}
                  step={0.1}
                  value={budgetUsd}
                  onChange={e => setBudgetUsd(Number(e.target.value) || 0.5)}
                />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleStart}
              disabled={startMutation.isPending || !task.trim()}
            >
              {startMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              実行開始
            </Button>
            {startMutation.error && (
              <p className="text-sm text-red-600">{startMutation.error.message}</p>
            )}
          </CardContent>
        </Card>

        {/* 実行モニター */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCw className={`h-5 w-5 text-blue-600 ${isActive ? "animate-spin" : ""}`} />
              実行モニター
            </CardTitle>
            {run && <StatusBadge status={run.status} />}
          </CardHeader>
          <CardContent>
            {!run ? (
              <div className="text-center py-12 text-gray-400">
                タスクを実行するか、下の履歴から選択してください
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                      <Route className="h-3 w-3" /> モデル
                    </div>
                    <div className="font-medium truncate">{run.model ?? "判定中..."}</div>
                    {run.complexity && (
                      <div className="text-xs text-gray-500">{run.complexity}</div>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                      <RefreshCw className="h-3 w-3" /> 反復
                    </div>
                    <div className="font-medium">
                      {run.currentIteration} / {run.maxIterations}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                      <Sparkles className="h-3 w-3" /> スコア
                    </div>
                    <div className="font-medium">
                      {run.finalScore ?? "—"} / 目標 {run.targetScore}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                      <CircleDollarSign className="h-3 w-3" /> コスト
                    </div>
                    <div className="font-medium">
                      ${Number(run.costUsd).toFixed(4)}
                    </div>
                    <Progress
                      className="h-1 mt-1"
                      value={Math.min(100, (Number(run.costUsd) / Number(run.budgetUsd)) * 100)}
                    />
                  </div>
                </div>

                {/* ステップタイムライン */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {steps.map(step => (
                    <div key={step.id} className="flex items-start gap-3 text-sm border-l-2 border-blue-200 pl-3 py-1">
                      <Badge variant="outline" className="shrink-0">
                        {step.iteration > 0 ? `#${step.iteration} ` : ""}
                        {STEP_LABELS[step.stepType] ?? step.stepType}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-600 truncate">{step.output ?? ""}</p>
                        <p className="text-xs text-gray-400">
                          {step.model ?? ""}
                          {step.score !== null && ` ・ スコア ${step.score}`}
                          {Number(step.costUsd) > 0 && ` ・ $${Number(step.costUsd).toFixed(4)}`}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isActive && (
                    <div className="flex items-center gap-2 text-sm text-gray-400 pl-3">
                      <Loader2 className="h-3 w-3 animate-spin" /> 実行中...
                    </div>
                  )}
                </div>

                {run.error && (
                  <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">{run.error}</div>
                )}
                {RESUMABLE_STATUSES.includes(run.status) && (
                  <div className="flex items-center gap-3 bg-orange-50 rounded-lg p-3">
                    <p className="text-sm text-orange-700 flex-1">
                      {run.status === "escalated"
                        ? "目標スコア未達のため人間の確認待ちです。内容を確認のうえ、反復を追加して再開できます。"
                        : "チェックポイントから途中再開できます。"}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={resumeMutation.isPending}
                      onClick={() =>
                        resumeMutation.mutate({
                          id: run.id,
                          additionalBudgetUsd: run.status === "budget_exceeded" ? 0.5 : 0,
                          additionalIterations: 2,
                        })
                      }
                    >
                      {resumeMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-1" />
                      )}
                      再開 (+2反復{run.status === "budget_exceeded" ? " / +$0.50" : ""})
                    </Button>
                  </div>
                )}
                {run.output && (
                  <div className="space-y-1">
                    <Label>成果物</Label>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">
                      {run.output}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 履歴・メモリ・スキル */}
      <Tabs defaultValue="runs" className="mt-6">
        <TabsList>
          <TabsTrigger value="runs">実行履歴</TabsTrigger>
          <TabsTrigger value="skills">
            <Wrench className="h-4 w-4 mr-1" />
            自動生成スキル ({skillsQuery.data?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="memories">
            <Brain className="h-4 w-4 mr-1" />
            永続メモリ ({memoriesQuery.data?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="runs">
          <Card>
            <CardContent className="pt-6">
              {(runsQuery.data ?? []).length === 0 ? (
                <p className="text-center text-gray-400 py-6">まだ実行履歴がありません</p>
              ) : (
                <div className="divide-y">
                  {(runsQuery.data ?? []).map(r => (
                    <button
                      key={r.id}
                      className="w-full text-left py-3 flex items-center gap-3 hover:bg-gray-50 px-2 rounded"
                      onClick={() => setActiveRunId(r.id)}
                    >
                      <StatusBadge status={r.status} />
                      <span className="flex-1 truncate text-sm">{r.task}</span>
                      <span className="text-xs text-gray-400 shrink-0">
                        {r.model ?? ""} ・ ${Number(r.costUsd).toFixed(4)}
                        {r.finalScore !== null && ` ・ ${r.finalScore}点`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardContent className="pt-6">
              {(skillsQuery.data ?? []).length === 0 ? (
                <p className="text-center text-gray-400 py-6">
                  目標スコアに達した実行から、スキルが自動生成されます
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(skillsQuery.data ?? []).map(skill => (
                    <div key={skill.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{skill.name}</h4>
                        <Badge variant="outline">{TASK_TYPE_LABELS[skill.taskType as TaskType]}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{skill.description}</p>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-4">
                        {skill.instructions}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        使用 {skill.useCount}回
                        {skill.avgScore !== null && ` ・ 平均 ${skill.avgScore}点`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memories">
          <Card>
            <CardContent className="pt-6">
              {(memoriesQuery.data ?? []).length === 0 ? (
                <p className="text-center text-gray-400 py-6">
                  実行が完了すると、学習した教訓がここに蓄積されます
                </p>
              ) : (
                <div className="divide-y">
                  {(memoriesQuery.data ?? []).map(memory => (
                    <div key={memory.id} className="py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{memory.category}</Badge>
                        <h4 className="font-medium text-sm">{memory.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{memory.content}</p>
                      <p className="text-xs text-gray-400 mt-1">参照 {memory.useCount}回</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}
