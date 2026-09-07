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
