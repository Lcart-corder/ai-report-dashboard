"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n";

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { lang } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <p className="text-lg mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
          >
            {t(lang, "cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
          >
            {t(lang, "confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
