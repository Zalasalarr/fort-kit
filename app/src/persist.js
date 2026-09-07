import { stockById } from './data.js';

const KEY = 'fortkit.project';
const PREFS_KEY = 'fortkit.prefs';

export function loadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY));
    return p && typeof p === 'object' ? p : {};
  } catch {
    return {};
  }
}

export function savePrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

function normalize(p) {
  if (!p || !Array.isArray(p.parts) || !p.yard) return null;
  return {
    name: typeof p.name === 'string' && p.name.trim() ? p.name : 'Untitled build',
    parts: p.parts,
    yard: p.yard,
    cells: p.cells && typeof p.cells === 'object' ? p.cells : {},
  };
}

export function loadSaved() {
  try {
    return normalize(JSON.parse(localStorage.getItem(KEY)));
  } catch {
    return null;
  }
}

export function save(project) {
  try {
    localStorage.setItem(KEY, JSON.stringify(project));
  } catch {
    // storage full or unavailable; the session still works in memory
  }
}

function toBase64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function shareUrl(project) {
  const url = new URL(window.location.href);
  url.hash = 'p=' + toBase64Url(JSON.stringify(project));
  return url.toString();
}

export function loadFromHash() {
  const m = /[#&]p=([A-Za-z0-9_-]+)/.exec(window.location.hash);
  if (!m) return null;
  try {
    const project = normalize(JSON.parse(fromBase64Url(m[1])));
    history.replaceState(null, '', window.location.pathname + window.location.search);
    return project;
  } catch {
    return null;
  }
}

/* ---------- multiple projects ---------- */

const INDEX_KEY = 'fortkit.index';
const PKEY = id => 'fortkit.p.' + id;

export const newProjectId = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function loadIndex() {
  try {
    const idx = JSON.parse(localStorage.getItem(INDEX_KEY));
    if (idx && Array.isArray(idx.items)) return idx;
  } catch {
    // fall through
  }
  return { current: null, items: [] };
}

export function saveIndex(idx) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(idx));
  } catch {
    // ignore
  }
}

export function loadProject(id) {
  try {
    return normalize(JSON.parse(localStorage.getItem(PKEY(id))));
  } catch {
    return null;
  }
}

export function saveProject(id, project) {
  try {
    localStorage.setItem(PKEY(id), JSON.stringify(project));
  } catch {
    // storage full or unavailable
  }
}

export function removeProject(id) {
  try {
    localStorage.removeItem(PKEY(id));
  } catch {
    // ignore
  }
}

// The index, migrating a single pre-multi-project save into the first entry
export function loadWorkspace() {
  let idx = loadIndex();
  if (!idx.items.length) {
    const old = loadSaved();
    if (old) {
      const id = newProjectId();
      saveProject(id, old);
      idx = { current: id, items: [{ id, name: old.name, updated: Date.now(), parts: old.parts.length }] };
      saveIndex(idx);
      try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    }
  }
  return idx;
}

/* ---------- custom parts library (shared by all projects on this device) ---------- */

const LIB_KEY = 'fortkit.library';

export function loadLibrary() {
  try {
    const lib = JSON.parse(localStorage.getItem(LIB_KEY));
    return Array.isArray(lib) ? lib.filter(it => it && it.id && Array.isArray(it.pieces)) : [];
  } catch {
    return [];
  }
}

export function saveLibrary(lib) {
  try {
    localStorage.setItem(LIB_KEY, JSON.stringify(lib));
  } catch {
    // ignore
  }
}

/* ---------- sharing custom parts ---------- */

const r3 = v => Math.round(v * 1000) / 1000;

// Compact array form for links: [stock, cx, cy, cz, L, W, yaw, pitch, roll] with trailing defaults dropped
export function packPieces(pieces) {
  return pieces.map(p => {
    const st = stockById(p.stock);
    const arr = [p.stock, r3(p.cx), r3(p.cy), r3(p.cz), r3(p.L ?? st.L), r3(p.W ?? st.W), p.yaw || 0, p.pitch || 0, p.roll || 0];
    while (arr.length > 4 && (arr[arr.length - 1] === 0 || (arr.length === 6 && arr[5] === st.W) || (arr.length === 5 && arr[4] === st.L))) arr.pop();
    return arr;
  });
}

export function unpackPieces(arr) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  arr.forEach(a => {
    if (!Array.isArray(a) || a.length < 4) return;
    const st = stockById(a[0]);
    if (!st) return;
    const nums = a.slice(1).map(Number);
    if (nums.some(n => !Number.isFinite(n))) return;
    const [cx, cy, cz, L = st.L, W = st.W, yaw = 0, pitch = 0, roll = 0] = nums;
    out.push({ k: 'piece', stock: st.id, mat: st.mat, L, W, cx, cy, cz, yaw, pitch, roll });
  });
  return out;
}

// Accept a full piece object (as stored) and keep only what we understand
function sanitizePiece(p) {
  if (!p || p.k !== 'piece') return null;
  const st = stockById(p.stock);
  if (!st) return null;
  const n = v => (Number.isFinite(+v) ? +v : 0);
  return { k: 'piece', stock: st.id, mat: st.mat, L: n(p.L ?? st.L), W: n(p.W ?? st.W), cx: n(p.cx), cy: n(p.cy), cz: n(p.cz), yaw: n(p.yaw), pitch: n(p.pitch), roll: n(p.roll) };
}

export function sanitizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const pieces = Array.isArray(raw.pieces) ? raw.pieces.map(sanitizePiece).filter(Boolean) : [];
  if (!pieces.length) return null;
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id.slice(0, 40) : 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: (typeof raw.name === 'string' && raw.name.trim() ? raw.name : 'Custom part').slice(0, 40),
    created: Number.isFinite(+raw.created) ? +raw.created : Date.now(),
    pieces,
  };
}

export function partShareUrl(items) {
  const payload = items.map(it => [it.id, it.name, it.created, packPieces(it.pieces)]);
  const url = new URL(window.location.href);
  url.hash = 'c=' + toBase64Url(JSON.stringify(payload));
  return url.toString();
}

export function loadPartsFromHash() {
  const m = /[#&]c=([A-Za-z0-9_-]+)/.exec(window.location.hash);
  if (!m) return [];
  try {
    const payload = JSON.parse(fromBase64Url(m[1]));
    history.replaceState(null, '', window.location.pathname + window.location.search);
    if (!Array.isArray(payload)) return [];
    return payload.map(([id, name, created, packed]) => sanitizeItem({ id, name, created, pieces: unpackPieces(packed) })).filter(Boolean);
  } catch {
    return [];
  }
}

export function exportLibraryJson(items) {
  return JSON.stringify({ app: 'fortkit', kind: 'library', version: 1, exported: new Date().toISOString(), items }, null, 2);
}

export function parseLibraryJson(text) {
  try {
    const data = JSON.parse(text);
    const list = Array.isArray(data) ? data : data && Array.isArray(data.items) ? data.items : [];
    return list.map(sanitizeItem).filter(Boolean);
  } catch {
    return [];
  }
}
