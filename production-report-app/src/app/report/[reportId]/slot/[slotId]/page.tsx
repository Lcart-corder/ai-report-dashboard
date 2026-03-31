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
import { useReport } from "@/hooks/useReport";
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
  const { data: report } = useReport(reportId);
  const saveInput = useSaveProductionInput();
  const deleteInput = useDeleteProductionInput();

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentSlot = slots?.find((s) => s.slot_id === slotId);
  // 現在のスロットのインデックス
  const currentIndex = slots?.findIndex((s) => s.slot_id === slotId) ?? -1;
  const filledCount = report?.filled_slots ?? 0;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
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

  // 既存データの読み込み
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
        input_by: user.email,
        case_no_start: Number(data.case_no_start) || 0,
        case_no_end: Number(data.case_no_end) || 0,
        product_name: data.product_name,
        has_stop: data.has_stop,
        stop_code: data.has_stop ? data.stop_code : "",
        stop_time_minutes: data.has_stop ? Number(data.stop_time_minutes) || 0 : 0,
        abnormality: data.has_stop ? data.abnormality : "",
        discharge_count: Number(data.discharge_count) || 0,
        machine_discharge: Number(data.machine_discharge) || 0,
        verification: data.verification,
        first_weight: Number(data.first_weight) || 0,
        judgment: data.judgment,
      });

      setToast({ message: t(lang, "success"), type: "success" });

      // ノンストップ入力: 自動遷移
      setTimeout(() => {
        if (result.next_empty_slot) {
          router.push(`/report/${reportId}/slot/${result.next_empty_slot.slot_id}`);
        } else if (result.report_progress.all_filled) {
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

  // 「保存のみ」ボタン
  const onSaveOnly = async (data: ProductionInputForm) => {
    if (!user) return;
    try {
      await saveInput.mutateAsync({
        slot_id: slotId,
        report_id: reportId,
        input_by: user.email,
        case_no_start: Number(data.case_no_start) || 0,
        case_no_end: Number(data.case_no_end) || 0,
        product_name: data.product_name,
        has_stop: data.has_stop,
        stop_code: data.has_stop ? data.stop_code : "",
        stop_time_minutes: data.has_stop ? Number(data.stop_time_minutes) || 0 : 0,
        abnormality: data.has_stop ? data.abnormality : "",
        discharge_count: Number(data.discharge_count) || 0,
        machine_discharge: Number(data.machine_discharge) || 0,
        verification: data.verification,
        first_weight: Number(data.first_weight) || 0,
        judgment: data.judgment,
      });
      setToast({ message: t(lang, "success"), type: "success" });
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

  // 次の未入力スロットを計算（CTA表示用）
  const nextEmptySlot = slots?.find(
    (s) => s.status === "empty" && s.slot_id !== slotId
  );
  const ctaLabel = nextEmptySlot
    ? t(lang, "input_save_next_with_time", { time: nextEmptySlot.start_time })
    : t(lang, "input_save_complete");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      {showDeleteConfirm && (
        <ConfirmDialog
          message={t(lang, "input_delete_confirm")}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              onClick={() => router.push(`/report/${reportId}`)}
              className="text-blue-600 text-sm hover:underline"
            >
              ← {t(lang, "slot_list_title")}
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {currentSlot?.start_time}〜{currentSlot?.end_time}
            </h1>
          </div>
          <span className="text-gray-500 font-medium">
            [{currentIndex + 1}/24]
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* ケースNo */}
          <fieldset className="bg-white rounded-xl border border-gray-200 p-4">
            <legend className="text-sm font-medium text-gray-700 px-1">
              {t(lang, "input_case_no_start")} / {t(lang, "input_case_no_end")}
            </legend>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder={t(lang, "input_case_no_start")}
                {...register("case_no_start", { required: true })}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-400 text-xl">〜</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder={t(lang, "input_case_no_end")}
                {...register("case_no_end", { required: true })}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </fieldset>

          {/* 品名票 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t(lang, "input_product_name")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("product_name", { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 停止有無トグル */}
          <fieldset className="bg-white rounded-xl border border-gray-200 p-4">
            <legend className="text-sm font-medium text-gray-700 px-1">
              {lang === "ja"
                ? "この時間帯に停止はありましたか？"
                : "Trong khung giờ này có dừng máy không?"}
            </legend>
            <div className="flex gap-3 mt-2">
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
          </fieldset>

          {/* 停止セクション（条件表示） */}
          {hasStop && (
            <div className="bg-red-50 rounded-xl p-4 space-y-4 border border-red-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t(lang, "input_stop_code")} <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("stop_code", { required: hasStop })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t(lang, "input_select_stop_code")}</option>
                  {stopCodes?.map((sc) => (
                    <option key={sc.stop_code} value={sc.stop_code}>
                      {sc.stop_code} - {lang === "vi" ? sc.name_vi : sc.name_ja}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t(lang, "input_stop_time")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  {...register("stop_time_minutes", { required: hasStop })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
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

          {/* 生産結果セクション */}
          <fieldset className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <legend className="text-sm font-medium text-gray-700 px-1">
              {lang === "ja" ? "生産結果" : "Kết quả sản xuất"}
            </legend>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t(lang, "input_discharge_count")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  {...register("discharge_count", { required: true })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t(lang, "input_machine_discharge")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  {...register("machine_discharge", { required: true })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 照合 ○/× */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  {t(lang, "input_verification")} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
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

              {/* 判定 合/否 */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  {t(lang, "input_judgment")} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
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
            </div>

            {/* 1ST重量 */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t(lang, "input_first_weight")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                {...register("first_weight", { required: true })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </fieldset>

          {/* アクションボタン */}
          <div className="pt-2 pb-8 space-y-3">
            {/* メインCTA: 保存して次へ */}
            <button
              type="submit"
              disabled={saveInput.isPending}
              className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saveInput.isPending ? t(lang, "loading") : `▶ ${ctaLabel}`}
            </button>

            <div className="flex gap-3">
              {/* 保存のみ */}
              <button
                type="button"
                onClick={handleSubmit(onSaveOnly)}
                disabled={saveInput.isPending}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                {t(lang, "save")}
              </button>
              {/* キャンセル */}
              <button
                type="button"
                onClick={() => router.push(`/report/${reportId}`)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-500 font-medium hover:bg-gray-50"
              >
                {t(lang, "cancel")}
              </button>
              {/* 削除 */}
              {existingInput && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="py-3 px-4 rounded-xl border border-red-300 text-red-600 font-medium hover:bg-red-50"
                >
                  {t(lang, "delete")}
                </button>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
