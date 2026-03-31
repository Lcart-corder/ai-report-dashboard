/**
 * マスタデータ — getStopCodes, getUsers
 */

/** 停止コードマスタ取得 */
function getStopCodes(params) {
  var data = getSheetData(CONFIG.SHEETS.STOP_CODES);
  return data.rows
    .filter(function(r) { return String(r.is_active).toUpperCase() === 'TRUE'; })
    .sort(function(a, b) { return Number(a.sort_order) - Number(b.sort_order); })
    .map(cleanRow);
}

/** ユーザー一覧取得 (admin用) */
function getUsers(params) {
  var data = getSheetData(CONFIG.SHEETS.USERS);
  return data.rows.map(cleanRow);
}
