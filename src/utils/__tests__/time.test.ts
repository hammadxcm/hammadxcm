import type { TranslationMap } from '@i18n/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@i18n/index', () => ({
  t: (_translations: unknown, key: string, params?: Record<string, string | number>) => {
    if (params?.count !== undefined) return `${key}:${params.count}`;
    return key;
  },
}));

import { relativeTime } from '../time';

const translations = {
  contributions: {
    relativeTime: {
      today: 'today',
      dayAgo: '1 day ago',
      daysAgo: '{{count}} days ago',
      monthAgo: '1 month ago',
      monthsAgo: '{{count}} months ago',
      yearAgo: '1 year ago',
      yearsAgo: '{{count}} years ago',
    },
  },
} as unknown as TranslationMap;

describe('relativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-09T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty string for empty input', () => {
    expect(relativeTime('', translations)).toBe('');
  });

  it('returns empty string for null-ish input', () => {
    expect(relativeTime(null as unknown as string, translations)).toBe('');
    expect(relativeTime(undefined as unknown as string, translations)).toBe('');
  });

  it('returns "today" for same-day dates', () => {
    expect(relativeTime('2026-03-09T10:00:00Z', translations)).toBe('today');
  });

  it('returns "1 day ago" for yesterday', () => {
    expect(relativeTime('2026-03-08T10:00:00Z', translations)).toBe('1 day ago');
  });

  it('returns "X days ago" for 2-29 days', () => {
    expect(relativeTime('2026-03-02T12:00:00Z', translations)).toBe(
      'contributions.relativeTime.daysAgo:7',
    );
  });

  it('returns "1 month ago" for 30-59 days', () => {
    expect(relativeTime('2026-02-07T12:00:00Z', translations)).toBe('1 month ago');
  });

  it('returns "X months ago" for 2-11 months', () => {
    expect(relativeTime('2025-12-09T12:00:00Z', translations)).toBe(
      'contributions.relativeTime.monthsAgo:3',
    );
  });

  it('returns "1 year ago" for 12-23 months', () => {
    expect(relativeTime('2025-03-09T12:00:00Z', translations)).toBe('1 year ago');
  });

  it('returns "X years ago" for 24+ months', () => {
    expect(relativeTime('2024-03-09T12:00:00Z', translations)).toBe(
      'contributions.relativeTime.yearsAgo:2',
    );
  });

  it('handles boundary at exactly 30 days', () => {
    expect(relativeTime('2026-02-07T12:00:00Z', translations)).toBe('1 month ago');
  });

  it('handles boundary at exactly 360 days (12 months)', () => {
    // 360 days = 12 months → yearAgo
    expect(relativeTime('2025-03-14T12:00:00Z', translations)).toBe('1 year ago');
  });
});
