/**
 * やとアカ運営AI-PMOシステム — サンプル（モック）データ。
 * 初期試作版のため、フロントエンド内に固定データを保持する。
 * 将来は Google Apps Script / スプレッドシート等の API へ差し替える。
 */

export type Priority = "最高" | "高" | "中" | "低";
export type ProjectStatus = "進行中" | "計画中" | "完了" | "未着手" | "保留" | "中止";

/* ---------------- 現在ユーザー ---------------- */
export const currentUser = {
  name: "山田 太郎",
  role: "PMO管理者",
};

/* ---------------- ダッシュボード（画面1） ---------------- */
export const dashboardStats = {
  overallProgress: 68,
  overallDone: 342,
  overallTotal: 502,
  eventProgress: 72,
  eventDone: 123,
  eventTotal: 171,
  dueThisWeek: 18,
  dueThisWeekHigh: 6,
  overdue: 5,
  overdueHigh: 2,
};

export const todayTasks = [
  { title: "イベント企画書（案）のレビュー", bukai: "イベント部会", priority: "高", time: "今日 10:00", assignee: "山田 太郎" },
  { title: "協賛企業リストの更新", bukai: "広報・協賛部会", priority: "中", time: "今日 11:30", assignee: "佐藤 花子" },
  { title: "会場レイアウト図の確認", bukai: "イベント部会", priority: "高", time: "今日 14:00", assignee: "鈴木 一郎" },
  { title: "AI提案の確認と承認", bukai: "PMO事務局", priority: "低", time: "今日 15:00", assignee: "高橋 美咲" },
  { title: "タスク進捗レポートの作成", bukai: "PMO事務局", priority: "中", time: "今日 16:00", assignee: "山田 太郎" },
] as const;

export const weekMeetings = [
  { date: "5/20 (火)", time: "10:00 - 11:00", title: "イベント部会 定例会議", place: "大会議室A / オンライン", tag: "定例" },
  { date: "5/21 (水)", time: "14:00 - 15:30", title: "広報・協賛部会 打ち合わせ", place: "大会議室B", tag: "打ち合わせ" },
  { date: "5/22 (木)", time: "16:00 - 17:00", title: "PMO全体会議", place: "オンライン", tag: "定例" },
] as const;

export const aiSuggestions = [
  { icon: "bulb", title: "タスクの遅延リスクがあります", body: "「協賛企業リストの更新」が3日遅延する可能性があります。リソースの調整を検討してください。", action: "対応する" },
  { icon: "users", title: "リソースの最適化を提案します", body: "イベント部会のタスク負荷が高くなっています。タスクの再配分を検討してください。", action: "確認する" },
  { icon: "doc", title: "類似資料を見つけました", body: "過去の類似イベント資料が3件見つかりました。参考にしてください。", action: "見る" },
] as const;

export const bukaiProgress = [
  { name: "イベント部会", progress: 72, done: 123, total: 171, status: "順調" },
  { name: "広報・協賛部会", progress: 65, done: 78, total: 120, status: "順調" },
  { name: "会場・設備部会", progress: 58, done: 45, total: 78, status: "やや遅延" },
  { name: "運営部会", progress: 71, done: 56, total: 79, status: "順調" },
  { name: "PMO事務局", progress: 80, done: 40, total: 50, status: "順調" },
] as const;

export const recentDocs = [
  { name: "イベント企画書（案）_v2.1.pdf", bukai: "イベント部会", author: "山田 太郎", updated: "2025/05/19 14:30", kind: "pdf" },
  { name: "協賛企業リスト_20250519.xlsx", bukai: "広報・協賛部会", author: "鈴木 花子", updated: "2025/05/19 11:15", kind: "xlsx" },
  { name: "会場レイアウト図_v1.3.pptx", bukai: "会場・設備部会", author: "田中 一郎", updated: "2025/05/18 16:45", kind: "pptx" },
] as const;

/* ---------------- プロジェクト一覧（画面2） ---------------- */
export interface Project {
  id: string;
  name: string;
  bukai: string;
  owner: string;
  start: string;
  due: string;
  progress: number;
  priority: Priority;
  status: ProjectStatus;
  meetings: number;
  docs: number;
}

export const projects: Project[] = [
  { id: "PJ0001", name: "キックオフイベント運営", bukai: "イベント部会", owner: "山田 太郎", start: "2025/04/01", due: "2025/07/31", progress: 62, priority: "高", status: "進行中", meetings: 8, docs: 15 },
  { id: "PJ0002", name: "AI議事録要約機能の改善", bukai: "DX推進部会", owner: "山田 太郎", start: "2024/04/01", due: "2024/06/30", progress: 75, priority: "高", status: "進行中", meetings: 8, docs: 15 },
  { id: "PJ0003", name: "ユーザー管理基盤の刷新", bukai: "システム基盤部会", owner: "佐藤 花子", start: "2024/03/15", due: "2024/07/31", progress: 60, priority: "高", status: "進行中", meetings: 6, docs: 12 },
  { id: "PJ0004", name: "セキュリティ強化対応", bukai: "セキュリティ部会", owner: "鈴木 一郎", start: "2024/02/01", due: "2024/05/31", progress: 90, priority: "最高", status: "進行中", meetings: 10, docs: 18 },
  { id: "PJ0005", name: "UI/UX改善プロジェクト", bukai: "ユーザー体験部会", owner: "高橋 美咲", start: "2024/04/10", due: "2024/08/15", progress: 30, priority: "中", status: "進行中", meetings: 4, docs: 9 },
  { id: "PJ0006", name: "データ分析基盤の構築", bukai: "データ活用部会", owner: "田中 健一", start: "2024/01/05", due: "2024/04/30", progress: 100, priority: "高", status: "完了", meetings: 12, docs: 22 },
  { id: "PJ0007", name: "通知システムの最適化", bukai: "運用改善部会", owner: "伊藤 翔太", start: "2024/02/20", due: "2024/05/15", progress: 100, priority: "中", status: "完了", meetings: 5, docs: 11 },
  { id: "PJ0008", name: "ポータルサイト再構築", bukai: "広報・連携部会", owner: "渡辺 直子", start: "2024/03/01", due: "2024/09/30", progress: 10, priority: "中", status: "計画中", meetings: 3, docs: 7 },
  { id: "PJ0009", name: "レポート自動化の検討", bukai: "業務効率化部会", owner: "小林 正樹", start: "2024/05/01", due: "2024/10/31", progress: 0, priority: "低", status: "未着手", meetings: 0, docs: 0 },
];

/* ---------------- プロジェクト詳細（画面3） ---------------- */
export const projectDetail = {
  id: "PJ0001",
  name: "キックオフイベント運営",
  status: "進行中" as ProjectStatus,
  progress: 62,
  owner: "山田 太郎",
  ownerTitle: "PMO推進室",
  due: "2025/07/31 (木)",
  daysLeft: 25,
  summary:
    "新規プロジェクトのキックオフイベントを企画・運営し、関係者のプロジェクト理解促進と円滑なスタートを支援する。",
  purpose: "関係者間の共通認識形成、プロジェクトの方向性共有、チームの一体感醸成",
  target: "社内関係者、協力会社、外部パートナー、経営層 （想定人数：約120名）",
  budget: "¥3,500,000（うち消化：¥2,170,000　62%）",
  kpi: ["参加者満足度：4.0/5.0以上", "出席率：90%以上", "アンケート回答率：80%以上"],
  midterm: "プロジェクトの成功に向けた関係構築を強化し、全社的な協力体制を構築する。",
  parentTasks: [
    { name: "イベント企画", progress: 100, owner: "佐藤 花子", due: "2025/05/20", status: "完了" },
    { name: "会場・備品手配", progress: 80, owner: "鈴木 一郎", due: "2025/06/10", status: "進行中" },
    { name: "プログラム作成・登壇依頼", progress: 60, owner: "高橋 美咲", due: "2025/06/20", status: "進行中" },
    { name: "告知・参加者管理", progress: 40, owner: "伊藤 健", due: "2025/06/30", status: "進行中" },
    { name: "リハーサル・当日運営", progress: 0, owner: "山田 太郎", due: "2025/07/31", status: "未着手" },
  ],
  latestMeeting: {
    title: "第3回 キックオフイベント運営定例",
    tag: "定例会議",
    date: "2025/06/05 (木)  10:00-11:00",
    attendees: "山田 太郎、佐藤 花子、鈴木 一郎、高橋 美咲、他 3名",
    topics: "プログラム構成の最終確認、登壇者リハーサル日程調整、会場レイアウト確認",
    next: "2025/06/12 (木)  10:00-11:00",
  },
  stakeholders: [
    { name: "佐藤 花子", dept: "PMO推進室" },
    { name: "鈴木 一郎", dept: "総務部" },
    { name: "高橋 美咲", dept: "広報部" },
    { name: "伊藤 健", dept: "情報システム部" },
    { name: "田中 裕介", dept: "経営企画部" },
  ],
  issues: [
    { level: "高", text: "参加者の出欠回答率が目標に対して低下しています（現状 65%）", date: "2025/06/05", icon: "alert" },
    { level: "中", text: "外部講演者のスケジュール調整に遅延の可能性があります", date: "2025/06/03", icon: "warn" },
    { level: "低", text: "当日の機材リハーサル未完了", date: "2025/06/01", icon: "info" },
  ],
  aiComment:
    "全体の進捗は順調ですが、参加者の出欠回答率が低下傾向です。告知の再送や経営層からのリマインドを実施することで、目標達成の可能性が高まります。",
};

/* ---------------- WBS / タスク管理（画面4） ---------------- */
export interface WbsRow {
  code: string;
  name: string;
  level: 0 | 1 | 2;
  owner: string;
  start: string;
  due: string;
  priority: Priority;
  status: string;
  progress: number;
  comments: number;
  depends?: string;
}

export const wbsRows: WbsRow[] = [
  { code: "1", name: "プロジェクト管理", level: 0, owner: "田中 太郎", start: "2025/05/01", due: "2025/08/29", priority: "高", status: "進行中", progress: 42, comments: 3 },
  { code: "1.1", name: "プロジェクト計画策定", level: 1, owner: "鈴木 花子", start: "2025/05/01", due: "2025/05/30", priority: "中", status: "進行中", progress: 65, comments: 2 },
  { code: "1.1.1", name: "スコープ定義", level: 2, owner: "田中 太郎", start: "2025/05/01", due: "2025/05/09", priority: "高", status: "完了", progress: 100, comments: 0 },
  { code: "1.1.2", name: "スケジュール策定", level: 2, owner: "鈴木 花子", start: "2025/05/12", due: "2025/05/16", priority: "中", status: "進行中", progress: 70, comments: 1, depends: "1.1.1" },
  { code: "1.1.3", name: "体制・役割定義", level: 2, owner: "佐藤 健一", start: "2025/05/19", due: "2025/05/30", priority: "中", status: "未着手", progress: 0, comments: 0, depends: "1.1.2" },
  { code: "1.2", name: "進捗管理", level: 1, owner: "田中 太郎", start: "2025/06/02", due: "2025/06/27", priority: "高", status: "進行中", progress: 30, comments: 1, depends: "1.1" },
  { code: "1.2.1", name: "進捗モニタリング", level: 2, owner: "鈴木 花子", start: "2025/06/02", due: "2025/06/13", priority: "中", status: "進行中", progress: 50, comments: 2, depends: "1.2.1" },
  { code: "1.2.2", name: "課題管理", level: 2, owner: "佐藤 健一", start: "2025/06/16", due: "2025/06/20", priority: "高", status: "未着手", progress: 0, comments: 0, depends: "1.2.1" },
  { code: "1.2.3", name: "会議体運営", level: 2, owner: "高橋 美咲", start: "2025/06/23", due: "2025/06/27", priority: "中", status: "未着手", progress: 0, comments: 0, depends: "1.2.2" },
  { code: "2", name: "要件定義", level: 0, owner: "佐藤 健一", start: "2025/06/30", due: "2025/07/25", priority: "高", status: "未着手", progress: 10, comments: 1 },
  { code: "2.1", name: "現状分析", level: 1, owner: "高橋 美咲", start: "2025/06/30", due: "2025/07/04", priority: "中", status: "完了", progress: 100, comments: 0 },
  { code: "2.2", name: "要件ヒアリング", level: 1, owner: "田中 太郎", start: "2025/07/07", due: "2025/07/18", priority: "高", status: "進行中", progress: 40, comments: 2, depends: "2.1" },
  { code: "2.3", name: "要件定義書作成", level: 1, owner: "佐藤 健一", start: "2025/07/14", due: "2025/07/25", priority: "中", status: "未着手", progress: 0, comments: 0, depends: "2.2" },
];

export const wbsDetail = {
  code: "1.1.2",
  name: "スケジュール策定",
  status: "進行中",
  path: "1.プロジェクト管理 > 1.1 プロジェクト計画策定",
  owner: "鈴木 花子",
  start: "2025/05/12 (月)",
  due: "2025/05/16 (金)",
  dueLeft: "残り 2 日",
  priority: "中" as Priority,
  progress: 70,
  depends: "1.1.1 スコープ定義（完了）",
  effort: "16h / 11.2h",
  desc: "プロジェクト全体のスケジュールを策定する。マイルストーン、主要タスク、期限を定義し、関係者と合意を取る。",
  comments: [
    { author: "高橋 美咲", at: "2025/05/14 10:30", body: "レビューしました。特に問題ありません。" },
  ],
};

/* ---------------- カレンダー（画面5） ---------------- */
export interface CalEvent {
  day: number;
  time?: string;
  label: string;
  type: "会議" | "部会会議" | "提出期限" | "理事会";
}

export const calEvents: CalEvent[] = [
  { day: 26, time: "10:00", label: "定例会議", type: "会議" },
  { day: 28, time: "14:00", label: "部会会議", type: "部会会議" },
  { day: 31, label: "提出期限", type: "提出期限" },
  { day: 2, time: "15:00", label: "理事会", type: "理事会" },
  { day: 4, time: "10:00", label: "定例会議", type: "会議" },
  { day: 6, label: "提出期限", type: "提出期限" },
  { day: 9, time: "10:00", label: "部会会議", type: "部会会議" },
  { day: 11, time: "10:00", label: "定例会議", type: "会議" },
  { day: 16, time: "15:00", label: "理事会", type: "理事会" },
  { day: 18, time: "14:00", label: "部会会議", type: "部会会議" },
  { day: 18, label: "提出期限", type: "提出期限" },
  { day: 23, time: "10:00", label: "定例会議", type: "会議" },
  { day: 25, time: "10:00", label: "定例会議", type: "会議" },
  { day: 27, label: "提出期限", type: "提出期限" },
];

export const calDayEvents = [
  { time: "10:00 - 11:00", title: "定例会議（プロジェクト進捗確認）", place: "Web会議 / オンライン", tag: "会議", color: "#2563eb" },
  { time: "13:00 - 14:00", title: "部会会議（システム検討部会）", place: "大会議室B（本社ビル5F）", tag: "部会会議", color: "#16a34a" },
  { time: "15:30 - 16:30", title: "提案書 提出期限", place: "Aプロジェクト提案書", tag: "提出期限", color: "#f59e0b" },
  { time: "17:00 - 18:00", title: "理事会（第6回）", place: "大会議室A（本社ビル5F）", tag: "理事会", color: "#7c3aed" },
];

export const calOpenTasks = [
  { title: "Aプロジェクト 提案書ドラフト作成", tag: "期限超過", date: "6/1 (日)" },
  { title: "Bプロジェクト 要件定義書レビュー", tag: "期限間近", date: "6/6 (金)" },
  { title: "Cプロジェクト 予算見積もり提出", tag: "期限間近", date: "6/7 (土)" },
  { title: "議事録作成（5/28 定例会議分）", tag: "", date: "6/8 (日)" },
  { title: "部会会議 資料準備", tag: "", date: "6/9 (月)" },
];

/* ---------------- 会議管理（画面6） ---------------- */
export const meetings = [
  { title: "AI-PMOシステム開発 定例会議", status: "予定", date: "2025/06/10 (火) 10:00 - 11:30", place: "会議室A / オンライン", extra: "+3" },
  { title: "要件定義レビュー会議", status: "完了", date: "2025/06/03 (火) 14:00 - 16:00", place: "会議室B", extra: "+4" },
  { title: "リスク管理会議", status: "開催中", date: "2025/06/05 (木) 10:00 - 11:00", place: "オンライン", extra: "+2" },
  { title: "ステークホルダー定例会", status: "予定", date: "2025/06/12 (木) 15:00 - 16:30", place: "大会議室", extra: "+6" },
  { title: "設計方針検討会議", status: "予定", date: "2025/06/17 (火) 13:00 - 14:30", place: "会議室C", extra: "+3" },
];

export const meetingDetail = {
  title: "AI-PMOシステム開発 定例会議",
  status: "予定",
  date: "2025/06/10 (火)  10:00 - 11:30",
  place: "会議室A / オンライン (Teams)",
  attendees: [
    { name: "田中 太郎", role: "PMO" },
    { name: "佐藤 花子", role: "開発リーダー" },
    { name: "鈴木 一郎", role: "設計担当" },
    { name: "山田 次郎", role: "テスト担当" },
  ],
  extra: "+3名",
  purpose: "プロジェクトの進捗確認、課題・リスクの共有、今後の対応方針の決定",
  prevMinutes: [
    "要件定義フェーズの進捗確認を実施",
    "基本設計書のレビュー方針を決定",
    "外部連携仕様について議論",
    "テスト計画の骨子を確認",
  ],
  incomplete: [
    { task: "外部API仕様の最終確認", owner: "佐藤 花子", due: "2025/06/10", status: "進行中" },
    { task: "テスト環境の構築", owner: "山田 次郎", due: "2025/06/12", status: "進行中" },
    { task: "セキュリティ要件の詳細化", owner: "鈴木 一郎", due: "2025/06/17", status: "未着手" },
  ],
  nextAgenda: [
    "進捗状況の確認",
    "課題・リスクの共有",
    "基本設計レビュー結果の確認",
    "今後のスケジュール調整",
  ],
  materials: [
    { name: "議事次第_20250610.pdf", size: "PDF 256 KB", kind: "pdf" },
    { name: "進捗レポート_20250610.xlsx", size: "XLSX 128 KB", kind: "xlsx" },
    { name: "基本設計書_最新版.pptx", size: "PPTX 2.3 MB", kind: "pptx" },
  ],
  aiNextAgenda: {
    reason: "前回までの議論と進捗状況を分析",
    items: [
      "進捗状況の確認（前回からの更新点）",
      "重要課題の深掘り議論（外部API仕様）",
      "リスク評価と対策の検討",
      "基本設計レビュー結果の詳細確認",
      "次期スプリント計画の策定",
    ],
  },
  aiIncompleteTasks: {
    reason: "期限・依存関係・リスクを考慮",
    items: [
      { task: "外部API仕様の最終確認", priority: "高", note: "期限超過の可能性" },
      { task: "テスト環境の構築", priority: "中", note: "期限まで2日" },
      { task: "セキュリティ要件の詳細化", priority: "中", note: "期限まで7日" },
    ],
  },
  aiCheckpoints: {
    reason: "過去の類似プロジェクトからの示唆",
    items: [
      "外部APIの仕様変更リスクはないか？",
      "テスト環境のリソースは十分か？",
      "セキュリティ要件の網羅性は確保されているか？",
      "スケジュールに遅延リスクはないか？",
    ],
  },
};

/* ---------------- 議事録整理 / AI支援（画面7） ---------------- */
export const minutesAI = {
  meetingName: "第12回 やとアカ運営定例会",
  date: "2025/05/20 (火)  10:00 - 11:30",
  place: "オンライン（Zoom）",
  attendees: "山田（PMO）、佐藤（開発）、鈴木（デザイン）、高橋（QA）、田中（運用）",
  body: [
    { head: "【1. 開会】", lines: ["山田（PMO）：本日は第12回定例会を開始します。進捗確認と課題の整理、次回リリースに向けたタスク確認を行います。"] },
    { head: "【2. 進捗確認】", lines: [
      "佐藤（開発）：ログイン機能の実装は完了し、単体テストも終了しました。",
      "鈴木（デザイン）：ダッシュボードのUIデザイン案を2パターン作成しました。",
      "高橋（QA）：テスト観点の洗い出しを進めており、明日までにドラフトを共有します。",
      "田中（運用）：サーバー構成の見直しを行い、コスト試算を完了しました。",
    ]},
    { head: "【3. 課題・リスク】", lines: [
      "・外部APIのレスポンスが不安定（佐藤）",
      "・一部デザイン要素で認識齟齬あり（鈴木）",
      "・テスト環境の準備が遅延（高橋）",
    ]},
    { head: "【4. 決定事項】", lines: [
      "・外部APIはリトライ処理を実装する方針で決定",
      "・ダッシュボードのデザイン案はA案をベースに調整",
      "・テスト環境は今週金曜までに準備完了を目指す",
    ]},
    { head: "【5. 未決定事項】", lines: ["・レポート出力形式（PDF/Excel）の優先順位", "・通知機能のリリース時期"] },
    { head: "【6. 次回アジェンダ候補】", lines: ["・テスト結果の共有", "・レポート機能の仕様確認", "・リリーススケジュールの最終確認"] },
  ],
  summary:
    "各担当の進捗を確認し、課題とリスクを整理。外部APIの不安定さやテスト環境の遅延などの課題に対し、対応方針を決定した。デザイン案はA案をベースに調整すること、リトライ処理の実装を進めることを決定。未決定事項としてレポート出力形式と通知機能のリリース時期を残す。次回はテスト結果や仕様確認を中心に議論する。",
  decisions: [
    "外部APIはリトライ処理を実装する方針で決定",
    "ダッシュボードのデザイン案はA案をベースに調整",
    "テスト環境は今週金曜までに準備完了を目指す",
  ],
  undecided: ["レポート出力形式（PDF/Excel）の優先順位", "通知機能のリリース時期"],
  newTasks: [
    { name: "外部APIリトライ処理の実装", desc: "外部APIの不安定さに対応するリトライ処理", priority: "高" },
    { name: "ダッシュボードA案の調整", desc: "A案をベースにUIを調整する", priority: "中" },
    { name: "テスト環境の構築", desc: "テスト環境を今週金曜までに準備", priority: "高" },
    { name: "テスト観点ドラフトの共有", desc: "テスト観点を明日までに共有", priority: "中" },
    { name: "サーバー構成見直しの報告", desc: "コスト試算と構成案を共有", priority: "低" },
  ],
  assignees: ["佐藤（開発）", "鈴木（デザイン）", "高橋（QA）", "田中（運用）"],
  dueDates: ["2025/05/23 (金)", "2025/05/21 (水)", "2025/05/23 (金)", "2025/05/21 (水)", "2025/05/22 (木)"],
  nextAgenda: ["テスト結果の共有", "レポート機能の仕様確認", "リリーススケジュールの最終確認"],
  wbsUpdates: [
    { code: "3.2.1", name: "外部APIリトライ処理の実装", change: "新規追加", priority: "高" },
    { code: "2.1.3", name: "ダッシュボードA案の調整", change: "更新", priority: "中" },
    { code: "4.1.2", name: "テスト環境の構築", change: "新規追加", priority: "高" },
    { code: "4.2.1", name: "テスト観点ドラフトの共有", change: "新規追加", priority: "中" },
    { code: "5.1.1", name: "サーバー構成見直しの報告", change: "新規追加", priority: "低" },
  ],
  prompt: `あなたは優秀なPMOアシスタントです。
以下の議事録をもとに、プロジェクト管理に活用できる形で整理してください。

# 議事録要約
（要約をここに出力）

# 決定事項
（箇条書きで出力）

# 未決定事項
（箇条書きで出力）

# 新規タスク候補
| タスク名 | 概要 | 担当者候補 | 期限候補 | 優先度 |
|---|---|---|---|---|

# 次回アジェンダ候補
（箇条書きで出力）

議事録本文：
＜ここに議事録本文を貼り付け＞`,
};

/* ---------------- ステークホルダー管理（画面8） ---------------- */
export const stakeholders = [
  { dept: "事業推進部", name: "佐藤 一郎", title: "部長", tag: "主要", layer: "戦略・意思決定層", dots: 4 },
  { dept: "情報システム部", name: "鈴木 花子", title: "課長", tag: "主要", layer: "実行・利用部門", dots: 3 },
  { dept: "人事部", name: "田中 健一", title: "課長", tag: "関連", layer: "関連部門", dots: 2 },
  { dept: "経営企画部", name: "高橋 美咲", title: "主任", tag: "主要", layer: "実行・利用部門", dots: 4 },
  { dept: "法務部", name: "伊藤 隆", title: "様", tag: "関連", layer: "リスク・コンプライアンス", dots: 2 },
  { dept: "外部パートナー企業", name: "山本 浩二", title: "様", tag: "パートナー", layer: "外部パートナー", dots: 3 },
];

export const stakeholderDetail = {
  dept: "事業推進部",
  name: "佐藤 一郎",
  title: "部長",
  tag: "主要",
  layer: "戦略・意思決定層",
  owner: "山田 太郎",
  lastContact: "2025/05/20 (火)",
  nextContact: "2025/06/03 (火)",
  requests: ["AI活用方針に関する意思決定のご協力", "部門内への展開に向けたメッセージ発信のご相談"],
  understanding: 4,
  cooperation: 3,
  statusComment:
    "AI活用の必要性には高い理解を示していただいている。部門内展開に向けたリーダーシップに期待。",
  notes: "多忙のため、事前アジェンダ共有と時間厳守を徹底すること。",
  docs: [
    { name: "AI活用推進方針（概要）.pdf", date: "2025/04/15" },
    { name: "事業推進部向け説明資料.pptx", date: "2025/05/10" },
    { name: "AIユースケース集_事業推進部.pdf", date: "2025/05/18" },
  ],
  history: [
    { date: "2025/05/20 (火)", type: "定例面談", mode: "対面", topic: "AI活用方針について議論" },
    { date: "2025/04/15 (火)", type: "キックオフ面談", mode: "対面", topic: "プロジェクト概要の共有" },
    { date: "2025/03/28 (金)", type: "事前ヒアリング", mode: "オンライン", topic: "課題・ニーズのヒアリング" },
  ],
};

/* ---------------- 資料 / ナレッジ管理（画面9） ---------------- */
export const docFolders = [
  { name: "すべての資料", count: 523, level: 0 },
  { name: "01_経営基盤", count: 87, level: 1 },
  { name: "定款・規程", count: 12, level: 2 },
  { name: "理念・ビジョン", count: 8, level: 2 },
  { name: "中期計画", count: 15, level: 2 },
  { name: "組織図", count: 7, level: 2 },
  { name: "KPI・目標管理", count: 10, level: 2 },
  { name: "リスク管理", count: 9, level: 2 },
  { name: "コンプライアンス", count: 6, level: 2 },
  { name: "02_プロジェクト", count: 120, level: 1 },
  { name: "03_会議・議事録", count: 64, level: 1 },
  { name: "04_イベント", count: 38, level: 1 },
  { name: "05_研修・人材育成", count: 52, level: 1 },
  { name: "06_財務・経理", count: 45, level: 1 },
  { name: "07_営業・マーケティング", count: 33, level: 1 },
  { name: "08_業務マニュアル", count: 41, level: 1 },
  { name: "09_テンプレート", count: 23, level: 1 },
  { name: "10_アーカイブ", count: 20, level: 1 },
];

export const docList = [
  { name: "定款_やとアカ運営株式会社.pdf", tag: "定款・規程", kind: "PDF", updated: "2025/05/20", by: "山田 太郎" },
  { name: "企業理念・行動指針.pdf", tag: "理念・ビジョン", kind: "PDF", updated: "2025/05/18", by: "佐藤 花子" },
  { name: "中期経営計画（2025-2027）.pptx", tag: "中期計画", kind: "PPTX", updated: "2025/05/15", by: "鈴木 一郎" },
  { name: "第12期_第3回取締役会議事録.pdf", tag: "議事録", kind: "PDF", updated: "2025/05/14", by: "山田 太郎" },
  { name: "全社会議_2025年4月資料.pdf", tag: "イベント資料", kind: "PDF", updated: "2025/05/10", by: "佐藤 花子" },
  { name: "新入社員研修_2025資料.pptx", tag: "研修資料", kind: "PPTX", updated: "2025/05/08", by: "高橋 裕子" },
  { name: "財務諸表_2024年度.pdf", tag: "財務資料", kind: "PDF", updated: "2025/05/01", by: "鈴木 一郎" },
  { name: "事業計画書_新規事業X.pdf", tag: "プロジェクト資料", kind: "PDF", updated: "2025/04/28", by: "山田 太郎" },
  { name: "リスク管理台帳_2025.xlsx", tag: "リスク管理", kind: "XLSX", updated: "2025/04/25", by: "佐藤 花子" },
  { name: "営業戦略資料_2025.pptx", tag: "営業・マーケ", kind: "PPTX", updated: "2025/04/20", by: "鈴木 一郎" },
];

export const docDetail = {
  name: "定款_やとアカ運営株式会社.pdf",
  tags: ["定款・規程", "重要"],
  updated: "2025/05/20 14:30",
  updatedBy: "山田 太郎",
  desc: "当社の定款。会社の目的、組織、運営に関する基本ルールを定める。",
  folder: "01_経営基盤 > 定款・規程",
  allTags: ["定款・規程", "重要", "法務"],
  size: "2.4 MB",
  created: "2024/04/01",
  author: "法務部 佐藤 花子",
  page: "1 / 18",
  aiSummary: [
    "本定款は、やとアカ運営株式会社の組織および運営に関する基本事項を定めています。",
    "会社の目的は、教育事業、コンサルティング事業、システム開発事業など多岐にわたります。",
    "取締役会は3名以上で構成され、重要な業務執行の決定を行います。",
    "株主総会は年1回開催し、取締役の選任や決算の承認を行います。",
    "定款の変更には、株主総会の特別決議が必要です。",
  ],
  storageUsed: 78.4,
  storageTotal: 200,
};

/* ---------------- 部会レポート / 進捗分析（画面10） ---------------- */
export const reportData = {
  bukai: "全社DX推進部会",
  leader: "佐藤 一郎",
  subLeader: "鈴木 花子",
  period: "2025年5月度（今月）",
  stats: {
    progress: 68.5,
    progressDelta: "+6.2pt",
    overdue: 8,
    overdueDelta: "+2件",
    notStarted: 15,
    notStartedDelta: "-3件",
    meetings: 4,
    meetingsDelta: "±0回",
  },
  trend: [
    { month: "2025/01", plan: 10.2, actual: 8.1 },
    { month: "2025/02", plan: 20.5, actual: 18.3 },
    { month: "2025/03", plan: 35.8, actual: 32.6 },
    { month: "2025/04", plan: 62.3, actual: 32.6 },
    { month: "2025/05", plan: 68.5, actual: 32.3 },
    { month: "2025/06", plan: 85.0, actual: 74.7 },
  ],
  members: [
    { name: "田中 健一", tasks: 12, done: 9, progress: 75.0 },
    { name: "伊藤 美咲", tasks: 8, done: 6, progress: 75.0 },
    { name: "高橋 裕介", tasks: 10, done: 6, progress: 60.0 },
    { name: "中村 裕子", tasks: 9, done: 5, progress: 55.6 },
    { name: "渡辺 大輔", tasks: 7, done: 3, progress: 42.9 },
  ],
  memberTotal: { tasks: 46, done: 29, progress: 63.0 },
  achievements: [
    "基幹システムのクラウド移行計画が承認されました",
    "セキュリティポリシーの改定が完了しました",
    "データ分析基盤の構築が60%完了しました",
  ],
  problems: [
    "一部タスクの期限遅延が発生しています",
    "部門間の連携調整に時間を要しています",
    "リソース不足により進捗が停滞しているタスクがあります",
  ],
  nextFocus: [
    "基幹システム移行の詳細設計完了",
    "データ移行計画の策定",
    "ユーザートレーニング計画の策定",
  ],
  ai: {
    overall:
      "全体進捗率は68.5%で、計画を6.2ポイント上回っています。特に「基盤整備ワーキンググループ」の進捗が順調で、部会全体の牽引役となっています。",
    good: ["計画進捗率を上回る実績で推移", "会議での決定事項の実行率が85%と高水準", "メンバーのタスク完了率が向上傾向"],
    caution: ["期限超過タスクが8件に増加（前月比+2件）", "「セキュリティ強化WG」で未着手タスクが多い", "一部メンバーの進捗率が40%台と低調"],
    improve: ["期限超過タスクの優先的な対応を推奨", "未着手タスクの原因分析と対策実施", "進捗が遅れているメンバーへのサポート強化"],
    outlook: "適切な対策を実施することで、進捗率75%以上の達成が可能と予測されます。",
  },
};

/* ---------------- ナビゲーション ---------------- */
export const navItems = [
  { href: "/", label: "ダッシュボード", icon: "home" },
  { href: "/projects", label: "プロジェクト", icon: "folder" },
  { href: "/tasks", label: "WBS / タスク", icon: "list" },
  { href: "/calendar", label: "カレンダー", icon: "calendar" },
  { href: "/meetings", label: "会議管理", icon: "chat" },
  { href: "/minutes", label: "議事録 / AI支援", icon: "sparkles" },
  { href: "/stakeholders", label: "ステークホルダー", icon: "users" },
  { href: "/documents", label: "資料 / ナレッジ", icon: "doc" },
  { href: "/reports", label: "部会レポート", icon: "chart" },
] as const;
