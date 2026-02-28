import { prefersReducedMotion } from './state';
import { getCurrentTheme, getThemeConfig, themePrompts } from './theme-config';
import { switchCanvasEffect } from './effects/canvas';
import { updateCursorVisibility } from './effects/cursor';
import { updateTypewriterTexts } from './effects/typewriter';
import { restartHeroAnimation } from './effects/hero-name';
import { updateAnalyticsTheme } from './analytics';
import { updateAboutTheme } from './interactions/about-lang';
import type { ThemeName } from './types';

export function initThemeSwitcher(): void {
  const switcher = document.getElementById('themeSwitcher');
  const toggleBtn = document.getElementById('themeToggleBtn');
  const dropdown = document.getElementById('themeDropdown');
  if (!switcher || !toggleBtn || !dropdown) return;

  const options = dropdown.querySelectorAll<HTMLButtonElement>('.theme-option');

  function setActiveOption(themeName?: string): void {
    const current = (themeName || getCurrentTheme()) as ThemeName;
    options.forEach((opt) => {
      opt.classList.toggle('active', opt.dataset.theme === current);
    });
  }
  setActiveOption();

  toggleBtn.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
  });

  function applyThemeEffects(theme: ThemeName): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);

    const tc = getThemeConfig(theme);

    // Update overlay visibility
    const crt = document.getElementById('crtOverlay');
    if (crt) crt.style.display = tc.hasCRT ? '' : 'none';

    const hackerLog = document.getElementById('hackerLog');
    if (hackerLog) hackerLog.style.display = tc.hasHackerLog ? '' : 'none';

    const matrixCanvas = document.getElementById('matrix-canvas');
    if (matrixCanvas)
      matrixCanvas.style.display = tc.hasMatrixRain ? '' : 'none';

    const statusBar = document.getElementById('terminalStatusBar');
    if (statusBar) statusBar.style.display = tc.hasStatusBar ? '' : 'none';

    // BUG FIX: Clear stale nav inline bg so CSS takes over immediately
    const nav = document.querySelector<HTMLElement>('nav');
    if (nav) nav.style.background = '';

    // Update cursor
    updateCursorVisibility();

    // Update canvas effect
    switchCanvasEffect(theme);

    // Update hero greeting
    const greetingEl = document.getElementById('heroGreeting');
    if (greetingEl)
      greetingEl.textContent = themePrompts[theme] || themePrompts.hacker;

    // Update typewriter texts
    updateTypewriterTexts(theme);

    // Restart hero name animation with themed glyphs
    restartHeroAnimation();

    // Update GitHub analytics images
    updateAnalyticsTheme(theme);

    // Update About section chrome + language
    updateAboutTheme(theme);
  }

  options.forEach((opt) => {
    opt.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();
      const theme = opt.dataset.theme as ThemeName;

      if (document.startViewTransition && !prefersReducedMotion) {
        document.startViewTransition(() => applyThemeEffects(theme));
      } else {
        applyThemeEffects(theme);
      }

      setActiveOption(theme);
      dropdown.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  });

  // Close on Escape
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      dropdown.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Apply saved theme on load
  applyThemeEffects(getCurrentTheme());
}
