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

import { destroyMagneticNav, initMagneticNav } from '../effects/magnetic-nav';

function setupDOM(): void {
  document.body.innerHTML = `
    <nav>
      <a href="#about">About</a>
      <a href="#projects">Projects</a>
    </nav>
  `;
}

describe('initMagneticNav', () => {
  beforeEach(() => {
    mockState.isTouchDevice = false;
    mockState.prefersReducedMotion = false;
    setupDOM();
  });

  afterEach(() => {
    destroyMagneticNav();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('attaches mousemove listener to document', () => {
    const spy = vi.spyOn(document, 'addEventListener');
    initMagneticNav();
    expect(spy).toHaveBeenCalledWith('mousemove', expect.any(Function));
  });

  it('does not double-initialize', () => {
    const spy = vi.spyOn(document, 'addEventListener');
    initMagneticNav();
    initMagneticNav();
    // Only one mousemove listener added
    const mousemoveCalls = spy.mock.calls.filter((c) => c[0] === 'mousemove');
    expect(mousemoveCalls).toHaveLength(1);
  });

  it('does nothing when no nav element exists', () => {
    document.body.innerHTML = '';
    const spy = vi.spyOn(document, 'addEventListener');
    initMagneticNav();
    const mousemoveCalls = spy.mock.calls.filter((c) => c[0] === 'mousemove');
    expect(mousemoveCalls).toHaveLength(0);
  });

  it('does nothing when nav has no anchors', () => {
    document.body.innerHTML = '<nav></nav>';
    const spy = vi.spyOn(document, 'addEventListener');
    initMagneticNav();
    const mousemoveCalls = spy.mock.calls.filter((c) => c[0] === 'mousemove');
    expect(mousemoveCalls).toHaveLength(0);
  });

  it('skips setup on touch devices', () => {
    mockState.isTouchDevice = true;
    const spy = vi.spyOn(document, 'addEventListener');
    initMagneticNav();
    const mousemoveCalls = spy.mock.calls.filter((c) => c[0] === 'mousemove');
    expect(mousemoveCalls).toHaveLength(0);
  });

  it('skips setup when reduced motion is preferred', () => {
    mockState.prefersReducedMotion = true;
    const spy = vi.spyOn(document, 'addEventListener');
    initMagneticNav();
    const mousemoveCalls = spy.mock.calls.filter((c) => c[0] === 'mousemove');
    expect(mousemoveCalls).toHaveLength(0);
  });

  it('applies transform when mouse is within radius', () => {
    initMagneticNav();
    const link = document.querySelector('nav a') as HTMLAnchorElement;

    // Mock getBoundingClientRect to place link center at (100, 50)
    vi.spyOn(link, 'getBoundingClientRect').mockReturnValue({
      left: 50,
      top: 25,
      width: 100,
      height: 50,
      right: 150,
      bottom: 75,
      x: 50,
      y: 25,
      toJSON: () => {},
    });

    // Mouse at (120, 60) — distance from center (100, 50) is ~22px, within 60px radius
    const event = new MouseEvent('mousemove', {
      clientX: 120,
      clientY: 60,
      bubbles: true,
    });
    document.dispatchEvent(event);

    expect(link.style.transform).toContain('translate(');
    expect(link.style.transform).toContain('px');
  });

  it('resets transform when mouse is outside radius', () => {
    initMagneticNav();
    const link = document.querySelector('nav a') as HTMLAnchorElement;

    vi.spyOn(link, 'getBoundingClientRect').mockReturnValue({
      left: 50,
      top: 25,
      width: 100,
      height: 50,
      right: 150,
      bottom: 75,
      x: 50,
      y: 25,
      toJSON: () => {},
    });

    // Mouse at (300, 300) — far outside radius
    const event = new MouseEvent('mousemove', {
      clientX: 300,
      clientY: 300,
      bubbles: true,
    });
    document.dispatchEvent(event);

    expect(link.style.transform).toBe('');
  });
});

describe('destroyMagneticNav', () => {
  beforeEach(() => {
    mockState.isTouchDevice = false;
    mockState.prefersReducedMotion = false;
    setupDOM();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('removes mousemove listener and resets styles', () => {
    const spy = vi.spyOn(document, 'removeEventListener');
    initMagneticNav();
    destroyMagneticNav();
    expect(spy).toHaveBeenCalledWith('mousemove', expect.any(Function));
  });

  it('clears transform and transition on links', () => {
    initMagneticNav();
    const link = document.querySelector('nav a') as HTMLAnchorElement;
    link.style.transform = 'translate(5px, 5px)';
    destroyMagneticNav();
    expect(link.style.transform).toBe('');
    expect(link.style.transition).toBe('');
  });

  it('allows re-initialization after destroy', () => {
    initMagneticNav();
    destroyMagneticNav();
    const spy = vi.spyOn(document, 'addEventListener');
    initMagneticNav();
    const mousemoveCalls = spy.mock.calls.filter((c) => c[0] === 'mousemove');
    expect(mousemoveCalls).toHaveLength(1);
  });
});
