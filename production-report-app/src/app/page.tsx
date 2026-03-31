"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMachine } from "@/contexts/MachineContext";
import { t } from "@/i18n";
import {
  buildReportId,
  formatReportDate,
  getReportDate,
  getMachineLabel,
} from "@/lib/constants";
import { Header } from "@/components/layout/Header";
import { Loading } from "@/components/common/Loading";
import { ReportStatusBadge } from "@/components/common/StatusBadge";
import { useReportsByDate, useMyReports, useCreateReport } from "@/hooks/useReport";
import { usePendingApprovals } from "@/hooks/useApproval";
import { useTimeSlots } from "@/hooks/useTimeSlots";
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
  // 時間帯データ取得（次の未入力を特定するため）
  const todayReport = todayReports?.find((r) => r.report_id === reportId);
  const { data: timeSlots } = useTimeSlots(todayReport ? reportId : "");

  const createReport = useCreateReport();
  const [creating, setCreating] = useState(false);

  if (authLoading || reportsLoading) return <Loading />;
  if (!user) return null;

  // 次の未入力時間帯を特定
  const nextEmptySlot = timeSlots?.find((s) => s.status === "empty");

  const handleCreateOrContinue = async () => {
    if (todayReport) {
      if (nextEmptySlot) {
        // 次の未入力時間帯の入力画面へ直行
        router.push(`/report/${todayReport.report_id}/slot/${nextEmptySlot.slot_id}`);
      } else {
        // 全入力済み → サマリーへ
        router.push(`/report/${todayReport.report_id}/summary`);
      }
      return;
    }

    // 日報作成
    setCreating(true);
    try {
      const result = await createReport.mutateAsync({
        reportDate: today,
        machineNo,
        createdBy: user.email,
      });
      // 作成後、最初の時間帯（7:00）の入力画面へ
      if (result.time_slots && result.time_slots.length > 0) {
        router.push(`/report/${result.report_id}/slot/${result.time_slots[0].slot_id}`);
      } else {
        router.push(`/report/${result.report_id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  const progress = todayReport
    ? Math.round((todayReport.filled_slots / todayReport.total_slots) * 100)
    : 0;

  const isComplete =
    todayReport && todayReport.filled_slots >= todayReport.total_slots;

  // メインCTAのテキスト
  const ctaText = !todayReport
    ? t(lang, "home_create_report")
    : isComplete
      ? t(lang, "home_view_summary")
      : t(lang, "home_continue_input");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 今日の日報カード */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {t(lang, "home_today_report")}
              </h2>
              <p className="text-gray-500">
                {formatReportDate(today)} - {getMachineLabel(machineNo, lang)}
              </p>
            </div>
            {todayReport && <ReportStatusBadge status={todayReport.status} />}
          </div>

          {todayReport ? (
            <>
              {/* 進捗バー */}
              <div className="mb-2">
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

              {todayReport.has_stop && (
                <p className="text-red-500 text-sm mb-3">
                  {lang === "ja" ? "停止あり" : "Có dừng máy"}
                </p>
              )}

              <button
                onClick={handleCreateOrContinue}
                className="w-full py-4 rounded-xl text-white font-bold text-lg bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <span className="block">{ctaText}</span>
                {nextEmptySlot && !isComplete && (
                  <span className="block text-sm font-normal opacity-80">
                    {lang === "ja" ? "次" : "Tiếp"}: {nextEmptySlot.start_time}〜{nextEmptySlot.end_time}
                  </span>
                )}
              </button>

              {/* 時間帯一覧リンク */}
              <button
                onClick={() => router.push(`/report/${todayReport.report_id}`)}
                className="w-full mt-2 py-2 text-blue-600 text-sm hover:underline"
              >
                {t(lang, "slot_list_title")}
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

        {/* 承認待ち一覧 (承認者向け) */}
        {user.isApprover && pendingApprovals && pendingApprovals.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {t(lang, "home_pending_approvals")}
              <span className="ml-2 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-sm">
                {pendingApprovals.length}
              </span>
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
                      {getMachineLabel(item.report.machine_no, lang)}
                    </span>
                    <span className="text-gray-500 ml-2">
                      {formatReportDate(item.report.report_date)}
                    </span>
                    <span className="text-gray-400 ml-2 text-sm">
                      {item.report.filled_slots}/{item.report.total_slots}
                    </span>
                  </div>
                  <ReportStatusBadge status={item.report.status} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 過去の日報 */}
        {myReports && myReports.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {t(lang, "home_past_reports")}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {myReports.slice(0, 9).map((report) => (
                <button
                  key={report.report_id}
                  onClick={() => router.push(`/report/${report.report_id}`)}
                  className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-center"
                >
                  <div className="font-medium text-sm">
                    {formatReportDate(report.report_date)}
                  </div>
                  <div className="mt-1">
                    <ReportStatusBadge status={report.status} />
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {report.filled_slots}/{report.total_slots}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
