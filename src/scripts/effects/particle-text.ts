import { isTouchDevice, prefersReducedMotion } from '../state';

/* ── Types ── */
interface Particle {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

/* ── State ── */
let initialized = false;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let animId: number | null = null;
let mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
let mouseLeaveHandler: (() => void) | null = null;
let touchHandler: ((e: TouchEvent) => void) | null = null;
let touchTimeout: number | null = null;
let mouseX = -9999;
let mouseY = -9999;
const REPULSION_RADIUS = 80;
const TOUCH_SCATTER_RADIUS = 100;
const GRID_SIZE = 80;

/* ── Spatial grid for performance ── */
function buildGrid(parts: Particle[], w: number, h: number) {
  const cols = Math.ceil(w / GRID_SIZE);
  const rows = Math.ceil(h / GRID_SIZE);
  const grid: Particle[][] = new Array(cols * rows);
  for (let i = 0; i < grid.length; i++) grid[i] = [];
  for (const p of parts) {
    const c = Math.min(Math.floor(p.x / GRID_SIZE), cols - 1);
    const r = Math.min(Math.floor(p.y / GRID_SIZE), rows - 1);
    if (c >= 0 && r >= 0) grid[r * cols + c].push(p);
  }
  return { grid, cols, rows };
}

function getNearbyParticles(
  mx: number,
  my: number,
  grid: Particle[][],
  cols: number,
  rows: number,
): Particle[] {
  const col = Math.floor(mx / GRID_SIZE);
  const row = Math.floor(my / GRID_SIZE);
  const result: Particle[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        const cell = grid[r * cols + c];
        for (const p of cell) result.push(p);
      }
    }
  }
  return result;
}

/* ── Sample text into particle positions ── */
function sampleText(text: string, w: number, h: number, color: string): Particle[] {
  const offscreen = document.createElement('canvas');
  offscreen.width = w;
  offscreen.height = h;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return [];

  const fontSize = Math.min(w / (text.length * 0.6), h * 0.4);
  offCtx.font = `bold ${fontSize}px sans-serif`;
  offCtx.fillStyle = '#ffffff';
  offCtx.textAlign = 'center';
  offCtx.textBaseline = 'middle';
  offCtx.fillText(text, w / 2, h / 2);

  const imageData = offCtx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const result: Particle[] = [];
  const step = Math.max(2, Math.floor(Math.sqrt((w * h) / 2000)));

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] > 128) {
        result.push({
          x: x + (Math.random() - 0.5) * w,
          y: y + (Math.random() - 0.5) * h,
          homeX: x,
          homeY: y,
          vx: 0,
          vy: 0,
          size: Math.random() * 1.5 + 0.5,
          color,
        });
      }
    }
  }
  return result;
}

/* ── Get accent color from CSS ── */
function getAccentColor(): string {
  const style = getComputedStyle(document.documentElement);
  return style.getPropertyValue('--accent').trim() || '#5bcdec';
}

/* ── Animation loop ── */
function animate(): void {
  if (!ctx || !canvas) return;
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  const { grid, cols, rows } = buildGrid(particles, w, h);
  const nearby = mouseX > -9000 ? getNearbyParticles(mouseX, mouseY, grid, cols, rows) : [];

  // Apply repulsion to nearby particles
  for (const p of nearby) {
    const dx = p.x - mouseX;
    const dy = p.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < REPULSION_RADIUS && dist > 0) {
      const force = (REPULSION_RADIUS - dist) / REPULSION_RADIUS;
      p.vx += (dx / dist) * force * 3;
      p.vy += (dy / dist) * force * 3;
    }
  }

  // Update and draw all particles
  for (const p of particles) {
    // Spring back to home position
    p.vx += (p.homeX - p.x) * 0.05;
    p.vy += (p.homeY - p.y) * 0.05;
    p.vx *= 0.95;
    p.vy *= 0.95;
    p.x += p.vx;
    p.y += p.vy;

    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }

  animId = requestAnimationFrame(animate);
}

/* ── Touch scatter ── */
function scatterFromTouch(tx: number, ty: number): void {
  for (const p of particles) {
    const dx = p.x - tx;
    const dy = p.y - ty;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < TOUCH_SCATTER_RADIUS && dist > 0) {
      const force = (TOUCH_SCATTER_RADIUS - dist) / TOUCH_SCATTER_RADIUS;
      p.vx += (dx / dist) * force * 8;
      p.vy += (dy / dist) * force * 8;
    }
  }
}

/* ── Static draw (reduced motion) ── */
function drawStatic(): void {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of particles) {
    p.x = p.homeX;
    p.y = p.homeY;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
}

/* ── Update color on theme change ── */
export function updateParticleTextColor(): void {
  if (!initialized || particles.length === 0) return;
  const color = getAccentColor();
  for (const p of particles) p.color = color;
  if (prefersReducedMotion) drawStatic();
}

/* ── Public API ── */
export function initParticleText(): void {
  if (initialized) return;

  const heroInner = document.getElementById('heroNameInner');
  if (!heroInner) return;

  const text = heroInner.textContent || '';
  if (!text.trim()) return;

  // Create or reuse canvas
  let el = document.getElementById('particleTextCanvas') as HTMLCanvasElement | null;
  if (!el) {
    el = document.createElement('canvas');
    el.id = 'particleTextCanvas';
    el.setAttribute('aria-hidden', 'true');
    el.style.position = 'absolute';
    el.style.top = '0';
    el.style.left = '0';
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '3';
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      heroSection.appendChild(el);
    } else {
      heroInner.parentElement?.appendChild(el);
    }
  }

  canvas = el;
  canvas.width = canvas.offsetWidth || 800;
  canvas.height = canvas.offsetHeight || 600;
  ctx = canvas.getContext('2d');
  if (!ctx) return;

  initialized = true;

  const color = getAccentColor();
  particles = sampleText(text, canvas.width, canvas.height, color);

  if (prefersReducedMotion) {
    drawStatic();
    return;
  }

  // Mouse interaction — use document-level listeners so canvas keeps pointer-events:none
  mouseMoveHandler = (e: MouseEvent) => {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    // Only track when mouse is over the canvas area
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      mouseX = (x - rect.left) * (canvas.width / rect.width);
      mouseY = (y - rect.top) * (canvas.height / rect.height);
    } else {
      mouseX = -9999;
      mouseY = -9999;
    }
  };

  mouseLeaveHandler = () => {
    mouseX = -9999;
    mouseY = -9999;
  };

  document.addEventListener('mousemove', mouseMoveHandler);
  document.addEventListener('mouseleave', mouseLeaveHandler);

  // Touch interaction
  if (isTouchDevice) {
    touchHandler = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const tx = (touch.clientX - rect.left) * (canvas.width / rect.width);
      const ty = (touch.clientY - rect.top) * (canvas.height / rect.height);
      scatterFromTouch(tx, ty);

      if (touchTimeout !== null) clearTimeout(touchTimeout);
      touchTimeout = window.setTimeout(() => {
        // Particles will spring back naturally via the animation loop
        touchTimeout = null;
      }, 2000);
    };
    canvas.addEventListener('touchstart', touchHandler, { passive: true });
  }

  animate();
}

export function destroyParticleText(): void {
  if (animId !== null) {
    cancelAnimationFrame(animId);
    animId = null;
  }
  if (touchTimeout !== null) {
    clearTimeout(touchTimeout);
    touchTimeout = null;
  }
  if (mouseMoveHandler) {
    document.removeEventListener('mousemove', mouseMoveHandler);
  }
  if (mouseLeaveHandler) {
    document.removeEventListener('mouseleave', mouseLeaveHandler);
  }
  if (canvas && touchHandler) {
    canvas.removeEventListener('touchstart', touchHandler);
  }
  if (canvas?.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }
  canvas = null;
  ctx = null;
  particles = [];
  mouseMoveHandler = null;
  mouseLeaveHandler = null;
  touchHandler = null;
  mouseX = -9999;
  mouseY = -9999;
  initialized = false;
}
