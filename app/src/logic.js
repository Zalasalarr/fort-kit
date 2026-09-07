import { MATS, MASS_CUTS, MASS_COST_PER_FT, FOOTPRINT, CELL_FT, PLAN_N, partByKey } from './data.js';

export function costOf(p) {
  if (p.k === 'mass') return Math.round(MASS_COST_PER_FT * p.h * MATS[p.mat].rate);
  const def = partByKey(p.k);
  return Math.round(def.cost * MATS[p.mat].rate / MATS[def.mat].rate);
}

export function cost(parts) {
  return parts.reduce((t, p) => t + costOf(p), 0);
}

export function cutsFor(p) {
  return p.k === 'mass' ? MASS_CUTS[p.mat](p.h) : partByKey(p.k).cuts;
}

export function cutList(parts) {
  const cutMap = {};
  parts.forEach(p => cutsFor(p).forEach(([label, qty]) => {
    cutMap[label] = (cutMap[label] || 0) + qty;
  }));
  return Object.keys(cutMap).map(label => ({ label, qty: cutMap[label] }));
}

export function partName(p) {
  return p.k === 'mass' ? `Mass block ${p.h} ft` : partByKey(p.k).n;
}

export function partSize(p) {
  return p.k === 'mass' ? `2×2 ft · ${p.h} ft high` : partByKey(p.k).s;
}

export function annotation(p) {
  return `${partName(p)} · ${p.lvl ? p.lvl + ' ft' : 'ground'} · ${MATS[p.mat].n}`;
}

export function footprint(p) {
  let [hx, hz] = FOOTPRINT[p.k];
  if ((p.rot || 0) % 2) [hx, hz] = [hz, hx];
  return { minX: p.x - hx, maxX: p.x + hx, minZ: p.z - hz, maxZ: p.z + hz };
}

export function outsideYard(parts, yard) {
  const hw = yard.w / 2, hd = yard.d / 2;
  return parts.filter(p => {
    const f = footprint(p);
    return f.minX < -hw || f.maxX > hw || f.minZ < -hd || f.maxZ > hd;
  });
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

  checks.push(parts.some(p => p.k === 'climb')
    ? { ok: true, t: `Climbing panel holds set for ages ${yard.age} — spacing 9–14 in.` }
    : { ok: true, t: 'No climbing panel yet. Add one from Parts to get hold spacing checks.' });

  if (total > yard.budget) {
    checks.push({ ok: false, t: `Estimate is $${total - yard.budget} over your ceiling.` });
  }

  return checks;
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
