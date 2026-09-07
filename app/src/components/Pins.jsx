import { useEffect, useRef } from 'react';
import { annotation } from '../logic.js';

const TRIES = [0, -34, 34, -68, 68, -102, 102, -136, 136, -170, 170];
const PAD = 6;

export default function Pins({ view, parts, sel, onPick }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!view) return;
    const layout = () => {
      const root = rootRef.current;
      if (!root) return;
      const W = view.canvas.clientWidth, H = root.clientHeight || view.canvas.clientHeight;
      const placed = [];
      const els = [...root.querySelectorAll('[data-idx]')];
      // Selected pin is laid out first so it always wins a slot
      els.sort((a, b) => (+b.dataset.idx === sel) - (+a.dataset.idx === sel));
      els.forEach(el => {
        const idx = +el.dataset.idx;
        const b = view.bounds[idx];
        if (!b) { el.style.display = 'none'; return; }
        const a = view.project(b.x, b.top + .2, b.z);
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
  }, [view, parts, sel]);

  return (
    <div ref={rootRef} className="pins">
      {parts.map((p, i) => (
        <div
          key={i}
          data-idx={i}
          className={'pin' + (i === sel ? ' on' : '') + (onPick ? ' pickable' : '')}
          onClick={onPick ? () => onPick(i) : undefined}
        >
          <div className="pin-label">{annotation(p)}</div>
          <div className="pin-stem" />
        </div>
      ))}
    </div>
  );
}
