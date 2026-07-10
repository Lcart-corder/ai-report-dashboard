/**
 * やとアカ運営AI-PMOシステム — GAS バックエンド設定
 *
 * SPREADSHEET_ID は「スクリプトプロパティ」に登録する（コードに直書きしない）。
 *   Apps Script エディタ → プロジェクトの設定 → スクリプト プロパティ
 *   キー: SPREADSHEET_ID  値: 対象スプレッドシートのID
 * もしくは setup.gs の setSpreadsheetId('...') を一度実行する。
 */
var CONFIG = {
  get SPREADSHEET_ID() {
    return PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '';
  },

  SHEETS: {
    PROJECTS: 'Projects',
    TASKS: 'Tasks',
    MEETINGS: 'Meetings',
    AUDIT_LOG: 'AuditLog',
  },

  /**
   * 各シートのヘッダー（列名）定義。
   * フロントエンドの型（Project / Task / Meeting）と 1:1 対応させる。
   * 列アクセスは常に列名ベースで行い、列インデックスのハードコードは禁止。
   */
  COLUMNS: {
    Projects: [
      'id', 'name', 'bukai', 'owner', 'start', 'due',
      'progress', 'priority', 'status', 'meetings', 'docs',
      'is_archived', 'updated_at',
    ],
    Tasks: [
      'id', 'code', 'name', 'parentId', 'owner', 'start', 'due',
      'priority', 'status', 'progress', 'comments', 'depends', 'desc',
      'is_archived', 'updated_at',
    ],
    Meetings: [
      'id', 'title', 'status', 'date', 'place', 'purpose', 'extra',
      'is_archived', 'updated_at',
    ],
    AuditLog: [
      'log_id', 'action', 'target_type', 'target_id', 'user_email', 'details', 'timestamp',
    ],
  },

  /** REST リソース名 → シート名 */
  RESOURCE_TO_SHEET: {
    projects: 'Projects',
    tasks: 'Tasks',
    meetings: 'Meetings',
  },
};
