# ============================================================
# 助成金対応リスキリングLMS — 本番用マルチステージ Dockerfile
# クライアント(Vite)とサーバー(esbuild)をビルドし、
# 実行に必要な本番依存のみを含む軽量イメージを生成する。
# ============================================================

FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# --- 依存関係(全体: ビルドに必要) ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- ビルド ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# --- 本番依存のみ ---
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# --- 実行イメージ ---
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# 非rootユーザーで実行
RUN groupadd -r app && useradd -r -g app app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
# マイグレーション(db:push)を使う場合に備え、スキーマとスクリプトも同梱
COPY drizzle ./drizzle
COPY scripts ./scripts
USER app
EXPOSE 3000
# 死活監視
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]
