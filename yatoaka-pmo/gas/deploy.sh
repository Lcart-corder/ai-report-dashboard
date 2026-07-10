#!/usr/bin/env bash
#
# GAS デプロイ補助スクリプト（clasp）。
# 事前に一度だけ:  clasp login   （ブラウザで Google 認証）
# その後このスクリプトで push → deploy を行う。
#
# 使い方:
#   ./deploy.sh                 # 既存の .clasp.json を使って push + deploy
#   ./deploy.sh --create        # 新規スタンドアロン Apps Script を作成してから push + deploy
#
set -euo pipefail
cd "$(dirname "$0")"

CLASP="npx --yes @google/clasp"

if ! $CLASP login --status >/dev/null 2>&1; then
  echo "エラー: clasp にログインしていません。まず 'npx @google/clasp login' を実行してください。" >&2
  exit 1
fi

if [[ "${1:-}" == "--create" ]]; then
  echo "新規 Apps Script プロジェクトを作成します..."
  $CLASP create --type standalone --title "yatoaka-pmo-api" --rootDir .
fi

if [[ ! -f .clasp.json ]]; then
  echo "エラー: .clasp.json がありません。'.clasp.json.example' を参考に scriptId を設定するか、--create を使ってください。" >&2
  exit 1
fi

echo "コードをアップロード中 (clasp push)..."
$CLASP push --force

echo "ウェブアプリとしてデプロイ中 (clasp deploy)..."
$CLASP deploy --description "yatoaka-pmo api $(date +%Y%m%d-%H%M)"

echo
echo "完了しました。デプロイ一覧を確認してください:"
$CLASP deployments
echo
echo "注意: 初回は Apps Script エディタで setSpreadsheetId('...') と setupSpreadsheet()/seedSampleData()"
echo "      （または initAll('...')）を実行し、ウェブアプリのアクセス権を『全員』に設定してください。"
