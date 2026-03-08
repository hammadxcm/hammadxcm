/**
 * Theme effect cascade — applies all visual updates when theme changes.
 * Extracted from theme-switcher.ts for Single Responsibility.
 */
import { updateAnalyticsTheme } from './analytics';
import { switchCanvasEffect } from './effects/canvas';
import { updateCursorVisibility } from './effects/cursor';
import { restartHeroAnimation } from './effects/hero-name';
import { updateNavLogo } from './effects/nav-logo';
import { updateTypewriterTexts } from './effects/typewriter';
import { updateAboutTheme } from './interactions/about-lang';
import { updateStatusBar } from './interactions/status-bar';
import { setCurrentTheme } from './state';
import { getThemeConfig, themePrompts } from './theme-config';
import type { ThemeName } from './types';

export function applyThemeEffects(theme: ThemeName): void {
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

  // Update status bar content for new theme
  updateStatusBar();

  // BUG FIX: Clear stale nav inline bg so CSS takes over immediately
  const nav = document.querySelector<HTMLElement>('nav');
  if (nav) nav.style.background = '';

  // Update cursor
  updateCursorVisibility();

  // Update canvas effect
  switchCanvasEffect(theme);

  // Update hero greeting
  const greetingEl = document.getElementById('heroGreeting');
  if (greetingEl) greetingEl.textContent = themePrompts[theme] || themePrompts.hacker;

  // Update typewriter texts
  updateTypewriterTexts(theme);

  // Restart hero name animation with themed glyphs
  restartHeroAnimation();

  // Update GitHub analytics images
  updateAnalyticsTheme(theme);

  // Update About section chrome + language
  updateAboutTheme(theme);

  // Update nav logo for theme
  updateNavLogo(theme);
}
