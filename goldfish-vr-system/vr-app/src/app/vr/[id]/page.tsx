"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import type { Artwork, GoldfishConfig } from "@/lib/types";
import { fetchArtwork, artworkToGoldfishConfig } from "@/lib/api";
import { VRScene } from "@/components/goldfish/VRScene";
import { use } from "react";

/**
 * VR体験ページ（クライアントコンポーネント）
 * Three.js シーンを初期化し、金魚を表示する
 */
export default function VRPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const containerRef = useRef<HTMLDivElement>(null);
  const vrSceneRef = useRef<VRScene | null>(null);
  const configRef = useRef<GoldfishConfig | null>(null);

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vrSupported, setVrSupported] = useState(false);
  const [fishCount, setFishCount] = useState(0);

  // アートワーク取得
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchArtwork(id);
        if (!cancelled) {
          setArtwork(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "読み込みに失敗しました");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Three.js シーンの初期化
  useEffect(() => {
    if (!artwork || !containerRef.current) return;

    const scene = new VRScene(containerRef.current);
    scene.init();

    // WebXR サポート判定
    if (scene.isVRSupported()) {
      navigator.xr?.isSessionSupported("immersive-vr").then((supported) => {
        setVrSupported(supported);
      });
    }

    // メインの金魚を追加
    const config = artworkToGoldfishConfig(artwork);
    configRef.current = config;
    scene.addFish(config);
    setFishCount(1);

    scene.startAnimation();
    vrSceneRef.current = scene;

    return () => {
      scene.dispose();
      vrSceneRef.current = null;
    };
  }, [artwork]);

  /** 金魚を追加（パラメータに軽い変化を付ける） */
  const handleAddFish = useCallback(() => {
    if (!vrSceneRef.current || !configRef.current) return;

    // 色相・速度にランダムな変化を加えた派生コンフィグ
    const base = configRef.current;
    const variation: GoldfishConfig = {
      ...base,
      swimSpeed: base.swimSpeed * (0.8 + Math.random() * 0.4),
      bodyScale: {
        x: base.bodyScale.x * (0.85 + Math.random() * 0.3),
        y: base.bodyScale.y,
        z: base.bodyScale.z * (0.85 + Math.random() * 0.3),
      },
      finScale: base.finScale * (0.8 + Math.random() * 0.4),
      tailScale: base.tailScale * (0.8 + Math.random() * 0.4),
    };

    vrSceneRef.current.addFish(variation);
    setFishCount(vrSceneRef.current.fishCount);
  }, []);

  /** VRモードへ */
  const handleEnterVR = useCallback(async () => {
    if (!vrSceneRef.current) return;
    try {
      await vrSceneRef.current.enterVR();
    } catch (err) {
      alert(err instanceof Error ? err.message : "VRモードに入れませんでした");
    }
  }, []);

  /** フルスクリーン切り替え */
  const handleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // ── ローディング状態 ──
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl animate-pulse">🐟</div>
          <p className="text-gray-500">金魚を読み込み中…</p>
        </div>
      </div>
    );
  }

  // ── エラー状態 ──
  if (error || !artwork) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg text-red-500">
            {error ?? "アートワークが見つかりません"}
          </p>
          <Link
            href="/gallery"
            className="text-sm text-cyan-600 underline hover:text-cyan-800"
          >
            ギャラリーに戻る
          </Link>
        </div>
      </div>
    );
  }

  // カラードット
  const colors = artwork.primary_colors
    ? artwork.primary_colors.split(",").map((c) => c.trim())
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/gallery"
          className="text-sm text-cyan-600 hover:underline"
        >
          ← ギャラリーに戻る
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* 3Dビューポート */}
        <div className="relative overflow-hidden rounded-2xl bg-gray-900 shadow-lg">
          <div
            ref={containerRef}
            className="aspect-video w-full"
            style={{ minHeight: 400 }}
          />

          {/* オーバーレイ操作ボタン */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={handleAddFish}
              className="rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-cyan-700 shadow backdrop-blur transition hover:bg-white"
              title="金魚を追加"
            >
              + 金魚を追加（{fishCount}匹）
            </button>
            <button
              onClick={handleFullscreen}
              className="rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-gray-700 shadow backdrop-blur transition hover:bg-white"
              title="フルスクリーン"
            >
              全画面
            </button>
            {vrSupported && (
              <button
                onClick={handleEnterVR}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-cyan-700"
              >
                VRで見る
              </button>
            )}
          </div>
        </div>

        {/* 作品情報パネル */}
        <aside className="rounded-2xl bg-white p-6 shadow-md">
          <h1 className="mb-1 text-xl font-bold text-gray-800">
            {artwork.title}
          </h1>
          <p className="mb-4 text-sm text-gray-400">
            by {artwork.child_name}
          </p>

          {/* カラーパレット */}
          <div className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              カラー
            </h3>
            <div className="flex gap-2">
              {colors.map((c, i) => (
                <div key={i} className="text-center">
                  <span
                    className="mb-1 inline-block h-8 w-8 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: c }}
                  />
                  <span className="block text-[10px] text-gray-400">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* パラメータ */}
          <div className="mb-4 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span className="text-gray-400">体型</span>
              <span className="font-medium">{artwork.body_shape}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ヒレ</span>
              <span className="font-medium">{artwork.fin_size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">尾びれ</span>
              <span className="font-medium">{artwork.tail_shape}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">信頼度</span>
              <span className="font-medium">
                {(parseFloat(artwork.confidence) * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* ムードタグ */}
          {artwork.mood_tags && (
            <div className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                ムード
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {artwork.mood_tags.split(",").map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs text-cyan-600"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* VR案内 */}
          {!vrSupported && (
            <div className="rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-700">
              お使いのブラウザはWebXR VRに対応していません。Meta
              QuestやVRヘッドセットのブラウザからアクセスするとVR体験が可能です。
              3D表示はこのブラウザでもお楽しみいただけます。
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
