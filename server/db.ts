import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  friends,
  friendTags,
  friendTagRelations,
  broadcasts,
  messageTemplates,
  stepScenarios,
  autoReplies,
  forms,
  reservationCalendars,
  trafficSources,
  integrations,
  InsertFriend,
  InsertBroadcast,
  InsertMessageTemplate,
  InsertForm,
  InsertTrafficSource,
  InsertIntegration,
  // Manufacturing AI
  manufacturingUsers,
  knowledgeDocuments,
  troubleshootingHistory,
  troubleshootingSessions,
  troubleshootingMessages,
  flowNodes,
  timelineEvents,
  escalations,
  manufacturingNotifications,
  aiLearningData,
  InsertManufacturingUser,
  InsertKnowledgeDocument,
  InsertTroubleshootingHistory,
  InsertTroubleshootingSession,
  InsertTroubleshootingMessage,
  InsertFlowNode,
  InsertTimelineEvent,
  InsertEscalation,
  InsertManufacturingNotification,
  InsertAiLearningData,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// Friends Management
// ============================================================

export async function getAllFriends() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(friends).orderBy(desc(friends.createdAt));
}

export async function getFriendById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(friends).where(eq(friends.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createFriend(friend: InsertFriend) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(friends).values(friend);
  return result;
}

// ============================================================
// Tags
// ============================================================

export async function getAllTags() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(friendTags).orderBy(desc(friendTags.createdAt));
}

// ============================================================
// Broadcasts
// ============================================================

export async function getAllBroadcasts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(broadcasts).orderBy(desc(broadcasts.createdAt));
}

export async function createBroadcast(broadcast: InsertBroadcast) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(broadcasts).values(broadcast);
  return result;
}

// ============================================================
// Templates
// ============================================================

export async function getAllTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messageTemplates).orderBy(desc(messageTemplates.createdAt));
}

export async function createTemplate(template: InsertMessageTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(messageTemplates).values(template);
  return result;
}

// ============================================================
// Forms
// ============================================================

export async function getAllForms() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(forms).orderBy(desc(forms.createdAt));
}

export async function createForm(form: InsertForm) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(forms).values(form);
  return result;
}

// ============================================================
// Traffic Sources
// ============================================================

export async function getAllTrafficSources() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trafficSources).orderBy(desc(trafficSources.createdAt));
}

export async function createTrafficSource(source: InsertTrafficSource) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(trafficSources).values(source);
  return result;
}

// ============================================================
// Integrations
// ============================================================

export async function getIntegrationByType(type: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(integrations).where(eq(integrations.integrationType, type as any)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertIntegration(integration: InsertIntegration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(integrations).values(integration).onDuplicateKeyUpdate({
    set: {
      status: integration.status,
      config: integration.config,
      updatedAt: new Date(),
    },
  });
}

// ============================================================
// Staff Management
// ============================================================

export async function getAllStaffMembers() {
  const db = await getDb();
  if (!db) return [];
  const { staffMembers } = await import("../drizzle/schema");
  return db.select().from(staffMembers);
}

export async function getStaffMemberById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { staffMembers } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const result = await db.select().from(staffMembers).where(eq(staffMembers.id, id));
  return result[0] || null;
}

export async function createStaffMember(data: { name: string; email: string; role: "sub_admin" | "operator" | "support" }) {
  const db = await getDb();
  if (!db) return null;
  const { staffMembers } = await import("../drizzle/schema");
  const result = await db.insert(staffMembers).values(data);
  return result;
}

export async function updateStaffMember(id: number, data: Partial<{ name: string; email: string; role: "sub_admin" | "operator" | "support"; isActive: boolean }>) {
  const db = await getDb();
  if (!db) return null;
  const { staffMembers } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const result = await db.update(staffMembers).set(data).where(eq(staffMembers.id, id));
  return result;
}

export async function deleteStaffMember(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { staffMembers } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const result = await db.delete(staffMembers).where(eq(staffMembers.id, id));
  return result;
}

export async function getStaffPermissions(staffId: number) {
  const db = await getDb();
  if (!db) return [];
  const { staffPermissions } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  return db.select().from(staffPermissions).where(eq(staffPermissions.staffId, staffId));
}

export async function updateStaffPermissions(staffId: number, permissions: Array<{ category: string; permission: string; isAllowed: boolean }>) {
  const db = await getDb();
  if (!db) return null;
  const { staffPermissions } = await import("../drizzle/schema");
  const { eq, and } = await import("drizzle-orm");

  // Delete existing permissions and insert new ones
  await db.delete(staffPermissions).where(eq(staffPermissions.staffId, staffId));

  const values = permissions.map(p => ({
    staffId,
    category: p.category,
    permission: p.permission,
    isAllowed: p.isAllowed,
  }));

  if (values.length > 0) {
    await db.insert(staffPermissions).values(values);
  }

  return { success: true };
}

// ============================================================
// Manufacturing AI System
// ============================================================

// Manufacturing Users
export async function getAllManufacturingUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(manufacturingUsers).orderBy(desc(manufacturingUsers.createdAt));
}

export async function getManufacturingUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(manufacturingUsers).where(eq(manufacturingUsers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createManufacturingUser(user: Omit<InsertManufacturingUser, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(manufacturingUsers).values(user as InsertManufacturingUser);
  return result;
}

export async function updateManufacturingUser(id: number, data: Partial<InsertManufacturingUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(manufacturingUsers).set(data).where(eq(manufacturingUsers.id, id));
  return result;
}

// Troubleshooting Sessions
export async function getAllTroubleshootingSessions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(troubleshootingSessions).orderBy(desc(troubleshootingSessions.createdAt));
}

export async function getTroubleshootingSessionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(troubleshootingSessions).where(eq(troubleshootingSessions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTroubleshootingSession(session: Omit<InsertTroubleshootingSession, "id" | "sessionId" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const result = await db.insert(troubleshootingSessions).values({
    ...session,
    sessionId,
  } as InsertTroubleshootingSession);
  return result;
}

export async function updateTroubleshootingSessionStatus(id: number, status: "active" | "resolved" | "escalated" | "closed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { status };
  if (status === "resolved" || status === "closed") {
    updateData.resolvedAt = new Date();
  }
  const result = await db.update(troubleshootingSessions).set(updateData).where(eq(troubleshootingSessions.id, id));
  return result;
}

// Troubleshooting Messages
export async function getTroubleshootingMessagesBySession(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(troubleshootingMessages)
    .where(eq(troubleshootingMessages.sessionId, sessionId))
    .orderBy(troubleshootingMessages.createdAt);
}

export async function createTroubleshootingMessage(message: Omit<InsertTroubleshootingMessage, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(troubleshootingMessages).values(message as InsertTroubleshootingMessage);
  return result;
}

// Knowledge Documents
export async function getAllKnowledgeDocuments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(knowledgeDocuments).orderBy(desc(knowledgeDocuments.createdAt));
}

export async function createKnowledgeDocument(doc: Omit<InsertKnowledgeDocument, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(knowledgeDocuments).values(doc as InsertKnowledgeDocument);
  return result;
}

// Troubleshooting History
export async function getAllTroubleshootingHistory() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(troubleshootingHistory).orderBy(desc(troubleshootingHistory.createdAt));
}

export async function createTroubleshootingHistory(history: Omit<InsertTroubleshootingHistory, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(troubleshootingHistory).values(history as InsertTroubleshootingHistory);
  return result;
}

// AI Learning Data
export async function getAllAiLearningData() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiLearningData).orderBy(desc(aiLearningData.createdAt));
}

export async function createAiLearningData(data: Omit<InsertAiLearningData, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiLearningData).values(data as InsertAiLearningData);
  return result;
}

// Escalations
export async function getAllEscalations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(escalations).orderBy(desc(escalations.createdAt));
}

export async function getEscalationsBySession(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(escalations)
    .where(eq(escalations.sessionId, sessionId))
    .orderBy(desc(escalations.createdAt));
}

export async function createEscalation(escalation: Omit<InsertEscalation, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(escalations).values(escalation as InsertEscalation);
  return result;
}

export async function assignEscalation(id: number, assignedTo: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(escalations).set({
    assignedTo,
    status: "assigned",
    notifiedAt: new Date(),
  }).where(eq(escalations.id, id));
  return result;
}

export async function updateEscalationStatus(id: number, status: "pending" | "assigned" | "in_progress" | "resolved" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { status };
  if (status === "in_progress") {
    updateData.respondedAt = new Date();
  } else if (status === "resolved") {
    updateData.resolvedAt = new Date();
  }
  const result = await db.update(escalations).set(updateData).where(eq(escalations.id, id));
  return result;
}

// Flow Nodes
export async function getFlowNodesBySession(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(flowNodes)
    .where(eq(flowNodes.sessionId, sessionId))
    .orderBy(flowNodes.createdAt);
}

export async function createFlowNode(node: Omit<InsertFlowNode, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(flowNodes).values(node as InsertFlowNode);
  return result;
}

export async function updateFlowNodeStatus(id: number, status: "pending" | "current" | "completed" | "failed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(flowNodes).set({ status }).where(eq(flowNodes.id, id));
  return result;
}

// Timeline Events
export async function getTimelineEventsBySession(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(timelineEvents)
    .where(eq(timelineEvents.sessionId, sessionId))
    .orderBy(timelineEvents.createdAt);
}

export async function createTimelineEvent(event: Omit<InsertTimelineEvent, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(timelineEvents).values(event as InsertTimelineEvent);
  return result;
}

// Notifications
export async function getNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(manufacturingNotifications)
    .where(eq(manufacturingNotifications.userId, userId))
    .orderBy(desc(manufacturingNotifications.createdAt));
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(manufacturingNotifications).set({ isRead: true }).where(eq(manufacturingNotifications.id, id));
  return result;
}

// Dashboard Stats
export async function getManufacturingDashboardStats() {
  const db = await getDb();
  if (!db) return {
    totalSessions: 0,
    aiResolvedRate: 0,
    avgResolutionTime: 0,
    pendingEscalations: 0,
    activeExperts: 0,
    knowledgeItems: 0,
  };

  // In a real implementation, these would be actual database queries
  // For now, return mock stats
  return {
    totalSessions: 156,
    aiResolvedRate: 78,
    avgResolutionTime: 8,
    pendingEscalations: 3,
    activeExperts: 4,
    knowledgeItems: 269,
  };
}
