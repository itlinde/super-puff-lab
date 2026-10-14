import * as THREE from 'three';
import type { FabricId } from '../data/variants';

/**
 * Fabric look-dev. Each in-scope fabric gets a physically based material
 * tuned to Aritzia's description of it:
 *  - cliMATTE™       matte Japanese ripstop
 *  - Rainstop™       waterproof Japanese ripstop, two-layer (slightly stiffer, flatter)
 *  - Hi-Gloss        glossy French taffeta
 *  - Orbit Stretch™  soft-matte stretch
 *  - Liquid Shine    velvety-looking stretch with a sleek sheen
 */
interface FabricLook {
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  sheen: number;
  sheenRoughness: number;
  ripstop: number; // strength of the ripstop grid in the normal map
  wrinkle: number; // strength of soft creasing
  envIntensity: number;
}

const LOOKS: Record<FabricId, FabricLook> = {
  'climatte': { roughness: 0.82, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 0.25, sheenRoughness: 0.8, ripstop: 0.5, wrinkle: 0.55, envIntensity: 0.55 },
  'rainstop': { roughness: 0.74, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 0.15, sheenRoughness: 0.7, ripstop: 0.65, wrinkle: 0.35, envIntensity: 0.6 },
  'hi-gloss': { roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.06, sheen: 0, sheenRoughness: 0.5, ripstop: 0, wrinkle: 0.7, envIntensity: 1.1 },
  'orbit-stretch': { roughness: 0.66, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 0.45, sheenRoughness: 0.55, ripstop: 0, wrinkle: 0.3, envIntensity: 0.6 },
  'liquid-shine': { roughness: 0.38, clearcoat: 0.35, clearcoatRoughness: 0.3, sheen: 1, sheenRoughness: 0.32, ripstop: 0, wrinkle: 0.45, envIntensity: 0.95 },
};

let ripstopTex: THREE.DataTexture | null = null;
let wrinkleTex: THREE.DataTexture | null = null;
const normalCache = new Map<FabricId, THREE.Texture>();

/** Seamless value noise in [0,1]. */
function noise2(size: number, cells: number, seed: number): Float32Array {
  const g = new Float32Array(cells * cells);
  let s = seed;
  for (let i = 0; i < g.length; i++) {
    s = (s * 16807) % 2147483647;
    g[i] = s / 2147483647;
  }
  const out = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const fx = (x / size) * cells;
      const fy = (y / size) * cells;
      const x0 = Math.floor(fx), y0 = Math.floor(fy);
      const tx = fx - x0, ty = fy - y0;
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const at = (i: number, j: number) => g[((j % cells) * cells) + (i % cells)];
      const a = at(x0, y0), b = at(x0 + 1, y0), c = at(x0, y0 + 1), d = at(x0 + 1, y0 + 1);
      out[y * size + x] = a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
    }
  }
  return out;
}

/** Heights -> tangent-space normal map. */
function heightToNormal(h: Float32Array, size: number, strength: number): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  const at = (x: number, y: number) => h[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const n = new THREE.Vector3(-dx, -dy, 1).normalize();
      const k = (y * size + x) * 4;
      data[k] = (n.x * 0.5 + 0.5) * 255;
      data[k + 1] = (n.y * 0.5 + 0.5) * 255;
      data[k + 2] = (n.z * 0.5 + 0.5) * 255;
      data[k + 3] = 255;
    }
  }
  const t = new THREE.DataTexture(data, size, size);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
}

function fabricNormal(id: FabricId): THREE.Texture {
  const cached = normalCache.get(id);
  if (cached) return cached;
  const look = LOOKS[id];
  const size = 256;
  // Ripstop: a fine grid of thicker reinforcement threads over a plain weave.
  const rip = new Float32Array(size * size);
  const grid = 16;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gx = Math.abs(((x % grid) / grid) - 0.5) * 2;
      const gy = Math.abs(((y % grid) / grid) - 0.5) * 2;
      const line = Math.max(Math.pow(gx, 14), Math.pow(gy, 14));
      const weave = ((x + y) % 2) * 0.12;
      rip[y * size + x] = line + weave;
    }
  }
  const wr = noise2(size, 8, 7);
  const wr2 = noise2(size, 21, 13);
  const h = new Float32Array(size * size);
  for (let i = 0; i < h.length; i++) {
    h[i] = rip[i] * look.ripstop * 0.6 + (wr[i] * 0.7 + wr2[i] * 0.3) * look.wrinkle * 1.6;
  }
  const t = heightToNormal(h, size, 1.2);
  normalCache.set(id, t);
  return t;
}

export function makeShellMaterial(fabric: FabricId, colour: string): THREE.MeshPhysicalMaterial {
  const look = LOOKS[fabric];
  const c = new THREE.Color(colour);
  const m = new THREE.MeshPhysicalMaterial({
    color: c,
    roughness: look.roughness,
    metalness: 0,
    clearcoat: look.clearcoat,
    clearcoatRoughness: look.clearcoatRoughness,
    sheen: look.sheen,
    sheenRoughness: look.sheenRoughness,
    sheenColor: c.clone().lerp(new THREE.Color('#ffffff'), 0.45),
    envMapIntensity: look.envIntensity,
    normalMap: fabricNormal(fabric),
    normalScale: new THREE.Vector2(0.45, 0.45),
    side: THREE.FrontSide,
    vertexColors: true,
  });
  return m;
}

/** The inside of the jacket: same colour family, darker, always matte. */
export function makeLiningMaterial(colour: string): THREE.MeshStandardMaterial {
  const c = new THREE.Color(colour).multiplyScalar(0.86);
  return new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, side: THREE.BackSide, envMapIntensity: 0.35, vertexColors: true });
}

export const trimMaterials = {
  knit: new THREE.MeshStandardMaterial({ color: '#1b1b1d', roughness: 0.95 }),
  toggle: new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.45 }),
  cord: new THREE.MeshStandardMaterial({ color: '#202022', roughness: 0.8 }),
};

export function disposeShared() {
  ripstopTex?.dispose();
  wrinkleTex?.dispose();
  normalCache.forEach((t) => t.dispose());
  normalCache.clear();
}
