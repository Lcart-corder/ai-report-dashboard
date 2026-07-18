/**
 * 古いモバイルブラウザ(特に iOS Safari 15.4 未満)向けのランタイムポリフィル。
 *
 * Viteは構文はトランスパイルするが、新しめの「メソッド/API」はポリフィルしない。
 * recharts 等の依存が `Object.hasOwn`(Safari 15.4+)などを使うため、
 * 未対応端末では初期描画時に例外→アプリ全体が白画面になる。
 * ここで不足分を補い、iPhone 6s/7/SE など古い端末でも表示できるようにする。
 *
 * すべて「未定義のときだけ定義」する安全な実装。main.tsx の最初に import する。
 */

// Object.hasOwn (Safari 15.4+) — recharts が使用。未対応だと白画面の主因。
if (typeof (Object as { hasOwn?: unknown }).hasOwn !== "function") {
  Object.defineProperty(Object, "hasOwn", {
    value: (obj: object, prop: PropertyKey) => Object.prototype.hasOwnProperty.call(obj, prop),
    configurable: true,
    writable: true,
  });
}

// Array.prototype.at / String.prototype.at (Safari 15.4+)
function atImpl(this: { length: number; [k: number]: unknown }, index: number) {
  const len = this.length;
  let i = Math.trunc(index) || 0;
  if (i < 0) i += len;
  return i < 0 || i >= len ? undefined : this[i];
}
if (typeof Array.prototype.at !== "function") {
  Object.defineProperty(Array.prototype, "at", { value: atImpl, configurable: true, writable: true });
}
if (typeof String.prototype.at !== "function") {
  Object.defineProperty(String.prototype, "at", { value: atImpl, configurable: true, writable: true });
}

// structuredClone (Safari 15.4+) — 一部ライブラリが使用。簡易フォールバック。
if (typeof (globalThis as { structuredClone?: unknown }).structuredClone !== "function") {
  (globalThis as { structuredClone?: unknown }).structuredClone = (v: unknown) =>
    v === undefined ? undefined : JSON.parse(JSON.stringify(v));
}

export {};
