// localStorage への永続化ヘルパー（SSR / 非対応環境でも安全に動作）

const PREFIX = "salesSim:";

export function loadState<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveState<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // 容量超過などは黙って無視
  }
}
