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
