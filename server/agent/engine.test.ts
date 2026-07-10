import { describe, expect, it } from "vitest";
import { parseCritique } from "./engine";
import { MODEL_TIERS } from "./client";

describe("parseCritique", () => {
  it("parses a clean JSON critique", () => {
    const result = parseCritique('{"score": 92, "feedback": "良い出来です"}');
    expect(result.score).toBe(92);
    expect(result.feedback).toBe("良い出来です");
  });

  it("parses JSON embedded in surrounding text", () => {
    const result = parseCritique(
      '評価結果は次の通りです。\n{"score": 70, "feedback": "構成を改善してください"}\n以上です。'
    );
    expect(result.score).toBe(70);
    expect(result.feedback).toBe("構成を改善してください");
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
  });
});

describe("MODEL_TIERS", () => {
  it("defines all three routing tiers with valid model ids", () => {
    expect(MODEL_TIERS.light.model).toBe("claude-haiku-4-5");
    expect(MODEL_TIERS.standard.model).toBe("claude-opus-4-8");
    expect(MODEL_TIERS.heavy.model).toBe("claude-fable-5");
  });

  it("prices tiers in ascending order", () => {
    expect(MODEL_TIERS.light.outputUsdPerMTok).toBeLessThan(MODEL_TIERS.standard.outputUsdPerMTok);
    expect(MODEL_TIERS.standard.outputUsdPerMTok).toBeLessThan(MODEL_TIERS.heavy.outputUsdPerMTok);
  });
});
