/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = { isTouchDevice: false, prefersReducedMotion: false };
vi.mock('../state', () => ({
  get isTouchDevice() {
    return mockState.isTouchDevice;
  },
  get prefersReducedMotion() {
    return mockState.prefersReducedMotion;
  },
}));
vi.mock('../theme-config', () => ({
  getThemeConfig: () => ({ screenEffect: 'glitch' }),
  getThemeToasts: () => ['Toast 1', 'Toast 2'],
}));
vi.mock('./toast', () => ({ spawnToast: vi.fn() }));

import { initScreenEffects } from '../effects/screen-effects';

describe('initScreenEffects', () => {
  beforeEach(() => {
    mockState.prefersReducedMotion = false;
    document.body.innerHTML = '<div id="screenEffectOverlay"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('skips on reduced motion', () => {
    mockState.prefersReducedMotion = true;
    expect(() => initScreenEffects()).not.toThrow();
  });

  it('initializes without error', () => {
    expect(() => initScreenEffects()).not.toThrow();
  });

  it('works without overlay element', () => {
    document.body.innerHTML = '';
    expect(() => initScreenEffects()).not.toThrow();
  });
});
