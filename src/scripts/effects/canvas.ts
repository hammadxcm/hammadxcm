import { isHeroVisible, isPageVisible, isTouchDevice } from '../state';
import { getCurrentTheme, getThemeConfig } from '../theme-config';
import type { ThemeName } from '../types';

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let w = 0;
let h = 0;
let frameId: number | null = null;
let initialized = false;
const MOUSE_RADIUS = 150;
const PARTICLE_CONNECT_DIST = 160;
const CELL_SIZE = PARTICLE_CONNECT_DIST;
const mouse = { x: null as number | null, y: null as number | null, radius: MOUSE_RADIUS };

function resize(): void {
  if (!canvas) return;
  w = canvas.width = canvas.offsetWidth;
  h = canvas.height = canvas.offsetHeight;
}

/* ── Unified Mote System ── */
interface Mote {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  opacity: number;
  drift: number;
  flicker: number;
  twinkle: number;
  speed: number;
  baseOpacity: number;
  glow: number;
  glowSpeed: number;
}

interface MoteEffectConfig {
  count: (w: number, h: number) => number;
  spawn: (w: number, h: number) => Mote;
  update: (m: Mote, w: number, h: number) => void;
  draw: (ctx: CanvasRenderingContext2D, m: Mote, color: string) => void;
}

let motes: Mote[] = [];

function initMotes(config: MoteEffectConfig): void {
  const baseCount = config.count(w, h);
  const count = isTouchDevice ? Math.floor(baseCount * 0.4) : baseCount;
  motes = [];
  for (let i = 0; i < count; i++) motes.push(config.spawn(w, h));
}

function drawMotes(config: MoteEffectConfig, color: string): void {
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);
  for (const m of motes) {
    config.update(m, w, h);
    config.draw(ctx, m, color);
  }
}

/* ── Mote Effect Configs ── */
const snowfall: MoteEffectConfig = {
  count: (w, h) => Math.min(120, Math.floor((w * h) / 8000)),
  spawn: (w, h) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 3 + 1,
    vy: Math.random() * 1 + 0.3,
    vx: (Math.random() - 0.5) * 0.5,
    opacity: Math.random() * 0.6 + 0.2,
    drift: 0,
    flicker: 0,
    twinkle: 0,
    speed: 0,
    baseOpacity: 0,
    glow: 0,
    glowSpeed: 0,
  }),
  update: (m, w, h) => {
    m.y += m.vy;
    m.x += m.vx + Math.sin(m.y * 0.01) * 0.3;
    if (m.y > h) {
      m.y = -5;
      m.x = Math.random() * w;
    }
    if (m.x > w) m.x = 0;
    if (m.x < 0) m.x = w;
  },
  draw: (ctx, m, color) => {
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fillStyle = `${color}${m.opacity})`;
    ctx.fill();
  },
};

const bubbles: MoteEffectConfig = {
  count: (w, h) => Math.min(50, Math.floor((w * h) / 20000)),
  spawn: (w, h) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 20 + 5,
    vy: -(Math.random() * 0.5 + 0.1),
    vx: (Math.random() - 0.5) * 0.3,
    opacity: Math.random() * 0.15 + 0.05,
    drift: 0,
    flicker: 0,
    twinkle: 0,
    speed: 0,
    baseOpacity: 0,
    glow: 0,
    glowSpeed: 0,
  }),
  update: (m, w, h) => {
    m.y += m.vy;
    m.x += m.vx;
    if (m.y < -m.r * 2) {
      m.y = h + m.r;
      m.x = Math.random() * w;
    }
  },
  draw: (ctx, m, color) => {
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.strokeStyle = `${color}${m.opacity})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  },
};

const embers: MoteEffectConfig = {
  count: (w, h) => Math.min(80, Math.floor((w * h) / 12000)),
  spawn: (w, h) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 3 + 1,
    vy: -(Math.random() * 0.8 + 0.2),
    vx: (Math.random() - 0.5) * 0.5,
    opacity: Math.random() * 0.5 + 0.2,
    flicker: Math.random() * Math.PI * 2,
    drift: 0,
    twinkle: 0,
    speed: 0,
    baseOpacity: 0,
    glow: 0,
    glowSpeed: 0,
  }),
  update: (m, w, h) => {
    m.y += m.vy;
    m.x += m.vx + Math.sin(m.flicker) * 0.2;
    m.flicker += 0.02;
    if (m.y < -10) {
      m.y = h + 10;
      m.x = Math.random() * w;
    }
  },
  draw: (ctx, m, color) => {
    const osc = Math.sin(m.flicker) * 0.15 + 0.85;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fillStyle = `${color}${m.opacity * osc})`;
    ctx.fill();
  },
};

const starfield: MoteEffectConfig = {
  count: (w, h) => Math.min(150, Math.floor((w * h) / 6000)),
  spawn: (w, _h) => ({
    x: Math.random() * w,
    y: Math.random() * _h,
    r: Math.random() * 1.5 + 0.5,
    vx: 0,
    vy: 0,
    opacity: 0,
    twinkle: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.02 + 0.005,
    baseOpacity: Math.random() * 0.5 + 0.3,
    drift: 0,
    flicker: 0,
    glow: 0,
    glowSpeed: 0,
  }),
  update: (m) => {
    m.twinkle += m.speed;
  },
  draw: (ctx, m, color) => {
    const opacity = m.baseOpacity + Math.sin(m.twinkle) * 0.2;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fillStyle = `${color}${Math.max(0.1, opacity)})`;
    ctx.fill();
  },
};

const lightDust: MoteEffectConfig = {
  count: (w, h) => Math.min(60, Math.floor((w * h) / 15000)),
  spawn: (w, h) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 2 + 1,
    vy: (Math.random() - 0.5) * 0.3,
    vx: Math.random() * 0.3 + 0.1,
    opacity: Math.random() * 0.3 + 0.1,
    drift: Math.random() * Math.PI * 2,
    flicker: 0,
    twinkle: 0,
    speed: 0,
    baseOpacity: 0,
    glow: 0,
    glowSpeed: 0,
  }),
  update: (m, w, h) => {
    m.x += m.vx;
    m.y += m.vy + Math.sin(m.drift) * 0.1;
    m.drift += 0.01;
    if (m.x > w + 10) {
      m.x = -10;
      m.y = Math.random() * h;
    }
  },
  draw: (ctx, m, color) => {
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fillStyle = `${color}${m.opacity})`;
    ctx.fill();
  },
};

const fireflies: MoteEffectConfig = {
  count: (w, h) => Math.min(40, Math.floor((w * h) / 25000)),
  spawn: (w, h) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 3 + 2,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    opacity: 0,
    glow: Math.random() * Math.PI * 2,
    glowSpeed: Math.random() * 0.03 + 0.01,
    drift: 0,
    flicker: 0,
    twinkle: 0,
    speed: 0,
    baseOpacity: 0,
  }),
  update: (m, w, h) => {
    m.x += m.vx;
    m.y += m.vy;
    m.glow += m.glowSpeed;
    if (m.x < 0 || m.x > w) m.vx *= -1;
    if (m.y < 0 || m.y > h) m.vy *= -1;
  },
  draw: (ctx, m, color) => {
    const intensity = (Math.sin(m.glow) + 1) / 2;
    const opacity = intensity * 0.6 + 0.1;
    const radius = m.r * (0.8 + intensity * 0.4);
    ctx.beginPath();
    ctx.arc(m.x, m.y, radius * 3, 0, Math.PI * 2);
    ctx.fillStyle = `${color}${opacity * 0.15})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(m.x, m.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `${color}${opacity})`;
    ctx.fill();
  },
};

const bloodRain: MoteEffectConfig = {
  count: (w, h) => Math.min(120, Math.floor((w * h) / 8000)),
  spawn: (w, h) => {
    const depth = Math.random();
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.5 + depth * 2,
      vx: (Math.random() - 0.5) * 0.3,
      vy: 2 + depth * 4,
      opacity: 0.15 + depth * 0.45,
      speed: 8 + depth * 25,
      drift: Math.random() * Math.PI * 2,
      flicker: 0,
      twinkle: 0,
      baseOpacity: 0,
      glow: 0,
      glowSpeed: 0,
    };
  },
  update: (m, w, h) => {
    m.y += m.vy;
    m.x += m.vx + Math.sin(m.drift) * 0.15;
    m.drift += 0.01;
    if (m.y > h + m.speed) {
      m.y = -(m.speed + Math.random() * 40);
      m.x = Math.random() * w;
    }
    if (m.x > w) m.x = 0;
    if (m.x < 0) m.x = w;
  },
  draw: (ctx, m, color) => {
    const trailLen = m.speed;
    const grad = ctx.createLinearGradient(m.x, m.y - trailLen, m.x, m.y);
    grad.addColorStop(0, `${color}0)`);
    grad.addColorStop(0.6, `${color}${m.opacity * 0.5})`);
    grad.addColorStop(1, `${color}${m.opacity})`);

    ctx.beginPath();
    ctx.moveTo(m.x, m.y - trailLen);
    ctx.lineTo(m.x, m.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = m.r;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = `${color}${m.opacity * 0.8})`;
    ctx.fill();
  },
};

const purpleParticles: MoteEffectConfig = {
  count: (w, h) => Math.min(60, Math.floor((w * h) / 15000)),
  spawn: (w, h) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 3 + 1,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    opacity: Math.random() * 0.3 + 0.1,
    drift: Math.random() * Math.PI * 2,
    flicker: 0,
    twinkle: 0,
    speed: 0,
    baseOpacity: 0,
    glow: 0,
    glowSpeed: 0,
  }),
  update: (m, w, h) => {
    m.x += m.vx + Math.sin(m.drift) * 0.1;
    m.y += m.vy + Math.cos(m.drift) * 0.1;
    m.drift += 0.005;
    if (m.x < 0 || m.x > w) m.vx *= -1;
    if (m.y < 0 || m.y > h) m.vy *= -1;
  },
  draw: (ctx, m, color) => {
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fillStyle = `${color}${m.opacity})`;
    ctx.fill();
  },
};

const neonSparks: MoteEffectConfig = {
  count: (w, h) => Math.min(70, Math.floor((w * h) / 14000)),
  spawn: (w, h) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 3;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.5,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      opacity: Math.random() * 0.5 + 0.5,
      drift: 0,
      flicker: 0,
      twinkle: 0,
      speed: 0,
      baseOpacity: 0,
      glow: 0,
      glowSpeed: 0,
    };
  },
  update: (m, w, h) => {
    m.x += m.vx;
    m.y += m.vy;
    m.vx *= 0.96;
    m.vy *= 0.96;
    m.opacity -= 0.015;
    if (m.opacity <= 0) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 3;
      m.x = Math.random() * w;
      m.y = Math.random() * h;
      m.vx = Math.cos(angle) * speed;
      m.vy = Math.sin(angle) * speed;
      m.opacity = Math.random() * 0.5 + 0.5;
    }
  },
  draw: (ctx, m, color) => {
    const tailX = m.x - m.vx * 4;
    const tailY = m.y - m.vy * 4;
    const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
    grad.addColorStop(0, `${color}0)`);
    grad.addColorStop(1, `${color}${m.opacity})`);
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(m.x, m.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = m.r;
    ctx.lineCap = 'round';
    ctx.stroke();
  },
};

const cosmicDust: MoteEffectConfig = {
  count: (w, h) => Math.min(60, Math.floor((w * h) / 16000)),
  spawn: (w, h) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 3 + 1,
    vx: 0,
    vy: 0,
    opacity: 0,
    drift: Math.random() * Math.PI * 2,
    flicker: 0,
    twinkle: 0,
    speed: Math.random() * 0.003 + 0.001,
    baseOpacity: Math.random() * 0.3 + 0.2,
    glow: Math.random() * Math.PI * 2,
    glowSpeed: Math.random() * 0.02 + 0.01,
  }),
  update: (m, w, h) => {
    m.x += Math.cos(m.drift) * 0.3;
    m.y += Math.sin(m.drift) * 0.25;
    m.drift += m.speed;
    m.glow += m.glowSpeed;
    // Gentle random perturbation
    m.x += (Math.random() - 0.5) * 0.1;
    m.y += (Math.random() - 0.5) * 0.1;
    // Wrap around
    if (m.x < -10) m.x = w + 10;
    if (m.x > w + 10) m.x = -10;
    if (m.y < -10) m.y = h + 10;
    if (m.y > h + 10) m.y = -10;
  },
  draw: (ctx, m, color) => {
    const pulse = Math.sin(m.glow) * 0.2;
    const opacity = m.baseOpacity + pulse;
    // Outer glow
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r * 3, 0, Math.PI * 2);
    ctx.fillStyle = `${color}${Math.max(0.02, opacity * 0.12)})`;
    ctx.fill();
    // Inner core
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fillStyle = `${color}${Math.max(0.1, opacity * 0.5)})`;
    ctx.fill();
  },
};

const moteEffects: Record<string, MoteEffectConfig> = {
  snowfall,
  bubbles,
  embers,
  starfield,
  lightDust,
  fireflies,
  purpleParticles,
  bloodRain,
  neonSparks,
  cosmicDust,
};

/* ── Particles (hacker, matrix) — custom: mouse interaction + connection lines ── */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

let particles: Particle[] = [];
function initParticles(): void {
  const baseCount = Math.min(80, Math.floor((w * h) / 12000));
  const count = isTouchDevice ? Math.floor(baseCount * 0.4) : baseCount;
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    });
  }
}

function drawParticles(color: string): void {
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);

  // Build spatial hash grid for O(n) neighbor lookups instead of O(n²)
  const cols = Math.ceil(w / CELL_SIZE) || 1;
  const rows = Math.ceil(h / CELL_SIZE) || 1;
  const grid: number[][] = new Array(cols * rows);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (mouse.x !== null && mouse.y !== null) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        p.x += (dx / dist) * force * 2;
        p.y += (dy / dist) * force * 2;
      }
    }
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `${color}${p.opacity})`;
    ctx.fill();

    // Insert into spatial grid
    const cx = Math.min(Math.floor(p.x / CELL_SIZE), cols - 1);
    const cy = Math.min(Math.floor(p.y / CELL_SIZE), rows - 1);
    const cellIdx = cy * cols + cx;
    if (!grid[cellIdx]) grid[cellIdx] = [];
    grid[cellIdx].push(i);
  }

  // Draw connections using spatial grid — only check neighboring cells
  const connected = new Set<string>();
  ctx.lineWidth = 0.5;
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const cx = Math.min(Math.floor(p.x / CELL_SIZE), cols - 1);
    const cy = Math.min(Math.floor(p.y / CELL_SIZE), rows - 1);

    for (let ny = Math.max(0, cy - 1); ny <= Math.min(rows - 1, cy + 1); ny++) {
      for (let nx = Math.max(0, cx - 1); nx <= Math.min(cols - 1, cx + 1); nx++) {
        const cell = grid[ny * cols + nx];
        if (!cell) continue;
        for (const j of cell) {
          if (j <= i) continue;
          const key = i < j ? `${i}:${j}` : `${j}:${i}`;
          if (connected.has(key)) continue;
          const p2 = particles[j];
          const ddx = p.x - p2.x;
          const ddy = p.y - p2.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < PARTICLE_CONNECT_DIST) {
            connected.add(key);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${color}${0.15 * (1 - d / PARTICLE_CONNECT_DIST)})`;
            ctx.stroke();
          }
        }
      }
    }
  }
}

/* ── Retro Grid (synthwave) — custom: non-particle rendering ── */
let gridOffset = 0;
function drawRetroGrid(color: string): void {
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);
  const horizon = h * 0.45;
  const gridLines = 20;
  const gridCols = 30;
  gridOffset = (gridOffset + 0.5) % (h / gridLines);

  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
  skyGrad.addColorStop(0, 'rgba(26, 16, 40, 0)');
  skyGrad.addColorStop(1, 'rgba(255, 46, 151, 0.05)');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, horizon);

  ctx.lineWidth = 1;
  for (let i = 0; i <= gridLines; i++) {
    const y = horizon + (i + gridOffset / (h / gridLines)) * ((h - horizon) / gridLines);
    const alpha = (i / gridLines) * 0.3;
    ctx.strokeStyle = `${color}${alpha})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const centerX = w / 2;
  for (let j = -gridCols / 2; j <= gridCols / 2; j++) {
    const spread = j / (gridCols / 2);
    ctx.strokeStyle = `${color}0.15)`;
    ctx.beginPath();
    ctx.moveTo(centerX + spread * w * 0.8, h);
    ctx.lineTo(centerX + spread * 20, horizon);
    ctx.stroke();
  }

  const sunGrad = ctx.createRadialGradient(centerX, horizon - 30, 10, centerX, horizon - 30, 80);
  sunGrad.addColorStop(0, 'rgba(249, 200, 14, 0.3)');
  sunGrad.addColorStop(0.5, 'rgba(255, 46, 151, 0.15)');
  sunGrad.addColorStop(1, 'rgba(255, 46, 151, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(centerX, horizon - 30, 80, 0, Math.PI * 2);
  ctx.fill();
}

/* ── Effect Map & Loop ── */
const effectMap: Record<string, { init: () => void; draw: (color: string) => void }> = {
  particles: { init: initParticles, draw: drawParticles },
  retroGrid: { init: () => {}, draw: drawRetroGrid },
};

// Register all mote-based effects
for (const [name, config] of Object.entries(moteEffects)) {
  effectMap[name] = {
    init: () => initMotes(config),
    draw: (color: string) => drawMotes(config, color),
  };
}

let currentEffect: string | null = null;
let inited: Record<string, boolean> = {};

function initEffect(effect: string): void {
  if (effectMap[effect]) {
    effectMap[effect].init();
    inited[effect] = true;
  }
}

function drawEffect(effect: string, color: string): void {
  if (effectMap[effect]) effectMap[effect].draw(color);
}

let mouseListenersAttached = false;

function onMouseMove(e: MouseEvent): void {
  const rect = canvas?.getBoundingClientRect();
  if (!rect) return;
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
}

function onMouseLeave(): void {
  mouse.x = null;
  mouse.y = null;
}

function updateMouseListeners(effect: string): void {
  const needsMouse = effect === 'particles';
  if (needsMouse && !mouseListenersAttached) {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    mouseListenersAttached = true;
  } else if (!needsMouse && mouseListenersAttached) {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseleave', onMouseLeave);
    mouse.x = null;
    mouse.y = null;
    mouseListenersAttached = false;
  }
}

export function switchCanvasEffect(theme: ThemeName): void {
  const tc = getThemeConfig(theme);
  const newEffect = tc.canvasEffect;
  // Always re-init when effect changes — mote effects share the motes[] array,
  // so skipping init would reuse stale motes from the previous effect.
  if (newEffect !== currentEffect) {
    currentEffect = newEffect;
    initEffect(currentEffect);
  }
  updateMouseListeners(currentEffect);
}

function onResize(): void {
  resize();
  inited = {};
  if (currentEffect) initEffect(currentEffect);
}

function startLoop(): void {
  if (frameId !== null) return;
  function draw(): void {
    if (!isPageVisible() || !isHeroVisible()) {
      // Pause RAF when not visible — restart via visibilitychange
      frameId = null;
      return;
    }
    const theme = getCurrentTheme();
    const tc = getThemeConfig(theme);
    if (tc.canvasEffect !== currentEffect) switchCanvasEffect(theme);
    if (currentEffect) drawEffect(currentEffect, tc.particleColor);
    frameId = requestAnimationFrame(draw);
  }
  frameId = requestAnimationFrame(draw);
}

function onVisibilityChange(): void {
  if (document.hidden) {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  } else {
    startLoop();
  }
}

export function destroyCanvas(): void {
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
  window.removeEventListener('resize', onResize);
  document.removeEventListener('visibilitychange', onVisibilityChange);
  if (mouseListenersAttached) {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseleave', onMouseLeave);
    mouseListenersAttached = false;
  }
  initialized = false;
}

export function initCanvas(): void {
  if (initialized) return;
  initialized = true;

  canvas = document.getElementById('particle-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibilityChange);

  switchCanvasEffect(getCurrentTheme());
  startLoop();
}
