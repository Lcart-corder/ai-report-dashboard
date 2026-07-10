"use client";

import { useState } from "react";
import { wbsRows, wbsDetail } from "@/lib/mock";
import {
  Card,
  ProgressBar,
  StatusBadge,
  PriorityBadge,
  Avatar,
  Select,
  PrimaryButton,
  GhostButton,
} from "@/components/ui";
import {
  IconPlus,
  IconDownload,
  IconUpload,
  IconSearch,
  IconFilter,
  IconSettings,
  IconChat,
  IconFolder,
  IconChevronDown,
  IconChevronRight,
} from "@/components/icons";

const TABS = ["一覧", "ガント", "担当者別"] as const;

export default function TasksPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("一覧");
  const [selected, setSelected] = useState("1.1.2");

  return (
    <div className="mx-auto max-w-[1600px] p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">WBS / タスク管理</h1>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-600">
            画面番号 4
          </span>
        </div>
        <div className="flex gap-2">
          <GhostButton>
            <IconUpload width={16} height={16} /> インポート
          </GhostButton>
          <GhostButton>
            <IconDownload width={16} height={16} /> エクスポート
          </GhostButton>
          <PrimaryButton>
            <IconPlus width={16} height={16} /> タスク追加
          </PrimaryButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-6 py-2 text-sm font-medium transition ${
              tab === t ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        {/* main table */}
        <Card className="overflow-hidden">
          {/* filter */}
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
            <Select className="!h-10 !w-40">
              <option>すべてのステータス</option>
              <option>進行中</option>
              <option>未着手</option>
              <option>完了</option>
            </Select>
            <Select className="!h-10 !w-36">
              <option>優先度すべて</option>
              <option>高</option>
              <option>中</option>
              <option>低</option>
            </Select>
            <div className="relative min-w-[200px] flex-1">
              <IconSearch width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="タスク名で検索"
                className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <GhostButton className="!h-10 !py-0">
              <IconFilter width={16} height={16} /> 詳細フィルター
            </GhostButton>
            <GhostButton className="!h-10 !py-0">
              <IconSettings width={16} height={16} /> 表示設定
            </GhostButton>
          </div>

          {tab === "一覧" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs text-slate-500">
                    <th className="px-4 py-3 font-medium">タスク名</th>
                    <th className="px-3 py-3 font-medium">担当者</th>
                    <th className="px-3 py-3 font-medium">開始日</th>
                    <th className="px-3 py-3 font-medium">期限</th>
                    <th className="px-3 py-3 font-medium">優先度</th>
                    <th className="px-3 py-3 font-medium">ステータス</th>
                    <th className="px-3 py-3 font-medium">進捗率</th>
                    <th className="px-3 py-3 text-center font-medium">コメント</th>
                    <th className="px-3 py-3 font-medium">依存</th>
                  </tr>
                </thead>
                <tbody>
                  {wbsRows.map((r) => (
                    <tr
                      key={r.code}
                      onClick={() => setSelected(r.code)}
                      className={`cursor-pointer border-b border-slate-50 hover:bg-blue-50/40 ${
                        selected === r.code ? "bg-blue-50/60" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center gap-1.5"
                          style={{ paddingLeft: r.level * 20 }}
                        >
                          {r.level < 2 ? (
                            <IconChevronDown width={14} height={14} className="text-slate-400" />
                          ) : (
                            <span className="w-3.5 text-slate-300">└</span>
                          )}
                          {r.level < 2 && <IconFolder width={15} height={15} className="text-amber-500" />}
                          <span className={`${r.level === 0 ? "font-semibold" : ""} text-slate-700`}>
                            {r.code} {r.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-1.5">
                          <Avatar name={r.owner} size={22} />
                          <span className="whitespace-nowrap text-slate-600">{r.owner}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-500">{r.start}</td>
                      <td className="px-3 py-3 text-slate-500">{r.due}</td>
                      <td className="px-3 py-3">
                        <PriorityBadge level={r.priority} />
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-8 text-xs font-semibold text-slate-600">{r.progress}%</span>
                          <ProgressBar value={r.progress} className="w-16" />
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <IconChat width={14} height={14} /> {r.comments}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-blue-600">{r.depends ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "ガント" && <GanttView />}
          {tab === "担当者別" && <AssigneeView />}

          <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-500">
            <span>全 {wbsRows.length} 件中 1 - {wbsRows.length} 件を表示</span>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-slate-200 px-2.5 py-1 hover:bg-slate-50">‹</button>
              <button className="rounded-lg bg-blue-600 px-3 py-1 font-medium text-white">1</button>
              <button className="rounded-lg border border-slate-200 px-2.5 py-1 hover:bg-slate-50">›</button>
            </div>
          </div>
        </Card>

        {/* detail panel */}
        <TaskDetail />
      </div>
    </div>
  );
}

function TaskDetail() {
  const d = wbsDetail;
  return (
    <Card className="h-fit p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800">タスク詳細</h3>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconFolder width={18} height={18} className="text-amber-500" />
          <span className="font-semibold text-slate-800">{d.code} {d.name}</span>
        </div>
        <StatusBadge status={d.status} />
      </div>
      <p className="mt-1 text-xs text-slate-400">WBS</p>
      <p className="text-xs text-slate-500">{d.path}</p>

      <dl className="mt-4 space-y-3 text-sm">
        <Field label="担当者">
          <span className="flex items-center gap-1.5">
            <Avatar name={d.owner} size={22} /> {d.owner}
          </span>
        </Field>
        <Field label="開始日">{d.start}</Field>
        <Field label="期限">
          <span>
            {d.due} <span className="font-medium text-red-500">{d.dueLeft}</span>
          </span>
        </Field>
        <Field label="優先度">
          <PriorityBadge level={d.priority} />
        </Field>
        <Field label="進捗率">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">{d.progress}%</span>
            <ProgressBar value={d.progress} className="w-24" />
          </div>
        </Field>
        <Field label="依存タスク">{d.depends}</Field>
        <Field label="工数(予定/実績)">{d.effort}</Field>
      </dl>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-slate-600">説明</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{d.desc}</p>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-slate-600">コメント（{d.comments.length}）</p>
        {d.comments.map((c, i) => (
          <div key={i} className="mt-3 flex gap-2">
            <Avatar name={c.author} size={26} />
            <div>
              <p className="text-xs text-slate-400">
                <span className="font-semibold text-slate-600">{c.author}</span> {c.at}
              </p>
              <p className="text-sm text-slate-700">{c.body}</p>
            </div>
          </div>
        ))}
        <div className="mt-3 flex gap-2">
          <input
            placeholder="コメントを入力..."
            className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
          />
          <PrimaryButton className="!px-4">投稿</PrimaryButton>
        </div>
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[92px_1fr] items-center gap-2">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-slate-700">{children}</dd>
    </div>
  );
}

function GanttView() {
  const months = ["5月", "6月", "7月", "8月"];
  // simple positional gantt from wbsRows
  const start = new Date("2025-05-01").getTime();
  const end = new Date("2025-08-31").getTime();
  const span = end - start;
  return (
    <div className="overflow-x-auto p-4">
      <div className="min-w-[760px]">
        <div className="ml-56 grid grid-cols-4 border-b border-slate-100 pb-2 text-xs font-medium text-slate-400">
          {months.map((m) => (
            <div key={m}>{m}</div>
          ))}
        </div>
        {wbsRows.map((r) => {
          const s = ((new Date(r.start.replace(/\//g, "-")).getTime() - start) / span) * 100;
          const w =
            ((new Date(r.due.replace(/\//g, "-")).getTime() -
              new Date(r.start.replace(/\//g, "-")).getTime()) /
              span) *
            100;
          return (
            <div key={r.code} className="flex items-center border-b border-slate-50 py-1.5">
              <div
                className="w-56 truncate pr-2 text-sm text-slate-600"
                style={{ paddingLeft: r.level * 14 }}
              >
                {r.code} {r.name}
              </div>
              <div className="relative h-5 flex-1">
                <div
                  className={`absolute top-0 h-5 rounded-md ${
                    r.progress >= 100 ? "bg-green-400" : "bg-blue-400"
                  }`}
                  style={{ left: `${s}%`, width: `${Math.max(w, 2)}%` }}
                  title={`${r.name} (${r.progress}%)`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AssigneeView() {
  const byOwner = wbsRows.reduce<Record<string, typeof wbsRows>>((acc, r) => {
    (acc[r.owner] ||= []).push(r);
    return acc;
  }, {});
  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
      {Object.entries(byOwner).map(([owner, rows]) => (
        <div key={owner} className="rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2">
            <Avatar name={owner} size={30} />
            <span className="font-semibold text-slate-700">{owner}</span>
            <span className="ml-auto text-xs text-slate-400">{rows.length} 件</span>
          </div>
          <div className="mt-3 space-y-2">
            {rows.map((r) => (
              <div key={r.code} className="flex items-center gap-2 text-sm">
                <span className="flex-1 truncate text-slate-600">{r.code} {r.name}</span>
                <ProgressBar value={r.progress} className="w-16" />
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
