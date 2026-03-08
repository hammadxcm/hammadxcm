import { isPageVisible, onVisibilityChange, prefersReducedMotion } from '../state';
import { getThemeConfig } from '../theme-config';

let initialized = false;
let blinkInterval: number | null = null;
let removeVisibilityListener: (() => void) | null = null;
let canvas: HTMLCanvasElement | null = null;
let linkEl: HTMLLinkElement | null = null;

function getAccentColor(): string {
  return (
    getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#5bcdec'
  );
}

function drawFavicon(showCursor: boolean): void {
  if (!canvas || !linkEl) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const accent = getAccentColor();

  ctx.clearRect(0, 0, 32, 32);
  ctx.fillStyle = accent;
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('>', 10, 16);

  if (showCursor) {
    ctx.fillStyle = accent;
    ctx.fillRect(22, 6, 3, 20);
  }

  linkEl.href = canvas.toDataURL('image/png');
}

function startBlink(): void {
  if (blinkInterval !== null) return;
  let visible = true;
  blinkInterval = window.setInterval(() => {
    visible = !visible;
    drawFavicon(visible);
  }, 500);
}

function stopBlink(): void {
  if (blinkInterval !== null) {
    clearInterval(blinkInterval);
    blinkInterval = null;
  }
}

function onVisibility(visible: boolean): void {
  if (visible) {
    const tc = getThemeConfig();
    if (tc.hasCRT && !prefersReducedMotion) {
      startBlink();
    }
  } else {
    stopBlink();
  }
}

export function initFavicon(): void {
  if (initialized) return;
  initialized = true;

  canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;

  linkEl = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!linkEl) {
    linkEl = document.createElement('link');
    linkEl.rel = 'icon';
    linkEl.type = 'image/png';
    document.head.appendChild(linkEl);
  }

  const tc = getThemeConfig();
  const shouldBlink = tc.hasCRT && !prefersReducedMotion;

  // Draw initial static favicon
  drawFavicon(true);

  if (shouldBlink && isPageVisible()) {
    startBlink();
  }

  removeVisibilityListener = onVisibilityChange(onVisibility);
}

export function destroyFavicon(): void {
  stopBlink();
  if (removeVisibilityListener) {
    removeVisibilityListener();
    removeVisibilityListener = null;
  }
  canvas = null;
  linkEl = null;
  initialized = false;
}
