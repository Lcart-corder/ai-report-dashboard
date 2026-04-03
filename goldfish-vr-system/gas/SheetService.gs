/**
 * おえかき金魚VR体験システム - スプレッドシートサービス
 * Google Sheetsへのデータ読み書き機能
 */

/**
 * シートの参照を取得する（存在しない場合はヘッダー行付きで作成）
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} シートオブジェクト
 */
function getSheet() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    // ヘッダー行を追加
    sheet.getRange(1, 1, 1, HEADER_ROW.length).setValues([HEADER_ROW]);
    sheet.getRange(1, 1, 1, HEADER_ROW.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    Logger.log('新しいシートを作成しました: ' + CONFIG.SHEET_NAME);
  }

  return sheet;
}

/**
 * UUID風のユニークIDを生成する
 * @returns {string} 作品ID (例: "gf-a1b2c3d4")
 */
function generateArtworkId_() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'gf-';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // タイムスタンプの下4桁を追加して衝突を減らす
  id += '-' + Date.now().toString(36).slice(-4);
  return id;
}

/**
 * 新しい作品をシートに追加する
 * @param {Object} artworkData - 作品データ
 * @param {string} artworkData.child_name - 子どもの名前
 * @param {string} artworkData.title - 作品タイトル
 * @param {string} artworkData.original_file_name - 元のファイル名
 * @param {string} artworkData.drive_file_id - DriveのファイルID
 * @param {string} artworkData.image_url - 画像URL
 * @returns {string} 生成された作品ID
 */
function addArtwork(artworkData) {
  try {
    const sheet = getSheet();
    const artworkId = generateArtworkId_();
    const now = new Date().toISOString();

    const rowData = [
      artworkId,                              // A: artwork_id
      artworkData.child_name || '',           // B: child_name
      artworkData.title || '',                // C: title
      artworkData.original_file_name || '',   // D: original_file_name
      artworkData.drive_file_id || '',        // E: drive_file_id
      artworkData.image_url || '',            // F: image_url
      STATUS.UPLOADED,                        // G: status
      now,                                    // H: uploaded_at
      '',                                     // I: analyzed_at
      '',                                     // J: primary_colors
      '',                                     // K: body_shape
      '',                                     // L: fin_size
      '',                                     // M: tail_shape
      '',                                     // N: mood_tags
      '',                                     // O: confidence
      '',                                     // P: fish_params_json
      VR_STATUS.PENDING,                      // Q: vr_status
      '',                                     // R: error_message
      now,                                    // S: updated_at
    ];

    sheet.appendRow(rowData);
    Logger.log('作品を追加しました: ' + artworkId);

    return artworkId;
  } catch (error) {
    Logger.log('作品追加エラー: ' + error.message);
    throw new Error('作品の保存に失敗しました: ' + error.message);
  }
}

/**
 * 作品IDで行番号を検索する（内部ヘルパー）
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - シートオブジェクト
 * @param {string} artworkId - 作品ID
 * @returns {number|null} 行番号（1始まり）、見つからない場合はnull
 */
function findRowByArtworkId_(sheet, artworkId) {
  const data = sheet.getRange(2, COLUMNS.ARTWORK_ID, sheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === artworkId) {
      return i + 2; // ヘッダー行分の+1と、0始まりの+1
    }
  }
  return null;
}

/**
 * 作品データを更新する
 * @param {string} artworkId - 作品ID
 * @param {Object} updates - 更新するフィールドのキーバリューペア
 */
function updateArtwork(artworkId, updates) {
  try {
    const sheet = getSheet();
    const rowNum = findRowByArtworkId_(sheet, artworkId);

    if (!rowNum) {
      throw new Error('作品が見つかりません: ' + artworkId);
    }

    // 更新日時を自動設定
    updates.updated_at = new Date().toISOString();

    // 各フィールドを更新
    for (const key in updates) {
      const colIndex = COLUMN_KEYS.indexOf(key);
      if (colIndex > 0) {
        const value = updates[key];
        // 配列やオブジェクトはJSON文字列に変換
        const cellValue = (typeof value === 'object' && value !== null)
          ? JSON.stringify(value)
          : value;
        sheet.getRange(rowNum, colIndex).setValue(cellValue);
      }
    }

    Logger.log('作品を更新しました: ' + artworkId);
  } catch (error) {
    Logger.log('作品更新エラー: ' + error.message);
    throw new Error('作品の更新に失敗しました: ' + error.message);
  }
}

/**
 * 行データをオブジェクトに変換する（内部ヘルパー）
 * @param {Array} rowValues - 行の値の配列
 * @returns {Object} 作品オブジェクト
 */
function rowToObject_(rowValues) {
  const obj = {};
  for (let i = 0; i < COLUMN_KEYS.length && i <= rowValues.length; i++) {
    if (COLUMN_KEYS[i]) {
      let value = rowValues[i - 1]; // COLUMN_KEYSは1始まり

      // JSON文字列のフィールドをパースする
      if (['primary_colors', 'mood_tags', 'fish_params_json'].includes(COLUMN_KEYS[i])) {
        if (typeof value === 'string' && value.trim()) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            // パース失敗時はそのまま文字列として返す
          }
        }
      }

      // confidence を数値に変換
      if (COLUMN_KEYS[i] === 'confidence' && value !== '' && value !== null) {
        const num = parseFloat(value);
        if (!isNaN(num)) value = num;
      }

      obj[COLUMN_KEYS[i]] = value !== undefined ? value : '';
    }
  }
  return obj;
}

/**
 * 作品IDで作品データを取得する
 * @param {string} artworkId - 作品ID
 * @returns {Object|null} 作品オブジェクト、見つからない場合はnull
 */
function getArtworkById(artworkId) {
  try {
    const sheet = getSheet();
    const rowNum = findRowByArtworkId_(sheet, artworkId);

    if (!rowNum) {
      return null;
    }

    const rowValues = sheet.getRange(rowNum, 1, 1, HEADER_ROW.length).getValues()[0];
    return rowToObject_(rowValues);
  } catch (error) {
    Logger.log('作品取得エラー: ' + error.message);
    throw new Error('作品の取得に失敗しました: ' + error.message);
  }
}

/**
 * 全作品データを取得する
 * @returns {Array<Object>} 作品オブジェクトの配列
 */
function getAllArtworks() {
  try {
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      return []; // ヘッダー行のみ
    }

    const data = sheet.getRange(2, 1, lastRow - 1, HEADER_ROW.length).getValues();
    return data.map(function(row) {
      return rowToObject_(row);
    });
  } catch (error) {
    Logger.log('全作品取得エラー: ' + error.message);
    throw new Error('作品一覧の取得に失敗しました: ' + error.message);
  }
}

/**
 * ステータスで作品をフィルタリングして取得する
 * @param {string} status - フィルタするステータス
 * @returns {Array<Object>} フィルタされた作品オブジェクトの配列
 */
function getArtworksByStatus(status) {
  try {
    const allArtworks = getAllArtworks();
    return allArtworks.filter(function(artwork) {
      return artwork.status === status;
    });
  } catch (error) {
    Logger.log('ステータスフィルタエラー: ' + error.message);
    throw new Error('作品のフィルタリングに失敗しました: ' + error.message);
  }
}
