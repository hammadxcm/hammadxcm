import { prefersReducedMotion } from '../state';

export function initKonami(): void {
  if (prefersReducedMotion) return;
  const konamiOverlay = document.getElementById('konamiOverlay');
  const toastContainer = document.getElementById('hackerToastContainer');
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
          if (toastContainer) {
            const toast = document.createElement('div');
            toast.className = 'hacker-toast';
            toast.textContent = '# Security breach contained';
            toastContainer.appendChild(toast);
            setTimeout(() => {
              toast.classList.add('dismiss');
              toast.addEventListener('animationend', () => toast.remove());
            }, 2500);
          }
        }, 1500);
      }
    } else {
      position = 0;
    }
  });
}
