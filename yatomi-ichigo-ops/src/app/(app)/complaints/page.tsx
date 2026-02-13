"use client";

import { useEffect, useState, FormEvent } from "react";

interface Complaint {
  id: string;
  date: string;
  type: string;
  detail: string;
  action: string;
  prevention: string;
  lot: { lotNumber: string } | null;
}

interface Lot {
  id: string;
  lotNumber: string;
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    lotId: "",
    type: "",
    detail: "",
    action: "",
    prevention: "",
  });
  const [msg, setMsg] = useState("");

  function load() {
    fetch("/api/complaints").then((r) => r.json()).then(setComplaints);
    fetch("/api/lots").then((r) => r.ok ? r.json() : []).then(setLots).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMsg("クレームを登録しました");
      setForm({ date: new Date().toISOString().split("T")[0], lotId: "", type: "", detail: "", action: "", prevention: "" });
      load();
    } else {
      setMsg("登録に失敗しました");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">クレーム管理</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-4 space-y-4 max-w-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">発生日</label>
            <input type="date" required value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">関連ロット（任意）</label>
            <select value={form.lotId}
              onChange={(e) => setForm({ ...form, lotId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">なし</option>
              {lots.map((l) => <option key={l.id} value={l.id}>{l.lotNumber}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">種別</label>
          <input type="text" required placeholder="品質・配送・その他" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">内容</label>
          <textarea required value={form.detail}
            onChange={(e) => setForm({ ...form, detail: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">対応</label>
          <textarea required value={form.action}
            onChange={(e) => setForm({ ...form, action: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">再発防止</label>
          <textarea required value={form.prevention}
            onChange={(e) => setForm({ ...form, prevention: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" rows={2} />
        </div>
        <button type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 text-sm font-medium">
          登録
        </button>
        {msg && <p className="text-sm text-green-700">{msg}</p>}
      </form>

      <h2 className="font-semibold text-gray-700">クレーム一覧</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border-b text-left">発生日</th>
              <th className="px-3 py-2 border-b text-left">種別</th>
              <th className="px-3 py-2 border-b text-left">ロット</th>
              <th className="px-3 py-2 border-b text-left">内容</th>
              <th className="px-3 py-2 border-b text-left">対応</th>
              <th className="px-3 py-2 border-b text-left">再発防止</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 border-b">{c.date.split("T")[0]}</td>
                <td className="px-3 py-2 border-b">{c.type}</td>
                <td className="px-3 py-2 border-b">{c.lot?.lotNumber ?? "-"}</td>
                <td className="px-3 py-2 border-b max-w-xs truncate">{c.detail}</td>
                <td className="px-3 py-2 border-b max-w-xs truncate">{c.action}</td>
                <td className="px-3 py-2 border-b max-w-xs truncate">{c.prevention}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
