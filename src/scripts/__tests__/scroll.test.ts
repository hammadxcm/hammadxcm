/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../achievements', () => ({
  trackEvent: vi.fn(),
  getProgress: () => ({ scrollDistance: 0 }),
}));
vi.mock('../state', () => ({ prefersReducedMotion: false }));
vi.mock('../theme-config', () => ({
  getThemeConfig: () => ({ navBg: 'rgba(0,0,0,' }),
}));

import { initScrollHandler } from '../interactions/scroll';

describe('initScrollHandler', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="hero-content"></div>
      <div class="scroll-indicator"></div>
      <nav>Nav</nav>
      <div id="scrollProgress" style="width:0%"></div>
      <div class="timeline"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does not throw without elements', () => {
    document.body.innerHTML = '';
    expect(() => initScrollHandler()).not.toThrow();
  });

  it('attaches scroll listener', () => {
    const spy = vi.spyOn(window, 'addEventListener');
    initScrollHandler();
    expect(spy).toHaveBeenCalledWith('scroll', expect.any(Function));
    spy.mockRestore();
  });

  it('initializes without hero elements', () => {
    document.body.innerHTML = '<nav>Nav</nav>';
    expect(() => initScrollHandler()).not.toThrow();
  });

  it('handles scroll event without error', () => {
    initScrollHandler();
    window.dispatchEvent(new Event('scroll'));
    // No throw means success
  });

  it('sets up with all optional elements present', () => {
    expect(() => initScrollHandler()).not.toThrow();
  });
});
