import * as THREE from "three";
import type { GoldfishConfig } from "@/lib/types";
import { GoldfishModel } from "./GoldfishModel";

/** 個々の金魚の軌道情報 */
interface FishEntry {
  model: GoldfishModel;
  /** 軌道の中心 */
  orbitCenter: THREE.Vector3;
  /** 軌道半径 */
  orbitRadius: number;
  /** 周回速度 */
  orbitSpeed: number;
  /** 開始角度オフセット */
  angleOffset: number;
  /** 垂直方向のボビング振幅 */
  bobAmplitude: number;
  /** ボビング速度 */
  bobSpeed: number;
  /** figure-8 パスかどうか */
  useFigure8: boolean;
}

/**
 * 金魚の群れを管理するプールクラス
 * 各金魚は独自のランダムな軌道上を泳ぐ
 */
export class GoldfishPool {
  private scene: THREE.Scene;
  private entries: FishEntry[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * 金魚をプールに追加
   * ランダムな軌道パラメータを割り当てる
   */
  addFish(config: GoldfishConfig): void {
    const model = new GoldfishModel(config);
    const mesh = model.getMesh();

    // ランダムな軌道パラメータを生成
    const orbitCenter = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 0.5 + 0.5, // 水面付近に配置
      (Math.random() - 0.5) * 2
    );
    const orbitRadius = 0.8 + Math.random() * 1.5;
    const orbitSpeed = (0.3 + Math.random() * 0.5) * config.swimSpeed;
    const angleOffset = Math.random() * Math.PI * 2;
    const bobAmplitude = 0.05 + Math.random() * 0.15;
    const bobSpeed = 0.5 + Math.random() * 1.0;
    const useFigure8 = Math.random() > 0.5;

    // 初期位置を設定
    mesh.position.copy(orbitCenter);
    this.scene.add(mesh);

    this.entries.push({
      model,
      orbitCenter,
      orbitRadius,
      orbitSpeed,
      angleOffset,
      bobAmplitude,
      bobSpeed,
      useFigure8,
    });
  }

  /**
   * 全金魚の位置とアニメーションを更新
   * 軌道移動 + 垂直ボビング + ロール + 個体アニメーション
   */
  update(time: number): void {
    for (const entry of this.entries) {
      const {
        model,
        orbitCenter,
        orbitRadius,
        orbitSpeed,
        angleOffset,
        bobAmplitude,
        bobSpeed,
        useFigure8,
      } = entry;

      const angle = time * orbitSpeed + angleOffset;
      const mesh = model.getMesh();

      // 軌道上の位置計算
      let x: number;
      let z: number;

      if (useFigure8) {
        // 8の字パス（レムニスケート風）
        x = orbitCenter.x + orbitRadius * Math.sin(angle);
        z = orbitCenter.z + orbitRadius * 0.6 * Math.sin(angle * 2);
      } else {
        // 円形パス
        x = orbitCenter.x + orbitRadius * Math.cos(angle);
        z = orbitCenter.z + orbitRadius * Math.sin(angle);
      }

      // 垂直ボビング
      const y = orbitCenter.y + Math.sin(time * bobSpeed + angleOffset) * bobAmplitude;

      mesh.position.set(x, y, z);

      // 進行方向を向かせる（次フレームの位置で計算）
      const nextAngle = angle + 0.01;
      let nextX: number;
      let nextZ: number;

      if (useFigure8) {
        nextX = orbitCenter.x + orbitRadius * Math.sin(nextAngle);
        nextZ = orbitCenter.z + orbitRadius * 0.6 * Math.sin(nextAngle * 2);
      } else {
        nextX = orbitCenter.x + orbitRadius * Math.cos(nextAngle);
        nextZ = orbitCenter.z + orbitRadius * Math.sin(nextAngle);
      }

      // 進行方向に向く
      mesh.lookAt(nextX, y, nextZ);

      // 旋回時の軽いロール
      const turnRate = Math.sin(angle * orbitSpeed) * 0.1;
      mesh.rotation.z += turnRate;

      // 個体のアニメーション（尾びれ・ヒレの動き）
      model.update(time);
    }
  }

  /** 全金魚を削除（シーンからも除去） */
  clear(): void {
    for (const entry of this.entries) {
      const mesh = entry.model.getMesh();
      this.scene.remove(mesh);
      entry.model.dispose();
    }
    this.entries = [];
  }

  /** リソース解放 */
  dispose(): void {
    this.clear();
  }

  /** 現在の金魚数 */
  get count(): number {
    return this.entries.length;
  }
}
