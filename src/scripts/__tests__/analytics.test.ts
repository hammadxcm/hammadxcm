/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../achievements', () => ({ trackEvent: vi.fn() }));
vi.mock('../theme-config', () => ({
  analyticsThemeMap: {
    hacker: {
      stats: 'dark',
      streakBg: '00000000',
      activityTheme: 'github-dark',
      trophy: 'darkhub',
      summary: 'github_dark',
      leetcodeTheme: 'dark',
      leetcodeColors: '',
      stackoverflowTheme: 'dark',
    },
  },
}));

import { updateAnalyticsTheme, initLeetcodeTabs, initGithubTabs } from '../analytics';

describe('updateAnalyticsTheme', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="analytics-grid" data-github-user="testuser" data-utc-offset="8">
        <img data-stat="streak" src="" />
        <img data-stat="stats" src="" />
        <img data-stat="isocalendar" src="" />
      </div>
      <div class="analytics-grid" data-leetcode-user="testlc">
        <img data-stat="leetcode-card" data-current-ext="activity" src="" />
      </div>
      <div class="analytics-grid" data-stackoverflow-user="12345">
        <img data-stat="stackoverflow-stats" data-so-layout="compact" src="" />
      </div>
      <div class="dev-quote"><img data-stat="quote" src="" /></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('updates GitHub stats img srcs', () => {
    updateAnalyticsTheme('hacker' as any);
    const streak = document.querySelector('img[data-stat="streak"]') as HTMLImageElement;
    expect(streak.src).toContain('testuser');
    expect(streak.src).toContain('dark');
  });

  it('updates LeetCode card src', () => {
    updateAnalyticsTheme('hacker' as any);
    const lc = document.querySelector('img[data-stat="leetcode-card"]') as HTMLImageElement;
    expect(lc.src).toContain('testlc');
  });

  it('updates StackOverflow img src', () => {
    updateAnalyticsTheme('hacker' as any);
    const so = document.querySelector('img[data-stat="stackoverflow-stats"]') as HTMLImageElement;
    expect(so.src).toContain('12345');
  });

  it('updates dev quote img src', () => {
    updateAnalyticsTheme('hacker' as any);
    const quote = document.querySelector('img[data-stat="quote"]') as HTMLImageElement;
    expect(quote.src).toContain('horizontal');
  });

  it('applies arctic filter to isocalendar', () => {
    updateAnalyticsTheme('arctic' as any);
    const iso = document.querySelector('img[data-stat="isocalendar"]') as HTMLImageElement;
    expect(iso.style.filter).toContain('invert');
  });

  it('does nothing without elements', () => {
    document.body.innerHTML = '';
    expect(() => updateAnalyticsTheme('hacker' as any)).not.toThrow();
  });
});

describe('initLeetcodeTabs', () => {
  it('does nothing without leetcode grid', () => {
    document.body.innerHTML = '';
    expect(() => initLeetcodeTabs()).not.toThrow();
  });
});

describe('initGithubTabs', () => {
  it('does nothing without github grid', () => {
    document.body.innerHTML = '';
    expect(() => initGithubTabs()).not.toThrow();
  });
});
