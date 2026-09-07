import { useState } from 'react';
import { MATS, PARTS, STOCK } from '../data.js';
import { fmtIn } from '../logic.js';
import { TOOLS } from '../generators.js';
import ToolForm from './ToolForm.jsx';

const CATS = [
  ['all', 'Everything'],
  ['tools', 'Tools'],
  ['lumber', 'Lumber & sheets'],
  ['masonry', 'Brick, block & clay'],
  ['metal', 'Metal, rope & holds'],
  ['kitchen', 'Outdoor kitchen'],
  ['furniture', 'Patio furniture'],
  ['garden', 'Garden & yard'],
  ['light', 'Lighting & shade'],
  ['play', 'Play & fun'],
  ['playroom', 'Indoor playroom'],
  ['bed', 'Beds & cushions'],
  ['quick', 'Quick parts'],
  ['custom', 'Yours'],
];

const STOCK_CAT = { lumber: 'lumber', sheet: 'lumber', masonry: 'masonry', clay: 'masonry', metal: 'metal', rope: 'metal', holds: 'metal', kitchen: 'kitchen', bed: 'bed', light: 'light', furniture: 'furniture', garden: 'garden', play: 'play', playroom: 'playroom' };

function price(s) {
  return `$${s.price}${s.unit === 'ft' ? ' per ft' : s.unit === 'sheet' ? ' per sheet' : ' each'}`;
}

function sizeOf(s) {
  if (s.unit === 'each') return `${s.L} × ${s.W} × ${s.T} in`;
  if (s.unit === 'sheet') return `${s.W} × ${s.L} in sheet`;
  return `${s.T} × ${s.W} in · ${fmtIn(s.L)}${s.maxL > s.L ? ` (up to ${fmtIn(s.maxL)})` : ''}`;
}

export default function AddPane({
  cat, setCat, query, setQuery, partsCount,
  tool, toolParams, setTool, setToolParams, onPlaceTool,
  addPart, addPiece, library = [], onPlaceCustom, onSaveWholeBuild,
  onRenameCustom, onDeleteCustom, onSharePart, onExportLibrary, onImportFile,
}) {
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState('My build');

  const q = query.trim().toLowerCase();
  const match = name => !q || name.toLowerCase().includes(q);
  const show = c => cat === 'all' || cat === c;

  const tools = Object.keys(TOOLS).filter(id => show('tools') && match(TOOLS[id].n));
  const stock = STOCK.filter(s => show(STOCK_CAT[s.cat]) && match(s.n));
  const quick = PARTS.filter(p => p.k !== 'mass' && show('quick') && match(p.n));
  const custom = library.filter(it => show('custom') && match(it.name));
  const nothing = !tools.length && !stock.length && !quick.length && !custom.length;

  return (
    <div className="pane">
      <div className="pane-head">
        <input
          className="search" value={query} placeholder="Search parts, tools, fixtures…"
          onChange={e => setQuery(e.target.value)}
        />
        <div className="cat-row">
          {CATS.map(([id, n]) => (
            <div key={id} className={'chip cat' + (cat === id ? ' on' : '')} onClick={() => setCat(id)}>
              {n}{id === 'custom' && library.length ? ` · ${library.length}` : ''}
            </div>
          ))}
        </div>
      </div>

      <div className="panel pane-body">
        {tool && (
          <ToolForm toolId={tool} params={toolParams} setParams={setToolParams} onPlace={onPlaceTool} onCancel={() => setTool(null)} />
        )}

        {tools.length > 0 && (
          <>
            <div className="sect">Tools <span>lay real pieces for you</span></div>
            <div className="add-grid">
              {tools.map(id => (
                <div key={id} className={'add-card tool' + (tool === id ? ' on' : '')} onClick={() => setTool(tool === id ? null : id)}>
                  <div className="add-name">{TOOLS[id].n}</div>
                  <div className="add-meta">{TOOLS[id].params.filter(p => !p.options).map(p => p.n.toLowerCase()).join(' · ')}</div>
                  <div className="add-price">{tool === id ? 'Set it up above ↑' : 'Tap to set up'}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {custom.length > 0 || (show('custom') && !q) ? (
          <>
            <div className="sect">Your custom parts <span>saved on this device</span></div>
            {show('custom') && !q && (
              <div className="row-actions">
                {!saving ? (
                  <div className={'btn-outline' + (partsCount ? '' : ' disabled')} onClick={() => setSaving(true)}>Save whole build as a part</div>
                ) : (
                  <div className="inline-form">
                    <input className="name-input" value={saveName} autoFocus maxLength={40} onChange={e => setSaveName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { if (onSaveWholeBuild(saveName)) setSaving(false); } if (e.key === 'Escape') setSaving(false); }} />
                    <div className="btn-primary" style={{ padding: '9px 14px', fontSize: 13 }} onClick={() => { if (onSaveWholeBuild(saveName)) setSaving(false); }}>Save</div>
                    <div className="btn-outline" onClick={() => setSaving(false)}>Cancel</div>
                  </div>
                )}
                <label className="btn-outline" style={{ cursor: 'pointer' }}>
                  Import file
                  <input type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={e => { onImportFile(e.target.files && e.target.files[0]); e.target.value = ''; }} />
                </label>
                <div className={'btn-outline' + (library.length ? '' : ' disabled')} onClick={onExportLibrary}>Export all</div>
              </div>
            )}
            {custom.length === 0 && (
              <div className="hint">Nothing saved yet. Select something in the 3D view, open Edit, and tap “Save as part” — or save the whole build above.</div>
            )}
            {custom.map(it => (
              <div key={it.id} className="lib-row">
                <div className="lib-count">{it.count}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editing === it.id ? (
                    <input className="name-input" style={{ fontSize: 17 }} value={draft} autoFocus maxLength={40}
                      onChange={e => setDraft(e.target.value)}
                      onBlur={() => { onRenameCustom(it.id, draft); setEditing(null); }}
                      onKeyDown={e => { if (e.key === 'Enter') { onRenameCustom(it.id, draft); setEditing(null); } if (e.key === 'Escape') setEditing(null); }} />
                  ) : (
                    <div className="add-name" style={{ cursor: 'text' }} title="Tap to rename" onClick={() => { setDraft(it.name); setEditing(it.id); }}>{it.name}</div>
                  )}
                  <div className="add-meta">{it.count} piece{it.count > 1 ? 's' : ''} · ${it.cost}</div>
                </div>
                <div className="lib-actions">
                  <div className="btn-add" onClick={() => onPlaceCustom(it.id)}>Add</div>
                  <div className="btn-outline" onClick={() => onSharePart(it.id)}>Share</div>
                  {confirm === it.id
                    ? <div className="btn-outline danger" onClick={() => { setConfirm(null); onDeleteCustom(it.id); }}>Sure?</div>
                    : <div className="btn-outline" onClick={() => setConfirm(it.id)}>Delete</div>}
                </div>
              </div>
            ))}
          </>
        ) : null}

        {stock.length > 0 && (() => {
          const groups = [];
          stock.forEach(s => {
            const key = STOCK_CAT[s.cat];
            let g = groups.find(x => x.key === key);
            if (!g) { g = { key, items: [] }; groups.push(g); }
            g.items.push(s);
          });
          return groups.map(g => (
            <div key={g.key}>
              <div className="sect">{CATS.find(c => c[0] === g.key)[1]} <span>real sizes</span></div>
              <div className="add-grid">
                {g.items.map(s => (
                  <div key={s.id} className="add-card" onClick={() => addPiece(s.id)}>
                    <div className="swatch" style={{ background: s.color || MATS[s.mat].c }} />
                    <div className="add-name">{s.n}</div>
                    <div className="add-meta">{sizeOf(s)}{s.attach ? ' · sticks to a wall' : ''}</div>
                    <div className="add-price">{price(s)}</div>
                  </div>
                ))}
              </div>
            </div>
          ));
        })()}

        {quick.length > 0 && (
          <>
            <div className="sect">Quick parts <span>ready-made, on a 1 ft grid</span></div>
            <div className="add-grid">
              {quick.map(p => (
                <div key={p.k} className="add-card" onClick={() => addPart(p.k)}>
                  <div className="swatch" style={{ background: MATS[p.mat].c }} />
                  <div className="add-name">{p.n}</div>
                  <div className="add-meta">{p.s} · {MATS[p.mat].n}</div>
                  <div className="add-price">${p.cost}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {nothing && <div className="hint">Nothing matches “{query}”.</div>}
        <div style={{ height: 12 }} />
      </div>
    </div>
  );
}
