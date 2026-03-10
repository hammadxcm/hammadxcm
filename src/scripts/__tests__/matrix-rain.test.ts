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
  isHeroVisible: () => true,
  isPageVisible: () => true,
}));
vi.mock('../theme-config', () => ({
  getCurrentTheme: () => 'hacker',
  getThemeConfig: () => ({ matrixColor: '#00ff41' }),
}));

describe('matrix-rain', () => {
  beforeEach(() => {
    vi.resetModules();
    mockState.isTouchDevice = false;
    mockState.prefersReducedMotion = false;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing without canvas element', async () => {
    const { initMatrixRain } = await import('../effects/matrix-rain');
    expect(() => initMatrixRain()).not.toThrow();
  });

  it('skips on touch devices', async () => {
    mockState.isTouchDevice = true;
    const { initMatrixRain } = await import('../effects/matrix-rain');
    expect(() => initMatrixRain()).not.toThrow();
  });

  it('destroyMatrixRain is safe when not initialized', async () => {
    const { destroyMatrixRain } = await import('../effects/matrix-rain');
    expect(() => destroyMatrixRain()).not.toThrow();
  });
});
