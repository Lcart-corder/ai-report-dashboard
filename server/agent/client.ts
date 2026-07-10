import Anthropic from "@anthropic-ai/sdk";

/**
 * Claude API クライアントとモデルルーティング。
 *
 * タスク複雑度に応じて3ティアのモデルを自動選択する:
 *   light    → Haiku 4.5   (定型・短文タスク)
 *   standard → Opus 4.8    (通常の生成・分析)
 *   heavy    → Fable 5     (長考が必要な高難度タスク。ポリシー拒否時は Opus 4.8 に自動フォールバック)
 */

export type Complexity = "light" | "standard" | "heavy";

export const MODEL_TIERS: Record<
  Complexity,
  { model: string; inputUsdPerMTok: number; outputUsdPerMTok: number }
> = {
  light: { model: "claude-haiku-4-5", inputUsdPerMTok: 1, outputUsdPerMTok: 5 },
  standard: { model: "claude-opus-4-8", inputUsdPerMTok: 5, outputUsdPerMTok: 25 },
  heavy: { model: "claude-fable-5", inputUsdPerMTok: 10, outputUsdPerMTok: 50 },
};

const FALLBACK_MODEL = "claude-opus-4-8";

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured. Set it in the environment to enable the AI agent."
    );
  }
  if (!_client) {
    _client = new Anthropic();
  }
  return _client;
}

export type ClaudeCallResult = {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  stopReason: string | null;
};

function computeCost(model: string, inputTokens: number, outputTokens: number): number {
  const tier =
    Object.values(MODEL_TIERS).find(t => t.model === model) ?? MODEL_TIERS.standard;
  return (
    (inputTokens / 1_000_000) * tier.inputUsdPerMTok +
    (outputTokens / 1_000_000) * tier.outputUsdPerMTok
  );
}

/**
 * 1回のメッセージ呼び出し。ストリーミングで実行し完了メッセージを返す。
 * Fable 5 のポリシー拒否(stop_reason: "refusal")はサーバーサイドフォールバックで
 * Opus 4.8 に自動的に引き継がれる。
 */
export async function callClaude(params: {
  complexity: Complexity;
  system: string;
  userContent: string;
  maxTokens?: number;
}): Promise<ClaudeCallResult> {
  const client = getAnthropicClient();
  const tier = MODEL_TIERS[params.complexity];
  const isFable = tier.model === "claude-fable-5";

  const stream = client.beta.messages.stream({
    model: tier.model,
    max_tokens: params.maxTokens ?? 16000,
    system: [
      {
        type: "text",
        text: params.system,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: params.userContent }],
    ...(isFable
      ? {
          betas: ["server-side-fallback-2026-06-01"],
          fallbacks: [{ model: FALLBACK_MODEL }],
        }
      : tier.model === "claude-opus-4-8"
        ? { thinking: { type: "adaptive" } }
        : {}),
  });

  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") {
    throw new Error(
      `Claude declined the request (refusal${message.stop_details?.category ? `: ${message.stop_details.category}` : ""})`
    );
  }

  const text = message.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map(b => b.text)
    .join("");

  const inputTokens =
    message.usage.input_tokens +
    (message.usage.cache_creation_input_tokens ?? 0) +
    (message.usage.cache_read_input_tokens ?? 0);
  const outputTokens = message.usage.output_tokens;

  return {
    text,
    model: message.model,
    inputTokens,
    outputTokens,
    costUsd: computeCost(message.model, inputTokens, outputTokens),
    stopReason: message.stop_reason,
  };
}

/**
 * タスク複雑度の自動判定(モデルルーティング)。
 * まずヒューリスティックで判定し、判定が曖昧な場合のみ Haiku で分類する。
 */
export async function routeComplexity(task: string): Promise<Complexity> {
  const len = task.length;
  // 明確なケースはAPI呼び出しなしで即決(コスト最適化)
  if (len < 80) return "light";
  if (len > 1500) return "heavy";

  try {
    const result = await callClaude({
      complexity: "light",
      maxTokens: 16,
      system:
        "You are a task-complexity classifier. Reply with exactly one word: light, standard, or heavy. " +
        "light = short formulaic text (a subject line, a label). " +
        "standard = typical business writing or analysis. " +
        "heavy = multi-part deliverables, deep reasoning, long reports.",
      userContent: task,
    });
    const answer = result.text.trim().toLowerCase();
    if (answer.includes("light")) return "light";
    if (answer.includes("heavy")) return "heavy";
    return "standard";
  } catch {
    // 分類に失敗しても実行は止めない
    return "standard";
  }
}
