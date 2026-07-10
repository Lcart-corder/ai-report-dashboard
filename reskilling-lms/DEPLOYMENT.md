# 助成金対応リスキリングLMS デプロイまでのロードマップ

本書は、実装済みのLMSを本番稼働させるまでの手順とチェックリストをまとめたものである。

## 現在地

- 要件定義書 FR-01〜FR-19、Phase 1〜3 の主要機能を実装済み。
- ロール・権限（7ロール／スコープ強制）、受講者ログイン導線、証跡出力、通知（メール主軸＋LINE任意＋内部Webhook）まで実装。
- 型チェック（tsc）、ビルド（vite / esbuild）、ユニットテスト（vitest 23件）はいずれも通過。
- LMS は `/lms` 配下の独立モジュールとして動作（既存LINEツールと同一アプリ内で共存）。

## 技術前提

- フロントエンド: Vite + React 19 + Tailwind
- API: tRPC（Express 上でホスト）
- DB: MySQL（Drizzle ORM）
- 認証: Manus OAuth（`users` テーブル）+ LMS独自のロール（`lms_members` / `learners`）
- ビルド成果物: `dist/`（クライアント静的ファイル + `dist/index.js` サーバー）

ホスティングは Node.js を実行できる環境（Vercel / Render / Fly.io / 自前VM 等）と、外部の MySQL（PlanetScale / Amazon RDS / Cloud SQL 等）を想定する。

## デプロイ用の成果物（このリポジトリに同梱）

| ファイル | 役割 |
|---|---|
| `Dockerfile` | 本番用マルチステージビルド（Vite + esbuild → 本番依存のみの軽量イメージ、非root、HEALTHCHECK付き） |
| `docker-compose.yml` | セルフホスト/ステージング一式（MySQL 8 + スキーマ反映 + アプリ）。`docker compose up --build` |
| `.dockerignore` | イメージへ含めない対象 |
| `scripts/db-push.mjs` | `schema.ts` を単一の真実源としてDBへスキーマ反映（`pnpm db:push` / `db:push:force`） |
| `.github/workflows/ci.yml` | push/PR で 型チェック・テスト・ビルドを実行 |
| `GET /healthz` | 死活監視エンドポイント（`{"status":"ok"}`、DB非依存で即応答） |

## 顧客への内容確認（ゲスト閲覧モード・ログイン不要）

顧客に「触って確認」してもらう公開デモは、`LMS_PREVIEW_MODE=1` を設定するだけで用意できる。

- 未認証の訪問者に「運営（閲覧）」を自動付与し、**ログインなしで全画面を閲覧・操作**できる。
- 起動時にデモが空なら**サンプルデータ（3社・8名・修了者・修了証・通知）を自動投入**する。
- 画面上部に「閲覧デモ」バナーを表示。OAuthの設定は不要。
- 実機検証済み: `NODE_ENV=production LMS_PREVIEW_MODE=1` で起動 → `/lms` がログインなしで表示され、
  ダッシュボードにサンプル進捗・修了者が並ぶことを確認。

> セキュリティ注意: 公開URLを知る誰でも閲覧・操作できる。**使い捨てのデモDB専用**とし、
> 本番運用に移る際は `LMS_PREVIEW_MODE` を削除（または `0`）し、OAuthを有効化すること。

下記の無料構成（Render + 無料MySQL）に `LMS_PREVIEW_MODE=1` を加えれば、そのまま公開デモになる（`render.yaml` に設定済み）。

## 無料で公開する構成（0円デプロイ）

| 役割 | サービス | 無料枠の要点 |
|---|---|---|
| アプリ | **Render（Web Service / Free）** | 常時無料。アイドル後スリープ→次アクセスでコールドスタート（数十秒）。`render.yaml` を同梱済み |
| DB | **TiDB Cloud Serverless**（MySQL互換）または **Aiven for MySQL（Free）** | クレカ不要枠あり。MySQLワイヤ互換。**TLS必須**（`DATABASE_SSL=require` で対応） |
| メール | 任意（未設定でも動作。送信は記録のみ） | SESのサンドボックス内など |

手順:

1. 無料MySQL（TiDB Cloud Serverless 等）を作成し、接続URLを取得。
2. このリポジトリを Render に接続し、**Blueprint（`render.yaml`）** でデプロイ。
   `DATABASE_URL` と（ログインを使う場合）`OAUTH_SERVER_URL` / `VITE_APP_ID` をダッシュボードで入力。
3. 公開URLの `/healthz` が `ok`、`/lms` が表示されればデプロイ完了。

スキーマ反映は手元で実行する必要はない。`render.yaml` の起動コマンドが
デプロイのたびに `node scripts/db-push.mjs --force && pnpm start` を実行し、
Render のビルド環境（ネットワーク制限なし）から直接スキーマを反映してからアプリを起動する。

> メモ: Render Free は Docker でなく Node ランタイムでビルドする（`render.yaml` 設定済み）。
> 常時起動が必要なら Render の有料プラン、または自前VM＋`docker compose` に切り替える。

## クイックスタート（Docker Compose）

```bash
cp .env.example .env      # 認証・通知の値を設定（未設定でもUI/デモは起動）
docker compose up --build # db → migrate(スキーマ反映) → app の順に起動
# → http://localhost:3000/lms  ／ ヘルスチェック: http://localhost:3000/healthz
```

`docker compose` は MySQL 8 を起動し、`migrate` サービスが `pnpm db:push:force` で全テーブルを作成してから `app` を起動する。

### 検証済みの状態（このリポジトリで実機確認）

- `docker build` で本番イメージが生成できる（非root・HEALTHCHECK付き）。
- 空のMySQLへ `pnpm db:push:force` で全54テーブルを作成できる。
- 生成イメージをコンテナ起動 → `/healthz` が `{"status":"ok"}`、`/lms` が 200、Docker HEALTHCHECK が `healthy` になることを確認済み。
- 本番バンドルは開発専用の `vite` を読み込まない（`vite` は動的import＋コード分割で遅延チャンク化済み）。

### コンテナホストへのデプロイ（Render / Fly.io / Railway / ECS 等）

1. 外部MySQL（PlanetScale / RDS / Cloud SQL 等）を用意し `DATABASE_URL` を取得。
2. `pnpm db:push:force`（またはCIジョブ）でスキーマを反映。
3. `docker build` したイメージをレジストリへpush、またはホスト側でビルド。
4. 環境変数（`.env` 相当）をシークレットとして登録し、コンテナを起動。ヘルスチェックパスは `/healthz`。

社内プロキシ（TLS再終端）配下でビルドする場合のみ、任意で
`--build-arg BUILD_HTTPS_PROXY=$HTTPS_PROXY --secret id=ca,src=<CA>` を付与する（通常のクラウドビルドでは不要）。

---

## フェーズ1: 環境準備

1. MySQL データベースを用意し、接続文字列を取得する。
2. `.env.example` を `.env` にコピーし、以下を設定する。
   - `DATABASE_URL`（必須）
   - `OAUTH_SERVER_URL` / `JWT_SECRET` / `VITE_APP_ID`（認証）
   - `NODE_ENV=production` / `PORT`
3. 通知を使う場合は該当する値を設定（フェーズ4参照）。

完了条件: `.env` が揃い、`DATABASE_URL` で MySQL に接続できる。

## フェーズ2: データベース構築

1. スキーマを反映する。

   ```bash
   DATABASE_URL=mysql://user:pass@host:3306/db pnpm db:push        # 対話あり
   DATABASE_URL=mysql://user:pass@host:3306/db pnpm db:push:force  # 初回構築/CI(対話なし)
   ```

   - `scripts/db-push.mjs` が `drizzle/schema.ts` をCJSへバンドルしてから `drizzle-kit push` を実行し、
     全テーブル（アプリ共通＋LMSテーブル）を作成する。空DBに対して確実に動作する。
   - `drizzle-kit` を直接使うとこのツールチェーンではESM/バージョン差で失敗するため、上記スクリプトを標準とする。
2. 初期の運営管理者を用意する。
   - 方法A: `lms_members` に `role=operator_admin` のレコードを1件登録し、そのメールでログインする。
   - 方法B: メンバー0件の初回は、ログインしたユーザーが自動的に運営管理者として扱われる（bootstrap）。最初の管理者がログイン後、正式なメンバーを登録する。

完了条件: 全テーブルが作成され、運営管理者でログインできる。

## フェーズ3: ステージング検証

1. ビルドして起動する。

   ```bash
   pnpm build
   pnpm start
   ```

2. `/lms` を開き、以下を確認する。
   - ダッシュボードにログイン中ロールが表示される。
   - 「デモデータ投入」でサンプル（企業・コース・受講者・マスターキー）が生成される。
   - 受講者フロー（視聴 → チェック → テスト → レポート → 修了証）が通る。
   - 企業別に受講者一覧・進捗が絞り込まれる（越境アクセスが403になる）。
   - 証跡CSV・修了証PDF（印刷）が出力できる。
3. ロール別にログインし、ナビと権限が想定どおり制限されることを確認する。

補足: OAuth/DB を用意せずUIだけ確認したい場合、ローカルに限り `LMS_DEV_LOGIN=1` で運営ユーザーとして表示できる（本番では無効）。

完了条件: 主要フローと権限制御がステージングで再現できる。

## フェーズ4: 通知連携の有効化（任意・段階導入可）

1. メール（受講者への主軸）: SESで送信元アドレスを検証し、`AWS_REGION` / `LMS_MAIL_FROM` とAWS認証情報を設定する。
2. LINE（任意の補助）: 管理画面の連携からチャネルアクセストークンを登録し、受講者の `lineUserId` を紐づける。
3. 内部Webhook（協業先・運営）: 「内部通知連携」画面で Slack / Google Chat の Webhook URL、または Chatwork のトークン・ルームIDを登録し、テスト送信で疎通を確認する。

いずれも未設定でも本体は動作する（送信は記録のみに退避）。

完了条件: 使用するチャネルのテスト送信が成功する。

## フェーズ5: 本番デプロイ

1. ホスティングに環境変数（`.env` 相当）をシークレットとして登録する。
2. GitHub の対象ブランチをデプロイ対象に設定し、ビルド・起動コマンドを指定する。
   - ビルド: `pnpm build`
   - 起動: `pnpm start`
3. 独自ドメイン・TLSを設定する。
4. スモークテスト（ログイン、ダッシュボード表示、1件の受講〜修了）を実施する。

完了条件: 本番URLで運営がログインし、1件の受講〜修了〜証跡出力まで通る。

## フェーズ6: 運用・保守

- 日次バックアップ（DB）とリストア手順を用意する。
- 監査ログを定期的に確認・出力する（改ざん検知・申請準備の裏付け）。
- 制度改定時に申請準備チェックの項目を見直す。
- 通知テンプレート・コース・テストは管理画面から更新する。

---

## 移行チェックリスト

| 区分 | 項目 | 状態 |
|---|---|---|
| 環境 | DATABASE_URL 設定 | 未 |
| 環境 | OAuth（OAUTH_SERVER_URL / JWT_SECRET / VITE_APP_ID） | 未 |
| DB | `pnpm db:push` 実行 | 未 |
| DB | 運営管理者の登録 | 未 |
| 検証 | 主要フロー（受講〜修了〜証跡） | 未 |
| 検証 | ロール別の権限制限 | 未 |
| 通知 | メール（SES）疎通 | 任意 |
| 通知 | 内部Webhook 疎通 | 任意 |
| 本番 | シークレット登録・ドメイン・TLS | 未 |
| 本番 | スモークテスト | 未 |

## 本番前に検討すべき残課題

正直な現状として、以下は運用規模・要件に応じて追加検討が必要である。

- 動画配信の実体: HTML5プレイヤーを実装済み（視聴位置・視聴率の自動記録、未視聴区間の早送り抑止、95%で視聴完了、続きから再開、倍速）。コースの各レッスンに `videoUrl` を登録すれば再生される。大規模配信では Vimeo / Cloudflare Stream 等のCDN（署名付きURL・帯域最適化）への差し替えを検討する。
- メール送信の到達性: SESのサンドボックス解除・SPF/DKIM・バウンス処理。
- 個人情報保護: 受講者データの保持期間・削除フロー、アクセスログの保全期間。
- バックアップ/監視: 死活監視・エラー通知・自動バックアップの整備。
- 2段階認証: 管理者ロールのMFA（要件上は必須）を認証基盤側で有効化する。
- 請求・決済: Stripe / Square 連携（Phase 3の受講者数課金）は将来対応。

これらは段階的に追加可能で、コア（受講管理・証跡・権限）は本番投入できる状態にある。
