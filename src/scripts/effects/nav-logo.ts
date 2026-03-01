import { isTouchDevice, prefersReducedMotion } from '../state';
import { getThemeConfig, getThemeLogo } from '../theme-config';
import type { ThemeName } from '../types';
import { createScrambleReveal } from './scramble-text';

let textEl: HTMLElement | null = null;
let suffixEl: HTMLElement | null = null;
let scrambleTimer: number | null = null;
let resolverTimer: number | null = null;

function scrambleReveal(text: string, onDone?: () => void): void {
  if (!textEl) return;

  const { heroGlyphs: glyphs, heroTiming: timing } = getThemeConfig();
  const timers = createScrambleReveal({
    text,
    glyphs,
    timing,
    onFrame: (t) => {
      if (textEl) textEl.textContent = t;
    },
    onDone: () => {
      resolverTimer = null;
      scrambleTimer = null;
      onDone?.();
    },
  });

  scrambleTimer = timers.flickerTimer;
  resolverTimer = timers.resolverTimer;
}

function clearScramble(): void {
  if (scrambleTimer !== null) {
    clearInterval(scrambleTimer);
    scrambleTimer = null;
  }
  if (resolverTimer !== null) {
    clearInterval(resolverTimer);
    resolverTimer = null;
  }
}

export function initNavLogo(): void {
  textEl = document.getElementById('navLogoText');
  suffixEl = document.getElementById('navLogoSuffix');
  if (!textEl || !suffixEl) return;

  // Set initial logo for current theme
  const logo = getThemeLogo();
  textEl.textContent = logo.text;
  suffixEl.textContent = logo.suffix;

  // Hover scramble on desktop only
  if (!isTouchDevice && !prefersReducedMotion) {
    const logoAnchor = document.getElementById('navLogo');
    if (logoAnchor) {
      let isAnimating = false;
      logoAnchor.addEventListener('mouseenter', () => {
        if (isAnimating) return;
        isAnimating = true;
        const currentText = getThemeLogo().text;
        scrambleReveal(currentText, () => {
          isAnimating = false;
        });
      });
    }
  }
}

export function updateNavLogo(theme: ThemeName): void {
  if (!textEl || !suffixEl) return;

  const logo = getThemeLogo(theme);

  if (prefersReducedMotion) {
    textEl.textContent = logo.text;
    suffixEl.textContent = logo.suffix;
    return;
  }

  clearScramble();

  // Fade suffix out
  suffixEl.classList.add('fade-out');

  setTimeout(() => {
    // Update suffix text while hidden
    if (suffixEl) suffixEl.textContent = logo.suffix;

    // Scramble-reveal the text
    scrambleReveal(logo.text, () => {
      // Fade suffix back in
      suffixEl?.classList.remove('fade-out');
    });
  }, 150);
}
