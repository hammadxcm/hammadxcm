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

describe('keyboard', () => {
  beforeEach(() => {
    vi.resetModules();
    mockState.prefersReducedMotion = false;
    document.body.innerHTML = '<div id="keyFlash"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing without keyFlash element', async () => {
    document.body.innerHTML = '';
    const { initKeyboard } = await import('../interactions/keyboard');
    expect(() => initKeyboard()).not.toThrow();
  });

  it('skips when reduced motion', async () => {
    mockState.prefersReducedMotion = true;
    const { initKeyboard } = await import('../interactions/keyboard');
    initKeyboard();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(document.getElementById('keyFlash')?.textContent).toBe('');
  });

  it('shows key on keydown', async () => {
    const { initKeyboard } = await import('../interactions/keyboard');
    initKeyboard();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
    const flash = document.getElementById('keyFlash');
    expect(flash?.textContent).toBe('> x');
    expect(flash?.classList.contains('show')).toBe(true);
  });

  it('shows Space for space key', async () => {
    const { initKeyboard } = await import('../interactions/keyboard');
    initKeyboard();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    expect(document.getElementById('keyFlash')?.textContent).toBe('> Space');
  });

  it('does not double-initialize', async () => {
    const { initKeyboard, destroyKeyboard } = await import('../interactions/keyboard');
    initKeyboard();
    initKeyboard(); // second call should be no-op
    destroyKeyboard();
  });
});
