import { callClaude, complexityForModel, routeComplexity, Complexity, MODEL_TIERS } from "./client";
import * as store from "./store";
import { AgentRun, AgentRunStep } from "../../drizzle/schema";

/**
 * 自己改善型AIエージェントの実行エンジン。
 *
 * 1タスクの流れ:
 *   route   — タスク複雑度と過去の成功統計からモデルを選択(自己最適化ルーティング)
 *   recall  — 永続化メモリと自動生成スキルを読み込んで文脈に注入
 *   generate → critique → revise — 多基準の重み付き検証による自己修正ループ
 *             (検証時に当初目標との整合度も測定し、ドリフトを検出したら軌道修正)
 *   distill — 同種タスクの成功が閾値(3回以上)に達したらスキルを蒸留(自己改善)
 *
 * 目標スコアに達しないまま最大反復を使い切った場合は自動完了とせず
 * escalated(人間の確認待ち)で停止する。状態は各ステップごとにDBへ
 * 永続化されるため、失敗・予算超過・エスカレーション後は途中から再開できる。
 */

export type TaskType = "report" | "copywriting" | "analysis" | "general";

// ---- 多基準検証 (Verification Engine) ----

export type Criterion = { name: string; label: string; weight: number };

/** タスク種別ごとの検証基準セット。重みの合計は1.0。 */
export const VERIFICATION_CRITERIA: Record<TaskType, Criterion[]> = {
  report: [
    { name: "factual_accuracy", label: "事実の正確性", weight: 0.35 },
    { name: "logical_consistency", label: "論理的整合性", weight: 0.3 },
    { name: "completeness", label: "網羅性", weight: 0.2 },
    { name: "actionability", label: "実行可能性", weight: 0.15 },
  ],
  analysis: [
    { name: "factual_accuracy", label: "事実の正確性", weight: 0.35 },
    { name: "logical_consistency", label: "論理的整合性", weight: 0.3 },
    { name: "completeness", label: "網羅性", weight: 0.2 },
    { name: "actionability", label: "実行可能性", weight: 0.15 },
  ],
  copywriting: [
    { name: "key_points_covered", label: "要点の網羅", weight: 0.4 },
    { name: "tone_appropriate", label: "トーンの適切さ", weight: 0.25 },
    { name: "grammar_correct", label: "文法の正確性", weight: 0.2 },
    { name: "length_appropriate", label: "長さの適切さ", weight: 0.15 },
  ],
  general: [
    { name: "task_fulfillment", label: "タスク達成度", weight: 0.5 },
    { name: "quality", label: "品質", weight: 0.3 },
    { name: "clarity", label: "明瞭さ", weight: 0.2 },
  ],
};

const DRIFT_THRESHOLD = 0.7; // 整合度がこれを下回ったらドリフトと判定
const SKILL_MIN_SUCCESSES = 3; // スキル化に必要な同種タスクの最小成功回数

export type Critique = {
  score: number; // 重み付き総合スコア (0-100)
  feedback: string;
  alignment: number; // 当初目標との整合度 (0-1)
  criteriaScores: Record<string, number>;
};

const SCORE_PATTERN = /"score"\s*:\s*(\d{1,3})/;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function parseCritique(text: string, criteria?: Criterion[]): Critique {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as {
        score?: number;
        feedback?: string;
        alignment?: number;
        criteria?: Record<string, number>;
      };
      const criteriaScores: Record<string, number> = {};
      let score: number | null = null;

      // 多基準の重み付き総合スコアを優先
      if (criteria && parsed.criteria && typeof parsed.criteria === "object") {
        let weighted = 0;
        let weightSum = 0;
        for (const c of criteria) {
          const v = parsed.criteria[c.name];
          if (typeof v === "number") {
            const s = clamp(Math.round(v), 0, 100);
            criteriaScores[c.name] = s;
            weighted += s * c.weight;
            weightSum += c.weight;
          }
        }
        if (weightSum > 0) score = Math.round(weighted / weightSum);
      }
      if (score === null && typeof parsed.score === "number") {
        score = clamp(Math.round(parsed.score), 0, 100);
      }
      if (score !== null) {
        return {
          score,
          feedback: parsed.feedback ?? "",
          alignment:
            typeof parsed.alignment === "number" ? clamp(parsed.alignment, 0, 1) : 1,
          criteriaScores,
        };
      }
    }
  } catch {
    // fall through to regex
  }
  const m = text.match(SCORE_PATTERN);
  return {
    score: m ? Math.min(100, parseInt(m[1], 10)) : 0,
    feedback: text,
    alignment: 1,
    criteriaScores: {},
  };
}

function buildCritiqueSystemPrompt(criteria: Criterion[]): string {
  const criteriaList = criteria
    .map(c => `  - ${c.name} (${c.label}、重み ${c.weight})`)
    .join("\n");
  return (
    "あなたは厳格な品質レビュアーです。感情的な評価をせず、数値とエビデンスで評価してください。\n" +
    "成果物を以下の基準ごとに0〜100で採点し、当初のタスク目標との整合度(alignment)を0〜1で評価してください。\n" +
    `【検証基準】\n${criteriaList}\n` +
    "改善点は抽象的なフィードバックではなく、具体的な修正指示として書いてください。\n" +
    '必ず次のJSONのみで回答してください:\n' +
    '{"criteria": {"<基準名>": <0-100>, ...}, "alignment": <0-1>, "feedback": "<具体的な改善指示>"}'
  );
}

// ---- システムプロンプト構築 (コンテキスト注入) ----

function buildSystemPrompt(params: {
  taskType: TaskType;
  skills: { name: string; instructions: string }[];
  memories: { title: string; content: string }[];
}): string {
  const sections = [
    "あなたはEC・LINEマーケティングSaaS「Lカート」のAIアシスタントです。",
    "依頼されたタスクの成果物のみを出力してください。前置きやメタ的な説明は不要です。",
  ];
  if (params.skills.length > 0) {
    sections.push(
      "## 利用可能なスキル(過去の成功実行から自動生成された手順)\n" +
        params.skills.map(s => `### ${s.name}\n${s.instructions}`).join("\n\n")
    );
  }
  if (params.memories.length > 0) {
    sections.push(
      "## 記憶(過去の実行から学習した教訓)\n" +
        params.memories.map(m => `- ${m.title}: ${m.content}`).join("\n")
    );
  }
  return sections.join("\n\n");
}

async function chargeStep(
  run: { id: number; costUsd: number; inputTokens: number; outputTokens: number },
  result: { inputTokens: number; outputTokens: number; costUsd: number }
) {
  run.costUsd += result.costUsd;
  run.inputTokens += result.inputTokens;
  run.outputTokens += result.outputTokens;
  await store.updateAgentRun(run.id, {
    costUsd: run.costUsd.toFixed(6),
    inputTokens: run.inputTokens,
    outputTokens: run.outputTokens,
  });
}

// ---- Router自己最適化 ----

/**
 * ヒューリスティック判定に、過去の成功統計(エピソード記憶)を重ねる。
 * 同種タスクで3回以上・平均85点以上の実績があるモデルはそれを優先する。
 */
async function routeWithLearning(
  task: string,
  taskType: string
): Promise<{ complexity: Complexity; reasoning: string }> {
  const heuristic = await routeComplexity(task);
  try {
    const stats = await store.getModelStatsForTaskType(taskType);
    const proven = stats
      .filter(s => s.count >= 3 && s.avgScore >= 85)
      .sort((a, b) => b.avgScore - a.avgScore)[0];
    if (proven) {
      const learned = complexityForModel(proven.model);
      if (learned && learned !== heuristic) {
        return {
          complexity: learned,
          reasoning: `learned: ${proven.model} (${proven.count}回実行, 平均${Math.round(proven.avgScore)}点) を優先 / ヒューリスティック判定=${heuristic}`,
        };
      }
    }
  } catch {
    // 統計取得に失敗してもヒューリスティック判定で続行
  }
  return { complexity: heuristic, reasoning: `heuristic: complexity=${heuristic}` };
}

// ---- チェックポイント再開 ----

/** 既存ステップから自己修正ループの途中状態を復元する。 */
export function restoreLoopState(steps: AgentRunStep[]): {
  draft: string;
  lastFeedback: string;
  bestScore: number;
  lastIteration: number;
} {
  let draft = "";
  let lastFeedback = "";
  let bestScore = 0;
  let lastIteration = 0;
  for (const step of steps) {
    if ((step.stepType === "generate" || step.stepType === "revise") && step.output) {
      draft = step.output;
      lastIteration = Math.max(lastIteration, step.iteration);
    }
    if (step.stepType === "critique") {
      if (step.score !== null) bestScore = Math.max(bestScore, step.score);
      if (step.output) lastFeedback = parseCritique(step.output).feedback;
      lastIteration = Math.max(lastIteration, step.iteration);
    }
  }
  return { draft, lastFeedback, bestScore, lastIteration };
}

// ---- メインループ ----

/** 呼び出し側は await せず、runId でポーリングする想定。再開時も同じ関数を使う。 */
export async function executeAgentRun(runId: number): Promise<void> {
  const runRow = await store.getAgentRun(runId);
  if (!runRow) throw new Error(`Agent run ${runId} not found`);

  const budget = parseFloat(runRow.budgetUsd);
  const acc = {
    id: runId,
    costUsd: parseFloat(runRow.costUsd),
    inputTokens: runRow.inputTokens,
    outputTokens: runRow.outputTokens,
  };

  const finish = async (
    status: AgentRun["status"],
    extra: { output?: string | null; finalScore?: number | null; error?: string | null } = {}
  ) => {
    await store.updateAgentRun(runId, {
      status,
      completedAt: new Date(),
      ...extra,
    });
  };

  try {
    await store.updateAgentRun(runId, {
      status: "running",
      error: null,
      startedAt: runRow.startedAt ?? new Date(),
    });

    const taskType = runRow.taskType as TaskType;
    const existingSteps = await store.listAgentRunSteps(runId);
    const isResume = existingSteps.some(
      s => s.stepType === "generate" || s.stepType === "revise"
    );

    // ---- 1. route: 自己最適化ルーティング(再開時は前回の判定を引き継ぐ) ----
    let complexity: Complexity;
    if (isResume && runRow.complexity) {
      complexity = runRow.complexity as Complexity;
    } else {
      const routed = await routeWithLearning(runRow.task, taskType);
      complexity = routed.complexity;
      await store.updateAgentRun(runId, {
        complexity,
        model: MODEL_TIERS[complexity].model,
      });
      await store.addAgentRunStep({
        runId,
        iteration: 0,
        stepType: "route",
        model: MODEL_TIERS[complexity].model,
        output: routed.reasoning,
      });
    }

    // ---- 2. recall: メモリとスキルの注入 ----
    const [skills, memories] = await Promise.all([
      store.findSkillsForTask(taskType),
      store.recallAgentMemories(taskType),
    ]);
    if (!isResume) {
      await Promise.all([
        store.bumpSkillUseCounts(skills.map(s => s.id)),
        store.bumpMemoryUseCounts(memories.map(m => m.id)),
      ]);
      await store.updateAgentRun(runId, {
        usedSkillIds: skills.map(s => s.id),
        usedMemoryIds: memories.map(m => m.id),
      });
      await store.addAgentRunStep({
        runId,
        iteration: 0,
        stepType: "recall",
        output: `skills=[${skills.map(s => s.name).join(", ")}] memories=${memories.length}件`,
      });
    }

    const system = buildSystemPrompt({ taskType, skills, memories });
    const criteria = VERIFICATION_CRITERIA[taskType];

    // ---- 3. generate → critique → revise: 自己修正ループ ----
    // 再開時はチェックポイント(既存ステップ)から途中状態を復元する
    const restored = isResume
      ? restoreLoopState(existingSteps)
      : { draft: "", lastFeedback: "", bestScore: 0, lastIteration: 0 };
    let { draft, lastFeedback, bestScore } = restored;

    const stopOnBudget = async (): Promise<boolean> => {
      if (acc.costUsd < budget) return false;
      await finish("budget_exceeded", {
        output: draft || null,
        finalScore: bestScore || null,
      });
      return true;
    };

    for (
      let iteration = restored.lastIteration + 1;
      iteration <= runRow.maxIterations;
      iteration++
    ) {
      await store.updateAgentRun(runId, { currentIteration: iteration });
      if (await stopOnBudget()) return;

      // 生成(初回) / 改訂(2回目以降・再開時)
      const isRevision = draft.length > 0;
      const genResult = await callClaude({
        complexity,
        system,
        userContent: isRevision
          ? `以下の成果物をレビュー結果に基づいて改善してください。改善後の成果物全体のみを出力してください。\n\n## タスク\n${runRow.task}\n\n## 現在の成果物\n${draft}\n\n## レビュー結果\n${lastFeedback}`
          : runRow.task,
      });
      draft = genResult.text;
      await chargeStep(acc, genResult);
      await store.addAgentRunStep({
        runId,
        iteration,
        stepType: isRevision ? "revise" : "generate",
        model: genResult.model,
        output: draft,
        inputTokens: genResult.inputTokens,
        outputTokens: genResult.outputTokens,
        costUsd: genResult.costUsd.toFixed(6),
      });

      if (await stopOnBudget()) return;

      // 批評(critique)— 生成モデルと独立に standard ティアで多基準採点する
      const critiqueResult = await callClaude({
        complexity: "standard",
        maxTokens: 4000,
        system: buildCritiqueSystemPrompt(criteria),
        userContent: `## タスク(当初目標)\n${runRow.task}\n\n## 成果物\n${draft}`,
      });
      await chargeStep(acc, critiqueResult);
      const critique = parseCritique(critiqueResult.text, criteria);
      bestScore = Math.max(bestScore, critique.score);
      lastFeedback = critique.feedback;

      // コンテキストドリフト監視: 当初目標との整合度が低い場合は軌道修正を注入
      if (critique.alignment < DRIFT_THRESHOLD) {
        lastFeedback =
          `【重要: 目標からの逸脱を検出(整合度 ${critique.alignment.toFixed(2)})】\n` +
          `当初のタスク目標に立ち返り、要求されていない方向への展開を削除してください。\n\n` +
          lastFeedback;
      }

      await store.addAgentRunStep({
        runId,
        iteration,
        stepType: "critique",
        model: critiqueResult.model,
        output: critiqueResult.text,
        score: critique.score,
        inputTokens: critiqueResult.inputTokens,
        outputTokens: critiqueResult.outputTokens,
        costUsd: critiqueResult.costUsd.toFixed(6),
      });

      if (critique.score >= runRow.targetScore) break;
    }

    // ---- 4. 終了判定: 目標未達は自動完了せずエスカレーション ----
    if (bestScore < runRow.targetScore) {
      await finish("escalated", {
        output: draft || null,
        finalScore: bestScore || null,
        error: `目標スコア${runRow.targetScore}に未達(最高${bestScore}点)。人間の確認が必要です。`,
      });
      return;
    }

    await finish("completed", { output: draft, finalScore: bestScore, error: null });

    // ---- 5. distill: 自己改善(スキル・教訓の蒸留) ----
    try {
      await distillLearnings(runId, taskType, runRow.task, draft, bestScore, acc, budget, runRow.targetScore);
    } catch (e) {
      console.warn(`[Agent] distill failed for run ${runId}:`, e);
    }
  } catch (error) {
    console.error(`[Agent] run ${runId} failed:`, error);
    await finish("failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// ---- distill: スキル・教訓の蒸留 ----

async function distillLearnings(
  runId: number,
  taskType: TaskType,
  task: string,
  output: string,
  score: number,
  acc: { id: number; costUsd: number; inputTokens: number; outputTokens: number },
  budget: number,
  targetScore: number
): Promise<void> {
  if (acc.costUsd >= budget) return;

  // 教訓(メモリ)は成功のたびに蓄積するが、スキル化には閾値ゲートを設ける:
  // 同種タスクで3回以上の成功実績があって初めてパターンとして信頼できる
  const successCount = await store.countSuccessfulRuns(taskType, targetScore);
  const shouldCreateSkill = successCount >= SKILL_MIN_SUCCESSES;

  const result = await callClaude({
    complexity: "light",
    maxTokens: 2000,
    system:
      "あなたはAIエージェントの自己改善モジュールです。成功したタスク実行から、同種のタスクに再利用できる" +
      "「スキル」(手順書)と「教訓」を抽出してください。必ず次のJSONのみで回答してください:\n" +
      '{"skill": {"name": "<スキル名(50文字以内)>", "description": "<1行説明>", "instructions": "<手順(箇条書き)>"}, ' +
      '"lesson": {"title": "<教訓タイトル>", "content": "<教訓の内容(1〜2文)>"}}',
    userContent: `## タスク種別\n${taskType}\n\n## タスク\n${task}\n\n## 成果物(スコア: ${score}点)\n${output.slice(0, 6000)}`,
  });
  await chargeStep(acc, result);

  const jsonMatch = result.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return;
  const parsed = JSON.parse(jsonMatch[0]) as {
    skill?: { name?: string; description?: string; instructions?: string };
    lesson?: { title?: string; content?: string };
  };

  let generatedSkillId: number | null = null;
  let skillNote = `成功回数 ${successCount}/${SKILL_MIN_SUCCESSES}`;

  if (shouldCreateSkill && parsed.skill?.name && parsed.skill.instructions) {
    // 既存スキルとの重複チェック(名前の部分一致で簡易判定)
    const existing = await store.findSkillsForTask(taskType, 20);
    const proposedName = parsed.skill.name.slice(0, 128);
    const isDuplicate = existing.some(
      s => s.name.includes(proposedName) || proposedName.includes(s.name)
    );
    if (!isDuplicate) {
      generatedSkillId = await store.addAgentSkill({
        name: proposedName,
        description: parsed.skill.description ?? "",
        instructions: parsed.skill.instructions,
        taskType,
        sourceRunId: runId,
        avgScore: score,
      });
      skillNote = `スキル生成: ${proposedName}`;
    } else {
      skillNote = `重複スキルのため生成スキップ: ${proposedName}`;
    }
  }

  if (parsed.lesson?.title && parsed.lesson.content) {
    await store.addAgentMemory({
      category: "lesson",
      taskType,
      title: parsed.lesson.title.slice(0, 256),
      content: parsed.lesson.content,
      sourceRunId: runId,
    });
  }

  await store.addAgentRunStep({
    runId,
    iteration: 0,
    stepType: "distill",
    model: result.model,
    output: `${skillNote}\n${result.text}`,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    costUsd: result.costUsd.toFixed(6),
  });
  if (generatedSkillId) {
    await store.updateAgentRun(runId, { generatedSkillId });
  }
}
