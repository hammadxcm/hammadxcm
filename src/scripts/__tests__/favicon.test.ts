/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = {
  isTouchDevice: false,
  prefersReducedMotion: false,
};

let visibilityCallback: ((visible: boolean) => void) | null = null;
const removeVisibilityListener = vi.fn();

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
  onVisibilityChange: (fn: (visible: boolean) => void) => {
    visibilityCallback = fn;
    return removeVisibilityListener;
  },
}));

vi.mock('../theme-config', () => ({
  getThemeConfig: () => ({
    hasCRT: true,
    canvasEffect: 'particles',
    hasMatrixRain: false,
    screenEffect: 'glitch',
    hasHackerLog: true,
    hasCursor: 'crosshair',
    particleColor: 'rgba(91, 205, 236, ',
    bootBg: '#0a0e14',
    navBg: 'transparent',
    heroGlyphs: 'ABC',
    heroTiming: { flicker: 50, resolve: 90 },
  }),
}));

const mockCtx = {
  clearRect: vi.fn(),
  fillText: vi.fn(),
  fillRect: vi.fn(),
  set font(_v: string) {},
  set fillStyle(_v: string) {},
  set textAlign(_v: string) {},
  set textBaseline(_v: string) {},
};

vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
  mockCtx as unknown as CanvasRenderingContext2D,
);

import { destroyFavicon, initFavicon } from '../effects/favicon';

describe('initFavicon', () => {
  beforeEach(() => {
    mockState.prefersReducedMotion = false;
    mockState.isTouchDevice = false;
    visibilityCallback = null;
    vi.useFakeTimers();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      mockCtx as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => '#5bcdec',
    } as unknown as CSSStyleDeclaration);
  });

  afterEach(() => {
    destroyFavicon();
    vi.useRealTimers();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('creates a link[rel=icon] if none exists', () => {
    initFavicon();
    const link = document.querySelector('link[rel="icon"]');
    expect(link).toBeTruthy();
  });

  it('draws initial favicon on canvas', () => {
    initFavicon();
    expect(mockCtx.clearRect).toHaveBeenCalled();
    expect(mockCtx.fillText).toHaveBeenCalledWith('>', 10, 16);
    expect(mockCtx.fillRect).toHaveBeenCalledWith(22, 6, 3, 20);
  });

  it('does not double-initialize', () => {
    initFavicon();
    const callCount = mockCtx.clearRect.mock.calls.length;
    initFavicon();
    // No additional draws from second init
    expect(mockCtx.clearRect.mock.calls.length).toBe(callCount);
  });

  it('starts blinking on CRT theme', () => {
    initFavicon();
    // Initial draw is 1 call. Blink uses window.setInterval.
    mockCtx.clearRect.mockClear();
    vi.advanceTimersByTime(1100);
    // Should have drawn at least once from the blink interval
    expect(mockCtx.clearRect.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it('does not blink with reduced motion', () => {
    mockState.prefersReducedMotion = true;
    initFavicon();
    const initialCalls = mockCtx.clearRect.mock.calls.length;
    vi.advanceTimersByTime(2000);
    // No additional draws — static favicon only
    expect(mockCtx.clearRect.mock.calls.length).toBe(initialCalls);
  });

  it('pauses blink when page becomes hidden', () => {
    initFavicon();
    expect(visibilityCallback).toBeTruthy();

    // Simulate page hidden
    visibilityCallback?.(false);
    const callsAfterHide = mockCtx.clearRect.mock.calls.length;
    vi.advanceTimersByTime(2000);
    // No new draws while hidden
    expect(mockCtx.clearRect.mock.calls.length).toBe(callsAfterHide);
  });

  it('resumes blink when page becomes visible again', () => {
    initFavicon();
    visibilityCallback?.(false);
    mockCtx.clearRect.mockClear();

    visibilityCallback?.(true);
    vi.advanceTimersByTime(1100);
    expect(mockCtx.clearRect.mock.calls.length).toBeGreaterThanOrEqual(1);
  });
});

describe('destroyFavicon', () => {
  beforeEach(() => {
    mockState.prefersReducedMotion = false;
    vi.useFakeTimers();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      mockCtx as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => '#5bcdec',
    } as unknown as CSSStyleDeclaration);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('stops blink interval and cleans up', () => {
    initFavicon();
    destroyFavicon();
    const callsAfterDestroy = mockCtx.clearRect.mock.calls.length;
    vi.advanceTimersByTime(2000);
    expect(mockCtx.clearRect.mock.calls.length).toBe(callsAfterDestroy);
  });

  it('removes visibility listener', () => {
    initFavicon();
    destroyFavicon();
    expect(removeVisibilityListener).toHaveBeenCalled();
  });

  it('allows re-initialization after destroy', () => {
    initFavicon();
    destroyFavicon();
    initFavicon();
    expect(mockCtx.clearRect.mock.calls.length).toBeGreaterThan(0);
  });
});
