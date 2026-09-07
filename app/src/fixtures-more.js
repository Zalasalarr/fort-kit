import * as THREE from 'three';
import { M } from './fx.js';

/* Detailed models for patio furniture, garden & yard gear, play equipment and the indoor playroom. */

const P = {
  leaf: { color: '#4f8a3c', roughness: .9, metalness: 0 },
  leaf2: { color: '#6aa84f', roughness: .9, metalness: 0 },
  soil: { color: '#4a3b2c', roughness: 1, metalness: 0 },
  sand: { color: '#d9c69a', roughness: 1, metalness: 0 },
  water: { color: '#4aa3d6', roughness: .12, metalness: .2, transparent: true, opacity: .85 },
  cushion: { color: '#5b7c99', roughness: 1, metalness: 0 },
  cream: { color: '#d8cdb8', roughness: 1, metalness: 0 },
  navy: { color: '#2f4a6b', roughness: 1, metalness: 0 },
  red: { color: '#d94f3d', roughness: .6, metalness: 0 },
  blue: { color: '#3d7bd9', roughness: .6, metalness: 0 },
  yellow: { color: '#f2c744', roughness: .6, metalness: 0 },
  green: { color: '#48a05a', roughness: .6, metalness: 0 },
  orange: { color: '#f08a3c', roughness: .6, metalness: 0 },
  white: { color: '#f3f3f0', roughness: .7, metalness: 0 },
  paint: { color: '#e9dcc4', roughness: .8, metalness: 0 },
  grey: { color: '#8b9198', roughness: .6, metalness: .1 },
  shingle: { color: '#5b4a42', roughness: .95, metalness: 0 },
  terracotta: { color: '#c4785a', roughness: .9, metalness: 0 },
  net: { color: '#e8e8e8', roughness: 1, metalness: 0, transparent: true, opacity: .25, side: THREE.DoubleSide },
  tent: { color: '#3d7bd9', roughness: 1, metalness: 0, transparent: true, opacity: .9, side: THREE.DoubleSide },
  rope: { color: '#c8b48a', roughness: 1, metalness: 0 },
  chain: { color: '#8f9498', roughness: .5, metalness: .8 },
  board: { color: '#2e4a3a', roughness: .9, metalness: 0 },
  rubber: { color: '#2b2d30', roughness: .9, metalness: 0 },
  tube: { color: '#3a8f5c', roughness: .5, metalness: .4 },
  redTube: { color: '#e04b3c', roughness: .5, metalness: .4 },
  barrel: { color: '#2f4a5e', roughness: .7, metalness: .1 },
  composite: { color: '#6b6055', roughness: .8, metalness: 0 },
  wicker: { color: '#8a6a45', roughness: .95, metalness: 0 },
};

const BOOKS = ['#d94f3d', '#3d7bd9', '#f2c744', '#48a05a', '#f08a3c', '#8b53d6', '#f3f3f0'];

/* ---------- helpers ---------- */

function legs(f, w, d, h, t, spec, inset = 0, yb = 0) {
  const x = w / 2 - inset - t / 2, z = d / 2 - inset - t / 2;
  [[-x, -z], [x, -z], [-x, z], [x, z]].forEach(([px, pz]) => f.box(t, h, t, px, yb, pz, spec));
}

// n boards of width bw running along x, spread across depth d
function slats(f, len, d, yb, n, bw, t, spec, x = 0, z = 0) {
  const pitch = d / n;
  for (let i = 0; i < n; i++) f.box(len, t, bw, x, yb, z - d / 2 + pitch * (i + .5), spec);
}

// Two sloped panels meeting at a ridge along x
function gable(f, w, d, yb, rise, spec, over = 2, t = 1) {
  const run = d / 2 + over, len = Math.hypot(run, rise), a = Math.atan2(rise, run);
  f.box(w + over * 2, t, len, 0, yb + rise / 2 - t / 2, -run / 2 + over / 2, spec, [-a, 0, 0]);
  f.box(w + over * 2, t, len, 0, yb + rise / 2 - t / 2, run / 2 - over / 2, spec, [a, 0, 0]);
  f.box(w + over * 2, t * 1.2, 2.5, 0, yb + rise - t * .4, 0, spec);
}

function plant(f, x, yb, z, r, n = 5) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    f.sphere(r * .7, x + Math.cos(a) * r * .5, yb + r * .55 + (i % 2) * r * .25, z + Math.sin(a) * r * .5, i % 2 ? P.leaf : P.leaf2, { seg: 12 });
  }
  f.sphere(r * .6, x, yb + r * .9, z, P.leaf, { seg: 12 });
}

function bin(f, w, h, d, t, x, yb, z, spec, floor = true) {
  f.box(w, h, t, x, yb, z - d / 2 + t / 2, spec); f.box(w, h, t, x, yb, z + d / 2 - t / 2, spec);
  f.box(t, h, d - 2 * t, x - w / 2 + t / 2, yb, z, spec); f.box(t, h, d - 2 * t, x + w / 2 - t / 2, yb, z, spec);
  if (floor) f.box(w - 2 * t, t, d - 2 * t, x, yb, z, spec);
}

function pickets(f, x0, x1, yb, h, bw, gap, spec, z = 0) {
  for (let x = x0 + bw / 2; x <= x1 - bw / 2 + .01; x += bw + gap) f.box(bw, h, .75, x, yb, z, spec);
}

function books(f, x0, yb, z, n, shelfW) {
  const bw = shelfW / n;
  for (let i = 0; i < n; i++) {
    const h = 6 + ((i * 7) % 4) * 1.2;
    f.box(bw - .5, h, 5 + (i % 3), x0 + bw * (i + .5), yb, z, { color: BOOKS[i % BOOKS.length], roughness: .7, metalness: 0 });
  }
}

function chair(f, w, d, seatH, backH, spec, seat = spec) {
  legs(f, w, d, seatH, 1.4, spec, .3);
  f.box(w, 1.5, d, 0, seatH, 0, seat);
  [-1, 1].forEach(s => f.box(1.4, backH - seatH, 1.4, s * (w / 2 - 1), seatH + 1.5, -(d / 2 - .7), spec));
  for (let y = seatH + 5; y < backH - 1; y += 4) f.box(w - 3, 2.6, .8, 0, y, -(d / 2 - .7), spec);
}

function picnic(f, L, W, T, top, seatH) {
  const wood = f.tex('wood', L, 1.5, 5.5);
  slats(f, L, W * .5, top, 5, W * .5 / 5 - .5, 1.5, wood);
  [-1, 1].forEach(s => slats(f, L, W * .2, seatH, 2, W * .1 - .5, 1.5, wood, 0, s * W * .4));
  [-1, 1].forEach(s => {
    const x = s * (L / 2 - 6);
    f.bar(1.6, [x, 0, -W / 2 + 2], [x, top, W * .2], wood, 4);
    f.bar(1.6, [x, 0, W / 2 - 2], [x, top, -W * .2], wood, 4);
    f.box(3, 1.5, W * .5, x, top - 1.5, 0, wood);
    f.box(3, 1.5, W - 2, x, seatH - 1.5, 0, wood);
  });
}

/* ---------- the models ---------- */

export const MORE = {
  /* ----- patio furniture ----- */
  dining_table(f, { L, W, T }) {
    const wood = f.tex('wood', L, 1, 5);
    legs(f, L, W, T - 1.5, 2.5, wood, 2.5);
    f.box(L - 8, 3, 1.5, 0, T - 4.5, -(W / 2 - 3), wood); f.box(L - 8, 3, 1.5, 0, T - 4.5, W / 2 - 3, wood);
    f.box(1.5, 3, W - 8, -(L / 2 - 3), T - 4.5, 0, wood); f.box(1.5, 3, W - 8, L / 2 - 3, T - 4.5, 0, wood);
    slats(f, L, W, T - 1.2, Math.round(W / 5.5), W / Math.round(W / 5.5) - .6, 1.2, wood);
  },

  patio_chair(f, { L, W, T }) {
    chair(f, L, W, 17.5, T, f.tex('wood', 1.4, 20, 1.4), f.tex('wood', L, 1.5, W));
  },

  adirondack(f, { L, W, T }) {
    const wood = f.tex('wood', 4, 30, 1);
    [-1, 1].forEach(s => {
      f.box(3, 20, 1, s * (L / 2 - 2), 0, W / 2 - 4, wood);
      f.box(3, 12, 1, s * (L / 2 - 2), 0, -W / 2 + 6, wood);
      f.box(5, 1, W - 4, s * (L / 2 - 2.5), 22, 0, wood);
    });
    for (let i = 0; i < 5; i++) f.box((L - 8) / 5 - .6, 1, 20, -(L - 8) / 2 + (L - 8) / 5 * (i + .5), 12, 2, wood, [-.2, 0, 0]);
    for (let i = 0; i < 6; i++) f.box((L - 8) / 6 - .6, T - 5, 1, -(L - 8) / 2 + (L - 8) / 6 * (i + .5), 6, -W / 2 + 4, wood, [-.42, 0, 0]);
  },

  lounge(f, { L, W }) {
    [-1, 1].forEach(s => f.box(2, 2, W - 4, s * (L / 2 - 1), 9, 0, M.pole));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => f.cyl(.8, 9, sx * (L / 2 - 1.5), 0, sz * (W / 2 - 6), M.pole));
    f.rbox(L - 2, 4, W * .62, 1.5, 0, 11, W * .19, P.cushion);
    f.rbox(L - 2, 4, W * .34, 1.5, 0, 11 + W * .13, -W * .23, P.cushion, [.87, 0, 0]);
    f.rbox(L - 6, 3, 8, 1.5, 0, 11.5 + W * .23, -W * .31, P.cream, [.87, 0, 0]);
  },

  bench(f, { L, W, T }) {
    const wood = f.tex('wood', L, 1, 5);
    legs(f, L, W, 17, 2, wood, .5);
    slats(f, L, W, 17, 3, W / 3 - 1, 1, wood);
    [-1, 1].forEach(s => { f.box(2, T - 18, 2, s * (L / 2 - 1), 18, -(W / 2 - 1), wood); f.box(2.5, 1.2, W - 2, s * (L / 2 - 1.25), 24, 0, wood); });
    f.box(L - 4, 3, 1, 0, T - 4, -(W / 2 - 1), wood); f.box(L - 4, 3, 1, 0, T - 10, -(W / 2 - 1), wood);
  },

  picnic(f, { L, W, T }) { picnic(f, L, W, T, T - 1.5, 17); },
  kids_picnic(f, { L, W, T }) { picnic(f, L, W, T, T - 1.5, 10); },

  side_table(f, { L, T }) {
    f.place(new THREE.CylinderGeometry(L / 24, L / 24, 1 / 12, 32), f.tex('wood', L, 1, L), 0, T - .5, 0);
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3;
      f.bar(.7, [Math.cos(a) * (L / 2 - 1.5), 0, Math.sin(a) * (L / 2 - 1.5)], [Math.cos(a) * (L / 2 - 5), T - 1, Math.sin(a) * (L / 2 - 5)], M.iron, 8);
    }
    f.torus(L / 2 - 4, .4, 0, T * .45, 0, M.iron);
  },

  porch_swing(f, { L, W, T }) {
    const wood = f.tex('wood', L, 1, 4);
    slats(f, L, W - 4, 18, 4, (W - 4) / 4 - .8, 1, wood, 0, 2);
    for (let i = 0; i < 4; i++) f.box(L, 2.6, 1, 0, 21 + i * 3.4, -(W / 2 - 1.5) - i * .8, wood, [-.25, 0, 0]);
    [-1, 1].forEach(s => {
      f.box(2, 6, 2, s * (L / 2 - 1), 18, W / 2 - 3, wood);
      f.box(3, 1.2, W - 4, s * (L / 2 - 1.5), 24, 0, wood);
      f.bar(.35, [s * (L / 2 - 1.5), 25, W / 2 - 3], [s * (L / 2 - 1.5), T, 0], P.chain, 6);
      f.bar(.35, [s * (L / 2 - 1.5), 25, -(W / 2 - 3)], [s * (L / 2 - 1.5), T, 0], P.chain, 6);
    });
  },

  hammock(f, { L, W, T }) {
    f.box(2, 2, L - 20, 0, 0, 0, M.iron, [0, Math.PI / 2, 0]);
    [-1, 1].forEach(s => {
      f.box(2, 2, W - 12, s * (L / 2 - 14), 0, 0, M.iron);
      f.bar(1, [s * (L / 2 - 12), 1, 0], [s * (L / 2 - 2), T - 2, 0], M.iron);
      [-1, 1].forEach(t => f.bar(.3, [s * (L / 2 - 2), T - 2, 0], [s * (L / 2 - 20), T - 2, t * (W / 2 - 8)], P.rope, 5));
    });
    f.cyl(W / 2 - 6, L - 40, 0, T - 2, 0, { ...P.cream, side: THREE.DoubleSide }, { axis: 'x', center: true, theta0: Math.PI, theta: Math.PI, open: true, sy: .9, seg: 20 });
  },

  rug(f, { L, W, T }) {
    const n = 9, sw = W / n;
    for (let i = 0; i < n; i++) f.box(L, T, sw, 0, 0, -W / 2 + sw * (i + .5), i % 2 ? P.navy : P.cream);
  },

  heater(f, { L, T }) {
    f.cyl(L / 2 - 1, 2, 0, 0, 0, M.iron, { rt: L / 2 - 4 });
    f.cyl(9, 24, 0, 2, 0, M.steel2);
    f.cyl(1.6, T - 38, 0, 26, 0, M.steel2);
    f.cyl(4, 10, 0, T - 12, 0, M.ember, { rt: 3.5 });
    f.cyl(4.6, 10, 0, T - 12, 0, { ...M.grate, transparent: true, opacity: .5, side: THREE.DoubleSide }, { open: true });
    f.cone(L / 2, 3, 0, T - 3, 0, M.steel);
  },

  cooler(f, { L, W, T }) {
    f.rbox(L, T - 4, W, 1, 0, 0, 0, P.white);
    f.rbox(L + .4, 4, W + .4, 1, 0, T - 4, 0, P.blue);
    [-1, 1].forEach(s => f.box(1.5, 3, 8, s * (L / 2 + .2), T - 9, 0, P.blue));
  },

  fire_table(f, { L, W, T }) {
    f.rbox(L, T, W, .6, 0, 0, 0, M.stone);
    f.box(L * .45, .8, W * .45, 0, T - .6, 0, M.soot);
    for (let i = 0; i < 12; i++) f.sphere(1.3, (i % 4 - 1.5) * L * .1, T + .4, (Math.floor(i / 4) - 1) * W * .12, M.grate, { seg: 8 });
    f.cone(4.5, 8, 0, T, 0, M.flame, { seg: 8 }); f.cone(3, 11, 1.5, T + .5, -1, M.flame, { seg: 6 });
  },

  chiminea(f, { T }) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; f.bar(.8, [Math.cos(a) * 9, 0, Math.sin(a) * 9], [Math.cos(a) * 5, 10, Math.sin(a) * 5], M.iron, 8); }
    f.torus(6, .6, 0, 10, 0, M.iron);
    f.lathe([[3, 0], [8, 2], [11, 6], [11.5, 10], [10.5, 15], [8, 19], [5, 22], [3.5, 24], [3.5, T - 14], [4.5, T - 13], [4.5, T - 10.5], [3.8, T - 10]], 0, 10, 0, P.terracotta);
    f.box(7, 6, 2, 0, 18, 10.4, M.soot);
    f.sphere(2, 0, 21, 9.5, M.ember);
  },

  /* ----- garden & yard ----- */
  raised_bed(f, { L, W, T }) {
    const wood = f.tex('wood', L, T, 1.5);
    bin(f, L, T, W, 1.5, 0, 0, 0, wood, false);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => f.box(3.5, T + 1, 3.5, sx * (L / 2 - 1.75), 0, sz * (W / 2 - 1.75), wood));
    f.box(L - 3, 1, W - 3, 0, T - 4, 0, P.soil);
    for (let x = -L / 2 + 10; x < L / 2 - 6; x += 16) for (let z = -W / 2 + 10; z < W / 2 - 6; z += 16) plant(f, x, T - 3, z, 6);
  },

  planter(f, { L, W, T }) {
    bin(f, L, T, W, 1, 0, 0, 0, f.tex('wood', L, T, 1));
    f.box(L - 2, 1, W - 2, 0, T - 3, 0, P.soil);
    for (let x = -L / 2 + 6; x < L / 2 - 3; x += 9) plant(f, x, T - 2, 0, 4);
  },

  pot(f, { L, T }) {
    const r = L / 2;
    f.lathe([[r * .55, 0], [r * .62, .5], [r * .92, T * .55], [r * .96, T * .62], [r, T * .64], [r, T * .68], [r * .9, T * .68], [r * .88, T * .62]], 0, 0, 0, P.terracotta);
    f.cyl(r * .86, .6, 0, T * .62, 0, P.soil);
    plant(f, 0, T * .64, 0, r * .75, 6);
  },

  trellis(f, { L, W, T }) {
    const wood = f.tex('wood', 1, T, .5);
    for (let x = -L / 2 + 2; x <= L / 2 - 2; x += (L - 4) / 4) f.box(1, T - 6, W / 2, x, 6, 0, wood);
    for (let y = 8; y < T; y += (T - 8) / 7) f.box(L, 1, W / 2, 0, y, W / 4, wood);
    [-1, 1].forEach(s => f.box(1.5, 12, 1.5, s * (L / 2 - 2), 0, 0, wood));
  },

  rain_barrel(f, { L, T }) {
    const r = L / 2;
    f.cyl(r, T - 2, 0, 0, 0, P.barrel, { rt: r - .5 });
    [T * .2, T * .55, T * .8].forEach(y => f.torus(r - .1, .5, 0, y, 0, P.barrel));
    f.cyl(r - .3, 2, 0, T - 2, 0, { ...P.barrel, color: '#3a5a70' });
    f.cyl(.8, 2.5, 0, 5, r - .5, M.brass, { axis: 'z', center: true }); f.box(2.5, .4, .4, 0, 5.8, r + .3, M.brass);
  },

  birdbath(f, { L, T }) {
    f.lathe([[8, 0], [8, 1.5], [4, 3], [3, T - 10], [4, T - 7], [6, T - 6]], 0, 0, 0, M.stone);
    f.lathe([[0, 0], [L / 2 - 1, 0], [L / 2, 3.5], [L / 2 - .8, 3.5], [L / 2 - 1.8, 1.2], [0, 1.2]], 0, T - 6, 0, M.stone);
    f.cyl(L / 2 - 1.9, .3, 0, T - 5, 0, P.water);
  },

  fence(f, { L, T }) {
    const wood = f.tex('wood', 5.5, T, .75);
    [-1, 1].forEach(s => f.box(3.5, T, 3.5, s * (L / 2 - 1.75), 0, 0, wood));
    [T * .2, T * .8].forEach(y => f.box(L - 7, 3.5, 1.5, 0, y, -.4, wood));
    pickets(f, -L / 2 + 4.5, L / 2 - 4.5, 2, T - 4, 5.5, 1.5, wood, .8);
  },

  gate(f, { L, T }) {
    const wood = f.tex('wood', 5.5, T, .75);
    [-1, 1].forEach(s => f.box(3, T - 2, 1.5, s * (L / 2 - 1.5), 1, -.4, wood));
    [6, T - 8].forEach(y => f.box(L - 6, 3, 1.5, 0, y, -.4, wood));
    f.bar(1.2, [-(L / 2 - 3), 8, -.4], [L / 2 - 3, T - 8, -.4], wood, 4);
    pickets(f, -L / 2 + 1, L / 2 - 1, 2, T - 4, 4, 1.4, wood, .8);
    [10, T - 10].forEach(y => f.box(6, 2, .6, -(L / 2 - 3), y, .9, M.iron));
    f.box(1.6, 5, .8, L / 2 - 4, T / 2, .9, M.iron);
  },

  shed(f, { L, W, T }) {
    const wallH = T - 18;
    f.box(L, wallH, W, 0, 0, 0, P.paint);
    gable(f, L, W, wallH, 18, P.shingle, 3);
    [-1, 1].forEach(s => f.box(L, .8, 1, 0, wallH - 4, s * (W / 2 + .1), P.white));
    f.box(30, wallH - 6, 1, -L / 4, 0, W / 2, { color: '#7a6a5a', roughness: .8, metalness: 0 });
    f.cyl(.5, 4, -L / 4 + 12, wallH / 2, W / 2 + .8, M.iron);
    f.box(24, 20, .6, L / 4, wallH * .5, W / 2 + .1, M.glass);
    f.box(26, 1.5, .8, L / 4, wallH * .5 + 20, W / 2 + .2, P.white); f.box(26, 1.5, .8, L / 4, wallH * .5 - 1.5, W / 2 + .2, P.white);
    f.box(1.5, 22, .8, L / 4 - 12.5, wallH * .5 - 1, W / 2 + .2, P.white); f.box(1.5, 22, .8, L / 4 + 12.5, wallH * .5 - 1, W / 2 + .2, P.white);
  },

  compost(f, { L, W, T }) {
    for (let y = 0; y < T - 3; y += 5) {
      f.box(L, 3.5, 1.5, 0, y, -(W / 2 - .75), M.plastic); f.box(L, 3.5, 1.5, 0, y, W / 2 - .75, M.plastic);
      f.box(1.5, 3.5, W - 3, -(L / 2 - .75), y, 0, M.plastic); f.box(1.5, 3.5, W - 3, L / 2 - .75, y, 0, M.plastic);
    }
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => f.box(2, T - 2, 2, sx * (L / 2 - 1), 0, sz * (W / 2 - 1), M.plastic));
    f.rbox(L + 1, 2, W + 1, .5, 0, T - 2, 0, M.plastic);
  },

  hose(f, { L, T }) {
    [-1, 1].forEach(s => { f.cyl(4, 1.6, s * (L / 2 - 1.5), 4, 6, M.plastic, { axis: 'x', center: true }); f.bar(1, [s * (L / 2 - 3), 4, 6], [s * (L / 2 - 3), T - 2, -6], M.pole); });
    f.cyl(.9, L - 6, 0, T - 2, -6, M.pole, { axis: 'x', center: true });
    f.box(L - 8, 1, 10, 0, 1, -2, M.pole);
    f.cyl(7, 10, 0, 17, -1, M.plastic, { axis: 'x', center: true });
    f.torus(5.5, 2.5, 0, 17, -1, P.green, { axis: 'x' });
    f.cyl(.9, 8, 0, 17, 5, M.plastic, { axis: 'x', center: true });
  },

  doghouse(f, { L, W, T }) {
    const wallH = T - 10;
    f.box(L, wallH, W - 4, 0, 0, -2, f.tex('wood', L, wallH, W));
    gable(f, L, W - 4, wallH, 10, P.shingle, 2.5);
    f.box(12, 12, 1, 0, 1, W / 2 - 3.5, M.soot);
    f.cyl(6, 1, 0, 13, W / 2 - 3.5, M.soot, { axis: 'z', center: true });
  },

  shower(f, { L, W, T }) {
    const wood = f.tex('wood', L, 5.5, 1);
    slats(f, L, W, 0, 7, W / 7 - .6, 1.6, wood);
    [[-1, -1], [1, -1], [-1, 1]].forEach(([sx, sz]) => f.box(3.5, T - 6, 3.5, sx * (L / 2 - 1.75), 0, sz * (W / 2 - 1.75), wood));
    for (let y = 6; y < T - 12; y += 7) { f.box(L - 7, 5.5, 1, 0, y, -(W / 2 - 1.5), wood); f.box(1, 5.5, W - 7, -(L / 2 - 1.5), y, 0, wood); }
    f.cyl(.5, T - 30, -(L / 2 - 6), 20, -(W / 2 - 1), M.steel);
    f.bar(.5, [-(L / 2 - 6), T - 10, -(W / 2 - 1)], [0, T - 8, -4], M.steel, 8);
    f.cyl(4, 1.2, 0, T - 9.5, -4, M.steel, { rt: 3 });
    f.cyl(1, 1.5, -(L / 2 - 6), 44, -(W / 2 - 2), M.steel, { axis: 'z', center: true });
  },

  /* ----- play & fun ----- */
  swing(f, { L, W, T }) {
    f.cyl(1.5, L, 0, T - 2, 0, P.tube, { axis: 'x', center: true });
    [-1, 1].forEach(s => { f.bar(1.2, [s * (L / 2 - 4), 0, -(W / 2 - 2)], [s * (L / 2 - 4), T - 2, 0], P.tube, 8); f.bar(1.2, [s * (L / 2 - 4), 0, W / 2 - 2], [s * (L / 2 - 4), T - 2, 0], P.tube, 8); });
    [-L / 5, L / 5].forEach(x => {
      f.rbox(18, 1.5, 7, .7, x, 18, 0, P.rubber);
      [-8, 8].forEach(dx => f.bar(.3, [x + dx, 19, 0], [x + dx, T - 2, 0], P.chain, 5));
    });
  },

  slide(f, { L, W, T }) {
    const bedLen = L - 12, a = Math.atan2(T - 10, bedLen), cx = -2;
    f.rbox(bedLen, 1.5, W - 2, .6, cx, T - 6 - (T - 10) / 2 - .75, 0, P.blue, [0, 0, -a]);
    [-1, 1].forEach(s => f.box(bedLen, 6, 1, cx, T - 6 - (T - 10) / 2 + 1.5, s * (W / 2 - .5), P.blue, [0, 0, -a]));
    f.rbox(10, 1.5, W - 2, .6, L / 2 - 5, 6, 0, P.blue);
    [-1, 1].forEach(s => { f.cyl(1, T - 8, -(L / 2 - 8), 0, s * (W / 2 - 3), P.tube); f.cyl(1, 6, L / 2 - 4, 0, s * (W / 2 - 3), P.tube); });
    f.cyl(1, W - 4, -(L / 2 - 8), T - 3, 0, P.tube, { axis: 'z', center: true });
  },

  sandbox(f, { L, W, T }) {
    const wood = f.tex('wood', L, T, 3.5);
    bin(f, L, T, W, 3.5, 0, 0, 0, wood, false);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => f.box(12, 1.2, 12, sx * (L / 2 - 6), T, sz * (W / 2 - 6), wood, [0, Math.PI / 4, 0]));
    f.box(L - 7, T - 3, W - 7, 0, 0, 0, P.sand);
  },

  trampoline(f, { L, T }) {
    const r = L / 2 - 6, matY = 34;
    f.cyl(r, 1.2, 0, matY, 0, P.rubber, { seg: 40 });
    f.torus(r + 3.5, 2.6, 0, matY + 1.2, 0, P.blue, { seg: 40 });
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      [-.12, .12].forEach(d => f.cyl(1.1, matY, Math.cos(a + d) * (r + 2), 0, Math.sin(a + d) * (r + 2), M.pole));
      f.cyl(1, T - matY - 2, Math.cos(a + .5) * (r + 4), matY + 2, Math.sin(a + .5) * (r + 4), M.pole);
    }
    f.cyl(r + 3, T - matY - 4, 0, matY + 3, 0, P.net, { open: true, seg: 40 });
    f.torus(r + 3, .6, 0, T - 1, 0, M.pole, { seg: 40 });
  },

  pool(f, { L, T }) {
    const R = L / 2 - 4;
    f.cyl(R + 1, 1, 0, 0, 0, P.blue, { seg: 40 });
    [[1, 4.2], [T * .55, 4], [T * .82, 3.6]].forEach(([y, r], i) => f.torus(R, r, 0, y, 0, i === 2 ? { ...P.blue, color: '#6aa1e6' } : P.blue, { seg: 40 }));
    f.cyl(R - 3, .5, 0, T * .55, 0, P.water, { seg: 40 });
  },

  hot_tub(f, { L, W, T }) {
    f.rbox(L, T - 2, W, 3, 0, 0, 0, P.composite);
    f.rbox(L, 2.2, W, 2, 0, T - 2.2, 0, { ...P.composite, color: '#8a7f73' });
    f.box(L - 14, .6, W - 14, 0, T - 2.6, 0, P.water);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => f.rbox(16, 1, 16, 1, sx * (L / 2 - 14), T - 6, sz * (W / 2 - 14), { ...P.composite, color: '#b9c3cc' }));
    f.box(8, .5, 5, 0, T - .1, -(W / 2 - 4), M.plastic);
  },

  hoop(f, { L, T }) {
    f.rbox(36, 10, 28, 1.5, 0, 0, -10, M.plastic);
    f.cyl(2, T - 26, 0, 10, -16, M.pole);
    f.bar(1.6, [0, T - 16, -16], [0, T - 10, -4], M.pole, 8);
    f.box(L - 4, 30, 1, 0, T - 32, -4, P.white);
    f.box(L - 8, 1.5, .4, 0, T - 12, -3.4, P.red); f.box(L - 8, 1.5, .4, 0, T - 31, -3.4, P.red);
    [-1, 1].forEach(s => f.box(1.5, 20, .4, s * (L / 2 - 4.5), T - 31, -3.4, P.red));
    f.torus(9, .5, 0, T - 12, 7, P.orange);
    f.cyl(5, 14, 0, T - 27, 7, P.net, { rt: 9, open: true });
  },

  cornhole(f, { L, W, T }) {
    const a = Math.atan2(T - 1, W - 4);
    const wood = f.tex('wood', L, .75, W);
    f.box(L, .75, W, 0, T / 2 - .4, 0, wood, [a, 0, 0]);
    f.place(new THREE.CylinderGeometry(3 / 12, 3 / 12, .3 / 12, 24), M.soot, 0, T / 2 + (W * .28) * Math.sin(a) + .3, -W * .28 * Math.cos(a), [Math.PI / 2 + a, 0, 0]);
    [-1, 1].forEach(s => f.box(1.5, T - 3, 1.5, s * (L / 2 - 2), 0, -(W / 2 - 4), wood));
    for (let i = 0; i < 3; i++) f.rbox(5, 1, 5, .4, -L / 2 + 6 + i * 6, T / 2 + (W * .35) * Math.sin(a) + .3, W * .35, i ? P.blue : P.red, [a, 0, 0]);
  },

  water_table(f, { L, W, T }) {
    legs(f, L, W, T - 5, 1.6, P.blue, 2);
    f.rbox(L, 5, W, 2, 0, T - 5, 0, P.blue);
    f.box(L - 5, .5, W - 5, 0, T - 1.6, 0, P.water);
    f.torus(3, .6, L / 4, T - .2, 0, P.yellow, { axis: 'z' });
    f.cyl(2, 3, -L / 4, T - 1.5, 0, P.red);
  },

  playhouse(f, { L, W, T }) {
    const wallH = T - 18;
    f.box(L, wallH, W, 0, 0, 0, P.paint);
    gable(f, L, W, wallH, 18, { color: '#8b4a3c', roughness: .95, metalness: 0 }, 3);
    f.box(20, wallH - 10, 1, -L / 4, 0, W / 2, P.red);
    f.cyl(.6, 1.5, -L / 4 + 7, 18, W / 2 + .8, M.brass, { axis: 'z', center: true });
    [[L / 4, W / 2], [-L / 2, 0]].forEach(([x, z], i) => {
      const rot = i ? [0, Math.PI / 2, 0] : null;
      f.box(16, 14, .6, x, wallH * .45, z, M.glass, rot);
      f.box(18, 1.5, .8, x, wallH * .45 + 14, z + (i ? 0 : .2), P.white, rot); f.box(18, 1.5, .8, x, wallH * .45 - 1.5, z + (i ? 0 : .2), P.white, rot);
      f.box(1.5, 14, .8, x + (i ? 0 : -8.7), wallH * .45, z + (i ? 8.7 : .2), P.white, rot); f.box(1.5, 14, .8, x + (i ? 0 : 8.7), wallH * .45, z + (i ? -8.7 : .2), P.white, rot);
    });
    [-1, 1].forEach(s => f.box(4, 16, .8, L / 4 + s * 11.5, wallH * .45 - 1, W / 2 + .2, P.green));
    f.place(new THREE.BoxGeometry(8 / 12, 14 / 12, 8 / 12), f.tex('brick', 8, 14, 8), L / 3, wallH + 8, -W / 5);
  },

  spring_rider(f, { L, T }) {
    f.box(14, 1, 14, 0, 0, 0, M.iron);
    for (let y = 1.5; y < 13; y += 2.2) f.torus(2.8, .6, 0, y, 0, M.iron);
    f.sphere(6, 0, T - 9, 0, P.yellow, { sx: 1.9, sy: .85 });
    f.sphere(3.8, L / 2 - 5, T - 4.5, 0, P.yellow, { sx: 1.3 });
    [-1, 1].forEach(s => f.cone(1, 3, L / 2 - 5, T - 1.8, s * 1.8, P.yellow, { seg: 6 }));
    f.cyl(.5, 9, L / 2 - 10, T - 3.5, 0, M.iron, { axis: 'z', center: true });
    f.rbox(7, 1.2, 5, .5, -1, T - 4.4, 0, P.red);
  },

  climbing_dome(f, { L, T }) {
    const R = L / 2, rings = [[R, .5], [R * .83, T * .35], [R * .5, T * .7], [R * .17, T - 1]];
    rings.slice(1).forEach(([r, y]) => f.torus(r, 1, 0, y, 0, P.redTube, { seg: 32 }));
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 + Math.PI / 8;
      for (let k = 0; k < rings.length - 1; k++) {
        const [r0, y0] = rings[k], [r1, y1] = rings[k + 1];
        f.bar(1, [Math.cos(a) * r0, y0, Math.sin(a) * r0], [Math.cos(a) * r1, y1, Math.sin(a) * r1], P.redTube, 8);
      }
    }
  },

  balance_beam(f, { L, W, T }) {
    f.box(L, 4, W - 2, 0, T - 4, 0, f.tex('wood', L, 4, W));
    [-1, 1].forEach(s => f.box(6, T - 4, W, s * (L / 2 - 8), 0, 0, f.tex('wood', 6, 8, 6)));
  },

  tetherball(f, { L, T }) {
    f.cyl(L / 2 - 3, 4, 0, 0, 0, M.plastic, { rt: L / 2 - 5 });
    f.cyl(1, T - 6, 0, 4, 0, M.pole);
    f.bar(.25, [0, T - 3, 0], [L / 2 - 4, T * .6, 4], P.rope, 5);
    f.sphere(4.5, L / 2 - 4, T * .6, 4, P.yellow);
  },

  seesaw(f, { L, W }) {
    f.cone(9, 16, 0, 0, 0, P.tube, { seg: 4, rot: [0, Math.PI / 4, 0] });
    f.cyl(1.2, 12, 0, 15.5, 0, M.pole, { axis: 'z', center: true });
    const a = .17;
    f.box(L, 1.5, W - 4, 0, 16, 0, f.tex('wood', L, 1.5, W), [0, 0, a]);
    [-1, 1].forEach(s => {
      const x = s * (L / 2 - 8), y = 16.75 + x * Math.sin(a);
      f.rbox(10, 1.2, W - 4, .5, x, y + .8, 0, P.red, [0, 0, a]);
      f.torus(3, .5, x - s * 8, y + 5, 0, M.pole, { axis: 'z', arc: Math.PI });
    });
  },

  /* ----- indoor playroom ----- */
  play_kitchen(f, { L, W, T }) {
    f.box(L, 24, W, 0, 0, 0, P.white);
    f.box(L, 1, W, 0, 24, 0, P.cream);
    f.box(L, T - 25, 1.5, 0, 25, -(W / 2 - .75), P.white);
    f.box(L, .8, 5, 0, T - 4, -(W / 2 - 3), P.cream);
    [[-13, -3], [-7, -3], [-13, 3], [-7, 3]].forEach(([x, z]) => f.torus(2, .35, x, 25.2, z, M.plastic));
    f.box(10, .5, 9, 8, 24.6, 0, M.steel2);
    f.cyl(.4, 5, 8, 25, -4, M.steel); f.bar(.4, [8, 30, -4], [8, 29, 0], M.steel, 6);
    f.box(14, 10, .5, -10, 7, W / 2 - .25, M.plastic); f.box(10, 5, .6, -10, 9.5, W / 2 - .2, M.glass);
    [-14, -10, -6].forEach(x => f.cyl(.8, 1, x, 20.5, W / 2 - .2, M.plastic, { axis: 'z', center: true }));
    f.box(14, 20, .5, 8, 2, W / 2 - .25, P.cream); f.sphere(.6, 3, 12, W / 2 + .3, M.plastic);
  },

  cube_storage(f, { L, W, T }) {
    const n = 3, cell = (L - 1) / n, cellH = (T - 1) / n;
    [-1, 1].forEach(s => f.box(1, T, W, s * (L / 2 - .5), 0, 0, P.white));
    for (let i = 0; i <= n; i++) f.box(L, 1, W, 0, Math.min(i * cellH, T - 1), 0, P.white);
    for (let i = 1; i < n; i++) f.box(1, T, W, -L / 2 + i * cell, 0, 0, P.white);
    f.box(L, T, .5, 0, 0, -(W / 2 - .25), P.white);
    [[0, 0, P.blue], [2, 0, P.yellow], [1, 1, P.red], [0, 2, P.green], [2, 2, P.blue]].forEach(([c, r, col]) =>
      f.rbox(cell - 3, cellH - 3, W - 3, .8, -L / 2 + .5 + cell * (c + .5), 1 + r * cellH, 0, col));
    books(f, -L / 2 + .5 + cell * 1 + 1.5, 1 + 2 * cellH, 0, 4, cell - 4);
  },

  bookshelf(f, { L, W, T }) {
    const wood = f.tex('wood', L, 1, W);
    [-1, 1].forEach(s => f.box(1, T, W, s * (L / 2 - .5), 0, 0, wood));
    [0, T / 3, (2 * T) / 3, T - 1].forEach(y => f.box(L - 2, 1, W, 0, y, 0, wood));
    f.box(L, T, .5, 0, 0, -(W / 2 - .25), wood);
    [1, T / 3 + 1, (2 * T) / 3 + 1].forEach((y, i) => books(f, -L / 2 + 1.5, y, 0, 6 + i, L - 3 - i * 3));
  },

  teepee(f, { L, T }) {
    const r = L / 2 - 2, h = T - 7;
    f.cone(r, h, 0, 0, 0, M.canvas, { seg: 5 });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      f.bar(.6, [Math.sin(a) * (r + 1), 0, Math.cos(a) * (r + 1)], [-Math.sin(a) * 3, T, -Math.cos(a) * 3], M.bamboo, 6);
    }
    f.box(10, h * .5, .5, 0, 0, r * .74, M.soot, [-Math.atan2(r, h), 0, 0]);
  },

  ballpit(f, { L, W, T }) {
    const wallH = T - 4;
    [-1, 1].forEach(s => { f.rbox(L, wallH, 6, 2, 0, 0, s * (W / 2 - 3), P.blue); f.rbox(6, wallH, W - 12, 2, s * (L / 2 - 3), 0, 0, P.blue); });
    f.box(L - 12, 1, W - 12, 0, 0, 0, P.cream);
    let k = 0;
    for (let x = -L / 2 + 9; x < L / 2 - 6; x += 5.2) for (let z = -W / 2 + 9; z < W / 2 - 6; z += 5.2) {
      f.sphere(2.4, x + (k % 3) * .6, 3.4 + (k % 2) * 2.2, z, [P.red, P.blue, P.yellow, P.green][k % 4], { seg: 10 });
      k++;
    }
  },

  pikler(f, { L, W, T }) {
    const wood = f.tex('wood', 1.8, T, 1.8);
    [-1, 1].forEach(s => {
      [-1, 1].forEach(t => f.bar(.9, [t * (L / 2 - 1), 0, s * (W / 2 - 1)], [t * (L / 2 - 1), T - 1, 0], wood, 8));
      for (let k = 1; k <= 5; k++) {
        const u = k / 6;
        f.cyl(.7, L - 2, 0, (T - 1) * u, s * (W / 2 - 1) * (1 - u), wood, { axis: 'x', center: true, seg: 10 });
      }
    });
    f.cyl(.8, L - 2, 0, T - 1, 0, wood, { axis: 'x', center: true, seg: 10 });
  },

  rocking_horse(f, { L, W, T }) {
    const wood = f.tex('wood', L, 1, 2);
    [-1, 1].forEach(s => f.torus(L / 2 - 2, .9, 0, L / 2 - 2, s * (W / 2 - 1), wood, { axis: 'z', arc: 1.9, rz: Math.PI + .62 }));
    f.box(4, 1, W, -6, 1.5, 0, wood); f.box(4, 1, W, 6, 1.5, 0, wood);
    f.sphere(5, 0, T - 11, 0, wood, { sx: 1.7, sy: .9 });
    [[-6, -1], [6, -1], [-6, 1], [6, 1]].forEach(([x, s]) => f.bar(.8, [x, 2, s * (W / 2 - 1)], [x * .6, T - 12, s * 2], wood, 6));
    f.sphere(3.5, 9, T - 4, 0, wood, { sx: 1.3 });
    [-1, 1].forEach(s => f.cone(1, 2.5, 9, T - 1.5, s * 1.6, wood, { seg: 6 }));
    f.cyl(.45, 9, 7, T - 5, 0, M.iron, { axis: 'z', center: true });
    f.rbox(8, 1, 5, .4, -2, T - 8, 0, P.red);
  },

  easel(f, { L, W, T }) {
    const wood = f.tex('wood', 1.5, T, 1.5);
    [-1, 1].forEach(s => [-1, 1].forEach(t => f.bar(.8, [s * (L / 2 - 1), 0, t * (W / 2 - 1)], [s * (L / 2 - 2), T, 0], wood, 6)));
    const a = Math.atan2(W / 2 - 1, T), zc = (W / 2 - 1) * (1 - 27 / T);
    f.box(L - 2, 26, .8, 0, 14, zc + .5, P.white, [-a, 0, 0]);
    f.box(L - 2, 26, .8, 0, 14, -zc - .5, P.board, [a, 0, 0]);
    f.box(L - 2, 1, 3, 0, 12, zc + 3.5, wood, [-a, 0, 0]);
    f.cyl(.5, L - 2, 0, T + .2, 0, wood, { axis: 'x', center: true, seg: 8 });
  },

  kids_table(f, { L, W, T }) {
    legs(f, L, W, T - 1.5, 1.6, P.white, 1.5);
    f.rbox(L, 1.5, W, 2, 0, T - 1.5, 0, f.tex('wood', L, 1.5, W));
  },

  kids_chair(f, { L, W, T }) {
    legs(f, L, W, T / 2 - 1, 1.2, P.white, .3);
    f.rbox(L, 1, W, 1, 0, T / 2 - 1, 0, f.tex('wood', L, 1, W));
    [-1, 1].forEach(s => f.box(1.2, T / 2, 1.2, s * (L / 2 - .9), T / 2, -(W / 2 - .6), P.white));
    f.rbox(L - 1, 4.5, .8, .4, 0, T - 5, -(W / 2 - .6), f.tex('wood', L, 4.5, 1));
  },

  toy_chest(f, { L, W, T }) {
    f.box(L, T - 2.5, W, 0, 0, 0, f.tex('wood', L, T, W));
    f.rbox(L + 1, 2.5, W + 1, .5, 0, T - 2.5, 0, f.tex('wood', L, 2.5, W));
    f.box(3, 2.5, .6, 0, T - 6, W / 2 + .1, M.brass);
    f.box(L * .4, .8, .3, 0, T / 2 + 1, W / 2 + .1, P.cream);
  },

  play_rug(f, { L, T }) {
    [[1, P.blue], [.78, P.cream], [.56, P.green], [.34, P.yellow], [.14, P.red]].forEach(([k, col], i) => f.cyl(L / 2 * k, T + i * .04, 0, 0, 0, col, { seg: 48 }));
  },

  floor_cushion(f, { L, W, T }) {
    f.rbox(L, T, W, T / 2 - .2, 0, 0, 0, P.cushion);
    f.sphere(.8, 0, T - .3, 0, P.cream, { seg: 10 });
  },

  sensory_swing(f, { L, T }) {
    const r = L / 2 - 2;
    f.lathe([[0, 0], [r * .55, 0], [r * .9, 6], [r, 12], [r * .9, 16], [r * .75, 18]], 0, T - 56, 0, { ...P.blue, side: THREE.DoubleSide }, 24);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; f.bar(.35, [Math.cos(a) * r * .75, T - 38, Math.sin(a) * r * .75], [0, T - 18, 0], P.rope, 5); }
    f.sphere(1.5, 0, T - 18, 0, M.iron, { seg: 10 });
    f.cyl(.5, 18, 0, T - 18, 0, P.rope, { seg: 8 });
  },

  tunnel(f, { L, W }) {
    const r = W / 2;
    f.cyl(r, L, 0, 0, 0, P.tent, { axis: 'x', open: true, seg: 24 });
    for (let x = -L / 2 + 2; x <= L / 2 - 2; x += (L - 4) / 5) f.torus(r, .4, x, r, 0, P.rubber, { axis: 'x', seg: 24 });
  },

  chalkboard(f, { L, W, T }) {
    const u = f.upright();
    u.box(L - 1.5, W - 1.5, .5, 0, -(W - 1.5) / 2, -T / 2 + .25, P.board);
    const wood = u.tex('wood', L, 1.5, T);
    [-1, 1].forEach(s => { u.box(L, 1.5, T, 0, s * (W / 2 - .75) - .75, 0, wood); u.box(1.5, W - 3, T, s * (L / 2 - .75), -(W / 2 - 1.5), 0, wood); });
    u.box(L * .5, .8, 2, 0, -(W / 2 - 1.5), T / 2 + .5, wood);
    [-3, 0, 3].forEach((x, i) => u.cyl(.35, 2.5, x, -(W / 2 - .5), T / 2 + .8, [P.white, P.yellow, P.blue][i], { axis: 'x', center: true, seg: 8 }));
  },

  foam_blocks(f, { L, W, T }) {
    const s = T;
    f.rbox(s, s, s, .6, -L / 2 + s / 2, 0, W / 2 - s / 2, P.red);
    f.rbox(s, s / 2, s, .6, -L / 2 + s / 2, 0, -W / 2 + s / 2, P.blue);
    f.cyl(s / 2, s, 0, 0, W / 2 - s / 2, P.yellow, { seg: 20 });
    f.cone(s / 2, s, 0, 0, -W / 2 + s / 2, P.green, { seg: 3, rot: [0, Math.PI / 6, 0] });
    f.cyl(s / 2, s, L / 2 - s / 2, 0, 0, P.blue, { axis: 'x', center: true, theta0: 0, theta: Math.PI, seg: 16 });
    f.rbox(s / 2, s / 2, s / 2, .4, L / 2 - s / 2, s / 2, 0, P.orange);
  },

  train_table(f, { L, W, T }) {
    const wood = f.tex('wood', L, 2, W);
    legs(f, L, W, T - 2, 2.5, wood, 1);
    f.box(L, 1.2, W, 0, T - 2, 0, wood);
    f.box(L - 2, .5, W - 2, 0, T - .8, 0, P.green);
    f.torus(Math.min(L, W) / 2 - 4, .7, 0, T - .2, 0, P.grey, { seg: 40 });
    [[0, P.red], [.35, P.blue], [.7, P.yellow]].forEach(([a, col]) => { const R = Math.min(L, W) / 2 - 4; f.rbox(4, 2.5, 2.5, .4, Math.cos(a) * R, T - .2, Math.sin(a) * R, col, [0, -a, 0]); });
  },

  mini_tramp(f, { L, T }) {
    const r = L / 2 - 3;
    f.cyl(r, 1, 0, 8.5, 0, P.rubber, { seg: 32 });
    f.torus(r + 1.5, 1.4, 0, 9, 0, P.blue, { seg: 32 });
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; f.cyl(.8, 8.5, Math.cos(a) * r, 0, Math.sin(a) * r, M.pole); }
    [-1, 1].forEach(s => f.bar(.8, [s * (r - 2), 9, -r * .5], [s * (r - 2), T - 1, -r * .5], M.pole, 8));
    f.cyl(.9, r * 2 - 4, 0, T - 1, -r * .5, P.rubber, { axis: 'x', center: true });
  },

  puppet(f, { L, W, T }) {
    [-1, 1].forEach(s => { f.box(3, T, 1, s * (L / 2 - 1.5), 0, 0, P.red); f.box(3, 1.2, W, s * (L / 2 - 1.5), 0, 0, P.red); });
    f.box(L - 6, 22, 1, 0, 0, 0, P.red);
    f.box(L, T * .18, 1, 0, T - T * .18, 0, P.red);
    f.box(L - 8, 2, .6, 0, T * .55, .8, P.yellow);
    [-1, 1].forEach(s => f.box(7, T * .82 - 22, .8, s * (L / 2 - 6.5), 22, .8, P.yellow));
    f.box(L - 6, 1, 8, 0, 21, 0, P.cream);
  },

  dollhouse(f, { L, W, T }) {
    const wallH = T - 9;
    f.box(L, .8, W, 0, 0, 0, P.white);
    f.box(L, wallH, .6, 0, 0, -(W / 2 - .3), { color: '#f3e3e6', roughness: .8, metalness: 0 });
    [-1, 1].forEach(s => f.box(.6, wallH, W, s * (L / 2 - .3), 0, 0, P.white));
    f.box(L, .6, W, 0, wallH / 2, 0, P.white);
    f.box(.6, wallH / 2 - .6, W, 3, .8, 0, P.white);
    gable(f, L, W, wallH, 9, { color: '#7a5a4a', roughness: .9, metalness: 0 }, 1, .6);
    f.rbox(4, 1.5, 3, .3, -8, .8, 2, P.blue); f.rbox(3, 2.5, 2, .3, 9, wallH / 2 + .6, -3, P.red); f.rbox(5, 1, 3, .3, -6, wallH / 2 + .6, 1, P.yellow);
  },

  indoor_slide(f, { L, W, T }) {
    const bedLen = L - 16, a = Math.atan2(T - 7, bedLen);
    f.rbox(bedLen, 1.2, W - 2, .5, 2, (T - 7) / 2 + 2, 0, P.green, [0, 0, -a]);
    [-1, 1].forEach(s => f.box(bedLen, 4, 1, 2, (T - 7) / 2 + 3.5, s * (W / 2 - .5), P.green, [0, 0, -a]));
    f.rbox(10, 1.5, W, .5, -(L / 2 - 5), T - 5, 0, P.blue);
    [1, 2, 3].forEach(i => f.rbox(8, 1.5, W, .5, -(L / 2 - 5) - 0, (T - 5) * i / 4, 0, P.blue));
    [-1, 1].forEach(s => { f.box(1.5, T - 5, 1.5, -(L / 2 - 1), 0, s * (W / 2 - 1), P.blue); f.box(1.5, T - 5, 1.5, -(L / 2 - 9), 0, s * (W / 2 - 1), P.blue); });
    f.cyl(.8, W, -(L / 2 - 5), T - 1, 0, P.blue, { axis: 'z', center: true });
  },
};
