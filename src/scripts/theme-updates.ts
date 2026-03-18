/**
 * Theme effect cascade — applies all visual updates when theme changes.
 * Extracted from theme-switcher.ts for Single Responsibility.
 */
import { updateAnalyticsTheme } from './analytics';
import { switchCanvasEffect } from './effects/canvas';
import { updateCursorVisibility } from './effects/cursor';
import { restartHeroAnimation } from './effects/hero-name';
import { updateNavLogo } from './effects/nav-logo';
import { updateParticleTextColor } from './effects/particle-text';
import { updateTypewriterTexts } from './effects/typewriter';
import { updateAboutTheme } from './interactions/about-lang';
import { updateStatusBar } from './interactions/status-bar';
import { setCurrentTheme } from './state';
import { getThemeConfig, themePrompts } from './theme-config';
import type { ThemeName } from './types';

/**
 * Light DOM/CSS changes needed for the View Transition snapshot.
 * Runs synchronously so the browser captures the correct new-state image.
 */
function applyThemeVisuals(theme: ThemeName): void {
  setCurrentTheme(theme);
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);

  const tc = getThemeConfig(theme);

  // Update overlay visibility
  const crt = document.getElementById('crtOverlay');
  if (crt) crt.style.display = tc.hasCRT ? '' : 'none';

  const hackerLog = document.getElementById('hackerLog');
  if (hackerLog) hackerLog.style.display = tc.hasHackerLog ? '' : 'none';

  const matrixCanvas = document.getElementById('matrix-canvas');
  if (matrixCanvas) matrixCanvas.style.display = tc.hasMatrixRain ? '' : 'none';

  // BUG FIX: Clear stale nav inline bg so CSS takes over immediately
  const nav = document.querySelector<HTMLElement>('nav');
  if (nav) nav.style.background = '';

  // Update hero greeting (text-only, cheap)
  const greetingEl = document.getElementById('heroGreeting');
  if (greetingEl) greetingEl.textContent = themePrompts[theme] || themePrompts.hacker;

  // Update nav logo (swaps src, cheap)
  updateNavLogo(theme);
}

/**
 * Heavy JS effects deferred until after View Transition finishes
 * so the morph animation stays smooth.
 */
function applyThemeHeavyEffects(theme: ThemeName): void {
  updateStatusBar();
  updateCursorVisibility();
  switchCanvasEffect(theme);
  updateTypewriterTexts(theme);
  restartHeroAnimation();
  updateAnalyticsTheme(theme);
  updateAboutTheme(theme);
  updateParticleTextColor();
}

export function applyThemeEffects(theme: ThemeName, deferred = false): void {
  applyThemeVisuals(theme);
  if (deferred) {
    // Heavy work will be triggered separately after transition
    return;
  }
  applyThemeHeavyEffects(theme);
}

export { applyThemeHeavyEffects };
