/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  getCurrentTheme: () => 'hacker',
  setCurrentTheme: () => {},
  isHeroVisible: () => true,
  setHeroVisible: () => {},
  onVisibilityChange: () => () => {},
}));

import { destroyContribution3d, initContribution3d } from '../effects/contribution-3d';

function setupDOM(): void {
  document.body.innerHTML = '<div id="contribution3d"></div>';
}

describe('contribution heatmap', () => {
  beforeEach(() => {
    mockState.prefersReducedMotion = false;
    setupDOM();
  });

  afterEach(() => {
    destroyContribution3d();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('initializes without error', () => {
    expect(() => initContribution3d()).not.toThrow();
  });

  it('does not double-initialize', () => {
    initContribution3d();
    initContribution3d();
    const wrappers = document.querySelectorAll('.contrib-heatmap');
    expect(wrappers.length).toBeLessThanOrEqual(1);
  });

  it('does nothing when target is missing', () => {
    document.body.innerHTML = '';
    expect(() => initContribution3d()).not.toThrow();
  });

  it('creates heatmap with 364 cells', () => {
    initContribution3d();
    const cells = document.querySelectorAll('.contrib-heatmap-cell');
    // 52*7 = 364 grid cells + 5 legend cells = 369
    expect(cells.length).toBe(364 + 5);
  });

  it('creates header with title and count', () => {
    initContribution3d();
    const title = document.querySelector('.contrib-heatmap-title');
    const count = document.querySelector('.contrib-heatmap-count');
    expect(title?.textContent).toBe('365 days of code');
    expect(count?.textContent).toContain('contributions');
  });

  it('creates legend with less/more labels', () => {
    initContribution3d();
    const legend = document.querySelector('.contrib-heatmap-legend');
    expect(legend?.textContent).toContain('Less');
    expect(legend?.textContent).toContain('More');
  });

  it('creates month labels', () => {
    initContribution3d();
    const months = document.querySelector('.contrib-heatmap-months');
    expect(months?.textContent).toContain('Jan');
    expect(months?.textContent).toContain('Dec');
  });

  it('destroys cleanly', () => {
    initContribution3d();
    destroyContribution3d();
    const wrappers = document.querySelectorAll('.contrib-heatmap');
    expect(wrappers.length).toBe(0);
  });

  it('allows re-init after destroy', () => {
    initContribution3d();
    destroyContribution3d();
    setupDOM();
    expect(() => initContribution3d()).not.toThrow();
  });
});
