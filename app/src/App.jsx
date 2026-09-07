import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Vector3 } from 'three';
import { SAMPLE_PROJECT, emptyProject, partByKey, stockById } from './data.js';
import {
  cost, cutList, buyList, safetyChecks, maxLevel, massParts,
  isPiece, newPiece, restAt, pieceBottom, supportUnder, copyOffset,
  groupIndices, unionAABB, supportUnderSet,
} from './logic.js';
import { generate, transformGroup, explode, defaultParams, newGroupId, TOOLS } from './generators.js';
import { reducer, initState } from './store.js';
import { loadSaved, save, shareUrl, loadFromHash, loadPrefs, savePrefs } from './persist.js';
import { snapshot } from './BuildView.js';
import TabBar from './components/TabBar.jsx';
import YardScreen from './components/YardScreen.jsx';
import PlanScreen from './components/PlanScreen.jsx';
import BuildScreen from './components/BuildScreen.jsx';
import PartsScreen from './components/PartsScreen.jsx';
import ListScreen from './components/ListScreen.jsx';
import SheetScreen from './components/SheetScreen.jsx';
import PrintSheet from './components/PrintSheet.jsx';

function EditableName({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const commit = () => {
    setEditing(false);
    const v = draft.trim();
    if (v && v !== value) onChange(v);
  };
  if (!editing) {
    return (
      <div className="name" title="Tap to rename" onClick={() => { setDraft(value); setEditing(true); }}>{value}</div>
    );
  }
  return (
    <input
      className="name-input" autoFocus value={draft} maxLength={48}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
    />
  );
}

export default function App() {
  const [s, dispatch] = useReducer(reducer, null, () => {
    const fromHash = loadFromHash();
    const saved = loadSaved();
    const project = fromHash || saved || SAMPLE_PROJECT;
    return initState(project, fromHash || saved ? 'build' : 'yard', loadPrefs());
  });
  const { project, ui } = s;
  const { parts, yard, cells } = project;
  const sel = parts.length ? Math.min(ui.sel, parts.length - 1) : -1;

  const total = useMemo(() => cost(parts), [parts]);
  const cuts = useMemo(() => cutList(parts), [parts]);
  const buys = useMemo(() => buyList(parts), [parts]);
  const checks = useMemo(() => safetyChecks(parts, yard, total), [parts, yard, total]);
  const maxLvl = useMemo(() => maxLevel(parts), [parts]);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const say = msg => {
    setToast({ msg, id: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  const [shot, setShot] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => save(project), 300);
    const flush = () => save(project);
    window.addEventListener('pagehide', flush);
    return () => { clearTimeout(t); window.removeEventListener('pagehide', flush); };
  }, [project]);

  useEffect(() => {
    savePrefs({ render: ui.render, camera: ui.camera, snap: ui.snap });
  }, [ui.render, ui.camera, ui.snap]);

  /* ---------- actions ---------- */
  const setUi = patch => dispatch({ type: 'ui', patch });
  const setTab = tab => setUi({ tab });
  const setSel = idx => setUi({ sel: idx });
  const patchProject = (patch, transient = false) => dispatch({ type: 'project', patch, transient });
  const setParts = (fn, transient) => patchProject(p => {
    const next = fn(p.parts);
    return next === p.parts ? p : { ...p, parts: next };
  }, transient);

  const mutSel = fn => {
    if (sel < 0) return;
    setParts(prev => {
      const next = prev.slice();
      next[sel] = { ...next[sel] };
      fn(next[sel]);
      return next;
    });
  };

  // Edit a piece; by default keep its underside where it was (rotating or lengthening won't sink it)
  const editPiece = (fn, keepBottom = true, clampGround = false) => {
    if (sel < 0 || !isPiece(parts[sel])) return;
    setParts(prev => {
      const next = prev.slice();
      const p = { ...next[sel] };
      const bottom = pieceBottom(p);
      fn(p);
      let out = keepBottom ? restAt(p, bottom) : p;
      if (clampGround || pieceBottom(out) < 0) out = restAt(out, Math.max(0, pieceBottom(out)));
      next[sel] = out;
      return next;
    });
  };

  const addPart = k => {
    const d = partByKey(k);
    const n = { k, x: ((parts.length * 3) % 9) - 4, z: 4, lvl: 0, mat: d.mat, rot: 0 };
    setParts(prev => prev.concat([n]));
    setSel(parts.length);
    setTab('build');
    say(`${d.n} added`);
  };

  const addPiece = id => {
    const st = stockById(id);
    const p = newPiece(id);
    p.cx = (((parts.length * 3) % 9) - 4) * 12;
    setParts(prev => prev.concat([p]));
    setSel(parts.length);
    setTab('build');
    if (ui.snap === 12 && (st.cat === 'masonry' || st.attach)) setUi({ snap: 1 });
    say(`${st.n} added`);
  };

  const duplicateSel = () => {
    if (sel < 0) return;
    const src = parts[sel];
    let copy;
    if (isPiece(src)) {
      const o = copyOffset(src);
      copy = { ...src, cx: src.cx + o.x, cy: src.cy + o.y, cz: src.cz + o.z };
      delete copy.grp; delete copy.gn;
    } else {
      copy = { ...src, x: src.x + 2 };
      delete copy.fromPlan;
    }
    setParts(prev => prev.concat([copy]));
    setSel(parts.length);
  };

  const removeSel = () => {
    if (sel < 0) return;
    setParts(prev => prev.filter((_, i) => i !== sel));
    setSel(Math.max(0, sel - 1));
  };

  const moveSel = (idx, x, z) => setParts(prev => {
    if (!prev[idx] || (prev[idx].x === x && prev[idx].z === z)) return prev;
    const next = prev.slice();
    next[idx] = { ...next[idx], x, z };
    return next;
  }, true);

  const movePiece = (idx, patch) => setParts(prev => {
    if (!prev[idx]) return prev;
    const next = prev.slice();
    next[idx] = { ...next[idx], ...patch };
    return next;
  }, true);

  const dropSel = () => {
    if (sel < 0 || !isPiece(parts[sel])) return;
    const top = supportUnder(parts, sel);
    editPiece(p => { Object.assign(p, restAt(p, top)); }, false);
  };

  /* ---------- groups ---------- */
  const group = sel >= 0 ? groupIndices(parts, sel) : null;

  const shiftGroup = (idxs, d, transient = false) => setParts(prev => {
    const set = new Set(idxs);
    return prev.map((p, i) => (set.has(i) ? { ...p, cx: p.cx + d.dx, cy: p.cy + d.dy, cz: p.cz + d.dz } : p));
  }, transient);

  const moveGroup = (idxs, d) => shiftGroup(idxs, d, true);

  const moveGroupBy = (d, clamp = false) => {
    if (!group) return;
    let dy = d.dy;
    if (clamp && dy < 0) dy = Math.max(dy, -unionAABB(parts, group).min.y);
    shiftGroup(group, { ...d, dy });
  };

  const rotateGroup = deg => {
    if (!group) return;
    const c = unionAABB(parts, group).getCenter(new Vector3());
    const r = (deg * Math.PI) / 180, cs = Math.cos(r), sn = Math.sin(r);
    const set = new Set(group);
    setParts(prev => prev.map((p, i) => {
      if (!set.has(i)) return p;
      const x = p.cx - c.x, z = p.cz - c.z;
      return { ...p, cx: x * cs + z * sn + c.x, cz: -x * sn + z * cs + c.z, yaw: ((p.yaw || 0) + deg) % 360 };
    }));
  };

  const deleteGroup = () => {
    if (!group) return;
    const set = new Set(group);
    setParts(prev => prev.filter((_, i) => !set.has(i)));
    setSel(Math.max(0, group[0] - 1));
    say(`${parts[sel].gn} deleted`);
  };

  const ungroup = () => {
    if (!group) return;
    const set = new Set(group);
    setParts(prev => prev.map((p, i) => {
      if (!set.has(i)) return p;
      const q = { ...p };
      delete q.grp; delete q.gn;
      return q;
    }));
    say('Ungrouped — every piece is on its own now');
  };

  const copyGroup = () => {
    if (!group) return;
    const u = unionAABB(parts, group);
    const dx = (u.max.x - u.min.x) + 12;
    const id = newGroupId();
    const copies = group.map(i => ({ ...parts[i], cx: parts[i].cx + dx, grp: id }));
    setParts(prev => prev.concat(copies));
    setSel(parts.length);
  };

  const dropGroup = () => {
    if (!group) return;
    const top = supportUnderSet(parts, group);
    const bottom = unionAABB(parts, group).min.y;
    shiftGroup(group, { dx: 0, dy: top - bottom, dz: 0 });
  };

  const setTool = id => setUi(u => ({
    ...u,
    tool: id,
    toolParams: id ? (u.toolParams && u.toolFor === id ? u.toolParams : defaultParams(id)) : null,
    toolFor: id,
  }));
  const setToolParams = patch => setUi(u => ({ ...u, toolParams: { ...u.toolParams, ...patch } }));

  const placeTool = () => {
    if (!ui.tool) return;
    const pieces = generate(ui.tool, ui.toolParams);
    if (!pieces.length) return;
    const name = TOOLS[ui.tool].n;
    const placed = transformGroup(pieces, { x: (((parts.length * 3) % 9) - 4) * 12, y: 0, z: 48, id: newGroupId(), name });
    setParts(prev => prev.concat(placed));
    setSel(parts.length);
    setUi({ tool: null, groupMove: true });
    say(`${name} placed · ${placed.length} pieces · drag it into position`);
  };

  const explodeSel = () => {
    if (sel < 0 || isPiece(parts[sel])) return;
    const pieces = explode(parts[sel]);
    if (!pieces) { say('This part can\'t be exploded'); return; }
    setParts(prev => prev.slice(0, sel).concat(pieces, prev.slice(sel + 1)));
    setUi({ groupMove: true });
    say(`${pieces[0].gn} rebuilt from ${pieces.length} real pieces`);
  };

  const setYard = fn => patchProject(p => ({ ...p, yard: fn(p.yard) }));
  const setName = name => patchProject({ name });
  const setBrush = patch => setUi(u => ({ ...u, brush: { ...u.brush, ...patch } }));
  const patchCells = (fn, transient) => patchProject(p => {
    const next = fn(p.cells);
    return next === p.cells ? p : { ...p, cells: next };
  }, transient);

  const convertPlan = () => {
    const blocks = massParts(cells, true);
    if (!blocks.length) return;
    const kept = parts.filter(p => !p.fromPlan);
    patchProject(p => ({ ...p, parts: kept.concat(blocks) }));
    setSel(kept.length);
    setTab('build');
    say(`${blocks.length} block${blocks.length > 1 ? 's' : ''} added to the build`);
  };

  const clearPlan = () => patchCells(() => ({}));

  const loadSample = () => {
    patchProject(p => ({ ...SAMPLE_PROJECT, yard: { ...p.yard, ...SAMPLE_PROJECT.yard } }));
    setSel(0);
    say('Sample fort loaded');
  };
  const clearBuild = () => {
    patchProject(p => ({ ...emptyProject(p.yard), name: p.name }));
    setSel(0);
    say('Cleared — undo with ↶');
  };

  const share = async () => {
    const url = shareUrl(project);
    if (navigator.share) {
      try { await navigator.share({ title: project.name, url }); return; } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      say('Link copied');
    } catch {
      window.prompt('Copy this link', url);
    }
  };

  const exportSheet = () => {
    if (!parts.length) return;
    setShot(snapshot(parts, yard));
    setTimeout(() => window.print(), 200);
  };

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const onKey = e => {
      if (e.target.closest && e.target.closest('input,textarea')) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); dispatch({ type: e.shiftKey ? 'redo' : 'undo' }); return; }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); dispatch({ type: 'redo' }); return; }
      if (e.key === 'Escape' && ui.tool) { setTool(null); return; }
      if (ui.tab !== 'build' || sel < 0) return;
      const p0 = parts[sel], piece = isPiece(p0), st = ui.snap;
      const grouped = piece && !!p0.grp && ui.groupMove;
      const nudge = (dx, dz) => {
        if (grouped) moveGroupBy({ dx: dx * st, dy: 0, dz: dz * st });
        else if (piece) editPiece(p => { p.cx += dx * st; p.cz += dz * st; }, false);
        else mutSel(p => { p.x = +(p.x + dx * st / 12).toFixed(3); p.z = +(p.z + dz * st / 12).toFixed(3); });
      };
      const lift = dy => {
        if (grouped) moveGroupBy({ dx: 0, dy: dy * st, dz: 0 }, true);
        else if (piece) editPiece(p => { p.cy += dy * st; }, false, dy < 0);
        else mutSel(p => { p.lvl = Math.max(0, Math.min(12, p.lvl + dy)); });
      };
      switch (e.key) {
        case 'ArrowUp': nudge(0, -1); break;
        case 'ArrowDown': nudge(0, 1); break;
        case 'ArrowLeft': nudge(-1, 0); break;
        case 'ArrowRight': nudge(1, 0); break;
        case 'PageUp': case '+': case '=': lift(1); break;
        case 'PageDown': case '-': case '_': lift(-1); break;
        case 'g': case 'G': if (grouped) dropGroup(); else dropSel(); break;
        case 'r': case 'R':
          if (grouped) rotateGroup(90);
          else if (piece) editPiece(p => { p.yaw = ((p.yaw || 0) + (e.shiftKey ? 15 : 90)) % 360; });
          else mutSel(p => { p.rot = ((p.rot || 0) + 1) % 4; });
          break;
        case 't': case 'T':
          if (piece && !grouped) editPiece(p => { p.pitch = p.pitch === 0 ? 45 : p.pitch === 45 ? 90 : 0; }); break;
        case 'e': case 'E':
          if (piece && !grouped) editPiece(p => { p.roll = p.roll ? 0 : 90; }); break;
        case '[':
          if (piece && !grouped && !stockById(p0.stock).fixed) editPiece(p => { p.L = Math.max(1, p.L - (e.shiftKey ? 12 : 1)); }); break;
        case ']':
          if (piece && !grouped && !stockById(p0.stock).fixed) editPiece(p => { p.L = Math.min(stockById(p.stock).maxL, p.L + (e.shiftKey ? 12 : 1)); }); break;
        case 'd': case 'D': if (grouped) copyGroup(); else duplicateSel(); break;
        case 'Delete': case 'Backspace': if (grouped) deleteGroup(); else removeSel(); break;
        default: return;
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <>
      <div className="app">
        <div className="frame">
          <header className="head">
            <div className="head-l">
              <div className="mono" style={{ color: 'var(--steel)' }}>Project 001</div>
              <EditableName value={project.name} onChange={setName} />
            </div>
            <div className="head-r">
              <div className="hist">
                <button className="step-btn" title="Undo (Ctrl+Z)" disabled={!s.past.length} onClick={() => dispatch({ type: 'undo' })}>↶</button>
                <button className="step-btn" title="Redo (Ctrl+Y)" disabled={!s.future.length} onClick={() => dispatch({ type: 'redo' })}>↷</button>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="mono" style={{ color: 'var(--grey)' }}>Est.</div>
                <div style={{ font: '600 22px/1.1 "Barlow Condensed",sans-serif' }}>${total}</div>
              </div>
            </div>
          </header>

          <div className="screen">
            {ui.tab === 'yard' && (
              <YardScreen
                yard={yard} setYard={setYard} hasParts={parts.length > 0}
                onOpenBuild={() => setTab('build')} onLoadSample={loadSample} onClearBuild={clearBuild}
              />
            )}
            {ui.tab === 'plan' && (
              <PlanScreen
                cells={cells} brush={ui.brush} setBrush={setBrush} patchCells={patchCells}
                mark={() => dispatch({ type: 'mark' })} commit={() => dispatch({ type: 'commit' })}
                yard={yard} onConvert={convertPlan} onClear={clearPlan}
                render={ui.render} setRender={r => setUi({ render: r })}
              />
            )}
            {ui.tab === 'build' && (
              <BuildScreen
                parts={parts} sel={sel} yard={yard} maxLvl={maxLvl}
                marks={ui.marks} setMarks={m => setUi({ marks: m })}
                render={ui.render} setRender={r => setUi({ render: r })}
                camera={ui.camera} setCamera={c => setUi({ camera: c })}
                snap={ui.snap} setSnap={v => setUi({ snap: v })}
                groupMove={ui.groupMove} setGroupMove={v => setUi({ groupMove: v })}
                tool={ui.tool} toolParams={ui.toolParams || {}} setTool={setTool} setToolParams={setToolParams} onPlaceTool={placeTool}
                setSel={setSel} mutSel={mutSel} editPiece={editPiece}
                addPart={addPart} addPiece={addPiece} removeSel={removeSel} duplicateSel={duplicateSel} dropSel={dropSel} explodeSel={explodeSel}
                moveSel={moveSel} movePiece={movePiece} moveGroup={moveGroup}
                onDragStart={() => dispatch({ type: 'mark' })} onDragEnd={() => dispatch({ type: 'commit' })}
                moveGroupBy={moveGroupBy} rotateGroup={rotateGroup} deleteGroup={deleteGroup} ungroup={ungroup} copyGroup={copyGroup} dropGroup={dropGroup}
              />
            )}
            {ui.tab === 'parts' && (
              <PartsScreen
                filter={ui.filter} setFilter={f => setUi({ filter: f })}
                catalog={ui.catalog} setCatalog={c => setUi({ catalog: c })}
                addPart={addPart} addPiece={addPiece}
              />
            )}
            {ui.tab === 'list' && (
              <ListScreen checks={checks} cuts={cuts} buys={buys} total={total} budget={yard.budget} onShare={share} onPrint={exportSheet} hasParts={parts.length > 0} />
            )}
            {ui.tab === 'sheet' && (
              <SheetScreen
                project={project} cuts={cuts} checks={checks} total={total}
                specTab={ui.specTab} setSpecTab={t => setUi({ specTab: t })}
                onExport={exportSheet}
              />
            )}
          </div>

          {toast && <div key={toast.id} className="toast">{toast.msg}</div>}
          <TabBar tab={ui.tab} onPick={setTab} />
        </div>
      </div>
      <PrintSheet project={project} snapshot={shot} cuts={cuts} buys={buys} checks={checks} total={total} />
    </>
  );
}
