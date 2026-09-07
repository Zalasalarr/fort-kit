import { Box3, Euler, Matrix4, Vector3 } from 'three';
import { MATS, MASS_CUTS, MASS_COST_PER_FT, FOOTPRINT, CELL_FT, PLAN_N, partByKey, stockById } from './data.js';

const rad = d => (d * Math.PI) / 180;

/* ---------- formatting ---------- */

export function fmtIn(inches) {
  const v = Math.round(inches * 8) / 8;
  const ft = Math.floor(v / 12), rem = +(v - ft * 12).toFixed(3);
  const r = Number.isInteger(rem) ? String(rem) : String(rem).replace(/^0/, '');
  return ft > 0 ? `${ft}' ${r}"` : `${r}"`;
}

export function money(v) {
  return v < 20 && !Number.isInteger(v) ? v.toFixed(2) : String(Math.round(v));
}

/* ---------- pieces ---------- */

export function isPiece(p) {
  return p.k === 'piece';
}

export function pieceDims(p) {
  const s = stockById(p.stock);
  return { L: p.L ?? s.L, T: s.T, W: p.W ?? s.W };
}

export function pieceMatrix(p) {
  const m = new Matrix4().makeRotationFromEuler(new Euler(rad(p.roll || 0), rad(p.yaw || 0), rad(p.pitch || 0), 'YZX'));
  m.setPosition(p.cx, p.cy, p.cz);
  return m;
}

// World-space box of a piece, in inches
export function pieceAABB(p) {
  const { L, T, W } = pieceDims(p);
  const m = pieceMatrix(p);
  const box = new Box3();
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    box.expandByPoint(new Vector3(sx * L / 2, sy * T / 2, sz * W / 2).applyMatrix4(m));
  }
  return box;
}

// Overall height of each assembly above its base level, in feet
const ASSEMBLY_H = { platform: .35, rail: 3, ladder: 6, wall: 4, climb: 6, net: 6, monkey: 7, roof: .18, pad: .9, post: 6 };

// World-space box of any part, in feet
export function partAABB(p) {
  if (isPiece(p)) {
    const b = pieceAABB(p);
    return new Box3(b.min.divideScalar(12), b.max.divideScalar(12));
  }
  let [hx, hz] = FOOTPRINT[p.k];
  if ((p.rot || 0) % 2) [hx, hz] = [hz, hx];
  const base = p.k === 'platform' && p.lvl > 0 ? 0 : p.lvl;
  const top = p.lvl + (p.k === 'mass' ? p.h : ASSEMBLY_H[p.k] || 1);
  return new Box3(new Vector3(p.x - hx, base, p.z - hz), new Vector3(p.x + hx, top, p.z + hz));
}

export function newPiece(stockId) {
  const s = stockById(stockId);
  const p = { k: 'piece', stock: s.id, mat: s.mat, L: s.L, W: s.W, cx: 0, cy: 0, cz: 48, yaw: 0, pitch: s.upright ? 90 : 0, roll: 0 };
  return restAt(p, 0);
}

// Move a piece vertically so its lowest point sits at `bottom` (inches)
export function restAt(p, bottom) {
  const b = pieceAABB(p);
  return { ...p, cy: p.cy + (bottom - b.min.y) };
}

export function pieceBottom(p) {
  return pieceAABB(p).min.y;
}

// Highest surface (inches) under a piece's footprint among the other parts, or the ground
export function supportUnder(parts, idx) {
  const me = pieceAABB(parts[idx]);
  const inset = .25;
  let top = 0;
  parts.forEach((q, i) => {
    if (i === idx) return;
    const b = partAABB(q);
    const minX = b.min.x * 12, maxX = b.max.x * 12, minZ = b.min.z * 12, maxZ = b.max.z * 12;
    if (me.max.x - inset > minX && me.min.x + inset < maxX && me.max.z - inset > minZ && me.min.z + inset < maxZ) {
      top = Math.max(top, b.max.y * 12);
    }
  });
  return top;
}

// Offset a copy so it lands beside the original: end-to-end for masonry/holds, side-by-side for boards
export function copyOffset(p) {
  const s = stockById(p.stock), { L, W } = pieceDims(p);
  const local = s.cat === 'masonry' || s.attach ? new Vector3(L, 0, 0) : new Vector3(0, 0, W);
  const m = new Matrix4().makeRotationFromEuler(new Euler(rad(p.roll || 0), rad(p.yaw || 0), rad(p.pitch || 0), 'YZX'));
  return local.applyMatrix4(m);
}

/* ---------- names & labels ---------- */

export function partName(p) {
  if (isPiece(p)) {
    const s = stockById(p.stock), { L, W } = pieceDims(p);
    if (s.unit === 'each') return s.n;
    if (s.unit === 'sheet') return `${s.n} · ${W}×${L} in`;
    return `${s.n} · ${fmtIn(L)}`;
  }
  return p.k === 'mass' ? `Mass block ${p.h} ft` : partByKey(p.k).n;
}

export function partSize(p) {
  if (isPiece(p)) {
    const { L, T, W } = pieceDims(p);
    return `${T} × ${W} in · ${fmtIn(L)}`;
  }
  return p.k === 'mass' ? `2×2 ft · ${p.h} ft high` : partByKey(p.k).s;
}

export function heightLabel(p) {
  if (isPiece(p)) {
    const b = pieceBottom(p);
    return b < .5 ? 'ground' : fmtIn(b);
  }
  return p.lvl ? p.lvl + ' ft' : 'ground';
}

export function positionLabel(p) {
  return isPiece(p) ? `${fmtIn(p.cx)}, ${fmtIn(p.cz)}` : `${p.x},${p.z}`;
}

export function annotation(p) {
  return `${partName(p)} · ${heightLabel(p)} · ${MATS[p.mat].n}`;
}

/* ---------- cost & cuts ---------- */

export function costOf(p) {
  if (isPiece(p)) {
    const s = stockById(p.stock), { L, W } = pieceDims(p);
    if (s.unit === 'each') return s.price;
    if (s.unit === 'sheet') return s.price * (W * L) / (s.W * s.L);
    return s.price * L / 12;
  }
  if (p.k === 'mass') return Math.round(MASS_COST_PER_FT * p.h * MATS[p.mat].rate);
  const def = partByKey(p.k);
  return Math.round(def.cost * MATS[p.mat].rate / MATS[def.mat].rate);
}

export function cost(parts) {
  return Math.round(parts.reduce((t, p) => t + costOf(p), 0));
}

export function cutsFor(p) {
  if (isPiece(p)) {
    const s = stockById(p.stock), { L, W } = pieceDims(p);
    if (s.unit === 'each') return [[L < s.L - .01 ? `${s.n}, cut to ${fmtIn(L)}` : s.n, 1]];
    if (s.unit === 'sheet') return [[`${s.n}, ${W}×${L} in`, 1]];
    return [[`${s.n}, ${fmtIn(L)}`, 1]];
  }
  return p.k === 'mass' ? MASS_CUTS[p.mat](p.h) : partByKey(p.k).cuts;
}

export function cutList(parts) {
  const cutMap = {};
  parts.forEach(p => cutsFor(p).forEach(([label, qty]) => {
    cutMap[label] = (cutMap[label] || 0) + qty;
  }));
  return Object.keys(cutMap).map(label => ({ label, qty: cutMap[label] }));
}

// How much stock to buy for the cut-to-length pieces: first-fit-decreasing into stock lengths
export function buyList(parts) {
  const byStock = {};
  parts.filter(isPiece).forEach(p => {
    const s = stockById(p.stock);
    if (s.unit === 'ft') (byStock[s.id] = byStock[s.id] || []).push(pieceDims(p).L);
    if (s.unit === 'sheet') (byStock[s.id] = byStock[s.id] || []).push(pieceDims(p).W * pieceDims(p).L);
  });
  return Object.keys(byStock).map(id => {
    const s = stockById(id);
    if (s.unit === 'sheet') {
      const sheets = Math.ceil(byStock[id].reduce((a, b) => a + b, 0) / (s.W * s.L) * 1.1);
      return { label: s.n, lines: [`${sheets} × ${s.W}×${s.L} in`], waste: null };
    }
    const lengths = byStock[id].slice().sort((a, b) => b - a);
    const longest = lengths[0];
    // Try each stock length that fits the longest piece; keep the one with the least offcut
    let best = null;
    s.lengths.filter(S => S >= longest - .25).forEach(S => {
      const bins = [];
      lengths.forEach(len => {
        const bin = bins.find(b => b.left + .25 >= len);
        if (bin) bin.left -= len + .125; else bins.push({ left: S - len - .125 });
      });
      const waste = bins.reduce((t, b) => t + Math.max(0, b.left), 0);
      if (!best || waste < best.waste - .01) best = { S, count: bins.length, waste };
    });
    if (!best) {
      const S = s.lengths[s.lengths.length - 1];
      best = { S, count: lengths.length, waste: 0 };
    }
    return { label: s.n, lines: [`${best.count} × ${best.S / 12} ft`], waste: best.waste };
  });
}

/* ---------- yard & safety ---------- */

export function footprint(p) {
  const b = partAABB(p);
  return { minX: b.min.x, maxX: b.max.x, minZ: b.min.z, maxZ: b.max.z };
}

export function outsideYard(parts, yard) {
  const hw = yard.w / 2, hd = yard.d / 2;
  return parts.filter(p => {
    const f = footprint(p);
    return f.minX < -hw || f.maxX > hw || f.minZ < -hd || f.maxZ > hd;
  });
}

// Pieces nothing touches and that aren't on the ground (holds attach to faces and ropes hang, so they are exempt)
export function floatingPieces(parts) {
  const boxes = parts.map(p => {
    const b = partAABB(p);
    return { minX: b.min.x * 12, maxX: b.max.x * 12, minZ: b.min.z * 12, maxZ: b.max.z * 12, top: b.max.y * 12, bottom: b.min.y * 12 };
  });
  const out = [];
  parts.forEach((p, i) => {
    if (!isPiece(p)) return;
    const s = stockById(p.stock);
    if (s.attach || s.cat === 'rope') return;
    const me = boxes[i];
    if (me.bottom <= 1) return;
    let touched = false;
    for (let j = 0; j < boxes.length && !touched; j++) {
      if (j === i) continue;
      const b = boxes[j];
      touched = me.maxX + .25 > b.minX && me.minX - .25 < b.maxX && me.maxZ + .25 > b.minZ && me.minZ - .25 < b.maxZ
        && b.bottom <= me.top + .5 && b.top >= me.bottom - .5;
    }
    if (!touched) out.push(p);
  });
  return out;
}

export function maxLevel(parts) {
  return parts.reduce((m, p) => (p.k === 'platform' ? Math.max(m, p.lvl) : m), 0);
}

export function safetyChecks(parts, yard, total) {
  const maxLvl = maxLevel(parts);
  const hasRail = parts.some(p => p.k === 'rail');
  const softGround = yard.ground !== 'Patio';
  const checks = [];

  if (parts.length === 0) {
    checks.push({ ok: true, t: 'Nothing built yet. Add parts in Build or paint a plan to get a safety read.' });
    return checks;
  }

  checks.push(maxLvl >= 4 && !hasRail
    ? { ok: false, t: `Deck sits at ${maxLvl} ft with no guard rail on any side. Add rails above 4 ft.` }
    : { ok: true, t: maxLvl >= 4 ? `Deck at ${maxLvl} ft is railed on at least one side.` : 'Nothing sits above 4 ft — low fall risk.' });

  checks.push(softGround
    ? { ok: true, t: `Fall zone is ${yard.ground.toLowerCase()}. Keep 6 ft clear on every side of the deck.` }
    : { ok: false, t: `Hard surface under a ${maxLvl} ft deck. Add 9 in of mulch or move the build.` });

  const highDecks = parts.filter(p => p.k === 'platform' && p.lvl >= 4);
  if (highDecks.length) {
    const hw = yard.w / 2, hd = yard.d / 2;
    const clearance = Math.min(...highDecks.map(p => {
      const f = footprint(p);
      return Math.min(hw - f.maxX, hw + f.minX, hd - f.maxZ, hd + f.minZ);
    }));
    if (clearance < 6) {
      checks.push({ ok: false, t: `Deck is ${Math.max(0, Math.round(clearance))} ft from the yard edge — the fall zone needs 6 ft clear. Move it inward or widen the yard.` });
    }
  }

  const outside = outsideYard(parts, yard);
  if (outside.length) {
    checks.push({ ok: false, t: `${outside.length} part${outside.length > 1 ? 's sit' : ' sits'} outside the ${yard.w}×${yard.d} ft yard.` });
  }

  const floating = floatingPieces(parts);
  if (floating.length) {
    checks.push({ ok: false, t: `${floating.length} piece${floating.length > 1 ? 's are' : ' is'} floating with nothing underneath. Drop them onto a support or add framing.` });
  }

  checks.push(parts.some(p => p.k === 'climb' || (isPiece(p) && p.stock === 'hold'))
    ? { ok: true, t: `Climbing holds set for ages ${yard.age} — keep spacing 9–14 in.` }
    : { ok: true, t: 'No climbing panel yet. Add one from Parts to get hold spacing checks.' });

  if (total > yard.budget) {
    checks.push({ ok: false, t: `Estimate is $${total - yard.budget} over your ceiling.` });
  }

  return checks;
}

/* ---------- groups ---------- */

export function groupIndices(parts, idx) {
  const g = parts[idx] && parts[idx].grp;
  if (!g) return null;
  return parts.map((p, i) => (p.grp === g ? i : -1)).filter(i => i >= 0);
}

export function groupsOf(parts) {
  const m = new Map();
  parts.forEach((p, i) => {
    if (!p.grp) return;
    if (!m.has(p.grp)) m.set(p.grp, { id: p.grp, name: p.gn || 'Group', indices: [] });
    m.get(p.grp).indices.push(i);
  });
  return m;
}

// Union box of a set of parts, in inches
export function unionAABB(parts, idxs) {
  const box = new Box3();
  idxs.forEach(i => {
    const p = parts[i];
    const b = isPiece(p) ? pieceAABB(p) : partAABB(p).clone();
    if (!isPiece(p)) { b.min.multiplyScalar(12); b.max.multiplyScalar(12); }
    box.union(b);
  });
  return box;
}

export function supportUnderSet(parts, idxs) {
  const set = new Set(idxs);
  const me = unionAABB(parts, idxs);
  const inset = .25;
  let top = 0;
  parts.forEach((q, i) => {
    if (set.has(i)) return;
    const b = partAABB(q);
    const minX = b.min.x * 12, maxX = b.max.x * 12, minZ = b.min.z * 12, maxZ = b.max.z * 12;
    if (me.max.x - inset > minX && me.min.x + inset < maxX && me.max.z - inset > minZ && me.min.z + inset < maxZ) {
      top = Math.max(top, b.max.y * 12);
    }
  });
  return top;
}

export function groupLabel(parts, g) {
  const n = g.indices.length;
  const bottom = unionAABB(parts, g.indices).min.y;
  return `${g.name} · ${n} piece${n > 1 ? 's' : ''} · ${bottom < .5 ? 'ground' : fmtIn(bottom)}`;
}

// One row per ungrouped part and one per group, for the sheet and the print
export function partRows(parts) {
  const rows = [];
  const seen = new Set();
  const groups = groupsOf(parts);
  parts.forEach((p, i) => {
    if (p.grp) {
      if (seen.has(p.grp)) return;
      seen.add(p.grp);
      const g = groups.get(p.grp);
      const total = g.indices.reduce((t, k) => t + costOf(parts[k]), 0);
      rows.push({ a: g.name, b: `${g.indices.length} pieces · ${heightLabel(parts[g.indices[0]])}`, cost: total, i, group: g });
      return;
    }
    rows.push({ a: partName(p), b: `${MATS[p.mat].n} · ${heightLabel(p)} · at ${positionLabel(p)}`, cost: costOf(p), i, p });
  });
  return rows;
}

/* ---------- plan (1b) ---------- */

export function cellKeys(cells) {
  return Object.keys(cells).filter(k => cells[k] && cells[k].h);
}

export function cellPosition(key) {
  const [i, j] = key.split(',').map(Number);
  const off = (PLAN_N - 1) / 2;
  return { x: (i - off) * CELL_FT, z: (j - off) * CELL_FT };
}

export function massParts(cells, fromPlan = false) {
  return cellKeys(cells).map(key => {
    const { x, z } = cellPosition(key);
    const c = cells[key];
    const p = { k: 'mass', x, z, lvl: 0, mat: c.mat, rot: 0, h: c.h };
    if (fromPlan) p.fromPlan = true;
    return p;
  });
}

export function planStats(cells) {
  const keys = cellKeys(cells);
  return {
    squares: keys.length,
    sqft: keys.length * CELL_FT * CELL_FT,
    volume: keys.reduce((t, k) => t + cells[k].h * CELL_FT * CELL_FT, 0),
    cost: keys.reduce((t, k) => t + Math.round(cells[k].h * MASS_COST_PER_FT * MATS[cells[k].mat].rate), 0),
  };
}
