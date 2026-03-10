import { describe, expect, it, vi } from 'vitest';

vi.mock('@config/index', () => ({
  config: {
    projects: [{ name: 'Featured-One', tags: [], url: '', description: '', linkText: '' }],
    github: { username: 'hammadxcm' },
  },
}));

vi.mock('../../data/projects.json', () => ({
  default: {
    repos: [
      {
        name: 'Featured-One',
        url: '',
        stars: 0,
        forks: 0,
        language: null,
        topics: [],
        description: '',
      },
      {
        name: 'other-repo',
        url: '',
        stars: 5,
        forks: 0,
        language: 'TypeScript',
        topics: [],
        description: '',
      },
      {
        name: 'hammadxcm',
        url: '',
        stars: 0,
        forks: 0,
        language: null,
        topics: [],
        description: '',
      },
      {
        name: 'homebrew-tap',
        url: '',
        stars: 0,
        forks: 0,
        language: null,
        topics: [],
        description: '',
      },
    ],
    downloads: { 'pkg-a': 100 },
  },
}));

import { getProjectData } from '../project-data';

describe('getProjectData', () => {
  it('returns featured projects from config', () => {
    const { featured } = getProjectData();
    expect(featured).toHaveLength(1);
    expect(featured[0].name).toBe('Featured-One');
  });

  it('filters featured repos from dynamic list (case-insensitive)', () => {
    const { dynamicRepos } = getProjectData();
    expect(dynamicRepos.find((r) => r.name === 'Featured-One')).toBeUndefined();
  });

  it('excludes username repo', () => {
    const { dynamicRepos } = getProjectData();
    expect(dynamicRepos.find((r) => r.name === 'hammadxcm')).toBeUndefined();
  });

  it('excludes homebrew- repos', () => {
    const { dynamicRepos } = getProjectData();
    expect(dynamicRepos.find((r) => r.name === 'homebrew-tap')).toBeUndefined();
  });

  it('returns download counts from data', () => {
    const { downloadCounts } = getProjectData();
    expect(downloadCounts['pkg-a']).toBe(100);
  });
});
