#!/usr/bin/env node
/**
 * drizzle/schema.ts を一時的にCJSへバンドルしてから drizzle-kit push を実行する。
 * 当リポジトリのツールチェーン(ESM + drizzle-kit)で直接 push が失敗する問題を回避しつつ、
 * スキーマの単一の真実源(schema.ts)からDBへ反映できるようにする。
 *
 *   DATABASE_URL=mysql://user:pass@host:3306/db node scripts/db-push.mjs [--force]
 *
 * --force を付けるとデータ損失を伴う変更も対話なしで適用する(初回構築・CIで使用)。
 */
import { execSync } from "node:child_process";
import { writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

if (!process.env.DATABASE_URL) {
  console.error("[db-push] DATABASE_URL が未設定です。例: mysql://user:pass@host:3306/dbname");
  process.exit(1);
}

// 無料/マネージドMySQL(TiDB Cloud等)はTLS必須。server/db.ts の withSsl と同じロジック
// (独立スクリプトのためここに複製)。未適用だと drizzle-kit push が平文接続を試みて
// 「Connections using insecure transport are prohibited」で拒否される。
function withSsl(url) {
  const mode = process.env.DATABASE_SSL;
  if (!mode || mode === "false" || /[?&]ssl=/.test(url)) return url;
  const ssl = JSON.stringify({ rejectUnauthorized: mode !== "insecure" });
  return url + (url.includes("?") ? "&" : "?") + "ssl=" + encodeURIComponent(ssl);
}
// 生成する drizzle.config.cjs は `process.env.DATABASE_URL` を参照するため、
// ここで自身のプロセス環境を書き換えておけば execSync で継承される子プロセスにも伝播する。
process.env.DATABASE_URL = withSsl(process.env.DATABASE_URL);

const dir = mkdtempSync(join(tmpdir(), "lms-dbpush-"));
const schemaCjs = join(dir, "schema.cjs");
const configCjs = join(dir, "drizzle.config.cjs");
const force = process.argv.includes("--force") ? " --force" : "";

try {
  console.log("[db-push] schema.ts を CJS にバンドル中…");
  execSync(`npx esbuild drizzle/schema.ts --bundle --platform=node --format=cjs --outfile="${schemaCjs}"`, { stdio: "inherit" });

  writeFileSync(
    configCjs,
    `module.exports = { schema: ${JSON.stringify(schemaCjs)}, dialect: "mysql", dbCredentials: { url: process.env.DATABASE_URL } };\n`,
  );

  console.log("[db-push] drizzle-kit push 実行中…");
  execSync(`npx drizzle-kit push --config "${configCjs}"${force}`, { stdio: "inherit" });
  console.log("[db-push] 完了。");
} catch (err) {
  console.error("[db-push] 失敗:", err?.message ?? err);
  process.exit(1);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
