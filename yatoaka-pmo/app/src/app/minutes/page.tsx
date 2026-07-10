"use client";

import { useState } from "react";
import { minutesAI as d } from "@/lib/mock";
import { useStore, childrenOf, type Task } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { Card, PriorityBadge, PrimaryButton, GhostButton } from "@/components/ui";
import type { Priority } from "@/lib/mock";
import {
  IconUpload,
  IconChevronLeft,
  IconCopy,
  IconChat,
  IconCheck,
  IconLightbulb,
  IconSparkles,
  IconChevronDown,
  IconCalendar,
  IconPlus,
} from "@/components/icons";

export default function MinutesPage() {
  const store = useStore();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  // 新規タスク候補の確認状態
  const [taskChk, setTaskChk] = useState<boolean[]>(d.newTasks.map(() => true));
  const [taskReg, setTaskReg] = useState<boolean[]>(d.newTasks.map(() => false));
  const [wbsDone, setWbsDone] = useState(false);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(d.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const nextTopCode = () => {
    const tops = store.tasks.filter((t) => !t.parentId);
    return tops.reduce((m, t) => Math.max(m, Number(t.code) || 0), 0);
  };

  const registerTasks = () => {
    const targets = d.newTasks
      .map((t, i) => ({ t, i }))
      .filter(({ i }) => taskChk[i] && !taskReg[i]);
    if (targets.length === 0) {
      toast("登録するタスクを選択してください");
      return;
    }
    let base = nextTopCode();
    targets.forEach(({ t, i }) => {
      base += 1;
      const task: Task = {
        id: store.newId("t"),
        code: String(base),
        name: t.name,
        level: 0,
        owner: d.assignees[i] ?? "",
        start: "",
        due: d.dueDates[i] ?? "",
        priority: t.priority as Priority,
        status: "未着手",
        progress: 0,
        comments: 0,
        desc: t.desc,
      };
      store.addTask(task);
    });
    setTaskReg((prev) => prev.map((v, i) => (taskChk[i] ? true : v)));
    toast(`${targets.length}件のタスクをWBSに登録しました`);
  };

  const applyWbs = () => {
    const additions = d.wbsUpdates.filter((w) => w.change === "新規追加");
    additions.forEach((w) => {
      const parentCode = w.code.includes(".") ? w.code.split(".").slice(0, -1).join(".") : undefined;
      const parentExists = !!parentCode && store.tasks.some((t) => t.id === parentCode);
      const task: Task = {
        id: store.newId("t"),
        code: w.code,
        name: w.name,
        level: (Math.min(2, w.code.split(".").length - 1)) as 0 | 1 | 2,
        owner: "",
        start: "",
        due: "",
        priority: w.priority as Priority,
        status: "未着手",
        progress: 0,
        comments: 0,
        parentId: parentExists ? parentCode : undefined,
      };
      store.addTask(task);
    });
    setWbsDone(true);
    toast(`WBS更新候補 ${additions.length}件を反映しました`);
  };

  const selectedCount = taskChk.filter((c, i) => c && !taskReg[i]).length;

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

          {/* 新規タスク候補 — 確認して登録 */}
          <div className="mt-4 rounded-xl border border-slate-100 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <IconSparkles width={16} height={16} className="text-blue-500" /> 新規タスク候補（{d.newTasks.length}件）
              </h4>
              <span className="text-xs text-slate-400">確認して登録</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                    <th className="w-8 py-2" />
                    <th className="py-2 font-medium">タスク名（候補）</th>
                    <th className="py-2 font-medium">担当者候補</th>
                    <th className="py-2 text-center font-medium">優先度</th>
                    <th className="py-2 text-right font-medium">状態</th>
                  </tr>
                </thead>
                <tbody>
                  {d.newTasks.map((t, i) => (
                    <tr key={t.name} className="border-b border-slate-50">
                      <td className="py-2">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-slate-300"
                          checked={taskChk[i]}
                          disabled={taskReg[i]}
                          onChange={(e) =>
                            setTaskChk((prev) => prev.map((v, j) => (j === i ? e.target.checked : v)))
                          }
                        />
                      </td>
                      <td className="py-2 pr-2 font-medium text-slate-700">{t.name}</td>
                      <td className="py-2 pr-2 text-slate-500">{d.assignees[i] ?? "—"}</td>
                      <td className="py-2 text-center">
                        <PriorityBadge level={t.priority} />
                      </td>
                      <td className="py-2 text-right">
                        {taskReg[i] ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                            <IconCheck width={12} height={12} /> 登録済み
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">未登録</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex justify-end">
              <PrimaryButton onClick={registerTasks} disabled={selectedCount === 0} className={selectedCount === 0 ? "!bg-slate-300" : ""}>
                <IconPlus width={15} height={15} /> 選択したタスクをWBSに登録{selectedCount > 0 ? `（${selectedCount}）` : ""}
              </PrimaryButton>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <pre className="mt-2 max-h-[320px] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 scroll-thin">
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
            <div className="mt-3 flex justify-end">
              {wbsDone ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                  <IconCheck width={13} height={13} /> WBSへ反映済み
                </span>
              ) : (
                <GhostButton className="!py-1.5 !text-blue-600" onClick={applyWbs}>
                  <IconPlus width={15} height={15} /> WBS更新候補を反映
                </GhostButton>
              )}
            </div>
          </Card>
        </div>
      </div>

      <p className="mt-4 text-right text-xs text-slate-400">
        最終更新：2025/05/20 11:45　|　AI抽出：GPT-4o　|　登録先：WBS / タスク管理
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
