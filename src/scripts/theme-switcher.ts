import { trackEvent } from './achievements';
import { prefersReducedMotion } from './state';
import { getCurrentTheme } from './theme-config';
import { applyThemeEffects } from './theme-updates';
import type { ThemeName } from './types';

const themeSwitchTimes: number[] = [];
let initialized = false;

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

export function initThemeSwitcher(): void {
  if (initialized) return;
  initialized = true;
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

      if (document.startViewTransition && !prefersReducedMotion) {
        document.startViewTransition(() => applyThemeEffects(theme));
      } else {
        applyThemeEffects(theme);
      }

      // Track theme change for achievements (user-initiated only)
      trackEvent('theme_switch');
      trackEvent(`theme:${theme}`);

      // Rapid switcher detection — 5 switches in 30 seconds
      const now = Date.now();
      themeSwitchTimes.push(now);
      while (themeSwitchTimes.length > 0 && themeSwitchTimes[0] < now - 30_000) {
        themeSwitchTimes.shift();
      }
      if (themeSwitchTimes.length >= 5) trackEvent('rapid_switcher');

      setActiveOption(theme);
      dropdown.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', () => onOutsideClick(dropdown, toggleBtn));

  // Close on Escape
  document.addEventListener('keydown', (e: KeyboardEvent) => onEscapeKey(e, dropdown, toggleBtn));

  // Apply saved theme on load
  applyThemeEffects(getCurrentTheme());
}
