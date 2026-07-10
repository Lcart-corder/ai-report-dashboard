# 自己改善型AIエージェントシステム 設計書

Claude API (Fable 5 / Opus 4.8 / Haiku 4.5) を用いた自己改善型エージェント実行基盤。
LangChain / AutoGen / CrewAI との比較で挙げられる6つの特性をネイティブに実装する。

| 特性 | 実装 |
|---|---|
| 自己修正ループ | generate → critique → revise を目標スコア到達まで反復 (`server/agent/engine.ts`) |
| Memoryの永続化 | `agent_memories` テーブル。実行完了時に教訓を蒸留し、次回以降の実行に注入 |
| モデルルーティング | タスク複雑度を判定し light=Haiku 4.5 / standard=Opus 4.8 / heavy=Fable 5 を自動選択 (`server/agent/client.ts`) |
| Skillsの自動生成 | 高評価実行から手順書を蒸留して `agent_skills` に保存。同種タスクのシステムプロンプトに自動注入 |
| 長時間実行 (State管理) | 実行状態・各ステップを `agent_runs` / `agent_run_steps` に永続化。フロントはポーリングで進捗追跡 |
| コスト最適化 | ステップ単位でトークン・コストを記録。予算上限 (budgetUsd) 超過で自動打ち切り。プロンプトキャッシュ利用 |

## アーキテクチャ

```
[AgentConsole (React)] ──tRPC──> [agent router] ──> executeAgentRun()
                                                        │
      ┌─────────────────────────────────────────────────┤
      │ 1. route    複雑度判定 → モデル選択               │
      │ 2. recall   メモリ・スキルをDBから読込・注入       │
      │ 3. loop     generate → critique → revise         │  ← 予算超過で打ち切り
      │ 4. distill  スキル・教訓を蒸留してDBへ             │
      └─────────────────────────────────────────────────┘
                        │
              [MySQL: agent_runs / agent_run_steps /
                      agent_memories / agent_skills]
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
