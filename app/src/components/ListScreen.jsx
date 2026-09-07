import { fmtIn } from '../logic.js';

export default function ListScreen({ section = 'safety', checks, cuts, buys = [], total, budget, onShare, onPrint, hasParts, onYard }) {
  const barPct = Math.min(100, Math.round((total / budget) * 100));
  const over = total > budget;

  if (section === 'cuts') {
    return (
      <div className="panel narrow" style={{ paddingBottom: 20 }}>
        <div className="sect" style={{ marginTop: 6 }}>Cut &amp; buy list <span>every piece, grouped by stock and length</span></div>
        {cuts.length === 0 && <div className="hint">Nothing to cut yet — add parts in Build.</div>}
        {cuts.map((r, i) => (
          <div key={i} className="list-row">
            <div>{r.label}</div>
            <div className="list-qty">×{r.qty}</div>
          </div>
        ))}
        {buys.length > 0 && (
          <>
            <div className="sect">Stock to buy <span>cuts packed onto boards, ⅛" kerf per cut</span></div>
            {buys.map((b, i) => (
              <div key={i} className="list-row">
                <div>{b.label}</div>
                <div className="list-qty">{b.lines.join(' · ')}{b.waste > 0 ? ` · ${fmtIn(b.waste)} offcut` : ''}</div>
              </div>
            ))}
          </>
        )}
        <div style={{ margin: '18px 16px 0', display: 'flex', gap: 8 }}>
          <div className={'btn-outline' + (hasParts ? '' : ' disabled')} onClick={onPrint}>Print the list &amp; drawing</div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel narrow" style={{ paddingBottom: 20 }}>
      <div className="est-box">
        <span className="tick tl" /><span className="tick tr" /><span className="tick bl" /><span className="tick br" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div className="mono" style={{ color: 'var(--grey)' }}>Materials estimate</div>
            <div className="hint" style={{ padding: '4px 0 0' }}>{over ? `$${total - budget} over` : `$${budget - total} left of`} your ${budget} ceiling · <span className="link" onClick={onYard}>change it in Yard</span></div>
          </div>
          <div style={{ font: '600 34px/1 "Barlow Condensed",sans-serif' }}>${total}</div>
        </div>
        <div style={{ height: 8, background: '#d4d4d7', margin: '12px 0 0', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: barPct + '%', background: over ? 'var(--ink)' : 'var(--steel)' }} />
        </div>
      </div>

      <div className="sect">Safety read <span>checked against play-structure guidance</span></div>
      {checks.map((k, i) => (
        <div key={i} className="check-row">
          <div className={'mark ' + (k.ok ? 'ok' : 'fix')} />
          <div>{k.t}</div>
        </div>
      ))}

      <div style={{ margin: '18px 16px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div className="btn-primary" style={{ padding: '12px 18px', fontSize: 15 }} onClick={onShare}>Share this build as a link</div>
        <div className={'btn-outline' + (hasParts ? '' : ' disabled')} onClick={onPrint}>Print the list &amp; drawing</div>
      </div>
      <div className="hint">The link carries the whole build — open it on any device to see and edit this exact project.</div>
    </div>
  );
}
