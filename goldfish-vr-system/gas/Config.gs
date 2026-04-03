/**
 * おえかき金魚VR体験システム - 設定ファイル
 * Configuration constants for the Drawing Goldfish VR Experience System
 */

// ===== Google Services IDs =====
// ScriptPropertiesに設定するか、直接IDを記入してください
const CONFIG = {
  SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || 'YOUR_SPREADSHEET_ID_HERE',
  SHEET_NAME: 'artworks',
  DRIVE_FOLDER_ID: PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID') || 'YOUR_DRIVE_FOLDER_ID_HERE',
  GEMINI_API_KEY: PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || 'YOUR_GEMINI_API_KEY_HERE',
  GEMINI_MODEL: 'gemini-2.0-flash',
  VR_APP_BASE_URL: PropertiesService.getScriptProperties().getProperty('VR_APP_URL') || 'https://your-vr-app.example.com',
};

// ===== スプレッドシートのカラムマッピング (A-S) =====
const COLUMNS = {
  ARTWORK_ID:         1,  // A: 作品ID
  CHILD_NAME:         2,  // B: 子どもの名前
  TITLE:              3,  // C: 作品タイトル
  ORIGINAL_FILE_NAME: 4,  // D: 元のファイル名
  DRIVE_FILE_ID:      5,  // E: Google DriveのファイルID
  IMAGE_URL:          6,  // F: 画像URL
  STATUS:             7,  // G: ステータス
  UPLOADED_AT:        8,  // H: アップロード日時
  ANALYZED_AT:        9,  // I: 分析完了日時
  PRIMARY_COLORS:    10,  // J: 主要カラー (JSON配列)
  BODY_SHAPE:        11,  // K: 体の形状
  FIN_SIZE:          12,  // L: ヒレのサイズ
  TAIL_SHAPE:        13,  // M: 尾の形状
  MOOD_TAGS:         14,  // N: 印象タグ (JSON配列)
  CONFIDENCE:        15,  // O: 分析信頼度
  FISH_PARAMS_JSON:  16,  // P: VR用パラメータ全体 (JSON)
  VR_STATUS:         17,  // Q: VRステータス
  ERROR_MESSAGE:     18,  // R: エラーメッセージ
  UPDATED_AT:        19,  // S: 最終更新日時
};

// カラム名の逆引きマッピング（オブジェクト変換用）
const COLUMN_KEYS = [
  '',                  // index 0 (unused)
  'artwork_id',        // A
  'child_name',        // B
  'title',             // C
  'original_file_name',// D
  'drive_file_id',     // E
  'image_url',         // F
  'status',            // G
  'uploaded_at',       // H
  'analyzed_at',       // I
  'primary_colors',    // J
  'body_shape',        // K
  'fin_size',          // L
  'tail_shape',        // M
  'mood_tags',         // N
  'confidence',        // O
  'fish_params_json',  // P
  'vr_status',         // Q
  'error_message',     // R
  'updated_at',        // S
];

// ===== ステータス定数 =====
const STATUS = {
  UPLOADED:             'uploaded',
  ANALYSIS_PROCESSING:  'analysis_processing',
  ANALYSIS_COMPLETED:   'analysis_completed',
  VR_READY:             'vr_ready',
  ERROR:                'error',
};

// ===== VRステータス定数 =====
const VR_STATUS = {
  PENDING:  'pending',
  READY:    'ready',
  ACTIVE:   'active',
};

// ===== ヘッダー行の定義 =====
const HEADER_ROW = [
  'artwork_id', 'child_name', 'title', 'original_file_name',
  'drive_file_id', 'image_url', 'status', 'uploaded_at',
  'analyzed_at', 'primary_colors', 'body_shape', 'fin_size',
  'tail_shape', 'mood_tags', 'confidence', 'fish_params_json',
  'vr_status', 'error_message', 'updated_at',
];

// ===== 許可されるMIMEタイプ =====
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
];

// ===== 最大ファイルサイズ (10MB) =====
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
