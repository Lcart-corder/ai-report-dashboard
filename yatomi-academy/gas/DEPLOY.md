# デプロイ手順（やとみ放課後アカデミー 予算ブック）

> Claude はサンドボックス環境で動作しており、あなたの Google アカウントへ認可できないため
> 直接のデプロイは行えません。以下のどちらかで**あなたの手元から**デプロイしてください。
> **所要時間：A（手動）＝約1分、B（clasp）＝約5分**。

対象ファイル：`yatomi-academy/gas/setup_academy.gs`（本体）／`appsscript.json`（マニフェスト）

---

## A. 手動で貼り付け（最速・インストール不要）★おすすめ

1. ブラウザで **https://sheets.new** を開く（新規スプレッドシート）
2. メニュー **拡張機能 → Apps Script**
3. 既定の `コード.gs` の中身をすべて削除
4. `setup_academy.gs` の中身を**全文コピーして貼り付け** → 💾保存（Ctrl/Cmd+S）
5. 上部の関数プルダウンで **`setupAcademyBook`** を選択 → **▶ 実行**
6. 初回は「承認が必要」→ 自分のアカウントで許可（`このアプリは確認されていません` → 詳細 → 移動）
7. 完了。16シートが生成され、**`★月次シミュレーション`** が開きます

> 権限スコープはスプレッドシート操作のみ（`appsscript.json` に外部送信なし）。

---

## B. clasp でデプロイ（Git管理・再現性重視）

前提：Node.js（v18+）。この環境では未導入なので、あなたのPCで実施してください。

```bash
# 1) clasp を導入
npm install -g @google/clasp

# 2) Google 認可（ブラウザが開く。あなたのアカウントでログイン）
clasp login

# 3) このディレクトリで、Sheets 連動の新規プロジェクトを作成
cd yatomi-academy/gas
clasp create --title "やとみ放課後アカデミー予算ブック" --type sheets --rootDir .
#  → .clasp.json が生成され、新しいスプレッドシート＋バインドスクリプトが作られます
#  （appsscript.json は本リポジトリのものを使用。上書き確認が出たら既存を優先）

# 4) コードをアップロード
clasp push -f

# 5) エディタ/スプレッドシートを開く
clasp open
```

その後、エディタで関数 **`setupAcademyBook`** を実行（初回は承認）。

### 既存のスプレッドシートに紐付ける場合
新規作成ではなく既存ブックに入れたいときは、`clasp create` の代わりに
`.clasp.json.example` を `.clasp.json` にリネームし、`scriptId` を対象の
Apps Script プロジェクトIDに書き換えて `clasp push -f`。

---

## トラブルシュート

| 症状 | 対処 |
|---|---|
| 「名前付き範囲『参加者数』は存在しません」 | 修正済み（`_named` の存在チェック＋`flush()`）。最新の `setup_academy.gs` を使用してください |
| 実行時に承認画面が繰り返し出る | 一度 `setupAcademyBook` を選び直して再実行。スコープは Sheets のみ |
| `clasp push` で appsscript.json 競合 | 本リポジトリの `appsscript.json` を採用（`overwrite? → yes`） |
| 別ブックに作りたい | スクリプト冒頭 `ACADEMY_SS_ID` に対象ブックIDを設定して実行 |

## 生成物
16シート：★月次シミュレーション（主軸）／00_入力条件〜13_行政提出様式出力／14_収支予算書／15_中期収支計画。
`00_入力条件` と `★月次シミュレーション` の黄色セルを編集すると全体が連動します。
