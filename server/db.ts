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
