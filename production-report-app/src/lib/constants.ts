import type { ReportStatus, SlotStatus, UserRole } from "./types";

// Time slots: 7:00 start, 24 hourly slots
export const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = (7 + i) % 24;
  const nextHour = (8 + i) % 24;
  return {
    start: `${String(hour).padStart(2, "0")}:00`,
    end: `${String(nextHour).padStart(2, "0")}:00`,
    label: `${String(hour).padStart(2, "0")}:00〜${String(nextHour).padStart(2, "0")}:00`,
  };
});

export const MACHINES = ["M06", "M07"] as const;

export const MACHINE_LABELS: Record<string, string> = {
  M06: "6号機",
  M07: "7号機",
};

export const STATUS_COLORS: Record<SlotStatus, string> = {
  filled: "bg-green-500",
  has_stop: "bg-red-500",
  empty: "bg-gray-300",
};

export const REPORT_STATUS_COLORS: Record<ReportStatus, string> = {
  draft: "bg-gray-400",
  submitted: "bg-orange-400",
  approved_kakarichou: "bg-blue-400",
  approved_hinshitsu: "bg-blue-500",
  approved_buchou: "bg-green-500",
  rejected: "bg-red-500",
  resubmitted: "bg-orange-400",
};

export const APPROVAL_ORDER: UserRole[] = [
  "kakarichou",
  "hinshitsu",
  "buchou",
];

export const ROLE_LABELS: Record<UserRole, { ja: string; vi: string }> = {
  staff: { ja: "現場スタッフ", vi: "Nhân viên" },
  kakarichou: { ja: "係長", vi: "Trưởng nhóm" },
  hinshitsu: { ja: "品証課", vi: "QA" },
  buchou: { ja: "部長", vi: "Trưởng phòng" },
  admin: { ja: "管理者", vi: "Quản trị viên" },
};

// Report date: 7:00 start, ends next day 6:59
export function getReportDate(now: Date = new Date()): string {
  const adjusted = new Date(now);
  if (adjusted.getHours() < 7) {
    adjusted.setDate(adjusted.getDate() - 1);
  }
  const y = adjusted.getFullYear();
  const m = String(adjusted.getMonth() + 1).padStart(2, "0");
  const d = String(adjusted.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatReportDate(date: string): string {
  return date.replace(/-/g, "/");
}

export function buildReportId(date: string, machineNo: string): string {
  return `${date.replace(/-/g, "")}_${machineNo}`;
}

export function buildSlotId(
  reportId: string,
  startTime: string
): string {
  return `${reportId}_${startTime.replace(":", "")}`;
}

export function buildInputId(slotId: string): string {
  return `${slotId}_01`;
}
