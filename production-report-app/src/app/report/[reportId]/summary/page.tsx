"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n";
import { formatReportDate, MACHINE_LABELS, APPROVAL_ORDER } from "@/lib/constants";
import { Header } from "@/components/layout/Header";
import { Loading } from "@/components/common/Loading";
import { ReportStatusBadge } from "@/components/common/StatusBadge";
import { Toast } from "@/components/common/Toast";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useDailySummary } from "@/hooks/useApproval";
import { useSubmitForApproval } from "@/hooks/useReport";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import type { TranslationKey } from "@/i18n";

export default function SummaryPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const reportId = params.reportId as string;

  const { data: summary, isLoading } = useDailySummary(reportId);
  const submitApproval = useSubmitForApproval();

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  if (isLoading) return <Loading />;
  if (!summary) return null;

  const { report, slots, inputs, approvals, totals } = summary;
  const isComplete = report.filled_slots >= report.total_slots;
  const canSubmit =
    isComplete && report.status === "draft" && user?.role === "staff";
  const isSubmitted = report.status !== "draft" && report.status !== "rejected";

  const handleSubmit = async () => {
    setShowSubmitConfirm(false);
    try {
      await submitApproval.mutateAsync(reportId);
      setToast({ message: t(lang, "success"), type: "success" });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : t(lang, "error"),
        type: "error",
      });
    }
  };

  const approvalStepKeys: Record<string, TranslationKey> = {
    kakarichou: "approval_step_kakarichou",
    hinshitsu: "approval_step_hinshitsu",
    buchou: "approval_step_buchou",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {showSubmitConfirm && (
        <ConfirmDialog
          message={t(lang, "summary_submit_confirm")}
          onConfirm={handleSubmit}
          onCancel={() => setShowSubmitConfirm(false)}
        />
      )}

      <main className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => router.push(`/report/${reportId}`)}
          className="text-blue-600 text-sm mb-2 hover:underline"
        >
          {t(lang, "back")}
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {t(lang, "summary_title")}
            </h1>
            <p className="text-gray-500">
              {formatReportDate(report.report_date)} -{" "}
              {MACHINE_LABELS[report.machine_no] || report.machine_no}
            </p>
          </div>
          <ReportStatusBadge status={report.status} />
        </div>

        {/* Totals Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <StatCard
            label={t(lang, "summary_total_discharge")}
            value={totals.total_discharge}
          />
          <StatCard
            label={t(lang, "summary_total_machine_discharge")}
            value={totals.total_machine_discharge}
          />
          <StatCard
            label={t(lang, "summary_stop_count")}
            value={totals.stop_count}
            highlight={totals.stop_count > 0 ? "red" : undefined}
          />
          <StatCard
            label={t(lang, "summary_ng_count")}
            value={totals.ng_count}
            highlight={totals.ng_count > 0 ? "red" : undefined}
          />
          <StatCard
            label={t(lang, "summary_total_stop_minutes")}
            value={totals.total_stop_minutes}
          />
        </div>

        {/* Approval Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h2 className="font-bold text-gray-800 mb-3">
            {t(lang, "approval_status")}
          </h2>
          <div className="flex gap-2">
            {APPROVAL_ORDER.map((role) => {
              const approval = approvals.find((a) => a.role === role);
              const status = approval?.status || "pending";
              return (
                <div
                  key={role}
                  className={`flex-1 p-3 rounded-lg text-center text-sm font-medium ${
                    status === "approved"
                      ? "bg-green-100 text-green-700"
                      : status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <div>{t(lang, approvalStepKeys[role])}</div>
                  <div className="text-xs mt-1">
                    {status === "approved"
                      ? t(lang, "approval_approved")
                      : status === "rejected"
                        ? t(lang, "approval_rejected")
                        : t(lang, "approval_pending")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Slot Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <h2 className="font-bold text-gray-800 p-4 border-b">
            {t(lang, "summary_time_slot_table")}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-3 py-2 text-left">
                    {t(lang, "slot_list_title")}
                  </th>
                  <th className="px-3 py-2 text-right">
                    {t(lang, "input_case_no_start")}
                  </th>
                  <th className="px-3 py-2 text-right">
                    {t(lang, "input_case_no_end")}
                  </th>
                  <th className="px-3 py-2 text-left">
                    {t(lang, "input_product_name")}
                  </th>
                  <th className="px-3 py-2 text-right">
                    {t(lang, "input_discharge_count")}
                  </th>
                  <th className="px-3 py-2 text-center">
                    {t(lang, "input_has_stop")}
                  </th>
                  <th className="px-3 py-2 text-center">
                    {t(lang, "input_verification")}
                  </th>
                  <th className="px-3 py-2 text-center">
                    {t(lang, "input_judgment")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => {
                  const input = inputs.find((i) => i.slot_id === slot.slot_id);
                  return (
                    <tr
                      key={slot.slot_id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-3 py-2 font-medium">
                        {slot.start_time}〜{slot.end_time}
                      </td>
                      {input ? (
                        <>
                          <td className="px-3 py-2 text-right">
                            {input.case_no_start}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {input.case_no_end}
                          </td>
                          <td className="px-3 py-2">
                            {input.product_name}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {input.discharge_count}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {String(input.has_stop) === "true" ? (
                              <span className="text-red-600 font-bold">
                                {t(lang, "input_has_stop_yes")}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={
                                input.verification === "○"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {input.verification}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={
                                input.judgment === "合"
                                  ? "text-green-600"
                                  : "text-red-600 font-bold"
                              }
                            >
                              {input.judgment}
                            </span>
                          </td>
                        </>
                      ) : (
                        <td
                          colSpan={7}
                          className="px-3 py-2 text-gray-400 text-center"
                        >
                          {t(lang, "slot_status_empty")}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pb-8">
          {canSubmit ? (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              disabled={submitApproval.isPending}
              className="w-full py-4 rounded-xl bg-orange-500 text-white font-bold text-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {t(lang, "summary_submit")}
            </button>
          ) : !isComplete ? (
            <p className="text-center text-orange-600 font-medium">
              {t(lang, "summary_not_complete")}
            </p>
          ) : isSubmitted ? (
            <p className="text-center text-green-600 font-medium">
              {t(lang, "summary_already_submitted")}
            </p>
          ) : null}

          {user?.isApprover && isSubmitted && (
            <button
              onClick={() =>
                router.push(`/report/${reportId}/approval`)
              }
              className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors mt-3"
            >
              {t(lang, "approval_title")}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: "red";
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p
        className={`text-2xl font-bold ${
          highlight === "red" ? "text-red-600" : "text-gray-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
