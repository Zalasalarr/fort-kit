import { MATS, PARTS } from '../data.js';

export default function PartsScreen({ filter, setFilter, addPart }) {
  const filtered = PARTS.filter(p => filter === 'all' || p.mat === filter);
  const filters = ['all', ...Object.keys(MATS)];

  return (
    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
      <div style={{ display: 'flex', gap: 6, padding: '12px 16px', overflowX: 'auto', borderBottom: '1px solid var(--line)' }}>
        {filters.map(f => (
          <div
            key={f}
            onClick={() => setFilter(f)}
            style={{
              flex: 'none',
              padding: '6px 12px',
              cursor: 'pointer',
              font: '600 11px "Barlow Condensed",sans-serif',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              border: '1px solid ' + (filter === f ? 'var(--steel)' : 'var(--line-2)'),
              background: filter === f ? 'var(--steel-tint)' : 'transparent',
            }}
          >
            {f === 'all' ? 'Everything' : MATS[f].n}
          </div>
        ))}
      </div>

      {filtered.map(p => (
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
