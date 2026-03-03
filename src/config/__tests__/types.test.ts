import { describe, expect, it } from 'vitest';
import contributionsRaw from '../../data/contributions.json';
import projectsRaw from '../../data/projects.json';
import { config } from '../index';
import type { CertBadge, ContributionsData, ProjectsData, SocialPlatform } from '../types';

const contributions = contributionsRaw as ContributionsData;
const projects = projectsRaw as ProjectsData;

function isValidUrlOrPath(s: string): boolean {
  // data: URIs and local paths are valid
  if (s.startsWith('data:') || (!s.startsWith('http') && !s.includes('://'))) {
    return true;
  }
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

describe('CertBadge discriminated union', () => {
  it('image badges have src, width, and alt — no svg field', () => {
    const imageCerts = config.certifications.filter((c) => c.badge.type === 'image');
    for (const cert of imageCerts) {
      const badge = cert.badge as Extract<CertBadge, { type: 'image' }>;
      expect(typeof badge.src).toBe('string');
      expect(badge.src.length).toBeGreaterThan(0);
      expect(typeof badge.width).toBe('number');
      expect(typeof badge.alt).toBe('string');
      expect((badge as unknown as Record<string, unknown>).svg).toBeUndefined();
    }
  });

  it('svg badges have svg string — no src/width/alt fields', () => {
    const svgCerts = config.certifications.filter((c) => c.badge.type === 'svg');
    for (const cert of svgCerts) {
      const badge = cert.badge as Extract<CertBadge, { type: 'svg' }>;
      expect(typeof badge.svg).toBe('string');
      expect(badge.svg).toContain('<svg');
      expect((badge as unknown as Record<string, unknown>).src).toBeUndefined();
      expect((badge as unknown as Record<string, unknown>).width).toBeUndefined();
      expect((badge as unknown as Record<string, unknown>).alt).toBeUndefined();
    }
  });
});

describe('SocialPlatform values', () => {
  const validPlatforms: SocialPlatform[] = [
    'github',
    'twitter',
    'linkedin',
    'stackoverflow',
    'leetcode',
    'hackerrank',
  ];

  it('all social entries use a valid platform', () => {
    for (const social of config.socials) {
      expect(validPlatforms).toContain(social.platform);
    }
  });
});

describe('ContributionsData shape', () => {
  it('has required top-level fields', () => {
    expect(contributions.generatedAt).toBeTruthy();
    expect(contributions.username).toBeTruthy();
    expect(typeof contributions.totalCount).toBe('number');
    expect(contributions.contributions).toBeInstanceOf(Array);
  });

  it('each PR has required fields including diff stats', () => {
    for (const pr of contributions.contributions) {
      expect(pr.title).toBeTruthy();
      expect(pr.url).toBeTruthy();
      expect(typeof pr.number).toBe('number');
      expect(pr.mergedAt).toBeTruthy();
      expect(typeof pr.additions).toBe('number');
      expect(typeof pr.deletions).toBe('number');
      expect(typeof pr.changedFiles).toBe('number');
      expect(pr.labels).toBeInstanceOf(Array);
    }
  });

  it('each PR repo has required fields including forks and topics', () => {
    for (const pr of contributions.contributions) {
      const repo = pr.repo;
      expect(repo.fullName).toBeTruthy();
      expect(repo.url).toBeTruthy();
      expect(typeof repo.stars).toBe('number');
      expect(typeof repo.forks).toBe('number');
      expect(repo.topics).toBeInstanceOf(Array);
      expect(typeof repo.ownerAvatar).toBe('string');
    }
  });

  it('labels have name and color when present', () => {
    for (const pr of contributions.contributions) {
      for (const label of pr.labels) {
        expect(label.name).toBeTruthy();
        expect(typeof label.color).toBe('string');
      }
    }
  });
});

describe('ProjectsData shape', () => {
  it('has required top-level fields', () => {
    expect(projects.generatedAt).toBeTruthy();
    expect(projects.username).toBeTruthy();
    expect(projects.repos).toBeInstanceOf(Array);
    expect(projects.repos.length).toBeGreaterThan(0);
  });

  it('each repo has required fields', () => {
    for (const repo of projects.repos) {
      expect(repo.name).toBeTruthy();
      expect(repo.fullName).toBeTruthy();
      expect(repo.url).toMatch(/^https:\/\/github\.com\//);
      expect(typeof repo.stars).toBe('number');
      expect(typeof repo.forks).toBe('number');
      expect(repo.topics).toBeInstanceOf(Array);
      expect(repo.updatedAt).toBeTruthy();
    }
  });

  it('repos are sorted by stars descending', () => {
    for (let i = 1; i < projects.repos.length; i++) {
      expect(projects.repos[i - 1].stars).toBeGreaterThanOrEqual(projects.repos[i].stars);
    }
  });
});

describe('URL validation across config', () => {
  it('techStack icon URLs are valid', () => {
    for (const category of config.techStack) {
      for (const item of category.items) {
        expect(isValidUrlOrPath(item.icon)).toBe(true);
        expect(isValidUrlOrPath(item.url)).toBe(true);
      }
    }
  });

  it('project URLs are valid', () => {
    for (const project of config.projects) {
      expect(isValidUrlOrPath(project.url)).toBe(true);
      expect(isValidUrlOrPath(project.icon)).toBe(true);
    }
  });

  it('certification hrefs are valid', () => {
    for (const cert of config.certifications) {
      expect(isValidUrlOrPath(cert.href)).toBe(true);
    }
  });

  it('social URLs are valid', () => {
    for (const social of config.socials) {
      expect(isValidUrlOrPath(social.url)).toBe(true);
    }
  });
});
