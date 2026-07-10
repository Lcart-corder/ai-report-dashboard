"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import type { Project, ProjectStatus, Priority } from "@/lib/mock";
import { Modal } from "@/components/Modal";
import { Field, Input, FormSelect } from "@/components/forms";
import { PrimaryButton, GhostButton } from "@/components/ui";

const STATUSES: ProjectStatus[] = ["未着手", "計画中", "進行中", "保留", "完了", "中止"];
const PRIORITIES: Priority[] = ["最高", "高", "中", "低"];

const toDateInput = (v: string) => (v ? v.replace(/\//g, "-") : "");
const fromDateInput = (v: string) => (v ? v.replace(/-/g, "/") : "");

export function ProjectFormModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: Project | null;
  onClose: () => void;
  onSaved?: (p: Project) => void;
}) {
  const store = useStore();
  const [draft, setDraft] = useState<Project | null>(initial);

  useEffect(() => {
    setDraft(initial);
  }, [initial]);

  if (!draft) return null;

  const isEdit = store.projects.some((p) => p.id === draft.id);

  const save = () => {
    if (!draft.name.trim()) return;
    if (isEdit) store.updateProject(draft);
    else store.addProject(draft);
    onSaved?.(draft);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "プロジェクトを編集" : "プロジェクトを作成"}
      footer={
        <>
          <GhostButton onClick={onClose}>キャンセル</GhostButton>
          <PrimaryButton onClick={save}>保存</PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="プロジェクト名 *" className="sm:col-span-2">
          <Input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="例：キックオフイベント運営"
          />
        </Field>
        <Field label="所属部会">
          <Input value={draft.bukai} onChange={(e) => setDraft({ ...draft, bukai: e.target.value })} />
        </Field>
        <Field label="責任者">
          <Input value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} placeholder="例：山田 太郎" />
        </Field>
        <Field label="開始日">
          <Input type="date" value={toDateInput(draft.start)} onChange={(e) => setDraft({ ...draft, start: fromDateInput(e.target.value) })} />
        </Field>
        <Field label="期限">
          <Input type="date" value={toDateInput(draft.due)} onChange={(e) => setDraft({ ...draft, due: fromDateInput(e.target.value) })} />
        </Field>
        <Field label="優先度">
          <FormSelect value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}>
            {PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </FormSelect>
        </Field>
        <Field label="ステータス">
          <FormSelect value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as ProjectStatus })}>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </FormSelect>
        </Field>
        <Field label={`進捗率（${draft.progress}%）`} className="sm:col-span-2">
          <input
            type="range"
            min={0}
            max={100}
            value={draft.progress}
            onChange={(e) => setDraft({ ...draft, progress: Number(e.target.value) })}
            className="w-full accent-blue-600"
          />
        </Field>
      </div>
    </Modal>
  );
}

export const emptyProject = (id: string): Project => ({
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
