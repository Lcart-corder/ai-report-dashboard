"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n";
import { LanguageSwitch } from "./LanguageSwitch";
import { MachineSelector } from "./MachineSelector";
import { signOut } from "next-auth/react";
import Link from "next/link";

export function Header() {
  const { user } = useAuth();
  const { lang } = useLanguage();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600 no-underline">
          {t(lang, "app_title")}
        </Link>

        <div className="flex items-center gap-3">
          <MachineSelector />
          <LanguageSwitch />

          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {lang === "vi" ? user.nameVi || user.name : user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-300"
              >
                {t(lang, "logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
