"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { aiSuggestions, bukaiProgress, recentDocs, todayTasks } from "@/lib/mock";
import { useStore, childrenOf, effectiveProgress, type Task } from "@/lib/store";
import {
  Card,
  CardHeader,
  Donut,
  ProgressBar,
  StatusBadge,
  PriorityBadge,
  Avatar,
} from "@/components/ui";
import { FileIcon } from "@/components/FileIcon";
import {
  IconCalendar,
  IconAlert,
  IconChevronRight,
  IconLightbulb,
  IconUsers,
  IconDoc,
} from "@/components/icons";

/** 試作版の基準日（サンプルデータの期限が 2025 年のため、この日付を「今日」とみなして集計する）。 */
const APP_TODAY = new Date("2025-05-19");
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function parseDate(v: string): Date | null {
  if (!v) return null;
  const d = new Date(v.replace(/\//g, "-"));
  return isNaN(d.getTime()) ? null : d;
}
const isHigh = (t: Task) => t.priority === "高" || t.priority === "最高";
const isOpen = (t: Task) => t.status !== "完了" && t.status !== "中止";

function StatDonut({
  label,
  value,
  done,
  total,
  color,
  href,
}: {
  label: string;
  value: number;
  done: number;
  total: number;
  color?: string;
  href: string;
}) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-bold text-slate-700">{label}</h3>
      <div className="mt-3 flex items-center gap-4">
        <div className="relative shrink-0">
          <Donut value={value} size={104} stroke={13} color={color} />
          <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-800">
            {value}%
          </span>
        </div>
        <div className="text-sm">
          <p className="font-medium text-green-600">計画に対して順調です</p>
          <p className="mt-2 text-slate-500">完了タスク数</p>
          <p className="text-lg font-bold text-slate-800">
            {done} <span className="text-sm font-normal text-slate-400">/ {total}</span>
          </p>
        </div>
      </div>
      <Link href={href} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600">
        詳細を見る <IconChevronRight width={15} height={15} />
      </Link>
    </Card>
  );
}

function StatCount({
  label,
  value,
  sub,
  subValue,
  tone,
  icon,
}: {
  label: string;
  value: number;
  sub: string;
  subValue: number;
  tone: "blue" | "red";
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-bold text-slate-700">{label}</h3>
      <div className="mt-3 flex items-center gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
            tone === "red" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
          }`}
        >
          {icon}
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-800">
            {value} <span className="text-base font-medium text-slate-400">件</span>
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {sub} <span className="font-bold text-red-500">{subValue} 件</span>
          </p>
        </div>
      </div>
      <Link href="/tasks" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600">
        タスク一覧を見る <IconChevronRight width={15} height={15} />
      </Link>
    </Card>
  );
}

const AI_ICON: Record<string, React.ReactNode> = {
  bulb: <IconLightbulb className="text-green-600" />,
  users: <IconUsers className="text-blue-600" />,
  doc: <IconDoc className="text-violet-600" />,
};

export default function DashboardPage() {
  const store = useStore();

  const stats = useMemo(() => {
    const leaves = store.tasks.filter((t) => childrenOf(store.tasks, t.id).length === 0);
    const tops = store.tasks.filter((t) => !t.parentId);
    const total = leaves.length;
    const done = leaves.filter((t) => t.status === "完了").length;
    const overall =
      tops.length === 0 ? 0 : Math.round(tops.reduce((a, t) => a + effectiveProgress(store.tasks, t), 0) / tops.length);
    const completion = total === 0 ? 0 : Math.round((done / total) * 100);

    const overdue = leaves.filter((t) => {
      const d = parseDate(t.due);
      return d && d < APP_TODAY && isOpen(t);
    });
    const thisWeek = leaves.filter((t) => {
      const d = parseDate(t.due);
      return d && d >= APP_TODAY && d.getTime() <= APP_TODAY.getTime() + WEEK_MS && isOpen(t);
    });
    return {
      overall,
      completion,
      done,
      total,
      overdue: overdue.length,
      overdueHigh: overdue.filter(isHigh).length,
      week: thisWeek.length,
      weekHigh: thisWeek.filter(isHigh).length,
    };
  }, [store.tasks]);

  // 今日やること: チェック状態をブラウザに保持
  const [checks, setChecks] = useState<boolean[]>(todayTasks.map(() => false));
  useEffect(() => {
    try {
      const raw = localStorage.getItem("yatoaka-today-checks");
      if (raw) setChecks(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);
  const toggle = (i: number) =>
    setChecks((prev) => {
      const next = prev.map((v, j) => (j === i ? !v : v));
      try {
        localStorage.setItem("yatoaka-today-checks", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });

  const upcomingMeetings = store.meetings.slice(0, 3);

  return (
    <div className="mx-auto max-w-[1500px] p-4 md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <h1 className="text-xl font-bold text-slate-800">ダッシュボード（ホーム）</h1>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-400">
          基準日 2025/05/19（試作）
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatDonut label="全体進捗率" value={stats.overall} done={stats.done} total={stats.total} href="/tasks" />
        <StatDonut label="タスク完了率" value={stats.completion} done={stats.done} total={stats.total} color="#2563eb" href="/tasks" />
        <StatCount
          label="今週の期限タスク数"
          value={stats.week}
          sub="うち高優先度"
          subValue={stats.weekHigh}
          tone="blue"
          icon={<IconCalendar width={26} height={26} />}
        />
        <StatCount
          label="期限超過タスク数"
          value={stats.overdue}
          sub="うち高優先度"
          subValue={stats.overdueHigh}
          tone="red"
          icon={<IconAlert width={26} height={26} />}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 今日やること */}
        <Card className="pb-4">
          <CardHeader title="今日やること一覧" />
          <div className="mt-3 divide-y divide-slate-100">
            {todayTasks.map((t, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={checks[i] ?? false}
                  onChange={() => toggle(i)}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`truncate text-sm font-medium ${checks[i] ? "text-slate-400 line-through" : "text-slate-800"}`}>
                      {t.title}
                    </span>
                    <PriorityBadge level={t.priority} />
                  </div>
                  <div className="text-xs text-slate-400">{t.bukai}</div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <IconCalendar width={14} height={14} />
                  {t.time}
                  <Avatar name={t.assignee} size={26} />
                </div>
              </div>
            ))}
          </div>
          <Link href="/tasks" className="mt-2 flex items-center gap-1 px-5 text-sm font-medium text-blue-600">
            すべてのタスクを見る <IconChevronRight width={15} height={15} />
          </Link>
        </Card>

        {/* 今週の会議予定（ストア連動） */}
        <Card className="pb-4">
          <CardHeader
            title="今週の会議予定"
            action={<span className="text-xs text-slate-400">{store.meetings.length} 件</span>}
          />
          <div className="mt-3 space-y-1 px-5">
            {upcomingMeetings.map((m) => (
              <div key={m.id} className="border-b border-slate-100 py-3 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">{m.title}</span>
                  <StatusBadge status={m.status} />
                </div>
                <div className="text-xs text-slate-400">
                  {m.date}　{m.place}
                </div>
              </div>
            ))}
            {upcomingMeetings.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">会議予定はありません</p>
            )}
          </div>
          <Link href="/meetings" className="mt-2 flex items-center gap-1 px-5 text-sm font-medium text-blue-600">
            すべての会議予定を見る <IconChevronRight width={15} height={15} />
          </Link>
        </Card>

        {/* AI提案 */}
        <Card className="pb-4">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <span className="text-blue-500">✦</span> AIからの提案
              </span>
            }
            action={<Link href="/minutes" className="text-sm font-medium text-blue-600">もっと見る</Link>}
          />
          <div className="mt-3 space-y-3 px-5">
            {aiSuggestions.map((a, i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                    {AI_ICON[a.icon]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">{a.title}</p>
                      <button className="shrink-0 rounded-lg border border-blue-200 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50">
                        {a.action}
                      </button>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{a.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="pb-4">
          <CardHeader title="部会別進捗状況" />
          <div className="mt-3 overflow-x-auto px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400">
                  <th className="pb-2 font-medium">部会名</th>
                  <th className="pb-2 font-medium">進捗率</th>
                  <th className="pb-2 text-right font-medium">完了 / 総タスク</th>
                  <th className="pb-2 pl-4 font-medium">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {bukaiProgress.map((b) => (
                  <tr key={b.name} className="border-t border-slate-100">
                    <td className="py-2.5">
                      <Link href="/reports" className="font-medium text-blue-600">{b.name}</Link>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-9 text-xs font-semibold text-slate-600">{b.progress}%</span>
                        <ProgressBar value={b.progress} className="w-24" color="bg-blue-500" />
                      </div>
                    </td>
                    <td className="py-2.5 text-right text-slate-500">
                      {b.done} / {b.total}
                    </td>
                    <td className="py-2.5 pl-4">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="pb-4">
          <CardHeader title="最近更新された資料" />
          <div className="mt-3 divide-y divide-slate-100">
            {recentDocs.map((d, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <FileIcon kind={d.kind} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{d.name}</p>
                  <p className="text-xs text-slate-400">
                    {d.bukai}　{d.author}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-slate-400">{d.updated}</span>
              </div>
            ))}
          </div>
          <Link href="/documents" className="mt-2 flex items-center gap-1 px-5 text-sm font-medium text-blue-600">
            すべての資料を見る <IconChevronRight width={15} height={15} />
          </Link>
        </Card>
      </div>
    </div>
  );
}
