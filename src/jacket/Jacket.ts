import * as THREE from 'three';
import { buildSurface, baffle, smoothstep, seamShade } from './surface';
import { makeShellMaterial, makeLiningMaterial, trimMaterials } from './materials';
import type { Family, FabricId, Length, Sleeves } from '../data/variants';

export interface JacketState {
  family: Family;
  length: Length;
  sleeves: Sleeves;
  fabric: FabricId;
  colour: string; // hex
}

/** Torso wall height (shoulder line to hem), in scene units. */
const LENGTH_VALUE: Record<Length, number> = {
  xtrashorty: 0.62,
  shorty: 0.92,
  original: 1.33,
  mid: 1.85,
  long: 2.45,
};

interface Shape {
  L: number; // torso wall height
  W: number; // half-width at the shoulder line
  Dp: number; // half-depth
  puff: number; // baffle bulge
  bh: number; // target baffle height
  flare: number; // hem flare for longer lengths
  sleeves: boolean;
  sleeveR: number;
  neckRx: number;
  neckRz: number;
}

function shapeFor(s: JacketState): Shape {
  const L = LENGTH_VALUE[s.length];
  const slim = s.family === 'supersnug';
  const stiff = s.fabric === 'rainstop' ? 0.85 : 1; // two-layer: a touch flatter
  return {
    L,
    W: (slim ? 0.35 : 0.42) * (s.sleeves === 'vest' ? 0.95 : 1),
    Dp: slim ? 0.27 : 0.31,
    puff: (slim ? 0.026 : 0.04) * stiff,
    bh: slim ? 0.2 : 0.25,
    flare: L > 1.3 ? 0.06 : 0.0,
    sleeves: s.sleeves === 'sleeves',
    sleeveR: slim ? 0.1 : 0.125,
    neckRx: slim ? 0.24 : 0.27,
    neckRz: slim ? 0.2 : 0.22,
  };
}

const DOME = 0.2; // shoulder line -> neck
const COLLAR = 0.3; // collar height
const YOKE = 0.34; // depth of the smooth chest/shoulder yoke below the shoulder line

/** Superellipse cross-section point and its outward normal direction. */
function section(theta: number, rx: number, rz: number, out: THREE.Vector3, dir?: THREE.Vector3, n = 2.5) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const e = 2 / n;
  const x = rx * Math.sign(c) * Math.pow(Math.abs(c), e);
  const z = rz * Math.sign(s) * Math.pow(Math.abs(s), e);
  out.set(x, 0, z);
  if (dir) dir.set(x / (rx * rx), 0, z / (rz * rz)).normalize();
}

/**
 * Procedural Super Puff. Everything is generated from a handful of shape
 * parameters so length, fit and sleeves are real geometry changes.
 */
export class Jacket {
  readonly group = new THREE.Group();
  private shell!: THREE.MeshPhysicalMaterial;
  private lining!: THREE.MeshStandardMaterial;
  /** Attachment points used by the motion layer (slice 3). */
  readonly anchors: Record<string, THREE.Object3D> = {};
  shape!: Shape;

  constructor(state: JacketState) {
    this.set(state);
  }

  set(state: JacketState) {
    this.clear();
    this.shape = shapeFor(state);
    this.shell = makeShellMaterial(state.fabric, state.colour);
    this.lining = makeLiningMaterial(state.colour);
    this.build();
  }

  /** Height range of the jacket, for camera framing. */
  bounds(): { top: number; bottom: number } {
    const box = new THREE.Box3().setFromObject(this.group);
    return { top: box.max.y, bottom: box.min.y };
  }

  private clear() {
    this.group.traverse((o) => {
      if (o instanceof THREE.Mesh) o.geometry.dispose();
    });
    this.group.clear();
    this.shell?.dispose();
    this.lining?.dispose();
  }

  private addShell(geo: THREE.BufferGeometry, lined = true) {
    ensureColor(geo);
    const m = new THREE.Mesh(geo, this.shell);
    m.castShadow = m.receiveShadow = true;
    this.group.add(m);
    if (lined) {
      const l = new THREE.Mesh(geo, this.lining);
      l.receiveShadow = true;
      this.group.add(l);
    }
    return m;
  }

  // ---------------------------------------------------------------- torso
  /** Point on the torso (incl. shoulder dome) at angle theta and height y. */
  /** Shade of the last torsoPoint() call (seam darkening). */
  private lastShade = 1;

  torsoPoint(theta: number, y: number, out: THREE.Vector3, puffScale = 1) {
    const S = this.shape;
    const p = out;
    const dir = new THREE.Vector3();
    if (y <= 0) {
      const t = -y / S.L; // 0 at shoulders, 1 at hem
      const flare = 1 + S.flare * t * t;
      const tuck = 1 - 0.012 * smoothstep(0.9, 1, t); // hem draws in very slightly
      // Vests narrow toward the shoulder so the armhole reads and the top slopes.
      // Sleeved: the upper sides widen into the sleeve caps so the junction hides under them.
      const vestTaper = S.sleeves ? 1 + 0.12 * smoothstep(-YOKE - 0.12, 0, y) : 1 - 0.2 * smoothstep(-0.32, 0, y);
      section(theta, S.W * flare * tuck * vestTaper, S.Dp * flare * tuck, p, dir);
      const sinT = Math.abs(Math.sin(theta));
      // Down shifts to the front and back panels; the sides stay straighter,
      // and the panels dome slightly across their width.
      const across = 1 + 0.4 * (1 - Math.min(1, Math.pow(p.x / (S.W * 0.95), 2)));
      const panel = (0.45 + 0.55 * sinT) * across;
      // Yoke seam: curves down toward the sleeves, like the reference.
      const yoke = this.yokeY(theta);
      let amt: number;
      if (y > yoke) {
        const f = (y - yoke) / (DOME - yoke);
        amt = S.puff * 1.15 * baffle(f, 0.55) * puffScale * panel;
        this.lastShade = seamShade(f * 0.5, 0.24);
      } else {
        const span = S.L + yoke;
        const nb = Math.max(1, Math.round(span / S.bh));
        const frac = (y + S.L) / (span / nb);
        amt = S.puff * baffle(frac - Math.floor(frac)) * puffScale * panel;
        this.lastShade = seamShade(frac, 0.22);
      }
      // Flatten under the front placket.
      const front = Math.exp(-Math.pow(p.x / 0.1, 2)) * (p.z > 0 ? 1 : 0);
      amt *= 1 - 0.85 * front;
      p.addScaledVector(dir, amt);
      if (!S.sleeves) {
        // Vest armholes: a soft inset on each side below the shoulder.
        const side = Math.pow(Math.abs(Math.cos(theta)), 8);
        const hole = Math.exp(-Math.pow((y + 0.24) / 0.17, 2)) * side;
        p.x *= 1 - 0.13 * hole;
        this.lastShade = Math.min(this.lastShade, 1 - 0.45 * hole);
      }
      p.y = y;
      return p;
    } else {
      // Shoulder dome: rounds from the shoulder line into the neck.
      const s = Math.min(y / DOME, 1);
      // Sloped shoulders: near-vertical at the shoulder line, then a steady slope to the neck.
      const k = 1 - Math.pow(s, S.sleeves ? 1.25 : 1.0);
      const vestTaper = S.sleeves ? 1.12 : 0.8;
      section(theta, S.neckRx + (S.W * vestTaper - S.neckRx) * k, S.neckRz + (S.Dp - S.neckRz) * k, p, dir);
      // The yoke's fullness continues up to the collar, on the chest and back only.
      const yoke = this.yokeY(theta);
      const f = (y - yoke) / (DOME - yoke);
      const across = 1 + 0.4 * (1 - Math.min(1, Math.pow(p.x / (S.W * 0.95), 2)));
      const sinT = Math.abs(Math.sin(theta));
      const front = Math.exp(-Math.pow(p.x / 0.1, 2)) * (p.z > 0 ? 1 : 0); // under the placket
      p.addScaledVector(dir, S.puff * 1.15 * baffle(f, 0.55) * puffScale * (0.45 + 0.55 * sinT) * across * (1 - s * 0.6) * (1 - 0.85 * front));
      p.y = y;
      this.lastShade = 1;
    }
    return p;
  }

  /** Height of the yoke seam at angle theta: lowest under the arms. */
  private yokeY(theta: number) {
    return -YOKE - 0.07 * Math.pow(Math.cos(theta), 2);
  }

  private build() {
    const S = this.shape;
    const total = S.L + DOME;
    const rows = Math.ceil(total * 110);

    // Torso: angle runs clockwise from +x so the front (+z) is at u=0.75.
    const torso = buildSurface(
      (u, v, o) => {
        this.torsoPoint(-u * Math.PI * 2 + Math.PI, -S.L + v * total, o);
        return this.lastShade;
      },
      { cols: 112, rows, wrapU: true, uvScale: [6, total * 4], inside: (_u, v, o) => o.set(0, -S.L + v * total, 0) },
    );
    this.addShell(torso);

    // Hem roll gives the open hem its thickness.
    this.addShell(this.ring((t, o) => this.torsoPoint(t, -S.L, o, 0), 0.028, 0.012), false);

    this.buildCollar();
    this.buildHood();
    this.buildPlacket();
    if (S.sleeves) {
      this.buildSleeve(1);
      this.buildSleeve(-1);
    } else {
      this.buildArmholes();
    }
    this.buildTrims();
  }

  /** A soft tube following a closed loop (hems, cuffs, openings). */
  private ring(loop: (t: number, o: THREE.Vector3) => void, r: number, yLift: number) {
    const centre = new THREE.Vector3();
    const pts: THREE.Vector3[] = [];
    const N = 96;
    for (let i = 0; i < N; i++) {
      const p = new THREE.Vector3();
      loop((i / N) * Math.PI * 2, p);
      p.y += yLift;
      pts.push(p);
      centre.add(p);
    }
    centre.divideScalar(N);
    const curve = new THREE.CatmullRomCurve3(pts, true);
    return new THREE.TubeGeometry(curve, N * 2, r, 12, true);
  }

  // --------------------------------------------------------------- collar
  private collarSection(theta: number, y: number, out: THREE.Vector3) {
    const S = this.shape;
    const t = (y - DOME) / COLLAR;
    const dir = new THREE.Vector3();
    const flare = 1 + 0.06 * t;
    section(theta, S.neckRx * flare, S.neckRz * flare, out, dir);
    const frac = t * 2;
    out.addScaledVector(dir, 0.02 * baffle(frac - Math.floor(frac)));
    out.y = y;
    this.lastShade = seamShade(frac, 0.12);
    return out;
  }

  private buildCollar() {
    const geo = buildSurface(
      (u, v, o) => {
        this.collarSection(-u * Math.PI * 2 + Math.PI, DOME + v * COLLAR, o);
        return this.lastShade;
      },
      { cols: 96, rows: 40, wrapU: true, uvScale: [4, 1.2], inside: (_u, v, o) => o.set(0, DOME + v * COLLAR, 0) },
    );
    this.addShell(geo);
    this.addShell(this.ring((t, o) => this.collarSection(t, DOME + COLLAR, o), 0.032, 0), false);
  }

  // ----------------------------------------------------------------- hood
  private buildHood() {
    // A soft, slumped hood worn down behind the collar: low crown, sides that
    // spill out past the collar, the face opening tipped up and forward so the
    // lining shows around the collar, and a few gentle folds.
    const S = this.shape;
    const collarTop = DOME + COLLAR;
    const c = new THREE.Vector3(0, collarTop - 0.03, -0.13);
    const R = new THREE.Vector3(S.neckRx + (S.sleeves ? 0.11 : 0.07), 0.25, 0.27); // vests: narrower shoulders, narrower hood
    const phi0 = 1.1; // half-angle of the face opening
    const tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.22); // opening faces forward, a little up
    let hoodShade = 1;
    const hoodPoint = (az: number, phi: number, o: THREE.Vector3, puffScale = 1) => {
      const dir = new THREE.Vector3(Math.sin(phi) * Math.cos(az), Math.sin(phi) * Math.sin(az), Math.cos(phi));
      dir.applyQuaternion(tilt);
      const up = Math.max(0, dir.y);
      o.set(dir.x * R.x, dir.y * R.y, dir.z * R.z);
      // Slump: the crown sags and the sides spread where fabric pools.
      o.y -= 0.045 * up * up;
      o.x *= 1 + 0.12 * (1 - up);
      // Soft folds rather than quilting.
      const fold = Math.sin(az * 5 + phi * 2.3) * 0.5 + Math.sin(az * 3 - phi * 4.1) * 0.5;
      o.addScaledVector(dir, (0.012 * fold + 0.02) * puffScale);
      // One seam over the crown (centre panel).
      const seam = Math.exp(-Math.pow(dir.x / 0.05, 2)) * up;
      hoodShade = 1 - 0.18 * seam - 0.06 * (fold * 0.5 + 0.5);
      return o.add(c);
    };
    const geo = buildSurface(
      (u, v, o) => {
        hoodPoint(u * Math.PI * 2, phi0 + v * (Math.PI - phi0 - 0.02), o);
        return hoodShade;
      },
      { cols: 96, rows: 60, wrapU: true, uvScale: [4, 3], inside: (_u, _v, o) => o.copy(c) },
    );
    this.addShell(geo);
    this.addShell(this.ring((t, o) => hoodPoint(t, phi0, o, 0.6), 0.03, 0), false);
    const top = new THREE.Object3D();
    top.position.set(0, c.y + R.y, c.z);
    this.anchors.hoodTop = top;
  }

  // -------------------------------------------------------------- placket
  private buildPlacket() {
    const S = this.shape;
    const yTop = DOME + COLLAR;
    const yBot = -S.L;
    const half = 0.065;
    const front = (x: number, y: number, o: THREE.Vector3) => {
      // Find the surface z at this x by sampling the front of the torso/collar.
      const theta = Math.PI / 2 + Math.asin(THREE.MathUtils.clamp(x / (y > DOME ? S.neckRx : S.W), -1, 1)) * -0.9;
      if (y > DOME) this.collarSection(theta, y, o);
      else this.torsoPoint(theta, y, o, 0.15);
      o.x = x;
      return o;
    };
    const geo = buildSurface(
      (u, v, o) => {
        const x = (u - 0.5) * 2 * half;
        const y = yBot + v * (yTop - yBot);
        front(x, y, o);
        o.z += 0.02 + 0.016 * Math.pow(Math.sin(Math.PI * u), 0.5);
        return 0.9 + 0.1 * Math.sin(Math.PI * u);
      },
      { cols: 8, rows: Math.ceil((yTop - yBot) * 80), uvScale: [0.4, (yTop - yBot) * 4], inside: (_u, v, o) => o.set(0, yBot + v * (yTop - yBot), 0) },
    );
    this.addShell(geo, false);

    // Snaps: one per baffle, plus two on the collar.
    const snapGeo = ensureColor(new THREE.CylinderGeometry(0.019, 0.019, 0.012, 20).rotateX(Math.PI / 2), 0.9);
    const span = S.L - YOKE;
    const nb = Math.max(1, Math.round(span / S.bh));
    const ys: number[] = [-YOKE * 0.45];
    for (let i = 0; i < nb; i++) ys.push(-S.L + (i + 0.5) * (span / nb));
    ys.push(DOME + COLLAR * 0.3, DOME + COLLAR * 0.72);
    for (const y of ys) {
      const p = front(0, y, new THREE.Vector3());
      const snap = new THREE.Mesh(snapGeo, this.shell);
      snap.position.set(0, y, p.z + 0.04);
      snap.castShadow = true;
      this.group.add(snap);
    }
  }

  // --------------------------------------------------------------- sleeve
  private buildSleeve(side: 1 | -1) {
    const S = this.shape;
    const W = S.W;
    // Sleeve centre sits so its inner edge just meets the torso.
    const hang = W + S.puff + (S.sleeveR + S.puff * 0.7) * 0.8;
    const curve = new THREE.CatmullRomCurve3([
      // Drop shoulder, then the sleeve hangs straight down against the body.
      // Raglan-like line: the sleeve starts near the collar so the shoulder
      // slopes continuously into the arm, as on the reference.
      new THREE.Vector3(side * W * 0.42, DOME * 0.55, 0),
      new THREE.Vector3(side * (W * 0.42 + hang) * 0.5, -0.04, 0),
      new THREE.Vector3(side * hang, -0.34, 0.01),
      new THREE.Vector3(side * (hang + 0.015), -0.85, 0.03),
      new THREE.Vector3(side * (hang + 0.025), -1.5, 0.06),
    ]);
    const len = curve.getLength();
    const frames = curve.computeFrenetFrames(160, false);
    // The sleeve cap above the yoke seam is part of the smooth yoke; quilting
    // starts below it, so the yoke reads as one panel across the shoulders.
    const seamY = this.yokeY(0);
    let vY = 0;
    for (let k = 0; k <= 200; k++) {
      if (curve.getPointAt(k / 200).y < seamY) { vY = k / 200; break; }
    }
    const nb = Math.max(3, Math.round((len * (1 - vY)) / S.bh));
    const N = new THREE.Vector3();
    const B = new THREE.Vector3();
    const radius = (v: number) => S.sleeveR * (1.12 - 0.3 * Math.sqrt(v));
    const at = (u: number, v: number, o: THREE.Vector3, puffScale = 1) => {
      const i = Math.min(160, Math.round(v * 160));
      curve.getPointAt(v, o);
      N.copy(frames.normals[i]);
      B.copy(frames.binormals[i]);
      const th = u * Math.PI * 2;
      let bulge: number;
      let shade: number;
      if (v < vY) {
        const f = v / vY;
        bulge = 0.8 * baffle(0.5 + f * 0.5, 0.55);
        shade = seamShade(0.5 + f * 0.5, 0.2);
      } else {
        const frac = ((v - vY) / (1 - vY)) * nb;
        bulge = baffle(frac - Math.floor(frac));
        shade = seamShade(frac, 0.2);
      }
      const r = radius(v) + S.puff * 0.6 * bulge * puffScale * smoothstep(0, 0.04, v);
      o.addScaledVector(N, Math.cos(th) * r).addScaledVector(B, Math.sin(th) * r);
      return shade;
    };
    const geo = buildSurface((u, v, o) => at(u, v, o), {
      cols: 48,
      rows: 160,
      wrapU: true,
      uvScale: [2, len * 4],
      inside: (_u, v, o) => curve.getPointAt(v, o),
    });
    this.addShell(geo);

    // Knit cuff, peeking out of the sleeve end.
    const end = curve.getPointAt(1);
    const tan = curve.getTangentAt(1);
    const cuffR = radius(1) * 0.74;
    const cuffGeo = new THREE.CylinderGeometry(cuffR * 0.95, cuffR, 0.15, 28, 1, true);
    const cuff = new THREE.Mesh(cuffGeo, trimMaterials.knit);
    cuff.material.side = THREE.DoubleSide;
    cuff.position.copy(end).addScaledVector(tan, 0.03);
    cuff.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), tan);
    cuff.castShadow = true;
    this.group.add(cuff);

    const a = new THREE.Object3D();
    a.position.copy(end);
    this.anchors[side > 0 ? 'cuffR' : 'cuffL'] = a;
  }

  private buildArmholes() {
    // Vest: the torso already reads as sleeveless; a narrower shoulder (set in
    // shapeFor) does the rest. Kept as a hook for armhole binding detail.
  }

  // ---------------------------------------------------------------- trims
  private buildTrims() {
    const S = this.shape;
    const collarTop = DOME + COLLAR;
    const collarFront = this.collarSection(Math.PI / 2, collarTop - 0.02, new THREE.Vector3()).z;

    // Logo tab hanging from the collar.
    const tab = new THREE.Mesh(new THREE.PlaneGeometry(0.042, 0.3), new THREE.MeshStandardMaterial({ map: logoTabTexture(), roughness: 0.6 }));
    tab.position.set(0.0, collarTop - 0.17, collarFront + 0.065);
    this.group.add(tab);
    this.anchors.tab = tab;

    // Hood cord toggles either side of the collar opening.
    const toggleGeo = new THREE.CapsuleGeometry(0.016, 0.03, 4, 10);
    const cordGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.07, 6);
    for (const side of [1, -1]) {
      const cord = new THREE.Mesh(cordGeo, trimMaterials.cord);
      cord.position.set(side * S.neckRx * 0.72, collarTop + 0.01, collarFront - 0.1);
      this.group.add(cord);
      const tog = new THREE.Mesh(toggleGeo, trimMaterials.toggle);
      tog.position.set(side * S.neckRx * 0.72, collarTop - 0.04, collarFront - 0.08);
      tog.castShadow = true;
      this.group.add(tog);
      this.anchors[side > 0 ? 'hoodToggleR' : 'hoodToggleL'] = tog;
    }

    // Hem cords and toggles (these swing in slice 3).
    for (const side of [1, -1]) {
      const hem = this.torsoPoint(Math.PI / 2 - side * 0.55, -S.L, new THREE.Vector3(), 0);
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.11, 6), trimMaterials.cord);
      cord.position.set(hem.x, -S.L - 0.05, hem.z - 0.03);
      this.group.add(cord);
      const tog = new THREE.Mesh(toggleGeo, trimMaterials.toggle);
      tog.position.set(hem.x, -S.L - 0.12, hem.z - 0.03);
      tog.castShadow = true;
      this.group.add(tog);
      this.anchors[side > 0 ? 'hemToggleR' : 'hemToggleL'] = tog;
    }
  }
}

/** Shell materials use vertex colours for seam shading; plain geometry gets a flat shade. */
function ensureColor(geo: THREE.BufferGeometry, shade = 1) {
  if (geo.getAttribute('color')) return geo;
  const n = geo.getAttribute('position').count;
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3).fill(shade), 3));
  return geo;
}

let tabTex: THREE.CanvasTexture | null = null;
function logoTabTexture() {
  if (tabTex) return tabTex;
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#111';
  g.fillRect(0, 0, 64, 256);
  g.translate(32, 128);
  g.rotate(Math.PI / 2);
  g.fillStyle = '#f2f2f2';
  g.font = '700 17px Syncopate, Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('THE SUPER PUFF™', 0, 1);
  tabTex = new THREE.CanvasTexture(c);
  tabTex.colorSpace = THREE.SRGBColorSpace;
  tabTex.anisotropy = 4;
  return tabTex;
}
