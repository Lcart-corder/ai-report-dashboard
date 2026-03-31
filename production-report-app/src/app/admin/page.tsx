"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n";
import { Header } from "@/components/layout/Header";
import { Loading } from "@/components/common/Loading";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User, StopCode } from "@/lib/types";
import { useState } from "react";

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "stopcodes">("users");

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: () => api.getUsers(),
    enabled: user?.role === "admin",
  });

  const { data: stopCodes, isLoading: stopCodesLoading } = useQuery<StopCode[]>({
    queryKey: ["admin-stopcodes"],
    queryFn: () => api.getStopCodes(),
    enabled: user?.role === "admin",
  });

  if (authLoading) return <Loading />;

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-red-600 text-lg">
            {lang === "ja"
              ? "管理者権限が必要です"
              : "Cần quyền quản trị viên"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            {t(lang, "back")}
          </button>
        </main>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    staff: "現場スタッフ",
    kakarichou: "係長",
    hinshitsu: "品証課",
    buchou: "部長",
    admin: "管理者",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <button
          onClick={() => router.push("/")}
          className="text-blue-600 text-sm mb-2 hover:underline"
        >
          ← {lang === "ja" ? "ホーム" : "Trang chủ"}
        </button>

        <h1 className="text-xl font-bold text-gray-800 mb-6">
          {lang === "ja" ? "管理画面" : "Quản trị"}
        </h1>

        {/* タブ */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
              activeTab === "users"
                ? "bg-white border border-b-white border-gray-200 text-blue-600 -mb-px"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {lang === "ja" ? "ユーザー管理" : "Quản lý người dùng"}
          </button>
          <button
            onClick={() => setActiveTab("stopcodes")}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
              activeTab === "stopcodes"
                ? "bg-white border border-b-white border-gray-200 text-blue-600 -mb-px"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {lang === "ja" ? "停止コード管理" : "Quản lý mã dừng"}
          </button>
        </div>

        {/* ユーザー管理タブ */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {usersLoading ? (
              <Loading />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left">
                      {lang === "ja" ? "メール" : "Email"}
                    </th>
                    <th className="px-4 py-3 text-left">
                      {lang === "ja" ? "名前" : "Tên"}
                    </th>
                    <th className="px-4 py-3 text-left">
                      {lang === "ja" ? "権限" : "Quyền"}
                    </th>
                    <th className="px-4 py-3 text-center">
                      {lang === "ja" ? "号機" : "Máy"}
                    </th>
                    <th className="px-4 py-3 text-center">
                      {lang === "ja" ? "有効" : "Hoạt động"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((u) => (
                    <tr key={u.email} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">
                        {u.email}
                      </td>
                      <td className="px-4 py-3">
                        {lang === "vi" && u.name_vi ? u.name_vi : u.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                          {roleLabels[u.role] || u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {u.machine_no || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {String(u.is_active).toUpperCase() === "TRUE" ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-500">✗</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="p-4 border-t bg-gray-50 text-sm text-gray-500">
              {lang === "ja"
                ? "ユーザーの追加・編集はSpreadsheetのUsersシートで直接行ってください"
                : "Thêm/sửa người dùng trực tiếp trên sheet Users trong Spreadsheet"}
            </div>
          </div>
        )}

        {/* 停止コード管理タブ */}
        {activeTab === "stopcodes" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {stopCodesLoading ? (
              <Loading />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left">
                      {lang === "ja" ? "コード" : "Mã"}
                    </th>
                    <th className="px-4 py-3 text-left">
                      {lang === "ja" ? "名称（日本語）" : "Tên (JP)"}
                    </th>
                    <th className="px-4 py-3 text-left">
                      {lang === "ja" ? "名称（ベトナム語）" : "Tên (VN)"}
                    </th>
                    <th className="px-4 py-3 text-left">
                      {lang === "ja" ? "分類" : "Phân loại"}
                    </th>
                    <th className="px-4 py-3 text-center">
                      {lang === "ja" ? "有効" : "Hoạt động"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stopCodes?.map((sc) => (
                    <tr key={sc.stop_code} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">{sc.stop_code}</td>
                      <td className="px-4 py-3">{sc.name_ja}</td>
                      <td className="px-4 py-3">{sc.name_vi}</td>
                      <td className="px-4 py-3">{sc.category}</td>
                      <td className="px-4 py-3 text-center">
                        {String(sc.is_active).toUpperCase() === "TRUE" ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-500">✗</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="p-4 border-t bg-gray-50 text-sm text-gray-500">
              {lang === "ja"
                ? "停止コードの追加・編集はSpreadsheetのStopCodesシートで直接行ってください"
                : "Thêm/sửa mã dừng trực tiếp trên sheet StopCodes trong Spreadsheet"}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
