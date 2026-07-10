import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  agentMemories,
  agentRuns,
  agentRunSteps,
  agentSkills,
  AgentMemory,
  AgentRun,
  AgentRunStep,
  AgentSkill,
  InsertAgentMemory,
  InsertAgentRun,
  InsertAgentRunStep,
  InsertAgentSkill,
} from "../../drizzle/schema";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

// ---- Runs (長時間実行のState管理) ----

export async function createAgentRun(run: InsertAgentRun): Promise<number> {
  const db = await requireDb();
  const [result] = await db.insert(agentRuns).values(run);
  return result.insertId;
}

export async function updateAgentRun(id: number, patch: Partial<InsertAgentRun>): Promise<void> {
  const db = await requireDb();
  await db.update(agentRuns).set(patch).where(eq(agentRuns.id, id));
}

export async function getAgentRun(id: number): Promise<AgentRun | undefined> {
  const db = await requireDb();
  const rows = await db.select().from(agentRuns).where(eq(agentRuns.id, id)).limit(1);
  return rows[0];
}

export async function listAgentRuns(limit = 50): Promise<AgentRun[]> {
  const db = await requireDb();
  return db.select().from(agentRuns).orderBy(desc(agentRuns.createdAt)).limit(limit);
}

// ---- Steps ----

export async function addAgentRunStep(step: InsertAgentRunStep): Promise<void> {
  const db = await requireDb();
  await db.insert(agentRunSteps).values(step);
}

export async function listAgentRunSteps(runId: number): Promise<AgentRunStep[]> {
  const db = await requireDb();
  return db
    .select()
    .from(agentRunSteps)
    .where(eq(agentRunSteps.runId, runId))
    .orderBy(agentRunSteps.id);
}

// ---- Memories (永続化メモリ) ----

export async function addAgentMemory(memory: InsertAgentMemory): Promise<void> {
  const db = await requireDb();
  await db.insert(agentMemories).values(memory);
}

export async function recallAgentMemories(
  taskType: string,
  limit = 5
): Promise<AgentMemory[]> {
  const db = await requireDb();
  return db
    .select()
    .from(agentMemories)
    .where(
      and(
        eq(agentMemories.isActive, true),
        sql`${agentMemories.taskType} IN (${taskType}, 'general')`
      )
    )
    .orderBy(desc(agentMemories.useCount), desc(agentMemories.createdAt))
    .limit(limit);
}

export async function bumpMemoryUseCounts(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await requireDb();
  await db
    .update(agentMemories)
    .set({ useCount: sql`${agentMemories.useCount} + 1` })
    .where(sql`${agentMemories.id} IN (${sql.join(ids.map(id => sql`${id}`), sql`, `)})`);
}

export async function listAgentMemories(limit = 100): Promise<AgentMemory[]> {
  const db = await requireDb();
  return db
    .select()
    .from(agentMemories)
    .where(eq(agentMemories.isActive, true))
    .orderBy(desc(agentMemories.createdAt))
    .limit(limit);
}

// ---- Skills (自動生成スキル) ----

export async function addAgentSkill(skill: InsertAgentSkill): Promise<number> {
  const db = await requireDb();
  const [result] = await db.insert(agentSkills).values(skill);
  return result.insertId;
}

export async function findSkillsForTask(taskType: string, limit = 2): Promise<AgentSkill[]> {
  const db = await requireDb();
  return db
    .select()
    .from(agentSkills)
    .where(and(eq(agentSkills.isActive, true), eq(agentSkills.taskType, taskType as never)))
    .orderBy(desc(agentSkills.avgScore), desc(agentSkills.useCount))
    .limit(limit);
}

export async function bumpSkillUseCounts(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await requireDb();
  await db
    .update(agentSkills)
    .set({ useCount: sql`${agentSkills.useCount} + 1` })
    .where(sql`${agentSkills.id} IN (${sql.join(ids.map(id => sql`${id}`), sql`, `)})`);
}

export async function listAgentSkills(limit = 100): Promise<AgentSkill[]> {
  const db = await requireDb();
  return db
    .select()
    .from(agentSkills)
    .where(eq(agentSkills.isActive, true))
    .orderBy(desc(agentSkills.createdAt))
    .limit(limit);
}
