/**
 * GoldfishClickable.tsx
 * 役割: クリックした地点に向かって金魚が泳いでいくインタラクティブ版
 *
 * 使い方:
 *   import { GoldfishClickableScene } from "@/components/goldfish/GoldfishClickable";
 *   <GoldfishClickableScene glbPath="/models/goldfish.glb" />
 */
import { useRef, useState, useCallback } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

// ---------- 設定 ----------
const SWIM_SPEED = 1.5;
const TURN_SPEED = 3;
const BOB_AMPLITUDE = 0.12;
const BOB_FREQUENCY = 1.5;
const ROLL_AMPLITUDE = 0.08;
const ARRIVAL_THRESHOLD = 0.3;

// ---------- 金魚 ----------
interface ClickableFishProps {
  glbPath: string;
  target: THREE.Vector3;
  scale?: number;
}

function ClickableFish({ glbPath, target, scale = 1 }: ClickableFishProps) {
  const { scene } = useGLTF(glbPath);
  const groupRef = useRef<THREE.Group>(null);
  const currentDir = useRef(new THREE.Vector3(0, 0, 1));

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const group = groupRef.current;
    if (!group) return;

    // ターゲットへの方向ベクトル (Y軸は無視して水平面で旋回)
    const toTarget = new THREE.Vector3(
      target.x - group.position.x,
      0,
      target.z - group.position.z,
    );
    const distance = toTarget.length();

    if (distance > ARRIVAL_THRESHOLD) {
      // 方向をなめらかに補間
      toTarget.normalize();
      currentDir.current.lerp(toTarget, TURN_SPEED * delta);
      currentDir.current.normalize();

      // 移動
      group.position.x += currentDir.current.x * SWIM_SPEED * delta;
      group.position.z += currentDir.current.z * SWIM_SPEED * delta;
    }

    // 上下揺れ
    group.position.y = Math.sin(t * BOB_FREQUENCY) * BOB_AMPLITUDE;

    // 進行方向に向ける
    const heading = Math.atan2(currentDir.current.x, currentDir.current.z);
    group.rotation.y = heading;

    // ロール
    group.rotation.z = Math.sin(t * 0.8) * ROLL_AMPLITUDE;
  });

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

// ---------- クリック可能な水面 ----------
interface WaterPlaneProps {
  onClickPoint: (point: THREE.Vector3) => void;
}

function WaterPlane({ onClickPoint }: WaterPlaneProps) {
  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onClickPoint(e.point.clone());
    },
    [onClickPoint],
  );

  return (
    <mesh
      rotation-x={-Math.PI / 2}
      position={[0, -0.01, 0]}
      onClick={handleClick}
    >
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial
        color="#4488aa"
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ---------- シーン ----------
interface GoldfishClickableSceneProps {
  glbPath: string;
  scale?: number;
  width?: string | number;
  height?: string | number;
}

export function GoldfishClickableScene({
  glbPath,
  scale = 1,
  width = "100%",
  height = 500,
}: GoldfishClickableSceneProps) {
  const [target, setTarget] = useState(() => new THREE.Vector3(2, 0, 0));

  return (
    <div style={{ width, height }}>
      <Canvas camera={{ position: [0, 4, 8], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <ClickableFish glbPath={glbPath} target={target} scale={scale} />
        <WaterPlane onClickPoint={setTarget} />
        <OrbitControls enableDamping />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}

export type { GoldfishClickableSceneProps };
