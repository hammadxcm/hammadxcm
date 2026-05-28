/**
 * Pure filter + sort helpers for the contributions browser.
 * No DOM access — safe to unit test and reuse client-side.
 */
import type { ContributionPR } from '@config/types';
import { sortContributions } from './contribution-sort';

export type SortKey = 'recent' | 'stars' | 'impact' | 'size';

/** States shown by default on the contributions listing (Closed hidden until selected). */
export const DEFAULT_STATES: string[] = ['merged', 'open'];

/** True when `states` is exactly the default set (used to gate the Clear button). */
export function statesAreDefault(states: Set<string>): boolean {
  return states.size === DEFAULT_STATES.length && DEFAULT_STATES.every((s) => states.has(s));
}

export interface ContributionFilter {
  search?: string;
  states?: Set<string> | string[];
  languages?: Set<string> | string[];
  orgs?: Set<string> | string[];
}

export function orgOf(pr: ContributionPR): string {
  return pr.repo.fullName.split('/')[0];
}

/** Lower-cased haystack: repo name + title + topics + label names. */
export function searchText(pr: ContributionPR): string {
  return [
    pr.repo.fullName,
    pr.title,
    ...(pr.repo.topics || []),
    ...(pr.labels || []).map((l) => l.name),
  ]
    .join(' ')
    .toLowerCase();
}

function toSet(v?: Set<string> | string[]): Set<string> | null {
  if (!v) return null;
  const s = v instanceof Set ? v : new Set(v);
  return s.size > 0 ? s : null;
}

export function filterContributions(
  prs: ContributionPR[],
  filter: ContributionFilter = {},
): ContributionPR[] {
  const q = (filter.search || '').trim().toLowerCase();
  const states = toSet(filter.states);
  const languages = toSet(filter.languages);
  const orgs = toSet(filter.orgs);

  return prs.filter((pr) => {
    if (states && !states.has(pr.state)) return false;
    if (languages && !(pr.repo.language && languages.has(pr.repo.language))) return false;
    if (orgs && !orgs.has(orgOf(pr))) return false;
    if (q && !searchText(pr).includes(q)) return false;
    return true;
  });
}

export function sortBy(prs: ContributionPR[], key: SortKey): ContributionPR[] {
  switch (key) {
    case 'stars':
      return [...prs].sort((a, b) => b.repo.stars - a.repo.stars);
    case 'impact':
      return [...prs].sort((a, b) => b.additions + b.deletions - (a.additions + a.deletions));
    case 'size':
      return [...prs].sort((a, b) => b.changedFiles - a.changedFiles);
    default:
      return sortContributions(prs);
  }
}

export function distinctLanguages(prs: ContributionPR[]): string[] {
  return [...new Set(prs.map((pr) => pr.repo.language).filter(Boolean) as string[])].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function distinctOrgs(prs: ContributionPR[]): string[] {
  return [...new Set(prs.map(orgOf))].sort((a, b) => a.localeCompare(b));
}
