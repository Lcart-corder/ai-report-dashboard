import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// Friends Management
// ============================================================

export const friends = mysqlTable("friends", {
  id: int("id").autoincrement().primaryKey(),
  lineUserId: varchar("lineUserId", { length: 128 }).notNull().unique(),
  displayName: text("displayName"),
  pictureUrl: text("pictureUrl"),
  statusMessage: text("statusMessage"),
  isBlocked: boolean("isBlocked").default(false).notNull(),
  followedAt: timestamp("followedAt"),
  blockedAt: timestamp("blockedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Friend = typeof friends.$inferSelect;
export type InsertFriend = typeof friends.$inferInsert;

export const friendTags = mysqlTable("friend_tags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  color: varchar("color", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FriendTag = typeof friendTags.$inferSelect;
export type InsertFriendTag = typeof friendTags.$inferInsert;

export const friendTagRelations = mysqlTable("friend_tag_relations", {
  id: int("id").autoincrement().primaryKey(),
  friendId: int("friendId").notNull(),
  tagId: int("tagId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FriendTagRelation = typeof friendTagRelations.$inferSelect;
export type InsertFriendTagRelation = typeof friendTagRelations.$inferInsert;

export const friendCustomFields = mysqlTable("friend_custom_fields", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  fieldType: mysqlEnum("fieldType", ["text", "number", "date", "select"]).notNull(),
  options: json("options"), // For select type
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FriendCustomField = typeof friendCustomFields.$inferSelect;
export type InsertFriendCustomField = typeof friendCustomFields.$inferInsert;

export const friendCustomFieldValues = mysqlTable("friend_custom_field_values", {
  id: int("id").autoincrement().primaryKey(),
  friendId: int("friendId").notNull(),
  fieldId: int("fieldId").notNull(),
  value: text("value"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FriendCustomFieldValue = typeof friendCustomFieldValues.$inferSelect;
export type InsertFriendCustomFieldValue = typeof friendCustomFieldValues.$inferInsert;

// ============================================================
// Message Templates
// ============================================================

export const messageTemplates = mysqlTable("message_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  templateType: mysqlEnum("templateType", ["text", "image", "video", "card", "carousel"]).notNull(),
  content: json("content").notNull(), // Flexible JSON structure
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertMessageTemplate = typeof messageTemplates.$inferInsert;

// ============================================================
// Broadcasts
// ============================================================

export const broadcasts = mysqlTable("broadcasts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  status: mysqlEnum("status", ["draft", "scheduled", "sent", "failed"]).default("draft").notNull(),
  targetType: mysqlEnum("targetType", ["all", "tags", "custom"]).default("all").notNull(),
  targetConditions: json("targetConditions"), // Tag IDs, custom filters
  messages: json("messages").notNull(), // Array of message objects
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Broadcast = typeof broadcasts.$inferSelect;
export type InsertBroadcast = typeof broadcasts.$inferInsert;

// ============================================================
// Step Scenarios
// ============================================================

export const stepScenarios = mysqlTable("step_scenarios", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive").notNull(),
  triggerType: mysqlEnum("triggerType", ["tag", "action", "manual"]).notNull(),
  triggerConditions: json("triggerConditions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StepScenario = typeof stepScenarios.$inferSelect;
export type InsertStepScenario = typeof stepScenarios.$inferInsert;

export const stepScenarioSteps = mysqlTable("step_scenario_steps", {
  id: int("id").autoincrement().primaryKey(),
  scenarioId: int("scenarioId").notNull(),
  stepOrder: int("stepOrder").notNull(),
  delayDays: int("delayDays").default(0).notNull(),
  delayHours: int("delayHours").default(0).notNull(),
  messages: json("messages").notNull(),
  actions: json("actions"), // Tag operations, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StepScenarioStep = typeof stepScenarioSteps.$inferSelect;
export type InsertStepScenarioStep = typeof stepScenarioSteps.$inferInsert;

// ============================================================
// Auto Reply
// ============================================================

export const autoReplies = mysqlTable("auto_replies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive").notNull(),
  triggerType: mysqlEnum("triggerType", ["keyword", "any"]).notNull(),
  keywords: json("keywords"), // Array of keywords
  replyMessages: json("replyMessages").notNull(),
  actions: json("actions"), // Tag operations, etc.
  priority: int("priority").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutoReply = typeof autoReplies.$inferSelect;
export type InsertAutoReply = typeof autoReplies.$inferInsert;

// ============================================================
// Action Schedules
// ============================================================

export const actionSchedules = mysqlTable("action_schedules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive").notNull(),
  triggerType: mysqlEnum("triggerType", ["date", "elapsed"]).notNull(),
  triggerDate: timestamp("triggerDate"),
  elapsedDays: int("elapsedDays"),
  elapsedCondition: mysqlEnum("elapsedCondition", ["friend_added", "tag_added", "form_submitted"]),
  targetConditions: json("targetConditions"),
  actions: json("actions").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ActionSchedule = typeof actionSchedules.$inferSelect;
export type InsertActionSchedule = typeof actionSchedules.$inferInsert;

// ============================================================
// Greeting Messages
// ============================================================

export const greetingMessages = mysqlTable("greeting_messages", {
  id: int("id").autoincrement().primaryKey(),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive").notNull(),
  messages: json("messages").notNull(),
  actions: json("actions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GreetingMessage = typeof greetingMessages.$inferSelect;
export type InsertGreetingMessage = typeof greetingMessages.$inferInsert;

// ============================================================
// Rich Menus
// ============================================================

export const richMenus = mysqlTable("rich_menus", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  lineRichMenuId: varchar("lineRichMenuId", { length: 128 }),
  imageUrl: text("imageUrl"),
  size: json("size"), // { width, height }
  areas: json("areas").notNull(), // Array of area definitions
  defaultMenu: boolean("defaultMenu").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RichMenu = typeof richMenus.$inferSelect;
export type InsertRichMenu = typeof richMenus.$inferInsert;

// ============================================================
// Reservation Calendars
// ============================================================

export const reservationCalendars = mysqlTable("reservation_calendars", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive").notNull(),
  acceptanceDeadlineDays: int("acceptanceDeadlineDays").default(0).notNull(),
  businessHours: json("businessHours"), // { start, end, weekdays }
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReservationCalendar = typeof reservationCalendars.$inferSelect;
export type InsertReservationCalendar = typeof reservationCalendars.$inferInsert;

export const reservationCourses = mysqlTable("reservation_courses", {
  id: int("id").autoincrement().primaryKey(),
  calendarId: int("calendarId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  durationMinutes: int("durationMinutes").notNull(),
  price: int("price"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReservationCourse = typeof reservationCourses.$inferSelect;
export type InsertReservationCourse = typeof reservationCourses.$inferInsert;

export const reservationShifts = mysqlTable("reservation_shifts", {
  id: int("id").autoincrement().primaryKey(),
  calendarId: int("calendarId").notNull(),
  staffName: varchar("staffName", { length: 128 }),
  date: timestamp("date").notNull(),
  startTime: varchar("startTime", { length: 8 }).notNull(), // HH:MM
  endTime: varchar("endTime", { length: 8 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReservationShift = typeof reservationShifts.$inferSelect;
export type InsertReservationShift = typeof reservationShifts.$inferInsert;

export const reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  calendarId: int("calendarId").notNull(),
  courseId: int("courseId").notNull(),
  friendId: int("friendId").notNull(),
  reservationDate: timestamp("reservationDate").notNull(),
  startTime: varchar("startTime", { length: 8 }).notNull(),
  endTime: varchar("endTime", { length: 8 }).notNull(),
  status: mysqlEnum("status", ["confirmed", "cancelled"]).default("confirmed").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;

// ============================================================
// Forms
// ============================================================

export const forms = mysqlTable("forms", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive").notNull(),
  headerImageUrl: text("headerImageUrl"),
  themeColor: varchar("themeColor", { length: 32 }),
  completionActions: json("completionActions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Form = typeof forms.$inferSelect;
export type InsertForm = typeof forms.$inferInsert;

export const formQuestions = mysqlTable("form_questions", {
  id: int("id").autoincrement().primaryKey(),
  formId: int("formId").notNull(),
  questionOrder: int("questionOrder").notNull(),
  questionType: mysqlEnum("questionType", ["short_text", "long_text", "single_choice", "multiple_choice", "dropdown", "date", "image"]).notNull(),
  questionText: text("questionText").notNull(),
  required: boolean("required").default(false).notNull(),
  options: json("options"), // For choice types
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FormQuestion = typeof formQuestions.$inferSelect;
export type InsertFormQuestion = typeof formQuestions.$inferInsert;

export const formResponses = mysqlTable("form_responses", {
  id: int("id").autoincrement().primaryKey(),
  formId: int("formId").notNull(),
  friendId: int("friendId").notNull(),
  answers: json("answers").notNull(), // { questionId: answer }
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export type FormResponse = typeof formResponses.$inferSelect;
export type InsertFormResponse = typeof formResponses.$inferInsert;

// ============================================================
// Traffic Sources
// ============================================================

export const trafficSources = mysqlTable("traffic_sources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  folder: varchar("folder", { length: 128 }),
  sourceType: mysqlEnum("sourceType", ["qr", "url"]).default("qr").notNull(),
  url: text("url").notNull(),
  qrCodeUrl: text("qrCodeUrl"),
  triggerActions: json("triggerActions"),
  triggerForExisting: boolean("triggerForExisting").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrafficSource = typeof trafficSources.$inferSelect;
export type InsertTrafficSource = typeof trafficSources.$inferInsert;

// ============================================================
// Conversions
// ============================================================

export const conversions = mysqlTable("conversions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  conversionType: mysqlEnum("conversionType", ["form_submit", "purchase", "custom"]).notNull(),
  targetId: int("targetId"), // Form ID, Product ID, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversion = typeof conversions.$inferSelect;
export type InsertConversion = typeof conversions.$inferInsert;

// ============================================================
// Action Logs
// ============================================================

export const actionLogs = mysqlTable("action_logs", {
  id: int("id").autoincrement().primaryKey(),
  friendId: int("friendId"),
  actionType: varchar("actionType", { length: 128 }).notNull(),
  actionDetails: json("actionDetails"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type ActionLog = typeof actionLogs.$inferSelect;
export type InsertActionLog = typeof actionLogs.$inferInsert;

// ============================================================
// Integrations
// ============================================================

export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  integrationType: mysqlEnum("integrationType", ["shopify", "rakuten", "line_official", "line_ads", "chatgpt"]).notNull().unique(),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive").notNull(),
  config: json("config").notNull(), // API keys, settings, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

// ============================================================
// Chats
// ============================================================

export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  friendId: int("friendId").notNull(),
  direction: mysqlEnum("direction", ["incoming", "outgoing"]).notNull(),
  messageType: mysqlEnum("messageType", ["text", "image", "video", "sticker", "file"]).notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ============================================================
// Staff Management
// ============================================================

export const staffMembers = mysqlTable("staff_members", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  role: mysqlEnum("role", ["sub_admin", "operator", "support"]).notNull(),
  inviteToken: varchar("inviteToken", { length: 128 }).unique(),
  inviteExpiresAt: timestamp("inviteExpiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StaffMember = typeof staffMembers.$inferSelect;
export type InsertStaffMember = typeof staffMembers.$inferInsert;

export const staffPermissions = mysqlTable("staff_permissions", {
  id: int("id").autoincrement().primaryKey(),
  staffId: int("staffId").notNull(),
  category: varchar("category", { length: 64 }).notNull(), // e.g., "friends", "messages", "analysis"
  permission: varchar("permission", { length: 64 }).notNull(), // e.g., "view", "edit", "delete"
  isAllowed: boolean("isAllowed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StaffPermission = typeof staffPermissions.$inferSelect;
export type InsertStaffPermission = typeof staffPermissions.$inferInsert;

// ============================================================
// 助成金対応リスキリング動画学習システム (LMS)
// 詳細は reskilling-lms/REQUIREMENTS.md §8 を参照
// ------------------------------------------------------------
// テナント構造: partners(協業先) → companies(導入企業)
//   → company_branches(事業所) → learners(受講者)
// 設計思想: 「動画を見せるシステム」ではなく「助成金対応の証跡を残すシステム」
// ============================================================

/** 協業先(販売パートナー)。案件・研修売上・成果報酬(研修売上の20%)の管理単位。 */
export const partners = mysqlTable("partners", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  contactName: varchar("contactName", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  /** 成果報酬率(%)。基本20。助成金受給額には連動させない。 */
  successFeeRate: int("successFeeRate").default(20).notNull(),
  contractNote: text("contractNote"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

/** 導入企業。証跡出力は自社分のみ閲覧可能(データ分離)。 */
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId"),
  name: varchar("name", { length: 255 }).notNull(),
  /** 法人番号(13桁) */
  corporateNumber: varchar("corporateNumber", { length: 13 }),
  address: text("address"),
  contactName: varchar("contactName", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contractStartDate: varchar("contractStartDate", { length: 10 }),
  contractEndDate: varchar("contractEndDate", { length: 10 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

/** 事業所。雇用保険適用事業所単位で管理。 */
export const companyBranches = mysqlTable("company_branches", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  /** 雇用保険適用事業所番号 */
  insuranceOfficeNumber: varchar("insuranceOfficeNumber", { length: 32 }),
  address: text("address"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CompanyBranch = typeof companyBranches.$inferSelect;
export type InsertCompanyBranch = typeof companyBranches.$inferInsert;

/** 企業別マスターキー。これ無しでの自由登録は不可(FR-02)。 */
export const masterKeys = mysqlTable("master_keys", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  /** 受講者が初回登録に使う一意キー */
  keyCode: varchar("keyCode", { length: 64 }).notNull().unique(),
  /** 有効期限(YYYY-MM-DD)。null=無期限 */
  expiresAt: varchar("expiresAt", { length: 10 }),
  /** 利用回数上限。null=無制限 */
  maxUses: int("maxUses"),
  usedCount: int("usedCount").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MasterKey = typeof masterKeys.$inferSelect;
export type InsertMasterKey = typeof masterKeys.$inferInsert;

/** 受講者(スタッフ)。企業・事業所・部署に紐づく。 */
export const learners = mysqlTable("learners", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  branchId: int("branchId"),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  /** LINE公式アカウントを友だち追加した受講者のuserId(任意)。LINE通知の宛先。 */
  lineUserId: varchar("lineUserId", { length: 128 }),
  /** 希望通知チャネル(email/line/app)。既定はメール(多社セグメント配信に最適)。 */
  preferredChannel: mysqlEnum("preferredChannel", ["email", "line", "app"]).default("email").notNull(),
  employeeNumber: varchar("employeeNumber", { length: 64 }),
  department: varchar("department", { length: 128 }),
  status: mysqlEnum("status", ["invited", "active", "delayed", "completed", "expired", "suspended"]).default("invited").notNull(),
  invitedAt: timestamp("invitedAt"),
  firstLoginAt: timestamp("firstLoginAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Learner = typeof learners.$inferSelect;
export type InsertLearner = typeof learners.$inferInsert;

/** コース。標準学習時間10時間以上・訓練期間の管理単位(FR-05)。 */
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  /** 標準学習時間(分)。600分(10時間)以上を助成金要件として判定 */
  standardMinutes: int("standardMinutes").default(0).notNull(),
  /** 標準学習期間(日)。必要に応じ30日(1か月)以上 */
  standardPeriodDays: int("standardPeriodDays"),
  trainingStartDate: varchar("trainingStartDate", { length: 10 }),
  trainingEndDate: varchar("trainingEndDate", { length: 10 }),
  /** 助成金対象区分(例: リスキリング支援コース) */
  subsidyCategory: varchar("subsidyCategory", { length: 128 }),
  /** 修了に必要な合格点(%) */
  passingScore: int("passingScore").default(80).notNull(),
  requireReport: boolean("requireReport").default(true).notNull(),
  /** 価格情報(研修費/LMS利用料/運用支援費等を分離登録) */
  tuitionFee: int("tuitionFee").default(0).notNull(),
  lmsFee: int("lmsFee").default(0).notNull(),
  supportFee: int("supportFee").default(0).notNull(),
  visibility: mysqlEnum("visibility", ["public", "private", "company_limited"]).default("private").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/** 動画レッスン。章・単元ごとに整理(FR-06)。 */
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  chapter: varchar("chapter", { length: 128 }),
  videoUrl: text("videoUrl"),
  /** この動画の標準学習時間(分) */
  durationMinutes: int("durationMinutes").default(0).notNull(),
  /** 表示順 */
  sortOrder: int("sortOrder").default(0).notNull(),
  /** 前の動画完了後に次へ進む制御 */
  requireSequential: boolean("requireSequential").default(false).notNull(),
  isRequired: boolean("isRequired").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

/** 添付資料(PDF・スライド)。 */
export const materials = mysqlTable("materials", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  fileUrl: text("fileUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;

/** 受講割当。受講者×コース。修了判定の主体。 */
export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  learnerId: int("learnerId").notNull(),
  courseId: int("courseId").notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed", "expired"]).default("not_started").notNull(),
  /** 進捗率 0-100(自動計算) */
  progressRate: int("progressRate").default(0).notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  /** 受講期限(YYYY-MM-DD) */
  dueDate: varchar("dueDate", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;

/** 視聴ログ。改ざん防止のため管理者でも直接編集不可の扱い(FR-07)。 */
export const progressLogs = mysqlTable("progress_logs", {
  id: int("id").autoincrement().primaryKey(),
  enrollmentId: int("enrollmentId").notNull(),
  lessonId: int("lessonId").notNull(),
  startedAt: timestamp("startedAt"),
  endedAt: timestamp("endedAt"),
  /** 視聴率 0-100 */
  watchRate: int("watchRate").default(0).notNull(),
  completedAt: timestamp("completedAt"),
  /** 再視聴回数 */
  replayCount: int("replayCount").default(0).notNull(),
  /** 途中離脱位置(秒) */
  lastPositionSec: int("lastPositionSec").default(0).notNull(),
  /** 倍速視聴の利用状況 */
  playbackRate: varchar("playbackRate", { length: 8 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ProgressLog = typeof progressLogs.$inferSelect;
export type InsertProgressLog = typeof progressLogs.$inferInsert;

/** 確認チェック。制度上の証跡強化のため独自の必須修了条件(FR-08)。 */
export const completionChecks = mysqlTable("completion_checks", {
  id: int("id").autoincrement().primaryKey(),
  enrollmentId: int("enrollmentId").notNull(),
  lessonId: int("lessonId").notNull(),
  learnerId: int("learnerId").notNull(),
  checkedAt: timestamp("checkedAt").defaultNow().notNull(),
});
export type CompletionCheck = typeof completionChecks.$inferSelect;
export type InsertCompletionCheck = typeof completionChecks.$inferInsert;

/** 確認テスト。コース・章単位(FR-09)。 */
export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  /** 合格点(%) */
  passingScore: int("passingScore").default(80).notNull(),
  /** 再受験回数上限。null=無制限 */
  maxAttempts: int("maxAttempts"),
  /** 制限時間(分)。null=無制限 */
  timeLimitMinutes: int("timeLimitMinutes"),
  shuffleQuestions: boolean("shuffleQuestions").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

/** 設問。単一選択/複数選択/記述式。 */
export const quizQuestions = mysqlTable("quiz_questions", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  questionText: text("questionText").notNull(),
  questionType: mysqlEnum("questionType", ["single", "multiple", "text"]).default("single").notNull(),
  /** 選択肢(配列) */
  options: json("options"),
  /** 正解(単一/複数選択のインデックス配列) */
  correctAnswers: json("correctAnswers"),
  points: int("points").default(1).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
});
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = typeof quizQuestions.$inferInsert;

/** テスト結果。点数・回答・合否・日時を保存。 */
export const quizResults = mysqlTable("quiz_results", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  enrollmentId: int("enrollmentId").notNull(),
  learnerId: int("learnerId").notNull(),
  score: int("score").default(0).notNull(),
  passed: boolean("passed").default(false).notNull(),
  answers: json("answers"),
  attemptNumber: int("attemptNumber").default(1).notNull(),
  takenAt: timestamp("takenAt").defaultNow().notNull(),
});
export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = typeof quizResults.$inferInsert;

/** 学習レポート。学んだこと・業務への活かし方(FR-10)。 */
export const learningReports = mysqlTable("learning_reports", {
  id: int("id").autoincrement().primaryKey(),
  enrollmentId: int("enrollmentId").notNull(),
  learnerId: int("learnerId").notNull(),
  /** 学んだこと */
  whatLearned: text("whatLearned"),
  /** 業務への活かし方 */
  howToApply: text("howToApply"),
  status: mysqlEnum("status", ["draft", "submitted", "returned", "approved"]).default("draft").notNull(),
  /** 差戻しコメント(管理者・社労士) */
  reviewComment: text("reviewComment"),
  submittedAt: timestamp("submittedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LearningReport = typeof learningReports.$inferSelect;
export type InsertLearningReport = typeof learningReports.$inferInsert;

/** 修了証(FR-12)。 */
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  enrollmentId: int("enrollmentId").notNull(),
  learnerId: int("learnerId").notNull(),
  courseId: int("courseId").notNull(),
  /** 一意の証明番号 */
  certificateNumber: varchar("certificateNumber", { length: 64 }).notNull().unique(),
  learnerName: varchar("learnerName", { length: 255 }).notNull(),
  courseName: varchar("courseName", { length: 255 }).notNull(),
  standardMinutes: int("standardMinutes").default(0).notNull(),
  completionDate: varchar("completionDate", { length: 10 }).notNull(),
  issuer: varchar("issuer", { length: 255 }),
  reissueCount: int("reissueCount").default(0).notNull(),
  downloadCount: int("downloadCount").default(0).notNull(),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
});
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

/** 通知ルール(FR-14)。 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  /** トリガー(例: registered, no_login_3d, due_7d, due_3d, due_1d, quiz_pending, completed) */
  trigger: varchar("trigger", { length: 64 }).notNull(),
  /** チャネル(email/line/sms/app/chatwork/slack/googlechat) */
  channel: varchar("channel", { length: 32 }).default("email").notNull(),
  template: text("template"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/** 通知履歴。 */
export const notificationLogs = mysqlTable("notification_logs", {
  id: int("id").autoincrement().primaryKey(),
  notificationId: int("notificationId"),
  learnerId: int("learnerId"),
  channel: varchar("channel", { length: 32 }).notNull(),
  status: mysqlEnum("status", ["queued", "sent", "failed"]).default("queued").notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type NotificationLog = typeof notificationLogs.$inferSelect;
export type InsertNotificationLog = typeof notificationLogs.$inferInsert;

/** 申請準備チェック(FR-16)。企業×コース単位で不足項目を判定。 */
export const applicationChecklists = mysqlTable("application_checklists", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  courseId: int("courseId").notNull(),
  /** 各判定項目(○/×)をJSONで保持 */
  items: json("items"),
  /** 社労士確認済み */
  reviewedByAdvisor: boolean("reviewedByAdvisor").default(false).notNull(),
  advisorComment: text("advisorComment"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ApplicationChecklist = typeof applicationChecklists.$inferSelect;
export type InsertApplicationChecklist = typeof applicationChecklists.$inferInsert;

/** 証跡出力履歴(FR-15/監査)。誰がいつ何を出力したか。 */
export const exports = mysqlTable("exports", {
  id: int("id").autoincrement().primaryKey(),
  exportType: varchar("exportType", { length: 64 }).notNull(),
  format: mysqlEnum("format", ["csv", "pdf"]).notNull(),
  companyId: int("companyId"),
  courseId: int("courseId"),
  exportedBy: varchar("exportedBy", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ExportRecord = typeof exports.$inferSelect;
export type InsertExportRecord = typeof exports.$inferInsert;

/** 協業先売上(FR-17)。成果報酬の算定基礎。 */
export const partnerSales = mysqlTable("partner_sales", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull(),
  companyId: int("companyId"),
  /** 対象月(YYYY-MM) */
  yearMonth: varchar("yearMonth", { length: 7 }).notNull(),
  /** 研修売上額(成果報酬の対象。助成金受給額ではない) */
  trainingSales: int("trainingSales").default(0).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PartnerSale = typeof partnerSales.$inferSelect;
export type InsertPartnerSale = typeof partnerSales.$inferInsert;

/** 成果報酬(FR-18)。研修売上×報酬率。助成金受給額には非連動。 */
export const successFees = mysqlTable("success_fees", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull(),
  partnerSaleId: int("partnerSaleId"),
  yearMonth: varchar("yearMonth", { length: 7 }).notNull(),
  baseSales: int("baseSales").default(0).notNull(),
  feeRate: int("feeRate").default(20).notNull(),
  feeAmount: int("feeAmount").default(0).notNull(),
  status: mysqlEnum("status", ["draft", "invoiced", "paid"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SuccessFee = typeof successFees.$inferSelect;
export type InsertSuccessFee = typeof successFees.$inferInsert;

/** 監査ログ(FR-19)。ログイン/受講/チェック/テスト/修了/出力/変更/管理者操作。 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  /** 対象カテゴリ(login/progress/check/quiz/completion/export/user_change/admin) */
  category: varchar("category", { length: 32 }).notNull(),
  action: varchar("action", { length: 128 }).notNull(),
  actor: varchar("actor", { length: 320 }),
  /** 対象エンティティ種別と id */
  targetType: varchar("targetType", { length: 64 }),
  targetId: int("targetId"),
  /** 補足情報 */
  detail: json("detail"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * 内部通知Webhook(FR-14拡張)。協業先・企業管理者・運営向けの無料内部通知。
 * - slack / googlechat: Incoming Webhook URL に {text} をPOST(無料)
 * - chatwork: API(トークン + ルームID)でメッセージ送信
 * targetType=operator は運営全体、partner/company は対象IDに紐づく。
 */
export const internalWebhooks = mysqlTable("internal_webhooks", {
  id: int("id").autoincrement().primaryKey(),
  targetType: mysqlEnum("targetType", ["operator", "partner", "company"]).default("operator").notNull(),
  targetId: int("targetId"),
  channel: mysqlEnum("channel", ["slack", "googlechat", "chatwork"]).notNull(),
  label: varchar("label", { length: 255 }),
  /** slack/googlechat の Incoming Webhook URL */
  webhookUrl: text("webhookUrl"),
  /** chatwork APIトークン */
  apiToken: varchar("apiToken", { length: 128 }),
  /** chatwork ルームID */
  roomId: varchar("roomId", { length: 64 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type InternalWebhook = typeof internalWebhooks.$inferSelect;
export type InsertInternalWebhook = typeof internalWebhooks.$inferInsert;
