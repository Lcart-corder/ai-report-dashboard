import * as THREE from "three";
import type { GoldfishConfig } from "@/lib/types";
import { GoldfishPool } from "./GoldfishPool";

/**
 * Three.js + WebXR シーンマネージャー
 * 金魚が泳ぐ水中シーンを管理し、VRモードへの切り替えを提供する
 */
export class VRScene {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private pool!: GoldfishPool;
  private clock: THREE.Clock;
  private animationId: number | null = null;
  private xrSession: XRSession | null = null;
  private disposed = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();
  }

  /** シーンの初期化 — レンダラー・カメラ・ライト・水面を構築 */
  init(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // レンダラー
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.xr.enabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // シーン — 水中っぽい背景色
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a3d62);
    this.scene.fog = new THREE.FogExp2(0x0a3d62, 0.08);

    // カメラ
    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 100);
    this.camera.position.set(0, 1.5, 4);
    this.camera.lookAt(0, 0.5, 0);

    // ── ライティング ──
    // 環境光（水中の拡散光）
    const ambient = new THREE.AmbientLight(0x4488cc, 0.6);
    this.scene.add(ambient);

    // メインの指向性ライト（水面からの光）
    const directional = new THREE.DirectionalLight(0xffffff, 1.0);
    directional.position.set(2, 5, 3);
    directional.castShadow = false;
    this.scene.add(directional);

    // 水面下からの逆光（コースティクス風の雰囲気）
    const bottomLight = new THREE.PointLight(0x66ccff, 0.3, 10);
    bottomLight.position.set(0, -2, 0);
    this.scene.add(bottomLight);

    // ── 水面プレーン（半透明の青い底面） ──
    const waterGeom = new THREE.PlaneGeometry(20, 20);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1a6fa0,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      metalness: 0.1,
      roughness: 0.8,
    });
    const waterPlane = new THREE.Mesh(waterGeom, waterMat);
    waterPlane.rotation.x = -Math.PI / 2;
    waterPlane.position.y = -0.5;
    this.scene.add(waterPlane);

    // 装飾：浮遊するパーティクル（水中の泡）
    this.createBubbles();

    // 金魚プール
    this.pool = new GoldfishPool(this.scene);

    // リサイズ対応
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize);
  }

  /** 水中の泡パーティクルを生成 */
  private createBubbles(): void {
    const bubbleCount = 50;
    const positions = new Float32Array(bubbleCount * 3);
    for (let i = 0; i < bubbleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = Math.random() * 5 - 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xaaddff,
      size: 0.05,
      transparent: true,
      opacity: 0.5,
    });
    const points = new THREE.Points(geom, mat);
    this.scene.add(points);
  }

  /** 金魚を追加 */
  addFish(config: GoldfishConfig): void {
    this.pool.addFish(config);
  }

  /** アニメーションループを開始（通常モード） */
  startAnimation(): void {
    if (this.disposed) return;

    // WebXR セッション中は setAnimationLoop を使う
    this.renderer.setAnimationLoop((_, frame) => {
      if (this.disposed) return;
      const time = this.clock.getElapsedTime();
      this.pool.update(time);

      // 非VR時のカメラ微動（ゆったりした揺れ）
      if (!frame) {
        this.camera.position.x = Math.sin(time * 0.1) * 0.3;
        this.camera.position.y = 1.5 + Math.sin(time * 0.15) * 0.1;
        this.camera.lookAt(0, 0.5, 0);
      }

      this.renderer.render(this.scene, this.camera);
    });
  }

  /** WebXR VR モードに入る */
  async enterVR(): Promise<void> {
    if (!navigator.xr) {
      throw new Error("WebXR がこのブラウザでサポートされていません");
    }

    const supported = await navigator.xr.isSessionSupported("immersive-vr");
    if (!supported) {
      throw new Error("immersive-vr セッションがサポートされていません");
    }

    const session = await navigator.xr.requestSession("immersive-vr", {
      optionalFeatures: ["local-floor", "bounded-floor"],
    });

    this.xrSession = session;
    await this.renderer.xr.setSession(session);

    session.addEventListener("end", () => {
      this.xrSession = null;
    });
  }

  /** WebXR がサポートされているか判定 */
  isVRSupported(): boolean {
    return typeof navigator !== "undefined" && "xr" in navigator;
  }

  /** ウィンドウリサイズ処理 */
  private handleResize(): void {
    if (this.disposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /** 全リソースを解放 */
  dispose(): void {
    this.disposed = true;
    window.removeEventListener("resize", this.handleResize);

    if (this.xrSession) {
      this.xrSession.end().catch(() => {});
      this.xrSession = null;
    }

    this.renderer.setAnimationLoop(null);

    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.pool.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }

  /** 現在の金魚数を返す */
  get fishCount(): number {
    return this.pool.count;
  }
}
