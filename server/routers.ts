import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as lms from "./lms";

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
    // --- ダッシュボード (FR-13) ---
    dashboard: protectedProcedure.input(z.object({ companyId: z.number().optional() }).optional()).query(async ({ input }) => {
      return lms.getDashboardStats(input?.companyId);
    }),

    // --- 協業先 (FR-17) ---
    partners: router({
      list: protectedProcedure.query(async () => lms.getAllPartners()),
      create: protectedProcedure.input(z.object({
        name: z.string().min(1),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        successFeeRate: z.number().int().min(0).max(100).default(20),
        contractNote: z.string().optional(),
      })).mutation(async ({ input }) => lms.createPartner(input)),
      update: protectedProcedure.input(z.object({
        id: z.number(),
        name: z.string().optional(),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        successFeeRate: z.number().int().min(0).max(100).optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => lms.updatePartner(input.id, input)),
      sales: protectedProcedure.input(z.object({ partnerId: z.number() })).query(async ({ input }) => lms.getPartnerSales(input.partnerId)),
      recordSale: protectedProcedure.input(z.object({
        partnerId: z.number(),
        companyId: z.number().optional(),
        yearMonth: z.string().regex(/^\d{4}-\d{2}$/),
        trainingSales: z.number().int().min(0),
        note: z.string().optional(),
      })).mutation(async ({ input }) => lms.recordPartnerSale(input)),
      // 成果報酬 = 研修売上 × 20% (助成金受給額には非連動 / FR-18)
      calcFee: protectedProcedure.input(z.object({ partnerSaleId: z.number() })).mutation(async ({ input }) => lms.calcSuccessFee(input.partnerSaleId)),
      fees: protectedProcedure.input(z.object({ partnerId: z.number() })).query(async ({ input }) => lms.getSuccessFees(input.partnerId)),
      monthlyReport: protectedProcedure.input(z.object({ partnerId: z.number() })).query(async ({ input }) => lms.getMonthlyPartnerReport(input.partnerId)),
    }),

    // --- 導入企業 / 事業所 (FR-03) ---
    companies: router({
      list: protectedProcedure.query(async () => lms.getAllCompanies()),
      getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => lms.getCompanyById(input.id)),
      create: protectedProcedure.input(z.object({
        partnerId: z.number().optional(),
        name: z.string().min(1),
        corporateNumber: z.string().optional(),
        address: z.string().optional(),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contractStartDate: z.string().optional(),
        contractEndDate: z.string().optional(),
      })).mutation(async ({ input }) => lms.createCompany(input)),
      update: protectedProcedure.input(z.object({
        id: z.number(),
        name: z.string().optional(),
        address: z.string().optional(),
        contactName: z.string().optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => lms.updateCompany(input.id, input)),
      branches: protectedProcedure.input(z.object({ companyId: z.number() })).query(async ({ input }) => lms.getBranchesByCompany(input.companyId)),
      createBranch: protectedProcedure.input(z.object({
        companyId: z.number(),
        name: z.string().min(1),
        insuranceOfficeNumber: z.string().optional(),
        address: z.string().optional(),
      })).mutation(async ({ input }) => lms.createBranch(input)),
    }),

    // --- マスターキー (FR-02) ---
    masterKeys: router({
      list: protectedProcedure.input(z.object({ companyId: z.number() })).query(async ({ input }) => lms.getMasterKeysByCompany(input.companyId)),
      issue: protectedProcedure.input(z.object({
        companyId: z.number(),
        expiresAt: z.string().nullable().optional(),
        maxUses: z.number().int().positive().nullable().optional(),
      })).mutation(async ({ input }) => lms.issueMasterKey(input.companyId, { expiresAt: input.expiresAt, maxUses: input.maxUses })),
      deactivate: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => lms.deactivateMasterKey(input.id)),
      validate: publicProcedure.input(z.object({ keyCode: z.string() })).query(async ({ input }) => lms.validateMasterKey(input.keyCode)),
    }),

    // --- 受講者 (FR-04) ---
    learners: router({
      listByCompany: protectedProcedure.input(z.object({ companyId: z.number() })).query(async ({ input }) => lms.getLearnersByCompany(input.companyId)),
      getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => lms.getLearnerById(input.id)),
      create: protectedProcedure.input(z.object({
        companyId: z.number(),
        branchId: z.number().optional(),
        name: z.string().min(1),
        email: z.string().email().optional(),
        lineUserId: z.string().optional(),
        preferredChannel: z.enum(["email", "line", "app"]).optional(),
        employeeNumber: z.string().optional(),
        department: z.string().optional(),
      })).mutation(async ({ input }) => lms.createLearner({ ...input, status: "invited" })),
      bulkCreate: protectedProcedure.input(z.object({
        companyId: z.number(),
        rows: z.array(z.object({
          name: z.string().min(1),
          email: z.string().optional(),
          employeeNumber: z.string().optional(),
          department: z.string().optional(),
        })),
      })).mutation(async ({ input }) => lms.bulkCreateLearners(input.companyId, input.rows)),
      update: protectedProcedure.input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        lineUserId: z.string().optional(),
        preferredChannel: z.enum(["email", "line", "app"]).optional(),
        department: z.string().optional(),
        status: z.enum(["invited", "active", "delayed", "completed", "expired", "suspended"]).optional(),
      })).mutation(async ({ input }) => lms.updateLearner(input.id, input)),
    }),

    // --- コース / レッスン (FR-05, FR-06) ---
    courses: router({
      list: protectedProcedure.query(async () => lms.getAllCourses()),
      getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => lms.getCourseById(input.id)),
      duration: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => lms.getCourseDuration(input.id)),
      create: protectedProcedure.input(z.object({
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
      update: protectedProcedure.input(z.object({
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
      createLesson: protectedProcedure.input(z.object({
        courseId: z.number(),
        title: z.string().min(1),
        chapter: z.string().optional(),
        videoUrl: z.string().optional(),
        durationMinutes: z.number().int().min(0).default(0),
        sortOrder: z.number().int().default(0),
        requireSequential: z.boolean().default(false),
        isRequired: z.boolean().default(true),
      })).mutation(async ({ input }) => lms.createLesson(input)),
      updateLesson: protectedProcedure.input(z.object({
        id: z.number(),
        title: z.string().optional(),
        videoUrl: z.string().optional(),
        durationMinutes: z.number().int().min(0).optional(),
        sortOrder: z.number().int().optional(),
        isRequired: z.boolean().optional(),
      })).mutation(async ({ input }) => lms.updateLesson(input.id, input)),
      deleteLesson: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => lms.deleteLesson(input.id)),
    }),

    // --- 受講割当 / 進捗 (FR-11) ---
    enrollments: router({
      byCourse: protectedProcedure.input(z.object({ courseId: z.number() })).query(async ({ input }) => lms.getEnrollmentsByCourse(input.courseId)),
      byLearner: protectedProcedure.input(z.object({ learnerId: z.number() })).query(async ({ input }) => lms.getEnrollmentsByLearner(input.learnerId)),
      getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => lms.getEnrollmentById(input.id)),
      assign: protectedProcedure.input(z.object({
        learnerId: z.number(),
        courseId: z.number(),
        dueDate: z.string().nullable().optional(),
      })).mutation(async ({ input }) => lms.assignEnrollment(input.learnerId, input.courseId, input.dueDate)),
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
      create: protectedProcedure.input(z.object({
        courseId: z.number(),
        title: z.string().min(1),
        passingScore: z.number().int().min(0).max(100).default(80),
        maxAttempts: z.number().int().positive().nullable().optional(),
        timeLimitMinutes: z.number().int().positive().nullable().optional(),
        shuffleQuestions: z.boolean().default(false),
      })).mutation(async ({ input }) => lms.createQuiz(input)),
      addQuestion: protectedProcedure.input(z.object({
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
      review: protectedProcedure.input(z.object({
        reportId: z.number(),
        action: z.enum(["approve", "return"]),
        comment: z.string().optional(),
      })).mutation(async ({ input }) => lms.reviewLearningReport(input.reportId, input.action, input.comment)),
    }),

    // --- 修了証 (FR-12) ---
    certificates: router({
      issue: protectedProcedure.input(z.object({ enrollmentId: z.number(), issuer: z.string().optional() })).mutation(async ({ input }) => lms.issueCertificate(input.enrollmentId, input.issuer)),
      getByEnrollment: protectedProcedure.input(z.object({ enrollmentId: z.number() })).query(async ({ input }) => lms.getCertificateByEnrollment(input.enrollmentId)),
      byCompany: protectedProcedure.input(z.object({ companyId: z.number() })).query(async ({ input }) => lms.getCertificatesByCompany(input.companyId)),
      byCourse: protectedProcedure.input(z.object({ courseId: z.number() })).query(async ({ input }) => lms.getCertificatesByCourse(input.courseId)),
      recordDownload: protectedProcedure.input(z.object({ id: z.number(), actor: z.string().optional() })).mutation(async ({ input }) => lms.recordCertificateDownload(input.id, input.actor)),
    }),

    // --- 申請準備チェックリスト (FR-16) ---
    checklist: router({
      compute: protectedProcedure.input(z.object({ companyId: z.number(), courseId: z.number() })).query(async ({ input }) => lms.computeApplicationChecklist(input.companyId, input.courseId)),
      setAdvisorReview: protectedProcedure.input(z.object({
        companyId: z.number(),
        courseId: z.number(),
        reviewed: z.boolean(),
        comment: z.string().optional(),
      })).mutation(async ({ input }) => lms.setAdvisorReview(input.companyId, input.courseId, input.reviewed, input.comment)),
    }),

    // --- 証跡出力CSV (FR-15) ---
    exports: router({
      courseProgressCsv: protectedProcedure.input(z.object({ courseId: z.number(), actor: z.string().optional() })).mutation(async ({ input }) => ({ csv: await lms.exportCourseProgressCsv(input.courseId, input.actor) })),
      tenHourCompletersCsv: protectedProcedure.input(z.object({ actor: z.string().optional() }).optional()).mutation(async ({ input }) => ({ csv: await lms.exportTenHourCompletersCsv(input?.actor) })),
      priceJustificationCsv: protectedProcedure.input(z.object({ actor: z.string().optional() }).optional()).mutation(async ({ input }) => ({ csv: await lms.exportPriceJustificationCsv(input?.actor) })),
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
      reminderTargets: protectedProcedure.input(z.object({ companyId: z.number().optional() }).optional()).query(async ({ input }) => lms.detectReminderTargets(input?.companyId)),
      send: protectedProcedure.input(z.object({
        learnerIds: z.array(z.number()),
        channel: z.string().default("email"), // "email" | "line" | "app" | "auto"(受講者の希望チャネル)
        notificationId: z.number().optional(),
        subject: z.string().optional(),
        body: z.string().optional(),
      })).mutation(async ({ input }) => lms.sendReminders(input)),
    }),

    // --- 社労士・申請確認者(証跡確認) ---
    advisor: router({
      companyOverview: protectedProcedure.query(async () => lms.getAdvisorCompanyOverview()),
      learnerEvidence: protectedProcedure.input(z.object({ enrollmentId: z.number() })).query(async ({ input }) => lms.getLearnerEvidence(input.enrollmentId)),
      certificatesByCompany: protectedProcedure.input(z.object({ companyId: z.number() })).query(async ({ input }) => lms.getCertificatesByCompany(input.companyId)),
    }),

    // --- 監査ログ (FR-19) ---
    auditLogs: protectedProcedure.input(z.object({ limit: z.number().int().positive().max(1000).optional() }).optional()).query(async ({ input }) => lms.getAuditLogs(input?.limit)),

    // --- デモデータ投入 ---
    seedDemo: protectedProcedure.mutation(async () => lms.seedDemoData()),
  }),
});

export type AppRouter = typeof appRouter;
