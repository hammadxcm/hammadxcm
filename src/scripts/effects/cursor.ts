import { isTouchDevice, prefersReducedMotion } from '../state';
import { getThemeConfig } from '../theme-config';

let initialized = false;
let frameId: number | null = null;

export function updateCursorVisibility(): void {
  const cursor = document.getElementById('crosshairCursor');
  const trailContainer = document.getElementById('cursorTrail');
  if (!cursor) return;

  const tc = getThemeConfig();
  if (!tc.hasCursor) {
    document.body.classList.remove('has-custom-cursor');
    cursor.classList.remove('visible');
    cursor.style.display = 'none';
    if (trailContainer) trailContainer.style.display = 'none';
  } else {
    cursor.style.display = '';
    if (trailContainer) trailContainer.style.display = '';
    document.body.classList.add('has-custom-cursor');
    cursor.className =
      tc.hasCursor === 'crosshair' ? 'crosshair-cursor' : 'crosshair-cursor cursor-dot';
  }
}

let mx = 0;
let my = 0;
let cursorEl: HTMLElement | null = null;

const interactiveEls =
  'a, button, [data-tilt], .social-btn, .project-link, .cert-card, .skyline-card, input, textarea, select';

function onMouseMove(e: MouseEvent): void {
  mx = e.clientX;
  my = e.clientY;
  if (!cursorEl) return;
  const tc = getThemeConfig();
  if (tc.hasCursor && !cursorEl.classList.contains('visible')) cursorEl.classList.add('visible');
}

function onMouseLeave(): void {
  if (cursorEl) cursorEl.classList.remove('visible');
}

function onMouseOver(e: MouseEvent): void {
  if ((e.target as Element).closest(interactiveEls) && cursorEl) cursorEl.classList.add('hover');
}

function onMouseOut(e: MouseEvent): void {
  if ((e.target as Element).closest(interactiveEls) && cursorEl) cursorEl.classList.remove('hover');
}

export function destroyCursor(): void {
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseleave', onMouseLeave);
  document.removeEventListener('mouseover', onMouseOver);
  document.removeEventListener('mouseout', onMouseOut);
  cursorEl = null;
  initialized = false;
}

export function initCursor(): void {
  if (initialized) return;
  if (isTouchDevice || prefersReducedMotion) return;

  const cursor = document.getElementById('crosshairCursor');
  const trailContainer = document.getElementById('cursorTrail');
  if (!cursor) return;

  initialized = true;
  cursorEl = cursor;

  let cx = 0;
  let cy = 0;
  const CURSOR_LERP = 0.15;

  const trailDots = trailContainer ? trailContainer.querySelectorAll<HTMLSpanElement>('span') : [];
  const trailPositions: { x: number; y: number }[] = [];
  for (let i = 0; i < trailDots.length; i++) {
    trailPositions.push({ x: 0, y: 0 });
  }

  updateCursorVisibility();

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('mouseover', onMouseOver);
  document.addEventListener('mouseout', onMouseOut);

  function animate(): void {
    cx += (mx - cx) * CURSOR_LERP;
    cy += (my - cy) * CURSOR_LERP;
    if (cursor) {
      cursor.style.left = `${cx}px`;
      cursor.style.top = `${cy}px`;
    }

    for (let i = trailDots.length - 1; i > 0; i--) {
      trailPositions[i].x = trailPositions[i - 1].x;
      trailPositions[i].y = trailPositions[i - 1].y;
    }
    if (trailPositions.length > 0) {
      trailPositions[0].x = cx;
      trailPositions[0].y = cy;
    }

    for (let j = 0; j < trailDots.length; j++) {
      trailDots[j].style.left = `${trailPositions[j].x}px`;
      trailDots[j].style.top = `${trailPositions[j].y}px`;
      trailDots[j].style.opacity = cursor?.classList.contains('visible')
        ? String((1 - j / trailDots.length) * 0.4)
        : '0';
    }

    frameId = requestAnimationFrame(animate);
  }
  frameId = requestAnimationFrame(animate);
}
