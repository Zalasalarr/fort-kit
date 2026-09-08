import * as THREE from 'three';
import { Fx, M, knobs, gauge, lidHandle, wheel } from './fx.js';
import { MORE } from './fixtures-more.js';
import { KITCHEN } from './fixtures-kitchen.js';

/* Detailed 3D models for bought fixtures: outdoor kitchen, beds, lighting (more in fixtures-more.js). */

/* ---------- shared bits ---------- */

// Square candle lantern: base, four posts, glass, candle with a flame, optional pyramid roof
function lantern(f, w, h, x, yb, z, { roof = true } = {}) {
  const W = w + .6;
  f.box(W, .6, W, x, yb, z, M.iron);
  f.box(W, .5, W, x, yb + h - .5, z, M.iron);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => f.box(.45, h, .45, x + sx * w / 2, yb, z + sz * w / 2, M.iron));
  f.box(w - .4, h - 1.1, w - .4, x, yb + .6, z, M.glass);
  f.cyl(w * .18, h * .35, x, yb + .6, z, M.candle);
  f.sphere(w * .09, x, yb + .6 + h * .35 + w * .12, z, M.flame, { sy: 1.8 });
  f.sphere(w * .3, x, yb + .6 + h * .35 + w * .1, z, { ...M.bulb, transparent: true, opacity: .35 });
  if (roof) {
    f.cone(W * .78, h * .2, x, yb + h - .1, z, M.iron, { seg: 4, rot: [0, Math.PI / 4, 0] });
    return yb + h - .1 + h * .2;
  }
  return yb + h;
}

function canopy(f, r, h, x, yb, z, ribs = 8) {
  f.cone(r, h, x, yb, z, M.canvas, { seg: ribs });
  f.cone(r * .42, h * .42, x, yb + h * .62, z, M.canvas2, { seg: ribs });
  for (let i = 0; i < ribs; i++) {
    const a = (i / ribs) * Math.PI * 2;
    f.bar(.3, [x, yb + h, z], [x + Math.sin(a) * r, yb + .3, z + Math.cos(a) * r], M.iron, 6);
  }
}

/* ---------- the fixtures ---------- */

export const FIXTURES = {
  grill_drop(f, { L, W }) {
    const body = 13;
    f.box(L, body, W - 1.5, 0, 0, -.75, M.steel);
    f.box(L, 1.2, W - 1.5, 0, body - 1.2, -.75, M.steel2);
    f.box(L - 1, 5, W - 3, 0, body, -1.5, M.steel);
    f.cyl((W - 3) / 2, L - 1, 0, body + 5, -1.5, M.steel, { axis: 'x', sy: .38, center: true });
    lidHandle(f, L - 8, 0, body + 4, W / 2 - 1);
    gauge(f, 0, body + 8, W / 2 - 2.6);
    f.box(L - 2, 5, .6, 0, body - 6.5, W / 2 - 1.05, M.steel2);
    knobs(f, [-12, -4, 4, 12], body - 4, W / 2 - .6);
  },

  grill_cart(f, { W }) {
    f.box(34, 20, 20, 0, 4, 0, M.steel2);
    [-8.5, 8.5].forEach(x => {
      f.box(16.4, 19, .7, x, 4.5, 10.35, M.steel);
      f.cyl(.4, 8, x + (x < 0 ? 6 : -6), 9.5, 11, M.black);
    });
    [[-25, -10], [-25, 10], [25, -10], [25, 10]].forEach(([x, z]) => f.cyl(1, 26, x, 0, z, M.black));
    wheel(f, -24.2, 3.2, -10); wheel(f, 24.2, 3.2, -10);
    f.box(48, .8, 20, 0, 3, 0, M.steel2);
    f.cyl(6, 17, -19, 4, 0, M.tank); f.torus(4.2, .6, -19, 21.4, 0, M.tank);
    [-21.5, 21.5].forEach(x => f.box(9, 1.2, 22, x, 24.4, 0, M.steel2));
    f.box(34, 12, W - 1.5, 0, 26, -.75, M.steel);
    f.box(34, 1.2, W - 1.5, 0, 37, -.75, M.steel2);
    f.box(33, 5, W - 4, 0, 38, -2, M.steel);
    f.cyl((W - 4) / 2, 33, 0, 43, -2, M.steel, { axis: 'x', sy: .3, center: true });
    lidHandle(f, 26, 0, 42, W / 2 - 2);
    gauge(f, 0, 41.5, W / 2 - 3.6);
    f.box(32, 5, .6, 0, 27, W / 2 - 1.05, M.steel2);
    knobs(f, [-11, -3.7, 3.7, 11], 29.5, W / 2 - .6);
  },

  traeger(f) {
    [[-14, -7.5], [-14, 7.5], [8, -7.5], [8, 7.5]].forEach(([x, z]) => f.cyl(.8, 30, x, 0, z, M.black));
    wheel(f, -14, 3, -7.5, 3); wheel(f, -14, 3, 7.5, 3);
    f.box(26, .6, 15, -3, 10, 0, M.grate);
    f.cyl(9, 30, -3, 37, 0, M.black, { axis: 'x', center: true });
    f.torus(9.1, .35, -3, 37, 0, M.iron, { axis: 'x' });
    lidHandle(f, 22, -3, 41.5, 9.7);
    f.box(11, 18, 18, 15, 24, 0, { color: '#2c2e31', metalness: .5, roughness: .45 });
    f.box(11.6, 1, 18.6, 15, 42, 0, M.black);
    f.box(6, 3, .8, 15, 30, 9.3, M.black);
    f.box(3, 1.2, .3, 15, 31, 9.8, M.ember);
    f.cyl(1.6, 9, -12, 45, -3, M.black); f.cyl(2.4, .8, -12, 54.2, -3, M.black);
    f.cyl(2, 4.5, -3, 19, -9, M.steel2);
  },

  kamado(f) {
    [[-8.5, -8.5], [8.5, -8.5], [-8.5, 8.5], [8.5, 8.5]].forEach(([x, z]) => f.cyl(.9, 12, x, 0, z, M.iron));
    f.torus(9.5, .6, 0, 11.2, 0, M.iron); f.torus(9.5, .6, 0, 1, 0, M.iron);
    f.lathe([[3.5, 0], [7, 1], [9.5, 4], [10.8, 9], [11, 13], [10.6, 17], [9, 20.5], [7, 23], [4.5, 25], [2, 26.2], [0, 26.5]], 0, 12, 0, M.ceramic);
    f.torus(10.9, .55, 0, 25, 0, M.iron);
    f.box(3, 3, 2, 0, 23.5, -11, M.iron);
    f.cyl(.5, 9, 0, 31, 9.8, M.black, { axis: 'x', center: true });
    [-4, 4].forEach(x => f.cyl(.4, 2, x, 31, 8.8, M.black, { axis: 'z', center: true }));
    f.cyl(2.6, 1.6, 0, 38.3, 0, M.iron); f.box(2.6, .4, .5, 1.2, 39.9, 0, M.iron);
  },

  pizza_oven(f, { L, W }) {
    f.place(new THREE.BoxGeometry(L / 12, 4 / 12, W / 12), f.tex('brick', L, 4, W), 0, 2, 0);
    f.box(L - 4, 2, W - 2, 0, 4, 0, M.stone);
    f.dome(13.5, 0, 6, -2, M.stucco, .85);
    f.cyl(6.5, 9, 0, 6.5, 9.5, M.stucco, { axis: 'z', center: true });
    f.box(10, 6.5, 1, 0, 6, 13.6, M.soot);
    f.sphere(2.2, 0, 8.4, 11.5, M.ember);
    f.cyl(2.5, 14, -2, 16, -1, M.stucco);
    f.cyl(3.2, 1, -2, 30, -1, M.iron);
    f.cyl(1.8, 5, -2, 31, -1, M.iron);
  },

  ooni(f) {
    [[-9, -6], [9, -6], [0, 7.5]].forEach(([x, z]) => f.cyl(.6, 4, x, 0, z, M.black));
    f.rbox(22, 9, 16, 1.5, 0, 4, 0, { color: '#2a2c2f', metalness: .6, roughness: .4 });
    f.cyl(8, 22, 0, 13, 0, { color: '#2a2c2f', metalness: .6, roughness: .4 }, { axis: 'x', sy: .35, center: true });
    f.box(13, 5, .6, 0, 6, 8.3, { color: '#141414', metalness: .5, roughness: .3 });
    f.cyl(.4, 8, 0, 9.6, 9, M.steel2, { axis: 'x', center: true });
    f.cyl(1.5, 6, -5, 14, -3, M.black); f.cyl(2.2, .7, -5, 19.3, -3, M.black);
  },

  fridge(f, { L, T, W }) {
    f.box(L, T, W - 2, 0, 0, -1, M.steel2);
    f.box(L - 1, T - 3.5, 1.4, 0, 3, W / 2 - 1.3, M.steel);
    f.cyl(.35, 22, 8.5, 7.5, W / 2 - .35, M.steel2);
    [9, 27].forEach(y => f.cyl(.3, 1.2, 8.5, y, W / 2 - .9, M.steel2, { axis: 'z', center: true }));
    f.box(L - 1, 3, .8, 0, 0, W / 2 - 1, M.black);
    [.6, 1.5, 2.4].forEach(y => f.box(L - 3, .3, .3, 0, y, W / 2 - .55, M.steel2));
  },

  sink(f, { L, W }) {
    const h = 8;
    f.box(L, h, 1, 0, 0, -(W / 2 - .5), M.steel); f.box(L, h, 1, 0, 0, W / 2 - .5, M.steel);
    f.box(1, h, W - 2, -(L / 2 - .5), 0, 0, M.steel); f.box(1, h, W - 2, L / 2 - .5, 0, 0, M.steel);
    f.box(L - 2, .8, W - 2, 0, 0, 0, M.steel2);
    f.cyl(1.2, .3, 0, .8, 0, M.iron);
    f.cyl(1.2, .6, 0, h, -(W / 2 - 1.5), M.steel);
    f.cyl(.55, 6.5, 0, h + .6, -(W / 2 - 1.5), M.steel);
    f.torus(3, .5, 0, h + 7.1, -(W / 2 - 1.5) + 3, M.steel, { axis: 'x', arc: Math.PI, rz: 0 });
    f.cyl(.5, 1.5, 0, h + 5.7, -(W / 2 - 1.5) + 6, M.steel);
    f.cyl(.45, 3, 2.6, h + .6, -(W / 2 - 1.5), M.steel, { rot: [0, 0, -.5] });
  },

  stool(f) {
    [[-6.2, -6.2], [6.2, -6.2], [-6.2, 6.2], [6.2, 6.2]].forEach(([x, z]) => f.cyl(.75, 28, x, 0, z, f.tex('wood', 1.5, 28, 1.5)));
    f.place(new THREE.CylinderGeometry(7.8 / 12, 7.2 / 12, 1.8 / 12, 32), f.tex('wood', 16, 2, 16), 0, 28.9, 0);
    f.torus(6.3, .35, 0, 9, 0, M.iron);
    f.torus(6.3, .35, 0, 19, 0, M.iron);
  },

  firepit(f) {
    f.cyl(18, 12, 0, 0, 0, { ...M.iron, side: THREE.DoubleSide }, { rt: 17.6, open: true, seg: 40 });
    f.torus(17.8, .6, 0, 12, 0, M.iron, { seg: 40 });
    f.cyl(17.2, 1, 0, 1, 0, M.gravel, { seg: 40 });
    [0, 2.1, 4.2].forEach((a, i) => f.bar(2.1, [-10 * Math.cos(a), 4 + i * 1.7, -10 * Math.sin(a)], [10 * Math.cos(a), 4 + i * 1.7, 10 * Math.sin(a)], M.log, 12));
    f.cone(6, 9, 0, 5, 0, M.flame, { seg: 8 });
    f.cone(3.5, 12, 1.5, 6, -1, M.flame, { seg: 6 });
    f.sphere(5.5, 0, 6.5, 0, { ...M.ember, transparent: true, opacity: .3 });
  },

  cabdoor(f, { L, W, T }) {
    const u = f.upright();
    u.place(new THREE.BoxGeometry(L / 12, W / 12, .5 / 12), u.tex('wood', L, W, .5), 0, 0, -T / 2 + .25);
    const frame = u.tex('wood', 2.25, W, .25);
    [-1, 1].forEach(s => u.place(new THREE.BoxGeometry(2.25 / 12, W / 12, .25 / 12), frame, s * (L / 2 - 1.125), 0, T / 2 - .125));
    [-1, 1].forEach(s => u.place(new THREE.BoxGeometry((L - 4.5) / 12, 2.25 / 12, .25 / 12), frame, 0, s * (W / 2 - 1.125), T / 2 - .125));
    u.cyl(.32, 5, L / 2 - 2.5, -2.5, T / 2 - .32, M.brass);
  },

  drawer(f, { L, W, T }) {
    const u = f.upright();
    u.place(new THREE.BoxGeometry(L / 12, W / 12, .5 / 12), u.tex('wood', L, W, .5), 0, 0, -T / 2 + .25);
    const frame = u.tex('wood', 1.5, W, .25);
    [-1, 1].forEach(s => u.place(new THREE.BoxGeometry(1.5 / 12, W / 12, .25 / 12), frame, s * (L / 2 - .75), 0, T / 2 - .125));
    [-1, 1].forEach(s => u.place(new THREE.BoxGeometry((L - 3) / 12, 1.5 / 12, .25 / 12), frame, 0, s * (W / 2 - .75), T / 2 - .125));
    u.cyl(.32, 6, 0, 0, T / 2 - .32, M.brass, { axis: 'x', center: true });
  },

  mat_twin: mattress, mat_twinxl: mattress, mat_full: mattress, mat_toddler: mattress,

  pillow(f, { L, W, T }) {
    f.rbox(L, T, W, T / 2 - .1, 0, 0, 0, { color: '#f6f6f3', roughness: 1, metalness: 0 });
  },

  playmat(f, { L, W, T }) {
    const n = 2, cw = L / n, cd = W / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      f.rbox(cw - .4, T, cd - .4, .6, -L / 2 + cw * (i + .5), 0, -W / 2 + cd * (j + .5), { color: (i + j) % 2 ? '#e8b04a' : '#6fa1c9', roughness: 1, metalness: 0 });
    }
  },

  beanbag(f, { L, T }) {
    const r = L / 2;
    f.sphere(r, 0, T * .48, 0, { color: '#c95a5a', roughness: 1, metalness: 0 }, { sy: .62 });
    f.sphere(r * .66, 0, T * .82, 0, { color: '#b84f4f', roughness: 1, metalness: 0 }, { sy: .35 });
  },

  string(f, { L, T }) {
    const sag = T - 4, n = Math.max(6, Math.round(L / 10));
    const yAt = x => T - sag * (1 - Math.pow((2 * x) / L, 2)) - .15;
    for (let i = 0; i < n; i++) {
      const x0 = -L / 2 + (i * L) / n, x1 = -L / 2 + ((i + 1) * L) / n;
      f.bar(.14, [x0, yAt(x0), 0], [x1, yAt(x1), 0], M.black, 6);
    }
    for (let x = -L / 2 + 6; x <= L / 2 - 6; x += 12) {
      const y = yAt(x);
      f.cyl(.5, 1.3, x, y - 1.3, 0, M.black, { rt: .4 });
      f.sphere(.85, x, y - 2.5, 0, M.bulb, { sy: 1.35, seg: 16 });
    }
  },

  lantern_hang(f, { T }) {
    const top = lantern(f, 5, 7, 0, 0, 0);
    f.torus(.7, .15, 0, top + .5, 0, M.iron, { axis: 'x' });
    f.cyl(.2, T - top - 1.2, 0, top + 1.2, 0, M.iron);
  },

  lantern_table(f) {
    const top = lantern(f, 5, 8, 0, 0, 0);
    f.torus(2.2, .2, 0, top, 0, M.iron, { axis: 'z', arc: Math.PI });
  },

  sconce(f, { L, W, T }) {
    const u = f.upright();
    u.box(L - 1, W - 1, .5, 0, -(W - 1) / 2, -T / 2 + .25, M.iron);
    u.box(.6, .6, 1.8, 0, W / 2 - 2, -T / 2 + 1.1, M.iron);
    lantern(u, 4, 8, 0, -4.6, .2);
  },

  pathlight(f) {
    f.cyl(.3, 8, 0, 0, 0, M.iron);
    f.cyl(.5, 4.5, 0, 8, 0, M.iron);
    f.cyl(1.5, 2.2, 0, 12.5, 0, M.bulb);
    f.cone(2.1, 1.3, 0, 14.7, 0, M.iron);
    f.cyl(1.1, .2, 0, 16, 0, M.solar);
  },

  tiki(f) {
    f.cyl(.8, 52, 0, 0, 0, M.bamboo);
    [14, 28, 42].forEach(y => f.torus(.85, .12, 0, y, 0, M.bamboo));
    f.cyl(1.9, 6, 0, 52, 0, M.iron, { rt: 1.6 });
    f.cyl(.35, 1, 0, 58, 0, M.soot);
    f.cone(1.3, 4, 0, 58.5, 0, M.flame, { seg: 8 });
    f.sphere(1.6, 0, 60, 0, { ...M.ember, transparent: true, opacity: .35 });
  },

  umbrella(f, { L, T }) {
    f.cyl(10, 3, 0, 0, 0, M.pole, { rt: 9 });
    f.cyl(1, T - 6, 0, 3, 0, M.iron);
    canopy(f, L / 2 - 1, 13, 0, T - 14, 0);
    f.sphere(1, 0, T - .8, 0, M.iron);
  },

  umbrella_cant(f, { T }) {
    f.box(26, 3, 26, -57, 0, 0, M.pole);
    f.cyl(1.6, T - 7, -57, 3, 0, M.iron);
    f.box(3, 4, 2, -55, 38, 0, M.iron); f.cyl(.3, 3, -53.5, 38, 2, M.iron, { axis: 'z' });
    f.bar(1.2, [-57, T - 4, 0], [-2, T - 4, 0], M.iron);
    f.bar(1.2, [-2, T - 4, 0], [12, T - 11, 0], M.iron);
    canopy(f, 58, 12, 12, T - 23, 0);
  },
};

function mattress(f, { L, W, T }) {
  f.rbox(L, T, W, Math.min(2, T / 2 - .2), 0, 0, 0, { map: 'quilt', repeat: [L / 12, W / 12], color: '#ffffff', roughness: 1, metalness: 0 });
  f.rbox(L + .3, T * .42, W + .3, .8, 0, T * .29, 0, M.border);
}

Object.assign(FIXTURES, MORE, KITCHEN);

// Builds the detailed model for a stock id into `group` (returns false when the stock has none)
export function buildFixture(view, group, stock, mat, dims) {
  const fn = FIXTURES[stock.id];
  if (!fn) return false;
  fn(new Fx(view, group, mat, -dims.T / 2), dims);
  return true;
}
