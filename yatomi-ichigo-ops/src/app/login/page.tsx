"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: fd.get("email") as string,
      password: fd.get("password") as string,
      redirect: false,
    });
    if (res?.error) {
      setError("メールアドレスまたはパスワードが正しくありません");
    } else {
      router.push(searchParams.get("callbackUrl") ?? "/dashboard");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-bold text-center text-green-800">
          やとみいちご運営管理
        </h1>
        <p className="text-sm text-center text-gray-500">ログイン</p>
        {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">パスワード</label>
          <input
            name="password"
            type="password"
            required
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 text-sm font-medium"
        >
          ログイン
        </button>
      </form>
    </div>
  );
}
