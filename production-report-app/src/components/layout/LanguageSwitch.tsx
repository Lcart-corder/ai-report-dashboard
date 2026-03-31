"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageSwitch() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-300">
      <button
        onClick={() => setLang("ja")}
        className={`px-3 py-1 text-sm font-medium transition-colors ${
          lang === "ja"
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        日本語
      </button>
      <button
        onClick={() => setLang("vi")}
        className={`px-3 py-1 text-sm font-medium transition-colors ${
          lang === "vi"
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        Tiếng Việt
      </button>
    </div>
  );
}
