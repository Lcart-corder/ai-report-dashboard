# やとアカ運営 AI-PMO — GAS バックエンド

Google Apps Script の Web App をバックエンド（REST 風 API）、Google スプレッドシートを
データベースとする構成です（要件定義書 9.1 の初期構成）。フロントエンド（`../app`）は
`NEXT_PUBLIC_GAS_URL` を設定すると、この Web App と同期して動作します。

## ファイル構成

| ファイル | 役割 |
| --- | --- |
| `config.gs` | スプレッドシートID（スクリプトプロパティ）、シート名・列定義、リソース対応 |
| `utils.gs` | シートアクセス（列名ベース）・JSON 応答・監査ログ |
| `crud.gs` | projects / tasks / meetings の汎用 CRUD（削除はアーカイブ） |
| `main.gs` | `doGet` / `doPost` ルーター |
| `setup.gs` | シート作成・ヘッダー投入・サンプルデータ投入 |
| `appsscript.json` | マニフェスト（Web App 公開設定・V8） |

## API 仕様

- `GET  ?resource=ping` … ヘルスチェック
- `GET  ?resource=bootstrap` … `{ projects, tasks, meetings }` を一括取得
- `GET  ?resource=projects|tasks|meetings` … 一覧
- `POST`（`Content-Type: text/plain`、本文は JSON）
  ```json
  { "resource": "projects", "action": "create|update|delete", "payload": { ... } }
  ```
  応答は `{ "success": true, "data": ..., "error": null }`。

> ブラウザからの POST はプリフライト（CORS）を避けるため `text/plain` で送ります。
> GAS 側は本文を JSON として解釈します。フロントの `src/lib/api.ts` がこの規約に従います。

## デプロイ手順（GUI）

1. **スプレッドシートを作成**し、URL の `/d/` と `/edit` の間の ID を控える。
2. [script.google.com](https://script.google.com/) で新規プロジェクトを作成。
3. `gas/` 内の `.gs` ファイルの中身を、同名ファイルとして貼り付ける
   （`config` `utils` `crud` `main` `setup`）。マニフェストは「プロジェクトの設定 →
   『appsscript.json を表示』」を有効化し、`appsscript.json` の内容に置き換える。
4. エディタで `setSpreadsheetId('スプレッドシートID')` を実行（初回は権限承認）。
5. `setupSpreadsheet()` を実行 → 続けて `seedSampleData()` を実行
   （または `initAll('スプレッドシートID')` を一度実行すれば 4〜5 をまとめて行える）。
6. **デプロイ → 新しいデプロイ → 種類「ウェブアプリ」**
   - 次のユーザーとして実行: 自分
   - アクセスできるユーザー: 全員
   - デプロイ後の `…/exec` URL を控える。
7. フロント側 `../app/.env.local` に `NEXT_PUBLIC_GAS_URL=<exec URL>` を設定して起動。

## デプロイ手順（clasp / CLI）

```bash
# 1) 一度だけ Google 認証（ブラウザが開く）
npx @google/clasp login

# 2a) 新規 Apps Script を作成してデプロイ
./deploy.sh --create

# 2b) 既存 Apps Script を使う場合は scriptId を設定してから
cp .clasp.json.example .clasp.json   # scriptId を記入
./deploy.sh
```

`deploy.sh` は `clasp push`（`.claspignore` により `.gs` と `appsscript.json` のみ）→ `clasp deploy` を実行します。
`.clasp.json`（実体）はコミットしない想定です。`.clasp.json.example` を雛形として使ってください。

> **補足**: `clasp login` はブラウザでの Google 認証（対象アカウントの権限）が必要なため、
> この工程は各自の環境で実行してください（第三者が代行することはできません）。
> ログイン後の `push`/`deploy` は `./deploy.sh` で自動化されます。

## 動作確認

デプロイ URL に対して:

```bash
curl "https://script.google.com/macros/s/XXXX/exec?resource=ping"
# => {"success":true,"data":{"ok":true,...},"error":null}

curl "https://script.google.com/macros/s/XXXX/exec?resource=bootstrap"
# => {"success":true,"data":{"projects":[...],"tasks":[...],"meetings":[...]},"error":null}
```

## スプレッドシート構成（シート＝テーブル）

`config.gs` の `COLUMNS` がヘッダー定義です。削除は物理削除せず `is_archived=true`
（読み取り時に除外）で行います。詳細なデータ設計は [`../docs/03_データベース設計.md`](../docs/03_データベース設計.md) を参照してください。
