import { isTouchDevice, prefersReducedMotion } from '../state';
import { getThemeConfig, getThemeToasts } from '../theme-config';
import type { ScreenEffect } from '../types';
import { spawnToast } from './toast';

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
  hologramFlicker: 250,
  nebulaPulse: 600,
  none: 0,
};

const AMBIENT_INTERVAL_BASE_MS = 12000;
const ENV_INTERVAL_BASE_MS = 6000;

let initialized = false;
let effectAC: AbortController | null = null;
let ambientTimer: ReturnType<typeof setTimeout> | null = null;
let envTimer: ReturnType<typeof setTimeout> | null = null;

function clearRecursiveTimers(): void {
  if (ambientTimer !== null) {
    clearTimeout(ambientTimer);
    ambientTimer = null;
  }
  if (envTimer !== null) {
    clearTimeout(envTimer);
    envTimer = null;
  }
}

export function destroyScreenEffects(): void {
  effectAC?.abort();
  effectAC = null;
  clearRecursiveTimers();
  initialized = false;
}

export function initScreenEffects(): void {
  if (initialized || prefersReducedMotion) return;
  initialized = true;

  effectAC = new AbortController();

  const overlay = document.getElementById('screenEffectOverlay');

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

    // Use only the overlay-based effect — body-level filter animations
    // cascade to all children (including the fixed status bar), so we
    // intentionally skip adding env-effect-* classes to <body>.
    triggerScreenEffect();
  }

  document.addEventListener(
    'click',
    (e: MouseEvent) => {
      triggerScreenEffect(e);
      const msgs = getThemeToasts().click;
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      spawnToast(msg);
    },
    { signal: effectAC?.signal },
  );

  function scheduleAmbient(): void {
    const delay = AMBIENT_INTERVAL_BASE_MS + Math.random() * 6000;
    ambientTimer = setTimeout(() => {
      if (effectAC?.signal.aborted) return;
      const msgs = getThemeToasts().ambient;
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      spawnToast(msg, { className: 'hacker-toast ambient' });
      scheduleAmbient();
    }, delay);
  }
  if (!isTouchDevice) scheduleAmbient();

  function scheduleEnvEffect(): void {
    const delay = ENV_INTERVAL_BASE_MS + Math.random() * 6000;
    envTimer = setTimeout(() => {
      if (effectAC?.signal.aborted) return;
      triggerEnvEffect();
      scheduleEnvEffect();
    }, delay);
  }
  if (!isTouchDevice) scheduleEnvEffect();
}
