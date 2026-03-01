import { spawnToast } from '../effects/toast';
import { prefersReducedMotion } from '../state';

const KONAMI_OVERLAY_MS = 1500;

export function initKonami(): void {
  if (prefersReducedMotion) return;
  const konamiOverlay = document.getElementById('konamiOverlay');
  if (!konamiOverlay) return;

  const sequence = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ];
  let position = 0;

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    const expected = sequence[position];
    if (e.key === expected || e.key.toLowerCase() === expected) {
      position++;
      if (position === sequence.length) {
        position = 0;
        konamiOverlay.classList.add('active');
        setTimeout(() => {
          konamiOverlay.classList.remove('active');
          spawnToast('# Security breach contained');
        }, KONAMI_OVERLAY_MS);
      }
    } else {
      position = 0;
    }
  });
}
