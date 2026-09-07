export const MATS = {
  wood: { n: 'Wood', c: '#b5d9fd', rate: 1 },
  brick: { n: 'Brick', c: '#597ea3', rate: 1.9 },
  metal: { n: 'Metal', c: '#b7b7ba', rate: 1.5 },
  rope: { n: 'Rope', c: '#7a7a7d', rate: .8 },
  holds: { n: 'Holds', c: '#2c455d', rate: 2.2 },
  // Fixture materials: bought items, not build materials (kept out of the assembly and plan brushes)
  appliance: { n: 'Appliance', c: '#8f979f', rate: 1, fixture: true },
  clay: { n: 'Clay', c: '#8c6b60', rate: 1.2, fixture: true },
  stone: { n: 'Stone', c: '#a9adb3', rate: 1.6, fixture: true },
  fabric: { n: 'Fabric', c: '#c4cbd6', rate: 1, fixture: true },
};

export const BUILD_MATS = Object.keys(MATS).filter(k => !MATS[k].fixture);

export const PARTS = [
  { k: 'platform', n: 'Deck platform', s: '4×4 ft', mat: 'wood', cost: 86,
    cuts: [['2×6 deck board, 48"', 7], ['2×8 joist, 48"', 4], ['4×4 post, per ft', 4]] },
  { k: 'rail', n: 'Guard rail', s: '4 ft run', mat: 'wood', cost: 34,
    cuts: [['2×4 rail, 48"', 2], ['2×2 baluster, 30"', 5]] },
  { k: 'ladder', n: 'Ladder', s: '6 ft', mat: 'wood', cost: 40,
    cuts: [['2×4 stringer, 76"', 2], ['2×4 rung, 18"', 6]] },
  { k: 'wall', n: 'Wall panel', s: '4×4 ft', mat: 'wood', cost: 48,
    cuts: [['1/2" ply, 48×48', 1], ['2×4 frame, 48"', 4]] },
  { k: 'climb', n: 'Climbing panel', s: '4×6 ft', mat: 'holds', cost: 132,
    cuts: [['3/4" ply, 48×72', 1], ['2×4 backer, 72"', 3], ['t-nut + hold', 12]] },
  { k: 'net', n: 'Rope net', s: '4×4 ft', mat: 'rope', cost: 65,
    cuts: [['3/8" manila, 20 ft', 4], ['eye bolt', 8]] },
  { k: 'monkey', n: 'Monkey bars', s: '6 ft', mat: 'metal', cost: 88,
    cuts: [['1" steel tube, 72"', 2], ['rung tube, 24"', 5]] },
  { k: 'roof', n: 'Roof panel', s: '5×5 ft', mat: 'metal', cost: 72,
    cuts: [['corrugated panel, 60"', 2], ['1×3 purlin, 60"', 3]] },
  { k: 'pad', n: 'Brick pad', s: '4×4 ft', mat: 'brick', cost: 140,
    cuts: [['paver, 8×4×2', 72], ['bedding sand, cu ft', 6]] },
  { k: 'post', n: 'Corner post', s: '4×4 · 6 ft', mat: 'wood', cost: 14,
    cuts: [['4×4 post, 72"', 1]] },
  // Created by the Plan tab; cost and cuts scale with the block's height
  { k: 'mass', n: 'Mass block', s: '2×2 ft', mat: 'wood', cost: 9, cuts: [] },
];

export const MASS_COST_PER_FT = 9;

export const MASS_CUTS = {
  wood: h => [['2×4 stud, 24"', h * 2], ['1/2" ply, 24×24', h]],
  brick: h => [['paver, 8×4×2', h * 18], ['bedding sand, cu ft', 1]],
  metal: h => [['1" steel tube, 24"', h * 2], ['sheet panel, 24×24', h]],
  rope: h => [['3/8" manila, 20 ft', h], ['eye bolt', h * 2]],
  holds: h => [['3/4" ply, 24×24', h], ['t-nut + hold', h * 2]],
};

// Half-extents on x/z before rotation, used for yard-bounds checks
export const FOOTPRINT = {
  platform: [2, 2], rail: [2, .1], ladder: [.8, .13], wall: [2, .15], climb: [2, .2],
  net: [2, .13], monkey: [3, 1], roof: [2.5, 2.5], pad: [2, 2], post: [.2, .2], mass: [1, 1],
};

export const PLAN_N = 8;
export const CELL_FT = 2;

export function partByKey(k) {
  return PARTS.find(p => p.k === k);
}

export const SAMPLE_PROJECT = {
  name: 'Corner fort + climb wall',
  parts: [
    { k: 'platform', x: 0, z: 0, lvl: 5, mat: 'wood', rot: 0 },
    { k: 'rail', x: 0, z: -2, lvl: 5, mat: 'wood', rot: 0 },
    { k: 'ladder', x: 0, z: 2.5, lvl: 0, mat: 'wood', rot: 0 },
    { k: 'climb', x: -3, z: 0, lvl: 0, mat: 'holds', rot: 1 },
    { k: 'net', x: 3, z: 0, lvl: 0, mat: 'rope', rot: 1 },
    { k: 'roof', x: 0, z: 0, lvl: 9, mat: 'metal', rot: 0 },
  ],
  yard: { w: 24, d: 18, ground: 'Grass', age: '5–9', budget: 700 },
  cells: {
    '4,4': { h: 4, mat: 'wood' }, '5,4': { h: 4, mat: 'wood' },
    '4,5': { h: 4, mat: 'wood' }, '5,5': { h: 4, mat: 'wood' },
    '3,4': { h: 2, mat: 'wood' }, '6,5': { h: 6, mat: 'wood' },
  },
};

export function emptyProject(yard) {
  return { name: 'Untitled build', parts: [], yard: { ...yard }, cells: {} };
}

/* ---------- stock pieces (true dimensions, inches) ---------- */
// T = thickness (vertical when lying flat), W = width, L = length along the piece.
// unit: 'ft' priced per foot of length, 'each' per piece, 'sheet' per full 4×8 sheet by area.

export const STOCK = [
  { id: '2x2', n: '2×2', cat: 'lumber', mat: 'wood', T: 1.5, W: 1.5, L: 96, maxL: 96, lengths: [96], price: .45, unit: 'ft' },
  { id: '2x4', n: '2×4', cat: 'lumber', mat: 'wood', T: 1.5, W: 3.5, L: 96, maxL: 192, lengths: [96, 120, 144, 192], price: .55, unit: 'ft' },
  { id: '2x6', n: '2×6', cat: 'lumber', mat: 'wood', T: 1.5, W: 5.5, L: 96, maxL: 192, lengths: [96, 120, 144, 192], price: .95, unit: 'ft' },
  { id: '2x8', n: '2×8', cat: 'lumber', mat: 'wood', T: 1.5, W: 7.25, L: 96, maxL: 192, lengths: [96, 120, 144, 192], price: 1.35, unit: 'ft' },
  { id: '2x12', n: '2×12', cat: 'lumber', mat: 'wood', T: 1.5, W: 11.25, L: 96, maxL: 192, lengths: [96, 120, 144, 192], price: 2.1, unit: 'ft' },
  { id: '4x4', n: '4×4 post', cat: 'lumber', mat: 'wood', T: 3.5, W: 3.5, L: 96, maxL: 144, lengths: [96, 120, 144], price: 1.6, unit: 'ft', upright: true },
  { id: '1x3', n: '1×3', cat: 'lumber', mat: 'wood', T: .75, W: 2.5, L: 96, maxL: 96, lengths: [96], price: .5, unit: 'ft' },
  { id: '1x6', n: '1×6 fence board', cat: 'lumber', mat: 'wood', T: .75, W: 5.5, L: 72, maxL: 96, lengths: [72, 96], price: .6, unit: 'ft' },
  { id: 'ply12', n: '½" plywood', cat: 'sheet', mat: 'wood', T: .5, W: 48, L: 96, maxL: 96, maxW: 48, price: 32, unit: 'sheet' },
  { id: 'ply34', n: '¾" plywood', cat: 'sheet', mat: 'wood', T: .75, W: 48, L: 96, maxL: 96, maxW: 48, price: 48, unit: 'sheet' },
  { id: 'brick', n: 'Brick', cat: 'masonry', mat: 'brick', T: 2.25, W: 3.625, L: 7.625, price: .65, unit: 'each', fixed: true },
  { id: 'block', n: 'Concrete block', cat: 'masonry', mat: 'brick', T: 7.625, W: 7.625, L: 15.625, price: 2.2, unit: 'each', fixed: true },
  { id: 'paver', n: 'Paver 12×12', cat: 'masonry', mat: 'brick', T: 1.5, W: 12, L: 12, price: 2.8, unit: 'each', fixed: true },
  { id: 'tube', n: '1" steel tube', cat: 'metal', mat: 'metal', T: 1, W: 1, L: 72, maxL: 240, lengths: [72, 96, 120, 144, 192, 240], price: 2.4, unit: 'ft' },
  { id: 'rope', n: '⅜" manila rope', cat: 'rope', mat: 'rope', T: .6, W: .6, L: 48, maxL: 600, lengths: [600], price: .35, unit: 'ft' },
  { id: 'hold', n: 'Climbing hold', cat: 'holds', mat: 'holds', T: 2.5, W: 3, L: 4, price: 3.5, unit: 'each', fixed: true, attach: true },
  { id: 'corr', n: 'Corrugated panel', cat: 'sheet', mat: 'metal', T: .25, W: 26, L: 96, maxL: 144, maxW: 26, price: 24, unit: 'sheet' },

  /* ---- outdoor kitchen (L = width, W = depth, T = height; shape boxes sit on the envelope's underside) ---- */
  { id: 'grill_drop', n: 'Drop-in gas grill 32"', cat: 'kitchen', mat: 'appliance', T: 22, W: 24, L: 32, price: 899, unit: 'each', fixed: true, color: '#c3c7cb',
    shape: [{ w: 32, h: 13, d: 24 }, { w: 32, h: 9, d: 21, y: 13, z: -1.5, color: '#d2d5d8' }, { w: 30, h: 1.2, d: 2, y: 22, z: -12, color: '#3a3d40' }] },
  { id: 'grill_cart', n: 'Gas grill cart 52"', cat: 'kitchen', mat: 'appliance', T: 46, W: 24, L: 52, price: 499, unit: 'each', fixed: true, color: '#b9bdc1',
    shape: [{ w: 2, h: 26, d: 2, x: -24, z: -10, color: '#3a3d40' }, { w: 2, h: 26, d: 2, x: -24, z: 10, color: '#3a3d40' }, { w: 2, h: 26, d: 2, x: 24, z: -10, color: '#3a3d40' }, { w: 2, h: 26, d: 2, x: 24, z: 10, color: '#3a3d40' },
      { w: 52, h: 12, d: 22, y: 26 }, { w: 32, h: 8, d: 20, y: 38, color: '#d2d5d8' }, { w: 10, h: 1.5, d: 22, x: -21, y: 24, color: '#d2d5d8' }, { w: 10, h: 1.5, d: 22, x: 21, y: 24, color: '#d2d5d8' }] },
  { id: 'traeger', n: 'Pellet smoker (Traeger)', cat: 'kitchen', mat: 'appliance', T: 56, W: 22, L: 41, price: 799, unit: 'each', fixed: true, color: '#26282b',
    shape: [{ w: 1.5, h: 28, d: 1.5, x: -13, z: -8 }, { w: 1.5, h: 28, d: 1.5, x: -13, z: 8 }, { w: 1.5, h: 28, d: 1.5, x: 8, z: -8 }, { w: 1.5, h: 28, d: 1.5, x: 8, z: 8 },
      { w: 30, h: 18, d: 16, x: -3, y: 28 }, { w: 11, h: 17, d: 18, x: 15, y: 24, color: '#303236' }, { w: 3, h: 10, d: 3, x: -12, y: 46, z: -4, color: '#303236' }, { w: 30, h: 1, d: 16, x: -3, y: 33, color: '#45484c' }] },
  { id: 'kamado', n: 'Kamado grill (egg)', cat: 'kitchen', mat: 'clay', T: 40, W: 24, L: 24, price: 999, unit: 'each', fixed: true, color: '#3b5f4a',
    shape: [{ w: 2, h: 12, d: 2, x: -9, z: -9, color: '#3a3d40' }, { w: 2, h: 12, d: 2, x: 9, z: -9, color: '#3a3d40' }, { w: 2, h: 12, d: 2, x: -9, z: 9, color: '#3a3d40' }, { w: 2, h: 12, d: 2, x: 9, z: 9, color: '#3a3d40' },
      { w: 20, h: 18, d: 20, y: 12 }, { w: 16, h: 9, d: 16, y: 30 }, { w: 3, h: 2, d: 3, y: 39, color: '#3a3d40' }] },
  { id: 'pizza_oven', n: 'Wood-fired pizza oven', cat: 'kitchen', mat: 'clay', T: 36, W: 30, L: 36, price: 1200, unit: 'each', fixed: true, color: '#c4876c',
    shape: [{ w: 36, h: 4, d: 30, color: '#9a4b3b' }, { w: 30, h: 22, d: 26, y: 4, z: -1 }, { w: 22, h: 12, d: 20, y: 26, z: -1 }, { w: 14, h: 10, d: 3, y: 6, z: 12.5, color: '#2b2420' }, { w: 6, h: 8, d: 6, y: 34, z: -6, color: '#7f7f82' }] },
  { id: 'ooni', n: 'Portable pizza oven', cat: 'kitchen', mat: 'appliance', T: 20, W: 21, L: 25, price: 399, unit: 'each', fixed: true, color: '#2a2c2f',
    shape: [{ w: 1.2, h: 4, d: 1.2, x: -9, z: -7 }, { w: 1.2, h: 4, d: 1.2, x: 9, z: -7 }, { w: 1.2, h: 4, d: 1.2, x: 0, z: 8 }, { w: 22, h: 9, d: 16, y: 4 }, { w: 14, h: 5, d: 2, y: 5, z: 9, color: '#111' }, { w: 3, h: 7, d: 3, x: -6, y: 13, z: -3 }] },
  { id: 'fridge', n: 'Outdoor fridge 24"', cat: 'kitchen', mat: 'appliance', T: 34, W: 24, L: 24, price: 699, unit: 'each', fixed: true, color: '#c3c7cb',
    shape: [{ w: 24, h: 34, d: 24 }, { w: 1, h: 24, d: 1.5, x: 9, y: 5, z: 12.5, color: '#8a8e92' }, { w: 24, h: 3, d: .5, y: 0, z: 12, color: '#3a3d40' }] },
  { id: 'sink', n: 'Bar sink 15×15', cat: 'kitchen', mat: 'appliance', T: 9, W: 15, L: 15, price: 129, unit: 'each', fixed: true, color: '#c9ccd0',
    shape: [{ w: 15, h: 8, d: 15 }, { w: 13, h: 1, d: 13, y: 7.2, color: '#8f9498' }, { w: 1.5, h: 9, d: 1.5, z: -6, color: '#c9ccd0' }] },
  { id: 'counter', n: 'Concrete countertop', cat: 'kitchen', mat: 'stone', T: 1.5, W: 25, L: 72, maxL: 144, maxW: 30, lengths: [96, 120, 144], price: 45, unit: 'ft', color: '#b8bab5' },
  { id: 'cabdoor', n: 'Cabinet door 24×30', cat: 'kitchen', mat: 'wood', T: .75, W: 30, L: 24, price: 45, unit: 'each', fixed: true, attach: true },
  { id: 'drawer', n: 'Drawer front 24×8', cat: 'kitchen', mat: 'wood', T: .75, W: 8, L: 24, price: 24, unit: 'each', fixed: true, attach: true },
  { id: 'stool', n: 'Bar stool 30"', cat: 'kitchen', mat: 'wood', T: 30, W: 16, L: 16, price: 65, unit: 'each', fixed: true,
    shape: [{ w: 1.2, h: 28, d: 1.2, x: -6.5, z: -6.5 }, { w: 1.2, h: 28, d: 1.2, x: 6.5, z: -6.5 }, { w: 1.2, h: 28, d: 1.2, x: -6.5, z: 6.5 }, { w: 1.2, h: 28, d: 1.2, x: 6.5, z: 6.5 }, { w: 16, h: 2, d: 16, y: 28 }, { w: 14, h: 1, d: 1, y: 10, z: -6.5 }, { w: 14, h: 1, d: 1, y: 10, z: 6.5 }] },
  { id: 'firepit', n: 'Fire pit ring 36"', cat: 'kitchen', mat: 'appliance', T: 12, W: 36, L: 36, price: 89, unit: 'each', fixed: true, color: '#3a3d40',
    shape: [{ w: 36, h: 12, d: 2, z: -17 }, { w: 36, h: 12, d: 2, z: 17 }, { w: 2, h: 12, d: 32, x: -17 }, { w: 2, h: 12, d: 32, x: 17 }, { w: 30, h: 1, d: 30, y: 2, color: '#5a4a3c' }] },

  /* ---- clay ---- */
  { id: 'adobe', n: 'Adobe block 14×10×4', cat: 'clay', mat: 'clay', T: 4, W: 10, L: 14, price: 3.5, unit: 'each', fixed: true, color: '#b08a6c' },
  { id: 'flue', n: 'Clay flue liner 8×8×24', cat: 'clay', mat: 'clay', T: 24, W: 8, L: 8, price: 18, unit: 'each', fixed: true, color: '#b97a5e',
    shape: [{ w: 8, h: 24, d: 1 , z: -3.5 }, { w: 8, h: 24, d: 1, z: 3.5 }, { w: 1, h: 24, d: 6, x: -3.5 }, { w: 1, h: 24, d: 6, x: 3.5 }] },
  { id: 'tile', n: 'Terracotta tile 12×12', cat: 'clay', mat: 'clay', T: .5, W: 12, L: 12, price: 2, unit: 'each', fixed: true, color: '#c4785a' },

  /* ---- beds & play ---- */
  { id: 'mat_twin', n: 'Twin mattress 38×75', cat: 'bed', mat: 'fabric', T: 8, W: 38, L: 75, price: 150, unit: 'each', fixed: true, color: '#e3e6ec',
    shape: [{ w: 75, h: 8, d: 38 }, { w: 75, h: 1, d: 38, y: 3.5, color: '#aeb6c4' }] },
  { id: 'mat_twinxl', n: 'Twin XL mattress 38×80', cat: 'bed', mat: 'fabric', T: 8, W: 38, L: 80, price: 180, unit: 'each', fixed: true, color: '#e3e6ec',
    shape: [{ w: 80, h: 8, d: 38 }, { w: 80, h: 1, d: 38, y: 3.5, color: '#aeb6c4' }] },
  { id: 'mat_full', n: 'Full mattress 54×75', cat: 'bed', mat: 'fabric', T: 8, W: 54, L: 75, price: 220, unit: 'each', fixed: true, color: '#e3e6ec',
    shape: [{ w: 75, h: 8, d: 54 }, { w: 75, h: 1, d: 54, y: 3.5, color: '#aeb6c4' }] },
  { id: 'mat_toddler', n: 'Toddler mattress 28×52', cat: 'bed', mat: 'fabric', T: 5, W: 28, L: 52, price: 90, unit: 'each', fixed: true, color: '#e6e9ee' },
  { id: 'pillow', n: 'Pillow 20×26', cat: 'bed', mat: 'fabric', T: 5, W: 20, L: 26, price: 15, unit: 'each', fixed: true, color: '#f3f3f1' },
  { id: 'playmat', n: 'Foam play mat 48×48', cat: 'bed', mat: 'fabric', T: 2, W: 48, L: 48, price: 60, unit: 'each', fixed: true, color: '#6fa1c9' },
  { id: 'beanbag', n: 'Bean bag 36"', cat: 'bed', mat: 'fabric', T: 24, W: 36, L: 36, price: 80, unit: 'each', fixed: true, color: '#c95a5a',
    shape: [{ w: 36, h: 14, d: 36 }, { w: 28, h: 10, d: 28, y: 14, color: '#b84f4f' }] },
];

export const QUICK_FIXTURES = ['grill_drop', 'traeger', 'pizza_oven', 'fridge', 'counter', 'cabdoor', 'mat_twin', 'pillow', 'beanbag'];

export const QUICK_STOCK = ['2x4', '2x6', '4x4', 'ply12', 'brick', 'block', 'tube', 'rope', 'hold'];

export function stockById(id) {
  return STOCK.find(s => s.id === id);
}

export const SNAPS = [1, 6, 12];
