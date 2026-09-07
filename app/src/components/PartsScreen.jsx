import { useState } from 'react';
import { MATS, PARTS, STOCK } from '../data.js';
import { fmtIn } from '../logic.js';

const CATS = { lumber: 'Lumber', sheet: 'Sheets', masonry: 'Masonry', metal: 'Metal', rope: 'Rope', holds: 'Holds', kitchen: 'Outdoor kitchen', clay: 'Clay & tile', bed: 'Beds & play', light: 'Lighting & shade' };

export default function PartsScreen({ filter, setFilter, addPart, addPiece, catalog, setCatalog, library = [], onPlaceCustom, onRenameCustom, onDeleteCustom, onSharePart, onExportLibrary, onImportFile }) {
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [confirm, setConfirm] = useState(null);
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
          <div className={'seg' + (catalog === 'custom' ? ' on' : '')} style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => setCatalog('custom')}>Custom{library.length ? ` · ${library.length}` : ''}</div>
        </div>
        <div style={{ font: '500 10px "IBM Plex Mono",monospace', color: 'var(--ink-55)', lineHeight: 1.4 }}>
          {catalog === 'pieces' ? 'Real stock at actual dimensions. Cut to length in Build.' : catalog === 'custom' ? 'Parts you saved from a build. Kept on this device, available in every project.' : 'Ready-made parts on a 1 ft grid.'}
        </div>
      </div>

      {catalog !== 'custom' && (
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
      )}

      {catalog === 'custom' && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
          <label className="btn-outline" style={{ cursor: 'pointer' }}>
            Import file
            <input type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={e => { onImportFile(e.target.files && e.target.files[0]); e.target.value = ''; }} />
          </label>
          <div className={'btn-outline' + (library.length ? '' : ' disabled')} onClick={onExportLibrary}>Export all</div>
          <div style={{ font: '500 10px "IBM Plex Mono",monospace', color: 'var(--ink-55)', lineHeight: 1.4, flex: 1, minWidth: 180 }}>
            Share a part as a link to send it to another device, or export the whole library as a file and import it there.
          </div>
        </div>
      )}
      {catalog === 'custom' && library.length === 0 && (
        <div style={{ padding: '24px 16px', fontSize: 13, lineHeight: 1.5, color: 'var(--ink-55)', maxWidth: 420 }}>
          No custom parts yet. In Build, select a group or a piece (or nothing, for the whole build) and tap <b style={{ color: 'var(--ink)' }}>Save as part</b>.
        </div>
      )}
      {catalog === 'custom' && library.map(it => (
        <div key={it.id} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid rgba(29,31,32,.12)', alignItems: 'center', marginTop: it === library[0] ? 8 : 0 }}>
          <div style={{ flex: 'none', width: 52, height: 52, border: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', font: '600 16px "Barlow Condensed",sans-serif', color: 'var(--steel-deep)' }}>
            {it.count}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing === it.id ? (
              <input
                className="name-input" style={{ fontSize: 18 }} value={draft} autoFocus maxLength={40}
                onChange={e => setDraft(e.target.value)}
                onBlur={() => { onRenameCustom(it.id, draft); setEditing(null); }}
                onKeyDown={e => { if (e.key === 'Enter') { onRenameCustom(it.id, draft); setEditing(null); } if (e.key === 'Escape') setEditing(null); }}
              />
            ) : (
              <div style={{ font: '600 18px/1.1 "Barlow Condensed",sans-serif', cursor: 'text', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Tap to rename" onClick={() => { setDraft(it.name); setEditing(it.id); }}>{it.name}</div>
            )}
            <div style={{ font: '500 11px "IBM Plex Mono",monospace', color: 'var(--ink-55)', marginTop: 2 }}>
              {it.count} piece{it.count > 1 ? 's' : ''} · ${it.cost} · saved {new Date(it.created).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flex: 'none' }}>
            <div
              onClick={() => onPlaceCustom(it.id)}
              style={{ padding: '8px 12px', border: '1px solid var(--steel-btn)', color: 'var(--steel-deep)', font: '600 12px "Barlow Condensed",sans-serif', letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              Add
            </div>
            <div className="btn-outline" style={{ padding: '8px 10px' }} onClick={() => onSharePart(it.id)}>Share</div>
            {confirm === it.id ? (
              <div className="btn-outline" style={{ padding: '8px 10px', borderColor: 'var(--ink)', background: 'var(--ink)', color: 'var(--bg)' }} onClick={() => { setConfirm(null); onDeleteCustom(it.id); }}>Sure?</div>
            ) : (
              <div className="btn-outline" style={{ padding: '8px 10px' }} onClick={() => setConfirm(it.id)}>Delete</div>
            )}
          </div>
        </div>
      ))}

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
                <div style={{ width: gw, height: gh, background: s.color || MATS[s.mat].c, border: '1px solid rgba(29,31,32,.3)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '600 18px/1.1 "Barlow Condensed",sans-serif' }}>{s.n}</div>
                <div style={{ font: '500 11px "IBM Plex Mono",monospace', color: 'var(--ink-55)', marginTop: 2 }}>
                  {s.unit !== 'ft' && (s.shape || ['kitchen', 'bed', 'light'].includes(s.cat))
                    ? `${s.L} wide × ${s.W} deep × ${s.T} in high`
                    : `${s.T} × ${s.W} in${s.unit === 'each' ? ` × ${s.L} in` : ` · ${fmtIn(s.L)}${s.maxL > s.L ? ` (up to ${fmtIn(s.maxL)})` : ''}`}`} · {price(s)}{s.attach ? ' · sticks to a face' : ''}
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
