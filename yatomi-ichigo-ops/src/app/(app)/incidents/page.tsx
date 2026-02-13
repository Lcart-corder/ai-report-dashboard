"use client";

import { useEffect, useState, FormEvent } from "react";

interface Incident {
  id: string;
  date: string;
  type: string;
  detail: string;
  action: string;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "",
    detail: "",
    action: "",
  });
  const [msg, setMsg] = useState("");

  function load() {
    fetch("/api/incidents").then((r) => r.json()).then(setIncidents);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMsg("ヒヤリハットを登録しました");
      setForm({ date: new Date().toISOString().split("T")[0], type: "", detail: "", action: "" });
      load();
    } else {
      setMsg("登録に失敗しました");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">ヒヤリハット</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-4 space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700">発生日</label>
          <input type="date" required value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">種別</label>
          <input type="text" required placeholder="転倒・切傷・設備異常・その他" value={form.type}
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
          <label className="block text-sm font-medium text-gray-700">是正措置</label>
          <textarea required value={form.action}
            onChange={(e) => setForm({ ...form, action: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" rows={2} />
        </div>
        <button type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 text-sm font-medium">
          登録
        </button>
        {msg && <p className="text-sm text-green-700">{msg}</p>}
      </form>

      <h2 className="font-semibold text-gray-700">ヒヤリハット一覧</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border-b text-left">発生日</th>
              <th className="px-3 py-2 border-b text-left">種別</th>
              <th className="px-3 py-2 border-b text-left">内容</th>
              <th className="px-3 py-2 border-b text-left">是正措置</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((i) => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 border-b">{i.date.split("T")[0]}</td>
                <td className="px-3 py-2 border-b">{i.type}</td>
                <td className="px-3 py-2 border-b max-w-xs truncate">{i.detail}</td>
                <td className="px-3 py-2 border-b max-w-xs truncate">{i.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
