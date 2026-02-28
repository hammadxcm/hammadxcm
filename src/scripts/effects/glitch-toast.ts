import { prefersReducedMotion, isTouchDevice } from '../state';
import { getThemeConfig, getThemeToasts } from '../theme-config';

export function initGlitchToast(): void {
  if (prefersReducedMotion) return;

  const toastContainer = document.getElementById('hackerToastContainer');
  const glitchOverlay = document.getElementById('clickGlitchOverlay');
  if (!toastContainer) return;

  const maxToasts = 3;

  function spawnToast(message: string, isAmbient: boolean): void {
    const toast = document.createElement('div');
    toast.className = isAmbient ? 'hacker-toast ambient' : 'hacker-toast';
    toast.textContent = message;
    toastContainer!.appendChild(toast);

    let toasts = toastContainer!.querySelectorAll('.hacker-toast');
    while (toasts.length > maxToasts) {
      toasts[0].remove();
      toasts = toastContainer!.querySelectorAll('.hacker-toast');
    }

    setTimeout(() => {
      toast.classList.add('dismiss');
      toast.addEventListener('animationend', () => toast.remove());
    }, 2500);
  }

  function triggerGlitch(): void {
    const tc = getThemeConfig();
    if (!tc.hasGlitch || !glitchOverlay) return;
    glitchOverlay.classList.add('active');
    setTimeout(() => glitchOverlay.classList.remove('active'), 150);
  }

  document.addEventListener('click', () => {
    triggerGlitch();
    const msgs = getThemeToasts().click;
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    spawnToast(msg, false);
  });

  function scheduleAmbient(): void {
    const delay = 12000 + Math.random() * 6000;
    setTimeout(() => {
      const msgs = getThemeToasts().ambient;
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      spawnToast(msg, true);
      scheduleAmbient();
    }, delay);
  }
  if (!isTouchDevice) scheduleAmbient();

  function triggerGlobalGlitch(): void {
    const tc = getThemeConfig();
    if (!tc.hasGlitch) return;
    triggerGlitch();
    document.body.classList.add('env-glitch');
    setTimeout(() => document.body.classList.remove('env-glitch'), 200);
  }

  function scheduleEnvGlitch(): void {
    const delay = 6000 + Math.random() * 6000;
    setTimeout(() => {
      triggerGlobalGlitch();
      scheduleEnvGlitch();
    }, delay);
  }
  if (!isTouchDevice) scheduleEnvGlitch();
}
