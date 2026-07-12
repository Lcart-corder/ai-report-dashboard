import { reportData as r } from "@/lib/mock";
import { Card, ProgressBar, Avatar, PrimaryButton, Select } from "@/components/ui";
import {
  IconChart,
  IconClock,
  IconDoc,
  IconUsers,
  IconDownload,
  IconTrophy,
  IconAlert,
  IconTarget,
  IconChevronRight,
  IconSparkles,
} from "@/components/icons";

function TrendChart() {
  const w = 520;
  const h = 240;
  const padL = 36;
  const padB = 28;
  const padT = 10;
  const maxV = 100;
  const pts = r.trend;
  const x = (i: number) => padL + (i * (w - padL - 10)) / (pts.length - 1);
  const y = (v: number) => padT + (1 - v / maxV) * (h - padT - padB);
  const line = (key: "plan" | "actual") =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p[key])}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1={padL} y1={y(g)} x2={w - 10} y2={y(g)} stroke="#eef2f7" />
          <text x={padL - 6} y={y(g) + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
            {g}%
          </text>
        </g>
      ))}
      <path d={line("plan")} fill="none" stroke="#2563eb" strokeWidth={2.4} />
      <path d={line("actual")} fill="none" stroke="#2563eb" strokeWidth={2} strokeDasharray="5 4" opacity={0.7} />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.plan)} r={3.2} fill="#2563eb" />
          <circle cx={x(i)} cy={y(p.actual)} r={3} fill="#fff" stroke="#2563eb" strokeWidth={1.6} />
          <text x={x(i)} y={h - 10} textAnchor="middle" fontSize="9" fill="#94a3b8">
            {p.month}
          </text>
        </g>
      ))}
    </svg>
  );
}

function StatTile({
  icon,
  label,
  value,
  unit,
  delta,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  delta: string;
  tone: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${tone}`}>{icon}</div>
        <div className="flex-1">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-800">
            {value}
            <span className="text-sm font-medium text-slate-400">{unit}</span>
          </p>
        </div>
        <div className="text-right text-xs text-slate-400">
          <p>前月比</p>
          <p className="font-semibold text-slate-600">{delta}</p>
        </div>
      </div>
    </Card>
  );
}

function ListCard({
  icon,
  title,
  items,
  ordered,
  link,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  ordered?: boolean;
  link: string;
}) {
  const List = ordered ? "ol" : "ul";
  return (
    <Card className="p-5">
      <h3 className="flex items-center gap-2 font-bold text-slate-800">
        {icon} {title}
      </h3>
      <List className={`mt-3 space-y-1.5 text-sm text-slate-600 ${ordered ? "list-decimal pl-5" : ""}`}>
        {items.map((x) => (
          <li key={x} className={ordered ? "" : "flex gap-2"}>
            {!ordered && <span className="text-slate-300">•</span>}
            {x}
          </li>
        ))}
      </List>
      <button className="mt-3 flex w-full items-center justify-center gap-1 text-sm font-medium text-blue-600">
        {link} <IconChevronRight width={14} height={14} />
      </button>
    </Card>
  );
}

export default function ReportsPage() {
  return (
    <div className="mx-auto max-w-[1500px] p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">部会レポート / 進捗分析</h1>
          <p className="mt-1 text-sm text-slate-500">
            部会の活動状況を多角的に分析し、経営判断に役立つインサイトを提供します。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select className="!h-11 !w-48">
            <option>{r.period}</option>
          </Select>
          <PrimaryButton className="!bg-navy hover:!bg-navy-light">
            <IconDownload width={16} height={16} /> レポート出力
          </PrimaryButton>
        </div>
      </div>

      {/* bukai select bar */}
      <Card className="mb-4 flex flex-wrap items-center gap-4 p-4">
        <span className="text-sm font-medium text-slate-500">部会選択</span>
        <Select className="!h-10 !w-64">
          <option>{r.bukai}</option>
        </Select>
        <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">部会長</span>
        <span className="text-sm text-slate-700">{r.leader}</span>
        <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">副部会長</span>
        <span className="text-sm text-slate-700">{r.subLeader}</span>
      </Card>

      {/* stat tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={<IconChart width={22} height={22} className="text-white" />} label="全体進捗率" value={`${r.stats.progress}`} unit="%" delta={r.stats.progressDelta} tone="bg-blue-500" />
        <StatTile icon={<IconClock width={22} height={22} className="text-white" />} label="期限超過件数" value={`${r.stats.overdue}`} unit="件" delta={r.stats.overdueDelta} tone="bg-red-400" />
        <StatTile icon={<IconDoc width={22} height={22} className="text-white" />} label="未着手件数" value={`${r.stats.notStarted}`} unit="件" delta={r.stats.notStartedDelta} tone="bg-amber-400" />
        <StatTile icon={<IconUsers width={22} height={22} className="text-white" />} label="会議数（今月）" value={`${r.stats.meetings}`} unit="回" delta={r.stats.meetingsDelta} tone="bg-emerald-400" />
      </div>

      {/* middle: chart + member + AI */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="font-bold text-slate-800">進捗状況の推移</h3>
          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-5 bg-blue-600" /> 計画進捗率
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-5 border-t-2 border-dashed border-blue-600" /> 実績進捗率
            </span>
          </div>
          <div className="mt-3">
            <TrendChart />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-slate-800">担当者別 進捗状況</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="py-2 font-medium">担当者</th>
                  <th className="py-2 text-center font-medium">担当</th>
                  <th className="py-2 text-center font-medium">完了</th>
                  <th className="py-2 font-medium">進捗率</th>
                </tr>
              </thead>
              <tbody>
                {r.members.map((m) => (
                  <tr key={m.name} className="border-b border-slate-50">
                    <td className="py-2.5">
                      <span className="flex items-center gap-2">
                        <Avatar name={m.name} size={26} />
                        <span className="text-slate-700">{m.name}</span>
                      </span>
                    </td>
                    <td className="py-2.5 text-center text-slate-600">{m.tasks}</td>
                    <td className="py-2.5 text-center text-slate-600">{m.done}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-12 text-xs font-semibold text-slate-600">{m.progress}%</span>
                        <ProgressBar value={m.progress} className="w-14" />
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-100 font-bold">
                  <td className="py-2.5 text-slate-800">全体</td>
                  <td className="py-2.5 text-center text-slate-800">{r.memberTotal.tasks}</td>
                  <td className="py-2.5 text-center text-slate-800">{r.memberTotal.done}</td>
                  <td className="py-2.5 text-slate-800">{r.memberTotal.progress}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="flex items-center gap-2 font-bold text-slate-800">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-xs font-bold text-blue-600">AI</span>
            AI分析コメント
          </h3>
          <AiSection title="総合評価" icon="◈" color="text-blue-500">
            <p className="text-sm leading-relaxed text-slate-600">{r.ai.overall}</p>
          </AiSection>
          <AiSection title="良好な点" icon="✔" color="text-green-500">
            <ul className="space-y-1 text-sm text-slate-600">
              {r.ai.good.map((x) => <li key={x} className="flex gap-2"><span className="text-slate-300">•</span>{x}</li>)}
            </ul>
          </AiSection>
          <AiSection title="注意すべき点" icon="⚠" color="text-amber-500">
            <ul className="space-y-1 text-sm text-slate-600">
              {r.ai.caution.map((x) => <li key={x} className="flex gap-2"><span className="text-slate-300">•</span>{x}</li>)}
            </ul>
          </AiSection>
          <AiSection title="改善提案" icon="◎" color="text-blue-500">
            <ul className="space-y-1 text-sm text-slate-600">
              {r.ai.improve.map((x) => <li key={x} className="flex gap-2"><span className="text-slate-300">•</span>{x}</li>)}
            </ul>
          </AiSection>
          <AiSection title="次月の見通し" icon="◷" color="text-slate-400">
            <p className="text-sm leading-relaxed text-slate-600">{r.ai.outlook}</p>
          </AiSection>
        </Card>
      </div>

      {/* bottom */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ListCard icon={<IconTrophy width={18} height={18} className="text-green-500" />} title="今月の成果" items={r.achievements} link="成果の詳細を見る" />
        <ListCard icon={<IconAlert width={18} height={18} className="text-amber-500" />} title="今月の課題" items={r.problems} link="課題の詳細を見る" />
        <ListCard icon={<IconTarget width={18} height={18} className="text-blue-500" />} title="来月の重点項目" items={r.nextFocus} ordered link="重点項目の詳細を見る" />
      </div>
    </div>
  );
}

function AiSection({
  title,
  icon,
  color,
  children,
}: {
  title: string;
  icon: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <p className={`flex items-center gap-1.5 text-sm font-bold text-slate-700`}>
        <span className={color}>{icon}</span> {title}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
