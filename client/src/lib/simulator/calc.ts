// 営業マン収益シミュレーター 計算ロジック（純粋関数）
//
// 基本の考え方:
//   月間営業報酬 = 契約月額 × 営業報酬率 × 契約件数
//   紹介料       = 派生案件受注金額 × 紹介料率 × 件数
//   合計月収     = 営業報酬 + 紹介料

import { PLAN_PRICE, RANK_ORDER, RANK_RATE } from "./constants";
import type {
  PlanKey,
  Rank,
  RankComparisonRow,
  SimulationInput,
  SimulationResult,
} from "./types";

/** 1件あたりの営業報酬 = 月額 × 報酬率 */
export function perCaseReward(plan: PlanKey, rank: Rank): number {
  return Math.round(PLAN_PRICE[plan] * RANK_RATE[rank]);
}

/** 1件あたりの紹介料 = 平均受注金額 × 紹介料率 */
export function perReferralFee(avgAmount: number, referralRate: number): number {
  return Math.round(avgAmount * referralRate);
}

/**
 * ゼロ除算を避けつつ、目標達成に必要な追加件数を切り上げで返す。
 * 1件あたり単価が0以下なら達成不能とみなし Infinity を返す。
 */
function casesToClose(remaining: number, perUnit: number): number {
  if (remaining <= 0) return 0;
  if (perUnit <= 0) return Infinity;
  return Math.ceil(remaining / perUnit);
}

/** シミュレーション入力から結果一式を計算する */
export function calculate(input: SimulationInput): SimulationResult {
  const rewardRate = RANK_RATE[input.rank];

  const perCase5man = perCaseReward("5man", input.rank);
  const perCase10man = perCaseReward("10man", input.rank);

  const count5man = Math.max(0, input.count5man);
  const count10man = Math.max(0, input.count10man);

  const reward5man = perCase5man * count5man;
  const reward10man = perCase10man * count10man;
  const salesReward = reward5man + reward10man;
  const contractCount = count5man + count10man;

  const perFee = perReferralFee(input.referralAvgAmount, input.referralRate);
  const referralFee = perFee * Math.max(0, input.referralCount);

  const totalMonthly = salesReward + referralFee;

  const goalAmount = input.goalAmount;
  const achievementRate = goalAmount > 0 ? totalMonthly / goalAmount : 0;
  const remainingToGoal = Math.max(0, goalAmount - totalMonthly);

  return {
    rank: input.rank,
    rewardRate,
    perCase5man,
    perCase10man,
    reward5man,
    reward10man,
    salesReward,
    contractCount,
    perReferralFee: perFee,
    referralFee,
    totalMonthly,
    goalAmount,
    achievementRate,
    remainingToGoal,
    casesNeeded5man: casesToClose(remainingToGoal, perCase5man),
    casesNeeded10man: casesToClose(remainingToGoal, perCase10man),
    referralsNeeded: casesToClose(remainingToGoal, perFee),
  };
}

/**
 * 同一条件でランクごとの収益を比較する。
 * 紹介料はランクに依存しない（受注金額 × 紹介料率）ため全ランク共通。
 */
export function compareRanks(input: SimulationInput): RankComparisonRow[] {
  return RANK_ORDER.map((rank) => {
    const result = calculate({ ...input, rank });
    return {
      rank,
      rewardRate: result.rewardRate,
      salesReward: result.salesReward,
      referralFee: result.referralFee,
      totalMonthly: result.totalMonthly,
    };
  });
}

/** 円表記（¥1,234,567） */
export function formatYen(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  return "¥" + Math.round(amount).toLocaleString("ja-JP");
}

/** パーセント表記（85%） */
export function formatPercent(ratio: number, digits = 0): string {
  if (!Number.isFinite(ratio)) return "—";
  return (ratio * 100).toFixed(digits) + "%";
}
