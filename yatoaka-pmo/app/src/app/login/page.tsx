"use client";

import { signIn } from "next-auth/react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { IconSparkles } from "@/components/icons";

function LoginInner() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";
  const error = params.get("error");

  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
          <IconSparkles width={24} height={24} />
        </div>
        <h1 className="mt-4 text-lg font-bold text-slate-800">やとアカ運営 AI-PMOシステム</h1>
        <p className="mt-1 text-sm text-slate-500">内部利用者向け・社内ログイン</p>
      </div>

      {error && (
        <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error === "AccessDenied"
            ? "このアカウントはログインを許可されていません。管理者にお問い合わせください。"
            : "ログインに失敗しました。もう一度お試しください。"}
        </div>
      )}

      <button
        onClick={() => signIn("google", { callbackUrl })}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <GoogleMark />
        Google アカウントでログイン
      </button>

      <p className="mt-6 text-center text-xs text-slate-400">
        ログインできるのは、やとアカ理事・事務局・部会長・部会メンバー、及び許可された行政担当者のみです。
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Suspense fallback={<div className="text-sm text-slate-400">読み込み中...</div>}>
        <LoginInner />
      </Suspense>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width={18} height={18} viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16.8z" />
      <path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C1 16.3 0 20 0 24s1 7.7 2.6 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.5l-7.1-5.5c-2 1.3-4.5 2.1-8.2 2.1-6.4 0-11.8-3.7-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}
