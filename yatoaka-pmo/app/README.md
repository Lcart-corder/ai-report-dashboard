# やとアカ運営 AI-PMOシステム — 試作版（フロントエンド）

UIモックアップ（画面1〜10）を、実際に動作する Web アプリとして実装した**試作版**です。
要件定義書のフェーズ2「試作版構築」に相当し、まず見た目と操作感を固めることを目的としています。

- データはフロントエンド内の**サンプル（モック）データ**（`src/lib/mock.ts`）を使用します。
- 将来的に Google Apps Script / スプレッドシート等の API へ差し替えられるよう、データ層を分離しています。

## 技術スタック

- Next.js 15（App Router）+ TypeScript
- Tailwind CSS v3
- 追加ランタイム依存なし（アイコン・チャートは自前の SVG 実装）

## 実装画面

| # | パス | 画面 |
| --- | --- | --- |
| 1 | `/` | ダッシュボード（ホーム） |
| 2 | `/projects` | プロジェクト一覧 |
| 3 | `/projects/[id]` | プロジェクト詳細 |
| 4 | `/tasks` | WBS / タスク管理（一覧・ガント・担当者別） |
| 5 | `/calendar` | カレンダー / スケジュール |
| 6 | `/meetings` | 会議管理（AI提案エリア付き） |
| 7 | `/minutes` | 議事録整理 / AI支援（ChatGPT用プロンプト出力） |
| 8 | `/stakeholders` | ステークホルダー管理 |
| 9 | `/documents` | 資料 / ナレッジ管理 |
| 10 | `/reports` | 部会レポート / 進捗分析 |
| — | `/settings` | 設定（プレースホルダー） |

PC は左サイドメニュー、スマートフォンは下部固定メニューに切り替わるレスポンシブ構成です。

## 機能（CRUD）

以下の画面は、サンプルデータに対して実際に作成・編集・削除が動作します。変更内容はブラウザの localStorage に保存され、リロード後も保持されます（設定画面から初期化可能）。

- **ダッシュボード（画面1）**: 全体進捗率・タスク完了率・今週の期限タスク数・期限超過タスク数を **store の実データから集計**して表示。CRUD や議事録からのタスク登録に即時連動します（基準日 2025/05/19）。「今週の会議予定」も store の会議に連動。「今日やること」のチェックはブラウザに保持。
- **プロジェクト（画面2）**: 新規作成／編集／削除（行の ⋮ メニュー）、部会・状態フィルタ
- **プロジェクト詳細（画面3）**: URL の ID から store の該当プロジェクトを表示。ヘッダー（名称・状態・進捗・責任者・期限・部会）は実データに連動し、編集／削除が可能（削除後は一覧へ戻る）。期限から残り日数を算出。
- **カレンダー（画面5）**: 「新しい予定を作成」で会議を追加すると、2025年6月の予定はカレンダーに表示され、**会議一覧・ダッシュボードにも連動**して追加されます。既存の会議もカレンダーへ重ねて表示。
- **WBS / タスク（画面4）**: タスク追加（親タスク選択）、詳細パネルでの編集（担当者・期限・優先度・ステータス・進捗率・説明）、削除。**親タスクの進捗率は子タスクから自動計算**（要件定義書 5.3、単純平均）。子タスクの進捗を変えると親へ即時反映されます。
- **会議（画面6）**: 新規作成／編集／複製／削除、状態フィルタ・検索
- **議事録 / AI支援（画面7）→ WBS 連携**: AIが抽出した「新規タスク候補」を確認（チェック）して **WBS に確定登録**、「WBS更新候補」の反映も可能。登録したタスクは WBS / タスク画面に即時反映されます（要件定義書 5.6「更新案として表示し、人が確認後に登録」）。
- **会議（画面6）AI提案 → WBS 連携**: AIの「未完了タスク案」を選択して WBS へ登録。

状態管理は React Context + reducer（`src/lib/store.tsx`）で実装。トースト通知は `src/components/Toast.tsx`。

## データモード（ローカル / リモート）

`src/lib/store.tsx` は 2 モードで動作します。

- **ローカルモード（既定）**: `NEXT_PUBLIC_GAS_URL` 未設定時。サンプルデータを `localStorage` に永続化。
- **リモートモード**: `NEXT_PUBLIC_GAS_URL` を設定すると、GAS Web App（Google スプレッドシート）と同期。
  起動時に `bootstrap` で一括取得し、作成/更新/削除は楽観更新 + API 送信します。

```bash
cp .env.local.example .env.local
# .env.local に NEXT_PUBLIC_GAS_URL=https://script.google.com/macros/s/XXXX/exec を設定
```

GAS バックエンドの構築・デプロイ手順は [`../gas/README.md`](../gas/README.md) を参照してください。
API クライアントは `src/lib/api.ts`。

## 認証（NextAuth / Auth.js v5）

Google アカウントログインに対応します（`src/lib/auth.ts`）。**内部利用者のみ**ログイン可能で、
`AUTH_ALLOWED_EMAILS`（メール完全一致）／`AUTH_ALLOWED_DOMAIN`（ドメイン）で許可対象を制御します
（両方空なら全 Google アカウント許可＝試作の初期値）。

- `AUTH_ENABLED=true` のときのみログインを要求（`src/middleware.ts` が未ログインを `/login` へリダイレクト）。
- 既定（未設定）では**認証バイパス**で動作し、資格情報なしでも試作を確認できます。
- ログイン画面は `src/app/login/page.tsx`、ヘッダー右上からログアウトできます。

セットアップ（`.env.local`）:

```
AUTH_ENABLED=true
AUTH_SECRET=<npx auth secret で生成>
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
AUTH_ALLOWED_DOMAIN=yatoaka.example.jp   # または AUTH_ALLOWED_EMAILS=a@x,b@y
```

Google Cloud Console の OAuth クライアント（ウェブ）で、承認済みリダイレクト URI に
`<アプリURL>/api/auth/callback/google` を登録してください。

## 開発コマンド

```bash
npm install     # 依存関係のインストール
npm run dev     # 開発サーバー（http://localhost:3000）
npm run build   # 本番ビルド
npm run start   # 本番サーバー起動
```

## ディレクトリ構成

```
app/
├── src/
│   ├── app/                 # 各画面（App Router）
│   │   ├── page.tsx         # 1. ダッシュボード
│   │   ├── projects/        # 2-3. プロジェクト一覧・詳細
│   │   ├── tasks/           # 4. WBS
│   │   ├── calendar/        # 5. カレンダー
│   │   ├── meetings/        # 6. 会議
│   │   ├── minutes/         # 7. 議事録AI
│   │   ├── stakeholders/    # 8. ステークホルダー
│   │   ├── documents/       # 9. 資料
│   │   ├── reports/         # 10. 部会レポート
│   │   └── settings/        # 設定
│   ├── components/          # Shell（サイドバー/トップバー）, UI部品, アイコン
│   └── lib/mock.ts          # サンプルデータ（将来 API へ差し替え）
```

## 次の工程

- `src/lib/mock.ts` を API クライアントに差し替え（Google Apps Script Web アプリ等）
- 認証（Googleアカウント）の追加
- 進捗率ロールアップ・リマインド抽出などのロジックをバックエンドへ実装

設計の詳細は上位ディレクトリの [`docs/`](../docs) を参照してください。
