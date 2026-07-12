"use client";

import { useState } from "react";
import { stakeholders, stakeholderDetail as d } from "@/lib/mock";
import { Card, Avatar, PrimaryButton, GhostButton, Select } from "@/components/ui";
import {
  IconPlus,
  IconDownload,
  IconSearch,
  IconChevronRight,
  IconEdit,
} from "@/components/icons";

function Dots({ n, total = 4, color = "bg-blue-500" }: { n: number; total?: number; color?: string }) {
  return (
    <span className="inline-flex gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-2.5 w-2.5 rounded-full ${i < n ? color : "bg-slate-200"}`}
        />
      ))}
    </span>
  );
}

const TAG_STYLE: Record<string, string> = {
  主要: "bg-blue-50 text-blue-600",
  関連: "bg-slate-100 text-slate-500",
  パートナー: "bg-violet-50 text-violet-600",
};

export default function StakeholdersPage() {
  const [selected, setSelected] = useState(0);

  return (
    <div className="mx-auto max-w-[1600px] p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ステークホルダー管理</h1>
          <p className="mt-1 text-sm text-slate-500">
            プロジェクトに関わる社内外のステークホルダーとの関係構築・維持状況を管理します。
          </p>
        </div>
        <div className="flex gap-2">
          <PrimaryButton className="!bg-navy hover:!bg-navy-light">
            <IconPlus width={16} height={16} /> ステークホルダー新規登録
          </PrimaryButton>
          <GhostButton>
            <IconDownload width={16} height={16} /> エクスポート
          </GhostButton>
        </div>
      </div>

      {/* filter */}
      <Card className="mb-4 p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {[
            { label: "分類", opts: ["すべて", "主要", "関連", "パートナー"] },
            { label: "組織", opts: ["すべて"] },
            { label: "理解度・協力度", opts: ["すべて"] },
            { label: "やとアカ側担当者", opts: ["すべて"] },
          ].map((f) => (
            <div key={f.label}>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">{f.label}</label>
              <Select>
                {f.opts.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </Select>
            </div>
          ))}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">キーワード検索</label>
            <div className="relative">
              <input
                placeholder="組織名、担当者名で検索"
                className="h-11 w-full rounded-xl border border-slate-200 pl-3 pr-9 text-sm outline-none focus:border-blue-400"
              />
              <IconSearch width={16} height={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
        {/* list */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">関係者一覧 <span className="text-sm font-normal text-slate-400">({stakeholders.length}件)</span></h3>
            <Select className="!h-9 !w-24 !text-xs">
              <option>名前順</option>
            </Select>
          </div>
          <div className="mt-3 space-y-1">
            {stakeholders.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                  selected === i ? "border-blue-300 bg-blue-50/50 ring-1 ring-blue-200" : "border-transparent hover:bg-slate-50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400">{s.dept}</p>
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    {s.name} <span className="text-xs font-normal text-slate-400">{s.title}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TAG_STYLE[s.tag]}`}>{s.tag}</span>
                  </p>
                  <p className="text-xs text-slate-400">{s.layer}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-slate-400">理解度・協力度</span>
                  <Dots n={s.dots} />
                </div>
                <IconChevronRight width={16} height={16} className="text-slate-300" />
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-1 text-sm text-slate-500">
            <button className="px-2 py-1">‹</button>
            {[1, 2, 3, 4].map((p) => (
              <button
                key={p}
                className={`rounded-lg px-3 py-1 ${p === 1 ? "bg-blue-600 text-white" : "hover:bg-slate-100"}`}
              >
                {p}
              </button>
            ))}
            <button className="px-2 py-1">›</button>
          </div>
        </Card>

        {/* detail */}
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white">
                🏢
              </div>
              <div>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">{d.tag}</span>
                <p className="mt-1 text-sm text-slate-400">{d.dept}</p>
                <h2 className="text-2xl font-bold text-slate-800">
                  {d.name} <span className="text-base font-medium text-slate-500">{d.title}</span>
                </h2>
                <p className="mt-1 text-xs text-slate-400">🔒 {d.layer}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-xs text-slate-400">やとアカ側担当者</p>
                <p className="mt-1 font-semibold text-slate-700">{d.owner}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">最新接触日</p>
                <p className="mt-1 font-semibold text-slate-700">{d.lastContact}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">次回接触予定</p>
                <p className="mt-1 font-semibold text-slate-700">{d.nextContact}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Box title="現在の依頼事項" editable>
              <ul className="space-y-1.5 text-sm text-slate-600">
                {d.requests.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="text-slate-300">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </Box>

            <Box title="関連資料（3件）">
              <div className="space-y-2.5">
                {d.docs.map((doc) => (
                  <div key={doc.name} className="flex items-center gap-2 text-sm">
                    <span className="text-red-500">📄</span>
                    <span className="flex-1 truncate text-slate-700">{doc.name}</span>
                    <span className="text-xs text-slate-400">{doc.date}</span>
                    <IconDownload width={15} height={15} className="text-slate-400" />
                  </div>
                ))}
              </div>
              <button className="mt-3 flex w-full items-center justify-end gap-1 text-sm font-medium text-blue-600">
                すべての関連資料を見る <IconChevronRight width={14} height={14} />
              </button>
            </Box>

            <Box title="理解度・協力度" editable>
              <div className="flex items-start gap-6">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-slate-500">理解度</span>
                    <Dots n={d.understanding} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-slate-500">協力度</span>
                    <Dots n={d.cooperation} />
                  </div>
                </div>
                <div className="flex-1 border-l border-slate-100 pl-4">
                  <p className="text-xs font-semibold text-slate-500">ステータスコメント</p>
                  <p className="mt-1 text-sm text-slate-600">{d.statusComment}</p>
                </div>
              </div>
            </Box>

            <Box title="面談履歴（3件）">
              <div className="space-y-3">
                {d.history.map((h) => (
                  <div key={h.date} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium text-slate-600">{h.date}</span>
                    <span className="text-slate-700">{h.type}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{h.mode}</span>
                    <span className="text-slate-500">{h.topic}</span>
                  </div>
                ))}
              </div>
              <button className="mt-3 flex w-full items-center justify-end gap-1 text-sm font-medium text-blue-600">
                すべての面談履歴を見る <IconChevronRight width={14} height={14} />
              </button>
            </Box>

            <Box title="⚠ 注意事項" editable className="lg:col-span-2">
              <p className="text-sm text-slate-600">{d.notes}</p>
            </Box>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Box({
  title,
  children,
  editable,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  editable?: boolean;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-100 bg-slate-50/40 p-4 ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700">{title}</h4>
        {editable && <IconEdit width={15} height={15} className="text-slate-400" />}
      </div>
      {children}
    </div>
  );
}
