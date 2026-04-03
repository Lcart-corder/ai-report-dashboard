/**
 * GoldfishSchool.tsx
 * 役割: 複数匹の金魚をランダムなパラメータで泳がせるコンポーネント
 *
 * 使い方:
 *   import { GoldfishSchoolScene } from "@/components/goldfish/GoldfishSchool";
 *   <GoldfishSchoolScene glbPath="/models/goldfish.glb" count={5} />
 */
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { type SwimConfig, DEFAULT_SWIM_CONFIG } from "./GoldfishSwimmer";

// ---------- ランダムパラメータ生成 ----------
function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

interface FishInstance {
  config: SwimConfig;
  scale: number;
  phaseOffset: number;
  yOffset: number;
}

function generateFishInstances(count: number): FishInstance[] {
  return Array.from({ length: count }, () => ({
    config: {
      orbitRadius: randomBetween(1.5, 4),
      orbitSpeed: randomBetween(0.15, 0.5),
      bobAmplitude: randomBetween(0.08, 0.25),
      bobFrequency: randomBetween(1, 2.5),
      rollAmplitude: randomBetween(0.05, 0.15),
      rollFrequency: randomBetween(0.5, 1.2),
    },
    scale: randomBetween(0.6, 1.2),
    phaseOffset: randomBetween(0, Math.PI * 2),
    yOffset: randomBetween(-0.5, 0.5),
  }));
}

// ---------- 単体金魚（クローン使用で複数表示対応） ----------
interface SchoolFishProps {
  glbPath: string;
  instance: FishInstance;
}

function SchoolFish({ glbPath, instance }: SchoolFishProps) {
  const { scene } = useGLTF(glbPath);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const groupRef = useRef<THREE.Group>(null);
  const { config: cfg, phaseOffset, yOffset } = instance;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phaseOffset;
    const group = groupRef.current;
    if (!group) return;

    const angle = t * cfg.orbitSpeed;
    group.position.x = Math.cos(angle) * cfg.orbitRadius;
    group.position.z = Math.sin(angle) * cfg.orbitRadius;
    group.position.y =
      Math.sin(t * cfg.bobFrequency) * cfg.bobAmplitude + yOffset;

    group.rotation.y = angle + Math.PI / 2;
    group.rotation.z = Math.sin(t * cfg.rollFrequency) * cfg.rollAmplitude;
  });

  return (
    <group ref={groupRef} scale={instance.scale}>
      <primitive object={clonedScene} />
    </group>
  );
}

// ---------- シーン ----------
interface GoldfishSchoolSceneProps {
  glbPath: string;
  count?: number;
  width?: string | number;
  height?: string | number;
}

export function GoldfishSchoolScene({
  glbPath,
  count = 5,
  width = "100%",
  height = 500,
}: GoldfishSchoolSceneProps) {
  const instances = useMemo(() => generateFishInstances(count), [count]);

  return (
    <div style={{ width, height }}>
      <Canvas camera={{ position: [0, 3, 10], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        {instances.map((inst, i) => (
          <SchoolFish key={i} glbPath={glbPath} instance={inst} />
        ))}
        <OrbitControls enableDamping />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}

export type { GoldfishSchoolSceneProps };
