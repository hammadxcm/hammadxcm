import { describe, expect, it } from 'vitest';
import { formatDownloads, formatStars } from '../format';

describe('formatStars', () => {
  it('returns raw string for values below 1000', () => {
    expect(formatStars(0)).toBe('0');
    expect(formatStars(1)).toBe('1');
    expect(formatStars(999)).toBe('999');
  });

  it('formats values >= 1000 with k suffix', () => {
    expect(formatStars(1000)).toBe('1.0k');
    expect(formatStars(1500)).toBe('1.5k');
    expect(formatStars(10000)).toBe('10.0k');
    expect(formatStars(99999)).toBe('100.0k');
  });
});

describe('formatDownloads', () => {
  it('returns raw string for values below 1000', () => {
    expect(formatDownloads(0)).toBe('0');
    expect(formatDownloads(1)).toBe('1');
    expect(formatDownloads(999)).toBe('999');
  });

  it('formats values 1000–999999 with k suffix', () => {
    expect(formatDownloads(1000)).toBe('1.0k');
    expect(formatDownloads(5500)).toBe('5.5k');
    expect(formatDownloads(999999)).toBe('1000.0k');
  });

  it('formats values >= 1000000 with M suffix', () => {
    expect(formatDownloads(1000000)).toBe('1.0M');
    expect(formatDownloads(2500000)).toBe('2.5M');
    expect(formatDownloads(10000000)).toBe('10.0M');
  });
});
