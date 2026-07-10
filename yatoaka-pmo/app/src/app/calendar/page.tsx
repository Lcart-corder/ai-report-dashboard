"use client";

import { useMemo, useState } from "react";
import { calEvents, calDayEvents, calOpenTasks, type CalEvent } from "@/lib/mock";
import { useStore, type Meeting } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { Card, PrimaryButton, GhostButton, Select } from "@/components/ui";
import { Modal } from "@/components/Modal";
import { Field, Input, FormSelect } from "@/components/forms";
import {
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
  IconPlus,
} from "@/components/icons";

const TYPE_COLOR: Record<CalEvent["type"], string> = {
  会議: "bg-blue-100 text-blue-700",
  部会会議: "bg-green-100 text-green-700",
  提出期限: "bg-amber-100 text-amber-700",
  理事会: "bg-violet-100 text-violet-700",
};
const DOT_COLOR: Record<CalEvent["type"], string> = {
  会議: "bg-blue-500",
  部会会議: "bg-green-500",
  提出期限: "bg-amber-500",
  理事会: "bg-violet-500",
};
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
const WD = WEEKDAYS;

type Cell = { day: number; scope: "prev" | "cur" | "next" };
const CELLS: Cell[] = [
  ...[25, 26, 27, 28, 29, 30, 31].map((d) => ({ day: d, scope: "prev" as const })),
  ...Array.from({ length: 28 }, (_, i) => ({ day: i + 1, scope: "cur" as const })),
  { day: 29, scope: "cur" },
  { day: 30, scope: "cur" },
  ...[1, 2, 3, 4, 5].map((d) => ({ day: d, scope: "next" as const })),
];
const PREV_DAYS = new Set([26, 28, 31]);

/** store の会議（2025年6月）をカレンダーイベント化 */
function parseMeetingDay(dateStr: string): { day: number; time?: string } | null {
  const md = dateStr.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (!md) return null;
  const [, y, m, d] = md;
  if (Number(y) !== 2025 || Number(m) !== 6) return null;
  const tm = dateStr.match(/(\d{1,2}:\d{2})/);
  return { day: Number(d), time: tm ? tm[1] : undefined };
}

const emptyEvent = () => ({ title: "", date: "", time: "", place: "", type: "会議" as CalEvent["type"] });

export default function CalendarPage() {
  const store = useStore();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyEvent());

  const storeEvents = useMemo(() => {
    return store.meetings
      .map((m) => {
        const p = parseMeetingDay(m.date);
        return p ? { day: p.day, time: p.time, label: m.title, type: "会議" as const } : null;
      })
      .filter(Boolean) as { day: number; time?: string; label: string; type: CalEvent["type"] }[];
  }, [store.meetings]);

  const eventsFor = (cell: Cell): CalEvent[] => {
    if (cell.scope === "next") return [];
    if (cell.scope === "prev") return calEvents.filter((e) => PREV_DAYS.has(e.day) && e.day === cell.day);
    const staticEvents = calEvents.filter((e) => !PREV_DAYS.has(e.day) && e.day === cell.day);
    const dynamic = storeEvents.filter((e) => e.day === cell.day);
    return [...dynamic, ...staticEvents];
  };

  const dayFivePlus = store.meetings
    .map((m) => ({ m, p: parseMeetingDay(m.date) }))
    .filter(({ p }) => p?.day === 5)
    .map(({ m, p }) => ({ time: p?.time ?? "", title: m.title, place: m.place, tag: m.status, color: "#2563eb" }));

  const openCreate = () => {
    setForm(emptyEvent());
    setCreating(true);
  };

  const saveEvent = () => {
    if (!form.title.trim()) return;
    let dateStr = form.date ? form.date.replace(/-/g, "/") : "";
    if (form.date) {
      const wd = WD[new Date(form.date).getDay()];
      dateStr = `${dateStr} (${wd})${form.time ? ` ${form.time}` : ""}`;
    }
    const meeting: Meeting = {
      id: store.newId("MTG"),
      title: form.title.trim(),
      status: "予定",
      date: dateStr,
      place: form.place,
      purpose: "",
      extra: "",
    };
    store.addMeeting(meeting);
    setCreating(false);
    toast("予定を作成し、会議一覧に追加しました");
  };

  return (
    <div className="mx-auto max-w-[1500px] p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">カレンダー / スケジュール</h1>
          <p className="mt-1 text-sm text-slate-500">
            プロジェクトの会議・イベント・締切・会議体のスケジュールを確認できます。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select className="!h-11 !w-32">
            <option>月表示</option>
            <option>週表示</option>
            <option>日表示</option>
          </Select>
          <GhostButton>
            <IconFilter width={16} height={16} /> フィルター
          </GhostButton>
          <PrimaryButton className="!bg-navy hover:!bg-navy-light" onClick={openCreate}>
            <IconPlus width={16} height={16} /> 新しい予定を作成
          </PrimaryButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <GhostButton className="!py-2">今日</GhostButton>
            <button className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
              <IconChevronLeft width={18} height={18} />
            </button>
            <button className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
              <IconChevronRight width={18} height={18} />
            </button>
            <h2 className="text-lg font-bold text-slate-800">2025 年 6 月</h2>
          </div>

          <div className="grid grid-cols-7 border-b border-slate-100 text-center text-sm font-medium">
            {WEEKDAYS.map((d, i) => (
              <div
                key={d}
                className={`pb-2 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-slate-500"}`}
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {CELLS.map((cell, i) => {
              const evs = eventsFor(cell);
              const isToday = cell.scope === "cur" && cell.day === 5;
              const col = i % 7;
              return (
                <div
                  key={i}
                  className={`min-h-[92px] border-b border-r border-slate-100 p-1.5 ${
                    cell.scope !== "cur" ? "bg-slate-50/40" : ""
                  }`}
                >
                  <div
                    className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      isToday
                        ? "bg-blue-600 font-bold text-white"
                        : cell.scope !== "cur"
                          ? "text-slate-300"
                          : col === 0
                            ? "text-red-400"
                            : col === 6
                              ? "text-blue-400"
                              : "text-slate-600"
                    }`}
                  >
                    {cell.day}
                  </div>
                  <div className="space-y-1">
                    {evs.map((e, j) => (
                      <div
                        key={j}
                        className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLOR[e.type]}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLOR[e.type]}`} />
                        <span className="truncate">
                          {e.time ? `${e.time} ` : ""}
                          {e.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            {(["会議", "部会会議", "提出期限", "理事会"] as CalEvent["type"][]).map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${DOT_COLOR[t]}`} /> {t}
              </span>
            ))}
            <span className="ml-auto text-slate-400">会議一覧と連動して表示</span>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">2025年6月5日 (木) の予定</h3>
              <button className="text-sm font-medium text-blue-600">すべての予定を見る</button>
            </div>
            <div className="mt-4 space-y-3">
              {[...dayFivePlus, ...calDayEvents].map((e, i) => (
                <div
                  key={i}
                  className="rounded-xl border-l-4 bg-slate-50/60 p-3"
                  style={{ borderColor: e.color }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-slate-400">{e.time}</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-800">{e.title}</p>
                      <p className="text-xs text-slate-500">{e.place}</p>
                    </div>
                    <span
                      className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium text-white"
                      style={{ background: e.color }}
                    >
                      {e.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">未完了タスク（{calOpenTasks.length}件）</h3>
              <button className="text-sm font-medium text-blue-600">すべてのタスクを見る</button>
            </div>
            <div className="mt-3 space-y-2">
              {calOpenTasks.map((t, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <span className="h-4 w-4 shrink-0 rounded-full border-2 border-slate-300" />
                  <span className="flex-1 text-sm text-slate-700">{t.title}</span>
                  {t.tag && (
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        t.tag === "期限超過" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {t.tag}
                    </span>
                  )}
                  <span className="w-14 text-right text-xs text-slate-400">{t.date}</span>
                </div>
              ))}
            </div>
            <button
              onClick={openCreate}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
            >
              <IconPlus width={16} height={16} /> 予定を追加
            </button>
          </Card>
        </div>
      </div>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="新しい予定を作成"
        footer={
          <>
            <GhostButton onClick={() => setCreating(false)}>キャンセル</GhostButton>
            <PrimaryButton onClick={saveEvent}>作成</PrimaryButton>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <Field label="タイトル *">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例：イベント部会 定例会議" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="日付">
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
            <Field label="時間">
              <Input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="例：10:00 - 11:00" />
            </Field>
          </div>
          <Field label="場所">
            <Input value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder="例：大会議室A / オンライン" />
          </Field>
          <Field label="種別">
            <FormSelect value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CalEvent["type"] })}>
              <option value="会議">会議</option>
              <option value="部会会議">部会会議</option>
              <option value="理事会">理事会</option>
            </FormSelect>
          </Field>
          <p className="text-xs text-slate-400">
            ※ 2025年6月の予定はカレンダーに表示され、会議一覧にも追加されます。
          </p>
        </div>
      </Modal>
    </div>
  );
}
