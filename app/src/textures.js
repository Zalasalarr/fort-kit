import * as THREE from 'three';

// Deterministic PRNG so textures look identical on every load
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cache = {};

function canvasTexture(key, size, tileFt, draw) {
  if (cache[key]) return cache[key];
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size, rng(key.length * 7919 + 13));
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.userData.tileFt = tileFt;
  cache[key] = t;
  return t;
}

/* ---------- material textures ---------- */

const wood = () => canvasTexture('wood', 512, 2, (ctx, S, r) => {
  ctx.fillStyle = '#c9a874';
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = `rgba(150,108,58,${.08 + r() * .14})`;
    const y = r() * S, h = 12 + r() * 50;
    ctx.fillRect(0, y, S, h);
  }
  for (let i = 0; i < 140; i++) {
    const y0 = r() * S, amp = 1 + r() * 3, freq = 1 + r() * 2, ph = r() * 6.28;
    ctx.strokeStyle = `rgba(92,58,26,${.05 + r() * .22})`;
    ctx.lineWidth = .5 + r() * 2.2;
    ctx.beginPath();
    for (let x = 0; x <= S; x += 12) {
      const y = y0 + Math.sin((x / S) * 6.28 * freq + ph) * amp;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  for (let i = 0; i < 3; i++) {
    const x = r() * S, y = r() * S;
    for (let k = 6; k > 0; k--) {
      ctx.strokeStyle = `rgba(92,58,26,${.08 + k * .03})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, y, k * 5, k * 2.4, 0, 0, 6.28);
      ctx.stroke();
    }
  }
});

const brick = () => canvasTexture('brick', 512, 16 / 12, (ctx, S, r) => {
  ctx.fillStyle = '#b8b1a4';
  ctx.fillRect(0, 0, S, S);
  const rows = 6, cols = 2, ch = S / rows, cw = S / cols, m = 5;
  for (let row = 0; row < rows; row++) {
    const off = row % 2 ? cw / 2 : 0;
    for (let col = -1; col <= cols; col++) {
      const x = col * cw + off, y = row * ch;
      const l = 34 + r() * 10, h = 8 + r() * 8;
      ctx.fillStyle = `hsl(${h},48%,${l}%)`;
      ctx.fillRect(x + m, y + m, cw - m * 2, ch - m * 2);
      ctx.fillStyle = `rgba(0,0,0,${r() * .12})`;
      for (let k = 0; k < 18; k++) ctx.fillRect(x + m + r() * (cw - m * 2), y + m + r() * (ch - m * 2), 2, 2);
    }
  }
});

const metal = () => canvasTexture('metal', 256, 1, (ctx, S, r) => {
  ctx.fillStyle = '#b4b8bc';
  ctx.fillRect(0, 0, S, S);
  for (let x = 0; x < S; x++) {
    const band = Math.sin((x / S) * 6.28 * 6);
    ctx.fillStyle = band > 0 ? `rgba(255,255,255,${band * .22})` : `rgba(40,44,48,${-band * .18})`;
    ctx.fillRect(x, 0, 1, S);
  }
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(${r() > .5 ? 255 : 30},${r() > .5 ? 255 : 30},${r() > .5 ? 255 : 30},${r() * .08})`;
    ctx.fillRect(r() * S, r() * S, 1 + r() * 2, 1);
  }
});

const rope = () => canvasTexture('rope', 128, .25, (ctx, S, r) => {
  ctx.fillStyle = '#b9995f';
  ctx.fillRect(0, 0, S, S);
  ctx.save();
  ctx.translate(S / 2, S / 2);
  ctx.rotate(-.9);
  for (let i = -S; i < S; i += 16) {
    ctx.fillStyle = 'rgba(70,48,22,.38)';
    ctx.fillRect(i, -S, 6, S * 2);
    ctx.fillStyle = 'rgba(255,235,190,.22)';
    ctx.fillRect(i + 8, -S, 3, S * 2);
  }
  ctx.restore();
  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = `rgba(60,40,15,${r() * .2})`;
    ctx.fillRect(r() * S, r() * S, 1, 1 + r() * 2);
  }
});

/* ---------- ground textures ---------- */

const grass = () => canvasTexture('grass', 256, 4, (ctx, S, r) => {
  ctx.fillStyle = '#6b8f4e';
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 6000; i++) {
    ctx.fillStyle = `hsl(${86 + r() * 26},${30 + r() * 16}%,${26 + r() * 20}%)`;
    ctx.fillRect(r() * S, r() * S, 1 + r() * 1.5, 1 + r() * 3);
  }
});

const mulch = () => canvasTexture('mulch', 256, 2, (ctx, S, r) => {
  ctx.fillStyle = '#684734';
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 1800; i++) {
    ctx.fillStyle = `hsl(${18 + r() * 14},${34 + r() * 18}%,${18 + r() * 22}%)`;
    ctx.save();
    ctx.translate(r() * S, r() * S);
    ctx.rotate(r() * 3.14);
    ctx.fillRect(-3 - r() * 4, -1, 6 + r() * 8, 2 + r() * 2);
    ctx.restore();
  }
});

const patio = () => canvasTexture('patio', 256, 2, (ctx, S, r) => {
  ctx.fillStyle = '#bab8b1';
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 2500; i++) {
    ctx.fillStyle = `rgba(${r() > .5 ? 255 : 40},${r() > .5 ? 255 : 40},${r() > .5 ? 255 : 40},${r() * .09})`;
    ctx.fillRect(r() * S, r() * S, 1 + r() * 2, 1 + r() * 2);
  }
  ctx.fillStyle = 'rgba(60,60,58,.5)';
  ctx.fillRect(0, 0, S, 3);
  ctx.fillRect(0, 0, 3, S);
});

const GROUND = { Grass: grass, Mulch: mulch, Patio: patio };

const MAT_TEX = { wood, brick, metal, rope };
const MAT_PROPS = {
  wood: { roughness: .78, metalness: 0 },
  brick: { roughness: .92, metalness: 0 },
  metal: { roughness: .42, metalness: .55 },
  rope: { roughness: .95, metalness: 0 },
  holds: { roughness: .55, metalness: 0, color: '#2c455d' },
};

export const HOLD_COLORS = ['#d9503c', '#3b7fd6', '#e6b73a', '#3ea86c', '#8b53d6', '#f08a3c'];

export function holdColor(i) {
  return HOLD_COLORS[i % HOLD_COLORS.length];
}

// A textured PBR material whose pattern is scaled to the box's real-world size
export function realMaterial(mat, w, h, d, opts = {}) {
  const props = { ...MAT_PROPS[mat], ...opts };
  const factory = MAT_TEX[mat];
  if (!factory || opts.color) return new THREE.MeshStandardMaterial(props);
  const base = factory();
  const tile = base.userData.tileFt;
  const t = base.clone();
  const span = Math.max(w, d), thin = Math.min(w, d);
  if (h < thin) {
    t.repeat.set(span / tile, thin / tile);
  } else if (h > span * 1.5) {
    t.center.set(.5, .5);
    t.rotation = Math.PI / 2;
    t.repeat.set(h / tile, span / tile);
  } else {
    t.repeat.set(span / tile, h / tile);
  }
  t.needsUpdate = true;
  return new THREE.MeshStandardMaterial({ map: t, ...props });
}

export function groundMaterial(type, w, d) {
  const base = (GROUND[type] || grass)();
  const t = base.clone();
  t.repeat.set(w / base.userData.tileFt, d / base.userData.tileFt);
  t.needsUpdate = true;
  return new THREE.MeshStandardMaterial({ map: t, roughness: .96, metalness: 0 });
}

// Single masonry pieces are too small for the brick tile; use flat tones per stock
export const MASONRY_COLORS = { brick: '#9a4b3b', block: '#a4a29b', paver: '#aaa59c' };
