import { useRef, useState } from 'react';
import { MATS } from '../data.js';
import { partName, heightLabel, positionLabel } from '../logic.js';
import Viewport from './Viewport.jsx';

const SPEC_TABS = [['parts', 'Parts'], ['cuts', 'Cut list'], ['safety', 'Safety']];
const VIEW_TABS = [['iso', 'Iso'], ['plan', 'Plan'], ['front', 'Front'], ['side', 'Side']];

export default function SheetScreen({ project, cuts, checks, total, specTab, setSpecTab, onExport }) {
  const viewRef = useRef(null);
  const [marks, setMarks] = useState(true);
  const [view, setView] = useState('iso');
  const [real, setReal] = useState(false);
  const { parts, yard } = project;

  const pickView = name => {
    setView(name);
    if (viewRef.current) viewRef.current.setView(name);
  };

  const rows = specTab === 'parts'
    ? parts.map(p => ({ a: partName(p), b: `${MATS[p.mat].n} · ${heightLabel(p)} · at ${positionLabel(p)}` }))
    : specTab === 'cuts'
      ? cuts.map(c => ({ a: c.label, b: '×' + c.qty }))
      : checks.map(c => ({ a: c.t, b: c.ok ? 'ok' : 'fix' }));

  return (
    <div className="editor">
      <Viewport
        className="tall"
        parts={parts} yard={yard} viewRef={viewRef} view="iso" zoom={8.5}
        mode={real ? 'real' : 'blueprint'}
        marks={marks}
        caption="Sheet A-01 · drag to orbit · marks follow"
        emptyText="Nothing to draw yet — build something first"
      >
        <div className="vp-tools">
          {VIEW_TABS.map(([k, n]) => (
            <div key={k} className={'btn-outline' + (view === k ? ' on' : '')} onClick={() => pickView(k)}>{n}</div>
          ))}
          <div className={'btn-outline' + (real ? ' on' : '')} onClick={() => setReal(!real)}>Real</div>
          <div className={'btn-outline' + (marks ? ' on' : '')} onClick={() => setMarks(!marks)}>Marks</div>
        </div>
      </Viewport>

      <div className="side">
        <div style={{ padding: '12px 16px 8px', flex: 'none' }}>
          <div className="mono" style={{ color: 'var(--steel)' }}>Reads as a drawing</div>
          <div style={{ font: '600 24px/1.08 "Barlow Condensed",sans-serif', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {project.name}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {SPEC_TABS.map(([k, n]) => (
              <div
                key={k} onClick={() => setSpecTab(k)}
                style={{
                  flex: 1, textAlign: 'center', padding: '8px 4px', cursor: 'pointer',
                  font: '600 12px "Barlow Condensed",sans-serif', letterSpacing: '.08em', textTransform: 'uppercase',
                  border: '1px solid ' + (specTab === k ? 'var(--steel)' : 'var(--line-2)'),
                  background: specTab === k ? 'var(--steel-tint)' : 'transparent',
                }}
              >
                {n}
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ padding: '0 16px 8px' }}>
          {rows.length === 0 && (
            <div style={{ padding: '14px 0', fontSize: 13, color: 'var(--ink-55)' }}>Nothing here yet.</div>
          )}
          {rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(29,31,32,.1)' }}>
              <div style={{ fontSize: 13, lineHeight: 1.35 }}>{r.a}</div>
              <div style={{ font: '500 12px "IBM Plex Mono",monospace', color: r.b === 'fix' ? 'var(--ink)' : 'var(--ink-6)', whiteSpace: 'nowrap', textTransform: r.b === 'fix' || r.b === 'ok' ? 'uppercase' : 'none' }}>{r.b}</div>
            </div>
          ))}
        </div>

        <div className="panel-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div style={{ font: '500 11px "IBM Plex Mono",monospace', color: 'var(--ink-6)' }}>
              {parts.length} parts · {cuts.length} line items
            </div>
            <div style={{ font: '600 22px/1 "Barlow Condensed",sans-serif' }}>${total}</div>
          </div>
          <div className={'btn-primary' + (parts.length ? '' : ' disabled')} style={{ padding: 12, fontSize: 15 }} onClick={onExport}>Export sheet</div>
          <div style={{ font: '500 10px "IBM Plex Mono",monospace', color: 'var(--ink-55)', marginTop: 7 }}>
            Opens a printable A-01 sheet: drawing, parts, cut list, safety read. Save as PDF from the print dialog.
          </div>
        </div>
      </div>
    </div>
  );
}
