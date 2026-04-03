/** おえかき金魚VR体験システム — 型定義 */

/** スプレッドシートから取得するアートワークデータ */
export interface Artwork {
  artwork_id: string;
  child_name: string;
  title: string;
  image_url: string;
  status: "pending" | "analyzing" | "vr_ready" | "error";
  primary_colors: string;
  body_shape: "round" | "slim" | "normal";
  fin_size: "small" | "medium" | "large";
  tail_shape: "fan" | "long" | "short";
  mood_tags: string;
  confidence: string;
  fish_params_json: string;
}

/** fish_params_json をパースした結果 */
export interface FishParams {
  speed: "slow" | "normal" | "fast";
  pattern: "calm" | "playful" | "elegant";
}

/** 3Dレンダリング用の金魚設定 */
export interface GoldfishConfig {
  /** 体の横幅・奥行きスケール (round=1.3, slim=0.7, normal=1.0) */
  bodyScale: { x: number; y: number; z: number };
  /** ヒレの大きさ倍率 */
  finScale: number;
  /** 尾びれの大きさ倍率 */
  tailScale: number;
  /** メインカラー配列 (HEX) */
  colors: string[];
  /** 泳ぐ速さ (0.5〜2.0) */
  swimSpeed: number;
  /** 泳ぎのパターン */
  swimPattern: "calm" | "playful" | "elegant";
  /** 元のアートワークID（参照用） */
  artworkId: string;
  /** 子どもの名前 */
  childName: string;
  /** 作品タイトル */
  title: string;
}

/** API レスポンスの共通型 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
