/**
 * 日報CRUD — createReport, getReport, getReportsByDate, getMyReports, submitForApproval
 */

/** 日報作成（冪等: 同一IDが既存なら既存を返す） */
function createReport(params) {
  var reportDate = params.report_date;
  var machineNo  = params.machine_no;
  var createdBy  = params.created_by;
  if (!reportDate || !machineNo || !createdBy) throw new Error('report_date, machine_no, created_by required');

  var reportId = reportDate.replace(/[\/-]/g, '') + '_' + machineNo;

  // 既存チェック
  var existing = getSheetData(CONFIG.SHEETS.DAILY_REPORTS);
  var found = existing.rows.filter(function(r) { return String(r.report_id) === reportId; })[0];
  if (found) return cleanRow(found);

  // 日報ヘッダー作成
  var report = {
    report_id: reportId,
    report_date: reportDate,
    machine_no: machineNo,
    status: 'draft',
    total_slots: 24,
    filled_slots: 0,
    has_stop: false,
    created_by: createdBy,
    created_at: now(),
    updated_at: now(),
    submitted_at: '',
  };
  appendRowByMap(CONFIG.SHEETS.DAILY_REPORTS, report);

  // 24時間帯を生成
  var timeSlots = [];
  CONFIG.TIME_SLOT_HOURS.forEach(function(hour) {
    var hh = ('0' + hour).slice(-2);
    var nextHour = (hour + 1) % 24;
    var nextHH = ('0' + nextHour).slice(-2);
    var slotId = reportId + '_' + hh + '00';
    var slot = {
      slot_id: slotId,
      report_id: reportId,
      start_time: hh + ':00',
      end_time: hh + ':59',
      status: 'empty',
      created_at: now(),
      updated_at: now(),
    };
    appendRowByMap(CONFIG.SHEETS.TIME_SLOTS, slot);
    timeSlots.push({ slot_id: slotId, start_time: slot.start_time, end_time: slot.end_time, status: 'empty' });
  });

  // 承認レコード3件を生成
  CONFIG.APPROVAL_ORDER.forEach(function(role) {
    appendRowByMap(CONFIG.SHEETS.APPROVALS, {
      approval_id: reportId + '_' + role,
      report_id: reportId,
      role: role,
      status: 'pending',
      approver_email: '',
      comment: '',
      acted_at: '',
      created_at: now(),
      updated_at: now(),
    });
  });

  writeAuditLog('create', 'report', reportId, createdBy);

  return {
    report_id: reportId,
    status: 'draft',
    total_slots: 24,
    filled_slots: 0,
    time_slots: timeSlots,
  };
}

/** 日報取得 */
function getReport(params) {
  var reportId = params.report_id;
  if (!reportId) throw new Error('report_id required');
  var data = getSheetData(CONFIG.SHEETS.DAILY_REPORTS);
  var row = data.rows.filter(function(r) { return String(r.report_id) === reportId; })[0];
  if (!row) throw new Error('Report not found');
  return cleanRow(row);
}

/** 日付指定で日報一覧 */
function getReportsByDate(params) {
  var date = params.date;
  if (!date) throw new Error('date required');
  var data = getSheetData(CONFIG.SHEETS.DAILY_REPORTS);
  return data.rows
    .filter(function(r) { return String(r.report_date) === date; })
    .map(cleanRow);
}

/** 自分の日報一覧 */
function getMyReports(params) {
  var email = params.email;
  var limit = Number(params.limit) || 30;
  if (!email) throw new Error('email required');
  var data = getSheetData(CONFIG.SHEETS.DAILY_REPORTS);
  return data.rows
    .filter(function(r) { return String(r.created_by).toLowerCase() === email.toLowerCase(); })
    .sort(function(a, b) { return String(b.report_date).localeCompare(String(a.report_date)); })
    .slice(0, limit)
    .map(cleanRow);
}

/** 承認申請 */
function submitForApproval(params) {
  var reportId = params.report_id;
  var submittedBy = params.submitted_by || '';
  if (!reportId) throw new Error('report_id required');

  var data = getSheetData(CONFIG.SHEETS.DAILY_REPORTS);
  var row = data.rows.filter(function(r) { return String(r.report_id) === reportId; })[0];
  if (!row) throw new Error('Report not found');

  if (Number(row.filled_slots) < Number(row.total_slots)) {
    throw new Error('All time slots must be filled before submission');
  }

  row.status = 'submitted';
  row.submitted_at = now();
  row.updated_at = now();
  updateRowByMap(CONFIG.SHEETS.DAILY_REPORTS, row._rowIndex, row);

  writeAuditLog('submit', 'report', reportId, submittedBy);
  return cleanRow(row);
}
