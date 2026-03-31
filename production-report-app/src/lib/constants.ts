import type { ReportStatus, SlotStatus, UserRole } from "./types";

// 時間帯: 7:00開始、24本。終了時刻はHH:59形式
export const TIME_SLOTS = [7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,0,1,2,3,4,5,6].map(
  (hour) => {
    const hh = String(hour).padStart(2, "0");
    return {
      start: `${hh}:00`,
      end: `${hh}:59`,
      label: `${hh}:00〜${hh}:59`,
      hhmm: `${hh}00`,
    };
  }
);

export const MACHINES = ["M06", "M07"] as const;

export const MACHINE_LABELS: Record<string, { ja: string; vi: string }> = {
  M06: { ja: "6号機", vi: "Máy số 6" },
  M07: { ja: "7号機", vi: "Máy số 7" },
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
  staff: { ja: "現場スタッフ", vi: "Nhân viên sản xuất" },
  kakarichou: { ja: "係長", vi: "Trưởng ca" },
  hinshitsu: { ja: "品証課", vi: "Bộ phận QC" },
  buchou: { ja: "部長", vi: "Trưởng phòng" },
  admin: { ja: "管理者", vi: "Quản trị viên" },
};

/**
 * 営業日ルール: 7:00開始 → 翌6:59終了 = 1日分
 * 7:00前のアクセス → 前日の日報に紐づく
 * 日付形式: YYYY/MM/DD
 */
export function getReportDate(now: Date = new Date()): string {
  const adjusted = new Date(now);
  if (adjusted.getHours() < 7) {
    adjusted.setDate(adjusted.getDate() - 1);
  }
  const y = adjusted.getFullYear();
  const m = String(adjusted.getMonth() + 1).padStart(2, "0");
  const d = String(adjusted.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

export function formatReportDate(date: string): string {
  // YYYY/MM/DD はそのまま表示可能
  return date;
}

export function buildReportId(date: string, machineNo: string): string {
  return `${date.replace(/[\/-]/g, "")}_${machineNo}`;
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

export function getMachineLabel(machineNo: string, lang: "ja" | "vi"): string {
  return MACHINE_LABELS[machineNo]?.[lang] || machineNo;
}
