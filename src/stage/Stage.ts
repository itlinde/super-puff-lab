import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Jacket, type JacketState } from '../jacket/Jacket';

/** Renderer, lights and camera framing around the jacket. */
export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  readonly jacket: Jacket;
  readonly pivot = new THREE.Group();
  private controls?: OrbitControls;
  private target = new THREE.Vector3();
  private dist = 8;

  constructor(private canvas: HTMLCanvasElement, state: JacketState, opts: { orbit: boolean }) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 0.9;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.7;
    pmrem.dispose();

    const hemi = new THREE.HemisphereLight('#ffffff', '#bdb6ae', 0.25);
    this.scene.add(hemi);
    const key = new THREE.DirectionalLight('#fffaf4', 3.0);
    key.position.set(-3.2, 4.2, 3.4);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = key.shadow.camera.bottom = -2.2;
    key.shadow.camera.right = key.shadow.camera.top = 2.2;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 5;
    this.scene.add(key);
    const rim = new THREE.DirectionalLight('#eef2ff', 1.1);
    rim.position.set(3, 2, -4);
    this.scene.add(rim);

    this.jacket = new Jacket(state);
    this.pivot.add(this.jacket.group);
    this.scene.add(this.pivot);

    if (opts.orbit) {
      this.controls = new OrbitControls(this.camera, canvas);
      this.controls.enableZoom = false;
      this.controls.enablePan = false;
      this.controls.enableDamping = true;
      this.controls.minPolarAngle = Math.PI * 0.32;
      this.controls.maxPolarAngle = Math.PI * 0.62;
    }

    this.frame(true);
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  setVariant(state: JacketState) {
    this.jacket.set(state);
    this.frame(true);
  }

  setYaw(rad: number) {
    this.pivot.rotation.y = rad;
  }

  /** Frame the jacket so length changes stay readable without overflowing. */
  private frame(snap: boolean) {
    const { top, bottom } = this.jacket.bounds();
    const h = top - bottom;
    const visible = Math.max(h / 0.78, 2.7);
    this.dist = visible / 2 / Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    this.target.set(0, (top + bottom) / 2 + visible * 0.035, 0);
    if (snap) {
      const dir = this.camera.position.clone().sub(this.controls?.target ?? new THREE.Vector3());
      if (dir.lengthSq() < 1e-6) dir.set(0, 0.06, 1);
      dir.normalize().multiplyScalar(this.dist);
      this.camera.position.copy(this.target).add(dir);
      this.camera.lookAt(this.target);
      if (this.controls) {
        this.controls.target.copy(this.target);
        this.controls.update();
      }
    }
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  render() {
    this.controls?.update();
    this.renderer.render(this.scene, this.camera);
  }
}
