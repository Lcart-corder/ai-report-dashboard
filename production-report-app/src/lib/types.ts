// ===== User =====
export type UserRole =
  | "staff"
  | "kakarichou"
  | "hinshitsu"
  | "buchou"
  | "admin";

export interface User {
  email: string;
  name: string;
  name_vi: string;
  role: UserRole;
  machine_no: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ===== Daily Report =====
export type ReportStatus =
  | "draft"
  | "submitted"
  | "approved_kakarichou"
  | "approved_hinshitsu"
  | "approved_buchou"
  | "rejected"
  | "resubmitted";

export interface DailyReport {
  report_id: string;
  report_date: string; // YYYY/MM/DD
  machine_no: string;
  status: ReportStatus;
  total_slots: number;
  filled_slots: number;
  has_stop: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
}

// ===== Time Slot =====
export type SlotStatus = "empty" | "filled" | "has_stop";

export interface TimeSlot {
  slot_id: string;
  report_id?: string;
  start_time: string; // HH:00
  end_time: string; // HH:59
  status: SlotStatus;
  created_at?: string;
  updated_at?: string;
}

// ===== Production Input =====
export type Verification = "○" | "×";
export type Judgment = "合" | "否";

export interface ProductionInput {
  input_id: string;
  slot_id: string;
  report_id: string;
  case_no_start: number;
  case_no_end: number;
  product_name: string;
  has_stop: boolean;
  stop_code: string;
  stop_time_minutes: number;
  abnormality: string;
  discharge_count: number;
  machine_discharge: number;
  verification: Verification;
  first_weight: number;
  judgment: Judgment;
  input_by: string;
  input_at: string;
  updated_by: string;
  updated_at: string;
}

export interface ProductionInputForm {
  case_no_start: number | "";
  case_no_end: number | "";
  product_name: string;
  has_stop: boolean;
  stop_code: string;
  stop_time_minutes: number | "";
  abnormality: string;
  discharge_count: number | "";
  machine_discharge: number | "";
  verification: Verification;
  first_weight: number | "";
  judgment: Judgment;
}

// ===== Approval =====
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Approval {
  role: UserRole;
  status: ApprovalStatus;
  approver_email: string;
  comment: string;
  acted_at: string;
}

// ===== Stop Code =====
export interface StopCode {
  stop_code: string;
  name_ja: string;
  name_vi: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ===== API Responses =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string } | null;
}

/** saveProductionInput のレスポンス */
export interface SaveInputResponse {
  input_id: string;
  saved: boolean;
  next_empty_slot: {
    slot_id: string;
    start_time: string;
    end_time: string;
  } | null;
  report_progress: {
    filled_slots: number;
    total_slots: number;
    all_filled: boolean;
  };
}

/** createReport のレスポンス */
export interface CreateReportResponse {
  report_id: string;
  status: string;
  total_slots: number;
  filled_slots: number;
  time_slots: { slot_id: string; start_time: string; end_time: string; status: string }[];
}

/** getDailySummary のレスポンス (API仕様04準拠) */
export interface DailySummary {
  report: DailyReport;
  slots: SummarySlot[];
  approvals: Approval[];
  summary_stats: {
    total_discharge: number;
    total_machine_discharge: number;
    stop_count: number;
    total_stop_minutes: number;
    ng_count: number;
  };
}

export interface SummarySlot {
  slot_id: string;
  start_time: string;
  end_time: string;
  status: string;
  input?: {
    case_no_start: number;
    case_no_end: number;
    product_name: string;
    has_stop: boolean;
    stop_code?: string;
    stop_time_minutes?: number;
    abnormality?: string;
    discharge_count: number;
    machine_discharge: number;
    verification: string;
    first_weight: number;
    judgment: string;
  };
}

export interface PendingApproval {
  report: DailyReport;
  current_role: UserRole;
}

// ===== Language =====
export type Language = "ja" | "vi";
export type MachineNo = "M06" | "M07";
