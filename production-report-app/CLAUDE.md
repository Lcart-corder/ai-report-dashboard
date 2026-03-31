# 工場生産日報 iPad Web App — Claude Code 指示書

## プロジェクト概要
工場の成形日報をiPadから入力・承認するWebアプリMVP。

## 技術スタック
- **フロントエンド**: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- **API**: Google Apps Script Web App (REST-like)
- **DB**: Google Spreadsheet (ID: `1sttdBmN6V5WLrAp7vagFlWePk_ldV1auVFzqj8-XrNc`)
- **認証**: Google OAuth + NextAuth.js v5 (メールベースログイン)
- **i18n**: 日本語 / ベトナム語 (フロントエンドのみ)

## ディレクトリ構造
```
production-report-app/
├── CLAUDE.md               # この文書
├── gas/                    # Google Apps Script (9ファイル)
│   ├── config.gs           # SpreadsheetID, シート名, 定数
│   ├── utils.gs            # getColumnMap, CRUD汎用関数
│   ├── main.gs             # doGet/doPost ルーター
│   ├── auth.gs             # ユーザー認証
│   ├── reports.gs          # 日報CRUD
│   ├── timeslots.gs        # 時間帯取得
│   ├── inputs.gs           # 生産入力CRUD + ノンストップ
│   ├── approvals.gs        # 承認フロー + サマリー
│   └── masters.gs          # マスタデータ
├── src/
│   ├── app/                # Next.js App Router ページ
│   │   ├── page.tsx               # ホーム
│   │   ├── login/page.tsx         # ログイン
│   │   ├── admin/page.tsx         # 管理画面
│   │   └── report/[reportId]/
│   │       ├── page.tsx           # 時間帯一覧
│   │       ├── slot/[slotId]/page.tsx  # 入力フォーム
│   │       ├── summary/page.tsx        # サマリー
│   │       └── approval/page.tsx       # 承認
│   ├── components/         # 共通コンポーネント
│   ├── contexts/           # Auth, Language, Machine コンテキスト
│   ├── i18n/               # 翻訳辞書 (ja/vi)
│   └── lib/                # types, constants, api client
├── package.json
├── tsconfig.json
├── next.config.js
└── .env.local.example
```

## 重要な設計原則

### ID体系 (固定・予測可能)
- ReportID: `YYYYMMDD_Mxx` (例: `20260401_M06`)
- SlotID: `ReportID_HHMM` (例: `20260401_M06_0700`)
- InputID: `SlotID_01` (例: `20260401_M06_0700_01`)
- ApprovalID: `ReportID_Role` (例: `20260401_M06_kakarichou`)

### 営業日ルール
- 7:00開始 → 翌日6:59終了 = 1日分
- 7:00前のアクセス → 前日の日報に紐づく

### ノンストップ入力
- 保存 → APIが `next_empty_slot` を返す → 自動遷移

### 承認フロー (3段階・順序固定)
1. 係長 (kakarichou)
2. 品証課 (hinshitsu)
3. 部長 (buchou)
- 差戻し → 全承認リセット → 係長からやり直し

### Apps Script 列アクセス
- **常に列名ベース** (getColumnMap関数)
- 列インデックスのハードコードは禁止

## 開発コマンド
```bash
npm install          # 依存関係インストール
npm run dev          # 開発サーバー起動 (localhost:3000)
npm run build        # プロダクションビルド
```

## 環境変数 (.env.local)
```
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=xxx
NEXT_PUBLIC_GAS_URL=https://script.google.com/macros/s/xxx/exec
```

## デプロイ手順
1. Spreadsheet: 7シートのヘッダー行 + 初期データ投入
2. Apps Script: gas/ の9ファイルをコピー → Web Appデプロイ
3. Google OAuth: Cloud Console でクライアントID取得
4. Vercel: GitHub push → 環境変数設定 → デプロイ

## 停止コード一覧
10=段取り, 21=金型, 22=成形機, 23=取出機, 25=設備, 30=品質, 31=型拭(定期), 44=欠品, 51=計画, 99=人員不足(その他)
