import { prefersReducedMotion, isPageVisible } from '../state';
import { getThemeConfig } from '../theme-config';

let innerEl: HTMLElement | null = null;
let finalText = 'Hammad Khan';
let activeIntervals: number[] = [];
let cycleQueued = false;
let cycleRunning = false;

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

function shuffle(arr: number[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
}

function buildText(resolved: boolean[], glyphs: string): string {
  const len = finalText.length;
  let out = '';
  for (let i = 0; i < len; i++) {
    if (finalText[i] === ' ') {
      out += ' ';
    } else if (resolved[i]) {
      out += finalText[i];
    } else {
      out += glyphs[Math.floor(Math.random() * glyphs.length)];
    }
  }
  return out;
}

function decrypt(
  resolved: boolean[],
  onDone: () => void,
): void {
  const { glyphs, timing } = loadThemeConfig();
  const len = finalText.length;
  const pool: number[] = [];
  for (let i = 0; i < len; i++) {
    if (finalText[i] !== ' ' && !resolved[i]) pool.push(i);
  }
  shuffle(pool);

  const flicker = trackInterval(
    window.setInterval(() => {
      if (innerEl) innerEl.textContent = buildText(resolved, glyphs);
    }, timing.flicker),
  );

  let step = 0;
  const resolver = trackInterval(
    window.setInterval(() => {
      if (step < pool.length) {
        resolved[pool[step]] = true;
        step++;
      } else {
        untrackInterval(resolver);
        untrackInterval(flicker);
        if (innerEl) innerEl.textContent = finalText;
        onDone();
      }
    }, timing.resolve),
  );
}

function encrypt(
  resolved: boolean[],
  onDone: () => void,
): void {
  const { glyphs, timing } = loadThemeConfig();
  const len = finalText.length;
  const pool: number[] = [];
  for (let i = 0; i < len; i++) {
    if (finalText[i] !== ' ' && resolved[i]) pool.push(i);
  }
  shuffle(pool);

  let step = 0;
  const corruptor = trackInterval(
    window.setInterval(() => {
      if (step < pool.length) {
        resolved[pool[step]] = false;
        if (innerEl) innerEl.textContent = buildText(resolved, glyphs);
        step++;
      } else {
        untrackInterval(corruptor);
        const flicker = trackInterval(
          window.setInterval(() => {
            if (innerEl) innerEl.textContent = buildText(resolved, glyphs);
          }, timing.flicker),
        );
        setTimeout(() => {
          untrackInterval(flicker);
          onDone();
        }, 800 + Math.random() * 700);
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
    }, 30000);
  });
}

export function restartHeroAnimation(): void {
  clearAllIntervals();
  cycleRunning = false;
  cycleQueued = false;
  cycle();
}

export function initHeroName(): void {
  if (prefersReducedMotion) return;

  innerEl = document.getElementById('heroNameInner');
  if (!innerEl) return;

  const heroNameEl = document.getElementById('heroName');
  finalText = heroNameEl?.dataset.text || 'Hammad Khan';

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearAllIntervals();
      cycleRunning = false;
    } else if (cycleQueued || !cycleRunning) {
      cycle();
    }
  });

  setTimeout(() => {
    if (innerEl) {
      innerEl.style.display = 'inline-block';
      innerEl.style.minWidth = `${innerEl.offsetWidth}px`;
    }
    cycle();
  }, 3200);
}
