/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = { isTouchDevice: false, prefersReducedMotion: false };
vi.mock('../state', () => ({
  get isTouchDevice() { return mockState.isTouchDevice; },
  get prefersReducedMotion() { return mockState.prefersReducedMotion; },
  isPageVisible: () => true,
  onVisibilityChange: () => () => {},
}));
vi.mock('../theme-config', () => ({
  getCurrentTheme: () => 'hacker',
  getThemeConfig: () => ({
    heroGlyphs: '!@#$%',
    heroTiming: { flicker: 30, resolve: 50 },
  }),
}));

describe('hero-name', () => {
  beforeEach(() => {
    vi.resetModules();
    mockState.isTouchDevice = false;
    mockState.prefersReducedMotion = false;
    document.body.innerHTML = '<div id="hero-name"><span class="hero-name-inner">Test</span></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing without hero-name element', async () => {
    document.body.innerHTML = '';
    const { initHeroName } = await import('../effects/hero-name');
    expect(() => initHeroName()).not.toThrow();
  });

  it('skips on touch devices', async () => {
    mockState.isTouchDevice = true;
    const { initHeroName } = await import('../effects/hero-name');
    expect(() => initHeroName()).not.toThrow();
  });

  it('initializes without error', async () => {
    const { initHeroName } = await import('../effects/hero-name');
    expect(() => initHeroName()).not.toThrow();
  });
});
