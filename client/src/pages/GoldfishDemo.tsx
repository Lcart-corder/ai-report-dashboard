/**
 * GoldfishDemo.tsx
 * 役割: 金魚アニメーションの各バリエーションを一覧できるデモページ
 * ルート: /goldfish-demo
 *
 * GLBファイルは public/models/ に配置する:
 *   client/public/models/goldfish.glb
 */
import { useState } from "react";
import {
  GoldfishScene,
  GoldfishSchoolScene,
  GoldfishClickableScene,
  GoldfishAnimatedScene,
} from "@/components/goldfish";

const GLB_PATH = "/models/goldfish.glb";

type DemoTab = "single" | "school" | "clickable" | "animated";

const TABS: { key: DemoTab; label: string; description: string }[] = [
  {
    key: "single",
    label: "単体遊泳",
    description: "1匹の金魚が円軌道で泳ぐ基本デモ",
  },
  {
    key: "school",
    label: "複数匹ランダム",
    description: "5匹の金魚がそれぞれランダムなパラメータで遊泳",
  },
  {
    key: "clickable",
    label: "クリック誘導",
    description: "水面をクリックするとその方向に金魚が泳いでいく",
  },
  {
    key: "animated",
    label: "AnimationMixer対応",
    description:
      "GLBにボーンアニメーションが含まれていれば自動再生。なければ擬似遊泳のみ",
  },
];

export default function GoldfishDemo() {
  const [activeTab, setActiveTab] = useState<DemoTab>("single");

  return (
    <div style={{ padding: "24px", maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>
        金魚スイミングデモ
      </h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        GLBファイルを <code>client/public/models/goldfish.glb</code> に配置してください
      </p>

      {/* タブ切り替え */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: activeTab === tab.key ? "#2563eb" : "#fff",
              color: activeTab === tab.key ? "#fff" : "#333",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 説明 */}
      <p style={{ marginBottom: 16, fontSize: 14, color: "#555" }}>
        {TABS.find((t) => t.key === activeTab)?.description}
      </p>

      {/* デモ表示 */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {activeTab === "single" && (
          <GoldfishScene glbPath={GLB_PATH} scale={1} height={500} />
        )}
        {activeTab === "school" && (
          <GoldfishSchoolScene glbPath={GLB_PATH} count={5} height={500} />
        )}
        {activeTab === "clickable" && (
          <GoldfishClickableScene glbPath={GLB_PATH} scale={1} height={500} />
        )}
        {activeTab === "animated" && (
          <GoldfishAnimatedScene
            glbPath={GLB_PATH}
            enablePseudoSwim={true}
            scale={1}
            height={500}
          />
        )}
      </div>
    </div>
  );
}
