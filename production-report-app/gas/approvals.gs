/**
 * 承認フロー — approveReport, rejectReport, getPendingApprovals
 */

/** 承認 */
function approveReport(params) {
  var reportId = params.report_id;
  var approverEmail = params.approver_email;
  var comment = params.comment || '';
  if (!reportId || !approverEmail) throw new Error('report_id, approver_email required');

  // 承認者のroleを取得
  var userData = getSheetData(CONFIG.SHEETS.USERS);
  var approver = userData.rows.filter(function(r) {
    return String(r.email).toLowerCase() === approverEmail.toLowerCase();
  })[0];
  if (!approver) throw new Error('Approver not found');
  var role = String(approver.role);

  // 順番チェック: 日報statusが自分の承認可能statusか確認
  var reportData = getSheetData(CONFIG.SHEETS.DAILY_REPORTS);
  var report = reportData.rows.filter(function(r) { return String(r.report_id) === reportId; })[0];
  if (!report) throw new Error('Report not found');

  var validStatuses = CONFIG.APPROVABLE_STATUS[role];
  if (!validStatuses || validStatuses.indexOf(String(report.status)) === -1) {
    throw new Error('This report cannot be approved by ' + role + ' at current status: ' + report.status);
  }

  // Approvalレコード更新
  var aData = getSheetData(CONFIG.SHEETS.APPROVALS);
  var approval = aData.rows.filter(function(r) {
    return String(r.report_id) === reportId && String(r.role) === role;
  })[0];
  if (!approval) throw new Error('Approval record not found');

  approval.status = 'approved';
  approval.approver_email = approverEmail;
  approval.comment = comment;
  approval.acted_at = now();
  approval.updated_at = now();
  updateRowByMap(CONFIG.SHEETS.APPROVALS, approval._rowIndex, approval);

  // 日報statusを更新
  report.status = CONFIG.APPROVED_STATUS[role];
  report.updated_at = now();
  updateRowByMap(CONFIG.SHEETS.DAILY_REPORTS, report._rowIndex, report);

  writeAuditLog('approve', 'report', reportId, approverEmail, { role: role });

  return cleanRow(approval);
}

/** 差戻し */
function rejectReport(params) {
  var reportId = params.report_id;
  var approverEmail = params.approver_email;
  var comment = params.comment;
  if (!reportId || !approverEmail) throw new Error('report_id, approver_email required');
  if (!comment) throw new Error('Comment is required for rejection');

  // 承認者のroleを取得
  var userData = getSheetData(CONFIG.SHEETS.USERS);
  var approver = userData.rows.filter(function(r) {
    return String(r.email).toLowerCase() === approverEmail.toLowerCase();
  })[0];
  if (!approver) throw new Error('Approver not found');
  var role = String(approver.role);

  // 差戻しApproval更新
  var aData = getSheetData(CONFIG.SHEETS.APPROVALS);
  var approval = aData.rows.filter(function(r) {
    return String(r.report_id) === reportId && String(r.role) === role;
  })[0];
  if (!approval) throw new Error('Approval record not found');

  approval.status = 'rejected';
  approval.approver_email = approverEmail;
  approval.comment = comment;
  approval.acted_at = now();
  approval.updated_at = now();
  updateRowByMap(CONFIG.SHEETS.APPROVALS, approval._rowIndex, approval);

  // 全承認をリセット
  var allApprovals = aData.rows.filter(function(r) { return String(r.report_id) === reportId; });
  allApprovals.forEach(function(a) {
    if (String(a.approval_id) !== String(approval.approval_id)) {
      a.status = 'pending';
      a.approver_email = '';
      a.comment = '';
      a.acted_at = '';
      a.updated_at = now();
      updateRowByMap(CONFIG.SHEETS.APPROVALS, a._rowIndex, a);
    }
  });

  // 日報statusをrejectedに
  var reportData = getSheetData(CONFIG.SHEETS.DAILY_REPORTS);
  var report = reportData.rows.filter(function(r) { return String(r.report_id) === reportId; })[0];
  if (report) {
    report.status = 'rejected';
    report.updated_at = now();
    updateRowByMap(CONFIG.SHEETS.DAILY_REPORTS, report._rowIndex, report);
  }

  writeAuditLog('reject', 'report', reportId, approverEmail, { role: role, comment: comment });

  return cleanRow(approval);
}

/** 承認待ち一覧 */
function getPendingApprovals(params) {
  var role = params.role;
  if (!role) throw new Error('role required');

  var validStatuses = CONFIG.APPROVABLE_STATUS[role];
  if (!validStatuses) throw new Error('Invalid role for approvals');

  var data = getSheetData(CONFIG.SHEETS.DAILY_REPORTS);
  return data.rows
    .filter(function(r) { return validStatuses.indexOf(String(r.status)) !== -1; })
    .map(function(r) { return { report: cleanRow(r), current_role: role }; });
}

/** 日報サマリー */
function getDailySummary(params) {
  var reportId = params.report_id;
  if (!reportId) throw new Error('report_id required');

  var reportData = getSheetData(CONFIG.SHEETS.DAILY_REPORTS);
  var report = reportData.rows.filter(function(r) { return String(r.report_id) === reportId; })[0];
  if (!report) throw new Error('Report not found');

  var slotData = getSheetData(CONFIG.SHEETS.TIME_SLOTS);
  var slots = slotData.rows.filter(function(r) { return String(r.report_id) === reportId; });

  var inputData = getSheetData(CONFIG.SHEETS.PRODUCTION_INPUTS);
  var inputs = inputData.rows.filter(function(r) { return String(r.report_id) === reportId; });

  var approvalData = getSheetData(CONFIG.SHEETS.APPROVALS);
  var approvals = approvalData.rows.filter(function(r) { return String(r.report_id) === reportId; });

  // 集計
  var summaryStats = {
    total_discharge: 0,
    total_machine_discharge: 0,
    stop_count: 0,
    total_stop_minutes: 0,
    ng_count: 0,
  };
  inputs.forEach(function(inp) {
    summaryStats.total_discharge += Number(inp.discharge_count) || 0;
    summaryStats.total_machine_discharge += Number(inp.machine_discharge) || 0;
    if (String(inp.has_stop) === 'true' || inp.has_stop === true) {
      summaryStats.stop_count++;
      summaryStats.total_stop_minutes += Number(inp.stop_time_minutes) || 0;
    }
    if (String(inp.judgment) === '否') {
      summaryStats.ng_count++;
    }
  });

  // スロットにinputを紐付け
  var slotsWithInput = slots.map(function(slot) {
    var input = inputs.filter(function(i) { return String(i.slot_id) === String(slot.slot_id); })[0];
    var result = {
      slot_id: String(slot.slot_id),
      start_time: String(slot.start_time),
      end_time: String(slot.end_time),
      status: String(slot.status),
    };
    if (input) {
      result.input = {
        case_no_start: input.case_no_start,
        case_no_end: input.case_no_end,
        product_name: input.product_name,
        has_stop: input.has_stop,
        stop_code: input.stop_code,
        stop_time_minutes: input.stop_time_minutes,
        abnormality: input.abnormality,
        discharge_count: input.discharge_count,
        machine_discharge: input.machine_discharge,
        verification: input.verification,
        first_weight: input.first_weight,
        judgment: input.judgment,
      };
    }
    return result;
  });

  return {
    report: cleanRow(report),
    slots: slotsWithInput,
    approvals: approvals.map(function(a) {
      return { role: a.role, status: a.status, approver_email: a.approver_email, comment: a.comment, acted_at: a.acted_at };
    }),
    summary_stats: summaryStats,
  };
}
