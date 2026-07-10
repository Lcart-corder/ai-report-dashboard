"use client";

import { useState } from "react";
import { useStore, type Meeting } from "@/lib/store";
import { meetingDetail as m } from "@/lib/mock";
import {
  Card,
  StatusBadge,
  PriorityBadge,
  Avatar,
  PrimaryButton,
  GhostButton,
} from "@/components/ui";
import { Modal } from "@/components/Modal";
import { Field, Input, FormSelect, Textarea } from "@/components/forms";
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
const STATUSES = ["予定", "開催中", "完了"];

const emptyMeeting = (id: string): Meeting => ({
  id,
  title: "",
  status: "予定",
  date: "",
  place: "",
  purpose: "",
  extra: "",
});

export default function MeetingsPage() {
  const store = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("すべて");
  const [selectedId, setSelectedId] = useState(store.meetings[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Meeting | null>(null);

  const list = store.meetings.filter(
    (mt) =>
      (filter === "すべて" || mt.status === filter) &&
      (query === "" || mt.title.includes(query))
  );
  const selected = store.meetings.find((mt) => mt.id === selectedId) ?? store.meetings[0];

  const openCreate = () => setEditing(emptyMeeting(store.newId("MTG")));
  const openEdit = () => selected && setEditing({ ...selected });

  const save = () => {
    if (!editing || !editing.title.trim()) return;
    const exists = store.meetings.some((mt) => mt.id === editing.id);
    if (exists) store.updateMeeting(editing);
    else {
      store.addMeeting(editing);
      setSelectedId(editing.id);
    }
    setEditing(null);
  };

  const remove = () => {
    if (!selected) return;
    store.deleteMeeting(selected.id);
    const remaining = store.meetings.filter((mt) => mt.id !== selected.id);
    setSelectedId(remaining[0]?.id ?? "");
  };

  return (
    <div className="mx-auto max-w-[1600px] p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">会議管理</h1>
          <p className="mt-1 text-sm text-slate-500">会議の計画・実施・フォローアップを管理します</p>
        </div>
        <div className="flex gap-2">
          <PrimaryButton onClick={openCreate}>
            <IconPlus width={16} height={16} /> 新規会議を作成
          </PrimaryButton>
          <GhostButton>
            <IconCalendar width={16} height={16} /> カレンダー表示
          </GhostButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_1fr_320px]">
        {/* list */}
        <Card className="p-4">
          <h3 className="font-bold text-slate-800">会議一覧</h3>
          <div className="relative mt-3">
            <IconSearch width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
            {list.map((mt) => (
              <button
                key={mt.id}
                onClick={() => setSelectedId(mt.id)}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  mt.id === selected?.id
                    ? "border-blue-300 bg-blue-50/50 ring-1 ring-blue-200"
                    : "border-slate-100 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-800">{mt.title}</span>
                  <StatusBadge status={mt.status} />
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <IconCalendar width={12} height={12} /> {mt.date || "日時未設定"}
                </p>
                <p className="text-xs text-slate-400">{mt.place}</p>
              </button>
            ))}
            {list.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">会議がありません</p>
            )}
          </div>
        </Card>

        {/* detail */}
        {selected ? (
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">{selected.title}</h2>
              <StatusBadge status={selected.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <GhostButton className="!py-1.5 !text-blue-600" onClick={openEdit}>
                <IconEdit width={15} height={15} /> 編集
              </GhostButton>
              <GhostButton
                className="!py-1.5"
                onClick={() => {
                  const copy = { ...selected, id: store.newId("MTG"), title: `${selected.title}（複製）` };
                  store.addMeeting(copy);
                  setSelectedId(copy.id);
                }}
              >
                <IconCopy width={15} height={15} /> 複製
              </GhostButton>
              <GhostButton className="!py-1.5 !text-red-600" onClick={remove}>
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
                <dd className="font-medium text-slate-700">{selected.date || "未設定"}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-24 shrink-0 text-slate-400">開催場所</dt>
                <dd className="text-slate-700">{selected.place || "未設定"}</dd>
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
                    {selected.extra || "+3名"} <IconChevronDown width={14} height={14} />
                  </span>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-24 shrink-0 text-slate-400">開催目的</dt>
                <dd className="text-slate-700">{selected.purpose || m.purpose}</dd>
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
        ) : (
          <Card className="flex items-center justify-center p-10 text-sm text-slate-400">
            会議を選択、または新規作成してください
          </Card>
        )}

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

      {/* modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing && store.meetings.some((mt) => mt.id === editing.id) ? "会議を編集" : "新規会議を作成"}
        footer={
          <>
            <GhostButton onClick={() => setEditing(null)}>キャンセル</GhostButton>
            <PrimaryButton onClick={save}>保存</PrimaryButton>
          </>
        }
      >
        {editing && (
          <div className="grid grid-cols-1 gap-4">
            <Field label="会議名 *">
              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="例：イベント部会 定例会議" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="ステータス">
                <FormSelect value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </FormSelect>
              </Field>
              <Field label="参加者数（表示）">
                <Input value={editing.extra ?? ""} onChange={(e) => setEditing({ ...editing, extra: e.target.value })} placeholder="例：+3" />
              </Field>
            </div>
            <Field label="開催日時">
              <Input value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} placeholder="例：2025/06/10 (火) 10:00 - 11:30" />
            </Field>
            <Field label="開催場所">
              <Input value={editing.place} onChange={(e) => setEditing({ ...editing, place: e.target.value })} placeholder="例：会議室A / オンライン" />
            </Field>
            <Field label="開催目的">
              <Textarea value={editing.purpose ?? ""} onChange={(e) => setEditing({ ...editing, purpose: e.target.value })} rows={3} placeholder="会議の目的を入力" />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Panel({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
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
