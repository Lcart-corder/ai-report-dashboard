import { describe, expect, it } from "vitest";
import {
  calculate,
  compareRanks,
  formatPercent,
  formatYen,
  perCaseReward,
  perReferralFee,
} from "./calc";
import { DEFAULT_INPUT } from "./constants";
import type { SimulationInput } from "./types";

describe("perCaseReward", () => {
  it("5万円プランの1件あたり報酬（ランク別）", () => {
    expect(perCaseReward("5man", "general")).toBe(5000); // 10%
    expect(perCaseReward("5man", "partner")).toBe(10000); // 20%
    expect(perCaseReward("5man", "senior")).toBe(15000); // 30%
  });

  it("10万円プランの1件あたり報酬（ランク別）", () => {
    expect(perCaseReward("10man", "general")).toBe(10000);
    expect(perCaseReward("10man", "partner")).toBe(20000);
    expect(perCaseReward("10man", "senior")).toBe(30000);
  });
});

describe("perReferralFee", () => {
  it("受注金額 × 紹介料率", () => {
    expect(perReferralFee(500000, 0.05)).toBe(25000);
    expect(perReferralFee(1000000, 0.05)).toBe(50000);
    expect(perReferralFee(3000000, 0.05)).toBe(150000);
  });
});

describe("calculate - モックアップのケース1（営業パートナー20%）", () => {
  // 10万円プラン8件 / 5万円プラン4件 / 派生案件100万円1件
  const input: SimulationInput = {
    ...DEFAULT_INPUT,
    rank: "partner",
    count5man: 4,
    count10man: 8,
    referralCount: 1,
    referralAvgAmount: 1000000,
    referralRate: 0.05,
    goalAmount: 300000,
  };

  it("営業報酬の内訳", () => {
    const r = calculate(input);
    expect(r.reward5man).toBe(40000); // 4 × 10,000
    expect(r.reward10man).toBe(160000); // 8 × 20,000
    expect(r.salesReward).toBe(200000);
    expect(r.contractCount).toBe(12);
  });

  it("紹介料と合計", () => {
    const r = calculate(input);
    expect(r.referralFee).toBe(50000); // 100万 × 5%
    expect(r.totalMonthly).toBe(250000);
  });

  it("目標達成率と残り", () => {
    const r = calculate(input);
    expect(r.remainingToGoal).toBe(50000);
    expect(r.achievementRate).toBeCloseTo(0.8333, 3);
    // 残り5万円 → 10万円プラン(@2万)は3件、派生案件(@5万)は1件
    expect(r.casesNeeded10man).toBe(3);
    expect(r.casesNeeded5man).toBe(5); // 残り5万 ÷ 1万
    expect(r.referralsNeeded).toBe(1);
  });
});

describe("calculate - ケース2（上級営業パートナー30%）", () => {
  const input: SimulationInput = {
    ...DEFAULT_INPUT,
    rank: "senior",
    count5man: 4,
    count10man: 8,
    referralCount: 1,
    referralAvgAmount: 1000000,
    referralRate: 0.05,
  };

  it("営業報酬と合計", () => {
    const r = calculate(input);
    expect(r.reward5man).toBe(60000); // 4 × 15,000
    expect(r.reward10man).toBe(240000); // 8 × 30,000
    expect(r.salesReward).toBe(300000);
    expect(r.referralFee).toBe(50000);
    expect(r.totalMonthly).toBe(350000);
  });
});

describe("compareRanks - 同一条件でのランク比較（モックアップ画面8）", () => {
  const input: SimulationInput = {
    ...DEFAULT_INPUT,
    count5man: 4,
    count10man: 8,
    referralCount: 1,
    referralAvgAmount: 1000000,
    referralRate: 0.05,
  };

  it("3ランクの合計収益", () => {
    const rows = compareRanks(input);
    const byRank = Object.fromEntries(rows.map((r) => [r.rank, r]));

    expect(byRank.general.salesReward).toBe(100000);
    expect(byRank.general.totalMonthly).toBe(150000);

    expect(byRank.partner.salesReward).toBe(200000);
    expect(byRank.partner.totalMonthly).toBe(250000);

    expect(byRank.senior.salesReward).toBe(300000);
    expect(byRank.senior.totalMonthly).toBe(350000);
  });

  it("紹介料は全ランク共通", () => {
    const rows = compareRanks(input);
    expect(rows.every((r) => r.referralFee === 50000)).toBe(true);
  });
});

describe("月収30万円達成に必要な件数（スペックの表）", () => {
  it("5万円プランだけ売る場合", () => {
    const base: SimulationInput = {
      ...DEFAULT_INPUT,
      planFocus: "5man",
      count5man: 0,
      count10man: 0,
      referralCount: 0,
      goalAmount: 300000,
    };
    expect(calculate({ ...base, rank: "general" }).casesNeeded5man).toBe(60);
    expect(calculate({ ...base, rank: "partner" }).casesNeeded5man).toBe(30);
    expect(calculate({ ...base, rank: "senior" }).casesNeeded5man).toBe(20);
  });

  it("10万円プランだけ売る場合", () => {
    const base: SimulationInput = {
      ...DEFAULT_INPUT,
      planFocus: "10man",
      count5man: 0,
      count10man: 0,
      referralCount: 0,
      goalAmount: 300000,
    };
    expect(calculate({ ...base, rank: "general" }).casesNeeded10man).toBe(30);
    expect(calculate({ ...base, rank: "partner" }).casesNeeded10man).toBe(15);
    expect(calculate({ ...base, rank: "senior" }).casesNeeded10man).toBe(10);
  });
});

describe("エッジケース", () => {
  it("目標達成済みなら残り0・必要件数0", () => {
    const r = calculate({
      ...DEFAULT_INPUT,
      rank: "senior",
      count5man: 4,
      count10man: 8,
      goalAmount: 300000,
    });
    expect(r.remainingToGoal).toBe(0);
    expect(r.casesNeeded5man).toBe(0);
    expect(r.referralsNeeded).toBe(0);
  });

  it("負の件数入力は0として扱う", () => {
    const r = calculate({
      ...DEFAULT_INPUT,
      count5man: -5,
      count10man: -3,
      referralCount: -1,
    });
    expect(r.salesReward).toBe(0);
    expect(r.referralFee).toBe(0);
  });

  it("目標0でも例外を投げない", () => {
    const r = calculate({ ...DEFAULT_INPUT, goalAmount: 0 });
    expect(r.achievementRate).toBe(0);
    expect(r.remainingToGoal).toBe(0);
  });
});

describe("フォーマッタ", () => {
  it("formatYen", () => {
    expect(formatYen(256000)).toBe("¥256,000");
    expect(formatYen(0)).toBe("¥0");
    expect(formatYen(Infinity)).toBe("—");
  });

  it("formatPercent", () => {
    expect(formatPercent(0.85)).toBe("85%");
    expect(formatPercent(0.8333, 1)).toBe("83.3%");
    expect(formatPercent(Infinity)).toBe("—");
  });
});
