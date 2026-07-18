# 助成金対応リスキリング動画学習システム — Claude Code 指示書

## プロジェクト概要
リスキリング研修の動画学習LMS。単なる動画配信ではなく、厚労省・人材開発支援助成金の
支給申請に必要な受講証跡（LMSログ、修了証、進捗率等）を残すことを主目的とする。
併せて、協業先（販売パートナー）ごとの案件・研修売上・成果報酬（研修売上の20%、
助成金受給額には非連動）を管理する。

詳細な機能要件・DB要件・画面要件は [REQUIREMENTS.md](./REQUIREMENTS.md) を参照。

## 現状
Phase 1 MVP を既存モノレポ（Vite + Express + tRPC + Drizzle/MySQL）内に実装済み。
このディレクトリは仕様の置き場。実装は以下に配置:
- スキーマ: `drizzle/schema.ts`（末尾のLMSセクション、24テーブル）
- サーバー層: `server/lms.ts`（マスターキー検証・進捗計算・修了判定・修了証発行・監査ログ・成果報酬20%計算・CSV出力・デモseed）
- tRPCルーター: `server/routers.ts` の `lms` 名前空間
- 画面: `client/src/pages/lms/`（管理: `/lms`, `/lms/companies`, `/lms/courses`, `/lms/partners`, `/lms/checklist`, `/lms/audit` ／ 受講者: `/lms/learn/:learnerId`, `/lms/learn/enrollment/:enrollmentId`）

### 動作確認
1. `DATABASE_URL` を設定し MySQL を用意（`pnpm db:push` でマイグレーション）
2. `pnpm dev` で起動 → `/lms` を開く
3. ダッシュボードの「デモデータ投入」でサンプル企業・コース・受講者・マスターキーを生成
4. 「企業・受講者」で受講者にコースを割当 → 受講画面で 視聴→チェック→テスト→レポート→修了証 を確認
※ DB未接続時はUIは表示されるが数値は空（db.ts と同じくグレースフルに空返却）。

## 開発時に外してはいけない7原則（要件定義書 13章より）
1. 受講者ごとのID管理
2. 企業別マスターキーによる登録制限（マスターキーなしの自由登録は不可）
3. LMSによる視聴・進捗ログ保存（管理者でも改ざん不可）
4. 標準学習時間10時間以上・訓練期間内修了の管理
5. 確認チェック・テスト・レポートによる修了判定
6. 修了証・LMS証跡・受講者一覧の出力（提出有無に関わらず整備・保管できる状態）
7. 協業先研修売上20%を基本にした成果報酬管理（助成金受給額には連動させない）

## テナント・権限モデル
- マルチテナント: 協業先(partners) → 導入企業(companies) → 事業所(company_branches) → 受講者(users)
- ロール: Lカート運営管理者 / 協業先管理者 / 導入企業管理者 / 受講スタッフ / 講師・研修担当 /
  社労士・申請確認者 / システム管理者
- 企業ごとのデータ分離必須（証跡出力は自社分のみ閲覧可能）

## 主要テーブル（詳細は REQUIREMENTS.md §8）
companies, company_branches, partners, users, roles, master_keys, courses, lessons,
materials, enrollments, progress_logs, completion_checks, quizzes, quiz_questions,
quiz_results, learning_reports, certificates, notifications, notification_logs,
application_checklists, exports, partner_sales, success_fees, audit_logs

## MVP フェーズ
- Phase 1: ログイン/マスターキー/企業/受講者/コース管理、動画視聴・視聴ログ、確認チェック、
  確認テスト、修了判定、修了証PDF、進捗管理、メールリマインド、LMS受講状況CSV出力
- Phase 2: 申請準備チェックリスト、社労士確認アカウント、証跡一括PDF出力、監査ログ強化、
  LINE/Chatwork/Slack通知、価格疎明用データ管理
- Phase 3: 協業先管理、案件管理、協業先売上管理、成果報酬20%計算、請求予定額管理、月次レポート

## ロール・認証（アクセス制御）
4グループ／7ロール。スコープ階層: プロジェクト（案件）→ 導入企業 → 事業所 → 会社員。
- `operator_admin`（提供会社の管理者）: 全体
- `project_manager`（プロジェクト管理者）: 担当プロジェクト配下の全企業
- `partner_admin`（協業先管理者）: 自協業先の全案件・企業・売上
- `instructor`（講師・研修担当）: コンテンツのみ（企業/個人情報・請求は不可）
- `company_rep`（お客様の代表）: 自社のみ
- `employee`（会社員=`learners`）: 自分の受講のみ
- `advisor`（社労士）: 担当プロジェクト/企業の証跡確認・差戻し

実装:
- ログイン管理アカウント= `lms_members`（role + project/company/partner スコープ）、受講者= `learners`。
- 認証統合: `resolveLmsIdentity(ctx.user)` が users 行(email/role) から LMS ロールを解決。
  優先順位 = lms_members 一致 → users.role=admin（運営扱い）→ learners 一致 → メンバー0件時は運営(bootstrap)。
- スコープ解決: `accessibleCompanyIdsForIdentity` / `canAccessCompanyIdentity`（null=無制限）。
- tRPC procedure: `lmsProcedure`(要ログイン+identity付与) / `operatorProcedure`(運営のみ) / `contentProcedure`(運営・講師・PJ管理者)。
  機微な操作(企業/協業先/権限/マスターキー/Webhook/seed)は operator、コース/教材/テスト編集は content に限定。
  company スコープの read(dashboard/companies/learners等)は identity のアクセス可能企業に自動フィルタ。
- 画面 `/lms/roles`(見える化) と `/lms/projects`(プロジェクト・メンバー割当)。ナビはロールで自動絞り込み。
- ※DB未接続・メンバー0件でも既存UIは壊れない(運営にフォールバック)。

### 受講者(会社員)ログイン導線 (FR-01/FR-02)
1. 受講者がログイン(OAuth)後 `/lms/learn` へ。`LmsLearnEntry` がロール判定で振り分け:
   受講者→`/lms/learn/:learnerId`、未登録→`/lms/register`、管理系→`/lms`。
2. `/lms/register` でマスターキー入力 → `lms.register.validateKey` で即時検証 →
   `lms.register.submit` が `registerLearnerWithMasterKey(ctx.user, ...)` を実行。
   - ログイン中メールで既存(招待済み)learnerがあればリンク(firstLoginAt/active更新)、無ければ新規発行。
   - マスターキーの利用回数を消費(`consumeMasterKey`)。マスターキー無しの自由登録は不可。
3. 以降 `resolveLmsIdentity` がメール一致で employee として解決 → 学習ポータルへ。

## 通知チャネル戦略（多社セグメント配信）
たくさんの導入企業が絡む前提のため、受講者への到達は **メール（Amazon SES）を主軸 + LINE任意** とする。
- **メール主軸**: CSV登録で全社員のアドレスを保有 → 会社/部署/個人でセグメント配信可能。SESは1,000通≈$0.10と最安・線形スケール。
- **LINE任意**: 友だち追加した希望者（`learners.lineUserId` 保有）にのみプッシュ。1公式アカウントの月200通無料枠は全社合算のため主軸には不向き。
- **管理者/協業先向け内部通知**: Slack/Chatwork/Google Chat の Webhook（無料）を想定（未配線）。
- 配線は `server/lms-notify.ts`（`dispatchByChannel`）。`sendReminders` の channel: `email`/`line`/`app`/`auto`（受講者の希望チャネル）。
- 認証情報が未設定なら送信は `queued`（記録のみ）にフォールバックし、設定後に実送信へ切替。

### 通知の環境変数
- メール(SES): `AWS_REGION`, `LMS_MAIL_FROM`（SESで検証済み送信元）, AWS認証情報。`@aws-sdk/client-ses` は動的import（未導入でもビルドは壊れない）。
- LINE: 既存 `integrations`（`line_official`, status=active）の `channelAccessToken`/`channelSecret` を利用。

## 注意点
- 研修費・LMS利用料・運用支援費・AIツール利用料・協業先売上・Lカート成果報酬・助成金申請額/受給額は
  それぞれ分離して管理し、混同しないこと（実質無料スキーム等の疑義を避けるため）。
- 視聴ログ・チェック履歴・テスト結果・修了判定は監査ログ対象。管理者による直接編集は不可とし、
  修正が必要な場合は差戻し・再実施のフローを通す。
- 成果報酬は「協業先の研修売上 × 報酬率」で算定し、助成金受給額には一切連動させない。
