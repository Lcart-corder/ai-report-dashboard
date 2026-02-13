"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSession } from "next-auth/react";

interface ProductionRecord {
  id: string;
  date: string;
  harvestCount: number | null;
  gradeA: number;
  gradeB: number;
  waste: number;
  packCountA: number;
  packCountB: number;
  outOfSpecCount: number;
  outOfSpecReason: string | null;
  workMinutes: number;
  lotPrefix: string;
  approvedBy: string | null;
  approvedByUser: { name: string } | null;
  lots: { id: string; lotNumber: string }[];
}

export default function ProductionPage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [form, setForm] = useState({
    harvestCount: "",
    gradeA: "",
    gradeB: "",
    waste: "",
    packCountA: "",
    packCountB: "",
    outOfSpecCount: "0",
    outOfSpecReason: "",
    workMinutes: "",
  });
  const [existingId, setExistingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  function loadRecords() {
    fetch("/api/production").then((r) => r.json()).then(setRecords);
  }

  useEffect(() => { loadRecords(); }, []);

  useEffect(() => {
    fetch(`/api/production?date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setExistingId(data.id);
          setForm({
            harvestCount: data.harvestCount !== null ? String(data.harvestCount) : "",
            gradeA: String(data.gradeA),
            gradeB: String(data.gradeB),
            waste: String(data.waste),
            packCountA: String(data.packCountA),
            packCountB: String(data.packCountB),
            outOfSpecCount: String(data.outOfSpecCount),
            outOfSpecReason: data.outOfSpecReason ?? "",
            workMinutes: String(data.workMinutes),
          });
        } else {
          setExistingId(null);
          setForm({
            harvestCount: "", gradeA: "", gradeB: "", waste: "",
            packCountA: "", packCountB: "", outOfSpecCount: "0",
            outOfSpecReason: "", workMinutes: "",
          });
        }
      });
  }, [date]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/production", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        harvestCount: form.harvestCount ? parseInt(form.harvestCount) : null,
        gradeA: parseInt(form.gradeA),
        gradeB: parseInt(form.gradeB),
        waste: parseInt(form.waste),
        packCountA: parseInt(form.packCountA),
        packCountB: parseInt(form.packCountB),
        outOfSpecCount: parseInt(form.outOfSpecCount),
        outOfSpecReason: form.outOfSpecReason || null,
        workMinutes: parseInt(form.workMinutes),
      }),
    });
    const result = await res.json();
    if (!res.ok) { setMsg(result.error); return; }
    setMsg("保存しました");
    setExistingId(result.id);
    loadRecords();
  }

  async function handleApprove() {
    if (!existingId) return;
    const res = await fetch("/api/production/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productionDayId: existingId }),
    });
    if (res.ok) {
      setMsg("承認しました");
      loadRecords();
    } else {
      const err = await res.json();
      setMsg(err.error);
    }
  }

  async function handleAddLot() {
    if (!existingId) return;
    await fetch(`/api/production/${existingId}/lots`, { method: "POST" });
    loadRecords();
    // reload current
    fetch(`/api/production?date=${date}`).then((r) => r.json()).then((data) => {
      if (data) setExistingId(data.id);
    });
  }

  const wasteRate =
    form.gradeA && form.gradeB && form.waste
      ? (
          (parseInt(form.waste) /
            (parseInt(form.gradeA) + parseInt(form.gradeB) + parseInt(form.waste))) *
          100
        ).toFixed(1)
      : null;

  const canApprove = ["ADMIN", "WELFARE_MANAGER"].includes(session?.user?.role ?? "");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">生産記録</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-4 space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700">日付</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">収穫数（任意）</label>
          <input type="number" min="0" value={form.harvestCount}
            onChange={(e) => setForm({ ...form, harvestCount: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">等級A（個）</label>
            <input type="number" min="0" required value={form.gradeA}
              onChange={(e) => setForm({ ...form, gradeA: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">等級B（個）</label>
            <input type="number" min="0" required value={form.gradeB}
              onChange={(e) => setForm({ ...form, gradeB: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">廃棄（個）</label>
            <input type="number" min="0" required value={form.waste}
              onChange={(e) => setForm({ ...form, waste: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
        </div>
        {wasteRate !== null && (
          <p className={`text-sm ${parseFloat(wasteRate) > 5 ? "text-red-600 font-semibold" : "text-gray-500"}`}>
            廃棄率: {wasteRate}% {parseFloat(wasteRate) > 5 && "（目標5%超過）"}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">パック数A</label>
            <input type="number" min="0" required value={form.packCountA}
              onChange={(e) => setForm({ ...form, packCountA: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">パック数B</label>
            <input type="number" min="0" required value={form.packCountB}
              onChange={(e) => setForm({ ...form, packCountB: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            規格外パック数（250g±5g範囲外）
          </label>
          <input type="number" min="0" value={form.outOfSpecCount}
            onChange={(e) => setForm({ ...form, outOfSpecCount: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
        {parseInt(form.outOfSpecCount) > 0 && (
          <div>
            <label className="block text-sm font-medium text-red-600">
              規格外の理由（必須）
            </label>
            <textarea required value={form.outOfSpecReason}
              onChange={(e) => setForm({ ...form, outOfSpecReason: e.target.value })}
              className="mt-1 block w-full border border-red-300 rounded px-3 py-2 text-sm" rows={2} />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">作業時間（分）</label>
          <input type="number" min="0" required value={form.workMinutes}
            onChange={(e) => setForm({ ...form, workMinutes: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>

        <div className="flex gap-2">
          <button type="submit"
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 text-sm font-medium">
            保存
          </button>
          {existingId && canApprove && (
            <button type="button" onClick={handleApprove}
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm font-medium">
              最終検品承認
            </button>
          )}
          {existingId && (
            <button type="button" onClick={handleAddLot}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium">
              ロット追加
            </button>
          )}
        </div>
        {msg && <p className="text-sm text-green-700">{msg}</p>}
      </form>

      {/* 一覧 */}
      <h2 className="font-semibold text-gray-700">直近の記録</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border-b text-left">日付</th>
              <th className="px-3 py-2 border-b text-left">A</th>
              <th className="px-3 py-2 border-b text-left">B</th>
              <th className="px-3 py-2 border-b text-left">廃棄</th>
              <th className="px-3 py-2 border-b text-left">パックA</th>
              <th className="px-3 py-2 border-b text-left">パックB</th>
              <th className="px-3 py-2 border-b text-left">ロット</th>
              <th className="px-3 py-2 border-b text-left">承認</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setDate(r.date.split("T")[0])}>
                <td className="px-3 py-2 border-b">{r.date.split("T")[0]}</td>
                <td className="px-3 py-2 border-b">{r.gradeA}</td>
                <td className="px-3 py-2 border-b">{r.gradeB}</td>
                <td className="px-3 py-2 border-b">{r.waste}</td>
                <td className="px-3 py-2 border-b">{r.packCountA}</td>
                <td className="px-3 py-2 border-b">{r.packCountB}</td>
                <td className="px-3 py-2 border-b">
                  {r.lots.map((l) => l.lotNumber).join(", ") || "-"}
                </td>
                <td className="px-3 py-2 border-b">
                  {r.approvedByUser ? `${r.approvedByUser.name}` : "未承認"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
