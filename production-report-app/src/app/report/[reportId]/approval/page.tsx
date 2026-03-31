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
import { useDailySummary, useApproveReport, useRejectReport } from "@/hooks/useApproval";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import type { TranslationKey } from "@/i18n";

export default function ApprovalPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const reportId = params.reportId as string;

  const { data: summary, isLoading } = useDailySummary(reportId);
  const approveReport = useApproveReport();
  const rejectReport = useRejectReport();

  const [comment, setComment] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  if (isLoading) return <Loading />;
  if (!summary || !user) return null;

  const { report, totals, approvals } = summary;

  // Determine if current user can act
  const canApprove =
    user.isApprover &&
    (user.role === "admin" ||
      APPROVAL_ORDER.includes(user.role as (typeof APPROVAL_ORDER)[number]));

  // Check which step we're at
  const currentApprovalRole = APPROVAL_ORDER.find((role) => {
    const approval = approvals.find((a) => a.role === role);
    return approval?.status === "pending";
  });

  const isMyTurn = currentApprovalRole === user.role || user.role === "admin";

  const handleApprove = async () => {
    setShowApproveConfirm(false);
    const role = user.role === "admin" ? currentApprovalRole! : user.role;
    try {
      await approveReport.mutateAsync({
        reportId,
        role,
        email: user.email,
      });
      setToast({ message: t(lang, "success"), type: "success" });
      setTimeout(() => router.push("/"), 1000);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : t(lang, "error"),
        type: "error",
      });
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      setToast({
        message: t(lang, "approval_comment_required"),
        type: "error",
      });
      setShowRejectConfirm(false);
      return;
    }
    setShowRejectConfirm(false);
    const role = user.role === "admin" ? currentApprovalRole! : user.role;
    try {
      await rejectReport.mutateAsync({
        reportId,
        role,
        email: user.email,
        comment,
      });
      setToast({ message: t(lang, "success"), type: "success" });
      setTimeout(() => router.push("/"), 1000);
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
      {showApproveConfirm && (
        <ConfirmDialog
          message={t(lang, "approval_approve_confirm")}
          onConfirm={handleApprove}
          onCancel={() => setShowApproveConfirm(false)}
        />
      )}
      {showRejectConfirm && (
        <ConfirmDialog
          message={t(lang, "approval_reject_confirm")}
          onConfirm={handleReject}
          onCancel={() => setShowRejectConfirm(false)}
        />
      )}

      <main className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => router.push(`/report/${reportId}/summary`)}
          className="text-blue-600 text-sm mb-2 hover:underline"
        >
          {t(lang, "back")}
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {t(lang, "approval_title")}
            </h1>
            <p className="text-gray-500">
              {formatReportDate(report.report_date)} -{" "}
              {MACHINE_LABELS[report.machine_no] || report.machine_no}
            </p>
          </div>
          <ReportStatusBadge status={report.status} />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-xs text-gray-500">
              {t(lang, "summary_total_discharge")}
            </p>
            <p className="text-xl font-bold">{totals.total_discharge}</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-xs text-gray-500">
              {t(lang, "summary_stop_count")}
            </p>
            <p
              className={`text-xl font-bold ${totals.stop_count > 0 ? "text-red-600" : ""}`}
            >
              {totals.stop_count}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-xs text-gray-500">
              {t(lang, "summary_ng_count")}
            </p>
            <p
              className={`text-xl font-bold ${totals.ng_count > 0 ? "text-red-600" : ""}`}
            >
              {totals.ng_count}
            </p>
          </div>
        </div>

        {/* Approval Steps */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h2 className="font-bold text-gray-800 mb-3">
            {t(lang, "approval_status")}
          </h2>
          <div className="space-y-2">
            {APPROVAL_ORDER.map((role) => {
              const approval = approvals.find((a) => a.role === role);
              const status = approval?.status || "pending";
              const isCurrent = currentApprovalRole === role;
              return (
                <div
                  key={role}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isCurrent
                      ? "bg-orange-50 border border-orange-200"
                      : status === "approved"
                        ? "bg-green-50 border border-green-200"
                        : status === "rejected"
                          ? "bg-red-50 border border-red-200"
                          : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <span className="font-medium">
                    {t(lang, approvalStepKeys[role])}
                  </span>
                  <div className="flex items-center gap-2">
                    {approval?.approver_email && (
                      <span className="text-xs text-gray-500">
                        {approval.approver_email}
                      </span>
                    )}
                    <span
                      className={`text-sm font-medium ${
                        status === "approved"
                          ? "text-green-600"
                          : status === "rejected"
                            ? "text-red-600"
                            : "text-gray-400"
                      }`}
                    >
                      {status === "approved"
                        ? t(lang, "approval_approved")
                        : status === "rejected"
                          ? t(lang, "approval_rejected")
                          : t(lang, "approval_pending")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rejection comment if any */}
          {approvals.some(
            (a) => a.status === "rejected" && a.comment
          ) && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">
                {approvals.find((a) => a.status === "rejected")?.comment}
              </p>
            </div>
          )}
        </div>

        {/* Approval Actions */}
        {canApprove && isMyTurn && (
          <div className="space-y-4 pb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(lang, "approval_comment")}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder={t(lang, "approval_comment_required")}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectConfirm(true)}
                disabled={rejectReport.isPending}
                className="flex-1 py-4 rounded-xl border-2 border-red-300 text-red-600 font-bold text-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                {t(lang, "approval_reject")}
              </button>
              <button
                onClick={() => setShowApproveConfirm(true)}
                disabled={approveReport.isPending}
                className="flex-1 py-4 rounded-xl bg-green-600 text-white font-bold text-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {t(lang, "approval_approve")}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
