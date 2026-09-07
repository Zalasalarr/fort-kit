import { stockById } from './data.js';
import { restAt } from './logic.js';

let seq = 0;
export const newGroupId = () => 'g' + Date.now().toString(36) + (seq++).toString(36);

// A piece resting with its underside at `y`, centred at (x, z), all in inches
export function piece(stock, o = {}) {
  const s = stockById(stock);
  const p = {
    k: 'piece', stock, mat: s.mat, L: o.L ?? s.L, W: o.W ?? s.W,
    cx: o.x || 0, cy: 0, cz: o.z || 0, yaw: o.yaw || 0, pitch: o.pitch || 0, roll: o.roll || 0,
  };
  return restAt(p, o.y || 0);
}

// Rotate a set of origin-centred pieces by `yaw` degrees, then move them, and tag them as one group
export function transformGroup(pieces, { x = 0, y = 0, z = 0, yaw = 0, id, name }) {
  const r = (yaw * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  return pieces.map(p => ({
    ...p,
    cx: p.cx * c + p.cz * s + x,
    cy: p.cy + y,
    cz: -p.cx * s + p.cz * c + z,
    yaw: ((p.yaw || 0) + yaw) % 360,
    grp: id, gn: name,
  }));
}

/* ---------- tools ---------- */

export const TOOLS = {
  brickwall: {
    n: 'Brick wall', tip: 'Running bond, ⅜" joints. Half bricks start alternate courses; end bricks are cut to fit.',
    params: [
      { k: 'L', n: 'Length', def: 96, min: 16, max: 480, step: 8 },
      { k: 'H', n: 'Height', def: 36, min: 6, max: 96, step: 6 },
    ],
  },
  deck: {
    n: 'Deck', tip: 'Rim and joists at 16" on center, 2×6 boards with ¼" gaps, 4×4 posts when raised.',
    params: [
      { k: 'W', n: 'Width', def: 48, min: 24, max: 192, step: 12 },
      { k: 'D', n: 'Depth', def: 48, min: 24, max: 192, step: 12 },
      { k: 'H', n: 'Deck height', def: 60, min: 8, max: 120, step: 6 },
      { k: 'joist', n: 'Joists', def: '2x6', options: [['2x6', '2×6'], ['2x8', '2×8']] },
    ],
  },
  studwall: {
    n: 'Stud wall', tip: 'Bottom and top plate with studs at the spacing you pick, optional plywood on the outside face.',
    params: [
      { k: 'L', n: 'Length', def: 96, min: 24, max: 240, step: 8 },
      { k: 'H', n: 'Height', def: 96, min: 24, max: 120, step: 6 },
      { k: 'OC', n: 'Stud spacing', def: 16, options: [[16, '16" OC'], [24, '24" OC']] },
      { k: 'sheathing', n: 'Sheathing', def: 'none', options: [['none', 'None'], ['ply12', '½" ply'], ['ply34', '¾" ply']] },
    ],
  },
  ladder: {
    n: 'Ladder', tip: '2×4 stringers with 2×2 rungs.',
    params: [
      { k: 'H', n: 'Height', def: 72, min: 36, max: 144, step: 6 },
      { k: 'W', n: 'Width', def: 18, min: 12, max: 30, step: 2 },
      { k: 'spacing', n: 'Rung spacing', def: 12, options: [[10, '10 in'], [12, '12 in']] },
    ],
  },
};

export function defaultParams(toolId) {
  const out = {};
  TOOLS[toolId].params.forEach(p => { out[p.k] = p.def; });
  return out;
}

const BRICK = { L: 7.625, W: 3.625, H: 2.25, J: .375 };

export function brickWall({ L, H }) {
  const out = [];
  const course = BRICK.H + BRICK.J;
  const n = Math.max(1, Math.floor((H + .01) / course));
  for (let c = 0; c < n; c++) {
    const y = c * course;
    let x = -L / 2;
    if (c % 2 === 1) {
      out.push(piece('brick', { L: BRICK.W, x: x + BRICK.W / 2, y }));
      x += BRICK.W + BRICK.J;
    }
    while (x + BRICK.L <= L / 2 + .01) {
      out.push(piece('brick', { x: x + BRICK.L / 2, y }));
      x += BRICK.L + BRICK.J;
    }
    const rem = L / 2 - x;
    if (rem >= 1) out.push(piece('brick', { L: rem, x: x + rem / 2, y }));
  }
  return out;
}

export function deck({ W, D, H, joist = '2x6' }) {
  const out = [];
  const js = stockById(joist);
  const boardT = 1.5;
  const jTop = H - boardT, jBottom = jTop - js.W;
  for (const sz of [-1, 1]) out.push(piece(joist, { L: W, y: jBottom, z: sz * (D / 2 - .75), roll: 90 }));
  const xs = [];
  for (let x = -W / 2 + .75; x < W / 2 - .75 - 1; x += 16) xs.push(x);
  xs.push(W / 2 - .75);
  xs.forEach(x => out.push(piece(joist, { L: D - 3, x, y: jBottom, roll: 90, yaw: 90 })));
  for (let z = -D / 2 + 2.75; z <= D / 2 - 2.75 + .01; z += 5.75) out.push(piece('2x6', { L: W, y: jTop, z }));
  if (jBottom > 6) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      out.push(piece('4x4', { L: jBottom, x: sx * (W / 2 - 3.25), z: sz * (D / 2 - 3.25), pitch: 90 }));
    }
  }
  return out;
}

export function studWall({ L, H, OC = 16, sheathing = 'none' }) {
  const out = [];
  out.push(piece('2x4', { L, y: 0 }));
  out.push(piece('2x4', { L, y: H - 1.5 }));
  const xs = [];
  for (let x = -L / 2 + .75; x < L / 2 - .75 - 1; x += +OC) xs.push(x);
  xs.push(L / 2 - .75);
  xs.forEach(x => out.push(piece('2x4', { L: H - 3, x, y: 1.5, pitch: 90 })));
  if (sheathing !== 'none') {
    const s = stockById(sheathing);
    let x = -L / 2;
    while (x < L / 2 - .01) {
      const w = Math.min(48, L / 2 - x);
      out.push(piece(sheathing, { L: Math.min(H, 96), W: w, x: x + w / 2, y: 0, z: 1.75 + s.T / 2, pitch: 90, yaw: 90 }));
      x += w;
    }
  }
  return out;
}

export function ladder({ H, W, spacing = 12 }) {
  const out = [];
  for (const sx of [-1, 1]) out.push(piece('2x4', { L: H, x: sx * (W / 2 - .75), pitch: 90 }));
  for (let y = +spacing; y <= H - 6; y += +spacing) out.push(piece('2x2', { L: W - 3, y: y - .75 }));
  return out;
}

export function generate(toolId, params) {
  switch (toolId) {
    case 'brickwall': return brickWall(params);
    case 'deck': return deck(params);
    case 'studwall': return studWall(params);
    case 'ladder': return ladder(params);
    default: return [];
  }
}

/* ---------- exploding assemblies into pieces ---------- */

function rail() {
  const out = [];
  for (const sx of [-1, 1]) out.push(piece('2x4', { L: 34.5, x: sx * 22.5, pitch: 90 }));
  out.push(piece('2x4', { L: 48, y: 34.5 }));
  out.push(piece('2x4', { L: 48, y: 16 }));
  for (let i = 0; i < 5; i++) out.push(piece('2x2', { L: 30, x: -15 + i * 7.5, y: 3, pitch: 90 }));
  return out;
}

function climbPanel() {
  const out = [];
  out.push(piece('ply34', { L: 72, W: 48, y: 0, z: 0, pitch: 90, yaw: 90 }));
  for (const x of [-22, 0, 22]) out.push(piece('2x4', { L: 72, x, z: -1.125, pitch: 90 }));
  const hs = [[-1.3, .9], [.4, 1.4], [1.4, 2.4], [-.6, 2.2], [1.1, 3.5], [-1.5, 3.9], [.2, 4.6], [1.5, 5.2], [-1, 5.3], [.9, .6], [-1.7, 2.9], [.6, 3]];
  hs.forEach(([hx, hy]) => {
    const p = piece('hold', { x: hx * 12, z: .375 + 1.25, roll: 90 });
    p.cy = hy * 12;
    out.push(p);
  });
  return out;
}

function ropeNet() {
  const out = [];
  for (const sx of [-1, 1]) out.push(piece('2x4', { L: 69, x: sx * 24, pitch: 90 }));
  out.push(piece('2x4', { L: 48, y: 69 }));
  for (let i = 0; i <= 8; i++) out.push(piece('rope', { L: 66, x: -24 + i * 6, y: 2, pitch: 90 }));
  for (let j = 0; j <= 8; j++) out.push(piece('rope', { L: 48, y: 2 + j * 8.2 }));
  return out;
}

function monkeyBars() {
  const out = [];
  for (const sx of [-1, 1]) out.push(piece('tube', { L: 80.4, x: sx * 36, pitch: 90 }));
  out.push(piece('tube', { L: 72, y: 80.4 }));
  for (let i = -2; i <= 2; i++) out.push(piece('tube', { L: 24, x: i * 14.4, y: 80.4, yaw: 90 }));
  return out;
}

function roof() {
  const out = [];
  for (const z of [-24, 0, 24]) out.push(piece('1x3', { L: 60, y: 0, z }));
  for (const z of [-13, 13]) out.push(piece('corr', { L: 60, W: 26, y: .75, z }));
  return out;
}

function brickPad() {
  const out = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) out.push(piece('paver', { x: -18 + i * 12, z: -18 + j * 12 }));
  return out;
}

// The assembly's deck surface sits 4.2 in above its level; parts that stand on the deck sit on that surface
const DECK_TOP = 4.2;

export function explode(part) {
  const base = part.lvl * 12;
  const at = { x: part.x * 12, z: part.z * 12, yaw: (part.rot || 0) * 90, id: newGroupId() };
  switch (part.k) {
    case 'platform':
      return transformGroup(deck({ W: 48, D: 48, H: Math.max(7, base + DECK_TOP) }), { ...at, y: 0, name: 'Deck' });
    case 'rail': return transformGroup(rail(), { ...at, y: base ? base + DECK_TOP : 0, name: 'Guard rail' });
    case 'ladder': return transformGroup(ladder({ H: 72, W: 20, spacing: 12 }), { ...at, y: base, name: 'Ladder' });
    case 'wall': return transformGroup(studWall({ L: 48, H: 48, OC: 16, sheathing: 'ply12' }), { ...at, y: base, name: 'Wall panel' });
    case 'climb': return transformGroup(climbPanel(), { ...at, y: base, name: 'Climbing panel' });
    case 'net': return transformGroup(ropeNet(), { ...at, y: base, name: 'Rope net' });
    case 'monkey': return transformGroup(monkeyBars(), { ...at, y: base, name: 'Monkey bars' });
    case 'roof': return transformGroup(roof(), { ...at, y: base - 9.6, name: 'Roof' });
    case 'pad': return transformGroup(brickPad(), { ...at, y: base, name: 'Paver pad' });
    case 'post': return transformGroup([piece('4x4', { L: 72, pitch: 90 })], { ...at, y: base, name: 'Corner post' });
    default: return null;
  }
}
