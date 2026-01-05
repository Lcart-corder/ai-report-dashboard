import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

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
});

export type AppRouter = typeof appRouter;
