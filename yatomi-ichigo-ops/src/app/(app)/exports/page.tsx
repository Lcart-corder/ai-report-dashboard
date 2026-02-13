"use client";

import { useState } from "react";

export default function ExportsPage() {
  const now = new Date();
  const [yearMonth, setYearMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );

  function download(type: string) {
    window.open(`/api/exports/${type}?yearMonth=${yearMonth}`, "_blank");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">帳票出力（CSV）</h1>

      <div className="bg-white rounded-lg border p-4 space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700">対象年月</label>
          <input
            type="month"
            value={yearMonth}
            onChange={(e) => setYearMonth(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <button
            onClick={() => download("kpi")}
            className="block w-full bg-green-700 text-white px-4 py-3 rounded hover:bg-green-800 text-sm font-medium text-left"
          >
            月次KPI集計（廃棄率・出荷数・クレーム・作業時間・逸脱回数）
          </button>
          <button
            onClick={() => download("shipments")}
            className="block w-full bg-green-700 text-white px-4 py-3 rounded hover:bg-green-800 text-sm font-medium text-left"
          >
            納品実績一覧（ロット・パック数・検収結果）
          </button>
          <button
            onClick={() => download("complaints")}
            className="block w-full bg-green-700 text-white px-4 py-3 rounded hover:bg-green-800 text-sm font-medium text-left"
          >
            クレーム一覧（発生日・内容・対応・再発防止）
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        CSVファイルはBOM付きUTF-8で出力されます。Excelで直接開けます。
      </p>
    </div>
  );
}
