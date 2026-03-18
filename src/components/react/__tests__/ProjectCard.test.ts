/**
 * @vitest-environment happy-dom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('ProjectCard component', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exports ProjectCard as a function', async () => {
    const { ProjectCard } = await import('../ProjectCard');
    expect(typeof ProjectCard).toBe('function');
  });

  it('module imports without errors', async () => {
    const mod = await import('../ProjectCard');
    expect(mod).toBeDefined();
  });
});
