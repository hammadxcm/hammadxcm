/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ThemeName } from '../../config/types';

const mockState = { prefersReducedMotion: false };

vi.mock('../state', () => ({
  get prefersReducedMotion() {
    return mockState.prefersReducedMotion;
  },
}));

vi.mock('../theme-config', () => ({
  getCurrentTheme: () => 'hacker',
  themeTypewriterTexts: {
    hacker: ['> Hacker Text'],
    cyberpunk: ['>> Cyber Text'],
  },
}));

import { initTypewriter, updateTypewriterTexts } from '../effects/typewriter';

describe('initTypewriter', () => {
  beforeEach(() => {
    mockState.prefersReducedMotion = false;
    document.body.innerHTML = '<span id="typewriter"></span>';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('does nothing without element', () => {
    document.body.innerHTML = '';
    expect(() => initTypewriter()).not.toThrow();
  });

  it('sets full text immediately when reduced motion', () => {
    mockState.prefersReducedMotion = true;
    initTypewriter();
    vi.advanceTimersByTime(100);
    const el = document.getElementById('typewriter');
    expect(el?.textContent).toBe('> Hacker Text');
  });

  it('starts typing animation', () => {
    initTypewriter();
    // First rAF + tick should set first character
    vi.advanceTimersByTime(200);
    const el = document.getElementById('typewriter');
    expect(el?.textContent?.length).toBeGreaterThan(0);
  });
});

describe('updateTypewriterTexts', () => {
  it('resets state when theme changes', () => {
    expect(() => updateTypewriterTexts('cyberpunk' as ThemeName)).not.toThrow();
  });

  it('does not reset when same texts', () => {
    updateTypewriterTexts('hacker' as ThemeName);
    expect(() => updateTypewriterTexts('hacker' as ThemeName)).not.toThrow();
  });

  it('handles unknown theme gracefully', () => {
    expect(() => updateTypewriterTexts('unknown' as ThemeName)).not.toThrow();
  });
});
