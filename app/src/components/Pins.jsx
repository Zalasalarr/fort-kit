import { useEffect, useMemo, useRef } from 'react';
import { annotation, groupsOf, groupLabel } from '../logic.js';

const TRIES = [0, -34, 34, -68, 68, -102, 102, -136, 136, -170, 170];
const PAD = 6;

export default function Pins({ view, parts, sel, onPick }) {
  const rootRef = useRef(null);

  // One pin per ungrouped part, one per group
  const items = useMemo(() => {
    const out = [];
    const groups = groupsOf(parts);
    const seen = new Set();
    parts.forEach((p, i) => {
      if (p.grp) {
        if (seen.has(p.grp)) return;
        seen.add(p.grp);
        const g = groups.get(p.grp);
        out.push({ key: 'g' + p.grp, label: groupLabel(parts, g), indices: g.indices, first: i });
      } else {
        out.push({ key: 'p' + i, label: annotation(p), indices: [i], first: i });
      }
    });
    return out;
  }, [parts]);

  useEffect(() => {
    if (!view) return;
    const layout = () => {
      const root = rootRef.current;
      if (!root) return;
      const W = view.canvas.clientWidth, H = root.clientHeight || view.canvas.clientHeight;
      const placed = [];
      const els = [...root.querySelectorAll('[data-key]')];
      const byKey = new Map(items.map(it => [it.key, it]));
      els.sort((a, b) => {
        const ia = byKey.get(a.dataset.key), ib = byKey.get(b.dataset.key);
        return (ib && ib.indices.includes(sel)) - (ia && ia.indices.includes(sel));
      });
      els.forEach(el => {
        const it = byKey.get(el.dataset.key);
        if (!it) { el.style.display = 'none'; return; }
        let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity, top = -Infinity;
        it.indices.forEach(i => {
          const b = view.aabbs[i];
          if (!b) return;
          minX = Math.min(minX, b.min.x); maxX = Math.max(maxX, b.max.x);
          minZ = Math.min(minZ, b.min.z); maxZ = Math.max(maxZ, b.max.z);
          top = Math.max(top, b.max.y);
        });
        if (!isFinite(top)) { el.style.display = 'none'; return; }
        const a = view.project((minX + maxX) / 2, top + .2, (minZ + maxZ) / 2);
        if (a.x < -40 || a.x > W + 40 || a.y < -40 || a.y > H + 40) { el.style.display = 'none'; return; }
        const label = el.firstElementChild;
        const lw = label.offsetWidth || 120, lh = label.offsetHeight || 22;
        const half = lw / 2 + PAD;
        const x = Math.max(half, Math.min(W - half, a.x));
        let y = a.y - 14;
        const collides = yy => placed.some(q => Math.abs(q.y - yy) < lh + 6 && Math.abs(q.x - x) < (q.half + half));
        const inside = yy => yy - lh >= PAD && yy <= H - PAD;
        let found = false;
        for (const o of TRIES) {
          if (inside(y + o) && !collides(y + o)) { y = y + o; found = true; break; }
        }
        if (!found) { el.style.display = 'none'; return; }
        placed.push({ x, y, half });
        el.style.display = '';
        el.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`;
        const stem = el.lastElementChild;
        stem.style.height = Math.max(0, Math.round(a.y - y)) + 'px';
        stem.style.left = Math.round(a.x - x) + 'px';
      });
    };
    view.afterDraw = layout;
    layout();
    return () => { if (view.afterDraw === layout) view.afterDraw = null; };
  }, [view, items, sel]);

  return (
    <div ref={rootRef} className="pins">
      {items.map(it => (
        <div
          key={it.key}
          data-key={it.key}
          className={'pin' + (it.indices.includes(sel) ? ' on' : '') + (onPick ? ' pickable' : '')}
          onClick={onPick ? () => onPick(it.first) : undefined}
        >
          <div className="pin-label">{it.label}</div>
          <div className="pin-stem" />
        </div>
      ))}
    </div>
  );
}
