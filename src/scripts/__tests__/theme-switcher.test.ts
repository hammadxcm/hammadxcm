/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../achievements', () => ({ trackEvent: vi.fn() }));
vi.mock('../state', () => ({ prefersReducedMotion: false }));
vi.mock('../theme-config', () => ({ getCurrentTheme: () => 'hacker' }));
vi.mock('../theme-updates', () => ({ applyThemeEffects: vi.fn() }));

function setupDOM(): void {
  document.body.innerHTML = `
    <div id="themeSwitcher">
      <button id="themeToggleBtn" aria-expanded="false">Theme</button>
      <div id="themeDropdown">
        <button class="theme-option" data-theme="hacker">Hacker</button>
        <button class="theme-option" data-theme="cyberpunk">Cyberpunk</button>
      </div>
    </div>
  `;
}

describe('initThemeSwitcher', () => {
  beforeEach(() => {
    vi.resetModules();
    setupDOM();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('does nothing without required elements', async () => {
    document.body.innerHTML = '';
    const mod = await import('../theme-switcher');
    expect(() => mod.initThemeSwitcher()).not.toThrow();
  });

  it('opens dropdown on toggle click', async () => {
    const { initThemeSwitcher } = await import('../theme-switcher');
    initThemeSwitcher();
    const btn = document.getElementById('themeToggleBtn');
    const dropdown = document.getElementById('themeDropdown');
    btn?.click();
    expect(dropdown?.classList.contains('open')).toBe(true);
    expect(btn?.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes dropdown on second toggle click', async () => {
    const { initThemeSwitcher } = await import('../theme-switcher');
    initThemeSwitcher();
    const btn = document.getElementById('themeToggleBtn');
    const dropdown = document.getElementById('themeDropdown');
    btn?.click();
    btn?.click();
    expect(dropdown?.classList.contains('open')).toBe(false);
  });

  it('applies theme on option click', async () => {
    const { initThemeSwitcher } = await import('../theme-switcher');
    const { applyThemeEffects } = await import('../theme-updates');
    initThemeSwitcher();
    const option = document.querySelector('[data-theme="cyberpunk"]') as HTMLButtonElement;
    option.click();
    expect(applyThemeEffects).toHaveBeenCalledWith('cyberpunk');
  });

  it('closes dropdown on escape key', async () => {
    const { initThemeSwitcher } = await import('../theme-switcher');
    initThemeSwitcher();
    const btn = document.getElementById('themeToggleBtn');
    const dropdown = document.getElementById('themeDropdown');
    btn?.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(dropdown?.classList.contains('open')).toBe(false);
  });

  it('closes dropdown on outside click', async () => {
    const { initThemeSwitcher } = await import('../theme-switcher');
    initThemeSwitcher();
    const btn = document.getElementById('themeToggleBtn');
    const dropdown = document.getElementById('themeDropdown');
    btn?.click();
    document.dispatchEvent(new Event('click'));
    expect(dropdown?.classList.contains('open')).toBe(false);
  });

  it('sets active class on current theme option', async () => {
    const { initThemeSwitcher } = await import('../theme-switcher');
    initThemeSwitcher();
    const hackerOption = document.querySelector('[data-theme="hacker"]');
    expect(hackerOption?.classList.contains('active')).toBe(true);
  });

  it('applies saved theme on init', async () => {
    const { initThemeSwitcher } = await import('../theme-switcher');
    const { applyThemeEffects } = await import('../theme-updates');
    initThemeSwitcher();
    expect(applyThemeEffects).toHaveBeenCalledWith('hacker');
  });
});
