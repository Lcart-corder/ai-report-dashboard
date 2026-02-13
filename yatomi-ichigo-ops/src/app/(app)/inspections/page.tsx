"use client";

import { useEffect, useState, FormEvent } from "react";

interface Shipment {
  id: string;
  datePlanned: string;
  status: string;
  store: { name: string };
  items: { grade: string; packCount: number }[];
}

interface Inspection {
  id: string;
  receivedA: number;
  receivedB: number;
  returnedA: number;
  returnedB: number;
  discountA: number;
  discountB: number;
  reason: string | null;
  comment: string | null;
  shipment: {
    datePlanned: string;
    store: { name: string };
  };
  inspectedByUser: { name: string };
  createdAt: string;
}

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [deliveredShipments, setDeliveredShipments] = useState<Shipment[]>([]);
  const [selectedShipmentId, setSelectedShipmentId] = useState("");
  const [form, setForm] = useState({
    receivedA: "0", receivedB: "0",
    returnedA: "0", returnedB: "0",
    discountA: "0", discountB: "0",
    reason: "", comment: "",
  });
  const [msg, setMsg] = useState("");

  function load() {
    fetch("/api/inspections").then((r) => r.json()).then(setInspections);
    fetch("/api/shipments").then((r) => r.json()).then((data: Shipment[]) => {
      setDeliveredShipments(data.filter((s) => s.status === "DELIVERED"));
    });
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/inspections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shipmentId: selectedShipmentId,
        receivedA: parseInt(form.receivedA),
        receivedB: parseInt(form.receivedB),
        returnedA: parseInt(form.returnedA),
        returnedB: parseInt(form.returnedB),
        discountA: parseInt(form.discountA),
        discountB: parseInt(form.discountB),
        reason: form.reason || null,
        comment: form.comment || null,
      }),
    });
    if (res.ok) {
      setMsg("検収を登録しました");
      setForm({ receivedA: "0", receivedB: "0", returnedA: "0", returnedB: "0", discountA: "0", discountB: "0", reason: "", comment: "" });
      setSelectedShipmentId("");
      load();
    } else {
      setMsg("登録に失敗しました");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">店舗検収</h1>

      {deliveredShipments.length > 0 && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-4 space-y-4 max-w-lg">
          <h2 className="font-semibold text-gray-700">検収入力</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">対象納品</label>
            <select required value={selectedShipmentId}
              onChange={(e) => setSelectedShipmentId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">選択</option>
              {deliveredShipments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.datePlanned.split("T")[0]} - {s.store.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">受領数A</label>
              <input type="number" min="0" required value={form.receivedA}
                onChange={(e) => setForm({ ...form, receivedA: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">受領数B</label>
              <input type="number" min="0" required value={form.receivedB}
                onChange={(e) => setForm({ ...form, receivedB: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">返品数A</label>
              <input type="number" min="0" value={form.returnedA}
                onChange={(e) => setForm({ ...form, returnedA: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">返品数B</label>
              <input type="number" min="0" value={form.returnedB}
                onChange={(e) => setForm({ ...form, returnedB: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">値引数A</label>
              <input type="number" min="0" value={form.discountA}
                onChange={(e) => setForm({ ...form, discountA: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">値引数B</label>
              <input type="number" min="0" value={form.discountB}
                onChange={(e) => setForm({ ...form, discountB: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">返品理由</label>
            <input type="text" value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">コメント</label>
            <textarea value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm" rows={2} />
          </div>
          <button type="submit"
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 text-sm font-medium">
            検収登録
          </button>
          {msg && <p className="text-sm text-green-700 mt-1">{msg}</p>}
        </form>
      )}

      <h2 className="font-semibold text-gray-700">検収一覧</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border-b text-left">納品日</th>
              <th className="px-3 py-2 border-b text-left">店舗</th>
              <th className="px-3 py-2 border-b text-left">受領A/B</th>
              <th className="px-3 py-2 border-b text-left">返品A/B</th>
              <th className="px-3 py-2 border-b text-left">値引A/B</th>
              <th className="px-3 py-2 border-b text-left">理由</th>
              <th className="px-3 py-2 border-b text-left">検収者</th>
            </tr>
          </thead>
          <tbody>
            {inspections.map((i) => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 border-b">{i.shipment.datePlanned.split("T")[0]}</td>
                <td className="px-3 py-2 border-b">{i.shipment.store.name}</td>
                <td className="px-3 py-2 border-b">{i.receivedA}/{i.receivedB}</td>
                <td className="px-3 py-2 border-b">{i.returnedA}/{i.returnedB}</td>
                <td className="px-3 py-2 border-b">{i.discountA}/{i.discountB}</td>
                <td className="px-3 py-2 border-b">{i.reason ?? "-"}</td>
                <td className="px-3 py-2 border-b">{i.inspectedByUser.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
