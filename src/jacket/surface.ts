import * as THREE from 'three';

/**
 * Fills `out` with the point at parameter (u, v), both in [0, 1].
 * May return a shade factor (0..1) baked into vertex colours, used to
 * darken quilting seams the way down settles into them.
 */
export type SurfaceFn = (u: number, v: number, out: THREE.Vector3) => number | void;

export interface SurfaceOptions {
  cols: number;
  rows: number;
  /** Closed in u (a tube): normals are welded across the u=0/u=1 seam. */
  wrapU?: boolean;
  /** UV scale so fabric texture density stays roughly constant across parts. */
  uvScale?: [number, number];
  /**
   * A point "inside" the surface near (u, v). Used once to orient the
   * triangles so normals face outward, whatever the parameterisation.
   */
  inside: (u: number, v: number, out: THREE.Vector3) => void;
}

/** Builds an indexed grid surface from a parametric function. */
export function buildSurface(fn: SurfaceFn, o: SurfaceOptions): THREE.BufferGeometry {
  const { cols, rows } = o;
  const [su, sv] = o.uvScale ?? [1, 1];
  const pos = new Float32Array((cols + 1) * (rows + 1) * 3);
  const uv = new Float32Array((cols + 1) * (rows + 1) * 2);
  const col = new Float32Array((cols + 1) * (rows + 1) * 3);
  const p = new THREE.Vector3();

  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      const u = i / cols;
      const v = j / rows;
      const shade = fn(o.wrapU && i === cols ? 0 : u, v, p);
      const k = j * (cols + 1) + i;
      const sh = typeof shade === 'number' ? shade : 1;
      col.set([sh, sh, sh], k * 3);
      pos.set([p.x, p.y, p.z], k * 3);
      uv.set([u * su, v * sv], k * 2);
    }
  }

  const index: number[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i;
      const b = a + 1;
      const d = a + cols + 1;
      const c = d + 1;
      index.push(a, b, d, b, c, d);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(index);
  g.computeVertexNormals();

  // Orient: sample normals against the supplied inside points.
  const n = g.getAttribute('normal') as THREE.BufferAttribute;
  const q = new THREE.Vector3();
  const nv = new THREE.Vector3();
  let score = 0;
  for (let j = 1; j < rows; j += Math.max(1, rows >> 3)) {
    for (let i = 0; i < cols; i += Math.max(1, cols >> 3)) {
      const k = j * (cols + 1) + i;
      p.fromArray(pos, k * 3);
      o.inside(i / cols, j / rows, q);
      nv.fromBufferAttribute(n, k);
      score += Math.sign(nv.dot(p.sub(q)));
    }
  }
  if (score < 0) {
    for (let t = 0; t < index.length; t += 3) {
      const tmp = index[t + 1];
      index[t + 1] = index[t + 2];
      index[t + 2] = tmp;
    }
    g.setIndex(index);
    g.computeVertexNormals();
  }

  if (o.wrapU) weldSeamNormals(g, cols, rows);
  return g;
}

function weldSeamNormals(g: THREE.BufferGeometry, cols: number, rows: number) {
  const n = g.getAttribute('normal') as THREE.BufferAttribute;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  for (let j = 0; j <= rows; j++) {
    const k0 = j * (cols + 1);
    const k1 = k0 + cols;
    a.fromBufferAttribute(n, k0);
    b.fromBufferAttribute(n, k1);
    a.add(b).normalize();
    n.setXYZ(k0, a.x, a.y, a.z);
    n.setXYZ(k1, a.x, a.y, a.z);
  }
  n.needsUpdate = true;
}

/** Quilted baffle profile: 0 at a seam, 1 at the fullest point of a baffle. */
export function baffle(frac: number, softness = 0.5): number {
  const s = Math.sin(Math.PI * THREE.MathUtils.clamp(frac, 0, 1));
  return Math.pow(s, softness);
}

export const smoothstep = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Darkening toward a quilting seam. frac is position within a baffle (0..1). */
export function seamShade(frac: number, depth = 0.32): number {
  const f = frac - Math.floor(frac);
  const d = Math.min(f, 1 - f);
  return 1 - depth + depth * smoothstep(0, 0.2, d);
}
