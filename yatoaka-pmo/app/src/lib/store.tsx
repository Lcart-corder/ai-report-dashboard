"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useMemo,
  useCallback,
} from "react";
import {
  projects as seedProjects,
  wbsRows as seedWbs,
  meetings as seedMeetings,
  type Project,
  type WbsRow,
} from "./mock";
import { api, isRemote } from "./api";

/* ---------------- Types ---------------- */
export interface Task extends WbsRow {
  id: string;
  parentId?: string;
  desc?: string;
}

export interface Meeting {
  id: string;
  title: string;
  status: string;
  date: string;
  place: string;
  purpose?: string;
  extra?: string;
}

interface State {
  projects: Project[];
  tasks: Task[];
  meetings: Meeting[];
}

type Action =
  | { type: "hydrate"; payload: State }
  | { type: "project.add"; payload: Project }
  | { type: "project.update"; payload: Project }
  | { type: "project.delete"; id: string }
  | { type: "task.add"; payload: Task }
  | { type: "task.update"; payload: Task }
  | { type: "task.delete"; id: string }
  | { type: "meeting.add"; payload: Meeting }
  | { type: "meeting.update"; payload: Meeting }
  | { type: "meeting.delete"; id: string }
  | { type: "reset" };

/* ---------------- Seed ---------------- */
function codeParent(code: string): string | undefined {
  const parts = code.split(".");
  return parts.length <= 1 ? undefined : parts.slice(0, -1).join(".");
}

function makeSeed(): State {
  return {
    projects: seedProjects.map((p) => ({ ...p })),
    tasks: seedWbs.map((w) => ({ ...w, id: w.code, parentId: codeParent(w.code) })),
    meetings: seedMeetings.map((m, i) => ({ ...m, id: `MTG${String(i + 1).padStart(3, "0")}` })),
  };
}

/* ---------------- Reducer ---------------- */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return action.payload;
    case "reset":
      return makeSeed();
    case "project.add":
      return { ...state, projects: [action.payload, ...state.projects] };
    case "project.update":
      return {
        ...state,
        projects: state.projects.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case "project.delete":
      return { ...state, projects: state.projects.filter((p) => p.id !== action.id) };
    case "task.add":
      return { ...state, tasks: [...state.tasks, action.payload] };
    case "task.update":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case "task.delete": {
      // delete task and all descendants
      const toDelete = new Set<string>([action.id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const t of state.tasks) {
          if (t.parentId && toDelete.has(t.parentId) && !toDelete.has(t.id)) {
            toDelete.add(t.id);
            changed = true;
          }
        }
      }
      return { ...state, tasks: state.tasks.filter((t) => !toDelete.has(t.id)) };
    }
    case "meeting.add":
      return { ...state, meetings: [action.payload, ...state.meetings] };
    case "meeting.update":
      return {
        ...state,
        meetings: state.meetings.map((m) => (m.id === action.payload.id ? action.payload : m)),
      };
    case "meeting.delete":
      return { ...state, meetings: state.meetings.filter((m) => m.id !== action.id) };
    default:
      return state;
  }
}

/* ---------------- Progress rollup ---------------- */
export function childrenOf(tasks: Task[], id: string): Task[] {
  return tasks.filter((t) => t.parentId === id);
}

/** 親タスクは子タスク進捗の単純平均、葉タスクは自身の進捗率（要件定義書 5.3）。 */
export function effectiveProgress(tasks: Task[], task: Task): number {
  const kids = childrenOf(tasks, task.id);
  if (kids.length === 0) return task.progress;
  const sum = kids.reduce((a, k) => a + effectiveProgress(tasks, k), 0);
  return Math.round(sum / kids.length);
}

/* ---------------- Context ---------------- */
interface StoreValue extends State {
  addProject: (p: Project) => void;
  updateProject: (p: Project) => void;
  deleteProject: (id: string) => void;
  addTask: (t: Task) => void;
  updateTask: (t: Task) => void;
  deleteTask: (id: string) => void;
  addMeeting: (m: Meeting) => void;
  updateMeeting: (m: Meeting) => void;
  deleteMeeting: (id: string) => void;
  reset: () => void;
  newId: (prefix: string) => string;
}

const StoreContext = createContext<StoreValue | null>(null);
const STORAGE_KEY = "yatoaka-pmo-store-v1";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, makeSeed);

  // hydrate after mount (avoids SSR mismatch)
  // - リモートモード: GAS からブートストラップ取得
  // - ローカルモード: localStorage から復元
  useEffect(() => {
    if (isRemote()) {
      api
        .bootstrap()
        .then((data) => {
          dispatch({
            type: "hydrate",
            payload: {
              projects: data.projects ?? [],
              tasks: data.tasks ?? [],
              meetings: data.meetings ?? [],
            },
          });
        })
        .catch(() => {
          /* 取得失敗時はシードのまま */
        });
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "hydrate", payload: JSON.parse(raw) as State });
    } catch {
      /* ignore */
    }
  }, []);

  // persist to localStorage（ローカルモードのみ。リモートは GAS が真実の源）
  useEffect(() => {
    if (isRemote()) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const newId = useCallback(
    (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`,
    []
  );

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      addProject: (p) => {
        dispatch({ type: "project.add", payload: p });
        if (isRemote()) api.createProject(p).catch(() => {});
      },
      updateProject: (p) => {
        dispatch({ type: "project.update", payload: p });
        if (isRemote()) api.updateProject(p).catch(() => {});
      },
      deleteProject: (id) => {
        dispatch({ type: "project.delete", id });
        if (isRemote()) api.deleteProject(id).catch(() => {});
      },
      addTask: (t) => {
        dispatch({ type: "task.add", payload: t });
        if (isRemote()) api.createTask(t).catch(() => {});
      },
      updateTask: (t) => {
        dispatch({ type: "task.update", payload: t });
        if (isRemote()) api.updateTask(t).catch(() => {});
      },
      deleteTask: (id) => {
        dispatch({ type: "task.delete", id });
        if (isRemote()) api.deleteTask(id).catch(() => {});
      },
      addMeeting: (m) => {
        dispatch({ type: "meeting.add", payload: m });
        if (isRemote()) api.createMeeting(m).catch(() => {});
      },
      updateMeeting: (m) => {
        dispatch({ type: "meeting.update", payload: m });
        if (isRemote()) api.updateMeeting(m).catch(() => {});
      },
      deleteMeeting: (id) => {
        dispatch({ type: "meeting.delete", id });
        if (isRemote()) api.deleteMeeting(id).catch(() => {});
      },
      reset: () => dispatch({ type: "reset" }),
      newId,
    }),
    [state, newId]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
