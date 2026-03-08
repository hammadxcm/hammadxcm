/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { destroyWireframe, initWireframe, toggleWireframe } from '../effects/wireframe';

describe('wireframe', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('wireframe-mode');
    sessionStorage.clear();
  });

  afterEach(() => {
    destroyWireframe();
    document.documentElement.classList.remove('wireframe-mode');
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('initializes without error', () => {
    expect(() => initWireframe()).not.toThrow();
  });

  it('does not double-initialize', () => {
    initWireframe();
    initWireframe();
    // No crash
  });

  it('toggleWireframe adds class', () => {
    initWireframe();
    toggleWireframe();
    expect(document.documentElement.classList.contains('wireframe-mode')).toBe(true);
  });

  it('toggleWireframe removes class on second call', () => {
    initWireframe();
    toggleWireframe();
    toggleWireframe();
    expect(document.documentElement.classList.contains('wireframe-mode')).toBe(false);
  });

  it('persists state in sessionStorage', () => {
    initWireframe();
    toggleWireframe();
    expect(sessionStorage.getItem('hk-wireframe')).toBe('1');
    toggleWireframe();
    expect(sessionStorage.getItem('hk-wireframe')).toBe('0');
  });

  it('restores state from sessionStorage on init', () => {
    sessionStorage.setItem('hk-wireframe', '1');
    initWireframe();
    expect(document.documentElement.classList.contains('wireframe-mode')).toBe(true);
  });

  it('responds to Ctrl+Shift+W', () => {
    initWireframe();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'W', ctrlKey: true, shiftKey: true }));
    expect(document.documentElement.classList.contains('wireframe-mode')).toBe(true);
  });

  it('destroys cleanly', () => {
    initWireframe();
    toggleWireframe();
    destroyWireframe();
    expect(document.documentElement.classList.contains('wireframe-mode')).toBe(false);
  });

  it('allows re-init after destroy', () => {
    initWireframe();
    destroyWireframe();
    expect(() => initWireframe()).not.toThrow();
  });

  it('dispatches achievement on toggle', () => {
    const spy = vi.spyOn(window, 'dispatchEvent');
    initWireframe();
    toggleWireframe();
    const events = spy.mock.calls.filter(
      (c) => c[0] instanceof CustomEvent && (c[0] as CustomEvent).detail === 'wireframe_mode',
    );
    expect(events.length).toBe(1);
  });
});
