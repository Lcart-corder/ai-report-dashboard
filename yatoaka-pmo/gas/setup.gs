/**
 * 初期セットアップ — シート作成・ヘッダー投入・サンプルデータ投入。
 *
 * 手順:
 *   1) 対象スプレッドシートを作成し、その ID を控える。
 *   2) setSpreadsheetId('スプレッドシートID') を1回実行（スクリプトプロパティに保存）。
 *   3) setupSpreadsheet() を実行（シートとヘッダーを作成）。
 *   4) （任意）seedSampleData() を実行（サンプルデータ投入）。
 */

/** スプレッドシートIDをスクリプトプロパティに保存 */
function setSpreadsheetId(id) {
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', id);
  return 'SPREADSHEET_ID を保存しました: ' + id;
}

/** 全シートを作成し、ヘッダー行を設定 */
function setupSpreadsheet() {
  var ss = getSpreadsheet();
  Object.keys(CONFIG.COLUMNS).forEach(function (sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) sheet = ss.insertSheet(sheetName);
    var headers = CONFIG.COLUMNS[sheetName];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  });
  return 'シートを作成しました: ' + Object.keys(CONFIG.COLUMNS).join(', ');
}

/** サンプルデータを投入（既存データは削除して入れ直す） */
function seedSampleData() {
  clearSheetBody(CONFIG.SHEETS.PROJECTS);
  clearSheetBody(CONFIG.SHEETS.TASKS);
  clearSheetBody(CONFIG.SHEETS.MEETINGS);

  SEED.projects.forEach(function (p) { appendRowByMap(CONFIG.SHEETS.PROJECTS, withMeta(p)); });
  SEED.tasks.forEach(function (t) { appendRowByMap(CONFIG.SHEETS.TASKS, withMeta(codeParentize(t))); });
  SEED.meetings.forEach(function (m) { appendRowByMap(CONFIG.SHEETS.MEETINGS, withMeta(m)); });

  return 'サンプルデータを投入しました: projects=' + SEED.projects.length +
    ', tasks=' + SEED.tasks.length + ', meetings=' + SEED.meetings.length;
}

/** ワンショット: ID保存→シート作成→シード */
function initAll(spreadsheetId) {
  if (spreadsheetId) setSpreadsheetId(spreadsheetId);
  setupSpreadsheet();
  seedSampleData();
  return '初期化が完了しました。ウェブアプリとしてデプロイしてください。';
}

/* ---------------- helpers ---------------- */

function clearSheetBody(sheetName) {
  var sheet = getSheet(sheetName);
  if (!sheet) return;
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
}

function withMeta(rec) {
  rec.is_archived = false;
  rec.updated_at = nowIso();
  return rec;
}

function codeParentize(t) {
  var parts = String(t.code).split('.');
  if (parts.length > 1) t.parentId = parts.slice(0, -1).join('.');
  return t;
}

/* ---------------- SEED（フロントの src/lib/mock.ts と対応） ---------------- */
var SEED = {
  projects: [
    { id: 'PJ0001', name: 'キックオフイベント運営', bukai: 'イベント部会', owner: '山田 太郎', start: '2025/04/01', due: '2025/07/31', progress: 62, priority: '高', status: '進行中', meetings: 8, docs: 15 },
    { id: 'PJ0002', name: 'AI議事録要約機能の改善', bukai: 'DX推進部会', owner: '山田 太郎', start: '2024/04/01', due: '2024/06/30', progress: 75, priority: '高', status: '進行中', meetings: 8, docs: 15 },
    { id: 'PJ0003', name: 'ユーザー管理基盤の刷新', bukai: 'システム基盤部会', owner: '佐藤 花子', start: '2024/03/15', due: '2024/07/31', progress: 60, priority: '高', status: '進行中', meetings: 6, docs: 12 },
    { id: 'PJ0004', name: 'セキュリティ強化対応', bukai: 'セキュリティ部会', owner: '鈴木 一郎', start: '2024/02/01', due: '2024/05/31', progress: 90, priority: '最高', status: '進行中', meetings: 10, docs: 18 },
    { id: 'PJ0005', name: 'UI/UX改善プロジェクト', bukai: 'ユーザー体験部会', owner: '高橋 美咲', start: '2024/04/10', due: '2024/08/15', progress: 30, priority: '中', status: '進行中', meetings: 4, docs: 9 },
    { id: 'PJ0006', name: 'データ分析基盤の構築', bukai: 'データ活用部会', owner: '田中 健一', start: '2024/01/05', due: '2024/04/30', progress: 100, priority: '高', status: '完了', meetings: 12, docs: 22 },
    { id: 'PJ0007', name: '通知システムの最適化', bukai: '運用改善部会', owner: '伊藤 翔太', start: '2024/02/20', due: '2024/05/15', progress: 100, priority: '中', status: '完了', meetings: 5, docs: 11 },
    { id: 'PJ0008', name: 'ポータルサイト再構築', bukai: '広報・連携部会', owner: '渡辺 直子', start: '2024/03/01', due: '2024/09/30', progress: 10, priority: '中', status: '計画中', meetings: 3, docs: 7 },
    { id: 'PJ0009', name: 'レポート自動化の検討', bukai: '業務効率化部会', owner: '小林 正樹', start: '2024/05/01', due: '2024/10/31', progress: 0, priority: '低', status: '未着手', meetings: 0, docs: 0 },
  ],
  tasks: [
    { id: '1', code: '1', name: 'プロジェクト管理', owner: '田中 太郎', start: '2025/05/01', due: '2025/08/29', priority: '高', status: '進行中', progress: 42, comments: 3, depends: '', desc: '' },
    { id: '1.1', code: '1.1', name: 'プロジェクト計画策定', owner: '鈴木 花子', start: '2025/05/01', due: '2025/05/30', priority: '中', status: '進行中', progress: 65, comments: 2, depends: '', desc: '' },
    { id: '1.1.1', code: '1.1.1', name: 'スコープ定義', owner: '田中 太郎', start: '2025/05/01', due: '2025/05/09', priority: '高', status: '完了', progress: 100, comments: 0, depends: '', desc: '' },
    { id: '1.1.2', code: '1.1.2', name: 'スケジュール策定', owner: '鈴木 花子', start: '2025/05/12', due: '2025/05/16', priority: '中', status: '進行中', progress: 70, comments: 1, depends: '1.1.1', desc: 'プロジェクト全体のスケジュールを策定する。' },
    { id: '1.1.3', code: '1.1.3', name: '体制・役割定義', owner: '佐藤 健一', start: '2025/05/19', due: '2025/05/30', priority: '中', status: '未着手', progress: 0, comments: 0, depends: '1.1.2', desc: '' },
    { id: '1.2', code: '1.2', name: '進捗管理', owner: '田中 太郎', start: '2025/06/02', due: '2025/06/27', priority: '高', status: '進行中', progress: 30, comments: 1, depends: '1.1', desc: '' },
    { id: '1.2.1', code: '1.2.1', name: '進捗モニタリング', owner: '鈴木 花子', start: '2025/06/02', due: '2025/06/13', priority: '中', status: '進行中', progress: 50, comments: 2, depends: '', desc: '' },
    { id: '1.2.2', code: '1.2.2', name: '課題管理', owner: '佐藤 健一', start: '2025/06/16', due: '2025/06/20', priority: '高', status: '未着手', progress: 0, comments: 0, depends: '1.2.1', desc: '' },
    { id: '1.2.3', code: '1.2.3', name: '会議体運営', owner: '高橋 美咲', start: '2025/06/23', due: '2025/06/27', priority: '中', status: '未着手', progress: 0, comments: 0, depends: '1.2.2', desc: '' },
    { id: '2', code: '2', name: '要件定義', owner: '佐藤 健一', start: '2025/06/30', due: '2025/07/25', priority: '高', status: '未着手', progress: 10, comments: 1, depends: '', desc: '' },
    { id: '2.1', code: '2.1', name: '現状分析', owner: '高橋 美咲', start: '2025/06/30', due: '2025/07/04', priority: '中', status: '完了', progress: 100, comments: 0, depends: '', desc: '' },
    { id: '2.2', code: '2.2', name: '要件ヒアリング', owner: '田中 太郎', start: '2025/07/07', due: '2025/07/18', priority: '高', status: '進行中', progress: 40, comments: 2, depends: '2.1', desc: '' },
    { id: '2.3', code: '2.3', name: '要件定義書作成', owner: '佐藤 健一', start: '2025/07/14', due: '2025/07/25', priority: '中', status: '未着手', progress: 0, comments: 0, depends: '2.2', desc: '' },
  ],
  meetings: [
    { id: 'MTG001', title: 'AI-PMOシステム開発 定例会議', status: '予定', date: '2025/06/10 (火) 10:00 - 11:30', place: '会議室A / オンライン', purpose: 'プロジェクトの進捗確認、課題・リスクの共有、今後の対応方針の決定', extra: '+3' },
    { id: 'MTG002', title: '要件定義レビュー会議', status: '完了', date: '2025/06/03 (火) 14:00 - 16:00', place: '会議室B', purpose: '', extra: '+4' },
    { id: 'MTG003', title: 'リスク管理会議', status: '開催中', date: '2025/06/05 (木) 10:00 - 11:00', place: 'オンライン', purpose: '', extra: '+2' },
    { id: 'MTG004', title: 'ステークホルダー定例会', status: '予定', date: '2025/06/12 (木) 15:00 - 16:30', place: '大会議室', purpose: '', extra: '+6' },
    { id: 'MTG005', title: '設計方針検討会議', status: '予定', date: '2025/06/17 (火) 13:00 - 14:30', place: '会議室C', purpose: '', extra: '+3' },
  ],
};
