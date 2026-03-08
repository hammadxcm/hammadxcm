import { describe, expect, it } from 'vitest';
import { langIcons, keywordIcons, resolveRepoIcon } from '../project-icons';

describe('langIcons', () => {
  it('contains expected languages', () => {
    expect(langIcons.TypeScript).toBeDefined();
    expect(langIcons.Ruby).toBeDefined();
    expect(langIcons.Python).toBeDefined();
  });
});

describe('keywordIcons', () => {
  it('is an array of [keyword, url] tuples', () => {
    expect(keywordIcons.length).toBeGreaterThan(0);
    for (const [kw, url] of keywordIcons) {
      expect(typeof kw).toBe('string');
      expect(typeof url).toBe('string');
    }
  });
});

describe('resolveRepoIcon', () => {
  const base = '/base/';

  it('returns keyword icon when topic matches', () => {
    const repo = { name: 'my-app', language: 'TypeScript', topics: ['react', 'frontend'] };
    expect(resolveRepoIcon(repo, base)).toBe(keywordIcons.find(([k]) => k === 'react')![1]);
  });

  it('returns keyword icon when name matches', () => {
    const repo = { name: 'discord-bot', language: 'JavaScript', topics: [] };
    expect(resolveRepoIcon(repo, base)).toBe(keywordIcons.find(([k]) => k === 'discord')![1]);
  });

  it('matches keywords case-insensitively', () => {
    const repo = { name: 'MY-REACT-APP', language: null, topics: [] };
    expect(resolveRepoIcon(repo, base)).toBe(keywordIcons.find(([k]) => k === 'react')![1]);
  });

  it('returns language icon when no keyword matches', () => {
    const repo = { name: 'utils', language: 'Python', topics: ['cli'] };
    expect(resolveRepoIcon(repo, base)).toBe(langIcons.Python);
  });

  it('returns default icon when no language or keyword matches', () => {
    const repo = { name: 'utils', language: null, topics: [] };
    expect(resolveRepoIcon(repo, base)).toBe('/base/default-project-icon.svg');
  });

  it('returns default icon for unknown language', () => {
    const repo = { name: 'utils', language: 'Haskell', topics: [] };
    expect(resolveRepoIcon(repo, base)).toBe('/base/default-project-icon.svg');
  });

  it('prefers keyword match over language match', () => {
    const repo = { name: 'vue-app', language: 'TypeScript', topics: [] };
    expect(resolveRepoIcon(repo, base)).toBe(keywordIcons.find(([k]) => k === 'vue')![1]);
  });

  it('constructs default icon path correctly with trailing slash base', () => {
    const repo = { name: 'foo', language: null, topics: [] };
    expect(resolveRepoIcon(repo, '/app/')).toBe('/app/default-project-icon.svg');
  });
});
