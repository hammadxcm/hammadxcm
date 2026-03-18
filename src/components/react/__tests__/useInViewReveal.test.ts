/**
 * @vitest-environment happy-dom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('useInViewReveal hook', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exports useInViewReveal as a function', async () => {
    const { useInViewReveal } = await import('../hooks/useInViewReveal');
    expect(typeof useInViewReveal).toBe('function');
  });

  it('is re-exported from barrel', async () => {
    const barrel = await import('../hooks/index');
    expect(typeof barrel.useInViewReveal).toBe('function');
  });
});
