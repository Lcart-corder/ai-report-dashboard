import type { Artwork, FishParams, GoldfishConfig, ApiResponse } from "./types";

/** GAS Web App の API エンドポイント */
const GAS_API_URL = process.env.NEXT_PUBLIC_GAS_API_URL ?? "";

/**
 * 全アートワークを取得
 */
export async function fetchArtworks(): Promise<Artwork[]> {
  if (!GAS_API_URL) {
    console.warn("NEXT_PUBLIC_GAS_API_URL が設定されていません。デモデータを返します。");
    return getDemoArtworks();
  }

  const res = await fetch(`${GAS_API_URL}?action=list`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`API エラー: ${res.status} ${res.statusText}`);
  }

  const json: ApiResponse<Artwork[]> = await res.json();

  if (!json.success || !json.data) {
    throw new Error(json.error ?? "不明なAPIエラー");
  }

  return json.data;
}

/**
 * 単一アートワークをIDで取得
 */
export async function fetchArtwork(id: string): Promise<Artwork> {
  if (!GAS_API_URL) {
    console.warn("NEXT_PUBLIC_GAS_API_URL が設定されていません。デモデータを返します。");
    const demos = getDemoArtworks();
    const found = demos.find((a) => a.artwork_id === id);
    if (!found) throw new Error(`アートワークが見つかりません: ${id}`);
    return found;
  }

  const res = await fetch(`${GAS_API_URL}?action=get&id=${encodeURIComponent(id)}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`API エラー: ${res.status} ${res.statusText}`);
  }

  const json: ApiResponse<Artwork> = await res.json();

  if (!json.success || !json.data) {
    throw new Error(json.error ?? "アートワークが見つかりません");
  }

  return json.data;
}

/**
 * アートワークデータを3D金魚パラメータに変換
 * シートのデータから Three.js で使える設定を生成する
 */
export function artworkToGoldfishConfig(artwork: Artwork): GoldfishConfig {
  // body_shape → 体のスケール
  const bodyScaleMap: Record<string, { x: number; y: number; z: number }> = {
    round: { x: 1.3, y: 1.0, z: 1.3 },
    slim: { x: 0.7, y: 1.0, z: 0.8 },
    normal: { x: 1.0, y: 1.0, z: 1.0 },
  };

  // fin_size → ヒレ倍率
  const finScaleMap: Record<string, number> = {
    small: 0.6,
    medium: 1.0,
    large: 1.5,
  };

  // tail_shape → 尾びれ倍率
  const tailScaleMap: Record<string, number> = {
    fan: 1.4,
    long: 1.2,
    short: 0.7,
  };

  // カラーパース
  const colors = artwork.primary_colors
    ? artwork.primary_colors.split(",").map((c) => c.trim())
    : ["#FF6B6B", "#FFD93D"];

  // fish_params_json をパース
  let fishParams: FishParams = { speed: "normal", pattern: "calm" };
  try {
    if (artwork.fish_params_json) {
      fishParams = JSON.parse(artwork.fish_params_json) as FishParams;
    }
  } catch {
    console.warn("fish_params_json のパースに失敗。デフォルト値を使用。");
  }

  // speed → 泳ぎの速さ
  const speedMap: Record<string, number> = {
    slow: 0.5,
    normal: 1.0,
    fast: 1.8,
  };

  return {
    bodyScale: bodyScaleMap[artwork.body_shape] ?? bodyScaleMap.normal,
    finScale: finScaleMap[artwork.fin_size] ?? finScaleMap.medium,
    tailScale: tailScaleMap[artwork.tail_shape] ?? tailScaleMap.fan,
    colors,
    swimSpeed: speedMap[fishParams.speed] ?? 1.0,
    swimPattern: fishParams.pattern ?? "calm",
    artworkId: artwork.artwork_id,
    childName: artwork.child_name,
    title: artwork.title,
  };
}

/**
 * デモ用データ（API未接続時に使用）
 */
function getDemoArtworks(): Artwork[] {
  return [
    {
      artwork_id: "art_demo_001",
      child_name: "たろう",
      title: "げんきなきんぎょ",
      image_url: "",
      status: "vr_ready",
      primary_colors: "#FF6B6B,#FFD93D",
      body_shape: "round",
      fin_size: "large",
      tail_shape: "fan",
      mood_tags: "元気,かわいい",
      confidence: "0.85",
      fish_params_json: '{"speed":"fast","pattern":"playful"}',
    },
    {
      artwork_id: "art_demo_002",
      child_name: "はなこ",
      title: "おひめさまきんぎょ",
      image_url: "",
      status: "vr_ready",
      primary_colors: "#FF69B4,#FFB6C1,#FFFFFF",
      body_shape: "slim",
      fin_size: "large",
      tail_shape: "long",
      mood_tags: "エレガント,きれい",
      confidence: "0.92",
      fish_params_json: '{"speed":"slow","pattern":"elegant"}',
    },
    {
      artwork_id: "art_demo_003",
      child_name: "ゆうた",
      title: "そらとぶきんぎょ",
      image_url: "",
      status: "vr_ready",
      primary_colors: "#4FC3F7,#81D4FA,#FFD54F",
      body_shape: "normal",
      fin_size: "medium",
      tail_shape: "fan",
      mood_tags: "自由,たのしい",
      confidence: "0.78",
      fish_params_json: '{"speed":"normal","pattern":"playful"}',
    },
    {
      artwork_id: "art_demo_004",
      child_name: "みく",
      title: "にじいろきんぎょ",
      image_url: "",
      status: "analyzing",
      primary_colors: "#E91E63,#9C27B0,#3F51B5",
      body_shape: "round",
      fin_size: "medium",
      tail_shape: "short",
      mood_tags: "カラフル",
      confidence: "0.60",
      fish_params_json: '{"speed":"normal","pattern":"calm"}',
    },
    {
      artwork_id: "art_demo_005",
      child_name: "けんた",
      title: "ちからもちきんぎょ",
      image_url: "",
      status: "pending",
      primary_colors: "#F44336,#FF9800",
      body_shape: "round",
      fin_size: "small",
      tail_shape: "short",
      mood_tags: "つよい",
      confidence: "0.00",
      fish_params_json: "{}",
    },
  ];
}
