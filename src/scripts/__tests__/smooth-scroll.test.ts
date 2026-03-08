/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = { prefersReducedMotion: false };
vi.mock('../state', () => ({
  get prefersReducedMotion() { return mockState.prefersReducedMotion; },
}));

import { initSmoothScroll } from '../interactions/smooth-scroll';

describe('initSmoothScroll', () => {
  beforeEach(() => {
    mockState.prefersReducedMotion = false;
    document.body.innerHTML = `
      <a href="#target">Go</a>
      <section id="target" style="margin-top:1000px;">Target</section>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('skips on reduced motion', () => {
    mockState.prefersReducedMotion = true;
    expect(() => initSmoothScroll()).not.toThrow();
  });

  it('sets scroll-behavior to auto', () => {
    initSmoothScroll();
    expect(document.documentElement.style.scrollBehavior).toBe('auto');
  });

  it('prevents default on anchor click', () => {
    initSmoothScroll();
    const anchor = document.querySelector('a') as HTMLAnchorElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    vi.spyOn(event, 'preventDefault');
    anchor.dispatchEvent(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
