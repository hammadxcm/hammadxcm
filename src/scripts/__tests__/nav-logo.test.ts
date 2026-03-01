/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ThemeName } from '../types';

// Mutable state that tests can change
const mockState = {
  isTouchDevice: false,
  prefersReducedMotion: false,
};

vi.mock('../state', () => ({
  get isTouchDevice() {
    return mockState.isTouchDevice;
  },
  get prefersReducedMotion() {
    return mockState.prefersReducedMotion;
  },
  isPageVisible: () => true,
  getCurrentTheme: () =>
    (document.documentElement.getAttribute('data-theme') as ThemeName) || 'hacker',
  setCurrentTheme: () => {},
  isHeroVisible: () => true,
  setHeroVisible: () => {},
  onVisibilityChange: () => {},
}));

import { initNavLogo, updateNavLogo } from '../effects/nav-logo';
import { themeLogos } from '../theme-config';

const ALL_THEMES: ThemeName[] = [
  'hacker',
  'dracula',
  'nord',
  'catppuccin',
  'synthwave',
  'matrix',
  'bloodmoon',
  'midnight',
  'arctic',
  'gruvbox',
];

function setupDOM(): void {
  document.body.innerHTML = `
    <a href="#hero" class="nav-logo" id="navLogo">
      <span id="navLogoText">fyniti</span>
      <span id="navLogoSuffix">://hk</span>
    </a>
  `;
  document.documentElement.setAttribute('data-theme', 'hacker');
}

describe('initNavLogo', () => {
  beforeEach(() => {
    mockState.isTouchDevice = false;
    mockState.prefersReducedMotion = false;
    setupDOM();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('sets initial text and suffix from current theme', () => {
    initNavLogo();
    const textEl = document.getElementById('navLogoText');
    const suffixEl = document.getElementById('navLogoSuffix');
    expect(textEl?.textContent).toBe('fyniti');
    expect(suffixEl?.textContent).toBe('://hk');
  });

  it('does nothing when navLogoText is missing', () => {
    document.body.innerHTML = '<span id="navLogoSuffix">://hk</span>';
    expect(() => initNavLogo()).not.toThrow();
  });

  it('does nothing when navLogoSuffix is missing', () => {
    document.body.innerHTML = '<span id="navLogoText">fyniti</span>';
    expect(() => initNavLogo()).not.toThrow();
  });

  it('does nothing when both elements are missing', () => {
    document.body.innerHTML = '';
    expect(() => initNavLogo()).not.toThrow();
  });

  it('attaches mouseenter listener on desktop', () => {
    const logoAnchor = document.getElementById('navLogo') as HTMLElement;
    const spy = vi.spyOn(logoAnchor, 'addEventListener');
    initNavLogo();
    expect(spy).toHaveBeenCalledWith('mouseenter', expect.any(Function));
  });

  it('does not attach hover listener when prefersReducedMotion is true', () => {
    mockState.prefersReducedMotion = true;
    const logoAnchor = document.getElementById('navLogo') as HTMLElement;
    const spy = vi.spyOn(logoAnchor, 'addEventListener');
    initNavLogo();
    expect(spy).not.toHaveBeenCalled();
  });

  it('does not attach hover listener on touch devices', () => {
    mockState.isTouchDevice = true;
    const logoAnchor = document.getElementById('navLogo') as HTMLElement;
    const spy = vi.spyOn(logoAnchor, 'addEventListener');
    initNavLogo();
    expect(spy).not.toHaveBeenCalled();
  });

  it('does not attach listener when navLogo anchor is missing', () => {
    document.body.innerHTML = `
      <span id="navLogoText">fyniti</span>
      <span id="navLogoSuffix">://hk</span>
    `;
    expect(() => initNavLogo()).not.toThrow();
  });

  it('sets text for dracula theme', () => {
    document.documentElement.setAttribute('data-theme', 'dracula');
    initNavLogo();
    const textEl = document.getElementById('navLogoText');
    const suffixEl = document.getElementById('navLogoSuffix');
    expect(textEl?.textContent).toBe('fyniti');
    expect(suffixEl?.textContent).toBe('::hk');
  });
});

describe('updateNavLogo', () => {
  beforeEach(() => {
    mockState.isTouchDevice = false;
    mockState.prefersReducedMotion = false;
    vi.useFakeTimers();
    setupDOM();
    initNavLogo();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('does nothing when elements are not initialized', () => {
    document.body.innerHTML = '';
    initNavLogo();
    expect(() => updateNavLogo('dracula')).not.toThrow();
  });

  it('adds fade-out class to suffix on theme change', () => {
    updateNavLogo('dracula');
    const suffixEl = document.getElementById('navLogoSuffix');
    expect(suffixEl?.classList.contains('fade-out')).toBe(true);
  });

  it('updates suffix text after fade delay', () => {
    updateNavLogo('dracula');
    vi.advanceTimersByTime(150);
    const suffixEl = document.getElementById('navLogoSuffix');
    expect(suffixEl?.textContent).toBe('::hk');
  });

  it('updates logo for every theme', () => {
    for (const theme of ALL_THEMES) {
      setupDOM();
      initNavLogo();
      updateNavLogo(theme);
      vi.advanceTimersByTime(150);
      const suffixEl = document.getElementById('navLogoSuffix');
      expect(suffixEl?.textContent).toBe(themeLogos[theme].suffix);
    }
  });

  it('scramble resolves text to final value after enough time', () => {
    updateNavLogo('matrix');
    // Advance past fade delay
    vi.advanceTimersByTime(150);
    // Advance enough for scramble to resolve (6 chars * 110ms resolve + buffer)
    vi.advanceTimersByTime(2000);
    const textEl = document.getElementById('navLogoText');
    expect(textEl?.textContent).toBe('fyniti');
  });

  it('removes fade-out class after scramble completes', () => {
    updateNavLogo('bloodmoon');
    vi.advanceTimersByTime(150);
    // Enough for scramble to complete
    vi.advanceTimersByTime(2000);
    const suffixEl = document.getElementById('navLogoSuffix');
    expect(suffixEl?.classList.contains('fade-out')).toBe(false);
  });

  it('instantly updates with reduced motion', () => {
    mockState.prefersReducedMotion = true;
    updateNavLogo('synthwave');
    const textEl = document.getElementById('navLogoText');
    const suffixEl = document.getElementById('navLogoSuffix');
    expect(textEl?.textContent).toBe('fyniti');
    expect(suffixEl?.textContent).toBe('>>hk');
    expect(suffixEl?.classList.contains('fade-out')).toBe(false);
  });

  it('clears previous scramble when updating rapidly', () => {
    updateNavLogo('dracula');
    vi.advanceTimersByTime(50);
    // Switch again before first completes
    updateNavLogo('matrix');
    vi.advanceTimersByTime(150);
    vi.advanceTimersByTime(2000);
    const suffixEl = document.getElementById('navLogoSuffix');
    expect(suffixEl?.textContent).toBe('/hk');
  });
});

describe('hover scramble', () => {
  beforeEach(() => {
    mockState.isTouchDevice = false;
    mockState.prefersReducedMotion = false;
    vi.useFakeTimers();
    setupDOM();
    initNavLogo();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('triggers scramble animation on mouseenter', () => {
    const logoAnchor = document.getElementById('navLogo') as HTMLElement;
    const textEl = document.getElementById('navLogoText') as HTMLElement;
    logoAnchor.dispatchEvent(new Event('mouseenter'));
    // During scramble, text should be changing (not null)
    expect(textEl.textContent).toBeTruthy();
    // After enough time, should resolve to original
    vi.advanceTimersByTime(2000);
    expect(textEl.textContent).toBe('fyniti');
  });

  it('ignores repeated mouseenter while animating', () => {
    const logoAnchor = document.getElementById('navLogo') as HTMLElement;
    logoAnchor.dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(50);
    // Second enter during animation should be ignored
    logoAnchor.dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(2000);
    const textEl = document.getElementById('navLogoText') as HTMLElement;
    expect(textEl.textContent).toBe('fyniti');
  });
});
