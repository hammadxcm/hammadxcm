/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = { prefersReducedMotion: false };
vi.mock('../state', () => ({
  get prefersReducedMotion() { return mockState.prefersReducedMotion; },
}));
vi.mock('../achievements', () => ({ trackEvent: vi.fn() }));
vi.mock('../effects/toast', () => ({ spawnToast: vi.fn() }));

import { initKonami } from '../interactions/konami';

describe('initKonami', () => {
  beforeEach(() => {
    mockState.prefersReducedMotion = false;
    document.body.innerHTML = '<div id="konamiOverlay"></div>';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('skips on reduced motion', () => {
    mockState.prefersReducedMotion = true;
    expect(() => initKonami()).not.toThrow();
  });

  it('does nothing without overlay', () => {
    document.body.innerHTML = '';
    expect(() => initKonami()).not.toThrow();
  });

  it('activates overlay on full konami code', () => {
    initKonami();
    const keys = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    for (const key of keys) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key }));
    }
    expect(document.getElementById('konamiOverlay')!.classList.contains('active')).toBe(true);
  });
});
