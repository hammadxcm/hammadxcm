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

import { destroySpotlight, initSpotlight } from '../effects/spotlight';

function setupDOM(): void {
  document.body.innerHTML = `
    <div class="glass" style="width:200px;height:200px;"></div>
    <div class="glass" style="width:200px;height:200px;"></div>
  `;
}

describe('initSpotlight', () => {
  beforeEach(() => {
    mockState.isTouchDevice = false;
    mockState.prefersReducedMotion = false;
    setupDOM();
  });

  afterEach(() => {
    destroySpotlight();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('attaches mousemove listeners to glass elements', () => {
    const glass = document.querySelector('.glass') as HTMLElement;
    const spy = vi.spyOn(glass, 'addEventListener');
    initSpotlight();
    expect(spy).toHaveBeenCalledWith('mousemove', expect.any(Function));
  });

  it('does not double-initialize', () => {
    const glass = document.querySelector('.glass') as HTMLElement;
    const spy = vi.spyOn(glass, 'addEventListener');
    initSpotlight();
    initSpotlight();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does nothing when no glass elements exist', () => {
    document.body.innerHTML = '';
    expect(() => initSpotlight()).not.toThrow();
  });

  it('skips setup on touch devices', () => {
    mockState.isTouchDevice = true;
    const glass = document.querySelector('.glass') as HTMLElement;
    const spy = vi.spyOn(glass, 'addEventListener');
    initSpotlight();
    expect(spy).not.toHaveBeenCalled();
  });

  it('sets CSS vars on mousemove', () => {
    initSpotlight();
    const glass = document.querySelector('.glass') as HTMLElement;

    // Mock getBoundingClientRect
    vi.spyOn(glass, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      top: 20,
      width: 200,
      height: 200,
      right: 210,
      bottom: 220,
      x: 10,
      y: 20,
      toJSON: () => {},
    });

    const event = new MouseEvent('mousemove', {
      clientX: 60,
      clientY: 70,
      bubbles: true,
    });
    glass.dispatchEvent(event);

    expect(glass.style.getPropertyValue('--spotlight-x')).toBe('50px');
    expect(glass.style.getPropertyValue('--spotlight-y')).toBe('50px');
  });
});

describe('destroySpotlight', () => {
  beforeEach(() => {
    mockState.isTouchDevice = false;
    setupDOM();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('removes event listeners', () => {
    const glass = document.querySelector('.glass') as HTMLElement;
    const spy = vi.spyOn(glass, 'removeEventListener');
    initSpotlight();
    destroySpotlight();
    expect(spy).toHaveBeenCalledWith('mousemove', expect.any(Function));
  });

  it('allows re-initialization after destroy', () => {
    initSpotlight();
    destroySpotlight();
    const glass = document.querySelector('.glass') as HTMLElement;
    const spy = vi.spyOn(glass, 'addEventListener');
    initSpotlight();
    expect(spy).toHaveBeenCalledWith('mousemove', expect.any(Function));
  });
});
