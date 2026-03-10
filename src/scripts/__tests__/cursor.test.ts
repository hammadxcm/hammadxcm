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
  getThemeConfig: () => ({ hasCursor: 'crosshair' }),
}));

describe('cursor', () => {
  beforeEach(() => {
    vi.resetModules();
    mockState.isTouchDevice = false;
    mockState.prefersReducedMotion = false;
    document.body.innerHTML = '<div id="crosshairCursor"></div><div id="cursorTrail"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing without cursor element', async () => {
    document.body.innerHTML = '';
    const { initCursor } = await import('../effects/cursor');
    expect(() => initCursor()).not.toThrow();
  });

  it('skips on touch devices', async () => {
    mockState.isTouchDevice = true;
    const { initCursor } = await import('../effects/cursor');
    initCursor();
    // Should not throw
  });

  it('destroyCursor does not throw when not initialized', async () => {
    const { destroyCursor } = await import('../effects/cursor');
    expect(() => destroyCursor()).not.toThrow();
  });
});
