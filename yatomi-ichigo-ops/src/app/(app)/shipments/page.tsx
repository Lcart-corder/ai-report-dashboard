"use client";

import { useEffect, useState, FormEvent } from "react";

interface Shipment {
  id: string;
  datePlanned: string;
  dateDelivered: string | null;
  status: string;
  store: { name: string };
  items: { id: string; lot: { lotNumber: string }; grade: string; packCount: number }[];
  deliveredByUser: { name: string } | null;
  inspection: { id: string } | null;
}

interface Lot {
  id: string;
  lotNumber: string;
}

interface Store {
  id: string;
  name: string;
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newStoreId, setNewStoreId] = useState("");
  const [msg, setMsg] = useState("");

  // アイテム追加用
  const [addShipmentId, setAddShipmentId] = useState("");
  const [addLotId, setAddLotId] = useState("");
  const [addGrade, setAddGrade] = useState("A");
  const [addPackCount, setAddPackCount] = useState("");

  function load() {
    fetch("/api/shipments").then((r) => r.json()).then(setShipments);
  }

  useEffect(() => {
    load();
    // 店舗とロットのリスト取得（簡易API）
    fetch("/api/stores").then((r) => r.ok ? r.json() : []).then(setStores).catch(() => {});
    fetch("/api/lots").then((r) => r.ok ? r.json() : []).then(setLots).catch(() => {});
  }, []);

  async function createShipment(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    await fetch("/api/shipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", datePlanned: newDate, storeId: newStoreId }),
    });
    setMsg("納品予定を作成しました");
    load();
  }

  async function addItem(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/shipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addItem",
        shipmentId: addShipmentId,
        lotId: addLotId,
        grade: addGrade,
        packCount: parseInt(addPackCount),
      }),
    });
    setMsg("アイテムを追加しました");
    setAddPackCount("");
    load();
  }

  async function markDelivered(shipmentId: string) {
    const today = new Date().toISOString().split("T")[0];
    await fetch("/api/shipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deliver", shipmentId, dateDelivered: today }),
    });
    setMsg("納品完了にしました");
    load();
  }

  const STATUS_LABELS: Record<string, string> = {
    PLANNED: "予定", SHIPPED: "出荷済", DELIVERED: "納品済", INSPECTED: "検収済",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">納品管理</h1>

      {/* 新規納品予定 */}
      <form onSubmit={createShipment} className="bg-white rounded-lg border p-4 space-y-3 max-w-lg">
        <h2 className="font-semibold text-gray-700">新規納品予定</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">納品予定日</label>
            <input type="date" required value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">納品先</label>
            <select required value={newStoreId}
              onChange={(e) => setNewStoreId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">選択</option>
              {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <button type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 text-sm font-medium">
          作成
        </button>
      </form>

      {/* アイテム追加 */}
      <form onSubmit={addItem} className="bg-white rounded-lg border p-4 space-y-3 max-w-lg">
        <h2 className="font-semibold text-gray-700">出荷アイテム追加</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">納品</label>
            <select required value={addShipmentId}
              onChange={(e) => setAddShipmentId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">選択</option>
              {shipments.filter((s) => s.status === "PLANNED").map((s) => (
                <option key={s.id} value={s.id}>
                  {s.datePlanned.split("T")[0]} - {s.store.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ロット</label>
            <select required value={addLotId}
              onChange={(e) => setAddLotId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">選択</option>
              {lots.map((l) => <option key={l.id} value={l.id}>{l.lotNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">等級</label>
            <select value={addGrade} onChange={(e) => setAddGrade(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">パック数</label>
            <input type="number" min="1" required value={addPackCount}
              onChange={(e) => setAddPackCount(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
        </div>
        <button type="submit"
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm font-medium">
          追加
        </button>
      </form>

      {msg && <p className="text-sm text-green-700">{msg}</p>}

      {/* 一覧 */}
      <h2 className="font-semibold text-gray-700">納品一覧</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border-b text-left">予定日</th>
              <th className="px-3 py-2 border-b text-left">納品先</th>
              <th className="px-3 py-2 border-b text-left">ステータス</th>
              <th className="px-3 py-2 border-b text-left">アイテム</th>
              <th className="px-3 py-2 border-b text-left">納品日</th>
              <th className="px-3 py-2 border-b text-left">担当者</th>
              <th className="px-3 py-2 border-b text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 border-b">{s.datePlanned.split("T")[0]}</td>
                <td className="px-3 py-2 border-b">{s.store.name}</td>
                <td className="px-3 py-2 border-b">{STATUS_LABELS[s.status] ?? s.status}</td>
                <td className="px-3 py-2 border-b">
                  {s.items.map((i) => `${i.lot.lotNumber} ${i.grade}×${i.packCount}`).join(", ") || "-"}
                </td>
                <td className="px-3 py-2 border-b">{s.dateDelivered?.split("T")[0] ?? "-"}</td>
                <td className="px-3 py-2 border-b">{s.deliveredByUser?.name ?? "-"}</td>
                <td className="px-3 py-2 border-b">
                  {s.status === "PLANNED" && s.items.length > 0 && (
                    <button onClick={() => markDelivered(s.id)}
                      className="text-blue-600 hover:underline text-xs">納品完了</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
