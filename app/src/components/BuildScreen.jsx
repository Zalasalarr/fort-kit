import { useState } from 'react';
import { MATS, BUILD_MATS, PARTS, QUICK_STOCK, QUICK_FIXTURES, SNAPS, stockById } from '../data.js';
import { partName, isPiece, pieceDims, pieceBottom, fmtIn, groupIndices, unionAABB } from '../logic.js';
import { TOOLS } from '../generators.js';
import Viewport from './Viewport.jsx';

const PALETTE = PARTS.filter(p => p.k !== 'mass').slice(0, 8);
const PITCHES = [[0, 'Flat'], [45, '45°'], [90, 'Upright']];

function Stepper({ value, onDown, onUp, big, minWidth = 44 }) {
  const sz = big ? 34 : 26;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button className="step-btn" style={{ width: sz, height: sz, fontSize: big ? 16 : 14 }} onClick={onDown}>−</button>
      <div style={{ font: `600 ${big ? 22 : 15}px/1 "Barlow Condensed",sans-serif`, minWidth, textAlign: 'center', whiteSpace: 'nowrap' }}>{value}</div>
      <button className="step-btn" style={{ width: sz, height: sz, fontSize: big ? 16 : 14 }} onClick={onUp}>+</button>
    </div>
  );
}

function ToolForm({ toolId, params, setParams, onPlace, onCancel }) {
  const t = TOOLS[toolId];
  return (
    <div style={{ padding: '10px 16px 12px', borderBottom: '1px solid var(--line)', background: 'var(--steel-tint)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <div style={{ font: '600 18px/1.1 "Barlow Condensed",sans-serif' }}>{t.n}</div>
        <div className="btn-outline" style={{ padding: '4px 8px', fontSize: 11 }} onClick={onCancel}>Cancel</div>
      </div>
      <div style={{ font: '500 10px "IBM Plex Mono",monospace', color: 'var(--ink-55)', marginBottom: 10, lineHeight: 1.4 }}>{t.tip}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {t.params.map(p => (
          <div key={p.k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="mono" style={{ color: 'var(--grey)', width: 84, flex: 'none' }}>{p.n}</div>
            {p.options ? (
              <div style={{ display: 'flex', border: '1px solid var(--line-24)', flex: 1 }}>
                {p.options.map(([v, n]) => (
                  <div key={v} className={'seg' + (String(params[p.k]) === String(v) ? ' on' : '')} style={{ padding: '5px 4px', fontSize: 12 }} onClick={() => setParams({ [p.k]: v })}>{n}</div>
                ))}
              </div>
            ) : (
              <Stepper
                value={fmtIn(params[p.k])} minWidth={60}
                onDown={() => setParams({ [p.k]: Math.max(p.min, params[p.k] - p.step) })}
                onUp={() => setParams({ [p.k]: Math.min(p.max, params[p.k] + p.step) })}
              />
            )}
          </div>
        ))}
      </div>
      <div className="btn-primary" style={{ marginTop: 12, padding: 11, fontSize: 14 }} onClick={onPlace}>Place {t.n.toLowerCase()}</div>
    </div>
  );
}

export default function BuildScreen({
  parts, sel, yard, maxLvl, marks, setMarks, render, setRender, camera, setCamera, snap, setSnap,
  groupMove, setGroupMove, tool, toolParams, setTool, setToolParams, onPlaceTool,
  setSel, mutSel, editPiece, addPart, addPiece, removeSel, duplicateSel, dropSel, explodeSel,
  moveSel, movePiece, moveGroup, onDragStart, onDragEnd,
  moveGroupBy, rotateGroup, deleteGroup, ungroup, copyGroup, dropGroup,
  library = [], onPlaceCustom, onSaveCustom,
}) {
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveScope, setSaveScope] = useState('selection');
  const selPart = parts[sel];
  const piece = selPart && isPiece(selPart);
  const stock = piece ? stockById(selPart.stock) : null;
  const dims = piece ? pieceDims(selPart) : null;
  const inGroup = piece && !!selPart.grp;
  const grouped = inGroup && groupMove;
  const gidx = inGroup ? groupIndices(parts, sel) : null;
  const gBottom = grouped ? unionAABB(parts, gidx).min.y : 0;
  const off = selPart ? '' : ' disabled';
  const blueprint = render === 'blueprint';
  const persp = camera === 'persp';
  const snapLabel = snap === 12 ? '1 ft' : `${snap} in`;
  const canExplode = selPart && !piece && selPart.k !== 'mass';
  const selectionLabel = selPart ? (grouped ? selPart.gn : partName(selPart)) : '';
  const openSave = () => {
    setSaveScope(selPart ? 'selection' : 'build');
    setSaveName(selPart ? selectionLabel : 'My build');
    setSaving(true);
  };
  const doSave = () => { if (onSaveCustom(saveName, saveScope)) setSaving(false); };

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

  return (
    <div className="editor">
      <Viewport
        parts={parts} sel={sel} yard={yard} pick
        mode={render} camera={camera} snap={snap} groupMove={groupMove}
        onSelect={setSel} onMove={moveSel} onMovePiece={movePiece} onMoveGroup={moveGroup}
        onDragStart={onDragStart} onDragEnd={onDragEnd}
        marks={marks} onPickPin={setSel}
        caption={`${persp ? 'Perspective' : 'Iso'} · ${snapLabel} snap · drag a part to move · drag space to orbit`}
        footer={`${parts.length} parts · ${maxLvl || 0} ft high`}
        emptyText="Nothing built yet — add a part or a piece below, or paint one in Plan"
      >
        <div className="vp-tools">
          <div className={'btn-outline' + (blueprint ? ' on' : '')} onClick={() => setRender(blueprint ? 'real' : 'blueprint')}>Blueprint</div>
          <div className={'btn-outline' + (persp ? ' on' : '')} onClick={() => setCamera(persp ? 'iso' : 'persp')}>Persp</div>
          <div className={'btn-outline' + (marks ? ' on' : '')} onClick={() => setMarks(!marks)}>Marks</div>
        </div>
      </Viewport>

      <div className="side">
        <div className="panel">
          {tool && (
            <ToolForm toolId={tool} params={toolParams} setParams={setToolParams} onPlace={onPlaceTool} onCancel={() => setTool(null)} />
          )}

          {/* selected */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div className="mono" style={{ color: 'var(--steel)' }}>
                Selected{selPart ? ` · ${MATS[selPart.mat].n}` : ''}{inGroup ? ` · in ${selPart.gn} (${gidx.length})` : ''}
              </div>
              <div style={{ font: '600 18px/1.15 "Barlow Condensed",sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selPart ? (grouped ? selPart.gn : partName(selPart)) : 'Nothing selected'}
              </div>
            </div>
            <div className={off} style={{ display: 'flex', gap: 6 }}>
              <div className="btn-outline" title="Turn 90°" onClick={() => turn(90)}>Turn</div>
              {piece && !grouped && <div className="btn-outline" title="Turn 15°" onClick={() => turn(15)}>15°</div>}
              <div className="btn-outline" onClick={grouped ? copyGroup : duplicateSel}>Copy</div>
              <div className="btn-outline" onClick={grouped ? deleteGroup : removeSel}>Delete</div>
            </div>
          </div>

          {/* group controls */}
          {inGroup && (
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div className="mono" style={{ color: 'var(--grey)' }}>Edit</div>
              <div style={{ display: 'flex', border: '1px solid var(--line-24)' }}>
                <div className={'seg' + (groupMove ? ' on' : '')} style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => setGroupMove(true)}>Whole {selPart.gn.toLowerCase()}</div>
                <div className={'seg' + (!groupMove ? ' on' : '')} style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => setGroupMove(false)}>One piece</div>
              </div>
              <div className="btn-outline" style={{ padding: '5px 8px', fontSize: 11 }} onClick={ungroup}>Ungroup</div>
            </div>
          )}

          {/* assembly: explode */}
          {canExplode && (
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="btn-outline" onClick={explodeSel}>Explode into pieces</div>
              <div style={{ font: '500 10px "IBM Plex Mono",monospace', color: 'var(--ink-55)', lineHeight: 1.4 }}>Rebuilds this part from real lumber, sheets, bricks or holds.</div>
            </div>
          )}

          {/* move & height */}
          <div className={'grid-2' + off} style={{ borderBottom: '1px solid var(--line)' }}>
            <div style={{ padding: '9px 16px', borderRight: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 6 }}>
                <div className="mono" style={{ color: 'var(--grey)' }}>Move</div>
                <div style={{ display: 'flex', border: '1px solid var(--line-24)' }}>
                  {SNAPS.map(s => (
                    <div key={s} className={'seg' + (snap === s ? ' on' : '')} style={{ padding: '3px 6px', fontSize: 10.5 }} onClick={() => setSnap(s)}>
                      {s === 12 ? '1 ft' : `${s} in`}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,30px)', gridAutoRows: 26, gap: 3, justifyContent: 'center' }}>
                <span /><div className="step-btn" onClick={() => moveBy(0, -1)}>▲</div><span />
                <div className="step-btn" onClick={() => moveBy(-1, 0)}>◀</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', font: '500 8.5px "IBM Plex Mono",monospace', color: 'rgba(29,31,32,.45)', whiteSpace: 'nowrap' }}>
                  {selPart ? (piece ? `${fmtIn(selPart.cx)}` : `${selPart.x},${selPart.z}`) : '—'}
                </div>
                <div className="step-btn" onClick={() => moveBy(1, 0)}>▶</div>
                <span /><div className="step-btn" onClick={() => moveBy(0, 1)}>▼</div><span />
              </div>
            </div>
            <div style={{ padding: '9px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div className="mono" style={{ color: 'var(--grey)' }}>Height</div>
                {piece && <div className="btn-outline" style={{ padding: '3px 8px', fontSize: 10.5 }} title="Rest on whatever is underneath" onClick={grouped ? dropGroup : dropSel}>Drop</div>}
              </div>
              {piece ? (
                <Stepper big minWidth={64}
                  value={(grouped ? gBottom : pieceBottom(selPart)) < .5 ? 'ground' : fmtIn(grouped ? gBottom : pieceBottom(selPart))}
                  onDown={() => heightBy(-1)} onUp={() => heightBy(1)} />
              ) : (
                <Stepper big value={selPart ? `${selPart.lvl} ft` : '—'} onDown={() => heightBy(-1)} onUp={() => heightBy(1)} />
              )}
            </div>
          </div>

          {/* piece: orientation & size */}
          {piece && !grouped && (
            <div style={{ padding: '10px 16px 10px', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="mono" style={{ color: 'var(--grey)', width: 62, flex: 'none' }}>Angle</div>
                <div style={{ display: 'flex', border: '1px solid var(--line-24)', flex: 1 }}>
                  {PITCHES.map(([deg, n]) => (
                    <div key={deg} className={'seg' + (selPart.pitch === deg ? ' on' : '')} style={{ padding: '6px 4px', fontSize: 12 }} onClick={() => editPiece(p => { p.pitch = deg; })}>{n}</div>
                  ))}
                </div>
                <div className={'chip' + (selPart.roll ? ' on' : '')} style={{ flex: 'none', padding: '6px 9px' }} onClick={() => editPiece(p => { p.roll = p.roll ? 0 : 90; })}>On edge</div>
              </div>
              {!stock.fixed && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="mono" style={{ color: 'var(--grey)', width: 62, flex: 'none' }}>Length</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button className="step-btn" style={{ width: 32, height: 26, fontSize: 11 }} onClick={() => editPiece(p => { p.L = Math.max(1, p.L - 12); })}>−12</button>
                    <button className="step-btn" style={{ width: 28, height: 26, fontSize: 11 }} onClick={() => editPiece(p => { p.L = Math.max(1, p.L - 1); })}>−1</button>
                    <div style={{ font: '600 16px/1 "Barlow Condensed",sans-serif', minWidth: 58, textAlign: 'center' }}>{fmtIn(dims.L)}</div>
                    <button className="step-btn" style={{ width: 28, height: 26, fontSize: 11 }} onClick={() => editPiece(p => { p.L = Math.min(stock.maxL, p.L + 1); })}>+1</button>
                    <button className="step-btn" style={{ width: 32, height: 26, fontSize: 11 }} onClick={() => editPiece(p => { p.L = Math.min(stock.maxL, p.L + 12); })}>+12</button>
                  </div>
                </div>
              )}
              {stock.unit === 'sheet' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="mono" style={{ color: 'var(--grey)', width: 62, flex: 'none' }}>Width</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button className="step-btn" style={{ width: 32, height: 26, fontSize: 11 }} onClick={() => editPiece(p => { p.W = Math.max(1, p.W - 12); })}>−12</button>
                    <button className="step-btn" style={{ width: 28, height: 26, fontSize: 11 }} onClick={() => editPiece(p => { p.W = Math.max(1, p.W - 1); })}>−1</button>
                    <div style={{ font: '600 16px/1 "Barlow Condensed",sans-serif', minWidth: 58, textAlign: 'center' }}>{fmtIn(dims.W)}</div>
                    <button className="step-btn" style={{ width: 28, height: 26, fontSize: 11 }} onClick={() => editPiece(p => { p.W = Math.min(stock.maxW, p.W + 1); })}>+1</button>
                    <button className="step-btn" style={{ width: 32, height: 26, fontSize: 11 }} onClick={() => editPiece(p => { p.W = Math.min(stock.maxW, p.W + 12); })}>+12</button>
                  </div>
                </div>
              )}
              <div style={{ font: '500 10px "IBM Plex Mono",monospace', color: 'var(--ink-55)' }}>
                {dims.T} × {dims.W} in actual · at {fmtIn(selPart.cx)}, {fmtIn(selPart.cz)} · turned {selPart.yaw || 0}°
              </div>
            </div>
          )}

          {/* assembly: material */}
          {!piece && (
            <div className={off} style={{ padding: '10px 16px 8px', borderBottom: '1px solid var(--line)' }}>
              <div className="mono" style={{ color: 'var(--grey)', marginBottom: 7 }}>Material</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {BUILD_MATS.map(k => (
                  <div key={k} className={'chip' + (selPart && selPart.mat === k ? ' on' : '')} onClick={() => mutSel(p => { p.mat = k; })}>
                    <span className="dot" style={{ background: MATS[k].c }} />
                    {MATS[k].n}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* tools */}
          <div style={{ padding: '10px 0 6px', borderBottom: '1px solid var(--line)' }}>
            <div className="mono" style={{ color: 'var(--grey)', margin: '0 16px 8px' }}>Build with a tool · lays real pieces</div>
            <div className="palette">
              {Object.keys(TOOLS).map(id => (
                <div key={id} className={'palette-card' + (tool === id ? ' on' : '')} style={{ width: 96 }} onClick={() => setTool(id)}>
                  <div style={{ height: 3, width: 26, background: 'var(--ink)', marginBottom: 8 }} />
                  <div style={{ font: '600 15px/1.1 "Barlow Condensed",sans-serif', marginBottom: 3 }}>{TOOLS[id].n}</div>
                  <div style={{ font: '500 10px "IBM Plex Mono",monospace', color: 'var(--ink-55)' }}>
                    {TOOLS[id].params.filter(p => !p.options).map(p => p.n.toLowerCase()).join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* custom parts */}
          <div style={{ padding: '10px 0 6px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 16px 8px' }}>
              <div className="mono" style={{ color: 'var(--grey)' }}>Custom parts · yours</div>
              {!saving && <div className="btn-outline" style={{ padding: '4px 8px', fontSize: 11 }} onClick={openSave}>Save as part</div>}
            </div>
            {saving && (
              <div style={{ margin: '0 16px 10px', padding: '10px 12px', background: 'var(--steel-tint)', border: '1px solid var(--steel)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', border: '1px solid var(--line-24)' }}>
                  <div className={'seg' + (saveScope === 'selection' ? ' on' : '') + (selPart ? '' : ' disabled')} style={{ padding: '5px 6px', fontSize: 12 }} onClick={() => setSaveScope('selection')}>
                    {selPart ? `Selected: ${selectionLabel}` : 'Nothing selected'}
                  </div>
                  <div className={'seg' + (saveScope === 'build' ? ' on' : '')} style={{ padding: '5px 6px', fontSize: 12 }} onClick={() => setSaveScope('build')}>Whole build ({parts.length})</div>
                </div>
                <input
                  className="name-input" style={{ fontSize: 18 }} value={saveName} placeholder="Name this part" maxLength={40} autoFocus
                  onChange={e => setSaveName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') doSave(); if (e.key === 'Escape') setSaving(false); }}
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <div className="btn-primary" style={{ flex: 1, padding: 9, fontSize: 13 }} onClick={doSave}>Save</div>
                  <div className="btn-outline" onClick={() => setSaving(false)}>Cancel</div>
                </div>
                <div style={{ font: '500 10px "IBM Plex Mono",monospace', color: 'var(--ink-55)', lineHeight: 1.4 }}>
                  Saved parts are kept on this device and show up in every project. Assemblies are converted to real pieces when saved.
                </div>
              </div>
            )}
            {library.length === 0 && !saving && (
              <div style={{ margin: '0 16px 8px', font: '500 10px "IBM Plex Mono",monospace', color: 'var(--ink-55)', lineHeight: 1.4 }}>
                Select a group, a piece, or nothing (for the whole build), then Save as part to reuse it later.
              </div>
            )}
            {library.length > 0 && (
              <div className="palette">
                {library.map(it => (
                  <div key={it.id} className="palette-card" style={{ width: 104 }} onClick={() => onPlaceCustom(it.id)}>
                    <div style={{ height: 3, width: 26, background: 'var(--steel-deep)', marginBottom: 8 }} />
                    <div style={{ font: '600 15px/1.1 "Barlow Condensed",sans-serif', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</div>
                    <div style={{ font: '500 10px "IBM Plex Mono",monospace', color: 'var(--ink-55)' }}>{it.count} piece{it.count > 1 ? 's' : ''}</div>
                    <div style={{ font: '500 10px "IBM Plex Mono",monospace', color: 'var(--steel-deep)', marginTop: 4 }}>${it.cost}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* add a piece */}
          <div style={{ padding: '10px 0 6px', borderBottom: '1px solid var(--line)' }}>
            <div className="mono" style={{ color: 'var(--grey)', margin: '0 16px 8px' }}>Add a piece · true size</div>
            <div className="palette">
              {QUICK_STOCK.map(id => {
                const s = stockById(id);
                return (
                  <div key={id} className="palette-card" style={{ width: 96 }} onClick={() => addPiece(id)}>
                    <div style={{ height: 3, width: 26, background: MATS[s.mat].c, border: '1px solid rgba(29,31,32,.25)', marginBottom: 8 }} />
                    <div style={{ font: '600 15px/1.1 "Barlow Condensed",sans-serif', marginBottom: 3 }}>{s.n}</div>
                    <div style={{ font: '500 10px "IBM Plex Mono",monospace', color: 'var(--ink-55)' }}>{s.T}×{s.W} in</div>
                    <div style={{ font: '500 10px "IBM Plex Mono",monospace', color: 'var(--steel-deep)', marginTop: 4 }}>
                      ${s.price}{s.unit === 'ft' ? '/ft' : s.unit === 'sheet' ? '/sheet' : ' ea'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* add a fixture */}
          <div style={{ padding: '10px 0 6px', borderBottom: '1px solid var(--line)' }}>
            <div className="mono" style={{ color: 'var(--grey)', margin: '0 16px 8px' }}>Add a fixture · kitchen, beds &amp; play</div>
            <div className="palette">
              {QUICK_FIXTURES.map(id => {
                const s = stockById(id);
                return (
                  <div key={id} className="palette-card" style={{ width: 104 }} onClick={() => addPiece(id)}>
                    <div style={{ height: 3, width: 26, background: s.color || MATS[s.mat].c, border: '1px solid rgba(29,31,32,.25)', marginBottom: 8 }} />
                    <div style={{ font: '600 15px/1.1 "Barlow Condensed",sans-serif', marginBottom: 3 }}>{s.n}</div>
                    <div style={{ font: '500 10px "IBM Plex Mono",monospace', color: 'var(--ink-55)' }}>{s.L}×{s.W}×{s.T} in</div>
                    <div style={{ font: '500 10px "IBM Plex Mono",monospace', color: 'var(--steel-deep)', marginTop: 4 }}>
                      ${s.price}{s.unit === 'ft' ? '/ft' : s.unit === 'sheet' ? '/sheet' : ' ea'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* add a part */}
          <div style={{ padding: '10px 0 14px' }}>
            <div className="mono" style={{ color: 'var(--grey)', margin: '0 16px 8px' }}>Add an assembly</div>
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
            <span><kbd>PgUp</kbd><kbd>PgDn</kbd> height</span>
            <span><kbd>G</kbd> drop</span>
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
    </div>
  );
}
