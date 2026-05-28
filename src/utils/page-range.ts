/**
 * Build a page range like [1, '...', 4, 5, 6, '...', 9].
 * Shows first, last, and up to 2 neighbours around current.
 */
export function buildPageRange(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  // First, last, and current ±1 — these ranges never overlap, so no de-dupe needed.
  const pages: (number | string)[] = [];
  const addPage = (p: number): void => {
    pages.push(p);
  };

  addPage(1);
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    addPage(i);
  }
  if (current < total - 2) pages.push('...');
  addPage(total);

  return pages;
}
