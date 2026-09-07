import { useEffect, useState } from 'react';

function ago(ms) {
  const d = Date.now() - ms;
  if (d < 60e3) return 'just now';
  if (d < 3600e3) return `${Math.round(d / 60e3)} min ago`;
  if (d < 86400e3) return `${Math.round(d / 3600e3)} h ago`;
  if (d < 7 * 86400e3) return `${Math.round(d / 86400e3)} d ago`;
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ProjectsPanel({ items, currentId, onOpen, onNew, onNewSample, onCopy, onDelete, onClose }) {
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sorted = items.slice().sort((a, b) => (b.updated || 0) - (a.updated || 0));

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '14px 16px 10px', borderBottom: '1px solid var(--line)' }}>
          <div>
            <div className="mono" style={{ color: 'var(--steel)' }}>Projects · {items.length}</div>
            <div style={{ font: '600 22px/1.1 "Barlow Condensed",sans-serif', marginTop: 2 }}>Your builds on this device</div>
          </div>
          <div className="btn-outline" onClick={onClose}>Close</div>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
          <div className="btn-primary" style={{ flex: 1, padding: 11, fontSize: 14 }} onClick={onNew}>New project</div>
          <div className="btn-outline" style={{ padding: '11px 12px' }} onClick={onNewSample}>New from sample</div>
        </div>

        <div className="panel">
          {sorted.map(it => {
            const current = it.id === currentId;
            return (
              <div key={it.id} style={{ display: 'flex', gap: 12, padding: '11px 16px', borderBottom: '1px solid rgba(29,31,32,.1)', alignItems: 'center', background: current ? 'var(--steel-tint)' : 'transparent' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '600 17px/1.15 "Barlow Condensed",sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {it.name}{current ? <span className="mono" style={{ color: 'var(--steel)', marginLeft: 8 }}>open</span> : null}
                  </div>
                  <div style={{ font: '500 10.5px "IBM Plex Mono",monospace', color: 'var(--ink-55)', marginTop: 3 }}>
                    {it.parts ?? 0} parts{it.cost != null ? ` · $${it.cost}` : ''} · {it.updated ? ago(it.updated) : '—'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flex: 'none' }}>
                  {!current && <div className="btn-outline" style={{ padding: '6px 9px', fontSize: 11 }} onClick={() => onOpen(it.id)}>Open</div>}
                  <div className="btn-outline" style={{ padding: '6px 9px', fontSize: 11 }} onClick={() => onCopy(it.id)}>Copy</div>
                  {confirm === it.id ? (
                    <div className="btn-outline" style={{ padding: '6px 9px', fontSize: 11, borderColor: 'var(--ink)', background: 'var(--ink)', color: 'var(--bg)' }} onClick={() => { setConfirm(null); onDelete(it.id); }}>Sure?</div>
                  ) : (
                    <div className="btn-outline" style={{ padding: '6px 9px', fontSize: 11 }} onClick={() => setConfirm(it.id)}>Delete</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '10px 16px 14px', font: '500 10px "IBM Plex Mono",monospace', color: 'var(--ink-55)', lineHeight: 1.5, borderTop: '1px solid var(--line)' }}>
          Projects are saved in this browser only. To move one to another device, open it and use List → Share 3D link; opening a link creates a new project there.
        </div>
      </div>
    </div>
  );
}
