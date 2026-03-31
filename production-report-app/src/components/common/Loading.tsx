"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n";

export function Loading() {
  const { lang } = useLanguage();
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">{t(lang, "loading")}</p>
      </div>
    </div>
  );
}
