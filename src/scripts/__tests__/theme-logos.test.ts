/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import { getThemeLogo, themeLogos } from '../theme-config';
import type { ThemeName } from '../types';

const ALL_THEMES: ThemeName[] = [
  'hacker',
  'dracula',
  'nord',
  'catppuccin',
  'synthwave',
  'matrix',
  'bloodmoon',
  'midnight',
  'arctic',
  'gruvbox',
];

describe('themeLogos', () => {
  it('has an entry for every theme', () => {
    for (const theme of ALL_THEMES) {
      expect(themeLogos).toHaveProperty(theme);
    }
  });

  it('every entry has non-empty text and suffix', () => {
    for (const theme of ALL_THEMES) {
      const logo = themeLogos[theme];
      expect(logo.text).toBeTruthy();
      expect(logo.suffix).toBeTruthy();
    }
  });

  it('all logos use "fyniti" as the text', () => {
    for (const theme of ALL_THEMES) {
      expect(themeLogos[theme].text).toBe('fyniti');
    }
  });

  it('each theme has the correct suffix', () => {
    const expected: Record<ThemeName, string> = {
      hacker: '://hk',
      dracula: '::hk',
      nord: '.hk',
      catppuccin: '~/hk',
      synthwave: '>>hk',
      matrix: '/hk',
      bloodmoon: '#hk',
      midnight: '@hk',
      arctic: '.hk',
      gruvbox: '\\hk',
    };
    for (const theme of ALL_THEMES) {
      expect(themeLogos[theme].suffix).toBe(expected[theme]);
    }
  });

  it('every suffix contains "hk"', () => {
    for (const theme of ALL_THEMES) {
      expect(themeLogos[theme].suffix).toContain('hk');
    }
  });

  it('no two themes share the exact same suffix (except nord/arctic)', () => {
    const suffixes = new Map<string, ThemeName[]>();
    for (const theme of ALL_THEMES) {
      const s = themeLogos[theme].suffix;
      const list = suffixes.get(s) || [];
      list.push(theme);
      suffixes.set(s, list);
    }
    for (const [suffix, themes] of suffixes) {
      if (themes.length > 1) {
        // Only nord and arctic share ".hk"
        expect(suffix).toBe('.hk');
        expect(themes.sort()).toEqual(['arctic', 'nord']);
      }
    }
  });
});

describe('getThemeLogo()', () => {
  it('returns the correct logo for a given theme', () => {
    const logo = getThemeLogo('dracula');
    expect(logo.text).toBe('fyniti');
    expect(logo.suffix).toBe('::hk');
  });

  it('returns hacker logo for an unknown theme', () => {
    const logo = getThemeLogo('nonexistent' as ThemeName);
    expect(logo.text).toBe('fyniti');
    expect(logo.suffix).toBe('://hk');
  });

  it('returns a logo for every valid theme', () => {
    for (const theme of ALL_THEMES) {
      const logo = getThemeLogo(theme);
      expect(logo).toHaveProperty('text');
      expect(logo).toHaveProperty('suffix');
      expect(logo.text).toBe('fyniti');
    }
  });
});
