import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import * as lms from "./lms";

// ============================================================
// LMS 認証統合: ログイン中ユーザーのロール/スコープを解決する procedure 群
// ============================================================

/** LMSアクセス権を要求し、ctx.lms に identity(role/scope) を載せる。 */
const lmsProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const identity = await lms.resolveLmsIdentity(ctx.user);
  if (!identity) throw new TRPCError({ code: "FORBIDDEN", message: "LMSへのアクセス権がありません" });
  return next({ ctx: { ...ctx, lms: identity } });
});

/** 運営管理者(operator_admin)のみ。企業/協業先/権限/マスターキー等の管理操作に使用。 */
const operatorProcedure = lmsProcedure.use(async ({ ctx, next }) => {
  if (ctx.lms.role !== "operator_admin") throw new TRPCError({ code: "FORBIDDEN", message: "運営管理者のみ実行できます" });
  return next();
});

/** コンテンツ管理権限(運営 / 講師 / プロジェクト管理者)。コース・教材・テストの編集に使用。 */
const contentProcedure = lmsProcedure.use(async ({ ctx, next }) => {
  const ok = ctx.lms.role === "operator_admin" || ctx.lms.role === "instructor" || ctx.lms.role === "project_manager";
  if (!ok) throw new TRPCError({ code: "FORBIDDEN", message: "コンテンツ管理権限がありません" });
  return next();
});

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

  // ============================================================
  // 助成金対応リスキリング動画学習システム (LMS)
  // ============================================================
  lms: router({
    // --- 現在ユーザーのロール/スコープ (認証統合) ---
    me: protectedProcedure.query(async ({ ctx }) => {
      return lms.resolveLmsIdentity(ctx.user);
    }),

    // --- 受講者(会社員)の初回登録 (FR-01/FR-02) ---
    register: router({
      // マスターキーの事前検証(送信前のUIフィードバック用)
      validateKey: protectedProcedure.input(z.object({ keyCode: z.string().min(1) })).query(async ({ input }) => lms.validateMasterKey(input.keyCode)),
      // ログイン中ユーザーのメール + マスターキーで learner を発行/リンク
      submit: protectedProcedure.input(z.object({
        keyCode: z.string().min(1),
        name: z.string().optional(),
        employeeNumber: z.string().optional(),
        department: z.string().optional(),
        lineUserId: z.string().optional(),
      })).mutation(async ({ ctx, input }) => {
        try {
          return await lms.registerLearnerWithMasterKey(ctx.user ?? {}, input);
        } catch (e) {
          throw new TRPCError({ code: "BAD_REQUEST", message: e instanceof Error ? e.message : "登録に失敗しました" });
        }
      }),
    }),

    // --- 代表(company_rep)ホーム: 自社の受講者・進捗 ---
    companyHome: lmsProcedure.input(z.object({ companyId: z.number() })).query(async ({ ctx, input }) => {
      if (!(await lms.canAccessCompanyIdentity(ctx.lms, input.companyId))) throw new TRPCError({ code: "FORBIDDEN", message: "この企業にアクセスできません" });
      return lms.getCompanyProgress(input.companyId);
    }),

    // --- 協業先管理者(partner_admin)ホーム: 担当企業ロールアップ + 成果報酬 ---
    partnerHome: lmsProcedure.input(z.object({ partnerId: z.number() })).query(async ({ ctx, input }) => {
      if (ctx.lms.role !== "operator_admin" && ctx.lms.partnerId !== input.partnerId) throw new TRPCError({ code: "FORBIDDEN", message: "この協業先にアクセスできません" });
      return lms.getPartnerCompaniesOverview(input.partnerId);
    }),

    // --- ダッシュボード (FR-13) — アクセス可能企業に自動スコープ ---
    dashboard: lmsProcedure.input(z.object({ companyId: z.number().optional() }).optional()).query(async ({ ctx, input }) => {
      const scope = await lms.accessibleCompanyIdsForIdentity(ctx.lms);
      // 単一企業指定時はアクセス可否を検証
      if (input?.companyId != null && scope !== null && !scope.includes(input.companyId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "この企業のデータにアクセスできません" });
      }
      return lms.getDashboardStats(input?.companyId, scope);
    }),

    // --- 協業先 (FR-17) ---
    partners: router({
      // 運営=全件、協業先管理者=自社のみ、他=空(ドロップダウン等で共有されるため例外にしない)
      list: lmsProcedure.query(async ({ ctx }) => {
        const all = await lms.getAllPartners();
        if (ctx.lms.role === "operator_admin") return all;
        if (ctx.lms.role === "partner_admin") return all.filter(p => p.id === ctx.lms.partnerId);
        return [];
      }),
      create: operatorProcedure.input(z.object({
        name: z.string().min(1),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        successFeeRate: z.number().int().min(0).max(100).default(20),
        contractNote: z.string().optional(),
      })).mutation(async ({ input }) => lms.createPartner(input)),
      update: operatorProcedure.input(z.object({
        id: z.number(),
        name: z.string().optional(),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        successFeeRate: z.number().int().min(0).max(100).optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => lms.updatePartner(input.id, input)),
      sales: lmsProcedure.input(z.object({ partnerId: z.number() })).query(async ({ ctx, input }) => {
        if (ctx.lms.role !== "operator_admin" && ctx.lms.partnerId !== input.partnerId) throw new TRPCError({ code: "FORBIDDEN", message: "この協業先にアクセスできません" });
        return lms.getPartnerSales(input.partnerId);
      }),
      recordSale: operatorProcedure.input(z.object({
        partnerId: z.number(),
        companyId: z.number().optional(),
        yearMonth: z.string().regex(/^\d{4}-\d{2}$/),
        trainingSales: z.number().int().min(0),
        note: z.string().optional(),
      })).mutation(async ({ input }) => lms.recordPartnerSale(input)),
      // 成果報酬 = 研修売上 × 20% (助成金受給額には非連動 / FR-18)
      calcFee: operatorProcedure.input(z.object({ partnerSaleId: z.number() })).mutation(async ({ input }) => lms.calcSuccessFee(input.partnerSaleId)),
      fees: lmsProcedure.input(z.object({ partnerId: z.number() })).query(async ({ ctx, input }) => {
        if (ctx.lms.role !== "operator_admin" && ctx.lms.partnerId !== input.partnerId) throw new TRPCError({ code: "FORBIDDEN", message: "この協業先にアクセスできません" });
        return lms.getSuccessFees(input.partnerId);
      }),
      monthlyReport: lmsProcedure.input(z.object({ partnerId: z.number() })).query(async ({ ctx, input }) => {
        if (ctx.lms.role !== "operator_admin" && ctx.lms.partnerId !== input.partnerId) throw new TRPCError({ code: "FORBIDDEN", message: "この協業先にアクセスできません" });
        return lms.getMonthlyPartnerReport(input.partnerId);
      }),
    }),

    // --- 導入企業 / 事業所 (FR-03) ---
    companies: router({
      // アクセス可能企業のみ返す(operator=全件)
      list: lmsProcedure.query(async ({ ctx }) => {
        const all = await lms.getAllCompanies();
        const scope = await lms.accessibleCompanyIdsForIdentity(ctx.lms);
        if (scope === null) return all;
        const set = new Set(scope);
        return all.filter(c => set.has(c.id));
      }),
      getById: lmsProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
        const scope = await lms.accessibleCompanyIdsForIdentity(ctx.lms);
        if (scope !== null && !scope.includes(input.id)) throw new TRPCError({ code: "FORBIDDEN", message: "この企業にアクセスできません" });
        return lms.getCompanyById(input.id);
      }),
      create: operatorProcedure.input(z.object({
        partnerId: z.number().optional(),
        name: z.string().min(1),
        corporateNumber: z.string().optional(),
        address: z.string().optional(),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contractStartDate: z.string().optional(),
        contractEndDate: z.string().optional(),
      })).mutation(async ({ input }) => lms.createCompany(input)),
      update: operatorProcedure.input(z.object({
        id: z.number(),
        name: z.string().optional(),
        address: z.string().optional(),
        contactName: z.string().optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => lms.updateCompany(input.id, input)),
      branches: lmsProcedure.input(z.object({ companyId: z.number() })).query(async ({ ctx, input }) => {
        if (!(await lms.canAccessCompanyIdentity(ctx.lms, input.companyId))) throw new TRPCError({ code: "FORBIDDEN", message: "この企業にアクセスできません" });
        return lms.getBranchesByCompany(input.companyId);
      }),
      createBranch: operatorProcedure.input(z.object({
        companyId: z.number(),
        name: z.string().min(1),
        insuranceOfficeNumber: z.string().optional(),
        address: z.string().optional(),
      })).mutation(async ({ input }) => lms.createBranch(input)),
    }),

    // --- マスターキー (FR-02) ---
    masterKeys: router({
      list: lmsProcedure.input(z.object({ companyId: z.number() })).query(async ({ ctx, input }) => {
        if (!(await lms.canAccessCompanyIdentity(ctx.lms, input.companyId))) throw new TRPCError({ code: "FORBIDDEN", message: "この企業にアクセスできません" });
        return lms.getMasterKeysByCompany(input.companyId);
      }),
      issue: operatorProcedure.input(z.object({
        companyId: z.number(),
        expiresAt: z.string().nullable().optional(),
        maxUses: z.number().int().positive().nullable().optional(),
      })).mutation(async ({ input }) => lms.issueMasterKey(input.companyId, { expiresAt: input.expiresAt, maxUses: input.maxUses })),
      deactivate: operatorProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => lms.deactivateMasterKey(input.id)),
      validate: publicProcedure.input(z.object({ keyCode: z.string() })).query(async ({ input }) => lms.validateMasterKey(input.keyCode)),
    }),

    // --- 受講者 (FR-04) ---
    learners: router({
      listByCompany: lmsProcedure.input(z.object({ companyId: z.number() })).query(async ({ ctx, input }) => {
        if (!(await lms.canAccessCompanyIdentity(ctx.lms, input.companyId))) throw new TRPCError({ code: "FORBIDDEN", message: "この企業の受講者にアクセスできません" });
        return lms.getLearnersByCompany(input.companyId);
      }),
      getById: lmsProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
        // 本人(会社員)は自分を、管理系は担当企業の受講者を閲覧可
        if (ctx.lms.role === "employee" && ctx.lms.learnerId === input.id) return lms.getLearnerById(input.id);
        if (!(await lms.canAccessLearnerIdentity(ctx.lms, input.id))) throw new TRPCError({ code: "FORBIDDEN", message: "この受講者にアクセスできません" });
        return lms.getLearnerById(input.id);
      }),
      create: lmsProcedure.input(z.object({
        companyId: z.number(),
        branchId: z.number().optional(),
        name: z.string().min(1),
        email: z.string().email().optional(),
        lineUserId: z.string().optional(),
        preferredChannel: z.enum(["email", "line", "app"]).optional(),
        employeeNumber: z.string().optional(),
        department: z.string().optional(),
      })).mutation(async ({ ctx, input }) => {
        if (!lms.canManageLearners(ctx.lms.role)) throw new TRPCError({ code: "FORBIDDEN", message: "受講者を登録する権限がありません" });
        if (!(await lms.canAccessCompanyIdentity(ctx.lms, input.companyId))) throw new TRPCError({ code: "FORBIDDEN", message: "この企業に受講者を登録できません" });
        return lms.createLearner({ ...input, status: "invited" });
      }),
      bulkCreate: lmsProcedure.input(z.object({
        companyId: z.number(),
        rows: z.array(z.object({
          name: z.string().min(1),
          email: z.string().optional(),
          employeeNumber: z.string().optional(),
          department: z.string().optional(),
        })),
      })).mutation(async ({ ctx, input }) => {
        if (!lms.canManageLearners(ctx.lms.role)) throw new TRPCError({ code: "FORBIDDEN", message: "受講者を登録する権限がありません" });
        if (!(await lms.canAccessCompanyIdentity(ctx.lms, input.companyId))) throw new TRPCError({ code: "FORBIDDEN", message: "この企業に受講者を登録できません" });
        return lms.bulkCreateLearners(input.companyId, input.rows);
      }),
      update: lmsProcedure.input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        lineUserId: z.string().optional(),
        preferredChannel: z.enum(["email", "line", "app"]).optional(),
        department: z.string().optional(),
        status: z.enum(["invited", "active", "delayed", "completed", "expired", "suspended"]).optional(),
      })).mutation(async ({ ctx, input }) => {
        if (!lms.canManageLearners(ctx.lms.role)) throw new TRPCError({ code: "FORBIDDEN", message: "受講者を編集する権限がありません" });
        if (!(await lms.canAccessLearnerIdentity(ctx.lms, input.id))) throw new TRPCError({ code: "FORBIDDEN", message: "この受講者を編集できません" });
        return lms.updateLearner(input.id, input);
      }),
    }),

    // --- コース / レッスン (FR-05, FR-06) ---
    courses: router({
      list: protectedProcedure.query(async () => lms.getAllCourses()),
      getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => lms.getCourseById(input.id)),
      duration: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => lms.getCourseDuration(input.id)),
      create: contentProcedure.input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        standardMinutes: z.number().int().min(0).default(0),
        standardPeriodDays: z.number().int().min(0).optional(),
        trainingStartDate: z.string().optional(),
        trainingEndDate: z.string().optional(),
        subsidyCategory: z.string().optional(),
        passingScore: z.number().int().min(0).max(100).default(80),
        requireReport: z.boolean().default(true),
        tuitionFee: z.number().int().min(0).default(0),
        lmsFee: z.number().int().min(0).default(0),
        supportFee: z.number().int().min(0).default(0),
        visibility: z.enum(["public", "private", "company_limited"]).default("private"),
      })).mutation(async ({ input }) => lms.createCourse(input)),
      update: contentProcedure.input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        standardMinutes: z.number().int().min(0).optional(),
        trainingStartDate: z.string().optional(),
        trainingEndDate: z.string().optional(),
        passingScore: z.number().int().min(0).max(100).optional(),
        visibility: z.enum(["public", "private", "company_limited"]).optional(),
      })).mutation(async ({ input }) => lms.updateCourse(input.id, input)),
      lessons: protectedProcedure.input(z.object({ courseId: z.number() })).query(async ({ input }) => lms.getLessonsByCourse(input.courseId)),
      createLesson: contentProcedure.input(z.object({
        courseId: z.number(),
        title: z.string().min(1),
        chapter: z.string().optional(),
        videoUrl: z.string().optional(),
        durationMinutes: z.number().int().min(0).default(0),
        sortOrder: z.number().int().default(0),
        requireSequential: z.boolean().default(false),
        isRequired: z.boolean().default(true),
      })).mutation(async ({ input }) => lms.createLesson(input)),
      updateLesson: contentProcedure.input(z.object({
        id: z.number(),
        title: z.string().optional(),
        videoUrl: z.string().optional(),
        durationMinutes: z.number().int().min(0).optional(),
        sortOrder: z.number().int().optional(),
        isRequired: z.boolean().optional(),
      })).mutation(async ({ input }) => lms.updateLesson(input.id, input)),
      deleteLesson: contentProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => lms.deleteLesson(input.id)),
    }),

    // --- 受講割当 / 進捗 (FR-11) ---
    enrollments: router({
      byCourse: protectedProcedure.input(z.object({ courseId: z.number() })).query(async ({ input }) => lms.getEnrollmentsByCourse(input.courseId)),
      byLearner: lmsProcedure.input(z.object({ learnerId: z.number() })).query(async ({ ctx, input }) => {
        const self = ctx.lms.role === "employee" && ctx.lms.learnerId === input.learnerId;
        if (!self && !(await lms.canAccessLearnerIdentity(ctx.lms, input.learnerId))) throw new TRPCError({ code: "FORBIDDEN", message: "この受講者の受講情報にアクセスできません" });
        return lms.getEnrollmentsByLearner(input.learnerId);
      }),
      getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => lms.getEnrollmentById(input.id)),
      assign: lmsProcedure.input(z.object({
        learnerId: z.number(),
        courseId: z.number(),
        dueDate: z.string().nullable().optional(),
      })).mutation(async ({ ctx, input }) => {
        if (!lms.canManageLearners(ctx.lms.role)) throw new TRPCError({ code: "FORBIDDEN", message: "コース割当の権限がありません" });
        if (!(await lms.canAccessLearnerIdentity(ctx.lms, input.learnerId))) throw new TRPCError({ code: "FORBIDDEN", message: "この受講者にコースを割り当てできません" });
        return lms.assignEnrollment(input.learnerId, input.courseId, input.dueDate);
      }),
      recalc: protectedProcedure.input(z.object({ enrollmentId: z.number() })).mutation(async ({ input }) => lms.recalcEnrollment(input.enrollmentId)),
      progressLogs: protectedProcedure.input(z.object({ enrollmentId: z.number() })).query(async ({ input }) => lms.getProgressLogs(input.enrollmentId)),
      checks: protectedProcedure.input(z.object({ enrollmentId: z.number() })).query(async ({ input }) => lms.getChecks(input.enrollmentId)),
    }),

    // --- 視聴ログ / 確認チェック (FR-07, FR-08) ---
    recordProgress: protectedProcedure.input(z.object({
      enrollmentId: z.number(),
      lessonId: z.number(),
      watchRate: z.number().int().min(0).max(100),
      completed: z.boolean(),
      lastPositionSec: z.number().int().min(0).optional(),
      playbackRate: z.string().optional(),
    })).mutation(async ({ input }) => lms.recordProgress(input)),
    recordCheck: protectedProcedure.input(z.object({
      enrollmentId: z.number(),
      lessonId: z.number(),
      learnerId: z.number(),
    })).mutation(async ({ input }) => lms.recordCheck(input.enrollmentId, input.lessonId, input.learnerId)),

    // --- テスト (FR-09) ---
    quizzes: router({
      byCourse: protectedProcedure.input(z.object({ courseId: z.number() })).query(async ({ input }) => lms.getQuizzesByCourse(input.courseId)),
      getWithQuestions: protectedProcedure.input(z.object({ quizId: z.number() })).query(async ({ input }) => lms.getQuizWithQuestions(input.quizId)),
      create: contentProcedure.input(z.object({
        courseId: z.number(),
        title: z.string().min(1),
        passingScore: z.number().int().min(0).max(100).default(80),
        maxAttempts: z.number().int().positive().nullable().optional(),
        timeLimitMinutes: z.number().int().positive().nullable().optional(),
        shuffleQuestions: z.boolean().default(false),
      })).mutation(async ({ input }) => lms.createQuiz(input)),
      addQuestion: contentProcedure.input(z.object({
        quizId: z.number(),
        questionText: z.string().min(1),
        questionType: z.enum(["single", "multiple", "text"]).default("single"),
        options: z.array(z.string()).optional(),
        correctAnswers: z.array(z.number()).optional(),
        points: z.number().int().min(1).default(1),
        sortOrder: z.number().int().default(0),
      })).mutation(async ({ input }) => lms.createQuizQuestion({
        quizId: input.quizId,
        questionText: input.questionText,
        questionType: input.questionType,
        options: (input.options ?? null) as never,
        correctAnswers: (input.correctAnswers ?? null) as never,
        points: input.points,
        sortOrder: input.sortOrder,
      })),
      submit: protectedProcedure.input(z.object({
        quizId: z.number(),
        enrollmentId: z.number(),
        learnerId: z.number(),
        answers: z.record(z.string(), z.union([z.array(z.number()), z.string()])),
      })).mutation(async ({ input }) => lms.submitQuiz(input)),
      results: protectedProcedure.input(z.object({ enrollmentId: z.number() })).query(async ({ input }) => lms.getQuizResults(input.enrollmentId)),
    }),

    // --- 学習レポート (FR-10) ---
    reports: router({
      get: protectedProcedure.input(z.object({ enrollmentId: z.number() })).query(async ({ input }) => lms.getLearningReport(input.enrollmentId)),
      upsert: protectedProcedure.input(z.object({
        enrollmentId: z.number(),
        learnerId: z.number(),
        whatLearned: z.string().optional(),
        howToApply: z.string().optional(),
        submit: z.boolean().default(false),
      })).mutation(async ({ input }) => lms.upsertLearningReport(input)),
      review: lmsProcedure.input(z.object({
        reportId: z.number(),
        action: z.enum(["approve", "return"]),
        comment: z.string().optional(),
      })).mutation(async ({ ctx, input }) => {
        const ok = ctx.lms.role === "operator_admin" || ctx.lms.role === "advisor" || ctx.lms.role === "project_manager" || ctx.lms.role === "company_rep";
        if (!ok) throw new TRPCError({ code: "FORBIDDEN", message: "レポートを差戻し・承認する権限がありません" });
        return lms.reviewLearningReport(input.reportId, input.action, input.comment);
      }),
    }),

    // --- 修了証 (FR-12) ---
    certificates: router({
      issue: lmsProcedure.input(z.object({ enrollmentId: z.number(), issuer: z.string().optional() })).mutation(async ({ ctx, input }) => {
        const canSelf = ctx.lms.role === "employee";
        if (!canSelf && !(await lms.canAccessEnrollmentIdentity(ctx.lms, input.enrollmentId))) throw new TRPCError({ code: "FORBIDDEN", message: "この修了証を発行できません" });
        return lms.issueCertificate(input.enrollmentId, input.issuer);
      }),
      getByEnrollment: protectedProcedure.input(z.object({ enrollmentId: z.number() })).query(async ({ input }) => lms.getCertificateByEnrollment(input.enrollmentId)),
      byCompany: lmsProcedure.input(z.object({ companyId: z.number() })).query(async ({ ctx, input }) => {
        if (!(await lms.canAccessCompanyIdentity(ctx.lms, input.companyId))) throw new TRPCError({ code: "FORBIDDEN", message: "この企業にアクセスできません" });
        return lms.getCertificatesByCompany(input.companyId);
      }),
      byCourse: protectedProcedure.input(z.object({ courseId: z.number() })).query(async ({ input }) => lms.getCertificatesByCourse(input.courseId)),
      recordDownload: protectedProcedure.input(z.object({ id: z.number(), actor: z.string().optional() })).mutation(async ({ input }) => lms.recordCertificateDownload(input.id, input.actor)),
    }),

    // --- 申請準備チェックリスト (FR-16) ---
    checklist: router({
      compute: lmsProcedure.input(z.object({ companyId: z.number(), courseId: z.number() })).query(async ({ ctx, input }) => {
        if (!(await lms.canAccessCompanyIdentity(ctx.lms, input.companyId))) throw new TRPCError({ code: "FORBIDDEN", message: "この企業にアクセスできません" });
        return lms.computeApplicationChecklist(input.companyId, input.courseId);
      }),
      setAdvisorReview: lmsProcedure.input(z.object({
        companyId: z.number(),
        courseId: z.number(),
        reviewed: z.boolean(),
        comment: z.string().optional(),
      })).mutation(async ({ ctx, input }) => {
        const ok = ctx.lms.role === "operator_admin" || ctx.lms.role === "advisor" || ctx.lms.role === "project_manager";
        if (!ok) throw new TRPCError({ code: "FORBIDDEN", message: "社労士確認を更新する権限がありません" });
        if (!(await lms.canAccessCompanyIdentity(ctx.lms, input.companyId))) throw new TRPCError({ code: "FORBIDDEN", message: "この企業にアクセスできません" });
        return lms.setAdvisorReview(input.companyId, input.courseId, input.reviewed, input.comment);
      }),
    }),

    // --- 証跡出力CSV (FR-15) — 企業スコープ付き(担当分のみ) ---
    exports: router({
      // 運営=全件、その他=自分のアクセス可能企業の受講者のみ
      courseProgressCsv: lmsProcedure.input(z.object({ courseId: z.number(), actor: z.string().optional() })).mutation(async ({ ctx, input }) => {
        const scope = await lms.accessibleCompanyIdsForIdentity(ctx.lms);
        return { csv: await lms.exportCourseProgressCsv(input.courseId, input.actor ?? ctx.lms.email, scope) };
      }),
      tenHourCompletersCsv: lmsProcedure.input(z.object({ actor: z.string().optional() }).optional()).mutation(async ({ ctx, input }) => {
        const scope = await lms.accessibleCompanyIdsForIdentity(ctx.lms);
        return { csv: await lms.exportTenHourCompletersCsv(input?.actor ?? ctx.lms.email, scope) };
      }),
      // 価格疎明データは全社横断のため運営限定
      priceJustificationCsv: operatorProcedure.input(z.object({ actor: z.string().optional() }).optional()).mutation(async ({ input }) => ({ csv: await lms.exportPriceJustificationCsv(input?.actor) })),
      // 監査ログCSVは運営限定
      auditLogsCsv: operatorProcedure.input(z.object({ category: z.string().optional(), actor: z.string().optional() }).optional()).mutation(async ({ input }) => ({ csv: await lms.exportAuditLogsCsv({ category: input?.category, actor: input?.actor }) })),
    }),

    // --- 通知・リマインド (FR-14) ---
    notifications: router({
      list: protectedProcedure.query(async () => lms.getNotifications()),
      create: protectedProcedure.input(z.object({
        name: z.string().min(1),
        trigger: z.string().min(1),
        channel: z.string().default("email"),
        template: z.string().optional(),
      })).mutation(async ({ input }) => lms.createNotification(input)),
      update: protectedProcedure.input(z.object({
        id: z.number(),
        name: z.string().optional(),
        channel: z.string().optional(),
        template: z.string().optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => lms.updateNotification(input.id, input)),
      delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => lms.deleteNotification(input.id)),
      logs: protectedProcedure.input(z.object({ limit: z.number().int().positive().max(1000).optional() }).optional()).query(async ({ input }) => lms.getNotificationLogs(input?.limit)),
      reminderTargets: lmsProcedure.input(z.object({ companyId: z.number().optional() }).optional()).query(async ({ ctx, input }) => {
        const scope = await lms.accessibleCompanyIdsForIdentity(ctx.lms);
        if (input?.companyId != null && scope !== null && !scope.includes(input.companyId)) throw new TRPCError({ code: "FORBIDDEN", message: "この企業にアクセスできません" });
        return lms.detectReminderTargets(input?.companyId, scope);
      }),
      send: lmsProcedure.input(z.object({
        learnerIds: z.array(z.number()),
        channel: z.string().default("email"), // "email" | "line" | "app" | "auto"(受講者の希望チャネル)
        notificationId: z.number().optional(),
        subject: z.string().optional(),
        body: z.string().optional(),
      })).mutation(async ({ ctx, input }) => {
        if (!lms.canManageLearners(ctx.lms.role)) throw new TRPCError({ code: "FORBIDDEN", message: "リマインド送信の権限がありません" });
        for (const lid of input.learnerIds) {
          if (!(await lms.canAccessLearnerIdentity(ctx.lms, lid))) throw new TRPCError({ code: "FORBIDDEN", message: "アクセス権のない受講者が含まれています" });
        }
        return lms.sendReminders(input);
      }),
    }),

    // --- プロジェクト(案件単位の管理) ---
    projects: router({
      list: protectedProcedure.query(async () => lms.getProjects()),
      create: operatorProcedure.input(z.object({
        name: z.string().min(1),
        partnerId: z.number().optional(),
        description: z.string().optional(),
      })).mutation(async ({ input }) => lms.createProject(input)),
      update: operatorProcedure.input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["active", "closed"]).optional(),
      })).mutation(async ({ input }) => lms.updateProject(input.id, input)),
      companies: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => lms.getCompaniesByProject(input.projectId)),
      assignCompany: operatorProcedure.input(z.object({ companyId: z.number(), projectId: z.number().nullable() })).mutation(async ({ input }) => lms.assignCompanyToProject(input.companyId, input.projectId)),
    }),

    // --- メンバー(ロール付き管理アカウント) ---
    members: router({
      list: operatorProcedure.query(async () => lms.getMembers()),
      create: operatorProcedure.input(z.object({
        email: z.string().email(),
        name: z.string().min(1),
        role: z.enum(["operator_admin", "project_manager", "partner_admin", "company_rep", "instructor", "advisor"]),
        projectId: z.number().optional(),
        companyId: z.number().optional(),
        partnerId: z.number().optional(),
      })).mutation(async ({ input }) => lms.createMember({ ...input, projectId: input.projectId ?? null, companyId: input.companyId ?? null, partnerId: input.partnerId ?? null })),
      update: operatorProcedure.input(z.object({
        id: z.number(),
        name: z.string().optional(),
        role: z.enum(["operator_admin", "project_manager", "partner_admin", "company_rep", "instructor", "advisor"]).optional(),
        projectId: z.number().nullable().optional(),
        companyId: z.number().nullable().optional(),
        partnerId: z.number().nullable().optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => lms.updateMember(input.id, input)),
      delete: operatorProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => lms.deleteMember(input.id)),
    }),

    // --- 内部通知Webhook(協業先・企業管理者・運営向け / 無料) ---
    webhooks: router({
      list: protectedProcedure.query(async () => lms.getInternalWebhooks()),
      create: operatorProcedure.input(z.object({
        targetType: z.enum(["operator", "partner", "company"]).default("operator"),
        targetId: z.number().optional(),
        channel: z.enum(["slack", "googlechat", "chatwork"]),
        label: z.string().optional(),
        webhookUrl: z.string().optional(),
        apiToken: z.string().optional(),
        roomId: z.string().optional(),
      })).mutation(async ({ input }) => lms.createInternalWebhook({ ...input, targetId: input.targetId ?? null })),
      delete: operatorProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => lms.deleteInternalWebhook(input.id)),
      test: operatorProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => lms.testInternalWebhook(input.id)),
      notify: protectedProcedure.input(z.object({
        text: z.string().min(1),
        partnerId: z.number().optional(),
        companyId: z.number().optional(),
      })).mutation(async ({ input }) => lms.notifyInternal(input.text, { partnerId: input.partnerId, companyId: input.companyId })),
    }),

    // --- 社労士・申請確認者(証跡確認) ---
    advisor: router({
      companyOverview: lmsProcedure.query(async ({ ctx }) => {
        const all = await lms.getAdvisorCompanyOverview();
        const scope = await lms.accessibleCompanyIdsForIdentity(ctx.lms);
        if (scope === null) return all;
        const set = new Set(scope);
        return all.filter(c => set.has(c.id));
      }),
      learnerEvidence: lmsProcedure.input(z.object({ enrollmentId: z.number() })).query(async ({ ctx, input }) => {
        if (!(await lms.canAccessEnrollmentIdentity(ctx.lms, input.enrollmentId))) throw new TRPCError({ code: "FORBIDDEN", message: "この受講証跡にアクセスできません" });
        return lms.getLearnerEvidence(input.enrollmentId);
      }),
      certificatesByCompany: lmsProcedure.input(z.object({ companyId: z.number() })).query(async ({ ctx, input }) => {
        if (!(await lms.canAccessCompanyIdentity(ctx.lms, input.companyId))) throw new TRPCError({ code: "FORBIDDEN", message: "この企業にアクセスできません" });
        return lms.getCertificatesByCompany(input.companyId);
      }),
    }),

    // --- 監査ログ (FR-19) ---
    auditLogs: operatorProcedure.input(z.object({
      limit: z.number().int().positive().max(1000).optional(),
      category: z.string().optional(),
      actor: z.string().optional(),
    }).optional()).query(async ({ input }) => lms.getAuditLogs({ limit: input?.limit, category: input?.category, actor: input?.actor })),

    // --- デモデータ投入 ---
    seedDemo: operatorProcedure.mutation(async () => lms.seedDemoData()),
  }),
});

export type AppRouter = typeof appRouter;
