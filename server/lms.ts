/**
 * 助成金対応リスキリング動画学習システム — サーバー層(データアクセス + 業務ロジック)
 *
 * 設計思想: 「動画を見せるシステム」ではなく「助成金対応の証跡を残すシステム」。
 * - マスターキー検証(FR-02)
 * - 視聴ログ/確認チェック/テスト/レポートによる修了判定(FR-11)
 * - 進捗率の自動計算(FR-13 受入基準)
 * - 修了証番号の一意発行(FR-12)
 * - 監査ログ(FR-19)
 * - 協業先研修売上20%の成果報酬計算 ※助成金受給額には非連動(FR-18)
 *
 * DB未設定時は既存の db.ts と同様にグレースフルに空を返す。
 */
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "./db";
import { dispatchByChannel, dispatchWebhook } from "./lms-notify";
import {
  SUBSIDY_MIN_MINUTES,
  calcFeeAmount,
  formatCertificateNumber,
  gradeQuiz,
  meetsSubsidyMinutes,
  reminderReasonsFor,
  statusLabel,
  toCsv,
  REMINDER_LABELS,
} from "./lms-logic";
import {
  applicationChecklists,
  auditLogs,
  certificates,
  companies,
  companyBranches,
  completionChecks,
  courses,
  enrollments,
  internalWebhooks,
  learners,
  learningReports,
  lessons,
  lmsMembers,
  masterKeys,
  notificationLogs,
  notifications,
  partnerSales,
  partners,
  projects,
  progressLogs,
  quizQuestions,
  quizResults,
  quizzes,
  successFees,
  type InsertCompany,
  type InsertCompanyBranch,
  type InsertCourse,
  type InsertInternalWebhook,
  type InsertLearner,
  type InsertLesson,
  type InsertLmsMember,
  type InsertNotification,
  type InsertPartner,
  type InsertProject,
  type LmsMember,
  type InsertQuiz,
  type InsertQuizQuestion,
} from "../drizzle/schema";

const REQUIRE_DB = "Database not available";

/** MySQL insert の insertId を取り出す。 */
function insertedId(result: unknown): number {
  const r = result as Array<{ insertId?: number }> | { insertId?: number };
  if (Array.isArray(r)) return Number(r[0]?.insertId ?? 0);
  return Number(r?.insertId ?? 0);
}

/** YYYY-MM-DD 文字列(タイムゾーンはサーバーローカル)。 */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ============================================================
// 監査ログ(FR-19)
// ============================================================

export async function writeAuditLog(entry: {
  category: string;
  action: string;
  actor?: string | null;
  targetType?: string | null;
  targetId?: number | null;
  detail?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(auditLogs).values({
      category: entry.category,
      action: entry.action,
      actor: entry.actor ?? null,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      detail: (entry.detail ?? null) as never,
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
    });
  } catch (e) {
    console.warn("[LMS] audit log failed:", e);
  }
}

export async function getAuditLogs(opts?: { limit?: number; category?: string; actor?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conds = [];
  if (opts?.category) conds.push(eq(auditLogs.category, opts.category));
  if (opts?.actor) conds.push(eq(auditLogs.actor, opts.actor));
  const where = conds.length === 1 ? conds[0] : conds.length > 1 ? and(...conds) : undefined;
  const q = db.select().from(auditLogs);
  const rows = await (where ? q.where(where) : q).orderBy(desc(auditLogs.createdAt)).limit(opts?.limit ?? 200);
  return rows;
}

/** 監査ログCSV(FR-19)。分類・実行者で絞り込み可能。 */
export async function exportAuditLogsCsv(opts?: { category?: string; actor?: string }, actor?: string) {
  const headers = ["日時", "分類", "操作", "対象種別", "対象ID", "実行者", "IP"];
  const rows = await getAuditLogs({ limit: 5000, category: opts?.category, actor: opts?.actor });
  const out = rows.map(l => [
    new Date(l.createdAt).toISOString().slice(0, 19).replace("T", " "),
    l.category,
    l.action,
    l.targetType ?? "",
    l.targetId ?? "",
    l.actor ?? "",
    l.ipAddress ?? "",
  ]);
  await recordExport("audit_logs", "csv", { actor });
  return toCsv(headers, out);
}

// ============================================================
// 協業先(FR-17)
// ============================================================

export async function getAllPartners() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(partners).orderBy(desc(partners.createdAt));
}

export async function createPartner(input: InsertPartner) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const result = await db.insert(partners).values(input);
  const id = insertedId(result);
  await writeAuditLog({ category: "admin", action: "partner.create", targetType: "partner", targetId: id, detail: { name: input.name } });
  return { id };
}

export async function updatePartner(id: number, input: Partial<InsertPartner>) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  await db.update(partners).set(input).where(eq(partners.id, id));
  await writeAuditLog({ category: "admin", action: "partner.update", targetType: "partner", targetId: id });
  return { id };
}

// ============================================================
// 導入企業 / 事業所(FR-03)
// ============================================================

export async function getAllCompanies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companies).orderBy(desc(companies.createdAt));
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return rows[0];
}

export async function createCompany(input: InsertCompany) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const result = await db.insert(companies).values(input);
  const id = insertedId(result);
  await writeAuditLog({ category: "admin", action: "company.create", targetType: "company", targetId: id, detail: { name: input.name } });
  return { id };
}

export async function updateCompany(id: number, input: Partial<InsertCompany>) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  await db.update(companies).set(input).where(eq(companies.id, id));
  await writeAuditLog({ category: "admin", action: "company.update", targetType: "company", targetId: id });
  return { id };
}

export async function getBranchesByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companyBranches).where(eq(companyBranches.companyId, companyId));
}

export async function createBranch(input: InsertCompanyBranch) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const result = await db.insert(companyBranches).values(input);
  return { id: insertedId(result) };
}

// ============================================================
// マスターキー(FR-02) — マスターキー無しでの登録は不可
// ============================================================

function generateKeyCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 12; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}`;
}

export async function getMasterKeysByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(masterKeys).where(eq(masterKeys.companyId, companyId)).orderBy(desc(masterKeys.createdAt));
}

export async function issueMasterKey(companyId: number, opts: { expiresAt?: string | null; maxUses?: number | null }) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const keyCode = generateKeyCode();
  const result = await db.insert(masterKeys).values({
    companyId,
    keyCode,
    expiresAt: opts.expiresAt ?? null,
    maxUses: opts.maxUses ?? null,
  });
  await writeAuditLog({ category: "admin", action: "masterkey.issue", targetType: "master_key", targetId: insertedId(result), detail: { companyId } });
  return { id: insertedId(result), keyCode };
}

export async function deactivateMasterKey(id: number) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  await db.update(masterKeys).set({ isActive: false }).where(eq(masterKeys.id, id));
  await writeAuditLog({ category: "admin", action: "masterkey.deactivate", targetType: "master_key", targetId: id });
  return { id };
}

/** マスターキーの利用回数を1消費する。 */
export async function consumeMasterKey(keyId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(masterKeys).set({ usedCount: sql`${masterKeys.usedCount} + 1` }).where(eq(masterKeys.id, keyId));
}

/** マスターキー検証。無効/期限切れ/回数超過なら理由付きで拒否。 */
export async function validateMasterKey(keyCode: string): Promise<{ valid: boolean; reason?: string; companyId?: number; keyId?: number }> {
  const db = await getDb();
  if (!db) return { valid: false, reason: "database_unavailable" };
  const rows = await db.select().from(masterKeys).where(eq(masterKeys.keyCode, keyCode)).limit(1);
  const key = rows[0];
  if (!key) return { valid: false, reason: "not_found" };
  if (!key.isActive) return { valid: false, reason: "inactive" };
  if (key.expiresAt && key.expiresAt < today()) return { valid: false, reason: "expired" };
  if (key.maxUses != null && key.usedCount >= key.maxUses) return { valid: false, reason: "max_uses_reached" };
  return { valid: true, companyId: key.companyId, keyId: key.id };
}

// ============================================================
// 受講者(FR-04)
// ============================================================

export async function getLearnersByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(learners).where(eq(learners.companyId, companyId)).orderBy(desc(learners.createdAt));
}

export async function getLearnerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(learners).where(eq(learners.id, id)).limit(1);
  return rows[0];
}

export async function createLearner(input: InsertLearner) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const result = await db.insert(learners).values(input);
  const id = insertedId(result);
  await writeAuditLog({ category: "user_change", action: "learner.create", targetType: "learner", targetId: id, detail: { companyId: input.companyId } });
  return { id };
}

/** CSV一括登録(FR-04)。氏名/メール/社員番号/部署。 */
export async function bulkCreateLearners(companyId: number, rows: Array<{ name: string; email?: string; employeeNumber?: string; department?: string }>) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  if (rows.length === 0) return { inserted: 0 };
  await db.insert(learners).values(
    rows.map(r => ({
      companyId,
      name: r.name,
      email: r.email ?? null,
      employeeNumber: r.employeeNumber ?? null,
      department: r.department ?? null,
      status: "invited" as const,
    })),
  );
  await writeAuditLog({ category: "user_change", action: "learner.bulk_create", targetType: "company", targetId: companyId, detail: { count: rows.length } });
  return { inserted: rows.length };
}

/**
 * 受講者(会社員)の初回登録(FR-01/FR-02)。
 * ログイン中ユーザーのメールとマスターキーで、企業に紐づく learner を発行または既存招待とリンクする。
 * マスターキー無しの自由登録は不可。
 */
export async function registerLearnerWithMasterKey(
  user: { email?: string | null; name?: string | null },
  input: { keyCode: string; name?: string; employeeNumber?: string; department?: string; lineUserId?: string },
): Promise<{ learnerId: number; companyId: number; linked: boolean }> {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const email = user.email ?? "";
  if (!email) throw new Error("メールアドレスが取得できませんでした。ログインし直してください。");

  const v = await validateMasterKey(input.keyCode);
  if (!v.valid || v.companyId == null || v.keyId == null) {
    const reasonMsg: Record<string, string> = {
      not_found: "マスターキーが見つかりません",
      inactive: "このマスターキーは停止されています",
      expired: "このマスターキーは有効期限切れです",
      max_uses_reached: "このマスターキーは利用回数の上限に達しています",
      database_unavailable: "データベースに接続できません",
    };
    throw new Error(reasonMsg[v.reason ?? ""] ?? "マスターキーが無効です");
  }
  const companyId = v.companyId;

  // 既存(招待済み)の受講者をメールで探す。無ければ新規作成。
  const existing = await db.select().from(learners).where(and(eq(learners.email, email), eq(learners.companyId, companyId))).limit(1);
  const now = new Date();
  let learnerId: number;
  let linked = false;

  if (existing[0]) {
    learnerId = existing[0].id;
    linked = true;
    await db.update(learners).set({
      status: existing[0].status === "completed" ? existing[0].status : "active",
      firstLoginAt: existing[0].firstLoginAt ?? now,
      employeeNumber: input.employeeNumber ?? existing[0].employeeNumber,
      department: input.department ?? existing[0].department,
      lineUserId: input.lineUserId ?? existing[0].lineUserId,
    }).where(eq(learners.id, learnerId));
  } else {
    const result = await db.insert(learners).values({
      companyId,
      name: input.name || user.name || "受講者",
      email,
      employeeNumber: input.employeeNumber ?? null,
      department: input.department ?? null,
      lineUserId: input.lineUserId ?? null,
      status: "active",
      invitedAt: now,
      firstLoginAt: now,
    });
    learnerId = insertedId(result);
  }

  await consumeMasterKey(v.keyId);
  await writeAuditLog({ category: "login", action: linked ? "learner.register_linked" : "learner.register_new", actor: email, targetType: "learner", targetId: learnerId, detail: { companyId } });
  return { learnerId, companyId, linked };
}

/** 修了後の改ざん防止: 修了済み受講者の氏名等は更新不可。 */
export async function updateLearner(id: number, input: Partial<InsertLearner>) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const existing = await getLearnerById(id);
  if (existing?.status === "completed" && (input.name !== undefined || input.email !== undefined)) {
    throw new Error("修了済み受講者の氏名・メールは変更できません(証跡改ざん防止)");
  }
  await db.update(learners).set(input).where(eq(learners.id, id));
  await writeAuditLog({ category: "user_change", action: "learner.update", targetType: "learner", targetId: id });
  return { id };
}

// ============================================================
// コース / レッスン(FR-05, FR-06)
// ============================================================

// 助成金要件(標準学習時間10時間)や採点・CSV等の純粋ロジックは ./lms-logic に集約。
export { SUBSIDY_MIN_MINUTES };

export async function getAllCourses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).orderBy(desc(courses.createdAt));
}

export async function getCourseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return rows[0];
}

export async function createCourse(input: InsertCourse) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const result = await db.insert(courses).values(input);
  const id = insertedId(result);
  await writeAuditLog({ category: "admin", action: "course.create", targetType: "course", targetId: id, detail: { name: input.name } });
  return { id };
}

export async function updateCourse(id: number, input: Partial<InsertCourse>) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  await db.update(courses).set(input).where(eq(courses.id, id));
  await writeAuditLog({ category: "admin", action: "course.update", targetType: "course", targetId: id });
  return { id };
}

export async function getLessonsByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lessons).where(eq(lessons.courseId, courseId)).orderBy(lessons.sortOrder);
}

export async function createLesson(input: InsertLesson) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const result = await db.insert(lessons).values(input);
  return { id: insertedId(result) };
}

export async function updateLesson(id: number, input: Partial<InsertLesson>) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  await db.update(lessons).set(input).where(eq(lessons.id, id));
  return { id };
}

export async function deleteLesson(id: number) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  await db.delete(lessons).where(eq(lessons.id, id));
  return { id };
}

/** コースの合計標準学習時間(分)と10時間判定。 */
export async function getCourseDuration(courseId: number) {
  const db = await getDb();
  if (!db) return { totalMinutes: 0, meetsSubsidy: false };
  const rows = await db.select().from(lessons).where(eq(lessons.courseId, courseId));
  const totalMinutes = rows.reduce((s, l) => s + (l.durationMinutes ?? 0), 0);
  return { totalMinutes, meetsSubsidy: meetsSubsidyMinutes(totalMinutes) };
}

// ============================================================
// 受講割当 / 進捗(FR-11, FR-13)
// ============================================================

export async function getEnrollmentsByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(enrollments).where(eq(enrollments.courseId, courseId));
}

export async function getEnrollmentsByLearner(learnerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(enrollments).where(eq(enrollments.learnerId, learnerId));
}

export async function getEnrollmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(enrollments).where(eq(enrollments.id, id)).limit(1);
  return rows[0];
}

export async function assignEnrollment(learnerId: number, courseId: number, dueDate?: string | null) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  // 既存割当があれば重複作成しない
  const existing = await db.select().from(enrollments).where(and(eq(enrollments.learnerId, learnerId), eq(enrollments.courseId, courseId))).limit(1);
  if (existing[0]) return { id: existing[0].id, duplicated: true };
  const result = await db.insert(enrollments).values({ learnerId, courseId, dueDate: dueDate ?? null });
  const id = insertedId(result);
  await writeAuditLog({ category: "admin", action: "enrollment.assign", targetType: "enrollment", targetId: id, detail: { learnerId, courseId } });
  return { id, duplicated: false };
}

/**
 * 進捗率の再計算と修了判定(FR-11)。
 * 進捗率 = 必須レッスンのうち確認チェック済みの割合。
 * 修了条件 = 全必須レッスン視聴完了 + 全必須確認チェック + テスト合格 + (必要なら)レポート提出 + 期間内。
 */
export async function recalcEnrollment(enrollmentId: number) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const enrollment = await getEnrollmentById(enrollmentId);
  if (!enrollment) throw new Error("enrollment not found");
  const course = await getCourseById(enrollment.courseId);

  const courseLessons = await db.select().from(lessons).where(eq(lessons.courseId, enrollment.courseId));
  const requiredLessons = courseLessons.filter(l => l.isRequired);
  const requiredIds = requiredLessons.map(l => l.id);

  const checks = await db.select().from(completionChecks).where(eq(completionChecks.enrollmentId, enrollmentId));
  const checkedLessonIds = new Set(checks.map(c => c.lessonId));
  const checkedRequired = requiredIds.filter(id => checkedLessonIds.has(id));

  const logs = await db.select().from(progressLogs).where(eq(progressLogs.enrollmentId, enrollmentId));
  const watchedLessonIds = new Set(logs.filter(l => l.completedAt != null).map(l => l.lessonId));
  const watchedRequired = requiredIds.filter(id => watchedLessonIds.has(id));

  const progressRate = requiredIds.length === 0 ? 0 : Math.round((checkedRequired.length / requiredIds.length) * 100);

  // テスト合格判定
  const courseQuizzes = await db.select().from(quizzes).where(eq(quizzes.courseId, enrollment.courseId));
  let quizPassed = true;
  for (const q of courseQuizzes) {
    const results = await db.select().from(quizResults).where(and(eq(quizResults.quizId, q.id), eq(quizResults.enrollmentId, enrollmentId)));
    if (!results.some(r => r.passed)) quizPassed = false;
  }

  // レポート判定
  let reportOk = true;
  if (course?.requireReport) {
    const reports = await db.select().from(learningReports).where(eq(learningReports.enrollmentId, enrollmentId));
    reportOk = reports.some(r => r.status === "submitted" || r.status === "approved");
  }

  const allWatched = requiredIds.length > 0 && watchedRequired.length === requiredIds.length;
  const allChecked = requiredIds.length > 0 && checkedRequired.length === requiredIds.length;
  const withinPeriod = !enrollment.dueDate || today() <= enrollment.dueDate;

  const isCompleted = allWatched && allChecked && quizPassed && reportOk && withinPeriod;

  let status: typeof enrollment.status = "in_progress";
  if (isCompleted) status = "completed";
  else if (enrollment.dueDate && today() > enrollment.dueDate) status = "expired";
  else if (progressRate === 0 && logs.length === 0) status = "not_started";

  const setValues: Record<string, unknown> = { progressRate, status };
  if (isCompleted && !enrollment.completedAt) setValues.completedAt = new Date();
  if (status !== "not_started" && !enrollment.startedAt) setValues.startedAt = new Date();

  await db.update(enrollments).set(setValues).where(eq(enrollments.id, enrollmentId));

  // 受講者ステータス連動
  if (isCompleted) {
    await db.update(learners).set({ status: "completed" }).where(eq(learners.id, enrollment.learnerId));
  }

  return {
    progressRate,
    status,
    isCompleted,
    breakdown: {
      requiredLessons: requiredIds.length,
      watched: watchedRequired.length,
      checked: checkedRequired.length,
      quizPassed,
      reportOk,
      withinPeriod,
    },
  };
}

// ============================================================
// 視聴ログ(FR-07) — 管理者でも直接編集しない前提。学習者操作で追記。
// ============================================================

/** 視聴完了とみなす最低視聴率(%)。早送り・スキップで完了にしない。 */
export const WATCH_COMPLETE_THRESHOLD = 95;

export async function recordProgress(input: {
  enrollmentId: number;
  lessonId: number;
  watchRate: number;
  completed: boolean;
  lastPositionSec?: number;
  playbackRate?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  // 視聴完了はサーバー側で厳密判定: 視聴率が閾値未満ならcompletedを無効化(証跡の信頼性担保)
  const completed = input.completed && input.watchRate >= WATCH_COMPLETE_THRESHOLD;
  input = { ...input, completed };
  const existing = await db
    .select()
    .from(progressLogs)
    .where(and(eq(progressLogs.enrollmentId, input.enrollmentId), eq(progressLogs.lessonId, input.lessonId)))
    .limit(1);
  const now = new Date();
  if (existing[0]) {
    const prev = existing[0];
    await db
      .update(progressLogs)
      .set({
        watchRate: Math.max(prev.watchRate, input.watchRate),
        endedAt: now,
        completedAt: input.completed ? (prev.completedAt ?? now) : prev.completedAt,
        replayCount: input.completed && prev.completedAt ? prev.replayCount + 1 : prev.replayCount,
        lastPositionSec: input.lastPositionSec ?? prev.lastPositionSec,
        playbackRate: input.playbackRate ?? prev.playbackRate,
      })
      .where(eq(progressLogs.id, prev.id));
  } else {
    await db.insert(progressLogs).values({
      enrollmentId: input.enrollmentId,
      lessonId: input.lessonId,
      startedAt: now,
      endedAt: now,
      watchRate: input.watchRate,
      completedAt: input.completed ? now : null,
      lastPositionSec: input.lastPositionSec ?? 0,
      playbackRate: input.playbackRate ?? null,
    });
  }
  await writeAuditLog({ category: "progress", action: input.completed ? "lesson.completed" : "lesson.progress", targetType: "enrollment", targetId: input.enrollmentId, detail: { lessonId: input.lessonId, watchRate: input.watchRate } });
  return recalcEnrollment(input.enrollmentId);
}

export async function getProgressLogs(enrollmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(progressLogs).where(eq(progressLogs.enrollmentId, enrollmentId));
}

// ============================================================
// 確認チェック(FR-08)
// ============================================================

export async function recordCheck(enrollmentId: number, lessonId: number, learnerId: number) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const existing = await db
    .select()
    .from(completionChecks)
    .where(and(eq(completionChecks.enrollmentId, enrollmentId), eq(completionChecks.lessonId, lessonId)))
    .limit(1);
  if (!existing[0]) {
    await db.insert(completionChecks).values({ enrollmentId, lessonId, learnerId });
    await writeAuditLog({ category: "check", action: "completion_check", actor: String(learnerId), targetType: "enrollment", targetId: enrollmentId, detail: { lessonId } });
  }
  return recalcEnrollment(enrollmentId);
}

export async function getChecks(enrollmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(completionChecks).where(eq(completionChecks.enrollmentId, enrollmentId));
}

// ============================================================
// テスト(FR-09)
// ============================================================

export async function getQuizzesByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizzes).where(eq(quizzes.courseId, courseId));
}

export async function getQuizWithQuestions(quizId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const q = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
  if (!q[0]) return undefined;
  const questions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quizId)).orderBy(quizQuestions.sortOrder);
  return { ...q[0], questions };
}

export async function createQuiz(input: InsertQuiz) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const result = await db.insert(quizzes).values(input);
  return { id: insertedId(result) };
}

export async function createQuizQuestion(input: InsertQuizQuestion) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const result = await db.insert(quizQuestions).values(input);
  return { id: insertedId(result) };
}

/** 採点(単一/複数選択を自動採点。記述式は手動採点対象で0点扱いにしない=満点付与保留)。 */
export async function submitQuiz(input: {
  quizId: number;
  enrollmentId: number;
  learnerId: number;
  answers: Record<string, number[] | string>;
}) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const quiz = await getQuizWithQuestions(input.quizId);
  if (!quiz) throw new Error("quiz not found");

  const prior = await db.select().from(quizResults).where(and(eq(quizResults.quizId, input.quizId), eq(quizResults.enrollmentId, input.enrollmentId)));
  if (quiz.maxAttempts != null && prior.length >= quiz.maxAttempts) {
    throw new Error(`再受験回数の上限(${quiz.maxAttempts}回)に達しています`);
  }

  const { score } = gradeQuiz(
    quiz.questions.map(q => ({ id: q.id, questionType: q.questionType, correctAnswers: (q.correctAnswers as number[] | null) ?? null, points: q.points })),
    input.answers,
  );
  const passed = score >= quiz.passingScore;

  const result = await db.insert(quizResults).values({
    quizId: input.quizId,
    enrollmentId: input.enrollmentId,
    learnerId: input.learnerId,
    score,
    passed,
    answers: input.answers as never,
    attemptNumber: prior.length + 1,
  });
  await writeAuditLog({ category: "quiz", action: passed ? "quiz.passed" : "quiz.failed", actor: String(input.learnerId), targetType: "enrollment", targetId: input.enrollmentId, detail: { quizId: input.quizId, score } });

  const recalc = await recalcEnrollment(input.enrollmentId);
  return { id: insertedId(result), score, passed, recalc };
}

export async function getQuizResults(enrollmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizResults).where(eq(quizResults.enrollmentId, enrollmentId)).orderBy(desc(quizResults.takenAt));
}

// ============================================================
// 学習レポート(FR-10)
// ============================================================

export async function upsertLearningReport(input: {
  enrollmentId: number;
  learnerId: number;
  whatLearned?: string;
  howToApply?: string;
  submit?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const existing = await db.select().from(learningReports).where(eq(learningReports.enrollmentId, input.enrollmentId)).limit(1);
  const status = input.submit ? ("submitted" as const) : ("draft" as const);
  if (existing[0]) {
    await db
      .update(learningReports)
      .set({
        whatLearned: input.whatLearned ?? existing[0].whatLearned,
        howToApply: input.howToApply ?? existing[0].howToApply,
        status: input.submit ? "submitted" : existing[0].status,
        submittedAt: input.submit ? new Date() : existing[0].submittedAt,
      })
      .where(eq(learningReports.id, existing[0].id));
  } else {
    await db.insert(learningReports).values({
      enrollmentId: input.enrollmentId,
      learnerId: input.learnerId,
      whatLearned: input.whatLearned ?? null,
      howToApply: input.howToApply ?? null,
      status,
      submittedAt: input.submit ? new Date() : null,
    });
  }
  await writeAuditLog({ category: "progress", action: input.submit ? "report.submit" : "report.save", actor: String(input.learnerId), targetType: "enrollment", targetId: input.enrollmentId });
  return recalcEnrollment(input.enrollmentId);
}

export async function getLearningReport(enrollmentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(learningReports).where(eq(learningReports.enrollmentId, enrollmentId)).limit(1);
  return rows[0];
}

/** 差戻し(管理者・社労士)。 */
export async function reviewLearningReport(reportId: number, action: "approve" | "return", comment?: string) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  await db.update(learningReports).set({ status: action === "approve" ? "approved" : "returned", reviewComment: comment ?? null }).where(eq(learningReports.id, reportId));
  await writeAuditLog({ category: "admin", action: `report.${action}`, targetType: "learning_report", targetId: reportId });
  return { id: reportId };
}

// ============================================================
// 修了証(FR-12)
// ============================================================

export async function issueCertificate(enrollmentId: number, issuer = "Lカート運営事務局") {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const enrollment = await getEnrollmentById(enrollmentId);
  if (!enrollment) throw new Error("enrollment not found");
  const recalc = await recalcEnrollment(enrollmentId);
  if (!recalc.isCompleted) throw new Error("修了条件を満たしていないため修了証を発行できません");

  const existing = await db.select().from(certificates).where(eq(certificates.enrollmentId, enrollmentId)).limit(1);
  if (existing[0]) return existing[0];

  const learner = await getLearnerById(enrollment.learnerId);
  const course = await getCourseById(enrollment.courseId);
  const dur = await getCourseDuration(enrollment.courseId);
  const certificateNumber = formatCertificateNumber(today(), enrollmentId);

  const result = await db.insert(certificates).values({
    enrollmentId,
    learnerId: enrollment.learnerId,
    courseId: enrollment.courseId,
    certificateNumber,
    learnerName: learner?.name ?? "",
    courseName: course?.name ?? "",
    standardMinutes: dur.totalMinutes,
    completionDate: today(),
    issuer,
  });
  await writeAuditLog({ category: "completion", action: "certificate.issue", targetType: "certificate", targetId: insertedId(result), detail: { certificateNumber } });

  // 内部通知(協業先・運営向け): 修了を検知したら無料Webhookで自動連絡(ベストエフォート)
  const company = learner ? await getCompanyById(learner.companyId) : undefined;
  void notifyInternal(
    `✅ 修了通知: ${company?.name ?? ""} の ${learner?.name ?? ""} さんが「${course?.name ?? ""}」を修了しました（証明番号 ${certificateNumber} / 標準学習時間 ${(dur.totalMinutes / 60).toFixed(1)}時間）。`,
    { partnerId: company?.partnerId ?? undefined, companyId: learner?.companyId },
  ).catch(() => undefined);

  return { id: insertedId(result), certificateNumber };
}

export async function getCertificateByEnrollment(enrollmentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(certificates).where(eq(certificates.enrollmentId, enrollmentId)).limit(1);
  return rows[0];
}

export async function recordCertificateDownload(id: number, actor?: string) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  await db.update(certificates).set({ downloadCount: sql`${certificates.downloadCount} + 1` }).where(eq(certificates.id, id));
  await writeAuditLog({ category: "export", action: "certificate.download", actor: actor ?? null, targetType: "certificate", targetId: id });
  return { id };
}

// ============================================================
// ダッシュボード集計(FR-13)
// ============================================================

/**
 * ダッシュボード集計。
 * @param companyId 単一企業に絞る場合
 * @param scopeCompanyIds アクセス制御スコープ。null=無制限, []=対象なし, [ids]=その企業のみ集計
 */
export async function getDashboardStats(companyId?: number, scopeCompanyIds?: number[] | null) {
  const db = await getDb();
  const empty = { learners: 0, avgProgress: 0, completed: 0, incomplete: 0, neverLoggedIn: 0, quizPending: 0, expiringSoon: 0 };
  if (!db) return empty;
  // スコープが空配列 = アクセス可能企業なし
  if (scopeCompanyIds !== null && scopeCompanyIds !== undefined && scopeCompanyIds.length === 0 && companyId == null) return empty;

  let learnerRows: Array<typeof learners.$inferSelect>;
  if (companyId != null) {
    learnerRows = await db.select().from(learners).where(eq(learners.companyId, companyId));
  } else if (scopeCompanyIds && scopeCompanyIds.length > 0) {
    learnerRows = await db.select().from(learners).where(inArray(learners.companyId, scopeCompanyIds));
  } else {
    learnerRows = await db.select().from(learners);
  }
  const learnerIds = learnerRows.map(l => l.id);

  let enrollmentRows: Array<typeof enrollments.$inferSelect> = [];
  if (learnerIds.length > 0) {
    enrollmentRows = await db.select().from(enrollments).where(inArray(enrollments.learnerId, learnerIds));
  }

  const completed = enrollmentRows.filter(e => e.status === "completed").length;
  const incomplete = enrollmentRows.filter(e => e.status !== "completed").length;
  const avgProgress = enrollmentRows.length === 0 ? 0 : Math.round(enrollmentRows.reduce((s, e) => s + e.progressRate, 0) / enrollmentRows.length);
  const neverLoggedIn = learnerRows.filter(l => l.firstLoginAt == null).length;

  // 期限7日以内で未修了
  const soon = new Date();
  soon.setDate(soon.getDate() + 7);
  const soonStr = soon.toISOString().slice(0, 10);
  const expiringSoon = enrollmentRows.filter(e => e.status !== "completed" && e.dueDate && e.dueDate <= soonStr && e.dueDate >= today()).length;

  // テスト未受験(進捗はあるがquiz結果なし)
  let quizPending = 0;
  for (const e of enrollmentRows) {
    if (e.status === "completed") continue;
    const results = await db.select().from(quizResults).where(eq(quizResults.enrollmentId, e.id)).limit(1);
    if (results.length === 0) quizPending += 1;
  }

  return {
    learners: learnerRows.length,
    avgProgress,
    completed,
    incomplete,
    neverLoggedIn,
    quizPending,
    expiringSoon,
  };
}

// ============================================================
// 申請準備チェックリスト(FR-16)
// ============================================================

export async function computeApplicationChecklist(companyId: number, courseId: number) {
  const db = await getDb();
  const course = await getCourseById(courseId);
  const dur = await getCourseDuration(courseId);

  const base = {
    courseRegistered: !!course,
    standardTime10h: dur.meetsSubsidy,
    trainingPeriodSet: !!(course?.trainingStartDate && course?.trainingEndDate),
    learnersRegistered: false,
    coursesCompleted: false,
    quizPassed: false,
    reportSubmitted: false,
    certificateIssued: false,
    lmsLogAvailable: false,
    priceRegistered: !!course && (course.tuitionFee > 0 || course.lmsFee > 0),
    advisorReviewed: false,
  };

  if (db) {
    const companyLearners = await db.select().from(learners).where(eq(learners.companyId, companyId));
    base.learnersRegistered = companyLearners.length > 0;
    const learnerIds = companyLearners.map(l => l.id);
    if (learnerIds.length > 0) {
      const enr = await db.select().from(enrollments).where(and(inArray(enrollments.learnerId, learnerIds), eq(enrollments.courseId, courseId)));
      base.coursesCompleted = enr.length > 0 && enr.every(e => e.status === "completed");
      const enrIds = enr.map(e => e.id);
      if (enrIds.length > 0) {
        const results = await db.select().from(quizResults).where(inArray(quizResults.enrollmentId, enrIds));
        base.quizPassed = enrIds.every(id => results.some(r => r.enrollmentId === id && r.passed));
        const reports = await db.select().from(learningReports).where(inArray(learningReports.enrollmentId, enrIds));
        base.reportSubmitted = enrIds.every(id => reports.some(r => r.enrollmentId === id && (r.status === "submitted" || r.status === "approved")));
        const certs = await db.select().from(certificates).where(inArray(certificates.enrollmentId, enrIds));
        base.certificateIssued = enrIds.every(id => certs.some(c => c.enrollmentId === id));
        const logs = await db.select().from(progressLogs).where(inArray(progressLogs.enrollmentId, enrIds)).limit(1);
        base.lmsLogAvailable = logs.length > 0;
      }
      const advisor = await db.select().from(applicationChecklists).where(and(eq(applicationChecklists.companyId, companyId), eq(applicationChecklists.courseId, courseId))).limit(1);
      base.advisorReviewed = advisor[0]?.reviewedByAdvisor ?? false;
    }
  }

  const passed = Object.values(base).filter(Boolean).length;
  const totalItems = Object.keys(base).length;
  return { items: base, readyRate: Math.round((passed / totalItems) * 100), passed, totalItems };
}

export async function setAdvisorReview(companyId: number, courseId: number, reviewed: boolean, comment?: string) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const existing = await db.select().from(applicationChecklists).where(and(eq(applicationChecklists.companyId, companyId), eq(applicationChecklists.courseId, courseId))).limit(1);
  if (existing[0]) {
    await db.update(applicationChecklists).set({ reviewedByAdvisor: reviewed, advisorComment: comment ?? null }).where(eq(applicationChecklists.id, existing[0].id));
  } else {
    await db.insert(applicationChecklists).values({ companyId, courseId, reviewedByAdvisor: reviewed, advisorComment: comment ?? null, items: null as never });
  }
  await writeAuditLog({ category: "admin", action: "checklist.advisor_review", targetType: "company", targetId: companyId, detail: { courseId, reviewed } });
  return { ok: true };
}

// ============================================================
// 証跡CSV出力(FR-15) — LMS受講状況・10時間以上修了者一覧など
// ============================================================

/**
 * LMS受講状況レポートCSV(コース単位)。修了日・受講開始/終了・進捗率等。
 * @param scopeCompanyIds アクセス制御スコープ。null=無制限, [ids]=その企業の受講者のみ
 */
export async function exportCourseProgressCsv(courseId: number, actor?: string, scopeCompanyIds?: number[] | null) {
  const headers = ["企業名", "受講者名", "社員番号", "コース名", "標準学習時間(分)", "標準学習時間(時間)", "進捗率", "状態", "受講開始日時", "修了日時", "受講期限"];
  const db = await getDb();
  if (!db) return toCsv(headers, []);
  const scope = scopeCompanyIds === undefined ? null : scopeCompanyIds;
  const course = await getCourseById(courseId);
  const enr = await db.select().from(enrollments).where(eq(enrollments.courseId, courseId));
  const dur = await getCourseDuration(courseId);
  const rows: Array<Array<unknown>> = [];
  for (const e of enr) {
    const learner = await getLearnerById(e.learnerId);
    if (!learner) continue;
    if (scope !== null && !scope.includes(learner.companyId)) continue; // スコープ外は除外
    const company = await getCompanyById(learner.companyId);
    rows.push([
      company?.name ?? "",
      learner?.name ?? "",
      learner?.employeeNumber ?? "",
      course?.name ?? "",
      dur.totalMinutes,
      (dur.totalMinutes / 60).toFixed(1),
      `${e.progressRate}%`,
      statusLabel(e.status),
      e.startedAt ? new Date(e.startedAt).toISOString().slice(0, 19).replace("T", " ") : "",
      e.completedAt ? new Date(e.completedAt).toISOString().slice(0, 19).replace("T", " ") : "",
      e.dueDate ?? "",
    ]);
  }
  await recordExport("course_progress", "csv", { courseId, actor });
  return toCsv(headers, rows);
}

/**
 * 受講時間10時間以上の修了者一覧CSV(定額制サービス向け書類/FR-15)。
 * @param scopeCompanyIds アクセス制御スコープ。null=無制限
 */
export async function exportTenHourCompletersCsv(actor?: string, scopeCompanyIds?: number[] | null) {
  const headers = ["企業名", "受講者名", "コース名", "受講時間(時間)", "修了日", "修了証番号"];
  const db = await getDb();
  if (!db) return toCsv(headers, []);
  const scope = scopeCompanyIds === undefined ? null : scopeCompanyIds;
  const certs = await db.select().from(certificates);
  const rows: Array<Array<unknown>> = [];
  for (const c of certs) {
    if (c.standardMinutes < SUBSIDY_MIN_MINUTES) continue;
    const learner = await getLearnerById(c.learnerId);
    if (scope !== null && (!learner || !scope.includes(learner.companyId))) continue;
    const company = learner ? await getCompanyById(learner.companyId) : undefined;
    rows.push([company?.name ?? "", c.learnerName, c.courseName, (c.standardMinutes / 60).toFixed(1), c.completionDate, c.certificateNumber]);
  }
  await recordExport("ten_hour_completers", "csv", { actor });
  return toCsv(headers, rows);
}

/**
 * コース別 テスト結果一覧CSV(証跡出力/FR-15)。合否・得点・受験回数を含む。
 * @param scopeCompanyIds アクセス制御スコープ。null=無制限
 */
export async function exportQuizResultsCsv(courseId: number, actor?: string, scopeCompanyIds?: number[] | null) {
  const headers = ["企業名", "受講者名", "社員番号", "コース名", "テスト名", "得点", "合格点", "合否", "受験回数", "受験日時"];
  const db = await getDb();
  if (!db) return toCsv(headers, []);
  const scope = scopeCompanyIds === undefined ? null : scopeCompanyIds;
  const course = await getCourseById(courseId);
  const qs = await db.select().from(quizzes).where(eq(quizzes.courseId, courseId));
  const rows: Array<Array<unknown>> = [];
  for (const q of qs) {
    const results = await db.select().from(quizResults).where(eq(quizResults.quizId, q.id)).orderBy(desc(quizResults.takenAt));
    for (const r of results) {
      const learner = await getLearnerById(r.learnerId);
      if (!learner) continue;
      if (scope !== null && !scope.includes(learner.companyId)) continue; // スコープ外は除外
      const company = await getCompanyById(learner.companyId);
      rows.push([
        company?.name ?? "",
        learner.name,
        learner.employeeNumber ?? "",
        course?.name ?? "",
        q.title,
        `${r.score}%`,
        `${q.passingScore}%`,
        r.passed ? "合格" : "不合格",
        r.attemptNumber,
        r.takenAt ? new Date(r.takenAt).toISOString().slice(0, 19).replace("T", " ") : "",
      ]);
    }
  }
  await recordExport("quiz_results", "csv", { courseId, actor });
  return toCsv(headers, rows);
}

async function recordExport(exportType: string, format: "csv" | "pdf", opts: { companyId?: number; courseId?: number; actor?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(exports).values({
    exportType,
    format,
    companyId: opts.companyId ?? null,
    courseId: opts.courseId ?? null,
    exportedBy: opts.actor ?? null,
  });
  await writeAuditLog({ category: "export", action: `export.${exportType}`, actor: opts.actor ?? null, detail: { format } });
}

// ============================================================
// 協業先売上 / 成果報酬(FR-17, FR-18) ※助成金受給額には非連動
// ============================================================

export async function getPartnerSales(partnerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(partnerSales).where(eq(partnerSales.partnerId, partnerId)).orderBy(desc(partnerSales.yearMonth));
}

export async function recordPartnerSale(input: { partnerId: number; companyId?: number; yearMonth: string; trainingSales: number; note?: string }) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const result = await db.insert(partnerSales).values({
    partnerId: input.partnerId,
    companyId: input.companyId ?? null,
    yearMonth: input.yearMonth,
    trainingSales: input.trainingSales,
    note: input.note ?? null,
  });
  await writeAuditLog({ category: "admin", action: "partner_sale.record", targetType: "partner", targetId: input.partnerId, detail: { yearMonth: input.yearMonth, trainingSales: input.trainingSales } });
  return { id: insertedId(result) };
}

/**
 * 成果報酬の計算(FR-18)。
 * 報酬額 = 協業先「研修売上」 × 報酬率(基本20%)。助成金受給額には一切連動させない。
 */
export async function calcSuccessFee(partnerSaleId: number) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const saleRows = await db.select().from(partnerSales).where(eq(partnerSales.id, partnerSaleId)).limit(1);
  const sale = saleRows[0];
  if (!sale) throw new Error("partner sale not found");
  const partnerRows = await db.select().from(partners).where(eq(partners.id, sale.partnerId)).limit(1);
  const feeRate = partnerRows[0]?.successFeeRate ?? 20;
  const feeAmount = calcFeeAmount(sale.trainingSales, feeRate);

  const existing = await db.select().from(successFees).where(eq(successFees.partnerSaleId, partnerSaleId)).limit(1);
  if (existing[0]) {
    await db.update(successFees).set({ baseSales: sale.trainingSales, feeRate, feeAmount }).where(eq(successFees.id, existing[0].id));
    return { id: existing[0].id, feeAmount, feeRate, baseSales: sale.trainingSales };
  }
  const result = await db.insert(successFees).values({
    partnerId: sale.partnerId,
    partnerSaleId,
    yearMonth: sale.yearMonth,
    baseSales: sale.trainingSales,
    feeRate,
    feeAmount,
  });
  await writeAuditLog({ category: "admin", action: "success_fee.calc", targetType: "partner", targetId: sale.partnerId, detail: { feeAmount, feeRate } });
  return { id: insertedId(result), feeAmount, feeRate, baseSales: sale.trainingSales };
}

export async function getSuccessFees(partnerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(successFees).where(eq(successFees.partnerId, partnerId)).orderBy(desc(successFees.yearMonth));
}

// ============================================================
// デモseed(DB接続時のみ)。動作確認用の最小データ。
// ============================================================

export async function seedDemoData() {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const existing = await db.select().from(courses).limit(1);
  if (existing[0]) return { seeded: false, reason: "already_has_data" };

  const partner = await createPartner({ name: "サンプル協業先株式会社", contactName: "協業 太郎", successFeeRate: 20 });
  const company = await createCompany({ partnerId: partner.id, name: "デモ導入企業株式会社", corporateNumber: "1234567890123", contactName: "人事 花子", contractStartDate: today() });
  const key = await issueMasterKey(company.id, { maxUses: 50 });

  const course = await createCourse({
    name: "AI活用リスキリング基礎コース",
    description: "生成AIを業務に活かすための10時間リスキリング研修。",
    standardMinutes: 600,
    standardPeriodDays: 30,
    trainingStartDate: today(),
    subsidyCategory: "リスキリング支援コース",
    passingScore: 80,
    tuitionFee: 50000,
    lmsFee: 10000,
    supportFee: 5000,
    visibility: "company_limited",
  });

  for (let i = 1; i <= 6; i++) {
    await createLesson({ courseId: course.id, title: `第${i}章 AI活用の基礎(${i})`, chapter: `第${i}章`, durationMinutes: 100, sortOrder: i, isRequired: true });
  }

  const quiz = await createQuiz({ courseId: course.id, title: "確認テスト", passingScore: 80 });
  await createQuizQuestion({ quizId: quiz.id, questionText: "生成AIの業務活用で最も重要なのは?", questionType: "single", options: ["出力の無検証採用", "目的に応じた検証と活用", "全業務の自動化"] as never, correctAnswers: [1] as never, points: 1, sortOrder: 1 });
  await createQuizQuestion({ quizId: quiz.id, questionText: "リスキリング研修で証跡として残すべき項目を選べ(複数)", questionType: "multiple", options: ["視聴ログ", "確認チェック", "テスト結果", "私的なメモ"] as never, correctAnswers: [0, 1, 2] as never, points: 2, sortOrder: 2 });

  const learner = await createLearner({ companyId: company.id, name: "受講 一郎", email: "learner@example.com", employeeNumber: "EMP001", department: "営業部", status: "active" });
  await assignEnrollment(learner.id, course.id, null);

  return { seeded: true, companyId: company.id, courseId: course.id, learnerId: learner.id, masterKey: key.keyCode };
}

// ============================================================
// 通知・リマインド(FR-14)
// ============================================================

export async function getNotifications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).orderBy(desc(notifications.createdAt));
}

export async function createNotification(input: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const result = await db.insert(notifications).values(input);
  await writeAuditLog({ category: "admin", action: "notification.create", targetType: "notification", targetId: insertedId(result), detail: { trigger: input.trigger } });
  return { id: insertedId(result) };
}

export async function updateNotification(id: number, input: Partial<InsertNotification>) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  await db.update(notifications).set(input).where(eq(notifications.id, id));
  return { id };
}

export async function deleteNotification(id: number) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  await db.delete(notifications).where(eq(notifications.id, id));
  return { id };
}

export async function getNotificationLogs(limit = 200) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notificationLogs).orderBy(desc(notificationLogs.createdAt)).limit(limit);
}

/**
 * リマインド対象を自動抽出(未ログイン/期限接近/テスト未受験/期限切れ)。
 * @param companyId 単一企業に絞る場合
 * @param scopeCompanyIds アクセス制御スコープ。null=無制限, []=対象なし
 */
export async function detectReminderTargets(companyId?: number, scopeCompanyIds?: number[] | null) {
  const db = await getDb();
  if (!db) return [] as Array<{ enrollmentId: number; learnerId: number; learnerName: string; courseId: number; reason: string; reasonLabel: string; dueDate: string | null }>;
  if (scopeCompanyIds !== null && scopeCompanyIds !== undefined && scopeCompanyIds.length === 0 && companyId == null) return [];

  let learnerRows;
  if (companyId != null) {
    learnerRows = await db.select().from(learners).where(eq(learners.companyId, companyId));
  } else if (scopeCompanyIds && scopeCompanyIds.length > 0) {
    learnerRows = await db.select().from(learners).where(inArray(learners.companyId, scopeCompanyIds));
  } else {
    learnerRows = await db.select().from(learners);
  }
  const learnerMap = new Map(learnerRows.map(l => [l.id, l]));
  const learnerIds = learnerRows.map(l => l.id);
  if (learnerIds.length === 0) return [];

  const enrollmentRows = await db.select().from(enrollments).where(inArray(enrollments.learnerId, learnerIds));
  const now = today();

  const targets: Array<{ enrollmentId: number; learnerId: number; learnerName: string; courseId: number; reason: string; reasonLabel: string; dueDate: string | null }> = [];
  for (const e of enrollmentRows) {
    const learner = learnerMap.get(e.learnerId);
    if (!learner) continue;
    const results = await db.select().from(quizResults).where(eq(quizResults.enrollmentId, e.id)).limit(1);
    const reasons = reminderReasonsFor(now, {
      status: e.status,
      dueDate: e.dueDate,
      hasLoggedIn: learner.firstLoginAt != null,
      isInvited: learner.status === "invited",
      isNotStarted: e.status === "not_started",
      progressRate: e.progressRate,
      hasQuizResult: results.length > 0,
    });
    for (const reason of reasons) {
      targets.push({ enrollmentId: e.id, learnerId: e.learnerId, learnerName: learner.name, courseId: e.courseId, reason, reasonLabel: REMINDER_LABELS[reason] ?? reason, dueDate: e.dueDate });
    }
  }
  return targets;
}

/**
 * リマインド送信。チャネルごとに実配信(メールSES / LINEプッシュ)し、結果を通知ログに記録。
 * channel="auto" の場合は受講者の希望チャネル(preferredChannel)に従う(既定メール)。
 * 認証情報未設定なら status="queued"(記録のみ)にフォールバックする。
 */
export async function sendReminders(input: { learnerIds: number[]; channel: string; notificationId?: number; subject?: string; body?: string }) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  if (input.learnerIds.length === 0) return { queued: 0, sent: 0, failed: 0 };

  const learnerRows = await db.select().from(learners).where(inArray(learners.id, input.learnerIds));
  const subject = input.subject ?? "リスキリング研修の受講リマインド";

  let sent = 0;
  let queued = 0;
  let failed = 0;
  for (const learner of learnerRows) {
    const channel = input.channel === "auto" ? learner.preferredChannel : input.channel;
    const body = input.body ?? `${learner.name} 様\n\nリスキリング研修の受講状況をご確認ください。期限内の修了をお願いします。`;
    const status = await dispatchByChannel(channel, { email: learner.email, lineUserId: learner.lineUserId }, subject, body);
    if (status === "sent") sent += 1;
    else if (status === "failed") failed += 1;
    else queued += 1;
    await db.insert(notificationLogs).values({
      notificationId: input.notificationId ?? null,
      learnerId: learner.id,
      channel,
      status,
      sentAt: status === "sent" ? new Date() : null,
    });
  }
  await writeAuditLog({ category: "admin", action: "reminder.send", detail: { channel: input.channel, sent, queued, failed } });
  return { queued, sent, failed };
}

// ============================================================
// 修了証 一覧(企業/コース単位)・価格疎明(FR-12, FR-15)
// ============================================================

export async function getCertificatesByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  const companyLearners = await db.select().from(learners).where(eq(learners.companyId, companyId));
  const ids = companyLearners.map(l => l.id);
  if (ids.length === 0) return [];
  return db.select().from(certificates).where(inArray(certificates.learnerId, ids)).orderBy(desc(certificates.issuedAt));
}

export async function getCertificatesByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certificates).where(eq(certificates.courseId, courseId)).orderBy(desc(certificates.issuedAt));
}

/** 価格疎明用データCSV(研修費/LMS利用料/運用支援費を分離、合計を明示)。 */
export async function exportPriceJustificationCsv(actor?: string) {
  const headers = ["コース名", "標準学習時間(時間)", "研修費", "LMS利用料", "運用支援費", "合計", "助成金区分"];
  const db = await getDb();
  if (!db) return toCsv(headers, []);
  const rows = await db.select().from(courses);
  const out: Array<Array<unknown>> = [];
  for (const c of rows) {
    const dur = await getCourseDuration(c.id);
    const total = c.tuitionFee + c.lmsFee + c.supportFee;
    out.push([c.name, (dur.totalMinutes / 60).toFixed(1), c.tuitionFee, c.lmsFee, c.supportFee, total, c.subsidyCategory ?? ""]);
  }
  await recordExport("price_justification", "csv", { actor });
  return toCsv(headers, out);
}

// ============================================================
// 社労士・申請確認者向け(証跡確認)
// ============================================================

/** 企業ごとの修了状況サマリー(社労士画面の企業一覧)。 */
export async function getAdvisorCompanyOverview() {
  const db = await getDb();
  if (!db) return [];
  const companyRows = await db.select().from(companies);
  const out: Array<{ id: number; name: string; learners: number; enrollments: number; completed: number; certificates: number }> = [];
  for (const c of companyRows) {
    const cl = await db.select().from(learners).where(eq(learners.companyId, c.id));
    const ids = cl.map(l => l.id);
    let enr: Array<typeof enrollments.$inferSelect> = [];
    let certCount = 0;
    if (ids.length > 0) {
      enr = await db.select().from(enrollments).where(inArray(enrollments.learnerId, ids));
      const certs = await db.select().from(certificates).where(inArray(certificates.learnerId, ids));
      certCount = certs.length;
    }
    out.push({ id: c.id, name: c.name, learners: cl.length, enrollments: enr.length, completed: enr.filter(e => e.status === "completed").length, certificates: certCount });
  }
  return out;
}

/** 受講者(enrollment)単位の証跡バンドル(視聴ログ・チェック・テスト・レポート・修了証)。 */
export async function getLearnerEvidence(enrollmentId: number) {
  const enrollment = await getEnrollmentById(enrollmentId);
  if (!enrollment) return undefined;
  const [learner, course, logs, checks, quizResultsRows, report, cert] = await Promise.all([
    getLearnerById(enrollment.learnerId),
    getCourseById(enrollment.courseId),
    getProgressLogs(enrollmentId),
    getChecks(enrollmentId),
    getQuizResults(enrollmentId),
    getLearningReport(enrollmentId),
    getCertificateByEnrollment(enrollmentId),
  ]);
  const recalc = await recalcEnrollment(enrollmentId).catch(() => null);
  return { enrollment, learner, course, logs, checks, quizResults: quizResultsRows, report, certificate: cert, judgment: recalc };
}

// ============================================================
// 協業先 月次レポート・請求予定額(Phase 3)
// ============================================================

/** 月次で研修売上・成果報酬・請求予定額を集計。 */
export async function getMonthlyPartnerReport(partnerId: number) {
  const db = await getDb();
  if (!db) return [] as Array<{ yearMonth: string; trainingSales: number; feeAmount: number; feeRate: number; status: string }>;
  const partnerRows = await db.select().from(partners).where(eq(partners.id, partnerId)).limit(1);
  const feeRate = partnerRows[0]?.successFeeRate ?? 20;
  const sales = await db.select().from(partnerSales).where(eq(partnerSales.partnerId, partnerId));
  const fees = await db.select().from(successFees).where(eq(successFees.partnerId, partnerId));

  const byMonth = new Map<string, { yearMonth: string; trainingSales: number; feeAmount: number; feeRate: number; status: string }>();
  for (const s of sales) {
    const cur = byMonth.get(s.yearMonth) ?? { yearMonth: s.yearMonth, trainingSales: 0, feeAmount: 0, feeRate, status: "予定" };
    cur.trainingSales += s.trainingSales;
    cur.feeAmount += calcFeeAmount(s.trainingSales, feeRate);
    byMonth.set(s.yearMonth, cur);
  }
  // 確定済み報酬があれば上書き
  for (const f of fees) {
    const cur = byMonth.get(f.yearMonth) ?? { yearMonth: f.yearMonth, trainingSales: f.baseSales, feeAmount: 0, feeRate: f.feeRate, status: "確定" };
    cur.feeAmount = f.feeAmount;
    cur.feeRate = f.feeRate;
    cur.status = f.status === "paid" ? "入金済" : f.status === "invoiced" ? "請求済" : "確定";
    byMonth.set(f.yearMonth, cur);
  }
  return Array.from(byMonth.values()).sort((a, b) => (a.yearMonth < b.yearMonth ? 1 : -1));
}

// ============================================================
// 内部通知Webhook(協業先・企業管理者・運営向け / 無料)
// ============================================================

export async function getInternalWebhooks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(internalWebhooks).orderBy(desc(internalWebhooks.createdAt));
}

export async function createInternalWebhook(input: InsertInternalWebhook) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const result = await db.insert(internalWebhooks).values(input);
  await writeAuditLog({ category: "admin", action: "webhook.create", targetType: "internal_webhook", targetId: insertedId(result), detail: { channel: input.channel, targetType: input.targetType } });
  return { id: insertedId(result) };
}

export async function deleteInternalWebhook(id: number) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  await db.delete(internalWebhooks).where(eq(internalWebhooks.id, id));
  await writeAuditLog({ category: "admin", action: "webhook.delete", targetType: "internal_webhook", targetId: id });
  return { id };
}

/** Webhook単体テスト送信。 */
export async function testInternalWebhook(id: number) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const rows = await db.select().from(internalWebhooks).where(eq(internalWebhooks.id, id)).limit(1);
  const w = rows[0];
  if (!w) throw new Error("webhook not found");
  const status = await dispatchWebhook(w, "【テスト送信】助成金対応リスキリングLMSからの内部通知です。");
  await writeAuditLog({ category: "admin", action: "webhook.test", targetType: "internal_webhook", targetId: id, detail: { status } });
  return { status };
}

/**
 * 内部通知の発火。対象スコープ(operator全体 + 該当partner/company)にマッチする
 * 有効なWebhookすべてに送信し、送信件数を返す。ベストエフォート(失敗しても本処理は継続)。
 */
export async function notifyInternal(text: string, scope?: { partnerId?: number; companyId?: number }) {
  const db = await getDb();
  if (!db) return { sent: 0, failed: 0 };
  const all = await db.select().from(internalWebhooks).where(eq(internalWebhooks.isActive, true));
  const matched = all.filter(w => {
    if (w.targetType === "operator") return true;
    if (w.targetType === "partner") return scope?.partnerId != null && w.targetId === scope.partnerId;
    if (w.targetType === "company") return scope?.companyId != null && w.targetId === scope.companyId;
    return false;
  });
  let sent = 0;
  let failed = 0;
  for (const w of matched) {
    const status = await dispatchWebhook(w, text);
    if (status === "sent") sent += 1;
    else if (status === "failed") failed += 1;
  }
  return { sent, failed };
}

// ============================================================
// プロジェクト・メンバー・権限(認証/アクセス制御)
// ============================================================

export async function getProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).orderBy(desc(projects.createdAt));
}

export async function createProject(input: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const result = await db.insert(projects).values(input);
  await writeAuditLog({ category: "admin", action: "project.create", targetType: "project", targetId: insertedId(result), detail: { name: input.name } });
  return { id: insertedId(result) };
}

export async function updateProject(id: number, input: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  await db.update(projects).set(input).where(eq(projects.id, id));
  await writeAuditLog({ category: "admin", action: "project.update", targetType: "project", targetId: id });
  return { id };
}

/** 企業をプロジェクトに割当(または解除)。 */
export async function assignCompanyToProject(companyId: number, projectId: number | null) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  await db.update(companies).set({ projectId }).where(eq(companies.id, companyId));
  await writeAuditLog({ category: "admin", action: "project.assign_company", targetType: "company", targetId: companyId, detail: { projectId } });
  return { ok: true };
}

export async function getCompaniesByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companies).where(eq(companies.projectId, projectId));
}

// --- メンバー(管理系アカウント) ---

export async function getMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lmsMembers).orderBy(desc(lmsMembers.createdAt));
}

export async function getMemberByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(lmsMembers).where(eq(lmsMembers.email, email)).limit(1);
  return rows[0];
}

export async function createMember(input: InsertLmsMember) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  const result = await db.insert(lmsMembers).values(input);
  await writeAuditLog({ category: "admin", action: "member.create", targetType: "lms_member", targetId: insertedId(result), detail: { role: input.role, email: input.email } });
  return { id: insertedId(result) };
}

export async function updateMember(id: number, input: Partial<InsertLmsMember>) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  await db.update(lmsMembers).set(input).where(eq(lmsMembers.id, id));
  await writeAuditLog({ category: "admin", action: "member.update", targetType: "lms_member", targetId: id });
  return { id };
}

export async function deleteMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error(REQUIRE_DB);
  await db.delete(lmsMembers).where(eq(lmsMembers.id, id));
  await writeAuditLog({ category: "admin", action: "member.delete", targetType: "lms_member", targetId: id });
  return { id };
}

// --- スコープ解決(アクセス制御の中核) ---

/**
 * メンバーがアクセスできる企業ID一覧を返す。null=無制限(operator_admin)。
 *  - operator_admin : 全企業(null)
 *  - project_manager: projectId 配下の企業
 *  - advisor        : projectId 配下 or companyId 単体
 *  - partner_admin  : partnerId に紐づく企業
 *  - company_rep    : companyId 単体
 *  - instructor     : 企業データ非対象([])
 */
export async function getAccessibleCompanyIds(member: Pick<LmsMember, "role" | "projectId" | "companyId" | "partnerId">): Promise<number[] | null> {
  const db = await getDb();
  if (!db) return [];
  if (member.role === "operator_admin") return null; // 無制限
  if (member.role === "instructor") return []; // コンテンツのみ。企業データ非対象
  if (member.role === "company_rep") return member.companyId != null ? [member.companyId] : [];
  if (member.role === "partner_admin") {
    if (member.partnerId == null) return [];
    const rows = await db.select().from(companies).where(eq(companies.partnerId, member.partnerId));
    return rows.map(c => c.id);
  }
  if (member.role === "project_manager" || member.role === "advisor") {
    const ids: number[] = [];
    if (member.projectId != null) {
      const rows = await db.select().from(companies).where(eq(companies.projectId, member.projectId));
      ids.push(...rows.map(c => c.id));
    }
    if (member.companyId != null && !ids.includes(member.companyId)) ids.push(member.companyId);
    return ids;
  }
  return [];
}

/** 指定企業へのアクセス可否。 */
export async function canAccessCompany(member: Pick<LmsMember, "role" | "projectId" | "companyId" | "partnerId">, companyId: number): Promise<boolean> {
  const ids = await getAccessibleCompanyIds(member);
  if (ids === null) return true; // operator_admin
  return ids.includes(companyId);
}

// ============================================================
// ログイン連携: 現在ユーザーのLMS権限を解決(認証統合)
// ============================================================

export type LmsRole = "operator_admin" | "project_manager" | "partner_admin" | "company_rep" | "instructor" | "advisor" | "employee";

export type LmsIdentity = {
  kind: "member" | "operator" | "learner";
  role: LmsRole;
  name: string;
  email: string;
  memberId?: number;
  learnerId?: number;
  projectId: number | null;
  companyId: number | null;
  partnerId: number | null;
};

export async function getLearnerByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(learners).where(eq(learners.email, email)).limit(1);
  return rows[0];
}

export async function countMembers(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select().from(lmsMembers);
  return rows.length;
}

/**
 * ログイン中の users 行から LMS 上のロール・スコープを解決する。
 * 優先順位: lms_members 一致 → プラットフォーム管理者(users.role=admin) → learners 一致
 *          → メンバー未登録の初期状態(bootstrap)は operator 扱い。
 * DB未接続やメンバー0件でも既存UIが壊れないようにする。
 */
export async function resolveLmsIdentity(user: { email?: string | null; name?: string | null; role?: string | null } | null | undefined): Promise<LmsIdentity | null> {
  if (!user) return null;
  const email = user.email ?? "";
  const name = user.name ?? (email || "ユーザー");

  // 開発用のロール確認オーバーライド(本番無効)。LMS_DEV_LOGIN=1 かつ LMS_DEV_ROLE 指定時のみ。
  if (process.env.NODE_ENV !== "production" && process.env.LMS_DEV_LOGIN === "1" && process.env.LMS_DEV_ROLE) {
    const role = process.env.LMS_DEV_ROLE as LmsRole;
    return {
      kind: role === "operator_admin" ? "operator" : role === "employee" ? "learner" : "member",
      role,
      name,
      email,
      learnerId: role === "employee" ? Number(process.env.LMS_DEV_LEARNER_ID ?? "1") : undefined,
      projectId: null,
      companyId: role === "company_rep" ? Number(process.env.LMS_DEV_COMPANY_ID ?? "1") : null,
      partnerId: role === "partner_admin" ? Number(process.env.LMS_DEV_PARTNER_ID ?? "1") : null,
    };
  }

  if (email) {
    const member = await getMemberByEmail(email);
    if (member && member.isActive) {
      return {
        kind: member.role === "operator_admin" ? "operator" : "member",
        role: member.role as LmsRole,
        name: member.name,
        email,
        memberId: member.id,
        projectId: member.projectId,
        companyId: member.companyId,
        partnerId: member.partnerId,
      };
    }
  }

  // プラットフォーム管理者は運営管理者として扱う
  if (user.role === "admin") {
    return { kind: "operator", role: "operator_admin", name, email, projectId: null, companyId: null, partnerId: null };
  }

  // 受講者(会社員)
  if (email) {
    const learner = await getLearnerByEmail(email);
    if (learner) {
      return { kind: "learner", role: "employee", name: learner.name, email, learnerId: learner.id, projectId: null, companyId: learner.companyId, partnerId: null };
    }
  }

  // 初期状態(メンバー未登録)は運営管理者としてブートストラップ
  if ((await countMembers()) === 0) {
    return { kind: "operator", role: "operator_admin", name, email, projectId: null, companyId: null, partnerId: null };
  }

  return null;
}

export function isOperator(id: LmsIdentity | null | undefined): boolean {
  return !!id && id.role === "operator_admin";
}

/** identity のアクセス可能企業ID(null=無制限)。 */
export async function accessibleCompanyIdsForIdentity(id: LmsIdentity | null): Promise<number[] | null> {
  if (!id) return [];
  if (id.role === "operator_admin") return null;
  if (id.role === "employee") return id.companyId != null ? [id.companyId] : [];
  return getAccessibleCompanyIds({ role: id.role, projectId: id.projectId, companyId: id.companyId, partnerId: id.partnerId });
}

/** identity が指定企業にアクセスできるか。 */
export async function canAccessCompanyIdentity(id: LmsIdentity | null, companyId: number): Promise<boolean> {
  const ids = await accessibleCompanyIdsForIdentity(id);
  if (ids === null) return true;
  return ids.includes(companyId);
}

/** identity が指定受講者(learner)にアクセスできるか(受講者の所属企業で判定)。 */
export async function canAccessLearnerIdentity(id: LmsIdentity | null, learnerId: number): Promise<boolean> {
  const learner = await getLearnerById(learnerId);
  if (!learner) return false;
  return canAccessCompanyIdentity(id, learner.companyId);
}

/** identity が指定受講割当(enrollment)にアクセスできるか。 */
export async function canAccessEnrollmentIdentity(id: LmsIdentity | null, enrollmentId: number): Promise<boolean> {
  const enrollment = await getEnrollmentById(enrollmentId);
  if (!enrollment) return false;
  return canAccessLearnerIdentity(id, enrollment.learnerId);
}

/** 受講者・受講割当の管理(登録/割当/リマインド)が可能なロールか。 */
export function canManageLearners(role: LmsRole): boolean {
  return role === "operator_admin" || role === "project_manager" || role === "company_rep";
}

// ============================================================
// ロール別ホーム(代表 / 協業先管理者)
// ============================================================

/** 代表(company_rep)向け: 自社の受講者と各コース進捗のまとめ。 */
export async function getCompanyProgress(companyId: number) {
  const db = await getDb();
  const company = await getCompanyById(companyId);
  const stats = await getDashboardStats(companyId);
  if (!db) return { company, stats, courses: new Map<number, string>(), learners: [] as Array<{ id: number; name: string; department: string | null; status: string; enrollments: Array<{ enrollmentId: number; courseId: number; progressRate: number; status: string }> }> };

  const learnerRows = await db.select().from(learners).where(eq(learners.companyId, companyId)).orderBy(desc(learners.createdAt));
  const learnerIds = learnerRows.map(l => l.id);
  const enrollmentRows = learnerIds.length > 0 ? await db.select().from(enrollments).where(inArray(enrollments.learnerId, learnerIds)) : [];
  const courseRows = await db.select().from(courses);
  const courseName = new Map(courseRows.map(c => [c.id, c.name] as const));

  const learnersOut = learnerRows.map(l => ({
    id: l.id,
    name: l.name,
    department: l.department,
    status: l.status as string,
    enrollments: enrollmentRows
      .filter(e => e.learnerId === l.id)
      .map(e => ({ enrollmentId: e.id, courseId: e.courseId, progressRate: e.progressRate, status: e.status as string })),
  }));

  return { company, stats, courses: Object.fromEntries(courseName), learners: learnersOut };
}

/** 協業先管理者(partner_admin)向け: 担当企業のロールアップ + 成果報酬サマリー。 */
export async function getPartnerCompaniesOverview(partnerId: number) {
  const db = await getDb();
  const partnerRows = db ? await db.select().from(partners).where(eq(partners.id, partnerId)).limit(1) : [];
  const partner = partnerRows[0];
  const monthly = await getMonthlyPartnerReport(partnerId);
  const forecastTotal = monthly.reduce((s, m) => s + m.feeAmount, 0);

  if (!db) return { partner, feeRate: partner?.successFeeRate ?? 20, companies: [] as Array<{ id: number; name: string; learners: number; enrollments: number; completed: number; avgProgress: number }>, monthly, forecastTotal };

  const companyRows = await db.select().from(companies).where(eq(companies.partnerId, partnerId));
  const out: Array<{ id: number; name: string; learners: number; enrollments: number; completed: number; avgProgress: number }> = [];
  for (const c of companyRows) {
    const cl = await db.select().from(learners).where(eq(learners.companyId, c.id));
    const ids = cl.map(l => l.id);
    let enr: Array<typeof enrollments.$inferSelect> = [];
    if (ids.length > 0) enr = await db.select().from(enrollments).where(inArray(enrollments.learnerId, ids));
    const avg = enr.length === 0 ? 0 : Math.round(enr.reduce((s, e) => s + e.progressRate, 0) / enr.length);
    out.push({ id: c.id, name: c.name, learners: cl.length, enrollments: enr.length, completed: enr.filter(e => e.status === "completed").length, avgProgress: avg });
  }
  return { partner, feeRate: partner?.successFeeRate ?? 20, companies: out, monthly, forecastTotal };
}

// ============================================================
// 講師・研修担当(instructor)ホーム: 担当コースの受講状況サマリー
// ============================================================

export async function getCourseSummaries() {
  const db = await getDb();
  if (!db) return [] as Array<{ id: number; name: string; totalMinutes: number; meetsSubsidy: boolean; lessons: number; quizzes: number; enrollments: number; completed: number; avgProgress: number; visibility: string }>;
  const courseRows = await db.select().from(courses).orderBy(desc(courses.createdAt));
  const out = [];
  for (const c of courseRows) {
    const lessonRows = await db.select().from(lessons).where(eq(lessons.courseId, c.id));
    const totalMinutes = lessonRows.reduce((s, l) => s + (l.durationMinutes ?? 0), 0);
    const quizRows = await db.select().from(quizzes).where(eq(quizzes.courseId, c.id));
    const enr = await db.select().from(enrollments).where(eq(enrollments.courseId, c.id));
    const completed = enr.filter(e => e.status === "completed").length;
    const avgProgress = enr.length === 0 ? 0 : Math.round(enr.reduce((s, e) => s + e.progressRate, 0) / enr.length);
    out.push({ id: c.id, name: c.name, totalMinutes, meetsSubsidy: meetsSubsidyMinutes(totalMinutes), lessons: lessonRows.length, quizzes: quizRows.length, enrollments: enr.length, completed, avgProgress, visibility: c.visibility as string });
  }
  return out;
}

// ============================================================
// ダッシュボード詳細(Lカートデザイン: 受講者ステータス一覧 + 会社別比較)
// ============================================================

export async function getDashboardDetail(scopeCompanyIds?: number[] | null, limit = 12) {
  const db = await getDb();
  const empty = { learners: [] as Array<{ id: number; name: string; company: string; progress: number; status: string; due: string | null }>, companyComparison: [] as Array<{ id: number; name: string; avgProgress: number }> };
  if (!db) return empty;

  let companyRows;
  if (scopeCompanyIds && scopeCompanyIds.length > 0) companyRows = await db.select().from(companies).where(inArray(companies.id, scopeCompanyIds));
  else if (scopeCompanyIds === null || scopeCompanyIds === undefined) companyRows = await db.select().from(companies);
  else return empty;
  const companyName = new Map(companyRows.map(c => [c.id, c.name] as const));
  const compIds = companyRows.map(c => c.id);
  if (compIds.length === 0) return empty;

  const learnerRows = await db.select().from(learners).where(inArray(learners.companyId, compIds));
  const learnerIds = learnerRows.map(l => l.id);
  const enrollmentRows = learnerIds.length > 0 ? await db.select().from(enrollments).where(inArray(enrollments.learnerId, learnerIds)) : [];

  // 受講者ステータス一覧(代表的な1割当を表示)
  const byLearner = new Map<number, typeof enrollmentRows[number]>();
  for (const e of enrollmentRows) if (!byLearner.has(e.learnerId)) byLearner.set(e.learnerId, e);
  const list = learnerRows.map(l => {
    const e = byLearner.get(l.id);
    return { id: l.id, name: l.name, company: companyName.get(l.companyId) ?? "", progress: e?.progressRate ?? 0, status: e?.status ?? "not_started", due: e?.dueDate ?? null };
  });
  // 進捗遅延/未開始/期限切れを上に
  const priority: Record<string, number> = { expired: 0, not_started: 1, delayed: 1, in_progress: 2, completed: 3 };
  list.sort((a, b) => (priority[a.status] ?? 2) - (priority[b.status] ?? 2) || a.progress - b.progress);

  // 会社別 平均進捗
  const companyComparison = companyRows.map(c => {
    const cl = learnerRows.filter(l => l.companyId === c.id).map(l => l.id);
    const enr = enrollmentRows.filter(e => cl.includes(e.learnerId));
    const avg = enr.length === 0 ? 0 : Math.round(enr.reduce((s, e) => s + e.progressRate, 0) / enr.length);
    return { id: c.id, name: c.name, avgProgress: avg };
  }).sort((a, b) => b.avgProgress - a.avgProgress);

  return { learners: list.slice(0, limit), companyComparison };
}

// ============================================================
// ユーザー管理 統合ビュー(モックP5: 全ユーザーをロールタブで一覧)
// ============================================================

export type PersonRow = { kind: "member" | "learner"; id: number; name: string; email: string | null; role: LmsRole; affiliation: string; status: string };

export async function getAllPeople(): Promise<PersonRow[]> {
  const db = await getDb();
  if (!db) return [];
  const companyRows = await db.select().from(companies);
  const companyName = new Map(companyRows.map(c => [c.id, c.name] as const));
  const partnerRows = await db.select().from(partners);
  const partnerName = new Map(partnerRows.map(p => [p.id, p.name] as const));

  const members = await db.select().from(lmsMembers).orderBy(desc(lmsMembers.createdAt));
  const learnerRows = await db.select().from(learners).orderBy(desc(learners.createdAt));

  const out: PersonRow[] = [];
  for (const m of members) {
    const affiliation = m.role === "partner_admin" ? (m.partnerId != null ? partnerName.get(m.partnerId) ?? "" : "") : m.role === "company_rep" ? (m.companyId != null ? companyName.get(m.companyId) ?? "" : "") : m.role === "advisor" || m.role === "project_manager" ? "担当プロジェクト" : "提供会社（Lカート）";
    out.push({ kind: "member", id: m.id, name: m.name, email: m.email, role: m.role as LmsRole, affiliation, status: m.isActive ? "active" : "suspended" });
  }
  for (const l of learnerRows) {
    out.push({ kind: "learner", id: l.id, name: l.name, email: l.email, role: "employee", affiliation: companyName.get(l.companyId) ?? "", status: l.status as string });
  }
  return out;
}
