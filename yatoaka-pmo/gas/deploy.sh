#!/usr/bin/env bash
#
# GAS デプロイ補助スクリプト（clasp v3 対応）。
# 事前に一度だけ:  npx @google/clasp login   （ブラウザで Google 認証）
#
# 使い方:
#   ./deploy.sh                 # 既存の .clasp.json を使って push → deploy（ステップ3のみ）
#   ./deploy.sh --create        # 新規スタンドアロン Apps Script を作成してから push → deploy
#
set -euo pipefail
cd "$(dirname "$0")"

CLASP="npx --yes @google/clasp"

# ログイン確認（clasp v3: show-authorized-user）
if ! $CLASP show-authorized-user >/dev/null 2>&1; then
  echo "エラー: clasp にログインしていません。まず 'npx @google/clasp login' を実行してください。" >&2
  exit 1
fi

if [[ "${1:-}" == "--create" ]]; then
  echo "新規 Apps Script プロジェクトを作成します..."
  $CLASP create-script --type standalone --title "yatoaka-pmo-api" --rootDir .
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
echo "デプロイ一覧:"
$CLASP list-deployments || true
echo
echo "▼ 次にやること"
echo "  1) Apps Script エディタで（未実施なら）initAll('スプレッドシートID') を実行"
echo "  2) 『デプロイを管理』でウェブアプリのアクセス権を『全員』に設定し、/exec URL を控える"
echo "  3) app/.env.local に NEXT_PUBLIC_GAS_URL=<exec URL> を設定"
