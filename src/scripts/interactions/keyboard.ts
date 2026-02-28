import { prefersReducedMotion } from '../state';

export function initKeyboard(): void {
  if (prefersReducedMotion) return;
  const flash = document.getElementById('keyFlash');
  if (!flash) return;
  let timeout: number;

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    let key = e.key;
    if (key === ' ') key = 'Space';
    if (key.length > 10) return;
    flash.textContent = `> ${key}`;
    flash.classList.add('show');
    clearTimeout(timeout);
    timeout = window.setTimeout(() => flash.classList.remove('show'), 600);
  });
}
