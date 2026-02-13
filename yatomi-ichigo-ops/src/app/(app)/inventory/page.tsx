"use client";

import { useEffect, useState, FormEvent } from "react";

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  stock: number;
  transactions: { id: string; date: string; type: string; qty: number; note: string | null }[];
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [txnItemId, setTxnItemId] = useState("");
  const [txnType, setTxnType] = useState<"IN" | "OUT">("IN");
  const [txnQty, setTxnQty] = useState("");
  const [txnNote, setTxnNote] = useState("");
  const [msg, setMsg] = useState("");

  function load() {
    fetch("/api/inventory").then((r) => r.json()).then(setItems);
  }

  useEffect(() => { load(); }, []);

  async function addItem(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, unit: newUnit }),
    });
    setNewName("");
    setNewUnit("");
    setMsg("資材を追加しました");
    load();
  }

  async function addTxn(e: FormEvent) {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];
    await fetch("/api/inventory/txn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: txnItemId,
        date: today,
        type: txnType,
        qty: parseInt(txnQty),
        note: txnNote || null,
      }),
    });
    setTxnQty("");
    setTxnNote("");
    setMsg(`${txnType === "IN" ? "入庫" : "出庫"}を記録しました`);
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">資材在庫</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 資材追加 */}
        <form onSubmit={addItem} className="bg-white rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold text-gray-700">資材追加</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">品名</label>
            <input type="text" required value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="パック容器"
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">単位</label>
            <input type="text" required value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              placeholder="個"
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          <button type="submit"
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 text-sm font-medium">
            追加
          </button>
        </form>

        {/* 入出庫 */}
        <form onSubmit={addTxn} className="bg-white rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold text-gray-700">入庫・出庫</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">資材</label>
            <select required value={txnItemId}
              onChange={(e) => setTxnItemId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">選択</option>
              {items.map((i) => <option key={i.id} value={i.id}>{i.name}（{i.unit}）</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">種別</label>
              <select value={txnType} onChange={(e) => setTxnType(e.target.value as "IN" | "OUT")}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm">
                <option value="IN">入庫</option>
                <option value="OUT">出庫</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">数量</label>
              <input type="number" min="1" required value={txnQty}
                onChange={(e) => setTxnQty(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">備考</label>
            <input type="text" value={txnNote}
              onChange={(e) => setTxnNote(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          <button type="submit"
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm font-medium">
            記録
          </button>
        </form>
      </div>

      {msg && <p className="text-sm text-green-700">{msg}</p>}

      {/* 在庫一覧 */}
      <h2 className="font-semibold text-gray-700">在庫一覧</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border-b text-left">品名</th>
              <th className="px-3 py-2 border-b text-left">単位</th>
              <th className="px-3 py-2 border-b text-left">在庫数</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 border-b">{i.name}</td>
                <td className="px-3 py-2 border-b">{i.unit}</td>
                <td className={`px-3 py-2 border-b font-semibold ${i.stock <= 0 ? "text-red-600" : ""}`}>
                  {i.stock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
