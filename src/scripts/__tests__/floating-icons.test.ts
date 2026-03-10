/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = { prefersReducedMotion: false };
vi.mock('../state', () => ({
  get prefersReducedMotion() {
    return mockState.prefersReducedMotion;
  },
}));

import { initFloatingIcons } from '../interactions/floating-icons';

describe('initFloatingIcons', () => {
  beforeEach(() => {
    mockState.prefersReducedMotion = false;
    document.body.innerHTML = '<div class="tech-icon">JS</div><div class="tech-icon">TS</div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('applies animation to tech icons', () => {
    initFloatingIcons();
    const icon = document.querySelector('.tech-icon') as HTMLElement;
    expect(icon.style.animation).toContain('techFloat');
  });

  it('skips on reduced motion', () => {
    mockState.prefersReducedMotion = true;
    initFloatingIcons();
    const icon = document.querySelector('.tech-icon') as HTMLElement;
    expect(icon.style.animation).toBe('');
  });
});
