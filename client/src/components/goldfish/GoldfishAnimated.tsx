/**
 * GoldfishAnimated.tsx
 * 役割: GLBにAnimationClip（ボーンアニメーション）が含まれる場合に
 *       AnimationMixerで再生しつつ、擬似遊泳も併用できるハイブリッド版
 *
 * - アニメーションがあれば自動再生
 * - アニメーションがなければ擬似遊泳のみ
 * - 両方同時も可能（enablePseudoSwim: true）
 *
 * 使い方:
 *   import { GoldfishAnimatedScene } from "@/components/goldfish/GoldfishAnimated";
 *   <GoldfishAnimatedScene glbPath="/models/goldfish-with-bones.glb" />
 */
import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { type SwimConfig, DEFAULT_SWIM_CONFIG } from "./GoldfishSwimmer";

// ---------- 金魚（AnimationMixer対応） ----------
interface AnimatedFishProps {
  glbPath: string;
  /** アニメーションがない場合や追加で擬似遊泳を有効にするか */
  enablePseudoSwim?: boolean;
  /** 擬似遊泳の設定 */
  swimConfig?: Partial<SwimConfig>;
  /** 再生するアニメーション名（省略で全再生） */
  animationName?: string;
  scale?: number;
}

function AnimatedFish({
  glbPath,
  enablePseudoSwim = true,
  swimConfig: configOverride,
  animationName,
  scale = 1,
}: AnimatedFishProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(glbPath);
  const { actions, names } = useAnimations(animations, groupRef);
  const cfg = { ...DEFAULT_SWIM_CONFIG, ...configOverride };
  const hasAnimations = animations.length > 0;

  // GLBにアニメーションがあればMixerで再生
  useEffect(() => {
    if (!hasAnimations) return;

    if (animationName && actions[animationName]) {
      actions[animationName]!.reset().fadeIn(0.5).play();
      return () => {
        actions[animationName]?.fadeOut(0.5);
      };
    }

    // 名前指定なし → 全アニメーション再生
    const playingActions = names.map((name) => {
      const action = actions[name]!;
      action.reset().fadeIn(0.5).play();
      return action;
    });
    return () => {
      playingActions.forEach((a) => a.fadeOut(0.5));
    };
  }, [actions, names, animationName, hasAnimations]);

  // 擬似遊泳（アニメーション有無にかかわらずオプションで使用可能）
  useFrame(({ clock }) => {
    if (!enablePseudoSwim) return;
    const t = clock.getElapsedTime();
    const group = groupRef.current;
    if (!group) return;

    const angle = t * cfg.orbitSpeed;
    group.position.x = Math.cos(angle) * cfg.orbitRadius;
    group.position.z = Math.sin(angle) * cfg.orbitRadius;
    group.position.y = Math.sin(t * cfg.bobFrequency) * cfg.bobAmplitude;
    group.rotation.y = angle + Math.PI / 2;
    group.rotation.z = Math.sin(t * cfg.rollFrequency) * cfg.rollAmplitude;
  });

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

// ---------- シーン ----------
interface GoldfishAnimatedSceneProps {
  glbPath: string;
  enablePseudoSwim?: boolean;
  swimConfig?: Partial<SwimConfig>;
  animationName?: string;
  scale?: number;
  width?: string | number;
  height?: string | number;
}

export function GoldfishAnimatedScene({
  glbPath,
  enablePseudoSwim = true,
  swimConfig,
  animationName,
  scale = 1,
  width = "100%",
  height = 500,
}: GoldfishAnimatedSceneProps) {
  return (
    <div style={{ width, height }}>
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <AnimatedFish
          glbPath={glbPath}
          enablePseudoSwim={enablePseudoSwim}
          swimConfig={swimConfig}
          animationName={animationName}
          scale={scale}
        />
        <OrbitControls enableDamping />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}

export type { GoldfishAnimatedSceneProps, AnimatedFishProps };
