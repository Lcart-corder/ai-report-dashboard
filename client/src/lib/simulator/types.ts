// 営業マン収益シミュレーター 型定義

/** 会員ランク */
export type Rank = "general" | "partner" | "senior";

/** 契約プラン（主力） */
export type PlanFocus = "5man" | "10man" | "both";

/** 継続報酬の期間 */
export type ContinuationType = "firstMonthOnly" | "ongoing" | "threeMonths";

/** 計算の基準 */
export type CalcBasis = "projected" | "actual";

/** 案件（パイプライン）のステータス */
export type DealStatus = "negotiating" | "waiting" | "contracted";

/** どのプランか（5万 / 10万） */
export type PlanKey = "5man" | "10man";

/** シミュレーション入力 */
export interface SimulationInput {
  /** 会員ランク */
  rank: Rank;
  /** 主力プラン */
  planFocus: PlanFocus;
  /** 継続報酬の期間 */
  continuation: ContinuationType;
  /** 計算の基準（見込み / 実績） */
  basis: CalcBasis;
  /** 5万円プランの契約件数 */
  count5man: number;
  /** 10万円プランの契約件数 */
  count10man: number;
  /** 派生案件の見込み件数 */
  referralCount: number;
  /** 派生案件の平均受注金額（円） */
  referralAvgAmount: number;
  /** 派生案件の紹介料率（受注金額に対して） */
  referralRate: number;
  /** 月収目標（円） */
  goalAmount: number;
}

/** ランクごとの内訳を含む計算結果 */
export interface SimulationResult {
  /** 会員ランク */
  rank: Rank;
  /** 営業報酬率 */
  rewardRate: number;
  /** 1件あたり報酬（5万円プラン） */
  perCase5man: number;
  /** 1件あたり報酬（10万円プラン） */
  perCase10man: number;
  /** 営業報酬（5万円プラン合計） */
  reward5man: number;
  /** 営業報酬（10万円プラン合計） */
  reward10man: number;
  /** 営業報酬 合計 */
  salesReward: number;
  /** 契約件数 合計 */
  contractCount: number;
  /** 1件あたり紹介料 */
  perReferralFee: number;
  /** 紹介料 見込み合計 */
  referralFee: number;
  /** 合計月収見込み */
  totalMonthly: number;
  /** 月収目標 */
  goalAmount: number;
  /** 目標達成率（0〜1） */
  achievementRate: number;
  /** 目標まで残り金額 */
  remainingToGoal: number;
  /** 目標達成に必要な追加件数（5万円プラン換算） */
  casesNeeded5man: number;
  /** 目標達成に必要な追加件数（10万円プラン換算） */
  casesNeeded10man: number;
  /** 目標達成に必要な追加派生案件数 */
  referralsNeeded: number;
}

/** ランク比較の1行 */
export interface RankComparisonRow {
  rank: Rank;
  rewardRate: number;
  salesReward: number;
  referralFee: number;
  totalMonthly: number;
}

/** パイプラインの案件 */
export interface Deal {
  id: string;
  companyName: string;
  plan: PlanKey;
  monthlyAmount: number;
  status: DealStatus;
  /** 契約見込み日 or 契約日 (YYYY-MM-DD) */
  date: string;
}

/** 収益履歴の1レコード */
export interface RevenueRecord {
  /** YYYY-MM */
  month: string;
  /** 金額（円） */
  amount: number;
  /** 見込みか確定か */
  projected: boolean;
}
