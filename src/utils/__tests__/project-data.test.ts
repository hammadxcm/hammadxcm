import { describe, expect, it, vi } from 'vitest';

vi.mock('@config/index', () => ({
  config: {
    projects: [
      {
        name: 'Featured-One',
        tags: [],
        url: '',
        description: '',
        linkText: '',
        npmPackage: 'featured-pkg',
      },
    ],
    github: { username: 'hammadxcm' },
  },
}));

vi.mock('../../data/projects.json', () => ({
  default: {
    repos: [
      {
        name: 'Featured-One',
        url: '',
        stars: 3,
        forks: 1,
        language: null,
        topics: [],
        description: '',
        downloads: 500,
      },
      {
        name: 'high-downloads',
        url: '',
        stars: 1,
        forks: 0,
        language: 'TypeScript',
        topics: [],
        description: '',
        downloads: 3000,
      },
      {
        name: 'high-stars',
        url: '',
        stars: 10,
        forks: 2,
        language: 'TypeScript',
        topics: [],
        description: '',
        downloads: 0,
      },
      {
        name: 'hammadxcm',
        url: '',
        stars: 0,
        forks: 0,
        language: null,
        topics: [],
        description: '',
        downloads: 0,
      },
      {
        name: 'homebrew-tap',
        url: '',
        stars: 0,
        forks: 0,
        language: null,
        topics: [],
        description: '',
        downloads: 0,
      },
    ],
  },
}));

import { getProjectData } from '../project-data';

describe('getProjectData', () => {
  it('returns a unified projects array', () => {
    const { projects } = getProjectData();
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThan(0);
  });

  it('includes featured projects with kind "featured"', () => {
    const { projects } = getProjectData();
    const featured = projects.filter((p) => p.kind === 'featured');
    expect(featured).toHaveLength(1);
    if (featured[0].kind === 'featured') {
      expect(featured[0].project.name).toBe('Featured-One');
    }
  });

  it('excludes username repo and homebrew- repos', () => {
    const { projects } = getProjectData();
    const names = projects.map((p) => (p.kind === 'featured' ? p.project.name : p.repo.name));
    expect(names).not.toContain('hammadxcm');
    expect(names).not.toContain('homebrew-tap');
  });

  it('excludes featured repos from dynamic list', () => {
    const { projects } = getProjectData();
    const dynamic = projects.filter((p) => p.kind === 'dynamic');
    const dynamicNames = dynamic.map((p) => (p.kind === 'dynamic' ? p.repo.name : ''));
    expect(dynamicNames).not.toContain('Featured-One');
  });

  it('sorts by downloads desc, then stars desc', () => {
    const { projects } = getProjectData();
    // high-downloads (3000 dl) should come before Featured-One (500 dl) which comes before high-stars (0 dl)
    const names = projects.map((p) => (p.kind === 'featured' ? p.project.name : p.repo.name));
    const dlIdx = names.indexOf('high-downloads');
    const featIdx = names.indexOf('Featured-One');
    const starsIdx = names.indexOf('high-stars');
    expect(dlIdx).toBeLessThan(featIdx);
    expect(featIdx).toBeLessThan(starsIdx);
  });

  it('attaches download counts from repo data to featured projects', () => {
    const { projects } = getProjectData();
    const featured = projects.find((p) => p.kind === 'featured');
    expect(featured?.kind).toBe('featured');
    if (featured?.kind === 'featured') {
      expect(featured.downloads).toBe(500);
    }
  });
});
