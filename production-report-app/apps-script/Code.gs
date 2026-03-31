/**
 * Factory Production Daily Report - Apps Script API
 * All read/write uses column-name-based access (no column-index dependency).
 * IDs are deterministic, not row-number-based.
 */

const SPREADSHEET_ID = "1sttdBmN6V5WLrAp7vagFlWePk_ldV1auVFzqj8-XrNc";

function getSheet(name) {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
}

// ===== Column-name-based helpers =====

function getSheetData(sheetName) {
  const sheet = getSheet(sheetName);
  if (!sheet) return { headers: [], rows: [], sheet: null };
  const data = sheet.getDataRange().getValues();
  if (data.length === 0) return { headers: [], rows: [], sheet };
  const headers = data[0].map(String);
  const rows = data.slice(1).map((row, idx) => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    obj._rowIndex = idx + 2; // 1-based, +1 for header
    return obj;
  });
  return { headers, rows, sheet };
}

function appendRow(sheetName, headers, record) {
  const sheet = getSheet(sheetName);
  const row = headers.map(h => record[h] !== undefined ? record[h] : "");
  sheet.appendRow(row);
}

function updateRow(sheetName, headers, rowIndex, record) {
  const sheet = getSheet(sheetName);
  const row = headers.map(h => record[h] !== undefined ? record[h] : "");
  sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
}

function now() {
  return new Date().toISOString();
}

// ===== CORS =====

function doOptions() {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function successResponse(data) {
  return createJsonResponse({ success: true, data });
}

function errorResponse(message) {
  return createJsonResponse({ success: false, error: message });
}

// ===== Request Handlers =====

function doGet(e) {
  try {
    const action = e.parameter.action;
    switch (action) {
      case "getCurrentUser": return handleGetCurrentUser(e.parameter);
      case "getReport": return handleGetReport(e.parameter);
      case "getReportsByDate": return handleGetReportsByDate(e.parameter);
      case "getTimeSlots": return handleGetTimeSlots(e.parameter);
      case "getProductionInput": return handleGetProductionInput(e.parameter);
      case "getDailySummary": return handleGetDailySummary(e.parameter);
      case "getStopCodes": return handleGetStopCodes(e.parameter);
      case "getUsers": return handleGetUsers(e.parameter);
      case "getMyReports": return handleGetMyReports(e.parameter);
      case "getPendingApprovals": return handleGetPendingApprovals(e.parameter);
      default: return errorResponse("Unknown action: " + action);
    }
  } catch (err) {
    return errorResponse(err.message);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    switch (action) {
      case "createReport": return handleCreateReport(body);
      case "saveProductionInput": return handleSaveProductionInput(body);
      case "deleteProductionInput": return handleDeleteProductionInput(body);
      case "submitForApproval": return handleSubmitForApproval(body);
      case "approveReport": return handleApproveReport(body);
      case "rejectReport": return handleRejectReport(body);
      default: return errorResponse("Unknown action: " + action);
    }
  } catch (err) {
    return errorResponse(err.message);
  }
}

// ===== API Implementations =====

// 1. getCurrentUser
function handleGetCurrentUser(params) {
  const email = params.email;
  if (!email) return errorResponse("email is required");
  const { rows } = getSheetData("Users");
  const user = rows.find(r => String(r.email).toLowerCase() === email.toLowerCase() && String(r.is_active) === "TRUE");
  if (!user) return errorResponse("User not found or inactive");
  delete user._rowIndex;
  return successResponse(user);
}

// 2. createReport (idempotent)
function handleCreateReport(body) {
  const { report_date, machine_no, email } = body;
  if (!report_date || !machine_no || !email) return errorResponse("report_date, machine_no, email required");

  const reportId = report_date.replace(/-/g, "") + "_" + machine_no;

  // Check existing
  const { rows: existingReports } = getSheetData("DailyReports");
  const existing = existingReports.find(r => String(r.report_id) === reportId);
  if (existing) {
    delete existing._rowIndex;
    return successResponse(existing);
  }

  const reportHeaders = ["report_id", "report_date", "machine_no", "status", "total_slots", "filled_slots", "has_stop", "created_by", "created_at", "updated_at", "submitted_at"];
  const report = {
    report_id: reportId,
    report_date,
    machine_no,
    status: "draft",
    total_slots: 24,
    filled_slots: 0,
    has_stop: false,
    created_by: email,
    created_at: now(),
    updated_at: now(),
    submitted_at: "",
  };
  appendRow("DailyReports", reportHeaders, report);

  // Create 24 time slots
  const slotHeaders = ["slot_id", "report_id", "start_time", "end_time", "status", "created_at", "updated_at"];
  for (let i = 0; i < 24; i++) {
    const hour = (7 + i) % 24;
    const nextHour = (8 + i) % 24;
    const startTime = String(hour).padStart(2, "0") + ":00";
    const endTime = String(nextHour).padStart(2, "0") + ":00";
    const slotId = reportId + "_" + String(hour).padStart(2, "0") + "00";
    appendRow("TimeSlots", slotHeaders, {
      slot_id: slotId,
      report_id: reportId,
      start_time: startTime,
      end_time: endTime,
      status: "empty",
      created_at: now(),
      updated_at: now(),
    });
  }

  // Create approval records
  const approvalHeaders = ["approval_id", "report_id", "role", "status", "approver_email", "comment", "acted_at", "created_at", "updated_at"];
  const roles = ["kakarichou", "hinshitsu", "buchou"];
  roles.forEach(role => {
    appendRow("Approvals", approvalHeaders, {
      approval_id: reportId + "_" + role,
      report_id: reportId,
      role,
      status: "pending",
      approver_email: "",
      comment: "",
      acted_at: "",
      created_at: now(),
      updated_at: now(),
    });
  });

  return successResponse(report);
}

// 3. getReport
function handleGetReport(params) {
  const { report_id } = params;
  if (!report_id) return errorResponse("report_id required");
  const { rows } = getSheetData("DailyReports");
  const report = rows.find(r => String(r.report_id) === report_id);
  if (!report) return errorResponse("Report not found");
  delete report._rowIndex;
  return successResponse(report);
}

// 4. getReportsByDate
function handleGetReportsByDate(params) {
  const { date } = params;
  if (!date) return errorResponse("date required");
  const { rows } = getSheetData("DailyReports");
  const reports = rows.filter(r => String(r.report_date) === date).map(r => { delete r._rowIndex; return r; });
  return successResponse(reports);
}

// 5. getTimeSlots
function handleGetTimeSlots(params) {
  const { report_id } = params;
  if (!report_id) return errorResponse("report_id required");
  const { rows } = getSheetData("TimeSlots");
  const slots = rows.filter(r => String(r.report_id) === report_id).map(r => { delete r._rowIndex; return r; });
  return successResponse(slots);
}

// 6. getProductionInput
function handleGetProductionInput(params) {
  const { slot_id } = params;
  if (!slot_id) return errorResponse("slot_id required");
  const { rows } = getSheetData("ProductionInputs");
  const input = rows.find(r => String(r.slot_id) === slot_id);
  if (!input) return successResponse(null);
  delete input._rowIndex;
  return successResponse(input);
}

// 7. saveProductionInput (idempotent upsert)
function handleSaveProductionInput(body) {
  const { slot_id, report_id, email } = body;
  if (!slot_id || !report_id) return errorResponse("slot_id, report_id required");

  const inputHeaders = ["input_id", "slot_id", "report_id", "case_no_start", "case_no_end", "product_name", "has_stop", "stop_code", "stop_time_minutes", "abnormality", "discharge_count", "machine_discharge", "verification", "first_weight", "judgment", "input_by", "input_at", "updated_by", "updated_at"];
  const inputId = slot_id + "_01";

  const { headers, rows, sheet } = getSheetData("ProductionInputs");
  const existingIdx = rows.findIndex(r => String(r.slot_id) === slot_id);

  const record = {
    input_id: inputId,
    slot_id,
    report_id,
    case_no_start: body.case_no_start || 0,
    case_no_end: body.case_no_end || 0,
    product_name: body.product_name || "",
    has_stop: body.has_stop || false,
    stop_code: body.stop_code || "",
    stop_time_minutes: body.stop_time_minutes || 0,
    abnormality: body.abnormality || "",
    discharge_count: body.discharge_count || 0,
    machine_discharge: body.machine_discharge || 0,
    verification: body.verification || "○",
    first_weight: body.first_weight || 0,
    judgment: body.judgment || "合",
    input_by: existingIdx >= 0 ? rows[existingIdx].input_by : email,
    input_at: existingIdx >= 0 ? rows[existingIdx].input_at : now(),
    updated_by: email,
    updated_at: now(),
  };

  if (existingIdx >= 0) {
    updateRow("ProductionInputs", headers.length > 0 ? headers : inputHeaders, rows[existingIdx]._rowIndex, record);
  } else {
    appendRow("ProductionInputs", inputHeaders, record);
  }

  // Update TimeSlot status
  const slotStatus = body.has_stop ? "has_stop" : "filled";
  const { headers: slotHeaders, rows: slotRows } = getSheetData("TimeSlots");
  const slotRow = slotRows.find(r => String(r.slot_id) === slot_id);
  if (slotRow) {
    slotRow.status = slotStatus;
    slotRow.updated_at = now();
    updateRow("TimeSlots", slotHeaders, slotRow._rowIndex, slotRow);
  }

  // Update DailyReport progress
  const allSlots = slotRows.filter(r => String(r.report_id) === report_id);
  // Recount: we just updated slotRow in memory, so use current data
  const filledCount = allSlots.filter(r => {
    if (String(r.slot_id) === slot_id) return true; // just saved
    return String(r.status) === "filled" || String(r.status) === "has_stop";
  }).length;
  const hasStop = allSlots.some(r => {
    if (String(r.slot_id) === slot_id) return body.has_stop;
    return String(r.status) === "has_stop";
  });

  const { headers: reportHeaders, rows: reportRows } = getSheetData("DailyReports");
  const reportRow = reportRows.find(r => String(r.report_id) === report_id);
  if (reportRow) {
    reportRow.filled_slots = filledCount;
    reportRow.has_stop = hasStop;
    reportRow.updated_at = now();
    updateRow("DailyReports", reportHeaders, reportRow._rowIndex, reportRow);
  }

  // Find next unfilled slot
  const nextUnfilled = allSlots.find(r => {
    if (String(r.slot_id) === slot_id) return false;
    return String(r.status) === "empty";
  });

  const responseData = {
    input: record,
    next_unfilled_slot: nextUnfilled ? (function() { delete nextUnfilled._rowIndex; return nextUnfilled; })() : null,
    report_progress: {
      total_slots: 24,
      filled_slots: filledCount,
      is_complete: filledCount >= 24,
    },
  };

  return successResponse(responseData);
}

// 8. deleteProductionInput
function handleDeleteProductionInput(body) {
  const { slot_id, report_id } = body;
  if (!slot_id) return errorResponse("slot_id required");

  const { headers, rows, sheet } = getSheetData("ProductionInputs");
  const idx = rows.findIndex(r => String(r.slot_id) === slot_id);
  if (idx >= 0) {
    sheet.deleteRow(rows[idx]._rowIndex);
  }

  // Reset TimeSlot status
  const { headers: slotHeaders, rows: slotRows } = getSheetData("TimeSlots");
  const slotRow = slotRows.find(r => String(r.slot_id) === slot_id);
  if (slotRow) {
    slotRow.status = "empty";
    slotRow.updated_at = now();
    updateRow("TimeSlots", slotHeaders, slotRow._rowIndex, slotRow);
  }

  // Update report progress
  if (report_id) {
    const allSlots = slotRows.filter(r => String(r.report_id) === report_id);
    const filledCount = allSlots.filter(r => {
      if (String(r.slot_id) === slot_id) return false;
      return String(r.status) === "filled" || String(r.status) === "has_stop";
    }).length;
    const hasStop = allSlots.some(r => {
      if (String(r.slot_id) === slot_id) return false;
      return String(r.status) === "has_stop";
    });

    const { headers: rHeaders, rows: rRows } = getSheetData("DailyReports");
    const rRow = rRows.find(r => String(r.report_id) === report_id);
    if (rRow) {
      rRow.filled_slots = filledCount;
      rRow.has_stop = hasStop;
      rRow.updated_at = now();
      updateRow("DailyReports", rHeaders, rRow._rowIndex, rRow);
    }
  }

  return successResponse({ deleted: true });
}

// 9. getDailySummary
function handleGetDailySummary(params) {
  const { report_id } = params;
  if (!report_id) return errorResponse("report_id required");

  const { rows: reportRows } = getSheetData("DailyReports");
  const report = reportRows.find(r => String(r.report_id) === report_id);
  if (!report) return errorResponse("Report not found");
  delete report._rowIndex;

  const { rows: slotRows } = getSheetData("TimeSlots");
  const slots = slotRows.filter(r => String(r.report_id) === report_id).map(r => { delete r._rowIndex; return r; });

  const { rows: inputRows } = getSheetData("ProductionInputs");
  const inputs = inputRows.filter(r => String(r.report_id) === report_id).map(r => { delete r._rowIndex; return r; });

  const { rows: approvalRows } = getSheetData("Approvals");
  const approvals = approvalRows.filter(r => String(r.report_id) === report_id).map(r => { delete r._rowIndex; return r; });

  const totals = {
    total_discharge: 0,
    total_machine_discharge: 0,
    stop_count: 0,
    ng_count: 0,
    total_stop_minutes: 0,
  };

  inputs.forEach(inp => {
    totals.total_discharge += Number(inp.discharge_count) || 0;
    totals.total_machine_discharge += Number(inp.machine_discharge) || 0;
    if (String(inp.has_stop) === "true" || inp.has_stop === true) {
      totals.stop_count++;
      totals.total_stop_minutes += Number(inp.stop_time_minutes) || 0;
    }
    if (String(inp.judgment) === "否") {
      totals.ng_count++;
    }
  });

  return successResponse({ report, slots, inputs, approvals, totals });
}

// 10. submitForApproval
function handleSubmitForApproval(body) {
  const { report_id } = body;
  if (!report_id) return errorResponse("report_id required");

  const { headers, rows } = getSheetData("DailyReports");
  const report = rows.find(r => String(r.report_id) === report_id);
  if (!report) return errorResponse("Report not found");

  if (Number(report.filled_slots) < Number(report.total_slots)) {
    return errorResponse("All time slots must be filled before submission");
  }

  report.status = "submitted";
  report.submitted_at = now();
  report.updated_at = now();
  updateRow("DailyReports", headers, report._rowIndex, report);

  delete report._rowIndex;
  return successResponse(report);
}

// 11. approveReport
function handleApproveReport(body) {
  const { report_id, role, email } = body;
  if (!report_id || !role || !email) return errorResponse("report_id, role, email required");

  // Update approval record
  const { headers: aHeaders, rows: aRows } = getSheetData("Approvals");
  const approval = aRows.find(r => String(r.report_id) === report_id && String(r.role) === role);
  if (!approval) return errorResponse("Approval record not found");

  approval.status = "approved";
  approval.approver_email = email;
  approval.acted_at = now();
  approval.updated_at = now();
  updateRow("Approvals", aHeaders, approval._rowIndex, approval);

  // Update report status
  const statusMap = {
    kakarichou: "approved_kakarichou",
    hinshitsu: "approved_hinshitsu",
    buchou: "approved_buchou",
  };
  const { headers: rHeaders, rows: rRows } = getSheetData("DailyReports");
  const report = rRows.find(r => String(r.report_id) === report_id);
  if (report) {
    report.status = statusMap[role] || report.status;
    report.updated_at = now();
    updateRow("DailyReports", rHeaders, report._rowIndex, report);
  }

  delete approval._rowIndex;
  return successResponse(approval);
}

// 12. rejectReport
function handleRejectReport(body) {
  const { report_id, role, email, comment } = body;
  if (!report_id || !role || !email) return errorResponse("report_id, role, email required");
  if (!comment) return errorResponse("Comment is required for rejection");

  // Update the rejecting approval record
  const { headers: aHeaders, rows: aRows } = getSheetData("Approvals");
  const approval = aRows.find(r => String(r.report_id) === report_id && String(r.role) === role);
  if (!approval) return errorResponse("Approval record not found");

  approval.status = "rejected";
  approval.approver_email = email;
  approval.comment = comment;
  approval.acted_at = now();
  approval.updated_at = now();
  updateRow("Approvals", aHeaders, approval._rowIndex, approval);

  // Reset all approvals
  const allApprovals = aRows.filter(r => String(r.report_id) === report_id);
  allApprovals.forEach(a => {
    if (String(a.approval_id) !== String(approval.approval_id)) {
      a.status = "pending";
      a.approver_email = "";
      a.comment = "";
      a.acted_at = "";
      a.updated_at = now();
      updateRow("Approvals", aHeaders, a._rowIndex, a);
    }
  });

  // Update report status
  const { headers: rHeaders, rows: rRows } = getSheetData("DailyReports");
  const report = rRows.find(r => String(r.report_id) === report_id);
  if (report) {
    report.status = "rejected";
    report.updated_at = now();
    updateRow("DailyReports", rHeaders, report._rowIndex, report);
  }

  delete approval._rowIndex;
  return successResponse(approval);
}

// 13. getStopCodes
function handleGetStopCodes() {
  const { rows } = getSheetData("StopCodes");
  const codes = rows
    .filter(r => String(r.is_active) === "TRUE")
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
    .map(r => { delete r._rowIndex; return r; });
  return successResponse(codes);
}

// 14. getUsers
function handleGetUsers() {
  const { rows } = getSheetData("Users");
  const users = rows.map(r => { delete r._rowIndex; return r; });
  return successResponse(users);
}

// 15. getMyReports
function handleGetMyReports(params) {
  const { email, limit } = params;
  if (!email) return errorResponse("email required");
  const { rows } = getSheetData("DailyReports");
  const reports = rows
    .filter(r => String(r.created_by).toLowerCase() === email.toLowerCase())
    .sort((a, b) => String(b.report_date).localeCompare(String(a.report_date)))
    .slice(0, Number(limit) || 30)
    .map(r => { delete r._rowIndex; return r; });
  return successResponse(reports);
}

// 16. getPendingApprovals
function handleGetPendingApprovals(params) {
  const { role } = params;
  if (!role) return errorResponse("role required");

  const statusForRole = {
    kakarichou: ["submitted", "resubmitted"],
    hinshitsu: ["approved_kakarichou"],
    buchou: ["approved_hinshitsu"],
  };

  const validStatuses = statusForRole[role];
  if (!validStatuses) return errorResponse("Invalid role for approvals");

  const { rows } = getSheetData("DailyReports");
  const pending = rows
    .filter(r => validStatuses.includes(String(r.status)))
    .map(r => {
      delete r._rowIndex;
      return { report: r, current_role: role };
    });

  return successResponse(pending);
}
