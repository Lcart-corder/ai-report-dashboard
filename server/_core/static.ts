import express, { type Express } from "express";
import fs from "fs";
import path from "path";

/**
 * 本番の静的ファイル配信。Vite に依存しないため、
 * 本番ビルド(dist/index.js)は vite(devDependency)を読み込まない。
 */
export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // キャッシュ戦略(白画面対策の要):
  //  - /assets/* はファイル名にハッシュが入るため immutable で長期キャッシュ(高速化)
  //  - index.html は必ず再検証(no-cache)。ヘッダー無しだとSafari等が独自にキャッシュし、
  //    デプロイ後に「古いindex.html → 消えた旧JSを参照 → 404 → 白画面」が起きる。
  app.use(
    express.static(distPath, {
      setHeaders(res, filePath) {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
          res.setHeader("Cache-Control", "no-cache, must-revalidate");
        }
      },
    })
  );

  // fall through to index.html if the file doesn't exist (SPAルーティング)
  app.use("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, must-revalidate");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
