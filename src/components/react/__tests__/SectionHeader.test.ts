/**
 * @vitest-environment happy-dom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('SectionHeader component', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exports SectionHeader as a function', async () => {
    const { SectionHeader } = await import('../SectionHeader');
    expect(typeof SectionHeader).toBe('function');
  });

  it('module imports without errors', async () => {
    const mod = await import('../SectionHeader');
    expect(mod).toBeDefined();
  });
});
