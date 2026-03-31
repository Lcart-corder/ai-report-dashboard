import type {
  ApiResponse,
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

async function fetchGAS<T>(
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
  if (!json.success) throw new Error(json.error || "API error");
  return json.data as T;
}

async function postGAS<T>(
  action: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error || "API error");
  return json.data as T;
}

// GET APIs
export const api = {
  getCurrentUser: (email: string) =>
    fetchGAS<User>("getCurrentUser", { email }),

  getReport: (reportId: string) =>
    fetchGAS<DailyReport>("getReport", { report_id: reportId }),

  getReportsByDate: (date: string) =>
    fetchGAS<DailyReport[]>("getReportsByDate", { date }),

  getTimeSlots: (reportId: string) =>
    fetchGAS<TimeSlot[]>("getTimeSlots", { report_id: reportId }),

  getProductionInput: (slotId: string) =>
    fetchGAS<ProductionInput | null>("getProductionInput", {
      slot_id: slotId,
    }),

  getDailySummary: (reportId: string) =>
    fetchGAS<DailySummary>("getDailySummary", { report_id: reportId }),

  getStopCodes: () => fetchGAS<StopCode[]>("getStopCodes"),

  getUsers: () => fetchGAS<User[]>("getUsers"),

  getMyReports: (email: string, limit = 30) =>
    fetchGAS<DailyReport[]>("getMyReports", {
      email,
      limit: String(limit),
    }),

  getPendingApprovals: (role: string) =>
    fetchGAS<PendingApproval[]>("getPendingApprovals", { role }),

  // POST APIs
  createReport: (reportDate: string, machineNo: string, email: string) =>
    postGAS<DailyReport>("createReport", {
      report_date: reportDate,
      machine_no: machineNo,
      email,
    }),

  saveProductionInput: (data: Record<string, unknown>) =>
    postGAS<SaveInputResponse>("saveProductionInput", data),

  deleteProductionInput: (slotId: string, reportId: string) =>
    postGAS<{ deleted: boolean }>("deleteProductionInput", {
      slot_id: slotId,
      report_id: reportId,
    }),

  submitForApproval: (reportId: string) =>
    postGAS<DailyReport>("submitForApproval", { report_id: reportId }),

  approveReport: (reportId: string, role: string, email: string) =>
    postGAS<unknown>("approveReport", {
      report_id: reportId,
      role,
      email,
    }),

  rejectReport: (
    reportId: string,
    role: string,
    email: string,
    comment: string
  ) =>
    postGAS<unknown>("rejectReport", {
      report_id: reportId,
      role,
      email,
      comment,
    }),
};
