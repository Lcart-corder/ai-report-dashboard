"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { Project, ProjectStatus, Priority } from "@/lib/mock";
import {
  Card,
  PageTitle,
  ProgressBar,
  StatusBadge,
  PriorityBadge,
  Select,
  PrimaryButton,
  GhostButton,
} from "@/components/ui";
import { Modal } from "@/components/Modal";
import { Field, Input, FormSelect } from "@/components/forms";
import { IconPlus, IconDownload, IconDots, IconSettings, IconEdit, IconTrash } from "@/components/icons";

const STATUSES: ProjectStatus[] = ["未着手", "計画中", "進行中", "保留", "完了", "中止"];
const PRIORITIES: Priority[] = ["最高", "高", "中", "低"];

const emptyProject = (id: string): Project => ({
  id,
  name: "",
  bukai: "イベント部会",
  owner: "",
  start: "",
  due: "",
  progress: 0,
  priority: "中",
  status: "計画中",
  meetings: 0,
  docs: 0,
});

export default function ProjectsPage() {
  const store = useStore();
  const [bukai, setBukai] = useState("すべての部会");
  const [status, setStatus] = useState("すべてのステータス");
  const [editing, setEditing] = useState<Project | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const bukaiList = useMemo(
    () => ["すべての部会", ...Array.from(new Set(store.projects.map((p) => p.bukai)))],
    [store.projects]
  );

  const filtered = store.projects.filter(
    (p) =>
      (bukai === "すべての部会" || p.bukai === bukai) &&
      (status === "すべてのステータス" || p.status === status)
  );

  const openCreate = () => setEditing(emptyProject(store.newId("PJ")));
  const openEdit = (p: Project) => {
    setMenuOpen(null);
    setEditing({ ...p });
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) return;
    const exists = store.projects.some((p) => p.id === editing.id);
    if (exists) store.updateProject(editing);
    else store.addProject(editing);
    setEditing(null);
  };

  return (
    <div className="mx-auto max-w-[1500px] p-4 md:p-6" onClick={() => setMenuOpen(null)}>
      <PageTitle title="プロジェクト一覧" badge="画面番号：2" />

      <Card className="mb-4 p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">部会フィルタ</label>
            <Select value={bukai} onChange={(e) => setBukai(e.target.value)}>
              {bukaiList.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">状態フィルタ</label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {["すべてのステータス", ...STATUSES].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">担当者フィルタ</label>
            <Select defaultValue="すべての担当者">
              <option>すべての担当者</option>
              {Array.from(new Set(store.projects.map((p) => p.owner))).map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </div>
          <div className="flex items-end justify-end gap-2">
            <GhostButton
              onClick={() => {
                setBukai("すべての部会");
                setStatus("すべてのステータス");
              }}
            >
              フィルタをクリア
            </GhostButton>
            <PrimaryButton onClick={openCreate}>
              <IconPlus width={16} height={16} /> プロジェクト作成
            </PrimaryButton>
          </div>
        </div>
      </Card>

      <Card className="overflow-visible">
        <div className="flex items-center justify-between px-5 py-3">
          <span />
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>全 {filtered.length} 件</span>
            <GhostButton className="!py-2">
              <IconDownload width={16} height={16} /> エクスポート
            </GhostButton>
            <button className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
              <IconSettings width={16} height={16} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60 text-left text-xs text-slate-500">
                <th className="px-5 py-3 font-medium">プロジェクト名</th>
                <th className="px-3 py-3 font-medium">所属部会</th>
                <th className="px-3 py-3 font-medium">責任者</th>
                <th className="px-3 py-3 font-medium">開始日</th>
                <th className="px-3 py-3 font-medium">期限</th>
                <th className="px-3 py-3 font-medium">進捗率</th>
                <th className="px-3 py-3 font-medium">優先度</th>
                <th className="px-3 py-3 font-medium">ステータス</th>
                <th className="px-3 py-3 text-center font-medium">関連会議数</th>
                <th className="px-3 py-3 text-center font-medium">関連資料数</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <Link href={`/projects/${p.id}`} className="font-semibold text-blue-600 hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3.5 text-slate-600">{p.bukai}</td>
                  <td className="px-3 py-3.5 text-slate-600">{p.owner}</td>
                  <td className="px-3 py-3.5 text-slate-500">{p.start || "—"}</td>
                  <td className="px-3 py-3.5 text-slate-500">{p.due || "—"}</td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="w-9 text-xs font-semibold text-slate-600">{p.progress}%</span>
                      <ProgressBar value={p.progress} className="w-20" />
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <PriorityBadge level={p.priority} />
                  </td>
                  <td className="px-3 py-3.5">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-3 py-3.5 text-center text-slate-600">{p.meetings}</td>
                  <td className="px-3 py-3.5 text-center text-slate-600">{p.docs}</td>
                  <td className="relative px-3 py-3.5 text-slate-400">
                    <button
                      className="rounded p-1 hover:bg-slate-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === p.id ? null : p.id);
                      }}
                    >
                      <IconDots width={16} height={16} />
                    </button>
                    {menuOpen === p.id && (
                      <div
                        className="absolute right-6 top-9 z-20 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => openEdit(p)}
                        >
                          <IconEdit width={15} height={15} /> 編集
                        </button>
                        <button
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          onClick={() => {
                            store.deleteProject(p.id);
                            setMenuOpen(null);
                          }}
                        >
                          <IconTrash width={15} height={15} /> 削除
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-5 py-10 text-center text-sm text-slate-400">
                    該当するプロジェクトがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 text-sm text-slate-500">
          <span>
            1 - {filtered.length} / {filtered.length} 件
          </span>
        </div>
      </Card>

      {/* Create / Edit modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing && store.projects.some((p) => p.id === editing.id) ? "プロジェクトを編集" : "プロジェクトを作成"}
        footer={
          <>
            <GhostButton onClick={() => setEditing(null)}>キャンセル</GhostButton>
            <PrimaryButton onClick={save}>保存</PrimaryButton>
          </>
        }
      >
        {editing && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="プロジェクト名 *" className="sm:col-span-2">
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="例：キックオフイベント運営"
              />
            </Field>
            <Field label="所属部会">
              <Input value={editing.bukai} onChange={(e) => setEditing({ ...editing, bukai: e.target.value })} />
            </Field>
            <Field label="責任者">
              <Input value={editing.owner} onChange={(e) => setEditing({ ...editing, owner: e.target.value })} placeholder="例：山田 太郎" />
            </Field>
            <Field label="開始日">
              <Input type="date" value={toDateInput(editing.start)} onChange={(e) => setEditing({ ...editing, start: fromDateInput(e.target.value) })} />
            </Field>
            <Field label="期限">
              <Input type="date" value={toDateInput(editing.due)} onChange={(e) => setEditing({ ...editing, due: fromDateInput(e.target.value) })} />
            </Field>
            <Field label="優先度">
              <FormSelect value={editing.priority} onChange={(e) => setEditing({ ...editing, priority: e.target.value as Priority })}>
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </FormSelect>
            </Field>
            <Field label="ステータス">
              <FormSelect value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as ProjectStatus })}>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </FormSelect>
            </Field>
            <Field label={`進捗率（${editing.progress}%）`} className="sm:col-span-2">
              <input
                type="range"
                min={0}
                max={100}
                value={editing.progress}
                onChange={(e) => setEditing({ ...editing, progress: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* date helpers: mock uses YYYY/MM/DD, <input type=date> uses YYYY-MM-DD */
function toDateInput(v: string): string {
  return v ? v.replace(/\//g, "-") : "";
}
function fromDateInput(v: string): string {
  return v ? v.replace(/-/g, "/") : "";
}
