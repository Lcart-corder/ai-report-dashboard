import Link from "next/link";
import { projectDetail as d, projects } from "@/lib/mock";
import {
  Card,
  CardHeader,
  ProgressBar,
  StatusBadge,
  Avatar,
  PriorityBadge,
  GhostButton,
} from "@/components/ui";
import {
  IconEdit,
  IconDots,
  IconCalendar,
  IconChevronRight,
  IconAlert,
  IconSparkles,
  IconUsers,
  IconChat,
} from "@/components/icons";

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-3 border-b border-slate-100 py-3.5 last:border-0">
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className="text-sm text-slate-700">{children}</div>
    </div>
  );
}

const ISSUE_ICON: Record<string, React.ReactNode> = {
  alert: <IconAlert width={16} height={16} className="text-red-500" />,
  warn: <IconAlert width={16} height={16} className="text-amber-500" />,
  info: <IconChat width={16} height={16} className="text-blue-400" />,
};

export default function ProjectDetailPage() {
  return (
    <div className="mx-auto max-w-[1500px] p-4 md:p-6">
      {/* breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600">ホーム</Link>
        <IconChevronRight width={14} height={14} />
        <Link href="/projects" className="hover:text-slate-600">プロジェクト一覧</Link>
        <IconChevronRight width={14} height={14} />
        <span className="font-medium text-slate-600">プロジェクト詳細</span>
      </nav>

      {/* header card */}
      <Card className="mb-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <StatusBadge status={d.status} />
            <h1 className="mt-2 text-3xl font-bold text-slate-800">{d.name}</h1>
          </div>
          <div className="flex gap-2">
            <GhostButton>
              <IconEdit width={16} height={16} /> 編集
            </GhostButton>
            <button className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50">
              <IconDots width={18} height={18} />
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm text-slate-400">進捗率</p>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-3xl font-bold text-slate-800">{d.progress}%</span>
              <ProgressBar value={d.progress} className="w-full max-w-[220px]" />
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-400">責任者</p>
            <div className="mt-1 flex items-center gap-2">
              <Avatar name={d.owner} size={34} />
              <div>
                <p className="text-sm font-semibold text-slate-800">{d.owner}</p>
                <p className="text-xs text-slate-400">{d.ownerTitle}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-400">期限</p>
            <div className="mt-1 flex items-center gap-2">
              <IconCalendar width={20} height={20} className="text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-800">{d.due} まで</p>
                <p className="text-xs font-medium text-red-500">残り {d.daysLeft}日</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* left: info + parent tasks */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="px-5 py-2">
            <Row label="概要">{d.summary}</Row>
            <Row label="目的">{d.purpose}</Row>
            <Row label="対象者">{d.target}</Row>
            <Row label="予算">
              <div className="flex items-center justify-between">
                <span>{d.budget}</span>
                <GhostButton className="!py-1.5">予算詳細</GhostButton>
              </div>
            </Row>
            <Row label="KPI">
              <ul className="list-disc space-y-0.5 pl-4">
                {d.kpi.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </Row>
            <Row label="中期目標">{d.midterm}</Row>
          </Card>

          <Card className="pb-4">
            <CardHeader title="親タスク進捗一覧" action={<Link href="/tasks" className="text-sm font-medium text-blue-600">すべて表示</Link>} />
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-y border-slate-100 text-left text-xs text-slate-400">
                    <th className="px-5 py-2 font-medium">タスク名</th>
                    <th className="px-3 py-2 font-medium">進捗率</th>
                    <th className="px-3 py-2 font-medium">担当者</th>
                    <th className="px-3 py-2 font-medium">期限</th>
                    <th className="px-3 py-2 font-medium">ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  {d.parentTasks.map((t) => (
                    <tr key={t.name} className="border-b border-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-700">{t.name}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-9 text-xs font-semibold text-slate-600">{t.progress}%</span>
                          <ProgressBar value={t.progress} className="w-16" />
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{t.owner}</td>
                      <td className="px-3 py-3 text-slate-500">{t.due}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* right: meeting, stakeholders, issues, AI */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">最新会議</h3>
              <Link href="/meetings" className="text-sm font-medium text-blue-600">すべて表示</Link>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="font-semibold text-slate-800">{d.latestMeeting.title}</span>
              <StatusBadge status={d.latestMeeting.tag} />
            </div>
            <p className="mt-1 text-xs text-slate-400">{d.latestMeeting.date}</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="shrink-0 text-slate-400">出席者</dt>
                <dd className="text-slate-600">{d.latestMeeting.attendees}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 text-slate-400">議題</dt>
                <dd className="text-slate-600">{d.latestMeeting.topics}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 text-slate-400">次回予定</dt>
                <dd className="text-slate-600">{d.latestMeeting.next}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold text-slate-800">
                <IconUsers width={18} height={18} className="text-slate-400" /> 関連ステークホルダー
              </h3>
              <Link href="/stakeholders" className="text-sm font-medium text-blue-600">すべて表示</Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              {d.stakeholders.map((s) => (
                <div key={s.name} className="flex w-20 flex-col items-center text-center">
                  <Avatar name={s.name} size={40} />
                  <p className="mt-1 text-xs font-semibold text-slate-700">{s.name}</p>
                  <p className="text-[10px] text-slate-400">{s.dept}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">注意課題</h3>
              <Link href="/projects" className="text-sm font-medium text-blue-600">すべて表示</Link>
            </div>
            <div className="mt-3 space-y-3">
              {d.issues.map((it, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5">{ISSUE_ICON[it.icon]}</span>
                  <p className="flex-1 text-sm text-slate-700">{it.text}</p>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <PriorityBadge level={it.level} />
                    <span className="text-[11px] text-slate-400">{it.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50 p-5">
            <h3 className="flex items-center gap-2 font-bold text-slate-800">
              <IconSparkles width={18} height={18} className="text-blue-500" /> AIコメント
              <span className="text-xs font-normal text-slate-400">（推奨アクション）</span>
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{d.aiComment}</p>
            <div className="mt-3 flex justify-end">
              <GhostButton className="!py-1.5">詳細を確認</GhostButton>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
