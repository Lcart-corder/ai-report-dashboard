/**
 * おえかき金魚VR体験システム - Google Drive サービス
 * Google Driveへの画像保存・取得機能
 */

/**
 * Base64エンコードされた画像をGoogle Driveに保存する
 * @param {string} base64Data - Base64エンコードされた画像データ（data:URI prefix含む場合も対応）
 * @param {string} fileName - 保存するファイル名
 * @param {string} mimeType - MIMEタイプ (例: 'image/png')
 * @returns {{fileId: string, fileUrl: string}} 保存されたファイルの情報
 */
function saveImageToDrive(base64Data, fileName, mimeType) {
  try {
    // data:URI prefixを除去
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

    // Base64をBlobにデコード
    const blob = Utilities.newBlob(
      Utilities.base64Decode(cleanBase64),
      mimeType,
      fileName
    );

    // 保存先フォルダを取得（存在しない場合はルートに保存）
    let folder;
    try {
      folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    } catch (e) {
      Logger.log('指定フォルダが見つかりません。ルートフォルダに保存します: ' + e.message);
      folder = DriveApp.getRootFolder();
    }

    // ファイルを作成
    const file = folder.createFile(blob);

    // 共有設定: リンクを知っている人は閲覧可能
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const fileUrl = file.getUrl();

    Logger.log('画像をDriveに保存しました: ' + fileId);

    return {
      fileId: fileId,
      fileUrl: fileUrl,
    };
  } catch (error) {
    Logger.log('Drive保存エラー: ' + error.message);
    throw new Error('画像の保存に失敗しました: ' + error.message);
  }
}

/**
 * Google DriveのファイルをBase64文字列として取得する（Gemini API用）
 * @param {string} fileId - Google DriveのファイルID
 * @returns {string} Base64エンコードされた画像データ
 */
function getImageAsBase64(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    const blob = file.getBlob();
    const base64 = Utilities.base64Encode(blob.getBytes());
    return base64;
  } catch (error) {
    Logger.log('Base64変換エラー: ' + error.message);
    throw new Error('画像の読み込みに失敗しました: ' + error.message);
  }
}

/**
 * Google Driveファイルの公開URLを取得する
 * @param {string} fileId - Google DriveのファイルID
 * @returns {string} 公開閲覧用URL
 */
function getImagePublicUrl(fileId) {
  try {
    // サムネイル表示用のURL
    return 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w400';
  } catch (error) {
    Logger.log('URL取得エラー: ' + error.message);
    throw new Error('画像URLの取得に失敗しました: ' + error.message);
  }
}

/**
 * DriveファイルのMIMEタイプを取得する
 * @param {string} fileId - Google DriveのファイルID
 * @returns {string} MIMEタイプ
 */
function getFileMimeType(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    return file.getMimeType();
  } catch (error) {
    Logger.log('MIMEタイプ取得エラー: ' + error.message);
    throw new Error('ファイル情報の取得に失敗しました: ' + error.message);
  }
}
