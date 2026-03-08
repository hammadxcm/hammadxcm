/**
 * @vitest-environment happy-dom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('state module', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exports prefersReducedMotion as boolean', async () => {
    const { prefersReducedMotion } = await import('../state');
    expect(typeof prefersReducedMotion).toBe('boolean');
  });

  it('exports isTouchDevice as boolean', async () => {
    const { isTouchDevice } = await import('../state');
    expect(typeof isTouchDevice).toBe('boolean');
  });

  it('getCurrentTheme returns a string', async () => {
    const { getCurrentTheme } = await import('../state');
    expect(typeof getCurrentTheme()).toBe('string');
  });

  it('setCurrentTheme / getCurrentTheme round-trip', async () => {
    const { getCurrentTheme, setCurrentTheme } = await import('../state');
    setCurrentTheme('cyberpunk' as any);
    expect(getCurrentTheme()).toBe('cyberpunk');
  });

  it('getClientIP / setClientIP round-trip', async () => {
    const { getClientIP, setClientIP } = await import('../state');
    expect(getClientIP()).toBe('');
    setClientIP('1.2.3.4');
    expect(getClientIP()).toBe('1.2.3.4');
  });

  it('isHeroVisible / setHeroVisible round-trip', async () => {
    const { isHeroVisible, setHeroVisible } = await import('../state');
    expect(isHeroVisible()).toBe(true);
    setHeroVisible(false);
    expect(isHeroVisible()).toBe(false);
  });

  it('isPageVisible returns boolean', async () => {
    const { isPageVisible } = await import('../state');
    expect(typeof isPageVisible()).toBe('boolean');
  });

  it('onVisibilityChange returns unsubscribe function', async () => {
    const { onVisibilityChange } = await import('../state');
    const fn = vi.fn();
    const unsub = onVisibilityChange(fn);
    expect(typeof unsub).toBe('function');
    unsub();
  });
});
