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
  report_id: string; // YYYYMMDD_Mxx
  report_date: string; // YYYY-MM-DD
  machine_no: string; // M06 or M07
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
  slot_id: string; // YYYYMMDD_Mxx_HHMM
  report_id: string;
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  status: SlotStatus;
  created_at: string;
  updated_at: string;
}

// ===== Production Input =====
export type Verification = "○" | "×";
export type Judgment = "合" | "否";

export interface ProductionInput {
  input_id: string; // YYYYMMDD_Mxx_HHMM_01
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
  approval_id: string; // YYYYMMDD_Mxx_role
  report_id: string;
  role: UserRole;
  status: ApprovalStatus;
  approver_email: string;
  comment: string;
  acted_at: string;
  created_at: string;
  updated_at: string;
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
  error?: string;
}

export interface SaveInputResponse {
  input: ProductionInput;
  next_unfilled_slot: TimeSlot | null;
  report_progress: {
    total_slots: number;
    filled_slots: number;
    is_complete: boolean;
  };
}

export interface DailySummary {
  report: DailyReport;
  slots: TimeSlot[];
  inputs: ProductionInput[];
  approvals: Approval[];
  totals: {
    total_discharge: number;
    total_machine_discharge: number;
    stop_count: number;
    ng_count: number;
    total_stop_minutes: number;
  };
}

export interface PendingApproval {
  report: DailyReport;
  current_role: UserRole;
}

// ===== Language =====
export type Language = "ja" | "vi";
export type MachineNo = "M06" | "M07";
