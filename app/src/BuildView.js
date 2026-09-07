import * as THREE from 'three';
import { MATS } from './data.js';
import { realMaterial, groundMaterial, holdColor } from './textures.js';

export const VIEWS = {
  iso: { az: .78, el: .5 },
  plan: { az: 0, el: 1.55 },
  front: { az: 0, el: .12 },
  side: { az: Math.PI / 2, el: .12 },
};

const ZOOM_MIN = 4, ZOOM_MAX = 22;
const BG = { blueprint: '#f2f2f3', real: '#e3ecf5' };
const TARGET = new THREE.Vector3(0, 2.6, 0);

export class BuildView {
  constructor(canvas, { az = .78, el = .5, zoom = 9, pick = false, mode = 'blueprint', camera = 'iso' } = {}) {
    this.canvas = canvas;
    this.az = az;
    this.el = el;
    this.zoom = zoom;
    this.pick = pick;
    this.mode = mode;
    this.cameraKind = camera;
    this.parts = [];
    this.sel = -1;
    this.bounds = [];
    this.onSelect = null;
    this.onMove = null;
    this.onDragStart = null;
    this.onDragEnd = null;
    this.afterDraw = null;

    this.scene = new THREE.Scene();
    this.ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, -300, 600);
    this.persp = new THREE.PerspectiveCamera(38, 1, .2, 600);

    // Blueprint lighting: flat and even
    this.lightsBlueprint = new THREE.Group();
    this.lightsBlueprint.add(new THREE.HemisphereLight(0xffffff, 0x8fa2b5, 1.0));
    const bd = new THREE.DirectionalLight(0xffffff, .5);
    bd.position.set(7, 14, 5);
    this.lightsBlueprint.add(bd);
    this.scene.add(this.lightsBlueprint);

    // Real lighting: sky + warm sun with shadows
    this.lightsReal = new THREE.Group();
    this.lightsReal.add(new THREE.HemisphereLight(0xd8e7ff, 0x8f9a78, 1.15));
    this.sun = new THREE.DirectionalLight(0xfff2dc, 2.4);
    this.sun.position.set(18, 30, 12);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = .03;
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 120;
    this.lightsReal.add(this.sun);
    this.lightsReal.add(this.sun.target);
    this.scene.add(this.lightsReal);

    this.ground = new THREE.Group();
    this.scene.add(this.ground);
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._raycaster = new THREE.Raycaster();
    this._plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    this._applyMode();
    this.setYard(24, 18);
    this.resize();
    this.orbit();
    this._bind();
  }

  get cam() { return this.cameraKind === 'persp' ? this.persp : this.ortho; }
  get real() { return this.mode === 'real'; }

  /* ---------- modes ---------- */

  setMode(mode) {
    if (mode === this.mode) return;
    this.mode = mode;
    this._applyMode();
    this._buildGround();
    this.setParts(this.parts, this.sel);
  }

  _applyMode() {
    const real = this.real;
    this.scene.background = new THREE.Color(BG[this.mode]);
    this.scene.fog = real ? new THREE.Fog(BG.real, 90, 240) : null;
    this.lightsReal.visible = real;
    this.lightsBlueprint.visible = !real;
    this.renderer.shadowMap.enabled = real;
    this.renderer.toneMapping = real ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
    this.renderer.toneMappingExposure = 1.0;
  }

  setCamera(kind) {
    if (kind === this.cameraKind) return;
    this.cameraKind = kind;
    this.resize(); this.orbit(); this.draw();
  }

  /* ---------- camera ---------- */

  resize(w = this.canvas.clientWidth, h = this.canvas.clientHeight) {
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    const a = w / h, z = this.zoom;
    this.ortho.left = -z * a; this.ortho.right = z * a; this.ortho.top = z; this.ortho.bottom = -z;
    this.ortho.updateProjectionMatrix();
    this.persp.aspect = a;
    this.persp.updateProjectionMatrix();
  }

  orbit() {
    const dir = new THREE.Vector3(
      Math.cos(this.el) * Math.sin(this.az),
      Math.sin(this.el),
      Math.cos(this.el) * Math.cos(this.az)
    );
    this.ortho.position.copy(TARGET).addScaledVector(dir, 60);
    this.ortho.lookAt(TARGET);
    this.persp.position.copy(TARGET).addScaledVector(dir, this.zoom * 3.2);
    this.persp.lookAt(TARGET);
  }

  setView(name) {
    const v = VIEWS[name];
    if (!v) return;
    this.az = v.az; this.el = v.el;
    this.orbit(); this.draw();
  }

  zoomBy(delta) {
    this.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, this.zoom + delta));
    this.resize(); this.orbit(); this.draw();
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

  /* ---------- yard & ground ---------- */

  setYard(w, d) {
    if (this._yardW === w && this._yardD === d) return;
    this._yardW = w; this._yardD = d;
    const s = Math.max(w, d) / 2 + 10;
    const sc = this.sun.shadow.camera;
    sc.left = -s; sc.right = s; sc.top = s; sc.bottom = -s;
    sc.updateProjectionMatrix();
    this._buildGround();
  }

  _buildGround() {
    const w = this._yardW, d = this._yardD;
    this.ground.clear();
    const size = Math.max(26, Math.ceil(Math.max(w, d) / 2) * 2 + 8);

    if (this.real) {
      const around = new THREE.Mesh(new THREE.PlaneGeometry(320, 320), groundMaterial('Grass', 320, 320));
      around.material.color.set('#aeb9a0');
      around.rotation.x = -Math.PI / 2;
      around.position.y = -.03;
      around.receiveShadow = true;
      this.ground.add(around);

      const yard = new THREE.Mesh(new THREE.PlaneGeometry(w, d), groundMaterial(this._groundType || 'Grass', w, d));
      yard.rotation.x = -Math.PI / 2;
      yard.receiveShadow = true;
      this.ground.add(yard);
    }

    const g = new THREE.GridHelper(size, size, new THREE.Color('#b7b7ba'), new THREE.Color('#dcdde0'));
    g.material.transparent = true;
    g.material.opacity = this.real ? .22 : .9;
    g.position.y = .012;
    this.ground.add(g);

    const hw = w / 2, hd = d / 2;
    const pts = [
      new THREE.Vector3(-hw, .02, -hd), new THREE.Vector3(hw, .02, -hd),
      new THREE.Vector3(hw, .02, hd), new THREE.Vector3(-hw, .02, hd),
    ];
    this.ground.add(new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x597ea3 })
    ));
  }

  setGroundType(type) {
    if (type === this._groundType) return;
    this._groundType = type;
    if (this.real) this._buildGround();
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
        this.resize(); this.orbit(); this.draw();
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

  box(grp, mat, w, h, d, x, y, z, opts = {}) {
    const g = new THREE.BoxGeometry(w, h, d);
    let m;
    if (this.real) {
      m = new THREE.Mesh(g, realMaterial(mat, w, h, d, opts));
      m.castShadow = true;
      m.receiveShadow = true;
    } else {
      m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: MATS[mat].c }));
    }
    m.position.set(x, y + h / 2, z);
    grp.add(m);
    if (!this.real) {
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(g),
        new THREE.LineBasicMaterial({ color: 0x1d1f20, transparent: true, opacity: .42 }));
      e.position.copy(m.position);
      grp.add(e);
    }
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
      // The panel itself is plywood in the real view; the blueprint keeps the design's holds tone
      const panelMat = m === 'holds' ? (this.real ? 'wood' : 'holds') : m;
      this.box(g, panelMat, 4, 6, .4, 0, y, 0);
      const hs = [[-1.3, .9], [.4, 1.4], [1.4, 2.4], [-.6, 2.2], [1.1, 3.5], [-1.5, 3.9], [.2, 4.6], [1.5, 5.2], [-1, 5.3], [.9, .6], [-1.7, 2.9], [.6, 3]];
      hs.forEach((h, i) => this.box(g, 'holds', .38, .34, .34, h[0], y + h[1], .34, this.real ? { color: holdColor(i) } : {}));
    } else if (p.k === 'net') {
      B(.25, 6, .25, -2, y, 0); B(.25, 6, .25, 2, y, 0);
      B(4, .2, .2, 0, y + 5.8, 0);
      if (this.real) {
        for (let i = 0; i <= 8; i++) B(.06, 5.6, .06, -2 + i * .5, y + .2, 0);
        for (let j = 0; j <= 8; j++) B(4, .06, .06, 0, y + .2 + j * .7, 0);
      } else {
        const pts = [];
        for (let i = 0; i <= 8; i++) { const x = -2 + i * .5; pts.push(new THREE.Vector3(x, y + .2, 0), new THREE.Vector3(x, y + 5.8, 0)); }
        for (let j = 0; j <= 8; j++) { const yy = y + .2 + j * .7; pts.push(new THREE.Vector3(-2, yy, 0), new THREE.Vector3(2, yy, 0)); }
        const lg = new THREE.BufferGeometry().setFromPoints(pts);
        g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x5d5d60 })));
      }
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
export function snapshot(parts, yard, { w = 1400, h = 900, view = 'iso', zoom = 9, mode = 'blueprint' } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const v = new BuildView(canvas, { ...VIEWS[view], zoom, mode });
  v.renderer.setPixelRatio(1);
  v.setGroundType(yard.ground);
  v.setYard(yard.w, yard.d);
  v.resize(w, h);
  v.setParts(parts, -1);
  const url = canvas.toDataURL('image/png');
  v.destroy();
  return url;
}
