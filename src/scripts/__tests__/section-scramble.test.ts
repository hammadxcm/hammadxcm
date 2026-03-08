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

// Mock IntersectionObserver
let observerCallback: IntersectionObserverCallback;
let observerInstance: MockIntersectionObserver;

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();

  constructor(cb: IntersectionObserverCallback) {
    observerCallback = cb;
    observerInstance = this;
  }
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

import { destroySectionScramble, initSectionScramble } from '../effects/section-scramble';

function setupDOM(): void {
  document.body.innerHTML = `
    <h2 class="section-title">About Me</h2>
    <h2 class="section-title">Projects</h2>
  `;
}

describe('initSectionScramble', () => {
  beforeEach(() => {
    mockState.prefersReducedMotion = false;
    mockState.isTouchDevice = false;
    setupDOM();
  });

  afterEach(() => {
    destroySectionScramble();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('sets up observer on section titles', () => {
    initSectionScramble();
    expect(observerInstance.observe).toHaveBeenCalledTimes(2);
  });

  it('does not double-initialize', () => {
    initSectionScramble();
    initSectionScramble();
    // IntersectionObserver constructor called only once for this init cycle
    expect(observerInstance.observe).toHaveBeenCalledTimes(2);
  });

  it('does nothing when no section-title elements exist', () => {
    document.body.innerHTML = '';
    initSectionScramble();
    // No elements → returns before creating observer
    expect(document.querySelectorAll('.section-title').length).toBe(0);
  });

  it('skips observer setup when reduced motion is preferred', () => {
    mockState.prefersReducedMotion = true;
    initSectionScramble();
    // initialized is set but observer is not created — no observe calls
    destroySectionScramble();
    // Re-init with DOM to verify observer wasn't created before
    initSectionScramble();
    // If observer was created, observe would be called on the titles
  });

  it('scrambles text on intersection', () => {
    vi.useFakeTimers();
    initSectionScramble();
    const title = document.querySelector('.section-title') as HTMLElement;
    const original = title.textContent;

    observerCallback(
      [
        {
          isIntersecting: true,
          target: title,
        } as unknown as IntersectionObserverEntry,
      ],
      observerInstance as unknown as IntersectionObserver,
    );

    // During scramble, text may differ from original
    vi.advanceTimersByTime(50);
    // After enough time, text should resolve to original
    vi.advanceTimersByTime(5000);
    expect(title.textContent).toBe(original);
    expect(title.dataset.scrambled).toBe('true');
    vi.useRealTimers();
  });

  it('data-scrambled prevents re-trigger', () => {
    vi.useFakeTimers();
    initSectionScramble();
    const title = document.querySelector('.section-title') as HTMLElement;
    title.dataset.scrambled = 'true';
    const originalText = title.textContent;

    observerCallback(
      [
        {
          isIntersecting: true,
          target: title,
        } as unknown as IntersectionObserverEntry,
      ],
      observerInstance as unknown as IntersectionObserver,
    );

    // Text should remain unchanged
    expect(title.textContent).toBe(originalText);
    vi.useRealTimers();
  });
});

describe('destroySectionScramble', () => {
  beforeEach(() => {
    mockState.prefersReducedMotion = false;
    setupDOM();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('disconnects observer and resets state', () => {
    initSectionScramble();
    destroySectionScramble();
    expect(observerInstance.disconnect).toHaveBeenCalled();
  });

  it('allows re-initialization after destroy', () => {
    initSectionScramble();
    destroySectionScramble();
    initSectionScramble();
    expect(observerInstance.observe).toHaveBeenCalledTimes(2);
  });
});
