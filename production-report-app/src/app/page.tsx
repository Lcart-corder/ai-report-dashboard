"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMachine } from "@/contexts/MachineContext";
import { t } from "@/i18n";
import {
  buildReportId,
  formatReportDate,
  getReportDate,
  MACHINE_LABELS,
} from "@/lib/constants";
import { Header } from "@/components/layout/Header";
import { Loading } from "@/components/common/Loading";
import { ReportStatusBadge } from "@/components/common/StatusBadge";
import { useReportsByDate, useMyReports, useCreateReport } from "@/hooks/useReport";
import { usePendingApprovals } from "@/hooks/useApproval";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const { machineNo } = useMachine();
  const router = useRouter();

  const today = getReportDate();
  const reportId = buildReportId(today, machineNo);

  const { data: todayReports, isLoading: reportsLoading } =
    useReportsByDate(today);
  const { data: myReports } = useMyReports(user?.email || "");
  const { data: pendingApprovals } = usePendingApprovals(
    user?.isApprover ? user.role : ""
  );
  const createReport = useCreateReport();
  const [creating, setCreating] = useState(false);

  if (authLoading) return <Loading />;
  if (!user) return null;

  const todayReport = todayReports?.find(
    (r) => r.report_id === reportId
  );

  const handleCreateOrContinue = async () => {
    if (todayReport) {
      // Find next unfilled slot or go to list
      router.push(`/report/${todayReport.report_id}`);
      return;
    }

    setCreating(true);
    try {
      const report = await createReport.mutateAsync({
        reportDate: today,
        machineNo,
        email: user.email,
      });
      router.push(`/report/${report.report_id}`);
    } finally {
      setCreating(false);
    }
  };

  const progress = todayReport
    ? Math.round(
        (todayReport.filled_slots / todayReport.total_slots) * 100
      )
    : 0;

  const isComplete =
    todayReport && todayReport.filled_slots >= todayReport.total_slots;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Today's Report Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {t(lang, "home_today_report")}
              </h2>
              <p className="text-gray-500">
                {formatReportDate(today)} - {MACHINE_LABELS[machineNo]}
              </p>
            </div>
            {todayReport && <ReportStatusBadge status={todayReport.status} />}
          </div>

          {todayReport ? (
            <>
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{t(lang, "home_progress")}</span>
                  <span>
                    {t(lang, "home_slots_filled", {
                      filled: todayReport.filled_slots,
                      total: todayReport.total_slots,
                    })}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 rounded-full h-4 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleCreateOrContinue}
                className="w-full py-4 rounded-xl text-white font-bold text-lg bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {isComplete
                  ? t(lang, "home_view_summary")
                  : t(lang, "home_continue_input")}
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-400 mb-4">
                {t(lang, "home_no_report")}
              </p>
              <button
                onClick={handleCreateOrContinue}
                disabled={creating}
                className="w-full py-4 rounded-xl text-white font-bold text-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {creating ? t(lang, "loading") : t(lang, "home_create_report")}
              </button>
            </>
          )}
        </div>

        {/* Pending Approvals (for approvers) */}
        {user.isApprover && pendingApprovals && pendingApprovals.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {t(lang, "home_pending_approvals")}
            </h2>
            <div className="space-y-2">
              {pendingApprovals.map((item) => (
                <button
                  key={item.report.report_id}
                  onClick={() =>
                    router.push(`/report/${item.report.report_id}/approval`)
                  }
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors text-left"
                >
                  <div>
                    <span className="font-medium">
                      {formatReportDate(item.report.report_date)}
                    </span>
                    <span className="text-gray-500 ml-2">
                      {MACHINE_LABELS[item.report.machine_no] ||
                        item.report.machine_no}
                    </span>
                  </div>
                  <ReportStatusBadge status={item.report.status} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Past Reports */}
        {myReports && myReports.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {t(lang, "home_past_reports")}
            </h2>
            <div className="space-y-2">
              {myReports.slice(0, 10).map((report) => (
                <button
                  key={report.report_id}
                  onClick={() => router.push(`/report/${report.report_id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-left"
                >
                  <div>
                    <span className="font-medium">
                      {formatReportDate(report.report_date)}
                    </span>
                    <span className="text-gray-500 ml-2">
                      {MACHINE_LABELS[report.machine_no] ||
                        report.machine_no}
                    </span>
                    <span className="text-gray-400 ml-2 text-sm">
                      {report.filled_slots}/{report.total_slots}
                    </span>
                  </div>
                  <ReportStatusBadge status={report.status} />
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
