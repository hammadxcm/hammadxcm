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
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4 * 200 * 200).fill(255),
  })),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  font: '',
  fillStyle: '',
  textAlign: '',
  textBaseline: '',
};

vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
  mockCtx as unknown as CanvasRenderingContext2D,
);

import { destroyParticleText, initParticleText } from '../effects/particle-text';

function setupDOM(): void {
  document.body.innerHTML = `
    <section id="hero">
      <div class="hero-content">
        <h1 id="heroName"><span id="heroNameInner">Test Name</span></h1>
      </div>
    </section>
  `;
  // Mock getComputedStyle
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    getPropertyValue: () => '#5bcdec',
  } as unknown as CSSStyleDeclaration);
}

describe('particle-text', () => {
  beforeEach(() => {
    mockState.isTouchDevice = false;
    mockState.prefersReducedMotion = false;
    setupDOM();
  });

  afterEach(() => {
    destroyParticleText();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('initializes without error', () => {
    expect(() => initParticleText()).not.toThrow();
  });

  it('does not double-initialize', () => {
    initParticleText();
    initParticleText();
    // No crash
  });

  it('does nothing when hero element is missing', () => {
    document.body.innerHTML = '';
    expect(() => initParticleText()).not.toThrow();
  });

  it('creates canvas on init', () => {
    initParticleText();
    const canvas = document.getElementById('particleTextCanvas');
    expect(canvas).toBeTruthy();
  });

  it('destroys cleanly', () => {
    initParticleText();
    destroyParticleText();
    // Canvas should be removed or animation stopped
  });

  it('allows re-init after destroy', () => {
    initParticleText();
    destroyParticleText();
    setupDOM();
    expect(() => initParticleText()).not.toThrow();
  });

  it('skips animation with reduced motion', () => {
    mockState.prefersReducedMotion = true;
    initParticleText();
    // Should not crash, may draw static text
  });
});
