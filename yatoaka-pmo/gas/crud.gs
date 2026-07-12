/**
 * リソース汎用 CRUD — projects / tasks / meetings を列名ベースで操作。
 * 削除は物理削除ではなくアーカイブ（is_archived=true）を基本とする（要件定義書 10）。
 */

function resolveSheet(resource) {
  var sheet = CONFIG.RESOURCE_TO_SHEET[resource];
  if (!sheet) throw new Error('未対応のリソースです: ' + resource);
  return sheet;
}

/** 有効な（アーカイブされていない）レコード一覧を返す */
function listRecords(resource) {
  var sheetName = resolveSheet(resource);
  var data = getSheetData(sheetName);
  return data.rows
    .filter(function (r) { return !isTruthy(r.is_archived); })
    .map(function (r) { return normalizeRecord(cleanRow(r)); });
}

/** id で1件取得（_rowIndex 付き） */
function findByIdRaw(resource, id) {
  var sheetName = resolveSheet(resource);
  var data = getSheetData(sheetName);
  for (var i = 0; i < data.rows.length; i++) {
    if (String(data.rows[i].id) === String(id)) return data.rows[i];
  }
  return null;
}

/** 作成 */
function createRecord(resource, payload) {
  var sheetName = resolveSheet(resource);
  var record = {};
  Object.keys(payload || {}).forEach(function (k) { record[k] = payload[k]; });
  if (!record.id) record.id = genId(resource.charAt(0).toUpperCase());
  record.is_archived = false;
  record.updated_at = nowIso();
  appendRowByMap(sheetName, record);
  writeAuditLog('create', resource, record.id, getUserEmail(), null);
  return normalizeRecord(record);
}

/** 更新（既存行に payload をマージ） */
function updateRecord(resource, payload) {
  if (!payload || !payload.id) throw new Error('id が必要です');
  var sheetName = resolveSheet(resource);
  var existing = findByIdRaw(resource, payload.id);
  if (!existing) throw new Error('対象が見つかりません: ' + payload.id);
  var merged = cleanRow(existing);
  Object.keys(payload).forEach(function (k) { merged[k] = payload[k]; });
  merged.updated_at = nowIso();
  updateRowByMap(sheetName, existing._rowIndex, merged);
  writeAuditLog('update', resource, payload.id, getUserEmail(), null);
  return normalizeRecord(merged);
}

/** 削除（アーカイブ） */
function deleteRecord(resource, id) {
  var sheetName = resolveSheet(resource);
  var existing = findByIdRaw(resource, id);
  if (!existing) return { id: id, deleted: false };
  var merged = cleanRow(existing);
  merged.is_archived = true;
  merged.updated_at = nowIso();
  updateRowByMap(sheetName, existing._rowIndex, merged);
  writeAuditLog('delete', resource, id, getUserEmail(), null);
  return { id: id, deleted: true };
}

/** 起動時の一括取得 */
function getBootstrap() {
  return {
    projects: listRecords('projects'),
    tasks: listRecords('tasks'),
    meetings: listRecords('meetings'),
  };
}

/* ---------------- helpers ---------------- */

function isTruthy(v) {
  return v === true || v === 'true' || v === 'TRUE' || v === 1;
}

/** スプレッドシートの値をフロント向けに整形（型を素直に保つ） */
function normalizeRecord(r) {
  var out = {};
  Object.keys(r).forEach(function (k) {
    var v = r[k];
    // "2025/04/01" のような日付らしき文字列は、スプレッドシートが自動的に
    // Date型のセルへ変換してしまう。フロント側は "YYYY/MM/DD" 形式を前提と
    // しているため、Dateで返ってきた値はここで文字列に戻す。
    if (v instanceof Date) {
      out[k] = Utilities.formatDate(v, 'Asia/Tokyo', 'yyyy/MM/dd');
      return;
    }
    if (k === 'progress' || k === 'comments' || k === 'meetings' || k === 'docs') {
      out[k] = v === '' || v === null ? 0 : Number(v);
    } else if (k === 'is_archived') {
      out[k] = isTruthy(v);
    } else if (k === 'parentId' || k === 'depends' || k === 'desc' || k === 'purpose' || k === 'extra') {
      out[k] = v === '' || v === null || v === undefined ? undefined : String(v);
    } else {
      out[k] = v === null || v === undefined ? '' : (typeof v === 'number' || typeof v === 'boolean' ? v : String(v));
    }
  });
  return out;
}

function getUserEmail() {
  try {
    return Session.getActiveUser().getEmail() || '';
  } catch (e) {
    return '';
  }
}
