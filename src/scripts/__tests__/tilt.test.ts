/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = { prefersReducedMotion: false };
vi.mock('../state', () => ({
  get prefersReducedMotion() { return mockState.prefersReducedMotion; },
}));

import { initTilt } from '../interactions/tilt';

describe('initTilt', () => {
  beforeEach(() => {
    mockState.prefersReducedMotion = false;
    document.body.innerHTML = '<div data-tilt style="width:200px;height:200px;"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('skips on reduced motion', () => {
    mockState.prefersReducedMotion = true;
    initTilt();
    const card = document.querySelector('[data-tilt]') as HTMLElement;
    expect(card.style.transform).toBe('');
  });

  it('applies transform on mousemove', () => {
    initTilt();
    const card = document.querySelector('[data-tilt]') as HTMLElement;
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 200, height: 200, right: 200, bottom: 200, x: 0, y: 0, toJSON: () => {},
    });
    card.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
    expect(card.style.transform).toContain('perspective');
  });

  it('resets transform on mouseleave', () => {
    initTilt();
    const card = document.querySelector('[data-tilt]') as HTMLElement;
    card.style.transform = 'perspective(1000px) rotateX(5deg)';
    card.dispatchEvent(new MouseEvent('mouseleave'));
    expect(card.style.transform).toBe('');
  });
});
