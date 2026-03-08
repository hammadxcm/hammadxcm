let initialized = false;
let keyHandler: ((e: KeyboardEvent) => void) | null = null;

export function toggleWireframe(): void {
  const isActive = document.documentElement.classList.toggle('wireframe-mode');
  try {
    sessionStorage.setItem('hk-wireframe', isActive ? '1' : '0');
  } catch {
    /* noop */
  }
  // Achievement
  if (isActive) {
    try {
      window.dispatchEvent(new CustomEvent('achievement-trigger', { detail: 'wireframe_mode' }));
    } catch {
      /* noop */
    }
  }
}

export function initWireframe(): void {
  if (initialized) return;
  initialized = true;

  // Restore from session
  try {
    if (sessionStorage.getItem('hk-wireframe') === '1') {
      document.documentElement.classList.add('wireframe-mode');
    }
  } catch {
    /* noop */
  }

  keyHandler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'W') {
      e.preventDefault();
      toggleWireframe();
    }
  };
  window.addEventListener('keydown', keyHandler);
}

export function destroyWireframe(): void {
  if (keyHandler) {
    window.removeEventListener('keydown', keyHandler);
    keyHandler = null;
  }
  document.documentElement.classList.remove('wireframe-mode');
  initialized = false;
}
