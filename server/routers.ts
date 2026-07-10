import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as agentStore from "./agent/store";
import { executeAgentRun } from "./agent/engine";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Friends Management
  friends: router({
    list: protectedProcedure.query(async () => {
      return db.getAllFriends();
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getFriendById(input.id);
    }),
  }),

  // Tags
  tags: router({
    list: protectedProcedure.query(async () => {
      return db.getAllTags();
    }),
  }),

  // Broadcasts
  broadcasts: router({
    list: protectedProcedure.query(async () => {
      return db.getAllBroadcasts();
    }),
    create: protectedProcedure.input(z.object({
      name: z.string(),
      targetType: z.enum(["all", "tags", "custom"]),
      messages: z.any(),
    })).mutation(async ({ input }) => {
      return db.createBroadcast({
        name: input.name,
        targetType: input.targetType,
        messages: input.messages,
      });
    }),
  }),

  // Templates
  templates: router({
    list: protectedProcedure.query(async () => {
      return db.getAllTemplates();
    }),
    create: protectedProcedure.input(z.object({
      name: z.string(),
      templateType: z.enum(["text", "image", "video", "card", "carousel"]),
      content: z.any(),
    })).mutation(async ({ input }) => {
      return db.createTemplate({
        name: input.name,
        templateType: input.templateType,
        content: input.content,
      });
    }),
  }),

  // Forms
  forms: router({
    list: protectedProcedure.query(async () => {
      return db.getAllForms();
    }),
  }),

  // Traffic Sources
  trafficSources: router({
    list: protectedProcedure.query(async () => {
      return db.getAllTrafficSources();
    }),
  }),

  // Integrations
  integrations: router({
    getByType: protectedProcedure.input(z.object({ type: z.string() })).query(async ({ input }) => {
      return db.getIntegrationByType(input.type);
    }),
    upsert: protectedProcedure.input(z.object({
      integrationType: z.enum(["shopify", "rakuten", "line_official", "line_ads", "chatgpt"]),
      status: z.enum(["active", "inactive"]),
      config: z.any(),
    })).mutation(async ({ input }) => {
      return db.upsertIntegration({
        integrationType: input.integrationType,
        status: input.status,
        config: input.config,
      });
    }),
  }),

  // Staff Management
  staff: router({
    list: protectedProcedure.query(async () => {
      return db.getAllStaffMembers();
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getStaffMemberById(input.id);
    }),
    create: protectedProcedure.input(z.object({
      name: z.string(),
      email: z.string().email(),
      role: z.enum(["sub_admin", "operator", "support"]),
    })).mutation(async ({ input }) => {
      return db.createStaffMember(input);
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      role: z.enum(["sub_admin", "operator", "support"]).optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      return db.updateStaffMember(input.id, input);
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      return db.deleteStaffMember(input.id);
    }),
    getPermissions: protectedProcedure.input(z.object({ staffId: z.number() })).query(async ({ input }) => {
      return db.getStaffPermissions(input.staffId);
    }),
    updatePermissions: protectedProcedure.input(z.object({
      staffId: z.number(),
      permissions: z.array(z.object({
        category: z.string(),
        permission: z.string(),
        isAllowed: z.boolean(),
      })),
    })).mutation(async ({ input }) => {
      return db.updateStaffPermissions(input.staffId, input.permissions);
    }),
  }),

  // Self-Improving AI Agent (自己改善型AIエージェント)
  agent: router({
    start: protectedProcedure.input(z.object({
      task: z.string().min(1).max(20000),
      taskType: z.enum(["report", "copywriting", "analysis", "general"]).default("general"),
      maxIterations: z.number().int().min(1).max(10).default(3),
      targetScore: z.number().int().min(50).max(100).default(85),
      budgetUsd: z.number().min(0.01).max(20).default(0.5),
    })).mutation(async ({ input }) => {
      const runId = await agentStore.createAgentRun({
        task: input.task,
        taskType: input.taskType,
        maxIterations: input.maxIterations,
        targetScore: input.targetScore,
        budgetUsd: input.budgetUsd.toFixed(2),
      });
      // 長時間実行: awaitせずバックグラウンドで実行し、状態はDBに永続化される
      void executeAgentRun(runId).catch(err =>
        console.error(`[Agent] background run ${runId} crashed:`, err)
      );
      return { runId };
    }),
    // チェックポイント再開: 失敗/予算超過/エスカレーション後に途中状態から続行する
    resume: protectedProcedure.input(z.object({
      id: z.number(),
      additionalBudgetUsd: z.number().min(0).max(20).default(0),
      additionalIterations: z.number().int().min(0).max(10).default(0),
    })).mutation(async ({ input }) => {
      const run = await agentStore.getAgentRun(input.id);
      if (!run) throw new Error("実行が見つかりません");
      if (!["failed", "budget_exceeded", "escalated"].includes(run.status)) {
        throw new Error(`ステータス ${run.status} の実行は再開できません`);
      }
      await agentStore.updateAgentRun(input.id, {
        status: "pending",
        error: null,
        completedAt: null,
        budgetUsd: (parseFloat(run.budgetUsd) + input.additionalBudgetUsd).toFixed(2),
        maxIterations: run.maxIterations + input.additionalIterations,
      });
      void executeAgentRun(input.id).catch(err =>
        console.error(`[Agent] background resume ${input.id} crashed:`, err)
      );
      return { runId: input.id };
    }),
    getRun: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const [run, steps] = await Promise.all([
        agentStore.getAgentRun(input.id),
        agentStore.listAgentRunSteps(input.id),
      ]);
      return { run, steps };
    }),
    listRuns: protectedProcedure.query(async () => {
      return agentStore.listAgentRuns();
    }),
    listMemories: protectedProcedure.query(async () => {
      return agentStore.listAgentMemories();
    }),
    listSkills: protectedProcedure.query(async () => {
      return agentStore.listAgentSkills();
    }),
  }),
});

export type AppRouter = typeof appRouter;
