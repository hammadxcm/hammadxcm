/**
 * Shared contribution PR sorting — merged first, then open, then closed.
 */
import type { ContributionPR } from '@config/types';

const stateOrder: Record<string, number> = { merged: 0, open: 1, closed: 2 };

export function sortContributions(prs: ContributionPR[]): ContributionPR[] {
  return [...prs].sort((a, b) => {
    const so = (stateOrder[a.state] ?? 9) - (stateOrder[b.state] ?? 9);
    if (so !== 0) return so;
    return new Date(b.mergedAt).getTime() - new Date(a.mergedAt).getTime();
  });
}
