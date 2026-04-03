"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Artwork } from "@/lib/types";
import { fetchArtworks } from "@/lib/api";

/** ステータス別バッジスタイル */
const STATUS_STYLES: Record<Artwork["status"], string> = {
  vr_ready: "bg-green-100 text-green-700",
  analyzing: "bg-yellow-100 text-yellow-700",
  pending: "bg-gray-100 text-gray-500",
  error: "bg-red-100 text-red-600",
};

const STATUS_LABELS: Record<Artwork["status"], string> = {
  vr_ready: "VR対応",
  analyzing: "解析中",
  pending: "待機中",
  error: "エラー",
};

export default function AdminPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchArtworks();
      setArtworks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "データ取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-800">管理ページ</h1>
          <p className="mt-1 text-sm text-gray-500">
            アートワークの一覧と状態管理
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-cyan-700 disabled:opacity-50"
        >
          {loading ? "読込中…" : "更新"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* サマリー */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard
          label="合計"
          count={artworks.length}
          color="bg-gray-100 text-gray-700"
        />
        <SummaryCard
          label="VR対応"
          count={artworks.filter((a) => a.status === "vr_ready").length}
          color="bg-green-100 text-green-700"
        />
        <SummaryCard
          label="解析中"
          count={artworks.filter((a) => a.status === "analyzing").length}
          color="bg-yellow-100 text-yellow-700"
        />
        <SummaryCard
          label="待機中"
          count={artworks.filter((a) => a.status === "pending").length}
          color="bg-gray-100 text-gray-500"
        />
      </div>

      {/* テーブル */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">名前</th>
                <th className="px-4 py-3">タイトル</th>
                <th className="px-4 py-3">ステータス</th>
                <th className="px-4 py-3">信頼度</th>
                <th className="px-4 py-3">カラー</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && artworks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    読み込み中…
                  </td>
                </tr>
              ) : artworks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    データがありません
                  </td>
                </tr>
              ) : (
                artworks.map((artwork) => (
                  <tr
                    key={artwork.artwork_id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-400">
                      {artwork.artwork_id}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {artwork.child_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {artwork.title}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[artwork.status] ?? "bg-gray-100 text-gray-500"}`}
                      >
                        {STATUS_LABELS[artwork.status] ?? artwork.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {(parseFloat(artwork.confidence) * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {artwork.primary_colors
                          ?.split(",")
                          .map((c, i) => (
                            <span
                              key={i}
                              className="inline-block h-4 w-4 rounded-full border border-gray-200"
                              style={{ backgroundColor: c.trim() }}
                            />
                          ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {artwork.status === "vr_ready" ? (
                        <Link
                          href={`/vr/${artwork.artwork_id}`}
                          className="text-xs font-semibold text-cyan-600 hover:underline"
                        >
                          VRで見る
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/** サマリーカード */
function SummaryCard({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className={`rounded-xl p-4 text-center ${color}`}>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-xs font-medium opacity-70">{label}</div>
    </div>
  );
}
