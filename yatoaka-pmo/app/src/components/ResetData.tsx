"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { IconTrash } from "@/components/icons";

export default function ResetData() {
  const store = useStore();
  const [done, setDone] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => {
          store.reset();
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        }}
        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        <IconTrash width={16} height={16} /> サンプルデータを初期化
      </button>
      {done && <span className="text-sm font-medium text-green-600">初期化しました</span>}
    </div>
  );
}
