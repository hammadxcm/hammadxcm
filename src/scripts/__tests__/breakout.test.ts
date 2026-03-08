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

const mockCtx = {
  clearRect: vi.fn(),
  fillText: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  roundRect: vi.fn(),
  font: '',
  fillStyle: '',
};

vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
  mockCtx as unknown as CanvasRenderingContext2D,
);

import { destroyBreakout, initBreakout } from '../games/breakout';

describe('breakout', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      mockCtx as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (prop: string) => {
        const map: Record<string, string> = {
          '--accent': '#5bcdec',
          '--accent-blue': '#58a6ff',
          '--accent-mint': '#3fb950',
          '--accent-tertiary': '#ff6b6b',
        };
        return map[prop] || '';
      },
    } as unknown as CSSStyleDeclaration);
  });

  afterEach(() => {
    destroyBreakout();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('initializes without error', () => {
    expect(() => initBreakout()).not.toThrow();
  });

  it('does not double-initialize', () => {
    initBreakout();
    initBreakout();
    // No crash
  });

  it('triggers game on "break" key sequence', () => {
    initBreakout();
    for (const key of ['b', 'r', 'e', 'a', 'k']) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    }
    const overlay = document.querySelector('.breakout-overlay');
    expect(overlay).toBeTruthy();
  });

  it('does not trigger on wrong sequence', () => {
    initBreakout();
    for (const key of ['b', 'r', 'e', 'a', 'x']) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    }
    const overlay = document.querySelector('.breakout-overlay.active');
    expect(overlay).toBeNull();
  });

  it('closes game on close button click', () => {
    initBreakout();
    // Trigger game
    for (const key of ['b', 'r', 'e', 'a', 'k']) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    }
    // Close with close button
    const closeBtn = document.getElementById('breakoutClose');
    closeBtn?.click();
    const overlay = document.querySelector('.breakout-overlay.active');
    expect(overlay).toBeNull();
  });

  it('destroys cleanly', () => {
    initBreakout();
    destroyBreakout();
    const overlay = document.querySelector('.breakout-overlay');
    expect(overlay).toBeNull();
  });

  it('allows re-init after destroy', () => {
    initBreakout();
    destroyBreakout();
    expect(() => initBreakout()).not.toThrow();
  });

  it('dispatches achievement on game trigger', () => {
    initBreakout();
    const events: string[] = [];
    const listener = (e: Event) => {
      if (e instanceof CustomEvent && e.type === 'achievement-trigger') {
        events.push(e.detail as string);
      }
    };
    window.addEventListener('achievement-trigger', listener);
    for (const key of ['b', 'r', 'e', 'a', 'k']) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    }
    window.removeEventListener('achievement-trigger', listener);
    expect(events).toContain('breakout_found');
  });
});
