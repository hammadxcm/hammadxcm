import { describe, expect, it } from 'vitest';
import { sortContributions } from '../contribution-sort';
import type { ContributionPR } from '@config/types';

function makePR(state: string, mergedAt: string): ContributionPR {
  return { state, mergedAt } as unknown as ContributionPR;
}

describe('sortContributions', () => {
  it('sorts merged before open before closed', () => {
    const prs = [makePR('closed', '2025-01-01'), makePR('open', '2025-01-01'), makePR('merged', '2025-01-01')];
    const sorted = sortContributions(prs);
    expect(sorted.map((p) => p.state)).toEqual(['merged', 'open', 'closed']);
  });

  it('sorts by mergedAt descending within same state', () => {
    const prs = [
      makePR('merged', '2025-01-01'),
      makePR('merged', '2025-06-15'),
      makePR('merged', '2025-03-01'),
    ];
    const sorted = sortContributions(prs);
    expect(sorted.map((p) => p.mergedAt)).toEqual(['2025-06-15', '2025-03-01', '2025-01-01']);
  });

  it('does not mutate the original array', () => {
    const prs = [makePR('open', '2025-01-01'), makePR('merged', '2025-01-01')];
    const sorted = sortContributions(prs);
    expect(sorted).not.toBe(prs);
    expect(prs[0].state).toBe('open');
  });

  it('handles empty array', () => {
    expect(sortContributions([])).toEqual([]);
  });

  it('handles unknown states (pushed to end)', () => {
    const prs = [makePR('draft', '2025-01-01'), makePR('merged', '2025-01-01')];
    const sorted = sortContributions(prs);
    expect(sorted[0].state).toBe('merged');
    expect(sorted[1].state).toBe('draft');
  });

  it('handles single item', () => {
    const prs = [makePR('merged', '2025-01-01')];
    expect(sortContributions(prs)).toHaveLength(1);
  });
});
