/**
 * @vitest-environment happy-dom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('useReducedMotion hook', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exports useReducedMotion as a function', async () => {
    const { useReducedMotion } = await import('../hooks/useReducedMotion');
    expect(typeof useReducedMotion).toBe('function');
  });

  it('is re-exported from barrel', async () => {
    const barrel = await import('../hooks/index');
    expect(typeof barrel.useReducedMotion).toBe('function');
  });
});
