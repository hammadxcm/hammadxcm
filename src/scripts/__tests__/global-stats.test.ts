/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('global-stats', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('reportEvent is a no-op on localhost (no API base)', async () => {
    const { reportEvent } = await import('../global-stats');
    expect(() => reportEvent('test')).not.toThrow();
  });

  it('fetchGlobalStats returns null when no API base and no cache', async () => {
    const { fetchGlobalStats } = await import('../global-stats');
    const result = await fetchGlobalStats();
    expect(result).toBeNull();
  });

  it('exports reportEvent as a function', async () => {
    const { reportEvent } = await import('../global-stats');
    expect(typeof reportEvent).toBe('function');
  });

  it('exports fetchGlobalStats as a function', async () => {
    const { fetchGlobalStats } = await import('../global-stats');
    expect(typeof fetchGlobalStats).toBe('function');
  });

  it('reportEvent does not throw for any event name', async () => {
    const { reportEvent } = await import('../global-stats');
    expect(() => reportEvent('page_view')).not.toThrow();
    expect(() => reportEvent('theme_switch')).not.toThrow();
    expect(() => reportEvent('')).not.toThrow();
  });

  it('fetchGlobalStats returns consistent null on localhost', async () => {
    const { fetchGlobalStats } = await import('../global-stats');
    const a = await fetchGlobalStats();
    const b = await fetchGlobalStats();
    expect(a).toBe(b);
  });
});
