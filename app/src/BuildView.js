import * as THREE from 'three';
import { MATS } from './data.js';

export const VIEWS = {
  iso: { az: .78, el: .5 },
  plan: { az: 0, el: 1.55 },
  front: { az: 0, el: .12 },
  side: { az: Math.PI / 2, el: .12 },
};

const ZOOM_MIN = 4, ZOOM_MAX = 22;

export class BuildView {
  constructor(canvas, { az = .78, el = .5, zoom = 9, pick = false } = {}) {
    this.canvas = canvas;
    this.az = az;
    this.el = el;
    this.zoom = zoom;
    this.pick = pick;
    this.parts = [];
    this.sel = -1;
    this.bounds = [];
    this.onSelect = null;
    this.onMove = null;
    this.onDragStart = null;
    this.onDragEnd = null;
    this.afterDraw = null;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#f2f2f3');
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -300, 600);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8fa2b5, 1.0));
    const d = new THREE.DirectionalLight(0xffffff, .5);
    d.position.set(7, 14, 5);
    this.scene.add(d);

    this.ground = new THREE.Group();
    this.scene.add(this.ground);
    this.setYard(24, 18);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this._raycaster = new THREE.Raycaster();
    this._plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    this.resize();
    this.orbit();
    this._bind();
  }

  /* ---------- camera ---------- */

  resize(w = this.canvas.clientWidth, h = this.canvas.clientHeight) {
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    const a = w / h, z = this.zoom;
    this.cam.left = -z * a; this.cam.right = z * a; this.cam.top = z; this.cam.bottom = -z;
    this.cam.updateProjectionMatrix();
  }

  orbit() {
    const r = 60;
    this.cam.position.set(
      r * Math.cos(this.el) * Math.sin(this.az),
      r * Math.sin(this.el),
      r * Math.cos(this.el) * Math.cos(this.az)
    );
    this.cam.lookAt(0, 2.6, 0);
  }

  setView(name) {
    const v = VIEWS[name];
    if (!v) return;
    this.az = v.az; this.el = v.el;
    this.orbit(); this.draw();
  }

  zoomBy(delta) {
    this.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, this.zoom + delta));
    this.resize(); this.draw();
  }

  draw() {
    this.renderer.render(this.scene, this.cam);
    if (this.afterDraw) this.afterDraw(this);
  }

  project(x, y, z) {
    const p = new THREE.Vector3(x, y, z).project(this.cam);
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    return { x: (p.x * .5 + .5) * w, y: (-p.y * .5 + .5) * h };
  }

  /* ---------- yard ---------- */

  setYard(w, d) {
    if (this._yardW === w && this._yardD === d) return;
    this._yardW = w; this._yardD = d;
    this.ground.clear();
    const size = Math.max(26, Math.ceil(Math.max(w, d) / 2) * 2 + 8);
    const g = new THREE.GridHelper(size, size, new THREE.Color('#b7b7ba'), new THREE.Color('#dcdde0'));
    g.material.transparent = true; g.material.opacity = .9;
    this.ground.add(g);
    const hw = w / 2, hd = d / 2;
    const pts = [
      new THREE.Vector3(-hw, .02, -hd), new THREE.Vector3(hw, .02, -hd),
      new THREE.Vector3(hw, .02, hd), new THREE.Vector3(-hw, .02, hd),
    ];
    const outline = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x597ea3 })
    );
    this.ground.add(outline);
  }

  /* ---------- input ---------- */

  _bind() {
    const canvas = this.canvas;
    const pointers = new Map();
    let orbiting = false, px = 0, py = 0, pinch = null;

    this._onDown = e => {
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: this.zoom };
        this._drag = null; orbiting = false;
        return;
      }
      if (pointers.size > 2) return;

      if (this.pick) {
        const hit = this._hit(e);
        if (hit) {
          const part = this.parts[hit.idx];
          this._plane.constant = -hit.point.y;
          this._drag = { idx: hit.idx, start: hit.point.clone(), ox: part.x, oz: part.z, moved: false };
          if (this.onSelect) this.onSelect(hit.idx);
          return;
        }
      }
      orbiting = true; px = e.clientX; py = e.clientY;
    };

    this._onMove = e => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        this.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pinch.zoom * pinch.dist / dist));
        this.resize(); this.draw();
        return;
      }
      if (this._drag) {
        const p = this._planePoint(e);
        if (!p) return;
        const nx = Math.round(this._drag.ox + p.x - this._drag.start.x);
        const nz = Math.round(this._drag.oz + p.z - this._drag.start.z);
        const part = this.parts[this._drag.idx];
        if (part && (nx !== part.x || nz !== part.z)) {
          if (!this._drag.moved) { this._drag.moved = true; if (this.onDragStart) this.onDragStart(); }
          if (this.onMove) this.onMove(this._drag.idx, nx, nz);
        }
        return;
      }
      if (!orbiting) return;
      const dx = e.clientX - px, dy = e.clientY - py;
      px = e.clientX; py = e.clientY;
      this.az -= dx * .008;
      this.el = Math.max(.12, Math.min(1.55, this.el + dy * .006));
      this.orbit(); this.draw();
    };

    this._onUp = e => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (this._drag) {
        if (this._drag.moved && this.onDragEnd) this.onDragEnd();
        this._drag = null;
      }
      if (pointers.size === 0) orbiting = false;
    };

    this._onWheel = e => {
      e.preventDefault();
      this.zoomBy(e.deltaY > 0 ? 1 : -1);
    };

    canvas.addEventListener('pointerdown', this._onDown);
    canvas.addEventListener('pointermove', this._onMove);
    canvas.addEventListener('pointerup', this._onUp);
    canvas.addEventListener('pointercancel', this._onUp);
    canvas.addEventListener('wheel', this._onWheel, { passive: false });
  }

  _ndc(e) {
    const r = this.canvas.getBoundingClientRect();
    return new THREE.Vector2(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1
    );
  }

  _hit(e) {
    this._raycaster.setFromCamera(this._ndc(e), this.cam);
    const hits = this._raycaster.intersectObjects(this.group.children, true);
    for (const h of hits) {
      let o = h.object;
      while (o && o.userData.idx === undefined) o = o.parent;
      if (o) return { idx: o.userData.idx, point: h.point };
    }
    return null;
  }

  _planePoint(e) {
    this._raycaster.setFromCamera(this._ndc(e), this.cam);
    const out = new THREE.Vector3();
    return this._raycaster.ray.intersectPlane(this._plane, out) ? out : null;
  }

  /* ---------- geometry ---------- */

  box(grp, mat, w, h, d, x, y, z) {
    const g = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: MATS[mat].c }));
    m.position.set(x, y + h / 2, z);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(g),
      new THREE.LineBasicMaterial({ color: 0x1d1f20, transparent: true, opacity: .42 }));
    e.position.copy(m.position);
    grp.add(m); grp.add(e);
  }

  buildPart(p) {
    const g = new THREE.Group(), m = p.mat, y = p.lvl;
    const B = (w, h, d, x, yy, z) => this.box(g, m, w, h, d, x, yy, z);
    if (p.k === 'platform') {
      B(4, .35, 4, 0, y, 0);
      if (y > 0) [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]].forEach(c => B(.35, y, .35, c[0], 0, c[1]));
    } else if (p.k === 'rail') {
      B(.2, 3, .2, -1.9, y, 0); B(.2, 3, .2, 1.9, y, 0);
      B(4, .2, .2, 0, y + 2.7, 0); B(4, .15, .15, 0, y + 1.4, 0);
    } else if (p.k === 'ladder') {
      B(.25, 6, .25, -.8, y, 0); B(.25, 6, .25, .8, y, 0);
      for (let i = 1; i <= 5; i++) B(1.6, .16, .16, 0, y + i, 0);
    } else if (p.k === 'wall') {
      B(4, 4, .3, 0, y, 0);
    } else if (p.k === 'climb') {
      B(4, 6, .4, 0, y, 0);
      const hs = [[-1.3, .9], [.4, 1.4], [1.4, 2.4], [-.6, 2.2], [1.1, 3.5], [-1.5, 3.9], [.2, 4.6], [1.5, 5.2], [-1, 5.3], [.9, .6], [-1.7, 2.9], [.6, 3]];
      hs.forEach(h => this.box(g, 'holds', .38, .34, .34, h[0], y + h[1], .34));
    } else if (p.k === 'net') {
      B(.25, 6, .25, -2, y, 0); B(.25, 6, .25, 2, y, 0);
      B(4, .2, .2, 0, y + 5.8, 0);
      const pts = [];
      for (let i = 0; i <= 8; i++) { const x = -2 + i * .5; pts.push(new THREE.Vector3(x, y + .2, 0), new THREE.Vector3(x, y + 5.8, 0)); }
      for (let j = 0; j <= 8; j++) { const yy = y + .2 + j * .7; pts.push(new THREE.Vector3(-2, yy, 0), new THREE.Vector3(2, yy, 0)); }
      const lg = new THREE.BufferGeometry().setFromPoints(pts);
      g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x5d5d60 })));
    } else if (p.k === 'monkey') {
      B(.3, 7, .3, -3, y, 0); B(.3, 7, .3, 3, y, 0);
      B(6, .3, .3, 0, y + 6.7, 0);
      for (let i = -2; i <= 2; i++) B(.24, .24, 2, i * 1.2, y + 6.7, 0);
    } else if (p.k === 'roof') {
      B(5, .18, 5, 0, y, 0);
      B(.2, .8, 5, -2.4, y - .8, 0); B(.2, .8, 5, 2.4, y - .8, 0);
    } else if (p.k === 'pad') {
      B(4, .9, 4, 0, y, 0);
    } else if (p.k === 'post') {
      B(.4, 6, .4, 0, y, 0);
    } else if (p.k === 'mass') {
      B(2, p.h, 2, 0, y, 0);
    }
    g.position.set(p.x, 0, p.z);
    g.rotation.y = (p.rot || 0) * Math.PI / 2;
    return g;
  }

  setParts(parts, selIdx = -1) {
    this.parts = parts;
    this.sel = selIdx;
    this.bounds = [];
    this.group.clear();
    parts.forEach((p, i) => {
      const g = this.buildPart(p);
      g.userData.idx = i;
      this.group.add(g);
      const bb = new THREE.Box3().setFromObject(g);
      if (!bb.isEmpty()) {
        const c = bb.getCenter(new THREE.Vector3());
        this.bounds[i] = { x: c.x, z: c.z, top: bb.max.y };
        if (i === selIdx) {
          this.group.add(new THREE.Box3Helper(bb.expandByScalar(.16), new THREE.Color('#5980a6')));
        }
      }
    });
    this.draw();
  }

  destroy() {
    const c = this.canvas;
    c.removeEventListener('pointerdown', this._onDown);
    c.removeEventListener('pointermove', this._onMove);
    c.removeEventListener('pointerup', this._onUp);
    c.removeEventListener('pointercancel', this._onUp);
    c.removeEventListener('wheel', this._onWheel);
    this.renderer.dispose();
  }
}

// Renders the build to a PNG data URL on a detached canvas, for the print sheet
export function snapshot(parts, yard, { w = 1400, h = 900, view = 'iso', zoom = 9 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const v = new BuildView(canvas, { ...VIEWS[view], zoom });
  v.renderer.setPixelRatio(1);
  v.setYard(yard.w, yard.d);
  v.resize(w, h);
  v.setParts(parts, -1);
  const url = canvas.toDataURL('image/png');
  v.destroy();
  return url;
}
