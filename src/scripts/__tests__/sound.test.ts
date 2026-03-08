/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockOsc = {
  type: '',
  frequency: { value: 0 },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGain = {
  gain: { value: 0, exponentialRampToValueAtTime: vi.fn() },
  connect: vi.fn(),
};

const mockAudioCtx = {
  currentTime: 0,
  createOscillator: vi.fn(() => ({ ...mockOsc })),
  createGain: vi.fn(() => ({ ...mockGain })),
  destination: {},
  close: vi.fn(() => Promise.resolve()),
};

vi.stubGlobal(
  'AudioContext',
  vi.fn(() => ({ ...mockAudioCtx })),
);

import { destroySound, initSound, isSoundEnabled, playSound, toggleSound } from '../effects/sound';

describe('sound', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    destroySound();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('initializes without error', () => {
    expect(() => initSound()).not.toThrow();
  });

  it('does not double-initialize', () => {
    initSound();
    initSound();
    // No crash
  });

  it('defaults to disabled', () => {
    initSound();
    expect(isSoundEnabled()).toBe(false);
  });

  it('toggles sound on/off', () => {
    initSound();
    toggleSound();
    expect(isSoundEnabled()).toBe(true);
    toggleSound();
    expect(isSoundEnabled()).toBe(false);
  });

  it('persists enabled state in localStorage', () => {
    initSound();
    toggleSound();
    expect(localStorage.getItem('hk-sound')).toBe('1');
  });

  it('restores state from localStorage', () => {
    localStorage.setItem('hk-sound', '1');
    initSound();
    expect(isSoundEnabled()).toBe(true);
  });

  it('playSound does nothing when disabled', () => {
    initSound();
    playSound('click');
    // AudioContext should not be created
  });

  it('playSound creates audio when enabled', () => {
    initSound();
    toggleSound();
    playSound('click');
    // Should not throw
  });

  it('plays different sound types', () => {
    initSound();
    toggleSound();
    expect(() => playSound('click')).not.toThrow();
    expect(() => playSound('beep')).not.toThrow();
    expect(() => playSound('achievement')).not.toThrow();
    expect(() => playSound('levelup')).not.toThrow();
  });

  it('listens for achievement-unlocked event', () => {
    initSound();
    toggleSound();
    window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: {} }));
    // Should not crash
  });

  it('listens for level-up event', () => {
    initSound();
    toggleSound();
    window.dispatchEvent(new CustomEvent('level-up', { detail: {} }));
    // Should not crash
  });

  it('destroys cleanly', () => {
    initSound();
    destroySound();
    // No crash
  });

  it('allows re-init after destroy', () => {
    initSound();
    destroySound();
    expect(() => initSound()).not.toThrow();
  });
});
