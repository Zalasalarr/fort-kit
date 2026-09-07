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
  light: { n: 'Lighting', c: '#e2cf86', rate: 1, fixture: true },
  furniture: { n: 'Furniture', c: '#a5977f', rate: 1, fixture: true },
  play: { n: 'Play gear', c: '#7fa3c4', rate: 1, fixture: true },
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
  { id: 'grill_drop', n: 'Drop-in gas grill 32"', cat: 'kitchen', mat: 'appliance', T: 22, W: 24, L: 32, price: 899, unit: 'each', fixed: true, color: '#c3c7cb' },
  { id: 'grill_cart', n: 'Gas grill cart 52"', cat: 'kitchen', mat: 'appliance', T: 46, W: 24, L: 52, price: 499, unit: 'each', fixed: true, color: '#b9bdc1' },
  { id: 'traeger', n: 'Pellet smoker (Traeger)', cat: 'kitchen', mat: 'appliance', T: 56, W: 22, L: 41, price: 799, unit: 'each', fixed: true, color: '#26282b' },
  { id: 'kamado', n: 'Kamado grill (egg)', cat: 'kitchen', mat: 'clay', T: 40, W: 24, L: 24, price: 999, unit: 'each', fixed: true, color: '#3b5f4a' },
  { id: 'pizza_oven', n: 'Wood-fired pizza oven', cat: 'kitchen', mat: 'clay', T: 36, W: 30, L: 36, price: 1200, unit: 'each', fixed: true, color: '#c4876c' },
  { id: 'ooni', n: 'Portable pizza oven', cat: 'kitchen', mat: 'appliance', T: 20, W: 21, L: 25, price: 399, unit: 'each', fixed: true, color: '#2a2c2f' },
  { id: 'fridge', n: 'Outdoor fridge 24"', cat: 'kitchen', mat: 'appliance', T: 34, W: 24, L: 24, price: 699, unit: 'each', fixed: true, color: '#c3c7cb' },
  { id: 'sink', n: 'Bar sink 15×15', cat: 'kitchen', mat: 'appliance', T: 18, W: 15, L: 15, price: 129, unit: 'each', fixed: true, color: '#c9ccd0' },
  { id: 'counter', n: 'Concrete countertop', cat: 'kitchen', mat: 'stone', T: 1.5, W: 25, L: 72, maxL: 144, maxW: 30, lengths: [96, 120, 144], price: 45, unit: 'ft', color: '#b8bab5' },
  { id: 'cabdoor', n: 'Cabinet door 24×30', cat: 'kitchen', mat: 'wood', T: .75, W: 30, L: 24, price: 45, unit: 'each', fixed: true, attach: true },
  { id: 'drawer', n: 'Drawer front 24×8', cat: 'kitchen', mat: 'wood', T: .75, W: 8, L: 24, price: 24, unit: 'each', fixed: true, attach: true },
  { id: 'stool', n: 'Bar stool 30"', cat: 'kitchen', mat: 'wood', T: 30, W: 16, L: 16, price: 65, unit: 'each', fixed: true },
  { id: 'firepit', n: 'Fire pit ring 36"', cat: 'kitchen', mat: 'appliance', T: 12, W: 36, L: 36, price: 89, unit: 'each', fixed: true, color: '#3a3d40' },

  /* ---- clay ---- */
  { id: 'adobe', n: 'Adobe block 14×10×4', cat: 'clay', mat: 'clay', T: 4, W: 10, L: 14, price: 3.5, unit: 'each', fixed: true, color: '#b08a6c' },
  { id: 'flue', n: 'Clay flue liner 8×8×24', cat: 'clay', mat: 'clay', T: 24, W: 8, L: 8, price: 18, unit: 'each', fixed: true, color: '#b97a5e',
    shape: [{ w: 8, h: 24, d: 1 , z: -3.5 }, { w: 8, h: 24, d: 1, z: 3.5 }, { w: 1, h: 24, d: 6, x: -3.5 }, { w: 1, h: 24, d: 6, x: 3.5 }] },
  { id: 'tile', n: 'Terracotta tile 12×12', cat: 'clay', mat: 'clay', T: .5, W: 12, L: 12, price: 2, unit: 'each', fixed: true, color: '#c4785a' },

  /* ---- beds & play ---- */
  { id: 'mat_twin', n: 'Twin mattress 38×75', cat: 'bed', mat: 'fabric', T: 8, W: 38, L: 75, price: 150, unit: 'each', fixed: true, color: '#e3e6ec' },
  { id: 'mat_twinxl', n: 'Twin XL mattress 38×80', cat: 'bed', mat: 'fabric', T: 8, W: 38, L: 80, price: 180, unit: 'each', fixed: true, color: '#e3e6ec' },
  { id: 'mat_full', n: 'Full mattress 54×75', cat: 'bed', mat: 'fabric', T: 8, W: 54, L: 75, price: 220, unit: 'each', fixed: true, color: '#e3e6ec' },
  { id: 'mat_toddler', n: 'Toddler mattress 28×52', cat: 'bed', mat: 'fabric', T: 5, W: 28, L: 52, price: 90, unit: 'each', fixed: true, color: '#e6e9ee' },
  { id: 'pillow', n: 'Pillow 20×26', cat: 'bed', mat: 'fabric', T: 5, W: 20, L: 26, price: 15, unit: 'each', fixed: true, color: '#f3f3f1' },
  { id: 'playmat', n: 'Foam play mat 48×48', cat: 'playroom', mat: 'fabric', T: 2, W: 48, L: 48, price: 60, unit: 'each', fixed: true, color: '#6fa1c9' },
  { id: 'beanbag', n: 'Bean bag 36"', cat: 'bed', mat: 'fabric', T: 24, W: 36, L: 36, price: 80, unit: 'each', fixed: true, color: '#c95a5a' },
];

STOCK.push(
  /* ---- lighting & shade ---- */
  { id: 'string', n: 'String lights', cat: 'light', mat: 'light', T: 12, W: 2, L: 240, maxL: 600, lengths: [288, 576], price: 1.2, unit: 'ft', color: '#2a2c2f' },
  { id: 'lantern_hang', n: 'Hanging lantern', cat: 'light', mat: 'light', T: 10, W: 6, L: 6, price: 28, unit: 'each', fixed: true, color: '#2b2d30' },
  { id: 'sconce', n: 'Wall lantern', cat: 'light', mat: 'light', T: 5, W: 12, L: 6, price: 45, unit: 'each', fixed: true, attach: true, color: '#2b2d30' },
  { id: 'lantern_table', n: 'Table lantern', cat: 'light', mat: 'light', T: 12, W: 6, L: 6, price: 22, unit: 'each', fixed: true, color: '#2b2d30' },
  { id: 'pathlight', n: 'Solar path light', cat: 'light', mat: 'light', T: 17, W: 4, L: 4, price: 12, unit: 'each', fixed: true, color: '#3a3d40' },
  { id: 'tiki', n: 'Tiki torch 5 ft', cat: 'light', mat: 'light', T: 62, W: 4, L: 4, price: 15, unit: 'each', fixed: true, color: '#8a6a45' },
  { id: 'umbrella_cant', n: 'Cantilever umbrella 10 ft', cat: 'light', mat: 'fabric', T: 100, W: 120, L: 140, price: 450, unit: 'each', fixed: true, color: '#c9c2ae' },
  { id: 'umbrella', n: 'Patio umbrella 9 ft', cat: 'light', mat: 'fabric', T: 96, W: 108, L: 108, price: 120, unit: 'each', fixed: true, color: '#c9c2ae' },
  { id: 'heater', n: 'Patio heater 7 ft', cat: 'light', mat: 'appliance', T: 88, W: 32, L: 32, price: 180, unit: 'each', fixed: true, color: '#b9bdc1' },

  /* ---- patio furniture (L = width, W = depth, T = height) ---- */
  { id: 'dining_table', n: 'Patio dining table 60"', cat: 'furniture', mat: 'furniture', T: 29, W: 36, L: 60, price: 350, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'patio_chair', n: 'Patio dining chair', cat: 'furniture', mat: 'furniture', T: 34, W: 22, L: 22, price: 85, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'adirondack', n: 'Adirondack chair', cat: 'furniture', mat: 'furniture', T: 36, W: 34, L: 30, price: 120, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'lounge', n: 'Chaise lounge', cat: 'furniture', mat: 'furniture', T: 36, W: 76, L: 28, price: 180, unit: 'each', fixed: true, color: '#5b7c99' },
  { id: 'bench', n: 'Garden bench 4 ft', cat: 'furniture', mat: 'furniture', T: 34, W: 22, L: 48, price: 140, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'picnic', n: 'Picnic table 6 ft', cat: 'furniture', mat: 'furniture', T: 30, W: 60, L: 72, price: 220, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'side_table', n: 'Side table 18"', cat: 'furniture', mat: 'furniture', T: 20, W: 18, L: 18, price: 45, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'porch_swing', n: 'Porch swing 4 ft', cat: 'furniture', mat: 'furniture', T: 60, W: 24, L: 48, price: 160, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'hammock', n: 'Hammock with stand', cat: 'furniture', mat: 'furniture', T: 40, W: 48, L: 110, price: 150, unit: 'each', fixed: true, color: '#d8cdb8' },
  { id: 'rug', n: 'Outdoor rug 8×6 ft', cat: 'furniture', mat: 'fabric', T: .5, W: 72, L: 96, price: 90, unit: 'each', fixed: true, color: '#2f4a6b' },
  { id: 'cooler', n: 'Cooler', cat: 'furniture', mat: 'appliance', T: 17, W: 16, L: 26, price: 60, unit: 'each', fixed: true, color: '#3d7bd9' },
  { id: 'fire_table', n: 'Fire table 44"', cat: 'furniture', mat: 'stone', T: 24, W: 44, L: 44, price: 450, unit: 'each', fixed: true, color: '#b8bab5' },
  { id: 'chiminea', n: 'Clay chiminea', cat: 'furniture', mat: 'clay', T: 48, W: 24, L: 24, price: 150, unit: 'each', fixed: true, color: '#c4785a' },

  /* ---- garden & yard ---- */
  { id: 'raised_bed', n: 'Raised garden bed 8×4 ft', cat: 'garden', mat: 'furniture', T: 18, W: 48, L: 96, price: 160, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'planter', n: 'Planter box 36"', cat: 'garden', mat: 'furniture', T: 14, W: 12, L: 36, price: 55, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'pot', n: 'Terracotta pot 20"', cat: 'garden', mat: 'clay', T: 24, W: 20, L: 20, price: 40, unit: 'each', fixed: true, color: '#c4785a' },
  { id: 'trellis', n: 'Garden trellis 4×6 ft', cat: 'garden', mat: 'furniture', T: 72, W: 2, L: 48, price: 45, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'rain_barrel', n: 'Rain barrel 50 gal', cat: 'garden', mat: 'appliance', T: 36, W: 24, L: 24, price: 110, unit: 'each', fixed: true, color: '#2f4a5e' },
  { id: 'birdbath', n: 'Bird bath', cat: 'garden', mat: 'stone', T: 30, W: 20, L: 20, price: 75, unit: 'each', fixed: true, color: '#b8bab5' },
  { id: 'fence', n: 'Fence panel 8×6 ft', cat: 'garden', mat: 'furniture', T: 72, W: 4, L: 96, price: 80, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'gate', n: 'Garden gate 42"', cat: 'garden', mat: 'furniture', T: 48, W: 4, L: 42, price: 120, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'shed', n: 'Garden shed 8×6 ft', cat: 'garden', mat: 'furniture', T: 90, W: 72, L: 96, price: 1500, unit: 'each', fixed: true, color: '#e9dcc4' },
  { id: 'compost', n: 'Compost bin', cat: 'garden', mat: 'appliance', T: 32, W: 30, L: 30, price: 70, unit: 'each', fixed: true, color: '#1b1c1e' },
  { id: 'hose', n: 'Hose reel cart', cat: 'garden', mat: 'appliance', T: 36, W: 18, L: 24, price: 50, unit: 'each', fixed: true, color: '#3a8f5c' },
  { id: 'doghouse', n: 'Dog house', cat: 'garden', mat: 'furniture', T: 34, W: 30, L: 36, price: 160, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'shower', n: 'Outdoor shower', cat: 'garden', mat: 'furniture', T: 90, W: 36, L: 36, price: 400, unit: 'each', fixed: true, color: '#b08a5c' },

  /* ---- play & fun ---- */
  { id: 'swing', n: 'Swing set 8 ft', cat: 'play', mat: 'play', T: 84, W: 72, L: 96, price: 350, unit: 'each', fixed: true, color: '#3a8f5c' },
  { id: 'slide', n: 'Slide 8 ft', cat: 'play', mat: 'play', T: 48, W: 22, L: 96, price: 150, unit: 'each', fixed: true, color: '#3d7bd9' },
  { id: 'sandbox', n: 'Sandbox 5×5 ft', cat: 'play', mat: 'furniture', T: 10, W: 60, L: 60, price: 120, unit: 'each', fixed: true, color: '#d9c69a' },
  { id: 'trampoline', n: 'Trampoline 12 ft', cat: 'play', mat: 'play', T: 108, W: 144, L: 144, price: 400, unit: 'each', fixed: true, color: '#2b2d30' },
  { id: 'pool', n: 'Kiddie pool 5 ft', cat: 'play', mat: 'play', T: 15, W: 60, L: 60, price: 30, unit: 'each', fixed: true, color: '#3d7bd9' },
  { id: 'hot_tub', n: 'Hot tub 7 ft', cat: 'play', mat: 'appliance', T: 36, W: 84, L: 84, price: 4000, unit: 'each', fixed: true, color: '#6b6055' },
  { id: 'hoop', n: 'Basketball hoop', cat: 'play', mat: 'play', T: 132, W: 36, L: 48, price: 300, unit: 'each', fixed: true, color: '#f3f3f0' },
  { id: 'cornhole', n: 'Cornhole board', cat: 'play', mat: 'furniture', T: 12, W: 48, L: 24, price: 80, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'water_table', n: 'Water table', cat: 'play', mat: 'play', T: 24, W: 24, L: 36, price: 60, unit: 'each', fixed: true, color: '#3d7bd9' },
  { id: 'playhouse', n: 'Playhouse 5×4 ft', cat: 'play', mat: 'furniture', T: 66, W: 48, L: 60, price: 500, unit: 'each', fixed: true, color: '#e9dcc4' },
  { id: 'spring_rider', n: 'Spring rider', cat: 'play', mat: 'play', T: 30, W: 12, L: 30, price: 130, unit: 'each', fixed: true, color: '#f2c744' },
  { id: 'climbing_dome', n: 'Climbing dome 6 ft', cat: 'play', mat: 'play', T: 40, W: 72, L: 72, price: 250, unit: 'each', fixed: true, color: '#e04b3c' },
  { id: 'balance_beam', n: 'Balance beam 8 ft', cat: 'play', mat: 'furniture', T: 12, W: 6, L: 96, price: 90, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'tetherball', n: 'Tetherball', cat: 'play', mat: 'play', T: 96, W: 24, L: 24, price: 70, unit: 'each', fixed: true, color: '#f2c744' },
  { id: 'seesaw', n: 'Seesaw 8 ft', cat: 'play', mat: 'play', T: 30, W: 14, L: 96, price: 120, unit: 'each', fixed: true, color: '#3a8f5c' },
  { id: 'kids_picnic', n: 'Kids picnic table', cat: 'play', mat: 'furniture', T: 20, W: 36, L: 36, price: 80, unit: 'each', fixed: true, color: '#b08a5c' },

  /* ---- indoor playroom ---- */
  { id: 'play_kitchen', n: 'Play kitchen', cat: 'playroom', mat: 'play', T: 38, W: 14, L: 36, price: 130, unit: 'each', fixed: true, color: '#f3f3f0' },
  { id: 'cube_storage', n: 'Cube storage 3×3', cat: 'playroom', mat: 'furniture', T: 42, W: 15, L: 42, price: 90, unit: 'each', fixed: true, color: '#f3f3f0' },
  { id: 'bookshelf', n: 'Kids bookshelf', cat: 'playroom', mat: 'furniture', T: 36, W: 10, L: 30, price: 70, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'teepee', n: 'Play teepee', cat: 'playroom', mat: 'fabric', T: 62, W: 48, L: 48, price: 60, unit: 'each', fixed: true, color: '#c9c2ae' },
  { id: 'ballpit', n: 'Ball pit 4×4 ft', cat: 'playroom', mat: 'play', T: 20, W: 48, L: 48, price: 80, unit: 'each', fixed: true, color: '#3d7bd9' },
  { id: 'pikler', n: 'Climbing triangle', cat: 'playroom', mat: 'furniture', T: 32, W: 34, L: 36, price: 150, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'rocking_horse', n: 'Rocking horse', cat: 'playroom', mat: 'furniture', T: 26, W: 12, L: 32, price: 70, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'easel', n: 'Art easel', cat: 'playroom', mat: 'furniture', T: 44, W: 24, L: 24, price: 50, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'kids_table', n: 'Kids table 30"', cat: 'playroom', mat: 'furniture', T: 22, W: 30, L: 30, price: 60, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'kids_chair', n: 'Kids chair', cat: 'playroom', mat: 'furniture', T: 22, W: 13, L: 13, price: 25, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'toy_chest', n: 'Toy chest 36"', cat: 'playroom', mat: 'furniture', T: 20, W: 18, L: 36, price: 90, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'play_rug', n: 'Round play rug 6 ft', cat: 'playroom', mat: 'fabric', T: .5, W: 72, L: 72, price: 60, unit: 'each', fixed: true, color: '#3d7bd9' },
  { id: 'floor_cushion', n: 'Floor cushion 24"', cat: 'playroom', mat: 'fabric', T: 5, W: 24, L: 24, price: 30, unit: 'each', fixed: true, color: '#5b7c99' },
  { id: 'sensory_swing', n: 'Sensory pod swing', cat: 'playroom', mat: 'fabric', T: 72, W: 40, L: 40, price: 45, unit: 'each', fixed: true, color: '#3d7bd9' },
  { id: 'tunnel', n: 'Play tunnel 6 ft', cat: 'playroom', mat: 'fabric', T: 20, W: 20, L: 72, price: 25, unit: 'each', fixed: true, color: '#3d7bd9' },
  { id: 'chalkboard', n: 'Chalkboard 4×3 ft', cat: 'playroom', mat: 'furniture', T: 1.5, W: 36, L: 48, price: 40, unit: 'each', fixed: true, attach: true, color: '#2e4a3a' },
  { id: 'foam_blocks', n: 'Foam block set', cat: 'playroom', mat: 'play', T: 12, W: 24, L: 36, price: 120, unit: 'each', fixed: true, color: '#d94f3d' },
  { id: 'train_table', n: 'Train table', cat: 'playroom', mat: 'furniture', T: 18, W: 32, L: 48, price: 150, unit: 'each', fixed: true, color: '#b08a5c' },
  { id: 'mini_tramp', n: 'Mini trampoline', cat: 'playroom', mat: 'play', T: 36, W: 40, L: 40, price: 70, unit: 'each', fixed: true, color: '#3d7bd9' },
  { id: 'puppet', n: 'Puppet theater', cat: 'playroom', mat: 'furniture', T: 54, W: 16, L: 30, price: 80, unit: 'each', fixed: true, color: '#d94f3d' },
  { id: 'dollhouse', n: 'Dollhouse', cat: 'playroom', mat: 'furniture', T: 36, W: 14, L: 30, price: 120, unit: 'each', fixed: true, color: '#f3e3e6' },
  { id: 'indoor_slide', n: 'Indoor slide', cat: 'playroom', mat: 'play', T: 30, W: 20, L: 60, price: 90, unit: 'each', fixed: true, color: '#48a05a' },
);

export const QUICK_FIXTURES = ['grill_drop', 'traeger', 'pizza_oven', 'fridge', 'counter', 'cabdoor', 'mat_twin', 'beanbag', 'string', 'lantern_hang', 'umbrella_cant', 'dining_table', 'swing', 'play_kitchen'];

export const QUICK_STOCK = ['2x4', '2x6', '4x4', 'ply12', 'brick', 'block', 'tube', 'rope', 'hold'];

export function stockById(id) {
  return STOCK.find(s => s.id === id);
}

export const SNAPS = [1, 6, 12];
