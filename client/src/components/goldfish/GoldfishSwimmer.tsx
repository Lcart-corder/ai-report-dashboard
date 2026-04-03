/**
 * GoldfishSwimmer.tsx
 * 役割: GLBモデルを読み込み、擬似的な遊泳アニメーションを付与する基本コンポーネント
 *
 * 依存関係:
 *   pnpm add three @react-three/fiber @react-three/drei
 *   pnpm add -D @types/three
 *
 * 使い方:
 *   import { GoldfishScene } from "@/components/goldfish/GoldfishSwimmer";
 *   <GoldfishScene glbPath="/models/goldfish.glb" />
 */
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

// ---------- 設定値 ----------
interface SwimConfig {
  /** 円軌道の半径 */
  orbitRadius: number;
  /** 円軌道の速度 (rad/s) */
  orbitSpeed: number;
  /** 上下揺れの振幅 */
  bobAmplitude: number;
  /** 上下揺れの周波数 */
  bobFrequency: number;
  /** ロール（横揺れ）の振幅 (rad) */
  rollAmplitude: number;
  /** ロール周波数 */
  rollFrequency: number;
}

const DEFAULT_SWIM_CONFIG: SwimConfig = {
  orbitRadius: 2,
  orbitSpeed: 0.3,
  bobAmplitude: 0.15,
  bobFrequency: 1.5,
  rollAmplitude: 0.1,
  rollFrequency: 0.8,
};

// ---------- 金魚メッシュ ----------
interface GoldfishProps {
  glbPath: string;
  config?: Partial<SwimConfig>;
  scale?: number;
}

function Goldfish({
  glbPath,
  config: configOverride,
  scale = 1,
}: GoldfishProps) {
  const { scene } = useGLTF(glbPath);
  const groupRef = useRef<THREE.Group>(null);
  const cfg = { ...DEFAULT_SWIM_CONFIG, ...configOverride };

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const group = groupRef.current;
    if (!group) return;

    // 円軌道移動
    const angle = t * cfg.orbitSpeed;
    group.position.x = Math.cos(angle) * cfg.orbitRadius;
    group.position.z = Math.sin(angle) * cfg.orbitRadius;

    // 上下微揺れ
    group.position.y = Math.sin(t * cfg.bobFrequency) * cfg.bobAmplitude;

    // 進行方向に向ける（接線方向）
    const tangentAngle = angle + Math.PI / 2;
    group.rotation.y = tangentAngle;

    // ロール（横揺れ）
    group.rotation.z = Math.sin(t * cfg.rollFrequency) * cfg.rollAmplitude;
  });

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

// ---------- シーン ----------
interface GoldfishSceneProps {
  glbPath: string;
  config?: Partial<SwimConfig>;
  scale?: number;
  width?: string | number;
  height?: string | number;
}

export function GoldfishScene({
  glbPath,
  config,
  scale = 1,
  width = "100%",
  height = 500,
}: GoldfishSceneProps) {
  return (
    <div style={{ width, height }}>
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Goldfish glbPath={glbPath} config={config} scale={scale} />
        <OrbitControls enableDamping />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}

export { DEFAULT_SWIM_CONFIG };
export type { SwimConfig, GoldfishProps, GoldfishSceneProps };
