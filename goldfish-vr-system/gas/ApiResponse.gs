/**
 * おえかき金魚VR体験システム - APIレスポンスヘルパー
 * JSON APIレスポンスの生成とCORSヘッダー設定
 */

/**
 * 成功レスポンスを生成する
 * @param {*} data - レスポンスに含めるデータ
 * @returns {GoogleAppsScript.Content.TextOutput} JSONレスポンス
 */
function successResponse(data) {
  const body = {
    success: true,
    data: data,
    timestamp: new Date().toISOString(),
  };
  return createJsonOutput_(body);
}

/**
 * エラーレスポンスを生成する
 * @param {string} message - エラーメッセージ
 * @param {number} [code=500] - エラーコード
 * @returns {GoogleAppsScript.Content.TextOutput} JSONエラーレスポンス
 */
function errorResponse(message, code) {
  const body = {
    success: false,
    error: {
      message: message,
      code: code || 500,
    },
    timestamp: new Date().toISOString(),
  };
  return createJsonOutput_(body);
}

/**
 * ContentService.TextOutputを作成する（内部ヘルパー）
 * CORSヘッダー付きのJSONレスポンスを返す
 *
 * 注意: GASのWebアプリではレスポンスヘッダーを直接設定できないため、
 * CORSはGAS側で自動的に処理される。JSONコンテンツタイプのみ設定する。
 *
 * @param {Object} body - レスポンスボディ
 * @returns {GoogleAppsScript.Content.TextOutput} テキストアウトプット
 */
function createJsonOutput_(body) {
  var output = ContentService.createTextOutput(JSON.stringify(body));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * HTMLテンプレートをレンダリングして返す
 * @param {string} templateName - テンプレート名（拡張子なし）
 * @returns {GoogleAppsScript.HTML.HtmlOutput} HTMLアウトプット
 */
function renderTemplate(templateName) {
  var template = HtmlService.createTemplateFromFile(templateName);
  return template.evaluate()
    .setTitle('おえかき金魚VR体験システム')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * HTMLテンプレート内で他のHTMLファイルをインクルードする
 * <?!= include('styles') ?> のように使用
 * @param {string} filename - インクルードするファイル名（拡張子なし）
 * @returns {string} ファイルの内容
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
