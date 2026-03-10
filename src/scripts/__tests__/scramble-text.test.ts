/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createScrambleReveal, shuffleIndices } from '../effects/scramble-text';

describe('shuffleIndices', () => {
  it('shuffles array in place', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const original = [...arr];
    // Use a seeded random to make test deterministic
    vi.spyOn(Math, 'random').mockReturnValue(0.3);
    shuffleIndices(arr);
    expect(arr).toHaveLength(original.length);
    expect(arr.sort()).toEqual(original.sort());
    vi.restoreAllMocks();
  });

  it('handles empty array', () => {
    const arr: number[] = [];
    shuffleIndices(arr);
    expect(arr).toEqual([]);
  });

  it('handles single element', () => {
    const arr = [42];
    shuffleIndices(arr);
    expect(arr).toEqual([42]);
  });
});

describe('createScrambleReveal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns timer IDs', () => {
    const result = createScrambleReveal({
      text: 'hello',
      glyphs: '!@#$',
      timing: { flicker: 50, resolve: 100 },
      onFrame: () => {},
    });
    expect(result.flickerTimer).toBeDefined();
    expect(result.resolverTimer).toBeDefined();
  });

  it('calls onFrame during flicker', () => {
    const onFrame = vi.fn();
    createScrambleReveal({
      text: 'hi',
      glyphs: 'X',
      timing: { flicker: 50, resolve: 200 },
      onFrame,
    });
    vi.advanceTimersByTime(150);
    expect(onFrame).toHaveBeenCalled();
  });
});
