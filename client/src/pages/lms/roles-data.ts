/**
 * ロール設計の単一の真実(見える化ページとメンバー管理で共有)。
 * グループ: お客様(導入企業) / 提供会社(Lカート) / 社労士 / プロジェクト管理
 * スコープ階層: プロジェクト(案件) → 導入企業 → 事業所 → 会社員
 */

export type RoleCode = "operator_admin" | "project_manager" | "company_rep" | "advisor" | "employee";

export type RoleDef = {
  code: RoleCode;
  label: string;
  group: string;
  groupColor: string;
  scope: string;
  summary: string;
  /** ログイン可能な管理アカウント(lms_members)か、受講者(learners)か */
  accountType: "member" | "learner";
};

export const ROLE_GROUPS = [
  { key: "customer", label: "お客様（導入企業）", color: "sky" },
  { key: "provider", label: "提供会社（Lカート）", color: "emerald" },
  { key: "advisor", label: "社労士", color: "violet" },
  { key: "project", label: "プロジェクト管理", color: "amber" },
] as const;

export const ROLES: RoleDef[] = [
  {
    code: "operator_admin",
    label: "管理者",
    group: "提供会社（Lカート）",
    groupColor: "emerald",
    scope: "全体",
    summary: "すべてを管理。企業・協業先・コース・マスターキー・成果報酬・監査ログ・メンバー権限。",
    accountType: "member",
  },
  {
    code: "project_manager",
    label: "プロジェクト管理者",
    group: "プロジェクト管理",
    groupColor: "amber",
    scope: "担当プロジェクト配下の全企業",
    summary: "案件単位で横断管理。プロジェクト内の企業・受講者・コース割当・進捗・証跡を管理。",
    accountType: "member",
  },
  {
    code: "company_rep",
    label: "代表",
    group: "お客様（導入企業）",
    groupColor: "sky",
    scope: "自社のみ",
    summary: "自社の受講者を登録・管理、進捗確認、リマインド送信、自社証跡の出力。",
    accountType: "member",
  },
  {
    code: "employee",
    label: "会社員",
    group: "お客様（導入企業）",
    groupColor: "sky",
    scope: "自分のみ",
    summary: "受講者。動画視聴・確認チェック・確認テスト・学習レポート・修了証の取得。",
    accountType: "learner",
  },
  {
    code: "advisor",
    label: "社労士",
    group: "社労士",
    groupColor: "violet",
    scope: "担当プロジェクト/企業",
    summary: "証跡確認・申請準備チェック・差戻しコメント（読み取り中心、編集は限定）。",
    accountType: "member",
  },
];

/** 権限マトリクス。○=可 / △=一部・自分の範囲のみ / ×=不可 */
export type Access = "yes" | "partial" | "no";

export const PERMISSION_ROWS: Array<{ feature: string; perms: Record<RoleCode, Access> }> = [
  { feature: "ダッシュボード閲覧", perms: { operator_admin: "yes", project_manager: "partial", company_rep: "partial", advisor: "partial", employee: "no" } },
  { feature: "企業・事業所の登録/編集", perms: { operator_admin: "yes", project_manager: "partial", company_rep: "partial", advisor: "no", employee: "no" } },
  { feature: "マスターキー発行", perms: { operator_admin: "yes", project_manager: "partial", company_rep: "partial", advisor: "no", employee: "no" } },
  { feature: "受講者の登録/CSV/割当", perms: { operator_admin: "yes", project_manager: "partial", company_rep: "partial", advisor: "no", employee: "no" } },
  { feature: "コース・教材・テスト管理", perms: { operator_admin: "yes", project_manager: "yes", company_rep: "no", advisor: "no", employee: "no" } },
  { feature: "受講（視聴・チェック・テスト・レポート）", perms: { operator_admin: "no", project_manager: "no", company_rep: "no", advisor: "no", employee: "yes" } },
  { feature: "リマインド送信", perms: { operator_admin: "yes", project_manager: "partial", company_rep: "partial", advisor: "no", employee: "no" } },
  { feature: "証跡・修了証の出力", perms: { operator_admin: "yes", project_manager: "partial", company_rep: "partial", advisor: "partial", employee: "no" } },
  { feature: "申請準備チェック・差戻し", perms: { operator_admin: "yes", project_manager: "partial", company_rep: "no", advisor: "yes", employee: "no" } },
  { feature: "協業先・成果報酬管理", perms: { operator_admin: "yes", project_manager: "no", company_rep: "no", advisor: "no", employee: "no" } },
  { feature: "プロジェクト・メンバー権限管理", perms: { operator_admin: "yes", project_manager: "no", company_rep: "no", advisor: "no", employee: "no" } },
  { feature: "監査ログ閲覧", perms: { operator_admin: "yes", project_manager: "partial", company_rep: "no", advisor: "partial", employee: "no" } },
];

export const ROLE_LABEL: Record<RoleCode, string> = {
  operator_admin: "管理者",
  project_manager: "プロジェクト管理者",
  company_rep: "代表",
  advisor: "社労士",
  employee: "会社員",
};
