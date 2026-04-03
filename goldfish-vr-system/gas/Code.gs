/**
 * おえかき金魚VR体験システム - メインエントリポイント
 * WebアプリのGET/POSTリクエスト処理
 */

/**
 * GETリクエストハンドラ
 * - ページ表示: ?page=admin → 管理画面, デフォルト → アップロード画面
 * - API: ?action=artworks → 全作品JSON, ?action=artwork&id=xxx → 個別作品
 *        ?action=reanalyze&id=xxx → 再解析トリガー
 * @param {Object} e - イベントオブジェクト
 * @returns {HtmlOutput|TextOutput} レスポンス
 */
function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var action = params.action || '';
    var page = params.page || '';

    // === API リクエスト ===
    if (action) {
      return handleApiGet_(action, params);
    }

    // === ページ表示 ===
    if (page === 'admin') {
      return renderTemplate('admin');
    }

    // デフォルト: アップロードページ
    return renderTemplate('index');
  } catch (error) {
    Logger.log('doGet エラー: ' + error.message);
    // APIリクエストの場合はJSONエラー、それ以外はHTMLエラー
    if (e && e.parameter && e.parameter.action) {
      return errorResponse(error.message, 500);
    }
    return HtmlService.createHtmlOutput(
      '<h1>エラーが発生しました</h1><p>' + error.message + '</p>'
    );
  }
}

/**
 * POSTリクエストハンドラ
 * 画像アップロードとGemini解析のトリガー
 * @param {Object} e - イベントオブジェクト
 * @returns {TextOutput} JSONレスポンス
 */
function doPost(e) {
  try {
    var postData;

    // リクエストボディをパース
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else {
      return errorResponse('リクエストボディが空です', 400);
    }

    var action = postData.action || 'upload';

    switch (action) {
      case 'upload':
        return handleUpload_(postData);
      case 'reanalyze':
        return handleReanalyze_(postData.artwork_id);
      default:
        return errorResponse('不明なアクション: ' + action, 400);
    }
  } catch (error) {
    Logger.log('doPost エラー: ' + error.message + '\n' + error.stack);
    return errorResponse('処理中にエラーが発生しました: ' + error.message, 500);
  }
}

// ================================================================
// 内部ハンドラ
// ================================================================

/**
 * GET APIリクエストを処理する
 * @param {string} action - アクション名
 * @param {Object} params - クエリパラメータ
 * @returns {TextOutput} JSONレスポンス
 */
function handleApiGet_(action, params) {
  switch (action) {
    case 'artworks': {
      var status = params.status || '';
      var artworks;
      if (status) {
        artworks = getArtworksByStatus(status);
      } else {
        artworks = getAllArtworks();
      }
      return successResponse(artworks);
    }

    case 'artwork': {
      var id = params.id;
      if (!id) {
        return errorResponse('作品IDが指定されていません', 400);
      }
      var artwork = getArtworkById(id);
      if (!artwork) {
        return errorResponse('作品が見つかりません: ' + id, 404);
      }
      return successResponse(artwork);
    }

    case 'reanalyze': {
      var reId = params.id;
      if (!reId) {
        return errorResponse('作品IDが指定されていません', 400);
      }
      return handleReanalyze_(reId);
    }

    default:
      return errorResponse('不明なアクション: ' + action, 400);
  }
}

/**
 * 画像アップロード処理
 * フロー: Base64受信 → Drive保存 → Sheet追加 → Gemini解析 → Sheet更新
 * @param {Object} postData - アップロードデータ
 * @returns {TextOutput} JSONレスポンス
 */
function handleUpload_(postData) {
  // 入力バリデーション
  var childName = (postData.child_name || '').trim();
  var title = (postData.title || '').trim();
  var imageData = postData.image_data || '';
  var fileName = postData.file_name || 'goldfish_drawing.png';
  var mimeType = postData.mime_type || 'image/png';

  if (!childName) {
    return errorResponse('お名前を入力してください', 400);
  }
  if (!title) {
    return errorResponse('タイトルを入力してください', 400);
  }
  if (!imageData) {
    return errorResponse('画像データがありません', 400);
  }

  // MIMEタイプチェック
  if (ALLOWED_MIME_TYPES.indexOf(mimeType) === -1) {
    return errorResponse('対応していない画像形式です。PNG, JPEG, GIF, WebPのみ対応しています。', 400);
  }

  // ファイルサイズチェック（Base64文字列のおおよそのサイズ）
  var cleanBase64 = imageData.replace(/^data:image\/\w+;base64,/, '');
  var estimatedSize = cleanBase64.length * 0.75;
  if (estimatedSize > MAX_FILE_SIZE_BYTES) {
    return errorResponse('ファイルサイズが大きすぎます（最大10MB）', 400);
  }

  // 1. Google Driveに画像を保存
  var driveResult = saveImageToDrive(imageData, fileName, mimeType);

  // 2. 公開URLを取得
  var publicUrl = getImagePublicUrl(driveResult.fileId);

  // 3. スプレッドシートに登録
  var artworkId = addArtwork({
    child_name: childName,
    title: title,
    original_file_name: fileName,
    drive_file_id: driveResult.fileId,
    image_url: publicUrl,
  });

  // 4. Gemini解析を開始（非同期的に処理）
  try {
    triggerAnalysis_(artworkId, driveResult.fileId);
  } catch (analysisError) {
    // 解析エラーはログに記録するが、アップロード自体は成功とする
    Logger.log('解析トリガーエラー（アップロードは成功）: ' + analysisError.message);
    updateArtwork(artworkId, {
      status: STATUS.ERROR,
      error_message: '自動解析に失敗しました: ' + analysisError.message,
    });
  }

  // アップロード成功レスポンス
  return successResponse({
    artwork_id: artworkId,
    message: 'アップロードが完了しました！金魚を解析しています...',
    image_url: publicUrl,
  });
}

/**
 * Gemini解析を実行してシートを更新する
 * @param {string} artworkId - 作品ID
 * @param {string} fileId - DriveファイルID
 */
function triggerAnalysis_(artworkId, fileId) {
  // ステータスを「解析中」に更新
  updateArtwork(artworkId, {
    status: STATUS.ANALYZING,
  });

  try {
    // Gemini APIで画像を解析
    var result = analyzeGoldfishImage(fileId);

    // 解析結果をシートに保存
    // primaryColors は HEX配列 → カンマ区切り文字列に変換
    // fish_params_json は swimProfile から {speed, pattern} のみ保存
    var colorsStr = Array.isArray(result.primaryColors)
      ? result.primaryColors.join(',')
      : '';
    var moodStr = Array.isArray(result.moodTags)
      ? result.moodTags.join(',')
      : '';
    var fishParamsJson = JSON.stringify({
      speed: result.swimProfile ? result.swimProfile.speed : 'normal',
      pattern: result.swimProfile ? result.swimProfile.pattern : 'calm',
    });

    updateArtwork(artworkId, {
      status: STATUS.VR_READY,
      analyzed_at: new Date().toISOString(),
      primary_colors: colorsStr,
      body_shape: result.bodyShape,
      fin_size: result.finSize,
      tail_shape: result.tailShape,
      mood_tags: moodStr,
      confidence: result.confidence,
      fish_params_json: fishParamsJson,
      vr_status: VR_STATUS.READY,
      error_message: '',
    });

    Logger.log('解析完了: ' + artworkId);
  } catch (error) {
    Logger.log('解析失敗: ' + artworkId + ' - ' + error.message);
    updateArtwork(artworkId, {
      status: STATUS.ERROR,
      error_message: error.message,
    });
    throw error;
  }
}

/**
 * 再解析処理
 * @param {string} artworkId - 作品ID
 * @returns {TextOutput} JSONレスポンス
 */
function handleReanalyze_(artworkId) {
  if (!artworkId) {
    return errorResponse('作品IDが指定されていません', 400);
  }

  var artwork = getArtworkById(artworkId);
  if (!artwork) {
    return errorResponse('作品が見つかりません: ' + artworkId, 404);
  }

  if (!artwork.drive_file_id) {
    return errorResponse('画像ファイルが見つかりません', 400);
  }

  try {
    triggerAnalysis_(artworkId, artwork.drive_file_id);
    // 更新後のデータを取得
    var updated = getArtworkById(artworkId);
    return successResponse({
      artwork_id: artworkId,
      message: '再解析が完了しました',
      artwork: updated,
    });
  } catch (error) {
    return errorResponse('再解析に失敗しました: ' + error.message, 500);
  }
}

// ================================================================
// ユーティリティ（クライアントサイドから呼び出し用）
// ================================================================

/**
 * google.script.run から呼び出すアップロード関数
 * HTMLフォームからの呼び出し用ラッパー
 * @param {Object} formData - フォームデータ
 * @returns {Object} 結果オブジェクト
 */
function uploadFromClient(formData) {
  try {
    var result = handleUpload_(formData);
    // ContentService.TextOutput → オブジェクトに変換して返す
    return JSON.parse(result.getContent());
  } catch (error) {
    Logger.log('クライアントアップロードエラー: ' + error.message);
    return {
      success: false,
      error: { message: error.message, code: 500 },
    };
  }
}

/**
 * google.script.run から呼び出す作品一覧取得関数
 * @param {string} [status] - フィルタするステータス（省略時は全件）
 * @returns {Array<Object>} 作品オブジェクトの配列
 */
function getArtworksFromClient(status) {
  try {
    if (status) {
      return getArtworksByStatus(status);
    }
    return getAllArtworks();
  } catch (error) {
    Logger.log('クライアント作品取得エラー: ' + error.message);
    return [];
  }
}

/**
 * google.script.run から呼び出す再解析関数
 * @param {string} artworkId - 作品ID
 * @returns {Object} 結果オブジェクト
 */
function reanalyzeFromClient(artworkId) {
  try {
    var artwork = getArtworkById(artworkId);
    if (!artwork) {
      return { success: false, error: { message: '作品が見つかりません' } };
    }
    triggerAnalysis_(artworkId, artwork.drive_file_id);
    var updated = getArtworkById(artworkId);
    return { success: true, data: { artwork: updated, message: '再解析が完了しました' } };
  } catch (error) {
    return { success: false, error: { message: error.message } };
  }
}

/**
 * WebアプリのURLを取得する（テンプレート内で使用）
 * @returns {string} WebアプリのURL
 */
function getWebAppUrl() {
  return ScriptApp.getService().getUrl();
}

/**
 * VRアプリのURLを取得する
 * @returns {string} VRアプリのURL
 */
function getVrAppUrl() {
  return CONFIG.VR_APP_BASE_URL;
}
