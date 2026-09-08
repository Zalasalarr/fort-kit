import * as THREE from 'three';
import { M, knobs, gauge, wheel } from './fx.js';

/* The rest of the outdoor kitchen: more cookers, cold storage, drink stations and prep gear. */

const K = {
  cast: { color: '#2b2d2f', metalness: .35, roughness: .7 },
  griddle: { color: '#3b3d40', metalness: .55, roughness: .35 },
  copper: { color: '#b06a3c', metalness: .85, roughness: .35 },
  enamel: { color: '#1f2a33', metalness: .2, roughness: .3 },
  red: { color: '#a8362c', metalness: .3, roughness: .45 },
  galv: { color: '#b6bcc2', metalness: .7, roughness: .45 },
  wood: { color: '#b08a5c', metalness: 0, roughness: .8 },
  block: { color: '#c09a68', metalness: 0, roughness: .7 },
  ice: { color: '#dbe9f2', metalness: .1, roughness: .2, transparent: true, opacity: .9 },
  beer: { color: '#c8862a', metalness: 0, roughness: .3, transparent: true, opacity: .9 },
  wine: { color: '#4a1f2b', metalness: 0, roughness: .3 },
  green: { color: '#2f5d3a', metalness: 0, roughness: .35 },
  brown: { color: '#5a3a22', metalness: 0, roughness: .35 },
  screen: { color: '#0d1013', metalness: .3, roughness: .15 },
  screenOn: { color: '#20415e', metalness: .1, roughness: .2 },
  label: { color: '#e8e2d4', metalness: 0, roughness: .8 },
  grease: { color: '#8a8d90', metalness: .6, roughness: .4 },
};

const BOTTLES = [K.green, K.brown, K.beer, K.green, K.brown];

/* ---------- small parts ---------- */

// A drink bottle standing on yb
function bottle(f, x, yb, z, h, spec, r = 1.3) {
  f.cyl(r, h * .62, x, yb, z, spec, { seg: 12 });
  f.cyl(r * .45, h * .2, x, yb + h * .62, z, spec, { rt: r * .38, seg: 10 });
  f.cyl(r * .38, h * .18, x, yb + h * .82, z, spec, { seg: 10 });
  f.cyl(r * .42, h * .06, x, yb + h * .94, z, M.steel2, { seg: 10 });
}

// Cast-iron cooking grate: bars running along x
function grate(f, w, d, y, z = 0, x = 0, bars = 7, spec = K.cast) {
  const pitch = d / bars;
  for (let i = 0; i < bars; i++) f.box(w, .45, .55, x, y, z - d / 2 + pitch * (i + .5), spec);
}

// Round burner ring with its spokes
function burner(f, x, y, z, r) {
  f.torus(r, .32, x, y + .3, z, K.cast, { seg: 20 });
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    f.bar(.18, [x, y + .3, z], [x + Math.cos(a) * r, y + .3, z + Math.sin(a) * r], K.cast, 6);
  }
  f.cyl(r * .3, .5, x, y, z, K.cast, { seg: 12 });
}

// Stainless door with a bar handle, hinged on the left
function door(f, w, h, x, yb, z, handle = true) {
  f.box(w, h, 1.2, x, yb, z, M.steel);
  if (handle) {
    f.cyl(.3, h - 6, x + w / 2 - 2.5, yb + 3, z + .9, M.steel2, { seg: 10 });
    [yb + 4, yb + h - 4].forEach(y => f.cyl(.26, 1.4, x + w / 2 - 2.5, y, z + .25, M.steel2, { axis: 'z', center: true, seg: 8 }));
  }
}

// Drawer front with a full-width bar pull
function drawerFront(f, w, h, x, yb, z) {
  f.box(w, h, 1.2, x, yb, z, M.steel);
  f.cyl(.3, w - 6, x, yb + h / 2, z + .9, M.steel2, { axis: 'x', center: true, seg: 10 });
  [-1, 1].forEach(s => f.cyl(.26, 1.4, x + s * (w / 2 - 3), yb + h / 2, z + .25, M.steel2, { axis: 'z', center: true, seg: 8 }));
}

// Four legs and a lower shelf, the frame most carts sit on
function cart(f, L, W, h, spec = M.black, inset = 3) {
  const x = L / 2 - inset, z = W / 2 - 3;
  [[-x, -z], [x, -z], [-x, z], [x, z]].forEach(([px, pz]) => f.cyl(.9, h, px, 0, pz, spec, { seg: 10 }));
  f.box(L - inset * 2, .8, W - 5, 0, h * .3, 0, M.steel2);
}

/* ---------- the fixtures ---------- */

export const KITCHEN = {
  griddle(f, { L, W }) {
    cart(f, L - 12, W, 26);
    wheel(f, -(L / 2 - 8), 3.2, -(W / 2 - 4), 3.2); wheel(f, L / 2 - 8, 3.2, -(W / 2 - 4), 3.2);
    f.box(L - 12, 10, W - 2, 0, 26, 0, M.steel);
    // flat cooking surface with a slight lip and the grease chute at the back
    f.box(L - 14, 1.4, W - 5, 0, 36, .5, K.griddle);
    [-1, 1].forEach(s => f.box(.8, 2.2, W - 5, s * (L / 2 - 7.4), 36, .5, M.steel2));
    f.box(L - 14, 2.2, .8, 0, 36, -(W / 2 - 2.4), M.steel2);
    f.box(6, 1, 3, 0, 35.6, W / 2 - 3.6, K.grease);
    f.cyl(2, 3.5, 0, 30, W / 2 - 1, K.grease, { seg: 14 });
    // hood, folded back
    f.box(L - 14, .8, W - 6, 0, 44, -3, M.steel2, [-.5, 0, 0]);
    [-1, 1].forEach(s => f.box(.8, 8, 8, s * (L / 2 - 7), 37, -(W / 2 - 3), M.steel2, [-.5, 0, 0]));
    [-1, 1].forEach(s => f.box(10, 1.2, W - 4, s * (L / 2 - 1), 30, 0, M.steel2));
    knobs(f, [-6, 0, 6], 30, W / 2 - .6);
    f.box(L - 20, 4, .6, 0, 27.5, W / 2 - 1.05, M.steel2);
  },

  kettle(f) {
    // three splayed legs, two of them on wheels
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3 + .5;
      f.bar(.5, [Math.cos(a) * 10, 0, Math.sin(a) * 10], [Math.cos(a) * 5, 17, Math.sin(a) * 5], M.black, 8);
    }
    wheel(f, -8.6, 3, 5, 3); wheel(f, 8.6, 3, 5, 3);
    // bowl: the lower half of a sphere, its rim at 27
    f.place(new THREE.SphereGeometry(11 / 12, 26, 13, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), f.material(K.enamel), 0, 27, 0);
    f.cyl(9.6, .5, 0, 24.5, 0, K.cast, { seg: 20 });
    f.torus(11, .55, 0, 27, 0, M.black, { seg: 28 });
    // ash catcher slung under the bowl
    f.cyl(5.5, 3.5, 0, 12.5, 0, M.steel2, { rt: 4.5, seg: 16 });
    // domed lid with its handle and vent
    f.dome(11, 0, 27, 0, K.enamel, .82);
    f.cyl(1.5, 1.1, 0, 35.8, 0, M.black, { seg: 12 });
    [-3.2, 3.2].forEach(x => f.cyl(.4, 2.4, x, 36.4, 0, M.black, { seg: 8 }));
    f.cyl(.45, 8, 0, 38.6, 0, M.black, { axis: 'x', center: true, seg: 10 });
    f.box(3.4, .7, 1.8, 0, 26.4, 11, M.black);
  },

  santa_maria(f, { L, W, T }) {
    // firebox on legs
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => f.box(2, 22, 2, sx * (L / 2 - 2), 0, sz * (W / 2 - 2), M.black));
    f.box(L - 2, 12, W - 2, 0, 22, 0, M.black);
    f.box(L - 5, 1, W - 5, 0, 23, 0, M.soot);
    f.box(L - 5, 3, W - 5, 0, 24, 0, M.soot);
    [-6, 0, 6].forEach(x => f.cyl(2.4, 16, x, 25, 0, M.log, { axis: 'x', center: true, seg: 10 }));
    f.cone(5, 8, 0, 26, 0, M.flame, { seg: 8 });
    f.cone(3.5, 11, 4, 27, -2, M.flame, { seg: 6 });
    // upright post with the crank wheel, and the grate it lifts
    f.box(3, T - 22, 3, -(L / 2 - 1.5), 22, -(W / 2 - 1.5), M.black);
    f.box(3, T - 22, 3, L / 2 - 1.5, 22, -(W / 2 - 1.5), M.black);
    f.box(L, 2.5, 2.5, 0, T - 2.5, -(W / 2 - 1.5), M.black);
    f.torus(5, .5, L / 2 - 1.5, T - 12, -(W / 2 - 5), M.black, { axis: 'z', seg: 20 });
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; f.bar(.3, [L / 2 - 1.5, T - 12 - Math.sin(a) * 5, -(W / 2 - 5) - Math.cos(a) * 5], [L / 2 - 1.5, T - 12 + Math.sin(a) * 5, -(W / 2 - 5) + Math.cos(a) * 5], M.black, 6); }
    f.cyl(.7, 3, L / 2 - 1.5, T - 12, -(W / 2 - 8), M.black, { axis: 'z', center: true, seg: 8 });
    [-1, 1].forEach(s => f.bar(.22, [s * (L / 2 - 3), T - 3, -(W / 2 - 1.5)], [s * (L / 2 - 3), 36, 0], M.steel2, 6));
    f.box(L - 8, .8, W - 6, 0, 36, 1, K.cast);
    grate(f, L - 8, W - 6, 36.8, 1, 0, 8);
  },

  smoker_cab(f, { L, W, T }) {
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => f.cyl(.8, 8, sx * (L / 2 - 2), 0, sz * (W / 2 - 2), M.black, { seg: 8 }));
    f.rbox(L, T - 14, W, 1.5, 0, 8, 0, M.black);
    door(f, L - 4, T - 24, 0, 13, W / 2 - .2);
    gauge(f, -6, T - 12, W / 2 + .3);
    f.box(6, 3, .8, 6, T - 13.5, W / 2 + .3, M.black);
    f.box(2.5, 1.2, .5, 6, T - 12.9, W / 2 + .8, K.red);
    // firebox vent and chimney
    f.cyl(2.2, 4, 0, 10, W / 2 - .5, M.black, { axis: 'z', center: true, seg: 12 });
    f.cyl(1.8, 8, 0, T - 6, -3, M.black, { seg: 14 });
    f.cyl(2.6, .8, 0, T + 2, -3, M.black, { seg: 14 });
    f.box(L - 2, 1.2, W - 2, 0, T - 6.2, 0, M.steel2);
  },

  side_burner(f, { L, W, T }) {
    f.box(L, T - 2, W - 1.5, 0, 0, -.75, M.steel);
    f.box(L - 1, 1, W - 3, 0, T - 2, -.75, M.steel2);
    burner(f, -L / 4, T - 1.6, -1, 3.2);
    burner(f, L / 4, T - 1.6, -1, 3.2);
    grate(f, L - 5, W - 6, T + .6, -1, 0, 5);
    knobs(f, [-4, 4], T - 6, W / 2 - .6, .9);
    // the lid, folded up behind
    f.box(L - 1, .7, W - 3, 0, T + 5, -(W / 2 + .5), M.steel2, [-1.2, 0, 0]);
  },

  wok_burner(f, { L, W, T }) {
    f.box(L, T - 4, W - 1.5, 0, 0, -.75, M.steel);
    f.box(L - 1, 1, W - 3, 0, T - 4, -.75, M.steel2);
    burner(f, 0, T - 3.6, -1, 5.5);
    f.torus(7, .7, 0, T - 1.2, -1, K.cast, { seg: 24 });
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4;
      f.box(6, .8, 1.2, Math.cos(a) * 4, T - 1.6, -1 + Math.sin(a) * 4, K.cast, [0, -a, 0]);
    }
    knobs(f, [0], T - 8, W / 2 - .6, 1);
  },

  kegerator(f, { L, W, T }) {
    const body = T - 8;
    f.box(L, body, W - 2, 0, 0, -1, M.steel2);
    door(f, L - 1, body - 4, 0, 2, W / 2 - .9);
    f.box(L - 1, 2, .8, 0, 0, W / 2 - 1, M.black);
    // tap tower with two faucets and a drip tray
    f.cyl(2.4, 10, 0, body, -2, M.steel, { seg: 18 });
    f.cyl(3.2, 1, 0, body, -2, M.steel2, { seg: 18 });
    [-1, 1].forEach(s => {
      const x = s * 1.6;
      f.cyl(.55, 4.5, x, body + 5.5, -2, M.steel2, { axis: 'z', center: true, seg: 10 });
      f.cyl(.5, 2.6, x, body + 4.1, .1, M.steel2, { seg: 10 });
      f.bar(.3, [x, body + 6.2, -2.4], [x + s * 1.6, body + 9, -2.4], M.black, 8);
      f.sphere(.7, x + s * 1.9, body + 9.3, -2.4, M.black, { seg: 10 });
    });
    f.box(9, .8, 4, 0, body, 1.4, M.steel2);
    f.box(8, .3, 3.2, 0, body + .8, 1.4, K.grease);
  },

  ice_bin(f, { L, W, T }) {
    f.box(L, T - 2, W, 0, 0, 0, M.steel2);
    f.box(L - 3, 1, W - 3, 0, 1, 0, M.steel);
    // crushed ice with bottles pushed into it
    f.box(L - 4, 4, W - 4, 0, 2, 0, K.ice);
    for (let i = 0; i < 10; i++) {
      const a = i * 2.4;
      f.sphere(1.5, Math.cos(a) * (L / 2 - 5), 6.2, Math.sin(a) * (W / 2 - 5), K.ice, { seg: 8, sy: .7 });
    }
    [-6, 0, 6].forEach((x, i) => bottle(f, x, 4, i % 2 ? -3 : 3, 9, BOTTLES[i]));
    // cover slid back over half the bin, so the ice still shows
    f.box(L, 1.4, W / 2, 0, T - 1.4, -(W / 4), M.steel);
    f.cyl(.32, L - 8, 0, T - .2, -1.5, M.steel2, { axis: 'x', center: true, seg: 10 });
  },

  ice_maker(f, { L, T, W }) {
    f.box(L, T, W - 2, 0, 0, -1, M.steel2);
    door(f, L - 1, T - 6, 0, 3, W / 2 - .9);
    f.box(L - 1, 2.5, .8, 0, 0, W / 2 - 1, M.black);
    f.box(4, 1.2, .5, 0, T - 5, W / 2 + .1, K.screenOn);
  },

  wine_fridge(f, { L, T, W }) {
    // a shell rather than a solid block, so the racks read through the glass door
    const d = W - 2;
    f.box(L, 1.5, d, 0, 0, -1, M.black); f.box(L, 1.5, d, 0, T - 1.5, -1, M.black);
    [-1, 1].forEach(s2 => f.box(1.5, T, d, s2 * (L / 2 - .75), 0, -1, M.black));
    f.box(L, T, 1.2, 0, 0, -(W / 2 - .6), { color: '#3c4348', metalness: .2, roughness: .5 });
    for (let r = 0; r < 4; r++) {
      const y = 5 + r * ((T - 11) / 3);
      f.box(L - 4, .5, d - 5, 0, y, -1, K.cast);
      for (let b = 0; b < 4; b++) {
        const x = -L / 2 + 4 + b * ((L - 8) / 3), spec = BOTTLES[(r + b) % BOTTLES.length];
        f.cyl(1.15, 9, x, y + 1.8, -2, spec, { axis: 'z', center: true, seg: 10 });
        f.cyl(.5, 3.5, x, y + 1.8, W / 2 - 6.5, spec, { axis: 'z', center: true, seg: 8 });
      }
    }
    // glass door last, with its frame and handle
    f.box(L - 3, T - 3, .5, 0, 1.5, W / 2 - 1.4, M.glass);
    [-1, 1].forEach(s2 => f.box(1.6, T, 1.4, s2 * (L / 2 - .8), 0, W / 2 - 1.3, M.steel));
    f.box(L - 2, 1.6, 1.4, 0, 0, W / 2 - 1.3, M.steel);
    f.box(L - 2, 1.6, 1.4, 0, T - 1.6, W / 2 - 1.3, M.steel);
    f.cyl(.3, T - 12, L / 2 - 2.6, 6, W / 2 - .4, M.steel2, { seg: 10 });
  },

  dish_drawer(f, { L, T, W }) {
    f.box(L, T, W - 2, 0, 0, -1, M.steel2);
    drawerFront(f, L - 1, T / 2 - 2, 0, 1, W / 2 - .9);
    drawerFront(f, L - 1, T / 2 - 2, 0, T / 2 + 1, W / 2 - .9);
    f.box(6, 1, .5, -L / 4, T - 3, W / 2 + .1, K.screenOn);
  },

  warming_drawer(f, { L, T, W }) {
    f.box(L, T, W - 2, 0, 0, -1, M.steel2);
    drawerFront(f, L - 1, T - 2, 0, 1, W / 2 - .9);
    f.box(3, .8, .5, L / 4, T - 3, W / 2 + .1, M.ember);
  },

  trash_drawer(f, { L, T, W }) {
    f.box(L, T, W - 2, 0, 0, -1, M.steel2);
    drawerFront(f, L - 1, T - 2, 0, 1, W / 2 - .9);
    f.box(4, .8, .5, L / 4 - 2, T - 4, W / 2 + .1, K.screenOn);
  },

  vent_hood(f, { L, W, T }) {
    const cap = 17, rB = (L / 12) / Math.SQRT2, rT = (13 / 12) / Math.SQRT2;
    // a tapered canopy: a four-sided cone, squashed to the hood's depth
    f.place(new THREE.CylinderGeometry(rT, rB, cap / 12, 4, 1, false, Math.PI / 4),
      f.material(M.steel), 0, cap / 2, 0, [0, 0, 0], [1, 1, W / L]);
    f.box(L, 1.4, W, 0, 0, 0, M.steel2);
    f.box(L - 5, .7, W - 5, 0, 1.4, 0, K.cast);
    f.cyl(6.5, T - cap, 0, cap, 0, M.steel2, { seg: 4, rot: [0, Math.PI / 4, 0] });
    f.box(L - 10, 1.2, 3.5, 0, 1.8, W / 2 - 3, M.steel2);
    [-1, 1].forEach(s2 => f.box(3, .8, .6, s2 * 6, 1.6, W / 2 - 1.4, K.screenOn));
  },

  bar_top(f, { L, W, T }) {
    f.box(L, 2, W, 0, T - 2, 0, M.stone);
    f.box(L, 1, W - 1, 0, T - 3, -.5, K.cast);
    // corbels holding the overhang
    for (let x = -L / 2 + 8; x <= L / 2 - 8 + .01; x += (L - 16) / Math.max(1, Math.round((L - 16) / 24))) {
      f.box(2.5, T - 3, W - 4, x, 0, -1, f.tex('wood', 2.5, T, W), [0, 0, 0]);
      f.box(2.5, 2, 4, x, T - 5, W / 2 - 2.5, f.tex('wood', 2.5, 2, 4), [.6, 0, 0]);
    }
  },

  butcher_block(f, { L, W, T }) {
    const wood = f.tex('wood', L, 4, W);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => f.box(3, T - 4, 3, sx * (L / 2 - 2.5), 0, sz * (W / 2 - 2.5), wood));
    f.box(L - 4, 1.2, W - 4, 0, 10, 0, wood);
    for (let i = 0; i < 3; i++) f.box(L - 6, 3, 1.2, 0, 16 + i * 5, -(W / 2 - 3), wood);
    // end-grain top drawn as strips
    const n = Math.round(L / 4);
    for (let i = 0; i < n; i++) f.box(L / n - .25, 4, W, -L / 2 + (L / n) * (i + .5), T - 4, 0, i % 2 ? K.block : K.wood);
    wheel(f, -(L / 2 - 3), 2.6, W / 2 - 3, 2.6); wheel(f, L / 2 - 3, 2.6, W / 2 - 3, 2.6);
  },

  bev_tub(f, { L, W, T }) {
    // galvanised tub on a folding stand
    [-1, 1].forEach(s => {
      f.bar(.7, [s * (L / 2 - 3), 0, -(W / 2 - 3)], [-s * (L / 2 - 3), T - 9, W / 2 - 3], M.black, 8);
      f.bar(.7, [s * (L / 2 - 3), 0, W / 2 - 3], [-s * (L / 2 - 3), T - 9, -(W / 2 - 3)], M.black, 8);
    });
    f.lathe([[0, 0], [L * .34, 0], [L * .42, 3], [L * .48, 9]], 0, T - 9, 0, K.galv, 24);
    f.torus(L * .48, .5, 0, T, 0, K.galv, { seg: 26 });
    [-1, 1].forEach(s => f.torus(1.8, .35, s * L * .48, T - 3, 0, M.black, { axis: 'x', arc: Math.PI, seg: 12 }));
    f.cyl(L * .44, 4, 0, T - 6, 0, K.ice, { seg: 20 });
    for (let i = 0; i < 7; i++) {
      const a = i * 1.9;
      bottle(f, Math.cos(a) * L * .22, T - 5, Math.sin(a) * W * .18, 9, BOTTLES[i % BOTTLES.length]);
    }
  },

  bar_cart(f, { L, W, T }) {
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => f.cyl(.7, T - 4, sx * (L / 2 - 2), 0, sz * (W / 2 - 2), M.brass, { seg: 10 }));
    [4, T - 5].forEach(y => {
      f.box(L - 3, .9, W - 3, 0, y, 0, f.tex('wood', L, 1, W));
      [-1, 1].forEach(s => f.cyl(.35, W - 4, s * (L / 2 - 2), y + 3, 0, M.brass, { axis: 'z', center: true, seg: 8 }));
    });
    [-1, 1].forEach(s => wheel(f, s * (L / 2 - 2), 2, W / 2 - 2, 2));
    [-8, -4.5, -1].forEach((x, i) => bottle(f, x, T - 4.1, -2, 11, BOTTLES[i]));
    [3, 6, 9].forEach(x => { f.cyl(1.5, 4, x, T - 4.1, 2, M.glass, { seg: 12 }); });
    f.cyl(4.5, 3, -6, 4.9, 1, K.galv, { rt: 4, seg: 16 });
  },

  deep_fryer(f, { L, W }) {
    cart(f, L - 4, W, 24, M.black, 2);
    f.box(L, 8, W - 1, 0, 24, 0, M.steel);
    // two oil wells with baskets
    [-1, 1].forEach(s => {
      const x = s * L / 4;
      f.box(L / 2 - 3, 7, W - 6, x, 25, -1, K.griddle);
      f.box(L / 2 - 5, .6, W - 8, x, 30, -1, { color: '#c8a24a', metalness: .2, roughness: .25 });
      f.box(L / 2 - 6, 5, W - 10, x, 30.5, -1, M.steel2);
      f.bar(.3, [x, 35, -1], [x + s * 3, 40, W / 2 - 1], M.steel2, 8);
    });
    knobs(f, [0], 27, W / 2 - .6, 1);
    f.box(L - 2, 3, .6, 0, 25, W / 2 - .55, M.steel2);
  },

  firewood(f, { L, W, T }) {
    [-1, 1].forEach(s => {
      const x = s * (L / 2 - 1.5);
      f.box(3, T, 2.5, x, 0, -(W / 2 - 1.5), M.black);
      f.box(3, T, 2.5, x, 0, W / 2 - 1.5, M.black);
      f.box(3, 2.5, W, x, 0, 0, M.black);
      f.bar(.8, [x, 4, -(W / 2 - 1.5)], [x, T - 2, W / 2 - 1.5], M.black, 6);
    });
    f.box(L - 4, 2, W - 4, 0, 2.5, 0, M.black);
    // split logs stacked end-on
    let n = 0;
    for (let y = 5; y < T - 6; y += 5.4) {
      for (let z = -W / 2 + 4; z < W / 2 - 3; z += 5.2) {
        const r = 2.4 + (n % 3) * .35;
        f.cyl(r, L - 6, (n % 2) * .6, y + r, z, M.log, { axis: 'x', center: true, seg: 10 });
        f.cyl(r * .9, .3, (L - 6) / 2 * .99, y + r, z, { color: '#c9a878', roughness: .95, metalness: 0 }, { axis: 'x', center: true, seg: 10 });
        n++;
      }
    }
  },

  pot_rack(f, { L, W, T }) {
    [-1, 1].forEach(sx => [-1, 1].forEach(sz => f.bar(.22, [sx * (L / 2 - 3), T, sz * (W / 2 - 3)], [sx * (L / 2 - 3), T - 12, sz * (W / 2 - 3)], M.iron, 6)));
    f.box(L, 1.2, 1.5, 0, T - 13, -(W / 2 - 3), M.iron); f.box(L, 1.2, 1.5, 0, T - 13, W / 2 - 3, M.iron);
    f.box(1.5, 1.2, W, -(L / 2 - 1), T - 13, 0, M.iron); f.box(1.5, 1.2, W, L / 2 - 1, T - 13, 0, M.iron);
    for (let x = -L / 2 + 6; x <= L / 2 - 6 + .01; x += (L - 12) / 3) f.box(1, .8, W - 6, x, T - 13, 0, M.iron);
    // pans hanging off the front rail
    const hang = [[-10, 4.5, K.cast], [-2, 5.5, K.copper], [7, 4, K.cast]];
    hang.forEach(([x, r, spec], i) => {
      f.torus(.9, .25, x, T - 14.6, W / 2 - 3, M.iron, { axis: 'x', seg: 10 });
      f.cyl(r, 3, x, T - 20, W / 2 - 3, spec, { seg: 16 });
      f.cyl(r - .6, .4, x, T - 19.7, W / 2 - 3, spec, { seg: 16 });
      f.cyl(.35, 6, x + (i % 2 ? 1 : -1) * (r + 3), T - 18.5, W / 2 - 3, M.black, { axis: 'x', center: true, seg: 8 });
    });
  },

  utensil_rail(f, { L, W, T }) {
    const u = f.upright();
    u.cyl(.4, L - 2, 0, W / 2 - 2, T / 2 - .4, M.steel2, { axis: 'x', center: true, seg: 10 });
    [-1, 1].forEach(s => u.box(1.4, 2.5, T, s * (L / 2 - 1), W / 2 - 3.2, 0, M.steel2));
    // hooks with a spatula, tongs and a brush
    const tools = [-9, -3, 3, 9];
    tools.forEach((x, i) => {
      u.torus(.8, .18, x, W / 2 - 2.6, T / 2 - .4, M.steel2, { axis: 'x', arc: Math.PI * 1.4, seg: 10 });
      u.cyl(.28, 7, x, W / 2 - 8, T / 2 - .4, M.black, { seg: 8 });
      if (i === 0) u.box(2.6, 3.5, .35, x, W / 2 - 12, T / 2 - .4, M.steel2);
      else if (i === 1) { u.bar(.2, [x - .7, W / 2 - 8, T / 2 - .4], [x - 1.4, W / 2 - 13, T / 2 - .4], M.steel2, 6); u.bar(.2, [x + .7, W / 2 - 8, T / 2 - .4], [x + 1.4, W / 2 - 13, T / 2 - .4], M.steel2, 6); }
      else if (i === 2) u.cyl(1.3, 2.2, x, W / 2 - 12, T / 2 - .4, K.label, { seg: 10 });
      else u.cyl(1.5, 2.6, x, W / 2 - 12, T / 2 - .4, K.cast, { seg: 12 });
    });
  },

  spice_shelf(f, { L, W, T }) {
    const u = f.upright();
    u.box(L, 1, T, 0, -W / 2, 0, f.tex('wood', L, 1, T));
    u.box(L, W, .8, 0, -W / 2, -T / 2 + .4, f.tex('wood', L, W, 1));
    u.box(L, 1.4, .8, 0, -W / 2 + 3.5, T / 2 - .4, f.tex('wood', L, 1.4, 1));
    const jars = [K.red, K.green, K.brown, K.label, K.red, K.green];
    for (let i = 0; i < 6; i++) {
      const x = -L / 2 + 2.2 + i * ((L - 4.4) / 5);
      u.cyl(.9, 3.2, x, -W / 2 + 1, 0, jars[i], { seg: 12 });
      u.cyl(.95, .5, x, -W / 2 + 4.2, 0, M.black, { seg: 12 });
    }
  },

  outdoor_tv(f, { L, W, T }) {
    const u = f.upright();
    u.box(L, W, T - .6, 0, 0, -.3, M.black);
    u.box(L - 2, W - 2, .5, 0, 0, T / 2 - .2, K.screen);
    u.box(L - 3.5, W - 3.5, .2, 0, .4, T / 2 - .05, K.screenOn);
    u.box(3, .5, .4, 0, -(W / 2 - 1), T / 2 - .1, M.steel2);
  },
};
