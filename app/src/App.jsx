import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Vector3 } from 'three';
import { SAMPLE_PROJECT, emptyProject, partByKey, stockById } from './data.js';
import {
  cost, cutList, buyList, safetyChecks, maxLevel, massParts,
  isPiece, newPiece, restAt, pieceBottom, supportUnder, copyOffset,
  groupIndices, unionAABB, supportUnderSet, normalizePieces,
} from './logic.js';
import { generate, transformGroup, explode, defaultParams, newGroupId, TOOLS } from './generators.js';
import { reducer, initState } from './store.js';
import { shareUrl, loadFromHash, loadPrefs, savePrefs, loadWorkspace, loadProject, saveProject, saveIndex, removeProject, newProjectId, loadLibrary, saveLibrary, partShareUrl, loadPartsFromHash, exportLibraryJson, parseLibraryJson } from './persist.js';
import { snapshot } from './BuildView.js';
import TabBar from './components/TabBar.jsx';
import YardScreen from './components/YardScreen.jsx';
import PlanScreen from './components/PlanScreen.jsx';
import BuildScreen from './components/BuildScreen.jsx';
import PartsScreen from './components/PartsScreen.jsx';
import ListScreen from './components/ListScreen.jsx';
import SheetScreen from './components/SheetScreen.jsx';
import PrintSheet from './components/PrintSheet.jsx';
import ProjectsPanel from './components/ProjectsPanel.jsx';

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

const entry = (id, project) => ({ id, name: project.name, updated: Date.now(), parts: project.parts.length, cost: cost(project.parts) });

// Pick the project to open on load: a shared link becomes a new project, otherwise the last one open
function bootstrap() {
  const sharedParts = loadPartsFromHash();
  const res = bootstrapProject();
  if (sharedParts.length) { res.sharedParts = sharedParts; res.tab = 'parts'; }
  return res;
}

function bootstrapProject() {
  let ws = loadWorkspace();
  const fromHash = loadFromHash();
  if (fromHash) {
    const id = newProjectId();
    saveProject(id, fromHash);
    ws = { current: id, items: [entry(id, fromHash), ...ws.items] };
    saveIndex(ws);
    return { ws, project: fromHash, tab: 'build' };
  }
  const openId = ws.current && ws.items.some(i => i.id === ws.current) ? ws.current : (ws.items[0] && ws.items[0].id);
  const existing = openId ? loadProject(openId) : null;
  if (existing) {
    if (ws.current !== openId) { ws = { ...ws, current: openId }; saveIndex(ws); }
    return { ws, project: existing, tab: 'build' };
  }
  const id = newProjectId();
  saveProject(id, SAMPLE_PROJECT);
  ws = { current: id, items: [entry(id, SAMPLE_PROJECT)] };
  saveIndex(ws);
  return { ws, project: SAMPLE_PROJECT, tab: 'yard' };
}

export default function App() {
  const boot = useRef(null);
  if (!boot.current) boot.current = bootstrap();
  const [ws, setWs] = useState(boot.current.ws);
  const [showProjects, setShowProjects] = useState(false);
  const [library, setLibrary] = useState(() => loadLibrary());
  const [s, dispatch] = useReducer(reducer, null, () => initState(boot.current.project, boot.current.tab, loadPrefs()));
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

  const wsRef = useRef(ws);
  wsRef.current = ws;
  const persist = () => {
    const id = wsRef.current.current;
    if (!id) return;
    saveProject(id, project);
    setWs(w => {
      const items = w.items.map(it => (it.id === id ? { ...it, ...entry(id, project) } : it));
      const next = { ...w, items };
      saveIndex(next);
      return next;
    });
  };
  useEffect(() => {
    const t = setTimeout(persist, 300);
    window.addEventListener('pagehide', persist);
    return () => { clearTimeout(t); window.removeEventListener('pagehide', persist); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  /* ---------- custom parts ---------- */
  const updateLibrary = fn => setLibrary(lib => { const next = fn(lib); saveLibrary(next); return next; });

  // Save the selected group / piece, or the whole build, as a reusable named part
  const saveCustom = (name, scope) => {
    let source;
    if (scope === 'build') {
      source = [];
      let skipped = 0;
      parts.forEach(p => {
        if (isPiece(p)) { source.push(p); return; }
        const ex = explode(p);
        if (ex) source.push(...ex); else skipped++;
      });
      if (skipped) say(`${skipped} mass block${skipped > 1 ? 's' : ''} left out — they can't become pieces`);
    } else {
      if (sel < 0) return false;
      const idxs = (ui.groupMove && groupIndices(parts, sel)) || [sel];
      source = idxs.map(i => parts[i]);
      if (!source.every(isPiece)) {
        const ex = explode(source[0]);
        if (!ex) { say('Explode this part first, then save it'); return false; }
        source = ex;
      }
    }
    const pieces = normalizePieces(source);
    if (!pieces.length) { say('Nothing to save yet'); return false; }
    const clean = (name || '').trim() || 'Custom part';
    const item = { id: 'c' + Date.now().toString(36), name: clean, created: Date.now(), pieces, count: pieces.length, cost: Math.round(cost(pieces)) };
    updateLibrary(lib => [item, ...lib]);
    say(`Saved "${clean}" · ${pieces.length} piece${pieces.length > 1 ? 's' : ''}`);
    return true;
  };

  const placeCustom = id => {
    const item = library.find(it => it.id === id);
    if (!item) return;
    const placed = transformGroup(item.pieces, { x: (((parts.length * 3) % 9) - 4) * 12, y: 0, z: 48, id: newGroupId(), name: item.name });
    setParts(prev => prev.concat(placed));
    setSel(parts.length);
    setUi({ tab: 'build', groupMove: true });
    say(`${item.name} placed · ${placed.length} piece${placed.length > 1 ? 's' : ''} · drag it into position`);
  };

  const renameCustom = (id, name) => {
    const clean = (name || '').trim();
    if (!clean) return;
    updateLibrary(lib => lib.map(it => (it.id === id ? { ...it, name: clean } : it)));
  };

  const deleteCustom = id => {
    updateLibrary(lib => lib.filter(it => it.id !== id));
    say('Custom part deleted');
  };

  // Bring parts in from a link or a file; parts already on this device are skipped
  const importParts = items => {
    if (!items.length) { say('No parts found to import'); return; }
    const have = new Set(library.map(it => it.id));
    const fresh = items.filter(it => !have.has(it.id)).map(it => ({ ...it, count: it.pieces.length, cost: Math.round(cost(it.pieces)) }));
    if (fresh.length) updateLibrary(lib => [...fresh, ...lib]);
    const skipped = items.length - fresh.length;
    say(fresh.length
      ? `Imported ${fresh.length} part${fresh.length > 1 ? 's' : ''}${skipped ? ` · ${skipped} already here` : ''}`
      : `Already on this device: ${items.map(it => it.name).join(', ')}`);
    setUi({ tab: 'parts', catalog: 'custom' });
  };

  const sharePart = async id => {
    const item = library.find(it => it.id === id);
    if (!item) return;
    const url = partShareUrl([item]);
    if (navigator.share) {
      try { await navigator.share({ title: `${item.name} · Fort Kit part`, url }); return; } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      say(`Link to "${item.name}" copied`);
    } catch {
      window.prompt('Copy this link', url);
    }
  };

  const exportLibrary = () => {
    if (!library.length) { say('Nothing to export yet'); return; }
    const blob = new Blob([exportLibraryJson(library)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'fortkit-parts.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    say(`Exported ${library.length} part${library.length > 1 ? 's' : ''}`);
  };

  const importLibraryFile = async file => {
    if (!file) return;
    importParts(parseLibraryJson(await file.text()));
  };

  useEffect(() => {
    if (boot.current.sharedParts && !boot.current.sharedImported) {
      boot.current.sharedImported = true;
      importParts(boot.current.sharedParts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- projects ---------- */
  const switchTo = (id, proj, tab = 'build') => {
    dispatch({ type: 'load', project: proj });
    setWs(w => { const next = { ...w, current: id }; saveIndex(next); return next; });
    setUi({ tab, sel: 0, tool: null });
    setShowProjects(false);
  };
  const openProject = id => {
    if (id === ws.current) { setShowProjects(false); return; }
    saveProject(ws.current, project);
    const proj = loadProject(id);
    if (!proj) { say('That project could not be read'); return; }
    switchTo(id, proj);
    say(`Opened ${proj.name}`);
  };
  const createProject = proj => {
    saveProject(ws.current, project);
    const id = newProjectId();
    saveProject(id, proj);
    setWs(w => { const next = { current: id, items: [entry(id, proj), ...w.items] }; saveIndex(next); return next; });
    dispatch({ type: 'load', project: proj });
    setShowProjects(false);
    return id;
  };
  const newProject = () => {
    const n = ws.items.length + 1;
    createProject({ ...emptyProject(yard), name: `Untitled build ${n}` });
    setUi({ tab: 'yard', sel: 0, tool: null });
    say('New project — set up the yard first');
  };
  const newFromSample = () => {
    createProject({ ...SAMPLE_PROJECT, name: `Corner fort + climb wall ${ws.items.length + 1}` });
    setUi({ tab: 'build', sel: 0, tool: null });
    say('Sample fort loaded as a new project');
  };
  const copyProject = id => {
    const src = id === ws.current ? project : loadProject(id);
    if (!src) return;
    createProject({ ...src, name: `${src.name} copy` });
    setUi({ tab: 'build', sel: 0, tool: null });
    say(`Copied ${src.name}`);
  };
  const deleteProject = id => {
    removeProject(id);
    const remaining = ws.items.filter(it => it.id !== id);
    if (id !== ws.current) {
      setWs(w => { const next = { ...w, items: remaining }; saveIndex(next); return next; });
      return;
    }
    const nextItem = remaining.slice().sort((a, b) => (b.updated || 0) - (a.updated || 0))[0];
    const nextProj = nextItem && loadProject(nextItem.id);
    if (nextProj) {
      dispatch({ type: 'load', project: nextProj });
      setWs({ current: nextItem.id, items: remaining });
      saveIndex({ current: nextItem.id, items: remaining });
      setUi({ tab: 'build', sel: 0, tool: null });
    } else {
      const proj = { ...emptyProject(yard), name: 'Untitled build' };
      const nid = newProjectId();
      saveProject(nid, proj);
      const next = { current: nid, items: [entry(nid, proj)] };
      setWs(next); saveIndex(next);
      dispatch({ type: 'load', project: proj });
      setUi({ tab: 'yard', sel: 0, tool: null });
    }
    setShowProjects(false);
    say('Project deleted');
  };

  useEffect(() => {
    savePrefs({ render: ui.render, camera: ui.camera, snap: ui.snap });
  }, [ui.render, ui.camera, ui.snap]);

  // A share link pasted into the running app is imported as a new project
  useEffect(() => {
    const onHash = () => {
      const sharedParts = loadPartsFromHash();
      if (sharedParts.length) { importParts(sharedParts); return; }
      const shared = loadFromHash();
      if (!shared) return;
      createProject(shared);
      setUi({ tab: 'build', sel: 0, tool: null });
      say(`Imported ${shared.name} as a new project`);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  });

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
      if (showProjects) return;
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
              <div className="mono projects-btn" onClick={() => setShowProjects(true)} title="All projects">
                Projects ▾ · {Math.max(1, ws.items.findIndex(it => it.id === ws.current) + 1)} of {ws.items.length}
              </div>
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
                onProjects={() => setShowProjects(true)}
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
                library={library} onPlaceCustom={placeCustom} onSaveCustom={saveCustom}
              />
            )}
            {ui.tab === 'parts' && (
              <PartsScreen
                filter={ui.filter} setFilter={f => setUi({ filter: f })}
                catalog={ui.catalog} setCatalog={c => setUi({ catalog: c })}
                addPart={addPart} addPiece={addPiece}
                library={library} onPlaceCustom={placeCustom} onRenameCustom={renameCustom} onDeleteCustom={deleteCustom}
                onSharePart={sharePart} onExportLibrary={exportLibrary} onImportFile={importLibraryFile}
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
          {showProjects && (
            <ProjectsPanel
              items={ws.items} currentId={ws.current}
              onOpen={openProject} onNew={newProject} onNewSample={newFromSample} onCopy={copyProject} onDelete={deleteProject}
              onClose={() => setShowProjects(false)}
            />
          )}
          <TabBar tab={ui.tab} onPick={setTab} />
        </div>
      </div>
      <PrintSheet project={project} snapshot={shot} cuts={cuts} buys={buys} checks={checks} total={total} />
    </>
  );
}
