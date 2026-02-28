import { isTouchDevice, prefersReducedMotion } from '../state';
import { getThemeConfig } from '../theme-config';

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
      tc.hasCursor === 'crosshair'
        ? 'crosshair-cursor'
        : 'crosshair-cursor cursor-dot';
  }
}

export function initCursor(): void {
  if (isTouchDevice || prefersReducedMotion) return;

  const cursor = document.getElementById('crosshairCursor');
  const trailContainer = document.getElementById('cursorTrail');
  if (!cursor) return;

  let mx = 0;
  let my = 0;
  let cx = 0;
  let cy = 0;
  const lerp = 0.15;

  const trailDots = trailContainer
    ? trailContainer.querySelectorAll<HTMLSpanElement>('span')
    : [];
  const trailPositions: { x: number; y: number }[] = [];
  for (let i = 0; i < trailDots.length; i++) {
    trailPositions.push({ x: 0, y: 0 });
  }

  updateCursorVisibility();

  document.addEventListener('mousemove', (e: MouseEvent) => {
    mx = e.clientX;
    my = e.clientY;
    const tc = getThemeConfig();
    if (tc.hasCursor && !cursor.classList.contains('visible'))
      cursor.classList.add('visible');
  });

  document.addEventListener('mouseleave', () => {
    cursor.classList.remove('visible');
    for (let i = 0; i < trailDots.length; i++) {
      trailDots[i].style.opacity = '0';
    }
  });

  const interactiveEls =
    'a, button, [data-tilt], .social-btn, .project-link, .cert-card, .skyline-card, input, textarea, select';
  document.addEventListener('mouseover', (e: MouseEvent) => {
    if ((e.target as Element).closest(interactiveEls))
      cursor.classList.add('hover');
  });
  document.addEventListener('mouseout', (e: MouseEvent) => {
    if ((e.target as Element).closest(interactiveEls))
      cursor.classList.remove('hover');
  });

  function animate(): void {
    cx += (mx - cx) * lerp;
    cy += (my - cy) * lerp;
    cursor!.style.left = `${cx}px`;
    cursor!.style.top = `${cy}px`;

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
      trailDots[j].style.opacity = cursor!.classList.contains('visible')
        ? String((1 - j / trailDots.length) * 0.4)
        : '0';
    }

    requestAnimationFrame(animate);
  }
  animate();
}
