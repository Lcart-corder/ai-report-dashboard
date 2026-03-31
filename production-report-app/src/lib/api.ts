import type {
  ApiResponse,
  CreateReportResponse,
  DailyReport,
  DailySummary,
  PendingApproval,
  ProductionInput,
  SaveInputResponse,
  StopCode,
  TimeSlot,
  User,
} from "./types";

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || "";

async function gasGet<T>(
  action: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(GAS_URL);
  url.searchParams.set("action", action);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error?.message || "API error");
  return json.data as T;
}

async function gasPost<T>(
  action: string,
  params: Record<string, unknown>
): Promise<T> {
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params }),
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error?.message || "API error");
  return json.data as T;
}

// GET APIs
export const api = {
  getCurrentUser: (email: string) =>
    gasGet<User>("getCurrentUser", { email }),

  getReport: (reportId: string) =>
    gasGet<DailyReport>("getReport", { report_id: reportId }),

  getReportsByDate: (date: string) =>
    gasGet<DailyReport[]>("getReportsByDate", { date }),

  getTimeSlots: (reportId: string) =>
    gasGet<TimeSlot[]>("getTimeSlots", { report_id: reportId }),

  getProductionInput: (slotId: string) =>
    gasGet<ProductionInput | null>("getProductionInput", {
      slot_id: slotId,
    }),

  getDailySummary: (reportId: string) =>
    gasGet<DailySummary>("getDailySummary", { report_id: reportId }),

  getStopCodes: () => gasGet<StopCode[]>("getStopCodes"),

  getUsers: () => gasGet<User[]>("getUsers"),

  getMyReports: (email: string, limit = 30) =>
    gasGet<DailyReport[]>("getMyReports", {
      email,
      limit: String(limit),
    }),

  getPendingApprovals: (role: string) =>
    gasGet<PendingApproval[]>("getPendingApprovals", { role }),

  // POST APIs
  createReport: (reportDate: string, machineNo: string, createdBy: string) =>
    gasPost<CreateReportResponse>("createReport", {
      report_date: reportDate,
      machine_no: machineNo,
      created_by: createdBy,
    }),

  saveProductionInput: (data: Record<string, unknown>) =>
    gasPost<SaveInputResponse>("saveProductionInput", data),

  deleteProductionInput: (slotId: string, reportId: string) =>
    gasPost<{ deleted: boolean }>("deleteProductionInput", {
      slot_id: slotId,
      report_id: reportId,
    }),

  submitForApproval: (reportId: string, submittedBy: string) =>
    gasPost<DailyReport>("submitForApproval", {
      report_id: reportId,
      submitted_by: submittedBy,
    }),

  approveReport: (reportId: string, approverEmail: string, comment?: string) =>
    gasPost<unknown>("approveReport", {
      report_id: reportId,
      approver_email: approverEmail,
      comment: comment || "",
    }),

  rejectReport: (reportId: string, approverEmail: string, comment: string) =>
    gasPost<unknown>("rejectReport", {
      report_id: reportId,
      approver_email: approverEmail,
      comment,
    }),
};
