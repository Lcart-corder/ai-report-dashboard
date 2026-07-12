#!/usr/bin/env bash
#
# GAS デプロイ補助スクリプト（clasp v3 対応）。
# 事前に一度だけ:  npx @google/clasp login   （ブラウザで Google 認証）
#
# 使い方:
#   ./deploy.sh                 # 既存の .clasp.json を使って push → deploy（初回は新規デプロイ作成）
#   ./deploy.sh --create        # 新規スタンドアロン Apps Script を作成してから push → deploy
#
# 重要: 2回目以降の実行では、初回に作成したデプロイ（.deployment-id に記録）を
#       「更新（redeploy）」します。毎回 `clasp deploy` を素で呼ぶと、そのたびに
#       "別の新しいデプロイ（別のURL）" が作られてしまい、既存URLのアクセス権
#       設定やコードが更新されない問題が起きるためです。
#
set -euo pipefail
cd "$(dirname "$0")"

CLASP="npx --yes @google/clasp"
DEPLOY_ID_FILE=".deployment-id"

# ログイン確認（clasp v3: show-authorized-user）
if ! $CLASP show-authorized-user >/dev/null 2>&1; then
  echo "エラー: clasp にログインしていません。まず 'npx @google/clasp login' を実行してください。" >&2
  exit 1
fi

if [[ "${1:-}" == "--create" ]]; then
  echo "新規 Apps Script プロジェクトを作成します..."
  $CLASP create-script --type standalone --title "yatoaka-pmo-api" --rootDir .
  rm -f "$DEPLOY_ID_FILE"
fi

if [[ ! -f .clasp.json ]]; then
  echo "エラー: .clasp.json がありません。'.clasp.json.example' を参考に scriptId を設定するか、--create を使ってください。" >&2
  exit 1
fi

echo "コードをアップロード中 (clasp push)..."
$CLASP push --force

if [[ -f "$DEPLOY_ID_FILE" ]]; then
  DEPLOY_ID="$(cat "$DEPLOY_ID_FILE")"
  echo "既存デプロイを更新中 (clasp redeploy ${DEPLOY_ID})..."
  $CLASP redeploy "$DEPLOY_ID" -d "yatoaka-pmo api $(date +%Y%m%d-%H%M)"
  echo
  echo "更新完了。Web App URL は変わっていません（アクセス権設定もそのまま維持されます）。"
else
  echo "初回デプロイを作成中 (clasp deploy)..."
  OUT="$($CLASP deploy --description "yatoaka-pmo api $(date +%Y%m%d-%H%M)")"
  echo "$OUT"
  NEW_ID="$(echo "$OUT" | grep -oE 'AKfycb[A-Za-z0-9_-]+' | head -1)"
  if [[ -n "$NEW_ID" ]]; then
    echo "$NEW_ID" > "$DEPLOY_ID_FILE"
    echo
    echo "デプロイID(${NEW_ID})を ${DEPLOY_ID_FILE} に保存しました。"
    echo "次回以降の ./deploy.sh は、このデプロイを『更新』します（新規URLは作られません）。"
  fi
fi

echo
echo "デプロイ一覧:"
$CLASP list-deployments || true
echo
echo "▼ 次にやること（初回のみ）"
echo "  1) Apps Script エディタで initAll('スプレッドシートID') を実行"
echo "  2) 『デプロイを管理』でウェブアプリのアクセス権を『全員』に設定し、/exec URL を控える"
echo "  3) app/.env.local に NEXT_PUBLIC_GAS_URL=<exec URL> を設定"
