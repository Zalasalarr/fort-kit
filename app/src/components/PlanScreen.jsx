import { useRef } from 'react';
import { MATS, PLAN_N } from '../data.js';
import { massParts, planStats } from '../logic.js';
import Viewport from './Viewport.jsx';

const HEIGHTS = [2, 4, 6, 8];
const TONES = ['', '#d6ebff', '#b5d9fd', '#94bce3', '#749dc4', '#597ea3', '#416180'];

export default function PlanScreen({ cells, brush, setBrush, patchCells, mark, commit, yard, onConvert, onClear }) {
  const painting = useRef(false);
  const lastKey = useRef(null);
  const stats = planStats(cells);
  const preview = massParts(cells);

  const cycle = key => patchCells(c => {
    const cur = c[key] ? c[key].h : 0;
    const h = cur === 0 ? brush.h : (cur >= 10 ? 0 : cur + 2);
    const next = { ...c };
    if (h) next[key] = { h, mat: brush.mat }; else delete next[key];
    return next;
  }, true);

  const paint = key => patchCells(c => {
    if (c[key] && c[key].h === brush.h && c[key].mat === brush.mat) return c;
    return { ...c, [key]: { h: brush.h, mat: brush.mat } };
  }, true);

  const keyAt = (x, y) => {
    const el = document.elementFromPoint(x, y);
    return el && el.dataset ? el.dataset.key || null : null;
  };

  const onDown = e => {
    const key = e.target.dataset.key;
    if (!key) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    painting.current = true; lastKey.current = key;
    mark();
    cycle(key);
  };
  const onMove = e => {
    if (!painting.current) return;
    const key = keyAt(e.clientX, e.clientY);
    if (key && key !== lastKey.current) { lastKey.current = key; paint(key); }
  };
  const onUp = () => {
    if (!painting.current) return;
    painting.current = false; lastKey.current = null;
    commit();
  };

  const grid = [];
  for (let j = 0; j < PLAN_N; j++) for (let i = 0; i < PLAN_N; i++) {
    const key = i + ',' + j, c = cells[key], h = c ? c.h : 0;
    grid.push(
      <div
        key={key} data-key={key} className="cell"
        style={{ background: h ? TONES[Math.min(6, (h / 2 + 1) | 0)] : 'transparent', color: h >= 6 ? 'var(--bg)' : 'var(--ink-55)' }}
      >
        {h || ''}
      </div>
    );
  }

  return (
    <div className="editor">
      <Viewport
        parts={preview} yard={yard} view="iso" zoom={13}
        caption="Live pull-up · drag to orbit"
        footer={`${stats.volume} cu ft mass`}
        emptyText="Tap squares in the plan to lay mass"
      />

      <div className="side">
        <div className="panel" style={{ padding: '12px 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <div className="mono" style={{ color: 'var(--steel)' }}>Draw first, decide later</div>
            <div style={{ font: '600 24px/1.08 "Barlow Condensed",sans-serif', marginTop: 2 }}>Tap squares to lay mass</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div className="mono" style={{ color: 'var(--grey)' }}>Brush</div>
              <div style={{ font: '600 20px/1.1 "Barlow Condensed",sans-serif' }}>{MATS[brush.mat].n} · {brush.h} ft</div>
            </div>
            <div className={'btn-outline' + (stats.squares ? '' : ' disabled')} onClick={onClear}>Clear plan</div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {Object.keys(MATS).map(k => (
              <div key={k} className={'chip' + (brush.mat === k ? ' on' : '')} onClick={() => setBrush({ mat: k })}>
                <span className="dot" style={{ background: MATS[k].c }} />{MATS[k].n}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', border: '1px solid var(--line-24)' }}>
            {HEIGHTS.map(h => (
              <div key={h} className={'seg' + (brush.h === h ? ' on' : '')} onClick={() => setBrush({ h })}>{h} ft</div>
            ))}
          </div>

          <div style={{ border: '1px solid var(--line-2)', padding: 10, background: 'var(--bg)', width: '100%', maxWidth: 460, alignSelf: 'center' }}>
            <div className="plan-grid" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
              {grid}
            </div>
            <div style={{ font: '500 9.5px "IBM Plex Mono",monospace', color: 'var(--ink-55)', marginTop: 8 }}>
              Each square 2 ft · tap to raise, tap again to cycle · drag to paint
            </div>
          </div>
        </div>

        <div className="panel-footer" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ font: '500 11px "IBM Plex Mono",monospace', color: 'var(--ink-6)' }}>
              {stats.squares} squares · {stats.sqft} sq ft footprint
            </div>
            <div style={{ font: '600 24px/1 "Barlow Condensed",sans-serif' }}>${stats.cost}</div>
          </div>
          <div className={'btn-primary' + (stats.squares ? '' : ' disabled')} style={{ padding: 12, fontSize: 15 }} onClick={onConvert}>
            Convert mass to real parts
          </div>
        </div>
      </div>
    </div>
  );
}
