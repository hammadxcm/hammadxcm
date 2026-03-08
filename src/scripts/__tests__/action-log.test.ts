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

import { destroyActionLog, getActionLog, initActionLog, logAction } from '../effects/action-log';

describe('action-log', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    destroyActionLog();
  });

  afterEach(() => {
    destroyActionLog();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('creates #actionLog element on init', () => {
    initActionLog();
    const el = document.getElementById('actionLog');
    expect(el).not.toBeNull();
    expect(el?.className).toBe('action-log');
  });

  it('init guard prevents double init', () => {
    initActionLog();
    initActionLog();
    const els = document.querySelectorAll('#actionLog');
    expect(els.length).toBe(1);
  });

  it('uses existing #actionLog if present', () => {
    document.body.innerHTML = '<div id="actionLog"></div>';
    initActionLog();
    const els = document.querySelectorAll('#actionLog');
    expect(els.length).toBe(1);
  });

  it('destroy removes element and resets state', () => {
    initActionLog();
    expect(document.getElementById('actionLog')).not.toBeNull();

    destroyActionLog();
    expect(document.getElementById('actionLog')).toBeNull();
    expect(getActionLog()).toEqual([]);
  });

  it('can re-init after destroy', () => {
    initActionLog();
    destroyActionLog();
    initActionLog();
    expect(document.getElementById('actionLog')).not.toBeNull();
  });

  it('logAction adds entry to buffer', () => {
    initActionLog();
    logAction('Theme changed to hacker');
    expect(getActionLog()).toEqual(['Theme changed to hacker']);
  });

  it('logAction does nothing before init', () => {
    logAction('Should be ignored');
    expect(getActionLog()).toEqual([]);
  });

  it('circular buffer keeps max 5 entries', () => {
    initActionLog();
    logAction('action 1');
    logAction('action 2');
    logAction('action 3');
    logAction('action 4');
    logAction('action 5');
    logAction('action 6');

    const log = getActionLog();
    expect(log.length).toBe(5);
    expect(log[0]).toBe('action 2');
    expect(log[4]).toBe('action 6');
  });

  it('display updates when logAction is called', () => {
    initActionLog();
    logAction('First action');
    logAction('Second action');

    const el = document.getElementById('actionLog');
    const entries = el?.querySelectorAll('.action-log-entry');
    expect(entries?.length).toBe(2);
    expect(entries?.[0].textContent).toBe('First action');
    expect(entries?.[1].textContent).toBe('Second action');
  });

  it('getActionLog returns a copy, not the internal buffer', () => {
    initActionLog();
    logAction('test');
    const log = getActionLog();
    expect(log.length).toBe(1);
    // Mutating the returned array should not affect internal state
    (log as string[]).push('extra');
    expect(getActionLog().length).toBe(1);
  });
});
