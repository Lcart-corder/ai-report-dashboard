import * as THREE from "three";
import type { GoldfishConfig } from "@/lib/types";

/**
 * パラメトリック金魚モデル
 * 子どもの絵から解析されたパラメータに基づいて手続き的に金魚を生成する
 */
export class GoldfishModel {
  private group: THREE.Group;
  private body: THREE.Mesh;
  private dorsalFin: THREE.Mesh;
  private leftPectoralFin: THREE.Mesh;
  private rightPectoralFin: THREE.Mesh;
  private tail: THREE.Mesh;
  private config: GoldfishConfig;

  /** 各パーツの初期回転を保持（アニメーションの基準） */
  private initialTailRotY: number = 0;
  private initialDorsalRotZ: number = 0;

  constructor(config: GoldfishConfig) {
    this.config = config;
    this.group = new THREE.Group();

    const primaryColor = new THREE.Color(config.colors[0] ?? "#FF6B6B");
    const secondaryColor = new THREE.Color(config.colors[1] ?? config.colors[0] ?? "#FFD93D");

    // ── 体：スケーリングされた球体 ──
    const bodyGeom = new THREE.SphereGeometry(0.5, 32, 24);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      metalness: 0.1,
      roughness: 0.4,
    });
    this.body = new THREE.Mesh(bodyGeom, bodyMat);
    this.body.scale.set(config.bodyScale.x, config.bodyScale.y, config.bodyScale.z);
    this.group.add(this.body);

    // ── 目 ──
    const eyeGeom = new THREE.SphereGeometry(0.06, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const eyeWhiteGeom = new THREE.SphereGeometry(0.09, 16, 16);

    // 左目
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat);
    leftEyeWhite.position.set(0.2 * config.bodyScale.x, 0.15, 0.35 * config.bodyScale.z);
    this.group.add(leftEyeWhite);
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(0.22 * config.bodyScale.x, 0.15, 0.39 * config.bodyScale.z);
    this.group.add(leftEye);

    // 右目
    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat);
    rightEyeWhite.position.set(-0.2 * config.bodyScale.x, 0.15, 0.35 * config.bodyScale.z);
    this.group.add(rightEyeWhite);
    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(-0.22 * config.bodyScale.x, 0.15, 0.39 * config.bodyScale.z);
    this.group.add(rightEye);

    // ── 背ビレ：体の上に配置 ──
    const dorsalGeom = new THREE.PlaneGeometry(0.4 * config.finScale, 0.3 * config.finScale);
    const finMat = new THREE.MeshStandardMaterial({
      color: secondaryColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      metalness: 0.05,
      roughness: 0.5,
    });
    this.dorsalFin = new THREE.Mesh(dorsalGeom, finMat);
    this.dorsalFin.position.set(0, 0.45, -0.05);
    this.dorsalFin.rotation.x = -Math.PI * 0.15;
    this.initialDorsalRotZ = 0;
    this.group.add(this.dorsalFin);

    // ── 胸ビレ：体の両側 ──
    const pectoralGeom = new THREE.PlaneGeometry(
      0.25 * config.finScale,
      0.15 * config.finScale
    );

    this.leftPectoralFin = new THREE.Mesh(pectoralGeom, finMat.clone());
    this.leftPectoralFin.position.set(
      0.35 * config.bodyScale.x,
      -0.05,
      0.15
    );
    this.leftPectoralFin.rotation.set(0, Math.PI * 0.3, Math.PI * 0.15);
    this.group.add(this.leftPectoralFin);

    this.rightPectoralFin = new THREE.Mesh(pectoralGeom, finMat.clone());
    this.rightPectoralFin.position.set(
      -0.35 * config.bodyScale.x,
      -0.05,
      0.15
    );
    this.rightPectoralFin.rotation.set(0, -Math.PI * 0.3, -Math.PI * 0.15);
    this.group.add(this.rightPectoralFin);

    // ── 尾びれ：扇形（ConeGeometry で表現） ──
    const tailGeom = new THREE.ConeGeometry(
      0.35 * config.tailScale,
      0.5 * config.tailScale,
      8,
      1,
      true
    );
    const tailMat = new THREE.MeshStandardMaterial({
      color: secondaryColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      metalness: 0.05,
      roughness: 0.5,
    });
    this.tail = new THREE.Mesh(tailGeom, tailMat);
    this.tail.position.set(0, 0, -0.55 * config.bodyScale.z);
    this.tail.rotation.x = Math.PI * 0.5;
    this.initialTailRotY = 0;
    this.group.add(this.tail);

    // 全体スケール
    this.group.scale.setScalar(0.8);
  }

  /** Three.js シーンに追加するためのグループを返す */
  getMesh(): THREE.Group {
    return this.group;
  }

  /**
   * 毎フレーム呼ばれるアニメーション更新
   * 尾びれの揺れ・体のヨー・ヒレの羽ばたきを計算
   */
  update(time: number): void {
    const speed = this.config.swimSpeed;
    const t = time * speed;

    // パターンによるアニメーションの強弱
    let tailAmp = 0.3;
    let bodyYawAmp = 0.05;
    let finAmp = 0.2;

    switch (this.config.swimPattern) {
      case "playful":
        tailAmp = 0.5;
        bodyYawAmp = 0.1;
        finAmp = 0.35;
        break;
      case "elegant":
        tailAmp = 0.25;
        bodyYawAmp = 0.03;
        finAmp = 0.15;
        break;
      case "calm":
      default:
        break;
    }

    // 尾びれの左右揺動
    this.tail.rotation.y = this.initialTailRotY + Math.sin(t * 4) * tailAmp;

    // 体のヨー（進行方向の微小な左右揺れ）
    this.body.rotation.y = Math.sin(t * 2) * bodyYawAmp;

    // 背ビレの微振動
    this.dorsalFin.rotation.z =
      this.initialDorsalRotZ + Math.sin(t * 6) * finAmp * 0.3;

    // 胸ビレの羽ばたき
    this.leftPectoralFin.rotation.z =
      Math.PI * 0.15 + Math.sin(t * 5) * finAmp;
    this.rightPectoralFin.rotation.z =
      -Math.PI * 0.15 - Math.sin(t * 5) * finAmp;
  }

  /** リソース解放 */
  dispose(): void {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}
