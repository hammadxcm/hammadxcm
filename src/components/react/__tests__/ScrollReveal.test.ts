/**
 * @vitest-environment happy-dom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('ScrollReveal component', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exports ScrollReveal as a function', async () => {
    const { ScrollReveal } = await import('../ScrollReveal');
    expect(typeof ScrollReveal).toBe('function');
  });

  it('module imports without errors', async () => {
    const mod = await import('../ScrollReveal');
    expect(mod).toBeDefined();
  });
});
