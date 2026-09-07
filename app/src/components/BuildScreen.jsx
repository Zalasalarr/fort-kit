import { MATS, PARTS } from '../data.js';
import { partName } from '../logic.js';
import Viewport from './Viewport.jsx';

const PALETTE = PARTS.filter(p => p.k !== 'mass').slice(0, 8);

export default function BuildScreen({
  parts, sel, yard, maxLvl, marks, setMarks,
  setSel, mutSel, addPart, removeSel, duplicateSel, moveSel, onDragStart, onDragEnd,
}) {
  const selPart = parts[sel];
  const off = selPart ? '' : ' disabled';

  return (
    <div className="editor">
      <Viewport
        parts={parts} sel={sel} yard={yard} pick
        onSelect={setSel} onMove={moveSel} onDragStart={onDragStart} onDragEnd={onDragEnd}
        marks={marks} onPickPin={setSel}
        caption="1 ft grid · drag a part to move · drag space to orbit"
        footer={`${parts.length} parts · ${maxLvl || 0} ft high`}
        emptyText="Nothing built yet — add a part below, or paint one in Plan"
      >
        <div className="vp-tools">
          <div className={'btn-outline' + (marks ? ' on' : '')} onClick={() => setMarks(!marks)}>Marks</div>
        </div>
      </Viewport>

      <div className="side">
        <div className="panel">
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div className="mono" style={{ color: 'var(--steel)' }}>
                Selected{selPart ? ` · ${MATS[selPart.mat].n}` : ''}
              </div>
              <div style={{ font: '600 18px/1.15 "Barlow Condensed",sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selPart ? partName(selPart) : 'Nothing selected'}
              </div>
            </div>
            <div className={'row-gap' + off} style={{ display: 'flex', gap: 6 }}>
              <div className="btn-outline" onClick={() => mutSel(p => { p.rot = ((p.rot || 0) + 1) % 4; })}>Turn</div>
              <div className="btn-outline" onClick={duplicateSel}>Copy</div>
              <div className="btn-outline" onClick={removeSel}>Delete</div>
            </div>
          </div>

          <div className={'grid-2' + off} style={{ borderBottom: '1px solid var(--line)' }}>
            <div style={{ padding: '9px 16px', borderRight: '1px solid var(--line)' }}>
              <div className="mono" style={{ color: 'var(--grey)', marginBottom: 6 }}>Move · 1 ft</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,30px)', gridAutoRows: 26, gap: 3, justifyContent: 'center' }}>
                <span /><div className="step-btn" onClick={() => mutSel(p => { p.z -= 1; })}>▲</div><span />
                <div className="step-btn" onClick={() => mutSel(p => { p.x -= 1; })}>◀</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', font: '500 9px "IBM Plex Mono",monospace', color: 'rgba(29,31,32,.45)' }}>
                  {selPart ? `${selPart.x},${selPart.z}` : '—'}
                </div>
                <div className="step-btn" onClick={() => mutSel(p => { p.x += 1; })}>▶</div>
                <span /><div className="step-btn" onClick={() => mutSel(p => { p.z += 1; })}>▼</div><span />
              </div>
            </div>
            <div style={{ padding: '9px 16px' }}>
              <div className="mono" style={{ color: 'var(--grey)', marginBottom: 6 }}>Height</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button className="step-btn" style={{ width: 34, height: 34, fontSize: 16 }} onClick={() => mutSel(p => { p.lvl = Math.max(0, p.lvl - 1); })}>−</button>
                <div style={{ font: '600 26px/1 "Barlow Condensed",sans-serif', minWidth: 44, textAlign: 'center' }}>
                  {selPart ? `${selPart.lvl} ft` : '—'}
                </div>
                <button className="step-btn" style={{ width: 34, height: 34, fontSize: 16 }} onClick={() => mutSel(p => { p.lvl = Math.min(12, p.lvl + 1); })}>+</button>
              </div>
            </div>
          </div>

          <div className={off} style={{ padding: '10px 16px 8px', borderBottom: '1px solid var(--line)' }}>
            <div className="mono" style={{ color: 'var(--grey)', marginBottom: 7 }}>Material</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {Object.keys(MATS).map(k => (
                <div key={k} className={'chip' + (selPart && selPart.mat === k ? ' on' : '')} onClick={() => mutSel(p => { p.mat = k; })}>
                  <span className="dot" style={{ background: MATS[k].c }} />
                  {MATS[k].n}
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '10px 0 14px' }}>
            <div className="mono" style={{ color: 'var(--grey)', margin: '0 16px 8px' }}>Add a part</div>
            <div className="palette">
              {PALETTE.map(p => (
                <div key={p.k} className="palette-card" onClick={() => addPart(p.k)}>
                  <div style={{ height: 3, width: 26, background: 'var(--steel)', marginBottom: 8 }} />
                  <div style={{ font: '600 15px/1.1 "Barlow Condensed",sans-serif', marginBottom: 3 }}>{p.n}</div>
                  <div style={{ font: '500 10px "IBM Plex Mono",monospace', color: 'var(--ink-55)' }}>{p.s}</div>
                  <div style={{ font: '500 10px "IBM Plex Mono",monospace', color: 'var(--steel-deep)', marginTop: 4 }}>${p.cost}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="kbd-hint">
            <span><kbd>↑↓←→</kbd> move</span>
            <span><kbd>+</kbd><kbd>−</kbd> height</span>
            <span><kbd>R</kbd> turn</span>
            <span><kbd>D</kbd> copy</span>
            <span><kbd>Del</kbd> delete</span>
            <span><kbd>Ctrl</kbd><kbd>Z</kbd> undo</span>
            <span>scroll to zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
}
