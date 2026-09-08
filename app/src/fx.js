import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { MATS } from './data.js';
import { realMaterial, flatMaterial, quilt } from './textures.js';

/*
 * Small modelling kit for the detailed fixture models (see fixtures.js).
 * Everything is authored in inches in the piece's own frame: x along the piece's width (L),
 * z along its depth (W, +z is the front), y up with 0 at the underside of the envelope.
 * Wall-mounted items (cabinet doors, sconces) are authored upright with +z pointing away from the wall.
 */

export const M = {
  steel: { color: '#e4e7ea', metalness: .55, roughness: .3 },
  steel2: { color: '#c9cdd1', metalness: .5, roughness: .4 },
  black: { color: '#2e3134', metalness: .35, roughness: .5 },
  iron: { color: '#36393c', metalness: .4, roughness: .65 },
  plastic: { color: '#1b1c1e', metalness: 0, roughness: .85 },
  brass: { color: '#b48d5a', metalness: .9, roughness: .3 },
  glass: { color: '#dfe7ea', metalness: .1, roughness: .05, transparent: true, opacity: .4 },
  grate: { color: '#3a3c3f', metalness: .7, roughness: .5 },
  stone: { color: '#b8bab5', metalness: 0, roughness: .75 },
  stucco: { color: '#c9977a', metalness: 0, roughness: .95 },
  soot: { color: '#241f1c', metalness: 0, roughness: 1 },
  gravel: { color: '#5a4a3c', metalness: 0, roughness: 1 },
  log: { color: '#6b4a2f', metalness: 0, roughness: .95 },
  flame: { color: '#ffb347', glow: '#ff7a1a', metalness: 0, roughness: .6 },
  ember: { color: '#ff8c3a', glow: '#ff5a1a', metalness: 0, roughness: .8 },
  bulb: { color: '#ffe6a3', glow: true, metalness: 0, roughness: .5 },
  candle: { color: '#f3ead6', metalness: 0, roughness: .8 },
  dial: { color: '#f0f0ec', metalness: 0, roughness: .4 },
  tank: { color: '#d9d9d6', metalness: .6, roughness: .5 },
  ceramic: { color: '#3b5f4a', metalness: .1, roughness: .25 },
  canvas: { color: '#c9c2ae', metalness: 0, roughness: 1 },
  canvas2: { color: '#bdb59f', metalness: 0, roughness: 1 },
  pole: { color: '#9a9da0', metalness: .5, roughness: .4 },
  border: { color: '#bcc4d2', metalness: 0, roughness: 1 },
  bamboo: { color: '#a7845a', metalness: 0, roughness: .8 },
  solar: { color: '#2b3a55', metalness: .4, roughness: .3 },
};

const FX_MATS = new Map();
const EDGE_MAT = new THREE.LineBasicMaterial({ color: 0x1d1f20, transparent: true, opacity: .42 });
const UP = new THREE.Vector3(0, 1, 0);

export class Fx {
  constructor(view, group, mat, y0) {
    this.v = view; this.g = group; this.mat = mat; this.y0 = y0;
  }

  // Shared and cached: one model is hundreds of meshes and most reuse the same few materials
  material(spec = {}) {
    if (spec.isMaterial) return spec;
    if (!this.v.real) return flatMaterial(MATS[this.mat].c, spec.side);
    const key = 'x|' + JSON.stringify(spec);
    let m = FX_MATS.get(key);
    if (m) return m;
    const { glow, map, repeat, ...p } = spec;
    if (map === 'quilt') {
      const t = quilt().clone();
      t.repeat.set(...(repeat || [1, 1]));
      t.needsUpdate = true;
      p.map = t;
    }
    m = new THREE.MeshStandardMaterial(p);
    if (glow) { m.emissive = new THREE.Color(glow === true ? p.color : glow); m.emissiveIntensity = 1.1; }
    if (FX_MATS.size > 2000) FX_MATS.clear();
    FX_MATS.set(key, m);
    return m;
  }

  // Textured box material (wood grain, brick courses) at the box's real size
  tex(mat, w, h, d) {
    return this.v.real ? realMaterial(mat, w / 12, h / 12, d / 12) : this.material();
  }

  place(geom, spec, x, y, z, rot, scale) {
    const m = new THREE.Mesh(geom, this.material(spec));
    m.position.set(x / 12, (y + this.y0) / 12, z / 12);
    if (rot) m.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
    if (scale) m.scale.set(scale[0], scale[1], scale[2]);
    if (this.v.real) { m.castShadow = true; m.receiveShadow = true; }
    else {
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(geom, 20), EDGE_MAT);
      e.position.copy(m.position); e.rotation.copy(m.rotation); e.scale.copy(m.scale);
      this.g.add(e);
    }
    this.g.add(m);
    return m;
  }

  box(w, h, d, x, yb, z, spec, rot) {
    return this.place(new THREE.BoxGeometry(w / 12, h / 12, d / 12), spec, x, yb + h / 2, z, rot);
  }

  rbox(w, h, d, r, x, yb, z, spec, rot) {
    return this.place(new RoundedBoxGeometry(w / 12, h / 12, d / 12, 4, Math.min(r, w / 2, h / 2, d / 2) / 12), spec, x, yb + h / 2, z, rot);
  }

  // Vertical cylinder standing on yb; axis 'x' / 'z' lay it flat (yb is then the underside, or the center with o.center)
  cyl(r, h, x, yb, z, spec, o = {}) {
    const rt = o.rt ?? r, seg = o.seg || 24;
    const geom = new THREE.CylinderGeometry(rt / 12, r / 12, h / 12, seg, 1, !!o.open, o.theta0 || 0, o.theta ?? Math.PI * 2);
    const sy = o.sy || 1, scale = o.sy ? [1, sy, 1] : null;
    if (o.axis === 'x') return this.place(geom, spec, x, o.center ? yb : yb + Math.max(r, rt) * sy, z, [0, 0, Math.PI / 2 + (o.rz || 0)], scale && [sy, 1, 1]);
    if (o.axis === 'z') return this.place(geom, spec, x, o.center ? yb : yb + Math.max(r, rt) * sy, z, [Math.PI / 2, 0, 0], scale && [1, 1, sy]);
    return this.place(geom, spec, x, o.center ? yb : yb + h / 2, z, o.rot, scale);
  }

  // A rod between two points [x, y, z] (inches)
  bar(r, a, b, spec, seg = 10) {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const len = A.distanceTo(B);
    const geom = new THREE.CylinderGeometry(r / 12, r / 12, len / 12, seg);
    const m = this.place(geom, spec, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
    const q = new THREE.Quaternion().setFromUnitVectors(UP, B.sub(A).normalize());
    m.quaternion.copy(q);
    if (!this.v.real) this.g.children[this.g.children.length - 2].quaternion.copy(q);
    return m;
  }

  sphere(r, x, yc, z, spec, o = {}) {
    return this.place(new THREE.SphereGeometry(r / 12, o.seg || 24, (o.seg || 24) / 2), spec, x, yc, z, null, [o.sx || 1, o.sy || 1, o.sz || 1]);
  }

  dome(r, x, yb, z, spec, sy = 1) {
    return this.place(new THREE.SphereGeometry(r / 12, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), spec, x, yb, z, null, [1, sy, 1]);
  }

  cone(r, h, x, yb, z, spec, o = {}) {
    return this.place(new THREE.ConeGeometry(r / 12, h / 12, o.seg || 24, 1, !!o.open), spec, x, yb + h / 2, z, o.rot);
  }

  // Ring around a vertical axis by default; axis 'x' / 'z' stand it up
  torus(R, r, x, yc, z, spec, o = {}) {
    const geom = new THREE.TorusGeometry(R / 12, r / 12, 10, o.seg || 32, o.arc ?? Math.PI * 2);
    const rot = o.axis === 'x' ? [0, Math.PI / 2, 0] : o.axis === 'z' ? [0, 0, o.rz || 0] : [Math.PI / 2, 0, 0];
    return this.place(geom, spec, x, yc, z, rot);
  }

  lathe(pts, x, yb, z, spec, seg = 32) {
    return this.place(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r / 12, y / 12)), seg), spec, x, yb, z);
  }

  // Child frame: rotation x = -90° turns an upright drawing (y up, +z out) into the wall-mounted piece frame
  upright() {
    const g = new THREE.Group();
    g.rotation.x = -Math.PI / 2;
    this.g.add(g);
    return new Fx(this.v, g, this.mat, 0);
  }

  // Child frame placed at (x, yb, z) and turned by yaw, so a sub-model can be authored around its own origin
  at(x, yb, z, yaw = 0) {
    const g = new THREE.Group();
    g.position.set(x / 12, (yb + this.y0) / 12, z / 12);
    g.rotation.y = yaw;
    this.g.add(g);
    return new Fx(this.v, g, this.mat, 0);
  }
}

/* ---------- shared appliance details ---------- */

export function knobs(f, xs, y, z, r = 1.1) {
  xs.forEach(x => {
    f.cyl(r, 1.2, x, y, z, M.black, { axis: 'z', center: true });
    f.box(.3, r * 1.2, .3, x, y - r * .6, z + .65, M.steel2);
  });
}

export function gauge(f, x, y, z) {
  f.cyl(1.6, .7, x, y, z, M.black, { axis: 'z', center: true });
  f.cyl(1.2, .2, x, y, z + .45, M.dial, { axis: 'z', center: true });
}

export function lidHandle(f, len, x, y, z) {
  f.cyl(.55, len, x, y, z, M.black, { axis: 'x', center: true });
  f.cyl(.45, 2.4, x - len / 2 + 2, y, z - 1.2, M.black, { axis: 'z', center: true });
  f.cyl(.45, 2.4, x + len / 2 - 2, y, z - 1.2, M.black, { axis: 'z', center: true });
}

export function wheel(f, x, y, z, r = 3.2) {
  f.cyl(r, 1.4, x, y, z, M.plastic, { axis: 'x', center: true });
  f.cyl(r * .45, 1.6, x, y, z, M.steel2, { axis: 'x', center: true });
}
