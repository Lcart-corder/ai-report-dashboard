"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n";
import { Header } from "@/components/layout/Header";
import { Loading } from "@/components/common/Loading";
import { Toast } from "@/components/common/Toast";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  useProductionInput,
  useSaveProductionInput,
  useDeleteProductionInput,
} from "@/hooks/useProductionInput";
import { useStopCodes } from "@/hooks/useApproval";
import { useTimeSlots } from "@/hooks/useTimeSlots";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { ProductionInputForm, Verification, Judgment } from "@/lib/types";

export default function SlotInputPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const reportId = params.reportId as string;
  const slotId = params.slotId as string;

  const { data: existingInput, isLoading: inputLoading } =
    useProductionInput(slotId);
  const { data: stopCodes } = useStopCodes();
  const { data: slots } = useTimeSlots(reportId);
  const saveInput = useSaveProductionInput();
  const deleteInput = useDeleteProductionInput();

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentSlot = slots?.find((s) => s.slot_id === slotId);
  const nextUnfilled = slots?.find(
    (s) => s.status === "empty" && s.slot_id !== slotId
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductionInputForm>({
    defaultValues: {
      case_no_start: "",
      case_no_end: "",
      product_name: "",
      has_stop: false,
      stop_code: "",
      stop_time_minutes: "",
      abnormality: "",
      discharge_count: "",
      machine_discharge: "",
      verification: "○" as Verification,
      first_weight: "",
      judgment: "合" as Judgment,
    },
  });

  const hasStop = watch("has_stop");
  const verification = watch("verification");
  const judgment = watch("judgment");

  // Populate form when existing data loads
  useEffect(() => {
    if (existingInput) {
      reset({
        case_no_start: existingInput.case_no_start,
        case_no_end: existingInput.case_no_end,
        product_name: existingInput.product_name,
        has_stop: existingInput.has_stop,
        stop_code: existingInput.stop_code || "",
        stop_time_minutes: existingInput.stop_time_minutes || "",
        abnormality: existingInput.abnormality || "",
        discharge_count: existingInput.discharge_count,
        machine_discharge: existingInput.machine_discharge,
        verification: existingInput.verification,
        first_weight: existingInput.first_weight,
        judgment: existingInput.judgment,
      });
    }
  }, [existingInput, reset]);

  const onSubmit = async (data: ProductionInputForm) => {
    if (!user) return;

    try {
      const result = await saveInput.mutateAsync({
        slot_id: slotId,
        report_id: reportId,
        email: user.email,
        case_no_start: Number(data.case_no_start) || 0,
        case_no_end: Number(data.case_no_end) || 0,
        product_name: data.product_name,
        has_stop: data.has_stop,
        stop_code: data.has_stop ? data.stop_code : "",
        stop_time_minutes: data.has_stop
          ? Number(data.stop_time_minutes) || 0
          : 0,
        abnormality: data.has_stop ? data.abnormality : "",
        discharge_count: Number(data.discharge_count) || 0,
        machine_discharge: Number(data.machine_discharge) || 0,
        verification: data.verification,
        first_weight: Number(data.first_weight) || 0,
        judgment: data.judgment,
      });

      setToast({ message: t(lang, "success"), type: "success" });

      // Auto-navigate to next unfilled slot or summary
      setTimeout(() => {
        if (result.next_unfilled_slot) {
          router.push(
            `/report/${reportId}/slot/${result.next_unfilled_slot.slot_id}`
          );
        } else if (result.report_progress.is_complete) {
          router.push(`/report/${reportId}/summary`);
        } else {
          router.push(`/report/${reportId}`);
        }
      }, 500);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : t(lang, "error"),
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await deleteInput.mutateAsync({ slotId, reportId });
      router.push(`/report/${reportId}`);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : t(lang, "error"),
        type: "error",
      });
    }
  };

  if (inputLoading) return <Loading />;

  const ctaLabel = nextUnfilled
    ? t(lang, "input_save_next_with_time", { time: nextUnfilled.start_time })
    : t(lang, "input_save_complete");

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
      {showDeleteConfirm && (
        <ConfirmDialog
          message={t(lang, "input_delete_confirm")}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      <main className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => router.push(`/report/${reportId}`)}
          className="text-blue-600 text-sm mb-2 hover:underline"
        >
          {t(lang, "back")}
        </button>
        <h1 className="text-xl font-bold text-gray-800 mb-1">
          {t(lang, "input_title")}
        </h1>
        {currentSlot && (
          <p className="text-gray-500 mb-6">
            {currentSlot.start_time}〜{currentSlot.end_time}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Case No Start */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t(lang, "input_case_no_start")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              {...register("case_no_start", { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Case No End */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t(lang, "input_case_no_end")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              {...register("case_no_end", { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t(lang, "input_product_name")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("product_name", { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Has Stop Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t(lang, "input_has_stop")}
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setValue("has_stop", false)}
                className={`flex-1 py-3 rounded-xl font-bold text-lg border-2 transition-colors ${
                  !hasStop
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                {t(lang, "input_has_stop_no")}
              </button>
              <button
                type="button"
                onClick={() => setValue("has_stop", true)}
                className={`flex-1 py-3 rounded-xl font-bold text-lg border-2 transition-colors ${
                  hasStop
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                {t(lang, "input_has_stop_yes")}
              </button>
            </div>
          </div>

          {/* Stop Section (conditional) */}
          {hasStop && (
            <div className="bg-red-50 rounded-xl p-4 space-y-4 border border-red-200">
              {/* Stop Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t(lang, "input_stop_code")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("stop_code", {
                    required: hasStop,
                  })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {t(lang, "input_select_stop_code")}
                  </option>
                  {stopCodes?.map((sc) => (
                    <option key={sc.stop_code} value={sc.stop_code}>
                      {sc.stop_code} -{" "}
                      {lang === "vi" ? sc.name_vi : sc.name_ja}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stop Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t(lang, "input_stop_time")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  {...register("stop_time_minutes", {
                    required: hasStop,
                  })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Abnormality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t(lang, "input_abnormality")}
                </label>
                <textarea
                  {...register("abnormality")}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Discharge Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t(lang, "input_discharge_count")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              {...register("discharge_count", { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Machine Discharge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t(lang, "input_machine_discharge")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              {...register("machine_discharge", { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Verification ○/× */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t(lang, "input_verification")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setValue("verification", "○")}
                className={`flex-1 py-4 rounded-xl font-bold text-2xl border-2 transition-colors ${
                  verification === "○"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                ○
              </button>
              <button
                type="button"
                onClick={() => setValue("verification", "×")}
                className={`flex-1 py-4 rounded-xl font-bold text-2xl border-2 transition-colors ${
                  verification === "×"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                ×
              </button>
            </div>
          </div>

          {/* First Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t(lang, "input_first_weight")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              {...register("first_weight", { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Judgment 合/否 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t(lang, "input_judgment")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setValue("judgment", "合")}
                className={`flex-1 py-4 rounded-xl font-bold text-2xl border-2 transition-colors ${
                  judgment === "合"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                {t(lang, "input_judgment_pass")}
              </button>
              <button
                type="button"
                onClick={() => setValue("judgment", "否")}
                className={`flex-1 py-4 rounded-xl font-bold text-2xl border-2 transition-colors ${
                  judgment === "否"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                {t(lang, "input_judgment_fail")}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 pb-8 space-y-3">
            <button
              type="submit"
              disabled={saveInput.isPending}
              className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saveInput.isPending ? t(lang, "loading") : ctaLabel}
            </button>

            {existingInput && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-3 rounded-xl border-2 border-red-300 text-red-600 font-medium hover:bg-red-50 transition-colors"
              >
                {t(lang, "delete")}
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
