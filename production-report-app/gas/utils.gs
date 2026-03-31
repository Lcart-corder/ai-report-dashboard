/**
 * 共通ユーティリティ — getColumnMap, CRUD汎用関数
 */

/** スプレッドシートを開く */
function getSpreadsheet() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

/** シートを取得 */
function getSheet(name) {
  return getSpreadsheet().getSheetByName(name);
}

/**
 * ヘッダー行から列名→列番号(1-based)マッピングを生成
 * 列順に依存しない読み書きを保証する
 */
function getColumnMap(sheet) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var map = {};
  headers.forEach(function(h, i) {
    if (h) map[String(h)] = i + 1;
  });
  return map;
}

/**
 * シートの全データを列名ベースのオブジェクト配列として取得
 * 各オブジェクトに _rowIndex (1-based行番号) を付与
 */
function getSheetData(sheetName) {
  var sheet = getSheet(sheetName);
  if (!sheet) return { headers: [], colMap: {}, rows: [], sheet: null };
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { headers: [], colMap: getColumnMap(sheet), rows: [], sheet: sheet };
  var data = sheet.getDataRange().getValues();
  var headers = data[0].map(String);
  var colMap = {};
  headers.forEach(function(h, i) { if (h) colMap[h] = i + 1; });
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var obj = { _rowIndex: i + 1 };
    headers.forEach(function(h, j) { obj[h] = data[i][j]; });
    rows.push(obj);
  }
  return { headers: headers, colMap: colMap, rows: rows, sheet: sheet };
}

/**
 * 列名ベースで1行追加
 */
function appendRowByMap(sheetName, record) {
  var sheet = getSheet(sheetName);
  var colMap = getColumnMap(sheet);
  var headers = Object.keys(colMap).sort(function(a, b) { return colMap[a] - colMap[b]; });
  var row = headers.map(function(h) { return record[h] !== undefined ? record[h] : ''; });
  sheet.appendRow(row);
}

/**
 * 列名ベースで行を更新
 */
function updateRowByMap(sheetName, rowIndex, record) {
  var sheet = getSheet(sheetName);
  var colMap = getColumnMap(sheet);
  var headers = Object.keys(colMap).sort(function(a, b) { return colMap[a] - colMap[b]; });
  var row = headers.map(function(h) { return record[h] !== undefined ? record[h] : ''; });
  sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
}

/**
 * 指定行を削除
 */
function deleteRow(sheetName, rowIndex) {
  getSheet(sheetName).deleteRow(rowIndex);
}

/** 現在時刻のISO文字列 */
function now() {
  return new Date().toISOString();
}

/** JSONレスポンスを返す */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** 成功レスポンス */
function successResponse(data) {
  return jsonResponse({ success: true, data: data, error: null });
}

/** エラーレスポンス */
function errorResponse(code, message) {
  return jsonResponse({ success: false, data: null, error: { code: code, message: message } });
}

/** _rowIndex を除外してオブジェクトをクリーンにする */
function cleanRow(obj) {
  var result = {};
  Object.keys(obj).forEach(function(k) {
    if (k !== '_rowIndex') result[k] = obj[k];
  });
  return result;
}

/** 監査ログを記録 */
function writeAuditLog(action, targetType, targetId, userEmail, details) {
  appendRowByMap(CONFIG.SHEETS.AUDIT_LOG, {
    log_id: now() + '_' + Math.random().toString(36).substr(2, 6),
    action: action,
    target_type: targetType,
    target_id: targetId,
    user_email: userEmail || '',
    details: details ? JSON.stringify(details) : '',
    timestamp: now(),
  });
}
