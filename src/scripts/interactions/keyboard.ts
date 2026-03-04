import { prefersReducedMotion } from '../state';

let initialized = false;
let timeout: number;
let flashEl: HTMLElement | null = null;

function onKeyDown(e: KeyboardEvent): void {
  if (!flashEl) return;
  let key = e.key;
  if (key === ' ') key = 'Space';
  if (key.length > 10) return;
  flashEl.textContent = `> ${key}`;
  flashEl.classList.add('show');
  clearTimeout(timeout);
  timeout = window.setTimeout(() => flashEl?.classList.remove('show'), 600);
}

export function destroyKeyboard(): void {
  document.removeEventListener('keydown', onKeyDown);
  clearTimeout(timeout);
  flashEl = null;
  initialized = false;
}

export function initKeyboard(): void {
  if (initialized) return;
  if (prefersReducedMotion) return;
  const flash = document.getElementById('keyFlash');
  if (!flash) return;

  initialized = true;
  flashEl = flash;
  document.addEventListener('keydown', onKeyDown);
}
