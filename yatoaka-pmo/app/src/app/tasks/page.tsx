"use client";

import { useMemo, useState } from "react";
import { useStore, effectiveProgress, childrenOf, type Task } from "@/lib/store";
import type { Priority } from "@/lib/mock";
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
import { Modal } from "@/components/Modal";
import { Field, Input, FormSelect } from "@/components/forms";
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
  IconTrash,
} from "@/components/icons";

const TABS = ["一覧", "ガント", "担当者別"] as const;
const PRIORITIES: Priority[] = ["最高", "高", "中", "低"];
const STATUSES = ["未着手", "対応中", "確認待ち", "承認待ち", "保留", "完了", "中止"];

function segCompare(a: string, b: string) {
  const as = a.split(".").map(Number);
  const bs = b.split(".").map(Number);
  for (let i = 0; i < Math.max(as.length, bs.length); i++) {
    const d = (as[i] ?? -1) - (bs[i] ?? -1);
    if (d !== 0) return d;
  }
  return 0;
}

export default function TasksPage() {
  const store = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]>("一覧");
  const [selectedId, setSelectedId] = useState("1.1.2");
  const [statusFilter, setStatusFilter] = useState("すべてのステータス");
  const [priorityFilter, setPriorityFilter] = useState("優先度すべて");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);

  const ordered = useMemo(
    () => [...store.tasks].sort((a, b) => segCompare(a.code, b.code)),
    [store.tasks]
  );

  const visible = ordered.filter(
    (t) =>
      (statusFilter === "すべてのステータス" || t.status === statusFilter) &&
      (priorityFilter === "優先度すべて" || t.priority === priorityFilter) &&
      (query === "" || t.name.includes(query) || t.code.includes(query))
  );

  const selected = store.tasks.find((t) => t.id === selectedId) ?? ordered[0];

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
          <PrimaryButton onClick={() => setAdding(true)}>
            <IconPlus width={16} height={16} /> タスク追加
          </PrimaryButton>
        </div>
      </div>

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
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
            <Select className="!h-10 !w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {["すべてのステータス", ...STATUSES].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
            <Select className="!h-10 !w-36" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              {["優先度すべて", ...PRIORITIES].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
            <div className="relative min-w-[200px] flex-1">
              <IconSearch width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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
                  {visible.map((r) => {
                    const level = r.code.split(".").length - 1;
                    const isParent = childrenOf(store.tasks, r.id).length > 0;
                    const prog = effectiveProgress(store.tasks, r);
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedId(r.id)}
                        className={`cursor-pointer border-b border-slate-50 hover:bg-blue-50/40 ${
                          selected?.id === r.id ? "bg-blue-50/60" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5" style={{ paddingLeft: level * 20 }}>
                            {isParent ? (
                              <IconChevronDown width={14} height={14} className="text-slate-400" />
                            ) : (
                              <span className="w-3.5 text-slate-300">└</span>
                            )}
                            {isParent && <IconFolder width={15} height={15} className="text-amber-500" />}
                            <span className={`${level === 0 ? "font-semibold" : ""} text-slate-700`}>
                              {r.code} {r.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="flex items-center gap-1.5">
                            <Avatar name={r.owner || "?"} size={22} />
                            <span className="whitespace-nowrap text-slate-600">{r.owner || "—"}</span>
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-500">{r.start || "—"}</td>
                        <td className="px-3 py-3 text-slate-500">{r.due || "—"}</td>
                        <td className="px-3 py-3">
                          <PriorityBadge level={r.priority} />
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-8 text-xs font-semibold text-slate-600">{prog}%</span>
                            <ProgressBar value={prog} className="w-16" />
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <IconChat width={14} height={14} /> {r.comments}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-blue-600">{r.depends ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {tab === "ガント" && <GanttView tasks={ordered} />}
          {tab === "担当者別" && <AssigneeView tasks={ordered} allTasks={store.tasks} />}

          <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-500">
            <span>全 {visible.length} 件を表示</span>
          </div>
        </Card>

        {selected ? (
          <TaskDetail key={selected.id} task={selected} />
        ) : (
          <Card className="p-5 text-sm text-slate-400">タスクを選択してください</Card>
        )}
      </div>

      <AddTaskModal open={adding} onClose={() => setAdding(false)} onCreated={(id) => setSelectedId(id)} />
    </div>
  );
}

/* ---------------- Editable detail ---------------- */
function TaskDetail({ task }: { task: Task }) {
  const store = useStore();
  const isParent = childrenOf(store.tasks, task.id).length > 0;
  const prog = effectiveProgress(store.tasks, task);

  const update = (patch: Partial<Task>) => store.updateTask({ ...task, ...patch });

  return (
    <Card className="h-fit p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800">タスク詳細</h3>
        <button
          onClick={() => store.deleteTask(task.id)}
          className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          <IconTrash width={14} height={14} /> 削除
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <IconFolder width={18} height={18} className="text-amber-500" />
        <span className="font-semibold text-slate-800">{task.code}</span>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <Field label="タスク名">
          <Input value={task.name} onChange={(e) => update({ name: e.target.value })} />
        </Field>
        <Field label="担当者">
          <Input value={task.owner} onChange={(e) => update({ owner: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="開始日">
            <Input type="date" value={task.start.replace(/\//g, "-")} onChange={(e) => update({ start: e.target.value.replace(/-/g, "/") })} />
          </Field>
          <Field label="期限">
            <Input type="date" value={task.due.replace(/\//g, "-")} onChange={(e) => update({ due: e.target.value.replace(/-/g, "/") })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="優先度">
            <FormSelect value={task.priority} onChange={(e) => update({ priority: e.target.value as Priority })}>
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </FormSelect>
          </Field>
          <Field label="ステータス">
            <FormSelect value={task.status} onChange={(e) => update({ status: e.target.value })}>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </FormSelect>
          </Field>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>進捗率</span>
            <span className="font-bold text-slate-700">{prog}%</span>
          </div>
          {isParent ? (
            <>
              <ProgressBar value={prog} />
              <p className="mt-1 text-xs text-slate-400">子タスクから自動計算されます</p>
            </>
          ) : (
            <input
              type="range"
              min={0}
              max={100}
              value={task.progress}
              onChange={(e) => update({ progress: Number(e.target.value) })}
              className="w-full accent-blue-600"
            />
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-slate-600">説明</p>
        <textarea
          value={task.desc ?? ""}
          onChange={(e) => update({ desc: e.target.value })}
          rows={3}
          placeholder="タスクの説明を入力"
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
        />
      </div>
    </Card>
  );
}

/* ---------------- Add modal ---------------- */
function AddTaskModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const store = useStore();
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [owner, setOwner] = useState("");
  const [priority, setPriority] = useState<Priority>("中");
  const [status, setStatus] = useState("未着手");
  const [start, setStart] = useState("");
  const [due, setDue] = useState("");

  const reset = () => {
    setName("");
    setParentId("");
    setOwner("");
    setPriority("中");
    setStatus("未着手");
    setStart("");
    setDue("");
  };

  const nextCode = (): string => {
    if (!parentId) {
      const tops = store.tasks.filter((t) => !t.parentId);
      const max = tops.reduce((m, t) => Math.max(m, Number(t.code) || 0), 0);
      return String(max + 1);
    }
    const parent = store.tasks.find((t) => t.id === parentId)!;
    const kids = childrenOf(store.tasks, parentId);
    const max = kids.reduce((m, t) => {
      const last = Number(t.code.split(".").pop());
      return Math.max(m, isNaN(last) ? 0 : last);
    }, 0);
    return `${parent.code}.${max + 1}`;
  };

  const submit = () => {
    if (!name.trim()) return;
    const id = store.newId("t");
    const task: Task = {
      id,
      code: nextCode(),
      name: name.trim(),
      level: parentId ? 2 : 0,
      owner,
      start: start.replace(/-/g, "/"),
      due: due.replace(/-/g, "/"),
      priority,
      status,
      progress: 0,
      comments: 0,
      parentId: parentId || undefined,
    };
    store.addTask(task);
    onCreated(id);
    reset();
    onClose();
  };

  const parentOptions = [...store.tasks].sort((a, b) => segCompare(a.code, b.code));

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="タスクを追加"
      footer={
        <>
          <GhostButton
            onClick={() => {
              reset();
              onClose();
            }}
          >
            キャンセル
          </GhostButton>
          <PrimaryButton onClick={submit}>追加</PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="タスク名 *" className="sm:col-span-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例：会場予約" />
        </Field>
        <Field label="親タスク" className="sm:col-span-2">
          <FormSelect value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">（トップレベル）</option>
            {parentOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.code} {t.name}
              </option>
            ))}
          </FormSelect>
        </Field>
        <Field label="担当者">
          <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="例：鈴木 一郎" />
        </Field>
        <Field label="優先度">
          <FormSelect value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            {PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </FormSelect>
        </Field>
        <Field label="開始日">
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field label="期限">
          <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </Field>
        <Field label="ステータス" className="sm:col-span-2">
          <FormSelect value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </FormSelect>
        </Field>
      </div>
    </Modal>
  );
}

/* ---------------- Gantt ---------------- */
function GanttView({ tasks }: { tasks: Task[] }) {
  const months = ["5月", "6月", "7月", "8月"];
  const start = new Date("2025-05-01").getTime();
  const end = new Date("2025-08-31").getTime();
  const span = end - start;
  const withDates = tasks.filter((t) => t.start && t.due);
  return (
    <div className="overflow-x-auto p-4">
      <div className="min-w-[760px]">
        <div className="ml-56 grid grid-cols-4 border-b border-slate-100 pb-2 text-xs font-medium text-slate-400">
          {months.map((m) => (
            <div key={m}>{m}</div>
          ))}
        </div>
        {withDates.map((r) => {
          const s = ((new Date(r.start.replace(/\//g, "-")).getTime() - start) / span) * 100;
          const w =
            ((new Date(r.due.replace(/\//g, "-")).getTime() - new Date(r.start.replace(/\//g, "-")).getTime()) / span) * 100;
          const level = r.code.split(".").length - 1;
          return (
            <div key={r.id} className="flex items-center border-b border-slate-50 py-1.5">
              <div className="w-56 truncate pr-2 text-sm text-slate-600" style={{ paddingLeft: level * 14 }}>
                {r.code} {r.name}
              </div>
              <div className="relative h-5 flex-1">
                <div
                  className={`absolute top-0 h-5 rounded-md ${r.progress >= 100 ? "bg-green-400" : "bg-blue-400"}`}
                  style={{ left: `${Math.max(0, s)}%`, width: `${Math.max(w, 2)}%` }}
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

/* ---------------- Assignee view ---------------- */
function AssigneeView({ tasks, allTasks }: { tasks: Task[]; allTasks: Task[] }) {
  const byOwner = tasks.reduce<Record<string, Task[]>>((acc, r) => {
    const key = r.owner || "未割当";
    (acc[key] ||= []).push(r);
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
              <div key={r.id} className="flex items-center gap-2 text-sm">
                <span className="flex-1 truncate text-slate-600">
                  {r.code} {r.name}
                </span>
                <ProgressBar value={effectiveProgress(allTasks, r)} className="w-16" />
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
