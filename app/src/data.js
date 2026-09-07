export const MATS = {
  wood: { n: 'Wood', c: '#b5d9fd', rate: 1 },
  brick: { n: 'Brick', c: '#597ea3', rate: 1.9 },
  metal: { n: 'Metal', c: '#b7b7ba', rate: 1.5 },
  rope: { n: 'Rope', c: '#7a7a7d', rate: .8 },
  holds: { n: 'Holds', c: '#2c455d', rate: 2.2 },
};

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
];

export const QUICK_STOCK = ['2x4', '2x6', '4x4', 'ply12', 'brick', 'block', 'tube', 'rope', 'hold'];

export function stockById(id) {
  return STOCK.find(s => s.id === id);
}

export const SNAPS = [1, 6, 12];
