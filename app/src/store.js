const HISTORY_LIMIT = 60;

export function initState(project, tab, prefs = {}) {
  return {
    project,
    past: [],
    future: [],
    pending: null,
    ui: {
      tab, sel: 0, filter: 'all', brush: { mat: 'wood', h: 4 }, marks: false, specTab: 'parts',
      render: prefs.render === 'blueprint' ? 'blueprint' : 'real',
      camera: prefs.camera === 'persp' ? 'persp' : 'iso',
    },
  };
}

function apply(current, patch) {
  return typeof patch === 'function' ? patch(current) : { ...current, ...patch };
}

export function reducer(s, a) {
  switch (a.type) {
    case 'project': {
      const next = apply(s.project, a.patch);
      if (next === s.project) return s;
      if (a.transient) return { ...s, project: next };
      return { ...s, project: next, past: [...s.past.slice(-HISTORY_LIMIT), s.project], future: [] };
    }
    case 'mark':
      return s.pending ? s : { ...s, pending: s.project };
    case 'commit': {
      if (!s.pending) return s;
      if (s.pending === s.project) return { ...s, pending: null };
      return { ...s, pending: null, past: [...s.past.slice(-HISTORY_LIMIT), s.pending], future: [] };
    }
    case 'ui':
      return { ...s, ui: apply(s.ui, a.patch) };
    case 'undo': {
      if (!s.past.length) return s;
      const prev = s.past[s.past.length - 1];
      return { ...s, project: prev, past: s.past.slice(0, -1), future: [s.project, ...s.future], pending: null };
    }
    case 'redo': {
      if (!s.future.length) return s;
      const [next, ...rest] = s.future;
      return { ...s, project: next, past: [...s.past, s.project], future: rest, pending: null };
    }
    case 'load':
      return { ...s, project: a.project, past: [], future: [], pending: null, ui: { ...s.ui, sel: 0 } };
    default:
      return s;
  }
}
