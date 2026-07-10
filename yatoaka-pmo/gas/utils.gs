/**
 * 共通ユーティリティ — シートアクセス（列名ベース）・JSON応答
 */

/** スプレッドシートを開く */
function getSpreadsheet() {
  var id = CONFIG.SPREADSHEET_ID;
  if (!id) throw new Error('SPREADSHEET_ID が未設定です。スクリプトプロパティに登録してください。');
  return SpreadsheetApp.openById(id);
}

/** シートを取得（無ければ null） */
function getSheet(name) {
  return getSpreadsheet().getSheetByName(name);
}

/** ヘッダー行から 列名→列番号(1-based) のマップを生成 */
function getColumnMap(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return {};
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  headers.forEach(function (h, i) {
    if (h !== '' && h !== null && h !== undefined) map[String(h)] = i + 1;
  });
  return map;
}

/**
 * シート全体を列名ベースのオブジェクト配列で取得。
 * 各行に _rowIndex(1-based) を付与する。
 */
function getSheetData(sheetName) {
  var sheet = getSheet(sheetName);
  if (!sheet) return { headers: [], rows: [], sheet: null };
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return { headers: [], rows: [], sheet: sheet };
  var data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = data[0].map(String);
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var obj = { _rowIndex: i + 1 };
    headers.forEach(function (h, j) { obj[h] = data[i][j]; });
    rows.push(obj);
  }
  return { headers: headers, rows: rows, sheet: sheet };
}

/** 列名ベースで1行追加 */
function appendRowByMap(sheetName, record) {
  var sheet = getSheet(sheetName);
  var colMap = getColumnMap(sheet);
  var headers = Object.keys(colMap).sort(function (a, b) { return colMap[a] - colMap[b]; });
  var row = headers.map(function (h) { return record[h] !== undefined ? record[h] : ''; });
  sheet.appendRow(row);
}

/** 列名ベースで指定行を上書き */
function updateRowByMap(sheetName, rowIndex, record) {
  var sheet = getSheet(sheetName);
  var colMap = getColumnMap(sheet);
  var headers = Object.keys(colMap).sort(function (a, b) { return colMap[a] - colMap[b]; });
  var row = headers.map(function (h) { return record[h] !== undefined ? record[h] : ''; });
  sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
}

/** _rowIndex を除いた素のオブジェクトにする */
function cleanRow(obj) {
  var out = {};
  Object.keys(obj).forEach(function (k) {
    if (k !== '_rowIndex') out[k] = obj[k];
  });
  return out;
}

/** 現在時刻の ISO 文字列 */
function nowIso() {
  return new Date().toISOString();
}

/** 一意な ID を生成 */
function genId(prefix) {
  return (prefix || 'id') + Date.now().toString(36) + Math.floor(Math.random() * 1000);
}

/** JSON 応答 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
function successResponse(data) {
  return jsonResponse({ success: true, data: data, error: null });
}
function errorResponse(code, message) {
  return jsonResponse({ success: false, data: null, error: { code: code, message: String(message) } });
}

/** 監査ログ（任意） */
function writeAuditLog(action, targetType, targetId, userEmail, details) {
  try {
    if (!getSheet(CONFIG.SHEETS.AUDIT_LOG)) return;
    appendRowByMap(CONFIG.SHEETS.AUDIT_LOG, {
      log_id: genId('log'),
      action: action,
      target_type: targetType,
      target_id: targetId,
      user_email: userEmail || '',
      details: details ? JSON.stringify(details) : '',
      timestamp: nowIso(),
    });
  } catch (e) {
    // 監査ログ失敗は本処理を止めない
  }
}
