import { isTouchDevice, prefersReducedMotion } from '../state';

let initialized = false;
let links: HTMLAnchorElement[] = [];
let mouseMoveHandler: ((e: MouseEvent) => void) | null = null;

const RADIUS = 60;
const STRENGTH = 0.3;

function handleMouseMove(e: MouseEvent): void {
  const mx = e.clientX;
  const my = e.clientY;

  for (const link of links) {
    const rect = link.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mx - cx;
    const dy = my - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < RADIUS) {
      link.style.transform = `translate(${dx * STRENGTH}px, ${dy * STRENGTH}px)`;
    } else {
      link.style.transform = '';
    }
  }
}

export function initMagneticNav(): void {
  if (initialized) return;
  if (isTouchDevice || prefersReducedMotion) return;

  const nav = document.querySelector('nav');
  if (!nav) return;

  const anchors = nav.querySelectorAll<HTMLAnchorElement>('a');
  if (anchors.length === 0) return;

  initialized = true;
  links = Array.from(anchors);

  for (const link of links) {
    link.style.transition = 'transform 0.2s ease-out';
  }

  mouseMoveHandler = handleMouseMove;
  document.addEventListener('mousemove', mouseMoveHandler);
}

export function destroyMagneticNav(): void {
  if (mouseMoveHandler) {
    document.removeEventListener('mousemove', mouseMoveHandler);
    mouseMoveHandler = null;
  }
  for (const link of links) {
    link.style.transform = '';
    link.style.transition = '';
  }
  links = [];
  initialized = false;
}
