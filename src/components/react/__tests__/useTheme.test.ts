/**
 * @vitest-environment happy-dom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('useTheme hook', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exports useTheme as a function', async () => {
    const { useTheme } = await import('../hooks/useTheme');
    expect(typeof useTheme).toBe('function');
  });

  it('is re-exported from barrel', async () => {
    const barrel = await import('../hooks/index');
    expect(typeof barrel.useTheme).toBe('function');
  });
});
