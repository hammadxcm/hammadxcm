import { isPageVisible } from '../state';
import { getCurrentTheme, getThemeConfig } from '../theme-config';
import type { ThemeName } from '../types';

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let w = 0;
let h = 0;
const mouse = { x: null as number | null, y: null as number | null, radius: 150 };

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
  drift?: number;
  flicker?: number;
  twinkle?: number;
  speed?: number;
  baseOpacity?: number;
  glow?: number;
  glowSpeed?: number;
}

interface MoteEffectConfig {
  count: (w: number, h: number) => number;
  spawn: (w: number, h: number) => Mote;
  update: (m: Mote, w: number, h: number) => void;
  draw: (ctx: CanvasRenderingContext2D, m: Mote, color: string) => void;
}

let motes: Mote[] = [];

function initMotes(config: MoteEffectConfig): void {
  const count = config.count(w, h);
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
  }),
  update: (m, w, h) => {
    m.y += m.vy;
    m.x += m.vx + Math.sin(m.flicker!) * 0.2;
    m.flicker! += 0.02;
    if (m.y < -10) {
      m.y = h + 10;
      m.x = Math.random() * w;
    }
  },
  draw: (ctx, m, color) => {
    const osc = Math.sin(m.flicker!) * 0.15 + 0.85;
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
  }),
  update: (m) => {
    m.twinkle! += m.speed;
  },
  draw: (ctx, m, color) => {
    const opacity = m.baseOpacity! + Math.sin(m.twinkle!) * 0.2;
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
  }),
  update: (m, w, h) => {
    m.x += m.vx;
    m.y += m.vy + Math.sin(m.drift!) * 0.1;
    m.drift! += 0.01;
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
  }),
  update: (m, w, h) => {
    m.x += m.vx;
    m.y += m.vy;
    m.glow! += m.glowSpeed;
    if (m.x < 0 || m.x > w) m.vx *= -1;
    if (m.y < 0 || m.y > h) m.vy *= -1;
  },
  draw: (ctx, m, color) => {
    const intensity = (Math.sin(m.glow!) + 1) / 2;
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
    };
  },
  update: (m, w, h) => {
    m.y += m.vy;
    m.x += m.vx + Math.sin(m.drift!) * 0.15;
    m.drift! += 0.01;
    if (m.y > h + m.speed!) {
      m.y = -(m.speed! + Math.random() * 40);
      m.x = Math.random() * w;
    }
    if (m.x > w) m.x = 0;
    if (m.x < 0) m.x = w;
  },
  draw: (ctx, m, color) => {
    const trailLen = m.speed!;
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
  }),
  update: (m, w, h) => {
    m.x += m.vx + Math.sin(m.drift!) * 0.1;
    m.y += m.vy + Math.cos(m.drift!) * 0.1;
    m.drift! += 0.005;
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

const moteEffects: Record<string, MoteEffectConfig> = {
  snowfall,
  bubbles,
  embers,
  starfield,
  lightDust,
  fireflies,
  purpleParticles,
  bloodRain,
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
  const count = Math.min(80, Math.floor((w * h) / 12000));
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

    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const ddx = p.x - p2.x;
      const ddy = p.y - p2.y;
      const d = Math.sqrt(ddx * ddx + ddy * ddy);
      if (d < 160) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `${color}${0.15 * (1 - d / 160)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
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

export function switchCanvasEffect(theme: ThemeName): void {
  const tc = getThemeConfig(theme);
  currentEffect = tc.canvasEffect;
  if (!inited[currentEffect]) initEffect(currentEffect);
}

export function initCanvas(): void {
  canvas = document.getElementById('particle-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', () => {
    resize();
    inited = {};
    if (currentEffect) initEffect(currentEffect);
  });

  canvas.addEventListener('mousemove', (e: MouseEvent) => {
    const rect = canvas!.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  switchCanvasEffect(getCurrentTheme());

  let heroVisible = true;
  const heroSection = document.getElementById('hero');
  if (heroSection && window.IntersectionObserver) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        heroVisible = entries[0].isIntersecting;
      },
      { threshold: 0 },
    );
    heroObserver.observe(heroSection);
  }

  function draw(): void {
    if (!isPageVisible() || !heroVisible) {
      requestAnimationFrame(draw);
      return;
    }
    const theme = getCurrentTheme();
    const tc = getThemeConfig(theme);
    if (tc.canvasEffect !== currentEffect) switchCanvasEffect(theme);
    if (currentEffect) drawEffect(currentEffect, tc.particleColor);
    requestAnimationFrame(draw);
  }
  draw();
}
