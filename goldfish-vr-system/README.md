# おえかき金魚VR体験システム

子どもが描いた金魚の塗り絵をアップロードし、AIが画像特徴を抽出、VR空間で金魚が泳ぐ体験を実現するMVPシステム。

## 全体アーキテクチャ

```
子ども/スタッフ (ブラウザ)
       │
       ├── アップロード / 管理 ──► GAS Webapp
       │                            ├── Google Drive (画像保存)
       │                            ├── Google Sheets (作品台帳)
       │                            └── Gemini API (画像解析)
       │
       └── VR体験 / ギャラリー ──► Next.js VRアプリ
                                     ├── Three.js (3D描画)
                                     ├── WebXR (VR対応)
                                     └── GAS JSON API (データ取得)
```

## データフロー

1. 子どもの金魚画像 → GAS Webappでアップロード
2. GAS → Google Driveに画像保存
3. GAS → Google Sheetsに台帳レコード追加 (status: `uploaded`)
4. GAS → Gemini APIで画像特徴抽出 (status: `analysis_processing`)
5. 解析結果 → Sheetsに書き込み (status: `analysis_completed` → `vr_ready`)
6. Next.js VRアプリ → GAS JSON APIから作品データ取得
7. Three.jsで金魚パラメータ反映 → PC/VR表示

## ディレクトリ構成

```
goldfish-vr-system/
├── gas/                              # Google Apps Script
│   ├── appsscript.json               # GASマニフェスト
│   ├── Code.gs                       # メインエントリ (doGet/doPost)
│   ├── Config.gs                     # 設定定数
│   ├── DriveService.gs               # Google Drive操作
│   ├── SheetService.gs               # Google Sheets操作
│   ├── GeminiService.gs              # Gemini API解析
│   ├── ApiResponse.gs                # APIレスポンスヘルパー
│   ├── index.html                    # アップロードページ
│   ├── admin.html                    # 管理画面
│   ├── styles.html                   # 共通CSS
│   └── scripts.html                  # 共通JavaScript
│
├── vr-app/                           # Next.js VRアプリ
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── postcss.config.mjs
│   └── src/
│       ├── app/
│       │   ├── layout.tsx            # ルートレイアウト
│       │   ├── page.tsx              # トップページ
│       │   ├── globals.css           # グローバルCSS
│       │   ├── gallery/page.tsx      # ギャラリー一覧
│       │   ├── vr/[id]/page.tsx      # 作品別VR表示
│       │   └── admin/page.tsx        # 管理確認画面
│       ├── components/goldfish/
│       │   ├── GoldfishModel.ts      # 金魚3Dモデル (純Three.js)
│       │   ├── GoldfishPool.ts       # 複数金魚管理
│       │   └── VRScene.ts            # WebXRシーン管理
│       ├── lib/
│       │   ├── types.ts              # 型定義
│       │   └── api.ts                # GAS API通信
│       └── repository/
│           └── artworkRepository.ts  # データアクセス層
│
└── README.md
```

## Google Sheets カラム設計

| 列 | カラム名 | 型 | 説明 |
|----|---------|-----|------|
| A | artwork_id | string | 一意ID (art_xxxxxxxx) |
| B | child_name | string | お子さまの名前 |
| C | title | string | 作品タイトル |
| D | original_file_name | string | 元ファイル名 |
| E | drive_file_id | string | Drive上のファイルID |
| F | image_url | string | 公開プレビューURL |
| G | status | string | 処理ステータス |
| H | uploaded_at | datetime | アップロード日時 |
| I | analyzed_at | datetime | 解析完了日時 |
| J | primary_colors | string | 主要色 (カンマ区切りHex) |
| K | body_shape | string | 体型 (round/slim/standard) |
| L | fin_size | string | ヒレサイズ (small/medium/large) |
| M | tail_shape | string | 尾びれ形状 (fan/long/split/round) |
| N | mood_tags | string | 印象タグ (カンマ区切り) |
| O | confidence | number | 解析信頼度 (0-1) |
| P | fish_params_json | JSON | 金魚パラメータ全体JSON |
| Q | vr_status | string | VR表示ステータス |
| R | error_message | string | エラーメッセージ |
| S | updated_at | datetime | 最終更新日時 |

### ステータス遷移

```
uploaded → analysis_processing → analysis_completed → vr_ready
                ↓ (失敗)
              error → (再解析) → analysis_processing → ...
```

## Gemini解析設計

### 抽出項目

| 項目 | 型 | 説明 | 例 |
|------|-----|------|-----|
| primaryColors | string[] | 主要色Hex | ["#FF6B6B", "#FFD93D"] |
| bodyShape | string | 体型 | "round" |
| finSize | string | ヒレサイズ | "large" |
| tailShape | string | 尾びれ形状 | "fan" |
| moodTags | string[] | 印象タグ | ["元気", "かわいい"] |
| confidence | number | 信頼度 | 0.85 |
| swimProfile.speed | string | 泳ぎ速度 | "fast" |
| swimProfile.pattern | string | 泳ぎパターン | "playful" |

### 解析フロー

1. Drive から画像を Base64 で取得
2. Gemini Vision API にプロンプト + 画像を送信
3. JSON レスポンスをパース
4. パース失敗時はフォールバック値を使用
5. 結果を Sheets に保存

## セットアップ手順

### 1. Google側の準備

#### 1-1. Google Sheets を作成

1. [Google Sheets](https://sheets.google.com) で新規スプレッドシートを作成
2. シート名を `作品台帳` に変更
3. 1行目にヘッダーを入力:
   ```
   artwork_id | child_name | title | original_file_name | drive_file_id | image_url | status | uploaded_at | analyzed_at | primary_colors | body_shape | fin_size | tail_shape | mood_tags | confidence | fish_params_json | vr_status | error_message | updated_at
   ```
4. スプレッドシートのURLから ID をメモ
   - `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

#### 1-2. Google Drive フォルダを作成

1. Google Drive で `おえかき金魚` フォルダを作成
2. URLから フォルダID をメモ
   - `https://drive.google.com/drive/folders/{FOLDER_ID}`

#### 1-3. Gemini API キーを取得

1. [Google AI Studio](https://aistudio.google.com/apikey) でAPIキーを生成
2. キーをメモ

#### 1-4. GAS プロジェクトを作成

1. [Google Apps Script](https://script.google.com) で新規プロジェクトを作成
2. プロジェクト名: `おえかき金魚VR体験`
3. `gas/` ディレクトリ内の各ファイルを手動でコピー:
   - `.gs` ファイル → GASエディタで「ファイル追加 → スクリプト」
   - `.html` ファイル → GASエディタで「ファイル追加 → HTML」
   - `appsscript.json` → 「設定 → appsscript.jsonをエディタに表示」をON → 内容をペースト
4. `Config.gs` を編集して実際のIDとキーを設定:
   ```javascript
   SPREADSHEET_ID: 'あなたのスプレッドシートID',
   DRIVE_FOLDER_ID: 'あなたのDriveフォルダID',
   GEMINI_API_KEY: 'あなたのGemini APIキー',
   VR_APP_BASE_URL: 'https://your-vr-app.vercel.app',
   ```

#### 1-5. GAS をデプロイ

1. 「デプロイ → 新しいデプロイ」
2. 種類: 「ウェブアプリ」
3. 説明: `MVP v1`
4. 実行ユーザー: `自分`
5. アクセスできるユーザー: `全員`（MVPのため。本番では要制限）
6. デプロイ → URLをメモ

### 2. VRアプリ側の準備

```bash
cd goldfish-vr-system/vr-app

# 依存関係インストール
npm install

# 環境変数設定
cat > .env.local << 'EOF'
NEXT_PUBLIC_GAS_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
NEXT_PUBLIC_GAS_UPLOAD_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
EOF

# 開発サーバ起動
npm run dev
```

### 3. 動作確認

1. GAS Webapp URL にアクセス → アップロード画面が表示される
2. テスト画像をアップロード → Drive/Sheets に反映される
3. `?page=admin` で管理画面を確認
4. VRアプリの `/gallery` で作品一覧を確認
5. 作品をクリック → `/vr/{id}` で3D金魚が泳ぐ

## 責務分離の方針

### Googleアプリ側で管理すべきもの
- 画像の受付・保存（Drive）
- 作品台帳・ステータス管理（Sheets）
- AI画像解析の実行（Gemini API）
- 受付用Webフォーム（GAS HTML Service）
- 管理画面（GAS HTML Service）
- 通知処理（将来: Gmail / Chat）
- 外部APIとしてのデータ提供

### 外部Webアプリに任せるべきもの
- 3D/VR描画（Three.js + WebXR）
- リアルタイムアニメーション
- インタラクティブなUI
- 高度なフロントエンド体験

### Blenderが必要な工程（将来）
- ベースとなる金魚3Dモデルの高品質化
- ボーンアニメーションの作成
- テクスチャの手塗り修正
- 作品固有のカスタムモデル制作

## 将来の拡張案

### Phase 2: 品質向上
- Blender製の高品質金魚GLBモデルに差し替え
- AnimationMixer対応（ボーンアニメーション）
- 水面・水中エフェクト追加
- 音響効果

### Phase 3: 運営機能
- Google認証連携
- 保護者向け閲覧リンク共有
- QRコードでのVR体験導線
- イベント予約・受付管理
- 作品印刷サービス連携

### Phase 4: スケーリング
- Cloud Run / Vercel でのホスティング
- Cloud SQLへのDB移行
- 多人数同時接続（WebSocket）
- 作品ギャラリーの公開サイト化

### Phase 5: 商用化
- 決済連携（Stripe）
- 施設向けライセンス販売
- ホワイトラベル対応
- SLA・監視・アラート

## MVPで削るべき機能

- 高精度な完全自動3D生成 → ベースモデル + パラメータ変化で十分
- 本格認証 → MVPでは全員アクセス可
- 決済 → 不要
- 多人数同時接続 → 1人ずつの体験で十分
- 高度なCMS → Sheetsで管理
- リアルタイム共同編集 → 不要

## 商用化時に優先強化すべきポイント

1. **認証・認可**: Google OAuth / LINE Login 連携
2. **3Dモデル品質**: Blender製モデル + テクスチャ自動生成
3. **VR体験の没入感**: 水中環境、BGM、インタラクション
4. **運営ツール**: 予約管理、来場者統計、作品管理の効率化
5. **セキュリティ**: APIキー管理、アクセス制御、画像のモデレーション
