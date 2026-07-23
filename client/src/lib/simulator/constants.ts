// 営業マン収益シミュレーター 定数

import type {
  CalcBasis,
  ContinuationType,
  PlanFocus,
  PlanKey,
  Rank,
  SimulationInput,
} from "./types";

/** プランごとの月額（円） */
export const PLAN_PRICE: Record<PlanKey, number> = {
  "5man": 50000,
  "10man": 100000,
};

/** ランクごとの営業報酬率 */
export const RANK_RATE: Record<Rank, number> = {
  general: 0.1,
  partner: 0.2,
  senior: 0.3,
};

/** ランク表示ラベル */
export const RANK_LABEL: Record<Rank, string> = {
  general: "一般紹介者",
  partner: "営業パートナー",
  senior: "上級営業パートナー",
};

/** ランクの並び順（比較表など） */
export const RANK_ORDER: Rank[] = ["general", "partner", "senior"];

/** プラン表示ラベル */
export const PLAN_LABEL: Record<PlanKey, string> = {
  "5man": "5万円プラン",
  "10man": "10万円プラン",
};

/** 主力プランの選択肢ラベル */
export const PLAN_FOCUS_LABEL: Record<PlanFocus, string> = {
  "5man": "5万円プラン",
  "10man": "10万円プラン",
  both: "両方",
};

/** 継続報酬の期間ラベル */
export const CONTINUATION_LABEL: Record<ContinuationType, string> = {
  firstMonthOnly: "初月のみ",
  ongoing: "継続中ずっと",
  threeMonths: "3か月限定",
};

/** 計算基準ラベル */
export const BASIS_LABEL: Record<CalcBasis, string> = {
  projected: "見込みベース",
  actual: "実績ベース",
};

/** デフォルトの紹介料率 */
export const DEFAULT_REFERRAL_RATE = 0.05;

/** デフォルトの月収目標 */
export const DEFAULT_GOAL_AMOUNT = 300000;

/** シミュレーション入力の初期値（モックアップのケース1に準拠） */
export const DEFAULT_INPUT: SimulationInput = {
  rank: "partner",
  planFocus: "both",
  continuation: "ongoing",
  basis: "projected",
  count5man: 4,
  count10man: 8,
  referralCount: 1,
  referralAvgAmount: 1000000,
  referralRate: DEFAULT_REFERRAL_RATE,
  goalAmount: DEFAULT_GOAL_AMOUNT,
};
