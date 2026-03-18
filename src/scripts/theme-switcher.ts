import { THEME_NAMES } from '../config/theme-colors';
import { trackEvent } from './achievements';
import { prefersReducedMotion } from './state';
import { getCurrentTheme } from './theme-config';
import { applyThemeEffects, applyThemeHeavyEffects } from './theme-updates';
import type { ThemeName } from './types';

const themeSwitchTimes: number[] = [];
let initialized = false;
let themeAC: AbortController | null = null;

export function destroyThemeSwitcher(): void {
  themeAC?.abort();
  themeAC = null;
  initialized = false;
}

function onOutsideClick(dropdown: HTMLElement, toggleBtn: HTMLElement): void {
  dropdown.classList.remove('open');
  toggleBtn.setAttribute('aria-expanded', 'false');
}

function onEscapeKey(e: KeyboardEvent, dropdown: HTMLElement, toggleBtn: HTMLElement): void {
  if (e.key === 'Escape') {
    dropdown.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }
}

function applyThemeWithTransition(theme: ThemeName, e: MouseEvent): void {
  if (document.startViewTransition && !prefersReducedMotion) {
    const x = ((e.clientX / window.innerWidth) * 100).toFixed(1);
    const y = ((e.clientY / window.innerHeight) * 100).toFixed(1);
    document.documentElement.style.setProperty('--transition-x', `${x}%`);
    document.documentElement.style.setProperty('--transition-y', `${y}%`);
    document.documentElement.setAttribute('data-theme-transition', theme);
    const vt = document.startViewTransition(() => applyThemeEffects(theme, true));
    vt.finished.then(() => {
      document.documentElement.removeAttribute('data-theme-transition');
      applyThemeHeavyEffects(theme);
    });
  } else {
    applyThemeEffects(theme);
  }

  trackEvent('theme_switch');
  trackEvent(`theme:${theme}`);

  const now = Date.now();
  themeSwitchTimes.push(now);
  while (themeSwitchTimes.length > 0 && themeSwitchTimes[0] < now - 30_000) {
    themeSwitchTimes.shift();
  }
  if (themeSwitchTimes.length >= 5) trackEvent('rapid_switcher');
}

export function initThemeSwitcher(): void {
  if (initialized) return;
  initialized = true;
  themeAC = new AbortController();
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

  options.forEach((opt) => {
    opt.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();
      const theme = opt.dataset.theme as ThemeName;
      applyThemeWithTransition(theme, e);
      setActiveOption(theme);
      dropdown.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', () => onOutsideClick(dropdown, toggleBtn), {
    signal: themeAC?.signal,
  });

  // Close on Escape
  document.addEventListener('keydown', (e: KeyboardEvent) => onEscapeKey(e, dropdown, toggleBtn), {
    signal: themeAC?.signal,
  });

  // Theme randomizer button
  const randomBtn = document.getElementById('themeRandomBtn');
  if (randomBtn) {
    randomBtn.addEventListener('click', (e: MouseEvent) => {
      const current = getCurrentTheme();
      const choices = THEME_NAMES.filter((t) => t !== current);
      const theme = choices[Math.floor(Math.random() * choices.length)];
      applyThemeWithTransition(theme, e);
      setActiveOption(theme);
    });
  }

  // Apply saved theme on load
  applyThemeEffects(getCurrentTheme());
}
