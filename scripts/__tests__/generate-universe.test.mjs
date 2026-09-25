import { describe, expect, it } from 'vitest';
import { currentStreak, renderTelemetry, wrap } from '../generate-universe.mjs';

const day = (date, count) => ({ date, count, level: count ? 2 : 0 });

describe('generate-universe', () => {
  it('counts the streak back from yesterday when today is empty', () => {
    const days = [day('2026-01-01', 0), day('2026-01-02', 3), day('2026-01-03', 1), day('2026-01-04', 0)];
    expect(currentStreak(days)).toBe(2);
    expect(currentStreak([day('2026-01-01', 0), day('2026-01-02', 0)])).toBe(0);
  });

  it('wraps on word boundaries', () => {
    expect(wrap('If it runs twice, script it.', 12)).toEqual(['If it runs', 'twice,', 'script it.']);
  });

  it('renders stats and one cell per day, escaping text', () => {
    const weeks = [
      { contributionDays: [day('2026-01-04', 5), day('2026-01-05', 0)] },
      { contributionDays: [day('2026-01-11', 7)] },
    ];
    const svg = renderTelemetry({
      weeks,
      stats: { followers: 1234, stars: 99, repos: 12, since: '2016' },
      updated: '2026-09-25',
    });
    expect(svg.match(/<rect [^>]*class="fade"[^>]*><title>/g)).toHaveLength(3);
    expect(svg).toContain('>1,234<');
    expect(svg).toContain('>12<');
    expect(svg).toContain('since 2016');
    expect(svg).not.toMatch(/&(?!amp;|lt;|gt;|quot;)/);
  });
});

describe('live data summaries', () => {
  it('summarizes merged upstream PRs, downloads and top project', async () => {
    const { summarizeOSS } = await import('../generate-universe.mjs');
    const pr = (state, fullName, stars) => ({ state, repo: { fullName, stars } });
    const oss = summarizeOSS(
      [pr('merged', 'rails/rails', 50), pr('merged', 'vercel/next.js', 90), pr('merged', 'rails/rails', 50), pr('open', 'x/y', 999)],
      [{ name: 'a', stars: 3, downloads: 10 }, { name: 'b', stars: 8, downloads: 5 }, { name: 'c', stars: 1 }],
    );
    expect(oss).toEqual({
      merged: 3,
      upstream: 2,
      topUpstream: ['vercel/next.js', 'rails/rails'],
      downloads: 15,
      topProject: { name: 'b', stars: 8 },
    });
  });

  it('buckets dates into the trailing months and weeks', async () => {
    const { monthlyCounts, weeklyTotals } = await import('../generate-universe.mjs');
    const now = new Date('2026-09-25T00:00:00Z');
    expect(monthlyCounts(['2026-09-01', '2026-09-20', '2026-07-03', '2025-01-01'], now, 3)).toEqual([1, 0, 2]);
    const wk = (...counts) => ({ contributionDays: counts.map((count) => ({ count })) });
    expect(weeklyTotals([wk(1), wk(2, 3), wk(4)], 2)).toEqual([5, 4]);
  });
});
