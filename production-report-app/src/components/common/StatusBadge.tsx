"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n";
import type { ReportStatus, SlotStatus } from "@/lib/types";

const REPORT_STATUS_STYLES: Record<ReportStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-orange-100 text-orange-700",
  approved_kakarichou: "bg-blue-100 text-blue-700",
  approved_hinshitsu: "bg-blue-100 text-blue-700",
  approved_buchou: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  resubmitted: "bg-orange-100 text-orange-700",
};

const REPORT_STATUS_KEYS: Record<ReportStatus, TranslationKey> = {
  draft: "status_draft",
  submitted: "status_submitted",
  approved_kakarichou: "status_approved_kakarichou",
  approved_hinshitsu: "status_approved_hinshitsu",
  approved_buchou: "status_approved_buchou",
  rejected: "status_rejected",
  resubmitted: "status_resubmitted",
};

const SLOT_STATUS_STYLES: Record<SlotStatus, string> = {
  empty: "bg-gray-100 text-gray-600",
  filled: "bg-green-100 text-green-700",
  has_stop: "bg-red-100 text-red-700",
};

const SLOT_STATUS_KEYS: Record<SlotStatus, TranslationKey> = {
  empty: "slot_status_empty",
  filled: "slot_status_filled",
  has_stop: "slot_status_has_stop",
};

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const { lang } = useLanguage();
  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${REPORT_STATUS_STYLES[status]}`}
    >
      {t(lang, REPORT_STATUS_KEYS[status])}
    </span>
  );
}

export function SlotStatusBadge({ status }: { status: SlotStatus }) {
  const { lang } = useLanguage();
  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${SLOT_STATUS_STYLES[status]}`}
    >
      {t(lang, SLOT_STATUS_KEYS[status])}
    </span>
  );
}
