import { prefersReducedMotion, isTouchDevice } from '../state';
import { getThemeConfig, getThemeToasts } from '../theme-config';
import type { ScreenEffect } from '../types';

const effectDurations: Record<ScreenEffect, number> = {
  glitch: 150,
  bloodDrip: 600,
  iceCrack: 500,
  vhsDistortion: 200,
  fogWisps: 900,
  auroraShimmer: 700,
  pastelBloom: 500,
  shootingStar: 400,
  tvStatic: 200,
  none: 0,
};

const envDurations: Record<ScreenEffect, number> = {
  glitch: 200,
  bloodDrip: 300,
  iceCrack: 300,
  vhsDistortion: 250,
  fogWisps: 400,
  auroraShimmer: 400,
  pastelBloom: 400,
  shootingStar: 250,
  tvStatic: 200,
  none: 0,
};

export function initScreenEffects(): void {
  if (prefersReducedMotion) return;

  const toastContainer = document.getElementById('hackerToastContainer');
  const overlay = document.getElementById('screenEffectOverlay');
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

  function triggerScreenEffect(event?: MouseEvent): void {
    const effect = getThemeConfig().screenEffect;
    if (effect === 'none' || !overlay) return;

    overlay.setAttribute('data-effect', effect);

    if (event) {
      overlay.style.setProperty('--click-x', `${event.clientX}px`);
      overlay.style.setProperty('--click-y', `${event.clientY}px`);
    }

    overlay.classList.remove('active');
    void overlay.offsetWidth; // reflow trick for animation restart
    overlay.classList.add('active');

    setTimeout(() => {
      overlay.classList.remove('active');
    }, effectDurations[effect]);
  }

  function triggerEnvEffect(): void {
    const effect = getThemeConfig().screenEffect;
    if (effect === 'none') return;

    triggerScreenEffect();

    // Keep backward compat for glitch body animation
    if (effect === 'glitch') {
      document.body.classList.add('env-glitch');
      setTimeout(() => document.body.classList.remove('env-glitch'), 200);
    }

    const envClass = `env-effect-${effect}`;
    document.body.classList.add(envClass);
    setTimeout(
      () => document.body.classList.remove(envClass),
      envDurations[effect],
    );
  }

  document.addEventListener('click', (e: MouseEvent) => {
    triggerScreenEffect(e);
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

  function scheduleEnvEffect(): void {
    const delay = 6000 + Math.random() * 6000;
    setTimeout(() => {
      triggerEnvEffect();
      scheduleEnvEffect();
    }, delay);
  }
  if (!isTouchDevice) scheduleEnvEffect();
}
