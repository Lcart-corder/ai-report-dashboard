import { callClaude, routeComplexity, Complexity } from "./client";
import * as store from "./store";
import { AgentRun } from "../../drizzle/schema";

/**
 * 自己改善型AIエージェントの実行エンジン。
 *
 * 1タスクの流れ:
 *   route   — タスク複雑度を判定してモデルを選択(モデルルーティング)
 *   recall  — 永続化メモリと自動生成スキルを読み込んで文脈に注入
 *   generate → critique → revise — 目標スコアに達するまで自己修正ループ
 *   distill — 高評価の実行から再利用可能なスキルと教訓を蒸留(自己改善)
 *
 * 状態は各ステップごとにDBへ永続化されるため、フロントエンドは
 * ポーリングで進捗を追跡でき、プロセス再起動後も履歴が残る。
 * 予算上限(budgetUsd)を超えた時点でループは打ち切られる。
 */

export type TaskType = "report" | "copywriting" | "analysis" | "general";

const SCORE_PATTERN = /"score"\s*:\s*(\d{1,3})/;

type Critique = { score: number; feedback: string };

export function parseCritique(text: string): Critique {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { score?: number; feedback?: string };
      if (typeof parsed.score === "number") {
        return {
          score: Math.max(0, Math.min(100, Math.round(parsed.score))),
          feedback: parsed.feedback ?? "",
        };
      }
    }
  } catch {
    // fall through to regex
  }
  const m = text.match(SCORE_PATTERN);
  return { score: m ? Math.min(100, parseInt(m[1], 10)) : 0, feedback: text };
}

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

/** メインループ。呼び出し側は await せず、runId でポーリングする想定。 */
export async function executeAgentRun(runId: number): Promise<void> {
  const runRow = await store.getAgentRun(runId);
  if (!runRow) throw new Error(`Agent run ${runId} not found`);

  const budget = parseFloat(runRow.budgetUsd);
  const acc = { id: runId, costUsd: parseFloat(runRow.costUsd), inputTokens: runRow.inputTokens, outputTokens: runRow.outputTokens };

  const fail = async (status: AgentRun["status"], error?: string) => {
    await store.updateAgentRun(runId, { status, error: error ?? null, completedAt: new Date() });
  };

  try {
    await store.updateAgentRun(runId, { status: "running", startedAt: new Date() });

    // ---- 1. route: モデルルーティング ----
    const complexity: Complexity = await routeComplexity(runRow.task);
    const { MODEL_TIERS } = await import("./client");
    await store.updateAgentRun(runId, { complexity, model: MODEL_TIERS[complexity].model });
    await store.addAgentRunStep({
      runId,
      iteration: 0,
      stepType: "route",
      model: MODEL_TIERS[complexity].model,
      output: `complexity=${complexity}`,
    });

    // ---- 2. recall: メモリとスキルの注入 ----
    const taskType = runRow.taskType as TaskType;
    const [skills, memories] = await Promise.all([
      store.findSkillsForTask(taskType),
      store.recallAgentMemories(taskType),
    ]);
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

    const system = buildSystemPrompt({ taskType, skills, memories });

    // ---- 3. generate → critique → revise: 自己修正ループ ----
    let draft = "";
    let bestScore = 0;
    let lastFeedback = "";

    for (let iteration = 1; iteration <= runRow.maxIterations; iteration++) {
      await store.updateAgentRun(runId, { currentIteration: iteration });

      if (acc.costUsd >= budget) {
        await store.updateAgentRun(runId, {
          status: "budget_exceeded",
          output: draft || null,
          finalScore: bestScore || null,
          completedAt: new Date(),
        });
        return;
      }

      // 生成(初回) / 改訂(2回目以降)
      const isRevision = iteration > 1;
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

      if (acc.costUsd >= budget) {
        await store.updateAgentRun(runId, {
          status: "budget_exceeded",
          output: draft,
          finalScore: bestScore || null,
          completedAt: new Date(),
        });
        return;
      }

      // 批評(critique)— 常に standard ティアで実施し、生成モデルと独立に採点する
      const critiqueResult = await callClaude({
        complexity: "standard",
        maxTokens: 4000,
        system:
          "あなたは厳格な品質レビュアーです。成果物がタスク要求をどの程度満たすかを0〜100で採点し、" +
          '改善点を具体的に指摘してください。必ず {"score": <number>, "feedback": "<string>"} のJSONのみで回答してください。',
        userContent: `## タスク\n${runRow.task}\n\n## 成果物\n${draft}`,
      });
      await chargeStep(acc, critiqueResult);
      const critique = parseCritique(critiqueResult.text);
      bestScore = Math.max(bestScore, critique.score);
      lastFeedback = critique.feedback;
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

    await store.updateAgentRun(runId, {
      status: "completed",
      output: draft,
      finalScore: bestScore,
      completedAt: new Date(),
    });

    // ---- 4. distill: 自己改善(スキル・教訓の蒸留) ----
    // 目標スコアに達した実行からのみ学習する。失敗しても実行自体は成功扱い。
    if (bestScore >= runRow.targetScore) {
      try {
        await distillLearnings(runId, taskType, runRow.task, draft, bestScore, acc, budget);
      } catch (e) {
        console.warn(`[Agent] distill failed for run ${runId}:`, e);
      }
    }
  } catch (error) {
    console.error(`[Agent] run ${runId} failed:`, error);
    await fail("failed", error instanceof Error ? error.message : String(error));
  }
}

async function distillLearnings(
  runId: number,
  taskType: TaskType,
  task: string,
  output: string,
  score: number,
  acc: { id: number; costUsd: number; inputTokens: number; outputTokens: number },
  budget: number
): Promise<void> {
  if (acc.costUsd >= budget) return;

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
  if (parsed.skill?.name && parsed.skill.instructions) {
    generatedSkillId = await store.addAgentSkill({
      name: parsed.skill.name.slice(0, 128),
      description: parsed.skill.description ?? "",
      instructions: parsed.skill.instructions,
      taskType,
      sourceRunId: runId,
      avgScore: score,
    });
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
    output: result.text,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    costUsd: result.costUsd.toFixed(6),
  });
  if (generatedSkillId) {
    await store.updateAgentRun(runId, { generatedSkillId });
  }
}
