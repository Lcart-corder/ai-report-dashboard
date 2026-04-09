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

  // Manufacturing AI System
  manufacturing: router({
    // Users
    users: router({
      list: protectedProcedure.query(async () => {
        return db.getAllManufacturingUsers();
      }),
      getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
        return db.getManufacturingUserById(input.id);
      }),
      create: protectedProcedure.input(z.object({
        name: z.string(),
        email: z.string().email(),
        role: z.enum(["operator", "expert", "admin"]),
        department: z.string().optional(),
        expertise: z.array(z.string()).optional(),
        notificationPreference: z.enum(["dashboard", "line", "both"]).optional(),
      })).mutation(async ({ input }) => {
        return db.createManufacturingUser(input);
      }),
      update: protectedProcedure.input(z.object({
        id: z.number(),
        name: z.string().optional(),
        role: z.enum(["operator", "expert", "admin"]).optional(),
        department: z.string().optional(),
        expertise: z.array(z.string()).optional(),
        notificationPreference: z.enum(["dashboard", "line", "both"]).optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        return db.updateManufacturingUser(input.id, input);
      }),
    }),

    // Sessions
    sessions: router({
      list: protectedProcedure.query(async () => {
        return db.getAllTroubleshootingSessions();
      }),
      getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
        return db.getTroubleshootingSessionById(input.id);
      }),
      create: protectedProcedure.input(z.object({
        operatorId: z.number(),
        title: z.string().optional(),
        equipmentType: z.string().optional(),
        errorCode: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      })).mutation(async ({ input }) => {
        return db.createTroubleshootingSession(input);
      }),
      updateStatus: protectedProcedure.input(z.object({
        id: z.number(),
        status: z.enum(["active", "resolved", "escalated", "closed"]),
      })).mutation(async ({ input }) => {
        return db.updateTroubleshootingSessionStatus(input.id, input.status);
      }),
    }),

    // Messages
    messages: router({
      listBySession: protectedProcedure.input(z.object({ sessionId: z.number() })).query(async ({ input }) => {
        return db.getTroubleshootingMessagesBySession(input.sessionId);
      }),
      create: protectedProcedure.input(z.object({
        sessionId: z.number(),
        senderType: z.enum(["operator", "ai", "expert"]),
        senderId: z.number().optional(),
        content: z.string(),
        messageType: z.enum(["text", "image", "file"]).optional(),
        confidence: z.number().optional(),
        sourceReferences: z.array(z.number()).optional(),
      })).mutation(async ({ input }) => {
        return db.createTroubleshootingMessage(input);
      }),
    }),

    // Knowledge Base
    knowledge: router({
      documents: router({
        list: protectedProcedure.query(async () => {
          return db.getAllKnowledgeDocuments();
        }),
        create: protectedProcedure.input(z.object({
          title: z.string(),
          category: z.string(),
          content: z.string(),
          tags: z.array(z.string()).optional(),
          fileUrl: z.string().optional(),
          fileType: z.string().optional(),
          uploadedBy: z.number(),
        })).mutation(async ({ input }) => {
          return db.createKnowledgeDocument(input);
        }),
      }),
      history: router({
        list: protectedProcedure.query(async () => {
          return db.getAllTroubleshootingHistory();
        }),
        create: protectedProcedure.input(z.object({
          title: z.string(),
          problemDescription: z.string(),
          solution: z.string(),
          rootCause: z.string().optional(),
          preventiveMeasures: z.string().optional(),
          equipmentType: z.string().optional(),
          errorCode: z.string().optional(),
          tags: z.array(z.string()).optional(),
          resolvedBy: z.number(),
          resolutionTime: z.number().optional(),
          severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        })).mutation(async ({ input }) => {
          return db.createTroubleshootingHistory(input);
        }),
      }),
      learning: router({
        list: protectedProcedure.query(async () => {
          return db.getAllAiLearningData();
        }),
        create: protectedProcedure.input(z.object({
          question: z.string(),
          answer: z.string(),
          category: z.string().optional(),
          tags: z.array(z.string()).optional(),
          expertId: z.number(),
          sessionId: z.number().optional(),
          qualityScore: z.number().optional(),
        })).mutation(async ({ input }) => {
          return db.createAiLearningData(input);
        }),
      }),
    }),

    // Escalations
    escalations: router({
      list: protectedProcedure.query(async () => {
        return db.getAllEscalations();
      }),
      getBySession: protectedProcedure.input(z.object({ sessionId: z.number() })).query(async ({ input }) => {
        return db.getEscalationsBySession(input.sessionId);
      }),
      create: protectedProcedure.input(z.object({
        sessionId: z.number(),
        requestedBy: z.number(),
        reason: z.string(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        notificationMethod: z.enum(["dashboard", "line", "both"]).optional(),
      })).mutation(async ({ input }) => {
        return db.createEscalation(input);
      }),
      assign: protectedProcedure.input(z.object({
        id: z.number(),
        assignedTo: z.number(),
      })).mutation(async ({ input }) => {
        return db.assignEscalation(input.id, input.assignedTo);
      }),
      updateStatus: protectedProcedure.input(z.object({
        id: z.number(),
        status: z.enum(["pending", "assigned", "in_progress", "resolved", "cancelled"]),
      })).mutation(async ({ input }) => {
        return db.updateEscalationStatus(input.id, input.status);
      }),
    }),

    // Flow Nodes
    flowNodes: router({
      listBySession: protectedProcedure.input(z.object({ sessionId: z.number() })).query(async ({ input }) => {
        return db.getFlowNodesBySession(input.sessionId);
      }),
      create: protectedProcedure.input(z.object({
        sessionId: z.number(),
        nodeType: z.enum(["start", "problem", "check", "action", "solution", "escalation"]),
        title: z.string(),
        description: z.string().optional(),
        parentNodeId: z.number().optional(),
        position: z.object({ x: z.number(), y: z.number() }).optional(),
      })).mutation(async ({ input }) => {
        return db.createFlowNode(input);
      }),
      updateStatus: protectedProcedure.input(z.object({
        id: z.number(),
        status: z.enum(["pending", "current", "completed", "failed"]),
      })).mutation(async ({ input }) => {
        return db.updateFlowNodeStatus(input.id, input.status);
      }),
    }),

    // Timeline Events
    timeline: router({
      listBySession: protectedProcedure.input(z.object({ sessionId: z.number() })).query(async ({ input }) => {
        return db.getTimelineEventsBySession(input.sessionId);
      }),
      create: protectedProcedure.input(z.object({
        sessionId: z.number(),
        eventType: z.enum(["session_start", "message", "ai_response", "escalation", "expert_join", "solution_found", "session_close"]),
        title: z.string(),
        description: z.string().optional(),
        actorId: z.number().optional(),
        actorType: z.enum(["operator", "ai", "expert", "system"]).optional(),
        relatedMessageId: z.number().optional(),
      })).mutation(async ({ input }) => {
        return db.createTimelineEvent(input);
      }),
    }),

    // Notifications
    notifications: router({
      listByUser: protectedProcedure.input(z.object({ userId: z.number() })).query(async ({ input }) => {
        return db.getNotificationsByUser(input.userId);
      }),
      markAsRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        return db.markNotificationAsRead(input.id);
      }),
    }),

    // Dashboard Stats
    stats: router({
      overview: protectedProcedure.query(async () => {
        return db.getManufacturingDashboardStats();
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
