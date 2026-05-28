import type { ContributionPR } from '@config/types';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_STATES,
  distinctLanguages,
  distinctOrgs,
  filterContributions,
  orgOf,
  searchText,
  sortBy,
  statesAreDefault,
} from '../contribution-filter';

function makePR(
  overrides: Omit<Partial<ContributionPR>, 'repo'> & { repo?: Partial<ContributionPR['repo']> },
): ContributionPR {
  const { repo, ...rest } = overrides;
  return {
    title: 'Some PR',
    url: 'https://example.com',
    number: 1,
    state: 'merged',
    mergedAt: '2025-01-01',
    additions: 0,
    deletions: 0,
    changedFiles: 0,
    labels: [],
    ...rest,
    repo: {
      fullName: 'acme/widget',
      url: 'https://example.com',
      stars: 0,
      forks: 0,
      language: 'TypeScript',
      description: null,
      ownerAvatar: '',
      topics: [],
      license: null,
      ...repo,
    },
  } as ContributionPR;
}

describe('filterContributions', () => {
  const prs = [
    makePR({
      title: 'Fix retry backoff',
      state: 'merged',
      repo: { fullName: 'sidekiq/sidekiq', language: 'Ruby', topics: ['jobs'] },
    }),
    makePR({
      title: 'Add edge runtime',
      state: 'open',
      repo: { fullName: 'vercel/next.js', language: 'TypeScript' },
      labels: [{ name: 'enhancement', color: 'fff' }],
    }),
    makePR({
      title: 'Docs typo',
      state: 'closed',
      repo: { fullName: 'rails/rails', language: 'Ruby' },
    }),
  ];

  it('returns all when no filters', () => {
    expect(filterContributions(prs)).toHaveLength(3);
  });

  it('filters by state', () => {
    expect(filterContributions(prs, { states: ['merged'] }).map((p) => p.state)).toEqual([
      'merged',
    ]);
    expect(filterContributions(prs, { states: ['merged', 'open'] })).toHaveLength(2);
  });

  it('filters by language', () => {
    expect(filterContributions(prs, { languages: ['Ruby'] })).toHaveLength(2);
  });

  it('filters by org', () => {
    expect(filterContributions(prs, { orgs: ['vercel'] }).map((p) => p.repo.fullName)).toEqual([
      'vercel/next.js',
    ]);
  });

  it('searches repo name, title, topics and labels (case-insensitive)', () => {
    expect(filterContributions(prs, { search: 'sidekiq' })).toHaveLength(1);
    expect(filterContributions(prs, { search: 'BACKOFF' })).toHaveLength(1);
    expect(filterContributions(prs, { search: 'jobs' })).toHaveLength(1);
    expect(filterContributions(prs, { search: 'enhancement' })).toHaveLength(1);
  });

  it('combines filters (AND)', () => {
    expect(filterContributions(prs, { states: ['merged'], languages: ['Ruby'] })).toHaveLength(1);
    expect(filterContributions(prs, { states: ['open'], languages: ['Ruby'] })).toHaveLength(0);
  });

  it('ignores empty filter sets', () => {
    expect(filterContributions(prs, { states: [], search: '   ' })).toHaveLength(3);
  });

  it('excludes null-language PRs when a language filter is active', () => {
    const withNull = [...prs, makePR({ repo: { fullName: 'misc/thing', language: null } })];
    expect(filterContributions(withNull, { languages: ['Ruby'] })).toHaveLength(2);
  });
});

describe('sortBy', () => {
  const prs = [
    makePR({
      mergedAt: '2025-01-01',
      additions: 10,
      deletions: 5,
      changedFiles: 2,
      repo: { stars: 100 },
    }),
    makePR({
      mergedAt: '2025-06-01',
      additions: 1,
      deletions: 1,
      changedFiles: 9,
      repo: { stars: 50 },
    }),
    makePR({
      mergedAt: '2025-03-01',
      additions: 200,
      deletions: 0,
      changedFiles: 1,
      repo: { stars: 5000 },
    }),
  ];

  it('sorts by stars desc', () => {
    expect(sortBy(prs, 'stars').map((p) => p.repo.stars)).toEqual([5000, 100, 50]);
  });

  it('sorts by impact (additions + deletions) desc', () => {
    expect(sortBy(prs, 'impact').map((p) => p.additions + p.deletions)).toEqual([200, 15, 2]);
  });

  it('sorts by size (changedFiles) desc', () => {
    expect(sortBy(prs, 'size').map((p) => p.changedFiles)).toEqual([9, 2, 1]);
  });

  it('recent uses sortContributions (merged first, then date desc)', () => {
    expect(sortBy(prs, 'recent').map((p) => p.mergedAt)).toEqual([
      '2025-06-01',
      '2025-03-01',
      '2025-01-01',
    ]);
  });

  it('does not mutate input', () => {
    const copy = [...prs];
    sortBy(prs, 'stars');
    expect(prs).toEqual(copy);
  });
});

describe('distinct helpers', () => {
  const prs = [
    makePR({ repo: { fullName: 'sidekiq/sidekiq', language: 'Ruby' } }),
    makePR({ repo: { fullName: 'rails/rails', language: 'Ruby' } }),
    makePR({ repo: { fullName: 'vercel/next.js', language: 'TypeScript' } }),
    makePR({ repo: { fullName: 'misc/thing', language: null } }),
  ];

  it('distinctLanguages dedupes, drops null, sorts', () => {
    expect(distinctLanguages(prs)).toEqual(['Ruby', 'TypeScript']);
  });

  it('distinctOrgs dedupes and sorts', () => {
    expect(distinctOrgs(prs)).toEqual(['misc', 'rails', 'sidekiq', 'vercel']);
  });

  it('orgOf extracts the owner segment', () => {
    expect(orgOf(makePR({ repo: { fullName: 'foo/bar' } }))).toBe('foo');
  });

  it('searchText lowercases and joins fields', () => {
    const txt = searchText(
      makePR({
        title: 'Hello World',
        repo: { fullName: 'A/B', topics: ['X'] },
        labels: [{ name: 'Bug', color: 'f' }],
      }),
    );
    expect(txt).toContain('hello world');
    expect(txt).toContain('a/b');
    expect(txt).toContain('x');
    expect(txt).toContain('bug');
  });

  it('searchText tolerates missing topics/labels', () => {
    const txt = searchText(
      makePR({
        title: 'X',
        repo: { fullName: 'a/b', topics: undefined as unknown as string[] },
        labels: undefined as unknown as [],
      }),
    );
    expect(txt).toContain('a/b');
  });
});

describe('DEFAULT_STATES / statesAreDefault', () => {
  it('default states are merged + open', () => {
    expect(DEFAULT_STATES).toEqual(['merged', 'open']);
  });

  it('statesAreDefault is true only for exactly {merged, open}', () => {
    expect(statesAreDefault(new Set(['merged', 'open']))).toBe(true);
    expect(statesAreDefault(new Set(['open', 'merged']))).toBe(true);
  });

  it('statesAreDefault is false for any other set', () => {
    expect(statesAreDefault(new Set())).toBe(false);
    expect(statesAreDefault(new Set(['merged']))).toBe(false);
    expect(statesAreDefault(new Set(['merged', 'open', 'closed']))).toBe(false);
    expect(statesAreDefault(new Set(['merged', 'closed']))).toBe(false);
  });
});
