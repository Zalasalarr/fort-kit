import { useState } from 'react';
import { MATS, BUILD_MATS, SNAPS, stockById } from '../data.js';
import { partName, isPiece, pieceDims, pieceBottom, fmtIn, groupIndices, unionAABB } from '../logic.js';

const PITCHES = [[0, 'Flat'], [45, '45°'], [90, 'Upright']];

function Stepper({ value, onDown, onUp, minWidth = 64 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button className="step-btn" style={{ width: 36, height: 36, fontSize: 17 }} onClick={onDown}>−</button>
      <div style={{ font: '600 22px/1 "Barlow Condensed",sans-serif', minWidth, textAlign: 'center', whiteSpace: 'nowrap' }}>{value}</div>
      <button className="step-btn" style={{ width: 36, height: 36, fontSize: 17 }} onClick={onUp}>+</button>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="edit-row">
      <div className="mono" style={{ color: 'var(--grey)', width: 72, flex: 'none' }}>{label}</div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}

export default function EditPane({
  parts, sel, snap, setSnap, groupMove, setGroupMove, onAdd,
  mutSel, editPiece, removeSel, duplicateSel, dropSel, explodeSel,
  moveGroupBy, rotateGroup, deleteGroup, ungroup, copyGroup, dropGroup, onSaveCustom,
}) {
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const selPart = parts[sel];
  if (!selPart) {
    return (
      <div className="pane">
        <div className="pane-body panel">
          <div className="empty-edit">
            <div style={{ font: '600 20px/1.2 "Barlow Condensed",sans-serif' }}>Nothing selected</div>
            <div className="hint" style={{ padding: 0 }}>Tap a part in the 3D view to move, turn, resize or delete it. Or go to Add to put something in.</div>
            <div className="btn-primary" style={{ marginTop: 8 }} onClick={onAdd}>Add something</div>
          </div>
        </div>
      </div>
    );
  }

  const piece = isPiece(selPart);
  const stock = piece ? stockById(selPart.stock) : null;
  const dims = piece ? pieceDims(selPart) : null;
  const inGroup = piece && !!selPart.grp;
  const grouped = inGroup && groupMove;
  const gidx = inGroup ? groupIndices(parts, sel) : null;
  const gBottom = grouped ? unionAABB(parts, gidx).min.y : 0;
  const canExplode = !piece && selPart.k !== 'mass';
  const title = grouped ? selPart.gn : partName(selPart);

  const moveBy = (dx, dz) => {
    if (grouped) return moveGroupBy({ dx: dx * snap, dy: 0, dz: dz * snap });
    if (piece) return editPiece(p => { p.cx += dx * snap; p.cz += dz * snap; }, false);
    return mutSel(p => { p.x = +(p.x + dx * snap / 12).toFixed(3); p.z = +(p.z + dz * snap / 12).toFixed(3); });
  };
  const heightBy = dy => {
    if (grouped) return moveGroupBy({ dx: 0, dy: dy * snap, dz: 0 }, true);
    if (piece) return editPiece(p => { p.cy += dy * snap; }, false, dy < 0);
    return mutSel(p => { p.lvl = Math.max(0, Math.min(12, p.lvl + dy)); });
  };
  const turn = deg => {
    if (grouped) return rotateGroup(deg);
    if (piece) return editPiece(p => { p.yaw = ((p.yaw || 0) + deg) % 360; });
    return mutSel(p => { p.rot = ((p.rot || 0) + 1) % 4; });
  };
  const heightValue = piece
    ? ((grouped ? gBottom : pieceBottom(selPart)) < .5 ? 'On ground' : fmtIn(grouped ? gBottom : pieceBottom(selPart)))
    : (selPart.lvl ? `${selPart.lvl} ft` : 'On ground');

  return (
    <div className="pane">
      <div className="pane-body panel">
        <div className="edit-head">
          <div style={{ minWidth: 0 }}>
            <div className="mono" style={{ color: 'var(--steel)' }}>
              {piece ? MATS[selPart.mat].n : MATS[selPart.mat].n}{inGroup ? ` · part of ${selPart.gn} (${gidx.length})` : ''}
            </div>
            <div className="edit-title">{title}</div>
          </div>
          <div className="btn-outline" onClick={onAdd}>+ Add</div>
        </div>

        {inGroup && (
          <Row label="Editing">
            <div style={{ display: 'flex', border: '1px solid var(--line-24)' }}>
              <div className={'seg' + (groupMove ? ' on' : '')} style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => setGroupMove(true)}>Whole {selPart.gn.toLowerCase()}</div>
              <div className={'seg' + (!groupMove ? ' on' : '')} style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => setGroupMove(false)}>Just this piece</div>
            </div>
            <div className="btn-outline" onClick={ungroup}>Split up</div>
          </Row>
        )}

        <div className="edit-actions">
          <div className="btn-outline big" onClick={() => turn(90)}>↻ Turn</div>
          {piece && !grouped && <div className="btn-outline big" onClick={() => turn(15)}>↻ 15°</div>}
          <div className="btn-outline big" onClick={grouped ? copyGroup : duplicateSel}>⧉ Copy</div>
          {piece && <div className="btn-outline big" onClick={grouped ? dropGroup : dropSel} title="Rest it on whatever is underneath">⤓ Set down</div>}
          <div className="btn-outline big danger-soft" onClick={grouped ? deleteGroup : removeSel}>✕ Delete</div>
        </div>

        <Row label="Move">
          <div className="dpad">
            <span /><div className="step-btn" onClick={() => moveBy(0, -1)}>▲</div><span />
            <div className="step-btn" onClick={() => moveBy(-1, 0)}>◀</div>
            <div className="dpad-c">{snap === 12 ? '1 ft' : `${snap} in`}</div>
            <div className="step-btn" onClick={() => moveBy(1, 0)}>▶</div>
            <span /><div className="step-btn" onClick={() => moveBy(0, 1)}>▼</div><span />
          </div>
          <div>
            <div className="mono" style={{ color: 'var(--grey)', marginBottom: 5 }}>Grid step</div>
            <div style={{ display: 'flex', border: '1px solid var(--line-24)' }}>
              {SNAPS.map(s => (
                <div key={s} className={'seg' + (snap === s ? ' on' : '')} style={{ padding: '7px 10px', fontSize: 12 }} onClick={() => setSnap(s)}>
                  {s === 12 ? '1 ft' : `${s} in`}
                </div>
              ))}
            </div>
            <div className="hint" style={{ padding: '6px 0 0' }}>Or drag it in the 3D view.</div>
          </div>
        </Row>

        <Row label="Height">
          <Stepper value={heightValue} minWidth={92} onDown={() => heightBy(-1)} onUp={() => heightBy(1)} />
        </Row>

        {piece && !grouped && (
          <>
            <Row label="Angle">
              <div style={{ display: 'flex', border: '1px solid var(--line-24)' }}>
                {PITCHES.map(([deg, n]) => (
                  <div key={deg} className={'seg' + (selPart.pitch === deg ? ' on' : '')} style={{ padding: '7px 10px', fontSize: 12 }} onClick={() => editPiece(p => { p.pitch = deg; })}>{n}</div>
                ))}
              </div>
              <div className={'chip' + (selPart.roll ? ' on' : '')} style={{ flex: 'none', padding: '7px 10px' }} onClick={() => editPiece(p => { p.roll = p.roll ? 0 : 90; })}>On edge</div>
            </Row>
            {!stock.fixed && (
              <Row label="Length">
                <div className="len">
                  <button className="step-btn" onClick={() => editPiece(p => { p.L = Math.max(1, p.L - 12); })}>−1 ft</button>
                  <button className="step-btn" onClick={() => editPiece(p => { p.L = Math.max(1, p.L - 1); })}>−1"</button>
                  <div className="len-v">{fmtIn(dims.L)}</div>
                  <button className="step-btn" onClick={() => editPiece(p => { p.L = Math.min(stock.maxL, p.L + 1); })}>+1"</button>
                  <button className="step-btn" onClick={() => editPiece(p => { p.L = Math.min(stock.maxL, p.L + 12); })}>+1 ft</button>
                </div>
              </Row>
            )}
            {stock.unit === 'sheet' && (
              <Row label="Width">
                <div className="len">
                  <button className="step-btn" onClick={() => editPiece(p => { p.W = Math.max(1, p.W - 12); })}>−1 ft</button>
                  <button className="step-btn" onClick={() => editPiece(p => { p.W = Math.max(1, p.W - 1); })}>−1"</button>
                  <div className="len-v">{fmtIn(dims.W)}</div>
                  <button className="step-btn" onClick={() => editPiece(p => { p.W = Math.min(stock.maxW, p.W + 1); })}>+1"</button>
                  <button className="step-btn" onClick={() => editPiece(p => { p.W = Math.min(stock.maxW, p.W + 12); })}>+1 ft</button>
                </div>
              </Row>
            )}
            <div className="hint">{dims.T} × {dims.W} in actual · at {fmtIn(selPart.cx)}, {fmtIn(selPart.cz)} · turned {selPart.yaw || 0}°</div>
          </>
        )}

        {!piece && (
          <Row label="Material">
            <div style={{ display: 'flex', gap: 6, flex: 1 }}>
              {BUILD_MATS.map(k => (
                <div key={k} className={'chip' + (selPart.mat === k ? ' on' : '')} onClick={() => mutSel(p => { p.mat = k; })}>
                  <span className="dot" style={{ background: MATS[k].c }} />{MATS[k].n}
                </div>
              ))}
            </div>
          </Row>
        )}

        {canExplode && (
          <Row label="Make real">
            <div className="btn-outline" onClick={explodeSel}>Turn into real lumber &amp; pieces</div>
            <div className="hint" style={{ padding: 0, flexBasis: '100%' }}>Rebuilds this quick part from 2×4s, plywood, bricks, rope, tube or holds you can edit one by one.</div>
          </Row>
        )}

        <Row label="Reuse">
          {!saving ? (
            <div className="btn-outline" onClick={() => { setSaveName(title); setSaving(true); }}>Save as a custom part</div>
          ) : (
            <div className="inline-form">
              <input className="name-input" value={saveName} autoFocus maxLength={40} onChange={e => setSaveName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { if (onSaveCustom(saveName, 'selection')) setSaving(false); } if (e.key === 'Escape') setSaving(false); }} />
              <div className="btn-primary" style={{ padding: '9px 14px', fontSize: 13 }} onClick={() => { if (onSaveCustom(saveName, 'selection')) setSaving(false); }}>Save</div>
              <div className="btn-outline" onClick={() => setSaving(false)}>Cancel</div>
            </div>
          )}
        </Row>

        <div className="kbd-hint">
          <span><kbd>↑↓←→</kbd> move</span>
          <span><kbd>PgUp</kbd><kbd>PgDn</kbd> height</span>
          <span><kbd>G</kbd> set down</span>
          <span><kbd>R</kbd> turn · <kbd>⇧R</kbd> 15°</span>
          <span><kbd>T</kbd> angle</span>
          <span><kbd>E</kbd> on edge</span>
          <span><kbd>[</kbd><kbd>]</kbd> length</span>
          <span><kbd>D</kbd> copy</span>
          <span><kbd>Del</kbd> delete</span>
          <span><kbd>Ctrl</kbd><kbd>Z</kbd> undo</span>
        </div>
      </div>
    </div>
  );
}
