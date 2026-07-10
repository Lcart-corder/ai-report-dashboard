# ============================================================
# 助成金対応リスキリングLMS — 本番用マルチステージ Dockerfile
# クライアント(Vite)とサーバー(esbuild)をビルドし、
# 実行に必要な本番依存のみを含む軽量イメージを生成する。
#
# 通常のクラウドビルドでは追加設定不要:
#   docker build -t lms-app .
# TLSプロキシ配下(社内プロキシ等)でビルドする場合のみ、任意で:
#   docker build --build-arg BUILD_HTTPS_PROXY=$HTTPS_PROXY \
#     --secret id=ca,src=/path/to/ca-bundle.crt -t lms-app .
# ============================================================

FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# ビルド時のみ有効なプロキシ設定(既定は空=無効)。実行イメージには持ち込まない。
ARG BUILD_HTTPS_PROXY=
ENV HTTPS_PROXY=$BUILD_HTTPS_PROXY
ENV HTTP_PROXY=$BUILD_HTTPS_PROXY
RUN corepack enable
WORKDIR /app

# --- 依存関係(全体: ビルドに必要) ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN --mount=type=secret,id=ca \
    sh -c '[ -s /run/secrets/ca ] && export NODE_EXTRA_CA_CERTS=/run/secrets/ca; pnpm install --frozen-lockfile'

# --- ビルド ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# --- 本番依存のみ ---
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN --mount=type=secret,id=ca \
    sh -c '[ -s /run/secrets/ca ] && export NODE_EXTRA_CA_CERTS=/run/secrets/ca; pnpm install --prod --frozen-lockfile'

# --- 実行イメージ(プロキシ/CAは持ち込まない) ---
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
