"use client";

import { useState } from "react";
import { minutesAI as d } from "@/lib/mock";
import { Card, PriorityBadge, PrimaryButton, GhostButton } from "@/components/ui";
import {
  IconUpload,
  IconChevronLeft,
  IconCopy,
  IconChat,
  IconCheck,
  IconLightbulb,
  IconAlert,
  IconSparkles,
  IconChevronDown,
  IconUsers,
  IconCalendar,
} from "@/components/icons";

export default function MinutesPage() {
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(d.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">議事録整理 / AI支援</h1>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-600">
            画面番号: 7
          </span>
        </div>
        <div className="flex gap-2">
          <GhostButton>
            <IconChevronLeft width={16} height={16} /> 議事録一覧に戻る
          </GhostButton>
          <PrimaryButton className="!bg-navy hover:!bg-navy-light">
            <IconUpload width={16} height={16} /> 新しい議事録をアップロード
          </PrimaryButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* 議事録本文 */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">議事録本文</h3>
            <GhostButton className="!py-1.5 !text-xs">ファイル情報</GhostButton>
          </div>
          <div className="mt-4 space-y-1 border-b border-slate-100 pb-4 text-sm">
            <InfoLine label="会議名" value={d.meetingName} />
            <InfoLine label="開催日時" value={d.date} />
            <InfoLine label="場所" value={d.place} />
            <InfoLine label="参加者" value={d.attendees} />
          </div>
          <div className="mt-4 space-y-4 text-sm">
            {d.body.map((sec) => (
              <div key={sec.head}>
                <p className="font-bold text-slate-700">{sec.head}</p>
                <div className="mt-1 space-y-1 text-slate-600">
                  {sec.lines.map((l, i) => (
                    <p key={i} className="leading-relaxed">{l}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI抽出結果 */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">AI抽出結果</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
              AIモデル：GPT-4o
            </span>
          </div>

          <Section icon={<IconChat width={16} height={16} className="text-violet-500" />} title="要約">
            <p className="text-sm leading-relaxed text-slate-600">{d.summary}</p>
          </Section>

          <Section icon={<IconCheck width={16} height={16} className="text-green-500" />} title={`決定事項（${d.decisions.length}件）`}>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
              {d.decisions.map((x) => <li key={x}>{x}</li>)}
            </ol>
          </Section>

          <Section icon={<IconLightbulb width={16} height={16} className="text-amber-500" />} title={`未決定事項（${d.undecided.length}件）`}>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
              {d.undecided.map((x) => <li key={x}>{x}</li>)}
            </ol>
          </Section>

          <Section icon={<IconSparkles width={16} height={16} className="text-blue-500" />} title={`新規タスク候補（${d.newTasks.length}件）`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                    <th className="py-2 font-medium">タスク名（候補）</th>
                    <th className="py-2 font-medium">概要</th>
                    <th className="py-2 text-center font-medium">優先度</th>
                  </tr>
                </thead>
                <tbody>
                  {d.newTasks.map((t) => (
                    <tr key={t.name} className="border-b border-slate-50">
                      <td className="py-2 pr-2 font-medium text-slate-700">{t.name}</td>
                      <td className="py-2 pr-2 text-slate-500">{t.desc}</td>
                      <td className="py-2 text-center">
                        <PriorityBadge level={t.priority} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MiniCard icon={<IconUsers width={14} height={14} className="text-blue-500" />} title="担当者候補">
              {d.assignees.map((a) => <p key={a} className="text-slate-600">{a}</p>)}
            </MiniCard>
            <MiniCard icon={<IconCalendar width={14} height={14} className="text-violet-500" />} title="期限候補">
              {d.dueDates.map((a) => <p key={a} className="text-slate-600">〜 {a}</p>)}
            </MiniCard>
            <MiniCard icon={<IconChat width={14} height={14} className="text-slate-500" />} title="次回アジェンダ候補">
              {d.nextAgenda.map((a) => <p key={a} className="text-slate-600">• {a}</p>)}
            </MiniCard>
          </div>
        </Card>

        {/* ChatGPT用出力 + WBS更新候補 */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">ChatGPT用出力（整形済みプロンプト）</h3>
              <button
                onClick={copyPrompt}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <IconCopy width={14} height={14} /> {copied ? "コピーしました" : "コピー"}
              </button>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-600">プロンプト（整形済み）</p>
            <pre className="mt-2 max-h-[360px] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 scroll-thin">
{d.prompt}
            </pre>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">WBS更新候補</h3>
              <button className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                <IconCopy width={14} height={14} /> コピー
              </button>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                    <th className="py-2 font-medium">WBSコード</th>
                    <th className="py-2 font-medium">タスク名（候補）</th>
                    <th className="py-2 font-medium">更新内容</th>
                    <th className="py-2 text-center font-medium">優先度</th>
                  </tr>
                </thead>
                <tbody>
                  {d.wbsUpdates.map((w) => (
                    <tr key={w.code} className="border-b border-slate-50">
                      <td className="py-2 font-mono text-slate-600">{w.code}</td>
                      <td className="py-2 pr-2 text-slate-700">{w.name}</td>
                      <td className="py-2">
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                            w.change === "更新" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"
                          }`}
                        >
                          {w.change}
                        </span>
                      </td>
                      <td className="py-2 text-center">
                        <PriorityBadge level={w.priority} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <p className="mt-4 text-right text-xs text-slate-400">
        最終更新：2025/05/20 11:45　|　AI抽出：GPT-4o
      </p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-16 shrink-0 font-semibold text-slate-500">{label}</span>
      <span className="text-slate-700">{value}</span>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 rounded-xl border border-slate-100 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700">
          {icon} {title}
        </h4>
        <IconChevronDown width={16} height={16} className="text-slate-300" />
      </div>
      {children}
    </div>
  );
}

function MiniCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">
      <h5 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-600">
        {icon} {title}
      </h5>
      <div className="space-y-0.5 text-xs">{children}</div>
    </div>
  );
}
