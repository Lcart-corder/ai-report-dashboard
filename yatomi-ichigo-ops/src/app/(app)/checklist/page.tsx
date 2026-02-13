"use client";

import { useEffect, useState, FormEvent } from "react";
import { WarningBadge } from "@/components/WarningBadge";

interface ChecklistRecord {
  id: string;
  date: string;
  tempDay: number;
  tempNight: number;
  humidity: number;
  condensation: boolean;
  ventilation: boolean;
  dehumidifier: boolean;
  cleaning: boolean;
  fridgeTemp: number | null;
  notes: string | null;
  createdByUser: { name: string };
}

export default function ChecklistPage() {
  const [records, setRecords] = useState<ChecklistRecord[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [form, setForm] = useState({
    tempDay: "",
    tempNight: "",
    humidity: "",
    condensation: false,
    ventilation: false,
    dehumidifier: false,
    cleaning: false,
    fridgeTemp: "",
    notes: "",
  });
  const [warnings, setWarnings] = useState<string[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/checklist").then((r) => r.json()).then(setRecords);
  }, []);

  useEffect(() => {
    fetch(`/api/checklist?date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setForm({
            tempDay: String(data.tempDay),
            tempNight: String(data.tempNight),
            humidity: String(data.humidity),
            condensation: data.condensation,
            ventilation: data.ventilation,
            dehumidifier: data.dehumidifier,
            cleaning: data.cleaning,
            fridgeTemp: data.fridgeTemp !== null ? String(data.fridgeTemp) : "",
            notes: data.notes ?? "",
          });
        } else {
          setForm({
            tempDay: "", tempNight: "", humidity: "", condensation: false,
            ventilation: false, dehumidifier: false, cleaning: false,
            fridgeTemp: "", notes: "",
          });
        }
      });
  }, [date]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setWarnings([]);

    const res = await fetch("/api/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        tempDay: parseFloat(form.tempDay),
        tempNight: parseFloat(form.tempNight),
        humidity: parseFloat(form.humidity),
        condensation: form.condensation,
        ventilation: form.ventilation,
        dehumidifier: form.dehumidifier,
        cleaning: form.cleaning,
        fridgeTemp: form.fridgeTemp ? parseFloat(form.fridgeTemp) : null,
        notes: form.notes || null,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      setMsg(result.error || "保存に失敗しました");
      return;
    }
    if (result.warnings?.length) setWarnings(result.warnings);
    setMsg("保存しました");
    fetch("/api/checklist").then((r) => r.json()).then(setRecords);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">日次チェックリスト</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-4 space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700">日付</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">昼間温度（℃）</label>
            <input type="number" step="0.1" required value={form.tempDay}
              onChange={(e) => setForm({ ...form, tempDay: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">夜間温度（℃）</label>
            <input type="number" step="0.1" required value={form.tempNight}
              onChange={(e) => setForm({ ...form, tempNight: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            湿度（%）
            {form.humidity && parseFloat(form.humidity) > 75 && (
              <WarningBadge message="75%超" />
            )}
          </label>
          <input type="number" step="0.1" min="0" max="100" required value={form.humidity}
            onChange={(e) => setForm({ ...form, humidity: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            冷蔵庫温度（℃）
            {form.fridgeTemp && (parseFloat(form.fridgeTemp) < 5 || parseFloat(form.fridgeTemp) > 8) && (
              <WarningBadge message="5〜8℃逸脱" />
            )}
          </label>
          <input type="number" step="0.1" value={form.fridgeTemp}
            onChange={(e) => setForm({ ...form, fridgeTemp: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>

        <div className="space-y-2">
          {[
            { key: "condensation" as const, label: "結露あり", warn: true },
            { key: "ventilation" as const, label: "換気・除湿稼働" },
            { key: "dehumidifier" as const, label: "除湿機稼働" },
            { key: "cleaning" as const, label: "清掃実施" },
          ].map(({ key, label, warn }) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                className="rounded"
              />
              {label}
              {warn && form[key] && <WarningBadge message="警告" />}
            </label>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">備考（異常・病害兆候等）</label>
          <textarea value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" rows={3} />
        </div>

        <button type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 text-sm font-medium">
          保存
        </button>

        {msg && <p className="text-sm text-green-700">{msg}</p>}
        {warnings.map((w, i) => (
          <p key={i} className="text-sm text-red-600">{w}</p>
        ))}
      </form>

      {/* 一覧 */}
      <h2 className="font-semibold text-gray-700">直近の記録</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border-b text-left">日付</th>
              <th className="px-3 py-2 border-b text-left">昼温</th>
              <th className="px-3 py-2 border-b text-left">夜温</th>
              <th className="px-3 py-2 border-b text-left">湿度</th>
              <th className="px-3 py-2 border-b text-left">結露</th>
              <th className="px-3 py-2 border-b text-left">冷蔵</th>
              <th className="px-3 py-2 border-b text-left">入力者</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setDate(r.date.split("T")[0])}>
                <td className="px-3 py-2 border-b">{r.date.split("T")[0]}</td>
                <td className="px-3 py-2 border-b">{r.tempDay}℃</td>
                <td className="px-3 py-2 border-b">{r.tempNight}℃</td>
                <td className="px-3 py-2 border-b">
                  {r.humidity}% {r.humidity > 75 && <WarningBadge message="高" />}
                </td>
                <td className="px-3 py-2 border-b">
                  {r.condensation ? "あり" : "なし"}
                  {r.condensation && <WarningBadge message="!" />}
                </td>
                <td className="px-3 py-2 border-b">
                  {r.fridgeTemp !== null ? `${r.fridgeTemp}℃` : "-"}
                  {r.fridgeTemp !== null && (r.fridgeTemp < 5 || r.fridgeTemp > 8) && (
                    <WarningBadge message="逸脱" />
                  )}
                </td>
                <td className="px-3 py-2 border-b">{r.createdByUser.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
