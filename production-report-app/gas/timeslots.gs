/**
 * 時間帯取得 — getTimeSlots
 */

function getTimeSlots(params) {
  var reportId = params.report_id;
  if (!reportId) throw new Error('report_id required');
  var data = getSheetData(CONFIG.SHEETS.TIME_SLOTS);
  return data.rows
    .filter(function(r) { return String(r.report_id) === reportId; })
    .map(cleanRow);
}
