/**
 * 生産入力CRUD + ノンストップ入力 — saveProductionInput, getProductionInput, deleteProductionInput
 */

/** 入力データ取得 */
function getProductionInput(params) {
  var slotId = params.slot_id;
  if (!slotId) throw new Error('slot_id required');
  var data = getSheetData(CONFIG.SHEETS.PRODUCTION_INPUTS);
  var row = data.rows.filter(function(r) { return String(r.slot_id) === slotId; })[0];
  return row ? cleanRow(row) : null;
}

/** 生産入力保存（冪等: 既存ならupdate、なければinsert） */
function saveProductionInput(params) {
  var slotId   = params.slot_id;
  var reportId = params.report_id;
  var inputBy  = params.input_by;
  if (!slotId || !reportId) throw new Error('slot_id, report_id required');

  var inputId = slotId + '_01';
  var data = getSheetData(CONFIG.SHEETS.PRODUCTION_INPUTS);
  var existingRow = data.rows.filter(function(r) { return String(r.slot_id) === slotId; })[0];

  var record = {
    input_id: inputId,
    slot_id: slotId,
    report_id: reportId,
    case_no_start: params.case_no_start || 0,
    case_no_end: params.case_no_end || 0,
    product_name: params.product_name || '',
    has_stop: params.has_stop || false,
    stop_code: params.stop_code || '',
    stop_time_minutes: params.stop_time_minutes || 0,
    abnormality: params.abnormality || '',
    discharge_count: params.discharge_count || 0,
    machine_discharge: params.machine_discharge || 0,
    verification: params.verification || '○',
    first_weight: params.first_weight || 0,
    judgment: params.judgment || '合',
    input_by: existingRow ? existingRow.input_by : inputBy,
    input_at: existingRow ? existingRow.input_at : now(),
    updated_by: inputBy,
    updated_at: now(),
  };

  if (existingRow) {
    updateRowByMap(CONFIG.SHEETS.PRODUCTION_INPUTS, existingRow._rowIndex, record);
    writeAuditLog('update', 'input', inputId, inputBy);
  } else {
    appendRowByMap(CONFIG.SHEETS.PRODUCTION_INPUTS, record);
    writeAuditLog('create', 'input', inputId, inputBy);
  }

  // TimeSlot のstatusを更新
  var slotStatus = params.has_stop ? 'has_stop' : 'filled';
  var slotData = getSheetData(CONFIG.SHEETS.TIME_SLOTS);
  var slotRow = slotData.rows.filter(function(r) { return String(r.slot_id) === slotId; })[0];
  if (slotRow) {
    slotRow.status = slotStatus;
    slotRow.updated_at = now();
    updateRowByMap(CONFIG.SHEETS.TIME_SLOTS, slotRow._rowIndex, slotRow);
  }

  // DailyReport の進捗更新
  var allSlots = slotData.rows.filter(function(r) { return String(r.report_id) === reportId; });
  var filledCount = allSlots.filter(function(r) {
    if (String(r.slot_id) === slotId) return true; // 今回保存したスロット
    return String(r.status) === 'filled' || String(r.status) === 'has_stop';
  }).length;
  var hasStop = allSlots.some(function(r) {
    if (String(r.slot_id) === slotId) return params.has_stop;
    return String(r.status) === 'has_stop';
  });

  var reportData = getSheetData(CONFIG.SHEETS.DAILY_REPORTS);
  var reportRow = reportData.rows.filter(function(r) { return String(r.report_id) === reportId; })[0];
  if (reportRow) {
    reportRow.filled_slots = filledCount;
    reportRow.has_stop = hasStop;
    reportRow.updated_at = now();
    updateRowByMap(CONFIG.SHEETS.DAILY_REPORTS, reportRow._rowIndex, reportRow);
  }

  // 次の未入力時間帯を探す（ノンストップ入力用）
  var nextEmpty = allSlots.filter(function(r) {
    if (String(r.slot_id) === slotId) return false;
    return String(r.status) === 'empty';
  })[0];

  return {
    input_id: inputId,
    saved: true,
    next_empty_slot: nextEmpty ? {
      slot_id: String(nextEmpty.slot_id),
      start_time: String(nextEmpty.start_time),
      end_time: String(nextEmpty.end_time),
    } : null,
    report_progress: {
      filled_slots: filledCount,
      total_slots: 24,
      all_filled: filledCount >= 24,
    },
  };
}

/** 生産入力削除 */
function deleteProductionInput(params) {
  var slotId = params.slot_id;
  var reportId = params.report_id;
  if (!slotId) throw new Error('slot_id required');

  var data = getSheetData(CONFIG.SHEETS.PRODUCTION_INPUTS);
  var row = data.rows.filter(function(r) { return String(r.slot_id) === slotId; })[0];
  if (row) {
    deleteRow(CONFIG.SHEETS.PRODUCTION_INPUTS, row._rowIndex);
    writeAuditLog('delete', 'input', String(row.input_id), params.deleted_by || '');
  }

  // TimeSlotをemptyに戻す
  var slotData = getSheetData(CONFIG.SHEETS.TIME_SLOTS);
  var slotRow = slotData.rows.filter(function(r) { return String(r.slot_id) === slotId; })[0];
  if (slotRow) {
    slotRow.status = 'empty';
    slotRow.updated_at = now();
    updateRowByMap(CONFIG.SHEETS.TIME_SLOTS, slotRow._rowIndex, slotRow);
  }

  // 日報進捗更新
  if (reportId) {
    var allSlots = slotData.rows.filter(function(r) { return String(r.report_id) === reportId; });
    var filledCount = allSlots.filter(function(r) {
      if (String(r.slot_id) === slotId) return false;
      return String(r.status) === 'filled' || String(r.status) === 'has_stop';
    }).length;
    var hasStop = allSlots.some(function(r) {
      if (String(r.slot_id) === slotId) return false;
      return String(r.status) === 'has_stop';
    });

    var rData = getSheetData(CONFIG.SHEETS.DAILY_REPORTS);
    var rRow = rData.rows.filter(function(r) { return String(r.report_id) === reportId; })[0];
    if (rRow) {
      rRow.filled_slots = filledCount;
      rRow.has_stop = hasStop;
      rRow.updated_at = now();
      updateRowByMap(CONFIG.SHEETS.DAILY_REPORTS, rRow._rowIndex, rRow);
    }
  }

  return { deleted: true };
}
