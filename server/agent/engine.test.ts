import { describe, expect, it } from "vitest";
import { parseCritique, restoreLoopState, VERIFICATION_CRITERIA } from "./engine";
import { complexityForModel, MODEL_TIERS } from "./client";
import type { AgentRunStep } from "../../drizzle/schema";

describe("parseCritique", () => {
  it("parses a clean JSON critique", () => {
    const result = parseCritique('{"score": 92, "feedback": "良い出来です"}');
    expect(result.score).toBe(92);
    expect(result.feedback).toBe("良い出来です");
    expect(result.alignment).toBe(1);
  });

  it("parses JSON embedded in surrounding text", () => {
    const result = parseCritique(
      '評価結果は次の通りです。\n{"score": 70, "feedback": "構成を改善してください"}\n以上です。'
    );
    expect(result.score).toBe(70);
    expect(result.feedback).toBe("構成を改善してください");
  });

  it("computes weighted score from per-criterion scores", () => {
    const criteria = VERIFICATION_CRITERIA.report;
    const result = parseCritique(
      JSON.stringify({
        criteria: {
          factual_accuracy: 100,
          logical_consistency: 100,
          completeness: 50,
          actionability: 50,
        },
        alignment: 0.9,
        feedback: "網羅性を高めてください",
      }),
      criteria
    );
    // 100*0.35 + 100*0.30 + 50*0.20 + 50*0.15 = 82.5 → 83
    expect(result.score).toBe(83);
    expect(result.alignment).toBe(0.9);
    expect(result.criteriaScores.completeness).toBe(50);
  });

  it("falls back to overall score when criteria are missing", () => {
    const result = parseCritique(
      '{"score": 88, "alignment": 0.5, "feedback": "x"}',
      VERIFICATION_CRITERIA.general
    );
    expect(result.score).toBe(88);
    expect(result.alignment).toBe(0.5);
  });

  it("clamps scores above 100", () => {
    const result = parseCritique('{"score": 150, "feedback": "x"}');
    expect(result.score).toBe(100);
  });

  it("falls back to regex extraction on malformed JSON", () => {
    const result = parseCritique('{"score": 55, "feedback": "unterminated');
    expect(result.score).toBe(55);
  });

  it("returns score 0 when no score is present", () => {
    const result = parseCritique("採点できませんでした");
    expect(result.score).toBe(0);
    expect(result.alignment).toBe(1);
  });
});

describe("restoreLoopState (チェックポイント再開)", () => {
  const step = (partial: Partial<AgentRunStep>): AgentRunStep =>
    ({
      id: 1,
      runId: 1,
      iteration: 0,
      stepType: "generate",
      model: null,
      output: null,
      score: null,
      inputTokens: 0,
      outputTokens: 0,
      costUsd: "0",
      createdAt: new Date(),
      ...partial,
    }) as AgentRunStep;

  it("restores draft, feedback, best score and last iteration", () => {
    const steps = [
      step({ stepType: "route", iteration: 0, output: "complexity=standard" }),
      step({ stepType: "generate", iteration: 1, output: "初稿" }),
      step({
        stepType: "critique",
        iteration: 1,
        score: 60,
        output: '{"score": 60, "feedback": "改善してください"}',
      }),
      step({ stepType: "revise", iteration: 2, output: "改訂版" }),
      step({
        stepType: "critique",
        iteration: 2,
        score: 78,
        output: '{"score": 78, "feedback": "もう少し"}',
      }),
    ];
    const state = restoreLoopState(steps);
    expect(state.draft).toBe("改訂版");
    expect(state.bestScore).toBe(78);
    expect(state.lastFeedback).toBe("もう少し");
    expect(state.lastIteration).toBe(2);
  });

  it("returns empty state for a fresh run", () => {
    const state = restoreLoopState([]);
    expect(state.draft).toBe("");
    expect(state.bestScore).toBe(0);
    expect(state.lastIteration).toBe(0);
  });
});

describe("VERIFICATION_CRITERIA", () => {
  it("weights sum to 1.0 for every task type", () => {
    for (const criteria of Object.values(VERIFICATION_CRITERIA)) {
      const sum = criteria.reduce((acc, c) => acc + c.weight, 0);
      expect(sum).toBeCloseTo(1.0, 5);
    }
  });
});

describe("MODEL_TIERS / complexityForModel", () => {
  it("defines all three routing tiers with valid model ids", () => {
    expect(MODEL_TIERS.light.model).toBe("claude-haiku-4-5");
    expect(MODEL_TIERS.standard.model).toBe("claude-opus-4-8");
    expect(MODEL_TIERS.heavy.model).toBe("claude-fable-5");
  });

  it("prices tiers in ascending order", () => {
    expect(MODEL_TIERS.light.outputUsdPerMTok).toBeLessThan(MODEL_TIERS.standard.outputUsdPerMTok);
    expect(MODEL_TIERS.standard.outputUsdPerMTok).toBeLessThan(MODEL_TIERS.heavy.outputUsdPerMTok);
  });

  it("maps model ids back to complexity tiers (Router自己最適化用)", () => {
    expect(complexityForModel("claude-fable-5")).toBe("heavy");
    expect(complexityForModel("claude-haiku-4-5")).toBe("light");
    expect(complexityForModel("unknown-model")).toBeNull();
  });
});
