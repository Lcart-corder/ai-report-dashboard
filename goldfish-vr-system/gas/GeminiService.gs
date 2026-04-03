/**
 * おえかき金魚VR体験システム - Gemini API サービス
 * Gemini Vision APIを使った金魚イラスト分析機能
 */

/**
 * 金魚イラストをGemini APIで分析する
 * @param {string} fileId - Google DriveのファイルID
 * @returns {Object} 分析結果のパース済みJSON
 */
function analyzeGoldfishImage(fileId) {
  try {
    // 画像データを取得
    const base64Image = getImageAsBase64(fileId);
    const mimeType = getFileMimeType(fileId);
    const prompt = buildAnalysisPrompt();

    // Gemini API エンドポイント
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/'
      + CONFIG.GEMINI_MODEL
      + ':generateContent?key='
      + CONFIG.GEMINI_API_KEY;

    // リクエストボディを構築
    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    };

    // API呼び出し
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(requestBody),
      muteHttpExceptions: true,
    };

    Logger.log('Gemini API呼び出し開始: fileId=' + fileId);
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode !== 200) {
      Logger.log('Gemini APIエラー: HTTP ' + responseCode + ' - ' + responseText);
      throw new Error('Gemini API returned HTTP ' + responseCode);
    }

    // レスポンスをパース
    const responseJson = JSON.parse(responseText);

    // 候補テキストを取得
    const candidateText = responseJson.candidates
      && responseJson.candidates[0]
      && responseJson.candidates[0].content
      && responseJson.candidates[0].content.parts
      && responseJson.candidates[0].content.parts[0]
      && responseJson.candidates[0].content.parts[0].text;

    if (!candidateText) {
      Logger.log('Geminiレスポンスにテキストが含まれていません: ' + responseText);
      throw new Error('Gemini APIから有効なレスポンスが返されませんでした');
    }

    // 分析結果をパース
    const result = parseGeminiResponse(candidateText);
    Logger.log('Gemini分析完了: ' + JSON.stringify(result));

    return result;
  } catch (error) {
    Logger.log('Gemini分析エラー: ' + error.message);
    throw new Error('画像分析に失敗しました: ' + error.message);
  }
}

/**
 * 金魚分析用のプロンプトを構築する
 * @returns {string} プロンプト文字列
 */
function buildAnalysisPrompt() {
  return `あなたは子どもが描いた金魚のイラストを分析する専門家です。
この画像は子どもが描いた金魚の絵です。以下の特徴を分析してJSON形式で返してください。

分析項目:
1. primaryColors: 金魚の主要な色（配列、最大5色、HEXカラーコードで）
   例: ["#FF6B6B", "#FFA500", "#FFD700"]

2. bodyShape: 体の形状（以下のいずれか1つ）
   - "round": 丸い体
   - "slim": スリムな体
   - "normal": 標準的な体

3. finSize: ヒレのサイズ（以下のいずれか1つ）
   - "small": 小さいヒレ
   - "medium": 普通のヒレ
   - "large": 大きなヒレ

4. tailShape: 尾びれの形状（以下のいずれか1つ）
   - "fan": 扇形
   - "long": 長い
   - "short": 短い・丸い

5. moodTags: この金魚の印象を表す言葉（配列、3〜5個、日本語で）
   例: ["元気", "かわいい", "キラキラ"]

6. confidence: 分析の信頼度（0〜1の小数）
   子どもの絵の場合は0.5〜0.8程度が妥当です

7. swimProfile: VRでの泳ぎ方パラメータ
   - speed: "slow" | "normal" | "fast"
   - pattern: "calm" | "playful" | "elegant"

以下の形式で正確にJSONを返してください（他のテキストは含めないでください）:
{
  "primaryColors": ["#FF6B6B", "#FFA500"],
  "bodyShape": "round|slim|normal",
  "finSize": "small|medium|large",
  "tailShape": "fan|long|short",
  "moodTags": ["タグ1", "タグ2", "タグ3"],
  "confidence": 0.7,
  "swimProfile": {
    "speed": "slow|normal|fast",
    "pattern": "calm|playful|elegant"
  }
}

注意:
- 子どもの絵なので、完璧な描写は期待しないでください
- 判断が難しい場合はもっとも近い選択肢を選んでください
- confidence は正直に評価してください`;
}

/**
 * GeminiのレスポンステキストからJSON結果を抽出・パースする
 * @param {string} responseText - Geminiのレスポンステキスト
 * @returns {Object} パース済みの分析結果
 */
function parseGeminiResponse(responseText) {
  // まず直接JSONとしてパースを試みる
  try {
    const direct = JSON.parse(responseText);
    return validateAndNormalize_(direct);
  } catch (e) {
    // 直接パース失敗 → テキストからJSON部分を抽出
  }

  // コードブロック内のJSONを探す
  const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      return validateAndNormalize_(parsed);
    } catch (e) {
      Logger.log('コードブロック内JSONのパース失敗: ' + e.message);
    }
  }

  // 中括弧で囲まれたJSON部分を探す
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return validateAndNormalize_(parsed);
    } catch (e) {
      Logger.log('抽出JSONのパース失敗: ' + e.message);
    }
  }

  // すべてのパースが失敗した場合、デフォルト値を返す
  Logger.log('JSONパース完全失敗。デフォルト値を返します。元テキスト: ' + responseText);
  return getDefaultAnalysisResult_();
}

/**
 * 分析結果を検証・正規化する（内部ヘルパー）
 * @param {Object} result - パース済みオブジェクト
 * @returns {Object} 正規化された結果
 */
function validateAndNormalize_(result) {
  const defaults = getDefaultAnalysisResult_();

  return {
    primaryColors: Array.isArray(result.primaryColors) && result.primaryColors.length > 0
      ? result.primaryColors.slice(0, 5)
      : defaults.primaryColors,

    bodyShape: ['round', 'slim', 'normal'].includes(result.bodyShape)
      ? result.bodyShape
      : defaults.bodyShape,

    finSize: ['small', 'medium', 'large'].includes(result.finSize)
      ? result.finSize
      : defaults.finSize,

    tailShape: ['fan', 'long', 'short'].includes(result.tailShape)
      ? result.tailShape
      : defaults.tailShape,

    moodTags: Array.isArray(result.moodTags) && result.moodTags.length > 0
      ? result.moodTags.slice(0, 5)
      : defaults.moodTags,

    confidence: typeof result.confidence === 'number' && result.confidence >= 0 && result.confidence <= 1
      ? result.confidence
      : defaults.confidence,

    swimProfile: result.swimProfile && typeof result.swimProfile === 'object'
      ? {
          speed: ['slow', 'normal', 'fast'].includes(result.swimProfile.speed)
            ? result.swimProfile.speed
            : defaults.swimProfile.speed,
          pattern: ['calm', 'playful', 'elegant'].includes(result.swimProfile.pattern)
            ? result.swimProfile.pattern
            : defaults.swimProfile.pattern,
        }
      : defaults.swimProfile,
  };
}

/**
 * デフォルトの分析結果を返す（フォールバック用）
 * @returns {Object} デフォルトの分析結果
 */
function getDefaultAnalysisResult_() {
  return {
    primaryColors: ['#FF6B6B', '#FFA500'],
    bodyShape: 'normal',
    finSize: 'medium',
    tailShape: 'fan',
    moodTags: ['かわいい', '元気'],
    confidence: 0.3,
    swimProfile: {
      speed: 'normal',
      pattern: 'calm',
    },
  };
}
