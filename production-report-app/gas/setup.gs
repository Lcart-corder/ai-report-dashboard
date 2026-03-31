/**
 * 初期セットアップ — シート作成 + ヘッダー行 + 初期データ投入
 *
 * 使い方:
 * 1. Apps Script エディタで このファイルを開く
 * 2. 関数選択で「setupAllSheets」を選ぶ
 * 3. ▶実行ボタンを押す
 * 4. 初回は権限承認が必要
 *
 * 既存シートがある場合はスキップされます（安全）
 */

function setupAllSheets() {
  // config.gsに依存せず直接IDを指定（初回実行時の安全策）
  var ssId = '1sttdBmN6V5WLrAp7vagFlWePk_ldV1auVFzqj8-XrNc';
  var ss = SpreadsheetApp.openById(ssId);

  _setupSheet(ss, 'Users',
    ['email', 'name', 'name_vi', 'role', 'machine_no', 'is_active', 'created_at', 'updated_at'],
    [
      ['staff1@lcart-official.co.jp', '田中太郎', 'Tanaka Taro', 'staff', 'M06', true, '2026/04/01', '2026/04/01'],
      ['staff2@lcart-official.co.jp', 'グエン', 'Nguyễn Văn A', 'staff', 'M07', true, '2026/04/01', '2026/04/01'],
      ['kakarichou@lcart-official.co.jp', '鈴木一郎', 'Suzuki Ichiro', 'kakarichou', '', true, '2026/04/01', '2026/04/01'],
      ['hinshitsu@lcart-official.co.jp', '佐藤花子', 'Sato Hanako', 'hinshitsu', '', true, '2026/04/01', '2026/04/01'],
      ['buchou@lcart-official.co.jp', '高橋部長', 'Takahashi', 'buchou', '', true, '2026/04/01', '2026/04/01'],
      ['admin@lcart-official.co.jp', '管理者', 'Admin', 'admin', '', true, '2026/04/01', '2026/04/01'],
    ]
  );

  _setupSheet(ss, 'DailyReports',
    ['report_id', 'report_date', 'machine_no', 'status', 'total_slots', 'filled_slots', 'has_stop', 'created_by', 'created_at', 'updated_at', 'submitted_at'],
    []
  );

  _setupSheet(ss, 'TimeSlots',
    ['slot_id', 'report_id', 'start_time', 'end_time', 'status', 'created_at', 'updated_at'],
    []
  );

  _setupSheet(ss, 'ProductionInputs',
    ['input_id', 'slot_id', 'report_id', 'case_no_start', 'case_no_end', 'product_name', 'has_stop', 'stop_code', 'stop_time_minutes', 'abnormality', 'discharge_count', 'machine_discharge', 'verification', 'first_weight', 'judgment', 'input_by', 'input_at', 'updated_by', 'updated_at'],
    []
  );

  _setupSheet(ss, 'Approvals',
    ['approval_id', 'report_id', 'role', 'status', 'approver_email', 'comment', 'acted_at', 'created_at', 'updated_at'],
    []
  );

  _setupSheet(ss, 'StopCodes',
    ['stop_code', 'name_ja', 'name_vi', 'category', 'is_active', 'sort_order', 'created_at', 'updated_at'],
    [
      ['10', '段取り', 'Chuẩn bị', '計画停止', true, 1, '2026/04/01', '2026/04/01'],
      ['21', '金型', 'Khuôn', '設備故障', true, 2, '2026/04/01', '2026/04/01'],
      ['22', '成形機', 'Máy ép', '設備故障', true, 3, '2026/04/01', '2026/04/01'],
      ['23', '取出機', 'Robot lấy SP', '設備故障', true, 4, '2026/04/01', '2026/04/01'],
      ['25', '設備', 'Thiết bị', '設備故障', true, 5, '2026/04/01', '2026/04/01'],
      ['30', '品質', 'Chất lượng', '品質', true, 6, '2026/04/01', '2026/04/01'],
      ['31', '型拭（定期）', 'Lau khuôn (định kỳ)', 'メンテナンス', true, 7, '2026/04/01', '2026/04/01'],
      ['44', '欠品', 'Thiếu vật tư', '資材', true, 8, '2026/04/01', '2026/04/01'],
      ['51', '計画', 'Kế hoạch', '計画停止', true, 9, '2026/04/01', '2026/04/01'],
      ['99', '人員不足（その他）', 'Thiếu nhân sự (khác)', 'その他', true, 10, '2026/04/01', '2026/04/01'],
    ]
  );

  _setupSheet(ss, 'AuditLog',
    ['log_id', 'action', 'target_type', 'target_id', 'user_email', 'details', 'timestamp'],
    []
  );

  Logger.log('全シートのセットアップが完了しました');
  try {
    SpreadsheetApp.getUi().alert('セットアップ完了！\n\n7シートのヘッダー行と初期データを作成しました。');
  } catch(e) {
    // UIが使えない場合（API経由など）はスキップ
  }
}

/**
 * シートを作成（既存ならスキップ）、ヘッダー行と初期データを投入
 */
function _setupSheet(ss, sheetName, headers, dataRows) {
  var sheet = ss.getSheetByName(sheetName);

  if (sheet) {
    var firstCell = sheet.getRange(1, 1).getValue();
    if (firstCell) {
      Logger.log(sheetName + ': 既にデータあり。スキップ。');
      return;
    }
  } else {
    sheet = ss.insertSheet(sheetName);
    Logger.log(sheetName + ': シート作成');
  }

  // ヘッダー行
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#f3f4f6');
  sheet.setFrozenRows(1);

  // 初期データ
  if (dataRows.length > 0) {
    sheet.getRange(2, 1, dataRows.length, dataRows[0].length).setValues(dataRows);
    Logger.log('  → ' + dataRows.length + '行の初期データを投入');
  }

  // 列幅自動調整
  for (var i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }

  Logger.log(sheetName + ': 完了');
}
