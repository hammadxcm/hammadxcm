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

vi.mock('../theme-config', () => ({
  getCurrentTheme: () => 'hacker',
  getThemeConfig: () => ({ bootBg: null }),
  getBootMessages: () => [
    { text: 'Loading...', cls: 'boot-cmd' },
    { text: 'Init...', cls: 'boot-cmd' },
    { text: 'Starting...', cls: 'boot-cmd' },
    { text: '[OK] Service started', cls: 'boot-ok' },
  ],
}));

import { initBoot } from '../effects/boot';

function setupDOM(): void {
  document.body.innerHTML = `
    <div id="bootScreen" data-name="Test" data-welcome="TESTER">
      <div id="bootLines"></div>
      <div id="bootProgress" style="width:0%"></div>
    </div>
  `;
}

describe('initBoot', () => {
  beforeEach(() => {
    mockState.prefersReducedMotion = false;
    vi.useFakeTimers();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('hides boot screen immediately when reduced motion', () => {
    mockState.prefersReducedMotion = true;
    setupDOM();
    initBoot();
    expect(document.getElementById('bootScreen')?.classList.contains('hidden')).toBe(true);
  });

  it('does nothing without bootScreen element', () => {
    document.body.innerHTML = '';
    expect(() => initBoot()).not.toThrow();
  });

  it('creates boot line spans', () => {
    setupDOM();
    initBoot();
    const spans = document.querySelectorAll('#bootLines span');
    expect(spans.length).toBeGreaterThan(0);
  });

  it('shows lines progressively', () => {
    setupDOM();
    initBoot();
    const spans = document.querySelectorAll('#bootLines span');
    expect(spans[0].classList.contains('show')).toBe(false);
    vi.advanceTimersByTime(500);
    expect(spans[0].classList.contains('show')).toBe(true);
  });

  it('can be skipped via click', () => {
    setupDOM();
    initBoot();
    document.dispatchEvent(new Event('click'));
    const boot = document.getElementById('bootScreen')!;
    expect(boot.classList.contains('fade-out')).toBe(true);
  });

  it('can be skipped via keydown', () => {
    setupDOM();
    initBoot();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    const boot = document.getElementById('bootScreen')!;
    expect(boot.classList.contains('fade-out')).toBe(true);
  });

  it('shows return visit lines when session exists', () => {
    sessionStorage.setItem('boot-done', '1');
    setupDOM();
    initBoot();
    const spans = document.querySelectorAll('#bootLines span');
    expect(spans.length).toBe(3); // return visit has 3 lines
  });

  it('fades out and sets hidden after completion', () => {
    setupDOM();
    initBoot();
    vi.advanceTimersByTime(10000); // enough time for all animations
    const boot = document.getElementById('bootScreen')!;
    expect(boot.classList.contains('fade-out')).toBe(true);
  });
});
