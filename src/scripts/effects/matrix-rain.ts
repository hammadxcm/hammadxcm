import { isHeroVisible, isPageVisible, isTouchDevice, prefersReducedMotion } from '../state';
import { getCurrentTheme, getThemeConfig } from '../theme-config';

let initialized = false;
let frameId: number | null = null;
let resizeHandler: (() => void) | null = null;
let visibilityHandler: (() => void) | null = null;

export function destroyMatrixRain(): void {
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler);
    visibilityHandler = null;
  }
  initialized = false;
}

export function initMatrixRain(): void {
  if (initialized) return;
  if (prefersReducedMotion || isTouchDevice) return;

  const canvasEl = document.getElementById('matrix-canvas') as HTMLCanvasElement | null;
  if (!canvasEl) return;
  const ctxEl = canvasEl.getContext('2d');
  if (!ctxEl) return;

  // Local constants for closure safety (biome noNonNullAssertion)
  const canvas = canvasEl;
  const ctx = ctxEl;

  initialized = true;

  let w: number, h: number, columns: number, drops: number[];
  const chars =
    'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
  const fontSize = 14;
  let frameCount = 0;

  function resize(): void {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    columns = Math.floor(w / fontSize);
    drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }
  }
  resize();
  resizeHandler = resize;
  window.addEventListener('resize', resizeHandler);

  function startLoop(): void {
    if (frameId !== null) return;
    function draw(): void {
      if (!isPageVisible() || !isHeroVisible()) {
        frameId = null;
        return;
      }
      const theme = getCurrentTheme();
      const tc = getThemeConfig(theme);

      if (!tc.hasMatrixRain) {
        ctx.clearRect(0, 0, w, h);
        frameId = null;
        return;
      }

      frameCount++;
      const speed = theme === 'matrix' ? 2 : 3;
      if (frameCount % speed !== 0) {
        frameId = requestAnimationFrame(draw);
        return;
      }

      ctx.fillStyle = tc.matrixBg || 'rgba(10, 14, 20, 0.06)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = tc.matrixColor || 'rgba(0, 191, 191, 0.6)';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        if (Math.random() > 0.3) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillText(char, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > h && Math.random() > 0.98) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      }
      frameId = requestAnimationFrame(draw);
    }
    frameId = requestAnimationFrame(draw);
  }

  visibilityHandler = () => {
    if (document.hidden) {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    } else {
      startLoop();
    }
  };
  document.addEventListener('visibilitychange', visibilityHandler);

  startLoop();
}
