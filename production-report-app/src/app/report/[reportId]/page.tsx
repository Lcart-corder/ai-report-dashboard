"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n";
import { formatReportDate, MACHINE_LABELS } from "@/lib/constants";
import { Header } from "@/components/layout/Header";
import { Loading } from "@/components/common/Loading";
import { SlotStatusBadge } from "@/components/common/StatusBadge";
import { useReport } from "@/hooks/useReport";
import { useTimeSlots } from "@/hooks/useTimeSlots";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function TimeSlotListPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const reportId = params.reportId as string;

  const { data: report, isLoading: reportLoading } = useReport(reportId);
  const { data: slots, isLoading: slotsLoading } = useTimeSlots(reportId);

  const nextUnfilledRef = useRef<HTMLDivElement>(null);

  const firstUnfilledSlot = slots?.find((s) => s.status === "empty");

  useEffect(() => {
    if (nextUnfilledRef.current) {
      nextUnfilledRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [slots]);

  if (reportLoading || slotsLoading) return <Loading />;
  if (!report || !slots) return null;

  const isComplete = report.filled_slots >= report.total_slots;
  const machineLabel =
    MACHINE_LABELS[report.machine_no] || report.machine_no;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Report Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              onClick={() => router.push("/")}
              className="text-blue-600 text-sm mb-1 hover:underline"
            >
              {t(lang, "back")}
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {t(lang, "slot_list_title")}
            </h1>
            <p className="text-gray-500">
              {formatReportDate(report.report_date)} - {machineLabel}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {report.filled_slots}/{report.total_slots}
            </p>
            <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-600 rounded-full h-2 transition-all"
                style={{
                  width: `${(report.filled_slots / report.total_slots) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Slot List */}
        <div className="space-y-2">
          {slots.map((slot) => {
            const isNextUnfilled =
              firstUnfilledSlot?.slot_id === slot.slot_id;
            return (
              <div
                key={slot.slot_id}
                ref={isNextUnfilled ? nextUnfilledRef : undefined}
                className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  isNextUnfilled
                    ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200"
                    : slot.status === "empty"
                      ? "border-gray-200 bg-white"
                      : slot.status === "filled"
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Status dot */}
                  <div
                    className={`w-4 h-4 rounded-full ${
                      slot.status === "filled"
                        ? "bg-green-500"
                        : slot.status === "has_stop"
                          ? "bg-red-500"
                          : "bg-gray-300"
                    }`}
                  />
                  <div>
                    <span className="font-medium text-lg">
                      {slot.start_time}〜{slot.end_time}
                    </span>
                    {isNextUnfilled && (
                      <span className="ml-2 text-blue-600 text-sm font-medium">
                        {t(lang, "slot_next_input")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SlotStatusBadge status={slot.status} />
                  <button
                    onClick={() =>
                      router.push(
                        `/report/${reportId}/slot/${slot.slot_id}`
                      )
                    }
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                      isNextUnfilled
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : slot.status === "empty"
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {t(lang, "slot_input_button")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fixed CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            {isComplete ? (
              <button
                onClick={() =>
                  router.push(`/report/${reportId}/summary`)
                }
                className="w-full py-4 rounded-xl bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition-colors"
              >
                {t(lang, "home_view_summary")}
              </button>
            ) : firstUnfilledSlot ? (
              <button
                onClick={() =>
                  router.push(
                    `/report/${reportId}/slot/${firstUnfilledSlot.slot_id}`
                  )
                }
                className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors"
              >
                {t(lang, "slot_go_to_next")} ({firstUnfilledSlot.start_time}
                〜)
              </button>
            ) : null}
          </div>
        </div>

        {/* Bottom spacer for fixed CTA */}
        <div className="h-24" />
      </main>
    </div>
  );
}
