import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./static";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // ヘルスチェック(コンテナ/オーケストレータの死活監視用)。DB接続は問わず即応答。
  app.get("/healthz", (_req, res) => res.status(200).json({ status: "ok", uptime: process.uptime() }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    // vite(devDependency)は開発時のみ動的import。本番バンドルには含めない。
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  // スリープ防止(無料プラン対策)。Renderは公開URLを RENDER_EXTERNAL_URL に注入する。
  // 起動中は自分の /healthz を定期的に叩いて「インバウンド通信あり」とみなさせ、
  // アイドルによる自動スリープ(次回アクセス時の「起動中」画面)を防ぐ。
  // 外部サービス不要・無料枠内(常時起動でも月744h < 750h)。ローカルでは env 未設定のため無効。
  const keepWarmUrl = process.env.RENDER_EXTERNAL_URL || process.env.KEEP_WARM_URL;
  if (keepWarmUrl && process.env.NODE_ENV === "production") {
    const target = `${keepWarmUrl.replace(/\/$/, "")}/healthz`;
    const intervalMs = 10 * 60 * 1000; // 10分(Renderのアイドル判定=15分より短く)
    const timer = setInterval(() => {
      fetch(target).catch(() => { /* 一時的な失敗は無視(次回で回復) */ });
    }, intervalMs);
    timer.unref?.(); // プロセス終了を妨げない
    console.log(`[keep-warm] ${target} を${intervalMs / 60000}分間隔でping(スリープ防止)`);
  }

  // ゲスト閲覧モードでは、デモが空なら初回だけデモデータを自動投入(ベストエフォート)
  if (process.env.LMS_PREVIEW_MODE === "1") {
    import("../lms")
      .then(async lms => {
        const r = await lms.seedDemoData();
        if (r.seeded) console.log("[preview] デモデータを自動投入しました");
      })
      .catch(err => console.warn("[preview] デモデータ投入をスキップ:", err?.message ?? err));
  }
}

startServer().catch(console.error);
