import { fmtIn } from '../logic.js';

export default function ListScreen({ checks, cuts, buys = [], total, budget, onShare, onPrint, hasParts }) {
  const barPct = Math.min(100, Math.round((total / budget) * 100));
  const over = total > budget;

  return (
    <div className="panel narrow" style={{ paddingBottom: 14 }}>
      <div style={{ padding: 16, borderBottom: '1px solid var(--line)' }}>
        <div className="mono" style={{ color: 'var(--steel)', marginBottom: 8 }}>Safety read</div>
        {checks.map((k, i) => (
          <div key={i} style={{ display: 'flex', gap: 9, padding: '7px 0', borderBottom: '1px solid rgba(29,31,32,.09)', alignItems: 'flex-start' }}>
            <div className={'mark ' + (k.ok ? 'ok' : 'fix')} />
            <div style={{ fontSize: 14, lineHeight: 1.4 }}>{k.t}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 16px 6px' }}>
        <div className="mono" style={{ color: 'var(--steel)' }}>Cut &amp; buy list</div>
      </div>
      {cuts.length === 0 && (
        <div style={{ padding: '4px 16px 12px', fontSize: 13, color: 'var(--ink-55)' }}>Nothing to cut yet — add parts in Build.</div>
      )}
      {cuts.map((r, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '7px 16px', borderBottom: '1px solid rgba(29,31,32,.09)' }}>
          <div style={{ fontSize: 14 }}>{r.label}</div>
          <div style={{ font: '500 12px "IBM Plex Mono",monospace', color: 'var(--ink-6)', whiteSpace: 'nowrap' }}>×{r.qty}</div>
        </div>
      ))}

      {buys.length > 0 && (
        <>
          <div style={{ padding: '16px 16px 6px' }}>
            <div className="mono" style={{ color: 'var(--steel)' }}>Stock to buy</div>
            <div style={{ font: '500 10px "IBM Plex Mono",monospace', color: 'var(--ink-55)', marginTop: 4 }}>
              Cut-to-length pieces packed onto stock lengths, ¼ in kerf allowed per cut.
            </div>
          </div>
          {buys.map((b, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '7px 16px', borderBottom: '1px solid rgba(29,31,32,.09)' }}>
              <div style={{ fontSize: 14 }}>{b.label}</div>
              <div style={{ font: '500 12px "IBM Plex Mono",monospace', color: 'var(--ink-6)', textAlign: 'right' }}>
                {b.lines.join(' · ')}{b.waste > 0 ? ` · ${fmtIn(b.waste)} offcut` : ''}
              </div>
            </div>
          ))}
        </>
      )}

      <div style={{ margin: 16, position: 'relative', border: '1px solid var(--line-2)', padding: '13px 16px' }}>
        <span className="tick tl" /><span className="tick tr" /><span className="tick bl" /><span className="tick br" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="mono" style={{ color: 'var(--grey)' }}>Materials estimate</div>
          <div style={{ font: '600 30px/1 "Barlow Condensed",sans-serif' }}>${total}</div>
        </div>
        <div style={{ height: 6, background: '#d4d4d7', margin: '10px 0 6px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: barPct + '%', background: over ? 'var(--ink)' : 'var(--steel)' }} />
        </div>
        <div style={{ font: '500 11px "IBM Plex Mono",monospace', color: 'var(--ink-6)' }}>
          {over ? `$${total - budget} over the $${budget} ceiling` : `$${budget - total} left of the $${budget} ceiling`}
        </div>
      </div>

      <div style={{ margin: '0 16px', display: 'flex', gap: 8 }}>
        <div className="btn-primary" style={{ flex: 1, padding: 12, fontSize: 15 }} onClick={onShare}>Share 3D link</div>
        <div className={'btn-outline' + (hasParts ? '' : ' disabled')} style={{ flex: 'none', padding: '12px 14px', fontSize: 15 }} onClick={onPrint}>Print sheet</div>
      </div>
      <div style={{ margin: '8px 16px 0', font: '500 10px "IBM Plex Mono",monospace', color: 'var(--ink-55)' }}>
        The link carries the whole build — open it on any device to see and edit this exact fort.
      </div>
    </div>
  );
}
