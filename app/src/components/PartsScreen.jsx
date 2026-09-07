import { MATS, PARTS, STOCK } from '../data.js';
import { fmtIn } from '../logic.js';

const CATS = { lumber: 'Lumber', sheet: 'Sheets', masonry: 'Masonry', metal: 'Metal', rope: 'Rope', holds: 'Holds' };

export default function PartsScreen({ filter, setFilter, addPart, addPiece, catalog, setCatalog }) {
  const filters = ['all', ...Object.keys(MATS)];
  const assemblies = PARTS.filter(p => p.k !== 'mass' && (filter === 'all' || p.mat === filter));
  const stock = STOCK.filter(s => filter === 'all' || s.mat === filter);

  const price = s => `$${s.price}${s.unit === 'ft' ? '/ft' : s.unit === 'sheet' ? '/sheet' : ' each'}`;

  return (
    <div className="panel narrow">
      <div style={{ display: 'flex', gap: 10, padding: '12px 16px 0', alignItems: 'center' }}>
        <div style={{ display: 'flex', border: '1px solid var(--line-24)', flex: 'none' }}>
          <div className={'seg' + (catalog === 'pieces' ? ' on' : '')} style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => setCatalog('pieces')}>Pieces</div>
          <div className={'seg' + (catalog === 'parts' ? ' on' : '')} style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => setCatalog('parts')}>Assemblies</div>
        </div>
        <div style={{ font: '500 10px "IBM Plex Mono",monospace', color: 'var(--ink-55)', lineHeight: 1.4 }}>
          {catalog === 'pieces' ? 'Real stock at actual dimensions. Cut to length in Build.' : 'Ready-made parts on a 1 ft grid.'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, padding: '12px 16px', overflowX: 'auto', borderBottom: '1px solid var(--line)' }}>
        {filters.map(f => (
          <div
            key={f}
            onClick={() => setFilter(f)}
            style={{
              flex: 'none', padding: '6px 12px', cursor: 'pointer',
              font: '600 11px "Barlow Condensed",sans-serif', letterSpacing: '.08em', textTransform: 'uppercase',
              border: '1px solid ' + (filter === f ? 'var(--steel)' : 'var(--line-2)'),
              background: filter === f ? 'var(--steel-tint)' : 'transparent',
            }}
          >
            {f === 'all' ? 'Everything' : MATS[f].n}
          </div>
        ))}
      </div>

      {catalog === 'pieces' && stock.map((s, i) => {
        const showCat = i === 0 || stock[i - 1].cat !== s.cat;
        const gw = Math.max(6, Math.min(40, s.W * 2.6)), gh = Math.max(3, Math.min(40, s.T * 2.6));
        return (
          <div key={s.id}>
            {showCat && (
              <div className="mono" style={{ color: 'var(--steel)', padding: '12px 16px 2px' }}>{CATS[s.cat]}</div>
            )}
            <div style={{ display: 'flex', gap: 12, padding: '10px 16px', borderBottom: '1px solid rgba(29,31,32,.12)', alignItems: 'center' }}>
              <div style={{ flex: 'none', width: 52, height: 52, border: '1px solid var(--line-2)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 6, background: 'var(--bg)' }}>
                <div style={{ width: gw, height: gh, background: MATS[s.mat].c, border: '1px solid rgba(29,31,32,.3)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '600 18px/1.1 "Barlow Condensed",sans-serif' }}>{s.n}</div>
                <div style={{ font: '500 11px "IBM Plex Mono",monospace', color: 'var(--ink-55)', marginTop: 2 }}>
                  {s.T} × {s.W} in{s.unit === 'each' ? ` × ${s.L} in` : ` · ${fmtIn(s.L)}${s.maxL > s.L ? ` (up to ${fmtIn(s.maxL)})` : ''}`} · {price(s)}
                </div>
              </div>
              <div
                onClick={() => addPiece(s.id)}
                style={{ flex: 'none', padding: '8px 12px', border: '1px solid var(--steel-btn)', color: 'var(--steel-deep)', font: '600 12px "Barlow Condensed",sans-serif', letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                Add
              </div>
            </div>
          </div>
        );
      })}

      {catalog === 'parts' && assemblies.map(p => (
        <div key={p.k} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid rgba(29,31,32,.12)', alignItems: 'center' }}>
          <div style={{ flex: 'none', width: 52, height: 52, border: '1px solid var(--line-2)', display: 'flex', alignItems: 'flex-end', padding: 6, background: 'var(--bg)' }}>
            <div style={{ width: '100%', height: p.k === 'pad' ? 20 : p.k === 'platform' ? 12 : 34, background: MATS[p.mat].c, border: '1px solid rgba(29,31,32,.3)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '600 18px/1.1 "Barlow Condensed",sans-serif' }}>{p.n}</div>
            <div style={{ font: '500 11px "IBM Plex Mono",monospace', color: 'var(--ink-55)', marginTop: 2 }}>
              {p.s} · {MATS[p.mat].n} · ${p.cost}
            </div>
          </div>
          <div
            onClick={() => addPart(p.k)}
            style={{ flex: 'none', padding: '8px 12px', border: '1px solid var(--steel-btn)', color: 'var(--steel-deep)', font: '600 12px "Barlow Condensed",sans-serif', letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Add
          </div>
        </div>
      ))}
    </div>
  );
}
