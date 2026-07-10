"use client";

import { useState } from "react";
import { meetings, meetingDetail as m } from "@/lib/mock";
import {
  Card,
  StatusBadge,
  PriorityBadge,
  Avatar,
  PrimaryButton,
  GhostButton,
} from "@/components/ui";
import { FileIcon } from "@/components/FileIcon";
import {
  IconPlus,
  IconCalendar,
  IconSearch,
  IconFilter,
  IconEdit,
  IconCopy,
  IconTrash,
  IconDoc,
  IconDownload,
  IconSparkles,
  IconThumbUp,
  IconThumbDown,
  IconChevronDown,
} from "@/components/icons";

const FILTERS = ["すべて", "予定", "開催中", "完了"] as const;

export default function MeetingsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("すべて");
  const [selected, setSelected] = useState(0);

  const list = meetings.filter((mt) => filter === "すべて" || mt.status === filter);

  return (
    <div className="mx-auto max-w-[1600px] p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">会議管理</h1>
          <p className="mt-1 text-sm text-slate-500">会議の計画・実施・フォローアップを管理します</p>
        </div>
        <div className="flex gap-2">
          <PrimaryButton>
            <IconPlus width={16} height={16} /> 新規会議を作成
          </PrimaryButton>
          <GhostButton>
            <IconCalendar width={16} height={16} /> カレンダー表示
          </GhostButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_1fr_320px]">
        {/* meeting list */}
        <Card className="p-4">
          <h3 className="font-bold text-slate-800">会議一覧</h3>
          <div className="relative mt-3">
            <IconSearch width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="会議名・目的で検索"
              className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-9 text-sm outline-none focus:border-blue-400"
            />
            <IconFilter width={15} height={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="mt-3 flex gap-1 rounded-xl bg-slate-100 p-1 text-xs">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 rounded-lg py-1.5 font-medium transition ${
                  filter === f ? "bg-blue-600 text-white" : "text-slate-500"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            {list.map((mt, i) => (
              <button
                key={i}
                onClick={() => setSelected(meetings.indexOf(mt))}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  meetings.indexOf(mt) === selected
                    ? "border-blue-300 bg-blue-50/50 ring-1 ring-blue-200"
                    : "border-slate-100 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-800">{mt.title}</span>
                  <StatusBadge status={mt.status} />
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <IconCalendar width={12} height={12} /> {mt.date}
                </p>
                <p className="text-xs text-slate-400">{mt.place}</p>
                <div className="mt-1.5 flex items-center gap-1">
                  <Avatar name="A B C" size={20} />
                  <span className="text-xs text-slate-400">{mt.extra}</span>
                </div>
              </button>
            ))}
          </div>
          <button className="mt-3 w-full text-center text-sm font-medium text-blue-600">
            全15件を表示 ›
          </button>
        </Card>

        {/* meeting detail */}
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">{m.title}</h2>
            <StatusBadge status={m.status} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <GhostButton className="!py-1.5 !text-blue-600">
              <IconEdit width={15} height={15} /> 編集
            </GhostButton>
            <GhostButton className="!py-1.5">
              <IconCopy width={15} height={15} /> 複製
            </GhostButton>
            <GhostButton className="!py-1.5">
              <IconTrash width={15} height={15} /> 削除
            </GhostButton>
            <GhostButton className="!py-1.5">
              <IconDoc width={15} height={15} /> 議事録テンプレート
            </GhostButton>
          </div>

          <dl className="mt-4 space-y-3 border-y border-slate-100 py-4 text-sm">
            <div className="flex gap-3">
              <dt className="flex w-24 shrink-0 items-center gap-1.5 text-slate-400">
                <IconCalendar width={15} height={15} /> 開催日時
              </dt>
              <dd className="font-medium text-slate-700">{m.date}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-24 shrink-0 text-slate-400">開催場所</dt>
              <dd className="text-slate-700">{m.place}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-24 shrink-0 text-slate-400">参加者</dt>
              <dd className="flex flex-wrap gap-3">
                {m.attendees.map((a) => (
                  <span key={a.name} className="flex items-center gap-1.5">
                    <Avatar name={a.name} size={26} />
                    <span className="text-slate-700">
                      {a.name}
                      <span className="text-xs text-slate-400"> ({a.role})</span>
                    </span>
                  </span>
                ))}
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  {m.extra} <IconChevronDown width={14} height={14} />
                </span>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-24 shrink-0 text-slate-400">開催目的</dt>
              <dd className="text-slate-700">{m.purpose}</dd>
            </div>
          </dl>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Panel title="前回議事録 (2025/06/03)" badge="議事録を表示">
              <ul className="space-y-1.5 text-sm text-slate-600">
                {m.prevMinutes.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="text-slate-300">•</span>
                    {p}
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="未完了事項" badge={`${m.incomplete.length}件`}>
              <div className="space-y-2.5">
                {m.incomplete.map((it) => (
                  <div key={it.task} className="text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-slate-700">
                        <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300" />
                        {it.task}
                      </span>
                      <StatusBadge status={it.status} />
                    </div>
                    <p className="pl-5 text-xs text-slate-400">
                      担当: {it.owner}　期限: {it.due}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="次回アジェンダ (予定)" badge={`${m.nextAgenda.length}件`}>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
                {m.nextAgenda.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ol>
            </Panel>
            <Panel title="配布資料" badge={`${m.materials.length}件`}>
              <div className="space-y-2">
                {m.materials.map((f) => (
                  <div key={f.name} className="flex items-center gap-2">
                    <FileIcon kind={f.kind} size={26} />
                    <span className="flex-1 truncate text-sm text-slate-700">{f.name}</span>
                    <span className="text-xs text-slate-400">{f.size}</span>
                  </div>
                ))}
              </div>
              <button className="mt-3 flex w-full items-center justify-center gap-1 text-sm font-medium text-blue-600">
                <IconDownload width={15} height={15} /> すべてダウンロード
              </button>
            </Panel>
          </div>
        </Card>

        {/* AI panel */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">AI提案エリア</h3>
            <span className="flex items-center gap-1 text-xs font-medium text-violet-600">
              <IconSparkles width={14} height={14} /> Powered by AI
            </span>
          </div>

          <AiBlock title="次回アジェンダ案" reason={m.aiNextAgenda.reason} action="アジェンダに追加">
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
              {m.aiNextAgenda.items.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>
          </AiBlock>

          <AiBlock title="未完了タスク案" reason={m.aiIncompleteTasks.reason} action="タスクに登録">
            <div className="space-y-2">
              {m.aiIncompleteTasks.items.map((it) => (
                <div key={it.task} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300" />
                  <span className="flex-1 text-slate-700">{it.task}</span>
                  <PriorityBadge level={it.priority} />
                  <span className="whitespace-nowrap text-xs text-red-500">{it.note}</span>
                </div>
              ))}
            </div>
          </AiBlock>

          <AiBlock title="確認すべき論点" reason={m.aiCheckpoints.reason} action="論点を共有">
            <ul className="space-y-1.5 text-sm text-slate-600">
              {m.aiCheckpoints.items.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="text-slate-300">•</span>
                  {c}
                </li>
              ))}
            </ul>
          </AiBlock>
        </Card>
      </div>
    </div>
  );
}

function Panel({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700">{title}</h4>
        {badge && <span className="text-xs font-medium text-slate-400">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function AiBlock({
  title,
  reason,
  action,
  children,
}: {
  title: string;
  reason: string;
  action: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 rounded-xl border border-slate-100 p-4">
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      <p className="mt-0.5 text-xs text-violet-500">提案理由：{reason}</p>
      <div className="mt-3">{children}</div>
      <div className="mt-3 flex items-center justify-between">
        <button className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50">
          {action}
        </button>
        <div className="flex gap-1 text-slate-300">
          <button className="rounded p-1 hover:bg-slate-100 hover:text-slate-500">
            <IconThumbUp width={15} height={15} />
          </button>
          <button className="rounded p-1 hover:bg-slate-100 hover:text-slate-500">
            <IconThumbDown width={15} height={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
