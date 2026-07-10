import Link from "next/link";
import {
  dashboardStats as s,
  todayTasks,
  weekMeetings,
  aiSuggestions,
  bukaiProgress,
  recentDocs,
} from "@/lib/mock";
import {
  Card,
  CardHeader,
  Donut,
  ProgressBar,
  StatusBadge,
  PriorityBadge,
  Avatar,
  Tag,
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

function StatDonut({
  label,
  value,
  done,
  total,
  color,
}: {
  label: string;
  value: number;
  done: number;
  total: number;
  color?: string;
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
      <Link href="/tasks" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600">
        詳細を見る <IconChevronRight width={15} height={15} />
      </Link>
    </Card>
  );
}

function StatCount({
  label,
  value,
  unit,
  sub,
  subValue,
  tone,
  icon,
}: {
  label: string;
  value: number;
  unit: string;
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
            {value} <span className="text-base font-medium text-slate-400">{unit}</span>
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
  return (
    <div className="mx-auto max-w-[1500px] p-4 md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <h1 className="text-xl font-bold text-slate-800">ダッシュボード（ホーム）</h1>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatDonut label="全体進捗率" value={s.overallProgress} done={s.overallDone} total={s.overallTotal} />
        <StatDonut label="イベント部会進捗率" value={s.eventProgress} done={s.eventDone} total={s.eventTotal} color="#2563eb" />
        <StatCount
          label="今週の期限タスク数"
          value={s.dueThisWeek}
          unit="件"
          sub="うち高優先度"
          subValue={s.dueThisWeekHigh}
          tone="blue"
          icon={<IconCalendar width={26} height={26} />}
        />
        <StatCount
          label="期限超過タスク数"
          value={s.overdue}
          unit="件"
          sub="うち高優先度"
          subValue={s.overdueHigh}
          tone="red"
          icon={<IconAlert width={26} height={26} />}
        />
      </div>

      {/* middle row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 今日やること */}
        <Card className="pb-4">
          <CardHeader title="今日やること一覧" />
          <div className="mt-3 divide-y divide-slate-100">
            {todayTasks.map((t, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-slate-800">{t.title}</span>
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

        {/* 今週の会議 */}
        <Card className="pb-4">
          <CardHeader title="今週の会議予定" />
          <div className="mt-3 space-y-1 px-5">
            {weekMeetings.map((m, i) => (
              <div key={i} className="border-b border-slate-100 py-3 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{m.date}</span>
                  <StatusBadge status={m.tag} />
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm text-slate-800">{m.title}</span>
                </div>
                <div className="text-xs text-slate-400">
                  {m.time}　{m.place}
                </div>
              </div>
            ))}
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

      {/* bottom row */}
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
