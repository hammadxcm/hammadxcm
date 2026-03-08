import { prefersReducedMotion } from '../state';
import { createScrambleReveal } from './scramble-text';

let initialized = false;
let observer: IntersectionObserver | null = null;

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$@#!%&*?';
const TIMING = { flicker: 50, resolve: 80 };

function onIntersect(entries: IntersectionObserverEntry[]): void {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const el = entry.target as HTMLElement;
    if (el.dataset.scrambled === 'true') continue;

    el.dataset.scrambled = 'true';
    const original = el.textContent || '';

    createScrambleReveal({
      text: original,
      glyphs: GLYPHS,
      timing: TIMING,
      onFrame: (text) => {
        el.textContent = text;
      },
    });
  }
}

export function initSectionScramble(): void {
  if (initialized) return;

  const titles = document.querySelectorAll<HTMLElement>('.section-title');
  if (titles.length === 0) return;

  initialized = true;

  if (prefersReducedMotion) return;

  observer = new IntersectionObserver(onIntersect, { threshold: 0.3 });
  for (const el of titles) observer?.observe(el);
}

export function destroySectionScramble(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  initialized = false;
}
