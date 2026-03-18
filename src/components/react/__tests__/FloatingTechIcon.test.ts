/**
 * @vitest-environment happy-dom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('FloatingTechIcon component', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exports FloatingTechIcon as a function', async () => {
    const { FloatingTechIcon } = await import('../FloatingTechIcon');
    expect(typeof FloatingTechIcon).toBe('function');
  });

  it('module imports without errors', async () => {
    const mod = await import('../FloatingTechIcon');
    expect(mod).toBeDefined();
  });
});
