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
  isPageVisible: () => true,
  onVisibilityChange: () => () => {},
}));
vi.mock('../theme-config', () => ({
  getThemeConfig: () => ({ hasHackerLog: true }),
}));

import { initHackerLog } from '../effects/hacker-log';

describe('initHackerLog', () => {
  beforeEach(() => {
    mockState.isTouchDevice = false;
    mockState.prefersReducedMotion = false;
    document.body.innerHTML = '<div id="hackerLog"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing without hackerLog element', () => {
    document.body.innerHTML = '';
    expect(() => initHackerLog()).not.toThrow();
  });

  it('skips on touch devices', () => {
    mockState.isTouchDevice = true;
    expect(() => initHackerLog()).not.toThrow();
  });

  it('skips on reduced motion', () => {
    mockState.prefersReducedMotion = true;
    expect(() => initHackerLog()).not.toThrow();
  });
});
