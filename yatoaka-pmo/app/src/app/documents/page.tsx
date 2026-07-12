"use client";

import { useState } from "react";
import { docFolders, docList, docDetail as d } from "@/lib/mock";
import { Card, ProgressBar, Tag, Select } from "@/components/ui";
import { FileIcon } from "@/components/FileIcon";
import {
  IconSearch,
  IconPlus,
  IconChevronDown,
  IconChevronRight,
  IconList,
  IconGrid,
  IconDownload,
  IconDots,
  IconSparkles,
  IconThumbUp,
  IconThumbDown,
} from "@/components/icons";

export default function DocumentsPage() {
  const [selected, setSelected] = useState(0);

  return (
    <div className="mx-auto max-w-[1600px] p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-600">
            画面番号：9
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">資料 / ナレッジ管理</h1>
            <p className="text-sm text-slate-500">
              組織の知識を構造化し、必要な情報にすぐアクセスできる「組織の脳みそ」です。
            </p>
          </div>
        </div>
        <span className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
          <span className="text-lg">▲</span> Google Drive 連携中
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr_360px]">
        {/* folders */}
        <Card className="flex flex-col p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">フォルダ</h3>
            <div className="flex gap-1 text-slate-400">
              <IconSearch width={16} height={16} />
              <IconPlus width={16} height={16} />
            </div>
          </div>
          <div className="mt-3 flex-1 space-y-0.5 overflow-y-auto scroll-thin">
            {docFolders.map((f, i) => (
              <button
                key={i}
                className={`flex w-full items-center gap-1.5 rounded-lg py-1.5 pr-2 text-sm hover:bg-slate-50 ${
                  i === 0 ? "font-semibold text-slate-800" : "text-slate-600"
                }`}
                style={{ paddingLeft: f.level * 16 + 8 }}
              >
                {f.level < 2 ? (
                  <IconChevronRight width={14} height={14} className="text-slate-400" />
                ) : (
                  <span className="w-3.5" />
                )}
                <span className="text-amber-500">📁</span>
                <span className="flex-1 truncate text-left">{f.name}</span>
                <span className="text-xs text-slate-400">{f.count}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-600">ストレージ使用状況</p>
            <p className="mt-1 text-xs text-slate-500">
              使用済み <span className="font-bold text-slate-700">{d.storageUsed} GB</span> / {d.storageTotal} GB
            </p>
            <ProgressBar value={(d.storageUsed / d.storageTotal) * 100} className="mt-2" color="bg-blue-500" />
            <p className="mt-1 text-right text-xs text-slate-400">
              {Math.round((d.storageUsed / d.storageTotal) * 100)}%
            </p>
          </div>
        </Card>

        {/* doc list */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">資料一覧</h3>
            <div className="flex items-center gap-1">
              <button className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
                <IconList width={16} height={16} />
              </button>
              <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <IconGrid width={16} height={16} />
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Select className="!h-9 !w-32 !text-xs">
              <option>すべての種類</option>
            </Select>
            <Select className="!h-9 !w-32 !text-xs">
              <option>すべてのタグ</option>
            </Select>
            <Select className="!h-9 !w-40 !text-xs">
              <option>更新日（新しい順）</option>
            </Select>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="py-2 font-medium">名前</th>
                  <th className="py-2 font-medium">種類</th>
                  <th className="py-2 font-medium">更新日</th>
                  <th className="py-2 font-medium">更新者</th>
                </tr>
              </thead>
              <tbody>
                {docList.map((doc, i) => (
                  <tr
                    key={i}
                    onClick={() => setSelected(i)}
                    className={`cursor-pointer border-b border-slate-50 hover:bg-blue-50/40 ${
                      selected === i ? "bg-blue-50/60" : ""
                    }`}
                  >
                    <td className="py-2.5">
                      <div className="flex items-center gap-2.5">
                        <FileIcon kind={doc.kind} size={30} />
                        <div>
                          <p className="font-medium text-slate-700">{doc.name}</p>
                          <Tag className="mt-0.5">{doc.tag}</Tag>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-slate-500">{doc.kind}</td>
                    <td className="py-2.5 text-slate-500">{doc.updated}</td>
                    <td className="py-2.5 text-slate-600">{doc.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
            <span>1 - 10 / 523 件</span>
            <div className="flex items-center gap-1">
              <button className="rounded-lg bg-blue-600 px-3 py-1 text-white">1</button>
              {[2, 3, 4, 5].map((p) => (
                <button key={p} className="rounded-lg px-3 py-1 hover:bg-slate-100">{p}</button>
              ))}
              <span>…</span>
              <button className="rounded-lg px-3 py-1 hover:bg-slate-100">53</button>
              <button className="rounded-lg px-2 py-1 hover:bg-slate-100">›</button>
            </div>
          </div>
        </Card>

        {/* detail */}
        <Card className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <FileIcon kind="pdf" size={34} />
              <div>
                <h3 className="font-bold text-slate-800">{d.name}</h3>
                <div className="mt-1 flex gap-1">
                  {d.tags.map((t) => (
                    <span key={t} className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  更新日：{d.updated}　更新者：{d.updatedBy}
                </p>
              </div>
            </div>
            <button className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">開く</button>
          </div>

          <div className="mt-4 flex gap-4 border-b border-slate-100 text-sm">
            {["詳細情報", "AI要約", "関連資料", "更新履歴", "アクセス権限"].map((t, i) => (
              <button
                key={t}
                className={`pb-2 ${i === 0 ? "border-b-2 border-blue-600 font-semibold text-blue-600" : "text-slate-400"}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-2.5 text-sm">
            <p className="font-semibold text-slate-600">基本情報</p>
            <Info label="ファイル名" value={d.name} />
            <Info label="説明" value={d.desc} />
            <Info label="フォルダ" value={d.folder} />
            <div className="flex gap-3">
              <span className="w-16 shrink-0 text-slate-400">タグ</span>
              <span className="flex flex-wrap gap-1">
                {d.allTags.map((t) => (
                  <span key={t} className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">{t}</span>
                ))}
              </span>
            </div>
            <Info label="サイズ" value={d.size} />
            <Info label="作成日" value={d.created} />
            <Info label="作成者" value={d.author} />
          </div>

          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <IconSparkles width={16} height={16} className="text-blue-500" /> AI要約
              <span className="text-xs font-normal text-slate-400">(Gemini 1.5 Pro)</span>
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
              {d.aiSummary.map((x) => (
                <li key={x} className="flex gap-2">
                  <span className="text-slate-300">•</span>
                  {x}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs text-slate-400">
                要約の評価：
                <IconThumbUp width={15} height={15} />
                <IconThumbDown width={15} height={15} />
              </span>
              <button className="text-xs font-medium text-blue-600">詳しく見る</button>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            AIによる要約は、不正確な情報を含む可能性があります。重要な判断は必ず原本をご確認ください。
          </p>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-16 shrink-0 text-slate-400">{label}</span>
      <span className="text-slate-700">{value}</span>
    </div>
  );
}
