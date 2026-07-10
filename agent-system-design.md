# 自己改善型AIエージェントシステム 設計書

Claude API (Fable 5 / Opus 4.8 / Haiku 4.5) を用いた自己改善型エージェント実行基盤。
参考記事「Claude Fable 5 無料期間で構築する自己改善型AIエージェントシステム」の設計思想
(Verification Loop / 3層メモリ / Router自己最適化 / Skills自動蓄積 / State管理 / Cost Controller)
をこのダッシュボードのスタック (tRPC + Drizzle/MySQL) に合わせて実装する。

| 特性 | 実装 |
|---|---|
| 自己修正ループ (Verification Loop) | generate → critique → revise を目標スコア到達まで反復。批評はタスク種別ごとの**重み付き多基準採点**(例: 事実正確性0.35 + 論理整合性0.30 + 網羅性0.20 + 実行可能性0.15)で、生成モデルと独立したモデルが行う |
| Memoryの永続化 | `agent_memories` テーブル(エピソード記憶=実行履歴は `agent_runs` が兼ねる)。実行完了時に教訓を蒸留し、次回以降の実行に注入 |
| モデルルーティング (自己最適化) | ヒューリスティック判定に加え、同種タスクで**3回以上・平均85点以上**の実績があるモデルを学習して優先 (`routeWithLearning`)。light=Haiku 4.5 / standard=Opus 4.8 / heavy=Fable 5 |
| Skillsの自動生成 | 閾値ゲート付き: 同種タスクの成功が**3回以上**蓄積されて初めてスキル化。既存スキルとの重複チェックあり。教訓(メモリ)は成功のたびに蓄積 |
| 長時間実行 (State管理) | 実行状態・各ステップを `agent_runs` / `agent_run_steps` に永続化(=チェックポイント)。失敗・予算超過・エスカレーション後は `agent.resume` で**途中から再開**可能 |
| コスト最適化 | ステップ単位でトークン・コストを記録。予算上限 (budgetUsd) 超過で自動打ち切り。プロンプトキャッシュ利用 |
| ドリフト監視 | 批評時に当初目標との整合度 (alignment 0〜1) を測定。0.7未満で軌道修正指示を次の改訂に注入 |
| Human-in-the-Loop | 最大反復まで目標スコア未達の場合、自動完了せず `escalated`(要確認)で停止。UIから反復追加して再開できる |
| 品質ゲート | 草稿70 / レビュー85 / 本番93 のプリセットを目標スコアとして選択 |

## アーキテクチャ

```
[AgentConsole (React)] ──tRPC──> [agent router: start / resume / getRun / ...] ──> executeAgentRun()
                                                        │
      ┌─────────────────────────────────────────────────┤
      │ 1. route    複雑度判定 + 過去実績から学習 → モデル選択│
      │ 2. recall   メモリ・スキルをDBから読込・注入          │
      │ 3. loop     generate → critique(多基準+ドリフト監視) │  ← 予算超過で打ち切り
      │             → revise                              │
      │ 4. 終了判定  目標達成=completed / 未達=escalated     │
      │ 5. distill  閾値ゲートを通過したらスキル蒸留          │
      └─────────────────────────────────────────────────┘
                        │
              [MySQL: agent_runs / agent_run_steps /
                      agent_memories / agent_skills]

再開 (resume): agent_run_steps から draft / feedback / bestScore /
iteration を復元し、中断地点から同じループを続行する。
```

- **Fable 5 のポリシー拒否対策**: heavy ティアはサーバーサイドフォールバック
  (`server-side-fallback-2026-06-01` beta) で Opus 4.8 に自動フォールバック。
- **批評の独立性**: critique は生成モデルと独立に standard ティア (Opus 4.8) で採点。
- **ルーティングのコスト最適化**: 明確に短い/長いタスクはAPI呼び出しなしのヒューリスティックで即決し、
  曖昧な場合のみ Haiku で分類する。

## セットアップ

1. 環境変数 `ANTHROPIC_API_KEY` を設定
2. `pnpm db:push` でマイグレーションを適用(agent_* 4テーブルが追加される)
3. サイドバー「AI > 自己改善エージェント」(`/ai/agent`) から実行

## 主要ファイル

- `server/agent/client.ts` — Anthropic クライアント、モデルティア定義、複雑度ルーティング
- `server/agent/engine.ts` — 実行エンジン(自己修正ループ・蒸留)
- `server/agent/store.ts` — DBアクセス層
- `server/routers.ts` — tRPC `agent` ルーター (start / getRun / listRuns / listMemories / listSkills)
- `drizzle/schema.ts` — agent_runs / agent_run_steps / agent_memories / agent_skills
- `client/src/pages/ai/AgentConsole.tsx` — 実行コンソールUI
