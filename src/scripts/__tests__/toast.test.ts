/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { spawnToast } from '../effects/toast';

describe('spawnToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="hackerToastContainer"></div>';
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('does nothing without container', () => {
    document.body.innerHTML = '';
    expect(() => spawnToast('hello')).not.toThrow();
  });

  it('creates a toast element with message', () => {
    spawnToast('Test message');
    const toast = document.querySelector('.hacker-toast');
    expect(toast).not.toBeNull();
    expect(toast?.textContent).toBe('Test message');
  });

  it('applies custom className', () => {
    spawnToast('msg', { className: 'custom-toast' });
    const toast = document.querySelector('.custom-toast');
    expect(toast).not.toBeNull();
  });

  it('defaults to hacker-toast class when no className', () => {
    spawnToast('msg');
    expect(document.querySelector('.hacker-toast')).not.toBeNull();
  });

  it('limits to MAX_TOASTS (3)', () => {
    spawnToast('one');
    spawnToast('two');
    spawnToast('three');
    spawnToast('four');
    const toasts = document.querySelectorAll('.hacker-toast');
    expect(toasts.length).toBeLessThanOrEqual(3);
  });

  it('adds dismiss class after timeout', () => {
    spawnToast('msg');
    vi.advanceTimersByTime(2500);
    const toast = document.querySelector('.hacker-toast');
    expect(toast?.classList.contains('dismiss')).toBe(true);
  });

  it('removes toast after animationend', () => {
    spawnToast('msg');
    vi.advanceTimersByTime(2500);
    const toast = document.querySelector('.hacker-toast')!;
    toast.dispatchEvent(new Event('animationend'));
    expect(document.querySelectorAll('.hacker-toast').length).toBe(0);
  });
});
