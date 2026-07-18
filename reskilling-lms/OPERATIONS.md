# 助成金対応リスキリングLMS 運用手順書

本書は、公開中の本番(デモ)環境の構成・日常運用・障害対応・バックアップをまとめた
運用引き継ぎドキュメントである(要件定義書「非機能要件: 可用性・保守」に対応)。

## 1. 現在の公開環境

| 項目 | 内容 |
|---|---|
| 公開URL | https://reskilling-lms.onrender.com/lms |
| アプリ | Render Web Service(**Free プラン** / Node ランタイム / Blueprint=`render.yaml`) |
| DB | TiDB Cloud Serverless(MySQL互換 / TLS必須 / 無料枠) |
| デプロイ | GitHub の対象ブランチへ push すると Render が自動ビルド・自動デプロイ |
| モード | `LMS_PREVIEW_MODE=1`(ログイン不要のゲスト閲覧デモ。右上のロール切替で7ロールを閲覧可能) |
| 死活監視 | `GET /healthz` → `{"status":"ok","uptime":…}`(DB非依存で即応答) |

### 環境変数(Render ダッシュボード → Environment)

| 変数 | 値/意味 |
|---|---|
| `DATABASE_URL` | TiDB の接続文字列(シークレット) |
| `DATABASE_SSL` | `require`(TiDBはTLS必須。接続URLへ自動で `ssl` を付与) |
| `LMS_PREVIEW_MODE` | `1`=ゲスト閲覧デモ。**本番運用へ移行する際は削除**し OAuth を設定する |
| `OAUTH_SERVER_URL` / `VITE_APP_ID` / `JWT_SECRET` | 本番ログインを使う場合のみ |
| `AWS_REGION` / `LMS_MAIL_FROM` ほか | メール(SES)を使う場合のみ。未設定なら送信は記録のみ |

## 2. 仕組み上の重要ポイント(トラブル対応の前提知識)

- **スリープ防止(keep-warm)**: アプリ自身が10分間隔で自分の `/healthz` を ping し、
  Render Free のアイドルスリープ(15分)を回避している。設定不要(`RENDER_EXTERNAL_URL` を自動利用)。
- **キャッシュ戦略(白画面対策)**: `index.html` は `no-cache`(毎回再検証)、`/assets/*` は
  `immutable` 長期キャッシュ。加えて、旧チャンクの読込に失敗した場合はクライアントが
  1回だけ自動リロードして新ビルドを取り直す。→ **デプロイ後に端末側で白画面が固定化しない**。
- **再デプロイ中の瞬断**: Free プランは無停止切替ができないため、デプロイ完了までの
  1〜2分はアクセスできない/白画面になることがある。**デモ・商談の直前にはプッシュしない**こと。
- **スキーマ反映**: デプロイのたびに起動コマンドが `node scripts/db-push.mjs --force` を実行し、
  `drizzle/schema.ts`(単一の真実源)を TiDB へ反映してからアプリを起動する。手作業は不要。
- **デモデータ**: 起動時にDBが空なら自動投入(3社・8名・コース・修了者・修了証・教材・順番制御)。
  既にデータがあれば何もしない(冪等)。

## 3. 日常運用

### デモを顧客に見せる
1. https://reskilling-lms.onrender.com/lms を共有する(ログイン不要)。
2. 右上「ロール切替」で 管理者/プロジェクト管理者/協業先管理者/代表/講師/社労士/会社員 を切替。
3. スマホは左上の ≡ からメニューを開く。

### 機能を更新する
1. 対象ブランチへコミット & push(または PR をマージ)。
2. Render が自動でビルド・デプロイ(数分)。`/healthz` の `uptime` がリセットされたら新版。
3. 直後にアクセスした端末が古い表示のままなら一度再読込(以降は自動で最新化される)。

### 監査ログ・証跡の確認
- 管理者ロール →「監査ログ」: ログイン(IP/端末)・視聴・チェック・テスト・修了・出力の履歴。CSV出力可。
- 「証跡出力」: 修了証PDF・受講状況CSV・テスト結果CSV・10時間以上修了者一覧など。

## 4. バックアップとリストア

### 自動バックアップ(TiDB Cloud 側)
TiDB Cloud Serverless は**自動バックアップ(日次)を標準提供**している。
TiDB Cloud コンソール → 対象クラスタ → Backup で確認・リストア(Point-in-Time Restore)が可能。

### 手動バックアップ(任意・持ち出し用)
MySQL互換のため `mysqldump` が使える(TLS必須):

```bash
mysqldump -h <TiDBホスト> -P 4000 -u <ユーザー> -p --ssl-mode=REQUIRED \
  --single-transaction --set-gtid-purged=OFF <DB名> > backup_$(date +%Y%m%d).sql
```

リストアは `mysql` クライアントで流し込む。**リストア前に必ず現状のダンプを取ってから**行うこと。

### 空環境の再構築(DBを作り直す場合)
1. TiDB で新しいDBを作成し、Render の `DATABASE_URL` を差し替える。
2. Render で手動デプロイ(起動時にスキーマ反映+デモデータ自動投入)。

## 5. 障害対応(症状 → 対処)

| 症状 | 原因の目安 | 対処 |
|---|---|---|
| 「Render 起動中…」の画面 | スリープ復帰(通常は出ない) | 30〜60秒待つ。頻発する場合は keep-warm ログを確認 |
| 白画面(全端末) | デプロイ直後の瞬断 / ビルド失敗 | Render の Deploy ログを確認。失敗時は直前のコミットを revert して push |
| 白画面(特定端末のみ) | 端末キャッシュ | タブを閉じて開き直す(以降は自動最新化される) |
| 500 / データが出ない | DB接続 | Render の環境変数 `DATABASE_URL` / `DATABASE_SSL=require` を確認。TiDBコンソールでクラスタ状態を確認 |
| `insecure transport prohibited` | TLS未適用 | `DATABASE_SSL=require` が設定されているか確認 |
| ビルド失敗(EROFS/corepack) | Node バージョン | `.node-version`(=22)と `package.json` の `engines` を維持する(corepack enable は使わない) |

ロールバック: Render ダッシュボード → Deploys → 過去の成功デプロイの「Rollback」。
またはリポジトリで `git revert` して push。

## 6. セキュリティ運用

- **TiDB パスワード**: 初期構築時に平文で共有されているため、**TiDB Cloud コンソールでリセット**し、
  Render の `DATABASE_URL` を新パスワードで更新すること(未実施なら最優先)。
- 公開デモ(`LMS_PREVIEW_MODE=1`)は誰でも閲覧・操作できる。**デモ専用DB**で運用し、
  実データを入れないこと。本番移行時はこの変数を削除して OAuth を有効化する。
- ログイン履歴(ユーザー・日時・IP・端末)は監査ログに自動記録される。
- 視聴ログ・チェック・テスト結果は管理者でも直接編集不可(差戻し・再実施フローで対応)。

## 7. 本番移行時のチェックリスト(デモ → 実運用)

- [ ] TiDB パスワードをリセットし `DATABASE_URL` を更新
- [ ] 本番用DBを新規作成(デモDBと分離)
- [ ] `LMS_PREVIEW_MODE` を削除し、OAuth(`OAUTH_SERVER_URL` 等)を設定
- [ ] 運営管理者(`lms_members` / role=operator_admin)を登録
- [ ] メール(SES)の送信元検証・SPF/DKIM 設定
- [ ] Render を有料プラン(常時起動・無停止デプロイ)へ変更、独自ドメイン+TLS
- [ ] 受講者データの保持期間・削除フローの合意(長期保管要件との両立)
- [ ] 管理者アカウントの2段階認証を認証基盤側で有効化
