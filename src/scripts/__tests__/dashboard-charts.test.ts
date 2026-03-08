/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../state', () => ({ prefersReducedMotion: false }));

describe('dashboard-charts', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('exports initDashboardCharts as a function', async () => {
    const mod = await import('../dashboard-charts');
    expect(typeof mod.initDashboardCharts).toBe('function');
  });

  it('does not throw without canvas elements', async () => {
    const { initDashboardCharts } = await import('../dashboard-charts');
    expect(() => initDashboardCharts()).not.toThrow();
  });

  it('handles missing container gracefully', async () => {
    document.body.innerHTML = '<div id="dashboardCharts"></div>';
    const { initDashboardCharts } = await import('../dashboard-charts');
    expect(() => initDashboardCharts()).not.toThrow();
  });
});
