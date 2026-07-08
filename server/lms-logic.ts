/**
 * LMS の純粋ロジック(DB非依存)。ユニットテスト対象。
 * DBアクセスを伴う処理は server/lms.ts 側に置き、ここには計算・判定・整形のみを置く。
 */

/** 助成金要件: 標準学習時間10時間(600分)以上。 */
export const SUBSIDY_MIN_MINUTES = 600;

/** 10時間以上か。 */
export function meetsSubsidyMinutes(totalMinutes: number): boolean {
  return totalMinutes >= SUBSIDY_MIN_MINUTES;
}

/** 成果報酬額 = 研修売上 × 報酬率(%)。小数切り捨て。助成金受給額には非連動。 */
export function calcFeeAmount(trainingSales: number, feeRatePercent: number): number {
  if (!Number.isFinite(trainingSales) || trainingSales <= 0) return 0;
  return Math.floor((trainingSales * feeRatePercent) / 100);
}

/** 修了証番号 `RLMS-YYYYMMDD-000123`。 */
export function formatCertificateNumber(dateStr: string, enrollmentId: number): string {
  return `RLMS-${dateStr.replace(/-/g, "")}-${String(enrollmentId).padStart(6, "0")}`;
}

export type GradableQuestion = {
  id: number;
  questionType: "single" | "multiple" | "text" | string;
  correctAnswers: number[] | null;
  points: number;
};

/**
 * 確認テストの採点(FR-09)。
 * 単一/複数選択は自動採点。記述式(text)は合否に影響させないため満点付与(運用で手動確認)。
 * @returns 0〜100 のスコア(得点/満点)
 */
export function gradeQuiz(questions: GradableQuestion[], answers: Record<string, number[] | string>): { earned: number; total: number; score: number } {
  let earned = 0;
  let total = 0;
  for (const q of questions) {
    total += q.points;
    if (q.questionType === "text") {
      earned += q.points;
      continue;
    }
    const correct = q.correctAnswers ?? [];
    const submitted = answers[String(q.id)];
    const given = Array.isArray(submitted) ? submitted : [];
    const isCorrect = correct.length === given.length && correct.every(c => given.includes(c));
    if (isCorrect) earned += q.points;
  }
  const score = total === 0 ? 0 : Math.round((earned / total) * 100);
  return { earned, total, score };
}

// ------------------------------------------------------------
// CSV 整形(BOM付きでExcel文字化け回避)
// ------------------------------------------------------------

export function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: Array<Array<unknown>>): string {
  const lines = [headers.map(csvEscape).join(",")];
  for (const r of rows) lines.push(r.map(csvEscape).join(","));
  return "﻿" + lines.join("\r\n");
}

// ------------------------------------------------------------
// リマインド理由の判定(FR-14)
// ------------------------------------------------------------

/** YYYY-MM-DD に日数を加算。 */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export type ReminderInput = {
  status: string; // enrollment status
  dueDate: string | null;
  hasLoggedIn: boolean;
  isInvited: boolean;
  isNotStarted: boolean;
  progressRate: number;
  hasQuizResult: boolean;
};

/**
 * 受講割当1件に対するリマインド理由の配列を返す(純粋)。
 * 未ログイン / 期限7・3・1日前 / テスト未受験 / 期限切れ。
 */
export function reminderReasonsFor(today: string, p: ReminderInput): string[] {
  if (p.status === "completed") return [];
  const reasons: string[] = [];
  if (p.dueDate && p.dueDate < today) {
    reasons.push("expired");
    return reasons; // 期限切れは他の督促と重複させない
  }
  if (!p.hasLoggedIn && (p.isNotStarted || p.isInvited)) reasons.push("no_login");
  if (p.dueDate) {
    if (p.dueDate <= addDays(today, 1) && p.dueDate >= today) reasons.push("due_1d");
    else if (p.dueDate <= addDays(today, 3) && p.dueDate >= today) reasons.push("due_3d");
    else if (p.dueDate <= addDays(today, 7) && p.dueDate >= today) reasons.push("due_7d");
  }
  if (!p.hasQuizResult && p.progressRate > 0) reasons.push("quiz_pending");
  return reasons;
}

export const REMINDER_LABELS: Record<string, string> = {
  no_login: "初回未ログイン",
  due_7d: "受講期限7日前",
  due_3d: "受講期限3日前",
  due_1d: "受講期限前日",
  quiz_pending: "テスト未受験",
  expired: "期限切れ",
};

// ------------------------------------------------------------
// 受講状態ラベル
// ------------------------------------------------------------

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    not_started: "未着手",
    in_progress: "受講中",
    completed: "修了",
    expired: "期限切れ",
    invited: "招待済",
    active: "受講中",
    delayed: "遅延",
    suspended: "停止",
  };
  return map[status] ?? status;
}
