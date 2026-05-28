import { describe, expect, it } from 'vitest';
import { buildPageRange } from '../page-range';

describe('buildPageRange', () => {
  it('lists every page when total <= 7', () => {
    expect(buildPageRange(1, 1)).toEqual([1]);
    expect(buildPageRange(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('shows leading ellipsis when current is far from start', () => {
    expect(buildPageRange(6, 10)).toEqual([1, '...', 5, 6, 7, '...', 10]);
  });

  it('omits leading ellipsis near the start', () => {
    expect(buildPageRange(2, 10)).toEqual([1, 2, 3, '...', 10]);
    expect(buildPageRange(3, 10)).toEqual([1, 2, 3, 4, '...', 10]);
  });

  it('omits trailing ellipsis near the end', () => {
    expect(buildPageRange(9, 10)).toEqual([1, '...', 8, 9, 10]);
    expect(buildPageRange(8, 10)).toEqual([1, '...', 7, 8, 9, 10]);
  });

  it('always includes first and last', () => {
    const range = buildPageRange(5, 9);
    expect(range[0]).toBe(1);
    expect(range[range.length - 1]).toBe(9);
  });

  it('never duplicates page numbers', () => {
    const range = buildPageRange(2, 8).filter((p) => typeof p === 'number');
    expect(new Set(range).size).toBe(range.length);
  });
});
