/**
 * GAS Web App クライアント。
 *
 * NEXT_PUBLIC_GAS_URL が設定されている場合のみ「リモートモード」で動作し、
 * データを Google Apps Script（スプレッドシート）と同期する。
 * 未設定の場合はローカル（localStorage）モードのまま動作する。
 *
 * 注意（CORS）: GAS Web App への POST は、プリフライトを避けるため
 * Content-Type: text/plain で送信する（GAS 側は本文を JSON として解釈）。
 */
import type { Project } from "./mock";
import type { Task, Meeting } from "./store";

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || "";

export const isRemote = (): boolean => !!GAS_URL;

export type Resource = "projects" | "tasks" | "meetings";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error: { code: string; message: string } | null;
}

async function get<T>(resource: string): Promise<T> {
  const res = await fetch(`${GAS_URL}?resource=${encodeURIComponent(resource)}`, {
    method: "GET",
  });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!json.success) throw new Error(json.error?.message ?? "GAS GET エラー");
  return json.data;
}

async function post<T>(resource: Resource, action: "create" | "update" | "delete", payload: unknown): Promise<T> {
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ resource, action, payload }),
  });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!json.success) throw new Error(json.error?.message ?? "GAS POST エラー");
  return json.data;
}

export interface Bootstrap {
  projects: Project[];
  tasks: Task[];
  meetings: Meeting[];
}

export const api = {
  isRemote,
  ping: () => get<{ ok: boolean }>("ping"),
  bootstrap: () => get<Bootstrap>("bootstrap"),

  createProject: (p: Project) => post<Project>("projects", "create", p),
  updateProject: (p: Project) => post<Project>("projects", "update", p),
  deleteProject: (id: string) => post<{ id: string }>("projects", "delete", { id }),

  createTask: (t: Task) => post<Task>("tasks", "create", t),
  updateTask: (t: Task) => post<Task>("tasks", "update", t),
  deleteTask: (id: string) => post<{ id: string }>("tasks", "delete", { id }),

  createMeeting: (m: Meeting) => post<Meeting>("meetings", "create", m),
  updateMeeting: (m: Meeting) => post<Meeting>("meetings", "update", m),
  deleteMeeting: (id: string) => post<{ id: string }>("meetings", "delete", { id }),
};
