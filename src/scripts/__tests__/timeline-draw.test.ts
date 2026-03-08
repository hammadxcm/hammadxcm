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

import { destroyTimelineDraw, initTimelineDraw } from '../effects/timeline-draw';

describe('timeline-draw', () => {
  beforeEach(() => {
    mockState.prefersReducedMotion = false;
    document.body.innerHTML = '';
    // Default to desktop viewport so SVG gets created
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    destroyTimelineDraw();
  });

  afterEach(() => {
    destroyTimelineDraw();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('does nothing when .timeline is missing', () => {
    expect(() => initTimelineDraw()).not.toThrow();
    expect(document.querySelector('svg')).toBeNull();
  });

  it('creates an SVG path when .timeline exists', () => {
    document.body.innerHTML = '<div class="timeline" style="height:500px"></div>';
    initTimelineDraw();
    const svg = document.querySelector('.timeline svg');
    expect(svg).not.toBeNull();
    const path = svg?.querySelector('path');
    expect(path).not.toBeNull();
  });

  it('init guard prevents double init', () => {
    document.body.innerHTML = '<div class="timeline" style="height:500px"></div>';
    initTimelineDraw();
    initTimelineDraw();
    const svgs = document.querySelectorAll('.timeline svg');
    expect(svgs.length).toBe(1);
  });

  it('destroy removes SVG and resets state', () => {
    document.body.innerHTML = '<div class="timeline" style="height:500px"></div>';
    initTimelineDraw();
    expect(document.querySelector('.timeline svg')).not.toBeNull();

    destroyTimelineDraw();
    expect(document.querySelector('.timeline svg')).toBeNull();

    // Can re-init after destroy
    document.body.innerHTML = '<div class="timeline" style="height:500px"></div>';
    initTimelineDraw();
    expect(document.querySelector('.timeline svg')).not.toBeNull();
  });

  it('reduced motion shows full path immediately (dashoffset = 0)', () => {
    mockState.prefersReducedMotion = true;
    document.body.innerHTML = '<div class="timeline" style="height:500px"></div>';
    initTimelineDraw();
    const path = document.querySelector('.timeline svg path') as SVGPathElement;
    expect(path).not.toBeNull();
    expect(path.style.strokeDashoffset).toBe('0');
  });

  it('skips SVG creation on mobile', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    document.body.innerHTML = '<div class="timeline" style="height:500px"></div>';
    initTimelineDraw();
    expect(document.querySelector('.timeline svg')).toBeNull();
  });

  it('sets dashoffset based on --timeline-progress on scroll', () => {
    document.body.innerHTML = '<div class="timeline" style="height:500px"></div>';
    const timeline = document.querySelector<HTMLElement>('.timeline');
    if (!timeline) throw new Error('timeline not found');
    timeline.style.setProperty('--timeline-progress', '0.5');

    initTimelineDraw();

    // Trigger scroll
    window.dispatchEvent(new Event('scroll'));

    // The path should exist with non-zero dasharray
    const path = document.querySelector('.timeline svg path') as SVGPathElement;
    expect(path).not.toBeNull();
    expect(path.style.strokeDasharray).toBeTruthy();
  });
});
