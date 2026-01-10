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
