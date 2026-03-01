import { isPageVisible, isTouchDevice, onVisibilityChange, prefersReducedMotion } from '../state';
import { getCurrentTheme, getThemeConfig } from '../theme-config';
import { createScrambleReveal, shuffleIndices } from './scramble-text';

const REVEAL_HOLD_MS = 30000;
const INITIAL_DELAY_MS = 1500;

let innerEl: HTMLElement | null = null;
let heroNameEl: HTMLElement | null = null;
let finalText = 'Hammad Khan';
let activeIntervals: number[] = [];
let cycleQueued = false;
let cycleRunning = false;
let initialized = false;
let effectTimer: number | null = null;

function loadThemeConfig() {
  const tc = getThemeConfig();
  return { glyphs: tc.heroGlyphs, timing: tc.heroTiming };
}

function trackInterval(id: number): number {
  activeIntervals.push(id);
  return id;
}

function untrackInterval(id: number): void {
  clearInterval(id);
  activeIntervals = activeIntervals.filter((v) => v !== id);
}

function clearAllIntervals(): void {
  for (const id of activeIntervals) clearInterval(id);
  activeIntervals = [];
}

function decrypt(resolved: boolean[], onDone: () => void): void {
  const { glyphs, timing } = loadThemeConfig();

  const { flickerTimer, resolverTimer } = createScrambleReveal({
    text: finalText,
    glyphs,
    timing,
    onFrame: (text) => {
      if (innerEl) innerEl.textContent = text;
    },
    onDone: () => {
      activeIntervals = activeIntervals.filter((v) => v !== flickerTimer && v !== resolverTimer);
      onDone();
    },
  });

  // Pre-apply already-resolved positions by marking them immediately
  // (createScrambleReveal starts fresh, so we feed the full text and let it resolve all)
  trackInterval(flickerTimer);
  trackInterval(resolverTimer);
}

function buildScrambledText(resolved: boolean[], glyphs: string): string {
  let out = '';
  for (let i = 0; i < finalText.length; i++) {
    if (finalText[i] === ' ') out += ' ';
    else if (resolved[i]) out += finalText[i];
    else out += glyphs[Math.floor(Math.random() * glyphs.length)];
  }
  return out;
}

function encrypt(resolved: boolean[], onDone: () => void): void {
  const { glyphs, timing } = loadThemeConfig();
  const len = finalText.length;
  const pool: number[] = [];
  for (let i = 0; i < len; i++) {
    if (finalText[i] !== ' ' && resolved[i]) pool.push(i);
  }
  shuffleIndices(pool);

  let step = 0;
  const corruptor = trackInterval(
    window.setInterval(() => {
      if (step < pool.length) {
        resolved[pool[step]] = false;
        if (innerEl) innerEl.textContent = buildScrambledText(resolved, glyphs);
        step++;
      } else {
        untrackInterval(corruptor);
        const flicker = trackInterval(
          window.setInterval(() => {
            if (innerEl) innerEl.textContent = buildScrambledText(resolved, glyphs);
          }, timing.flicker),
        );
        setTimeout(
          () => {
            untrackInterval(flicker);
            onDone();
          },
          800 + Math.random() * 700,
        );
      }
    }, timing.resolve),
  );
}

function cycle(): void {
  if (!isPageVisible()) {
    cycleQueued = true;
    cycleRunning = false;
    return;
  }
  cycleQueued = false;
  cycleRunning = true;
  const len = finalText.length;
  const resolved: boolean[] = [];
  for (let i = 0; i < len; i++) resolved[i] = false;

  decrypt(resolved, () => {
    // Stay on "Hammad Khan" for 30 seconds, then scramble and restart
    setTimeout(() => {
      encrypt(resolved, () => {
        cycle();
      });
    }, REVEAL_HOLD_MS);
  });
}

/* ── Hero Effect Scheduling ────────────────────────── */

const EFFECT_CLASSES = [
  'hero-glitch-active',
  'hero-lightning-active',
  'hero-blood-active',
] as const;

function clearEffectTimer(): void {
  if (effectTimer !== null) {
    clearTimeout(effectTimer);
    effectTimer = null;
  }
  if (heroNameEl) {
    for (const cls of EFFECT_CLASSES) heroNameEl.classList.remove(cls);
  }
}

function activateEffect(cls: string, duration: number, next: () => void): void {
  if (!heroNameEl || !isPageVisible()) {
    next();
    return;
  }
  // Swap glow for effect, then restore glow after
  heroNameEl.classList.remove('hero-glow-active');
  heroNameEl.classList.add(cls);
  setTimeout(() => {
    heroNameEl?.classList.remove(cls);
    heroNameEl?.classList.add('hero-glow-active');
    next();
  }, duration);
}

function scheduleHackerEffects(): void {
  // Randomly alternate between glitch and lightning
  const delay = 8000 + Math.random() * 7000; // 8–15s
  effectTimer = window.setTimeout(() => {
    const useGlitch = Math.random() < 0.5;
    activateEffect(
      useGlitch ? 'hero-glitch-active' : 'hero-lightning-active',
      useGlitch ? 300 : 500,
      scheduleHackerEffects,
    );
  }, delay);
}

function scheduleLightning(): void {
  const delay = 12000 + Math.random() * 8000; // 12–20s
  effectTimer = window.setTimeout(() => {
    activateEffect('hero-lightning-active', 600, scheduleLightning);
  }, delay);
}

function scheduleBloodSplatter(): void {
  const delay = 10000 + Math.random() * 8000; // 10–18s
  effectTimer = window.setTimeout(() => {
    activateEffect('hero-blood-active', 800, scheduleBloodSplatter);
  }, delay);
}

function scheduleHeroEffects(): void {
  clearEffectTimer();

  // Enable ambient glow on .hero-name
  heroNameEl?.classList.add('hero-glow-active');

  // Skip JS-triggered hit effects on touch devices
  if (isTouchDevice) return;

  const theme = getCurrentTheme();
  if (theme === 'hacker' || theme === 'matrix') {
    scheduleHackerEffects();
  } else if (theme === 'synthwave') {
    scheduleLightning();
  } else if (theme === 'bloodmoon') {
    scheduleBloodSplatter();
  }
}

/* ── Public API ────────────────────────────────────── */

export function restartHeroAnimation(): void {
  if (!initialized) return;
  clearAllIntervals();
  clearEffectTimer();
  heroNameEl?.classList.remove('hero-glow-active');
  cycleRunning = false;
  cycleQueued = false;
  cycle();
  scheduleHeroEffects();
}

export function initHeroName(): void {
  if (prefersReducedMotion) return;

  innerEl = document.getElementById('heroNameInner');
  if (!innerEl) return;

  heroNameEl = document.getElementById('heroName');
  finalText = heroNameEl?.dataset.text || 'Hammad Khan';

  onVisibilityChange((visible) => {
    if (!visible) {
      clearAllIntervals();
      clearEffectTimer();
      cycleRunning = false;
    } else if (cycleQueued || !cycleRunning) {
      cycle();
      scheduleHeroEffects();
    }
  });

  setTimeout(() => {
    if (innerEl) {
      innerEl.style.display = 'inline-block';
      innerEl.style.minWidth = `${innerEl.offsetWidth}px`;
    }
    initialized = true;
    cycle();
    scheduleHeroEffects();
  }, INITIAL_DELAY_MS);
}
