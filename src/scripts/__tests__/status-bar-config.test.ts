/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import { getStatusBarConfig, themeStatusBars } from '../theme-config';
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

describe('themeStatusBars', () => {
  it('has an entry for every theme', () => {
    for (const theme of ALL_THEMES) {
      expect(themeStatusBars).toHaveProperty(theme);
    }
  });

  it('every theme has exactly 5 segments', () => {
    for (const theme of ALL_THEMES) {
      expect(themeStatusBars[theme]).toHaveLength(5);
    }
  });

  it('every segment has a string label', () => {
    for (const theme of ALL_THEMES) {
      for (const seg of themeStatusBars[theme]) {
        expect(typeof seg.label).toBe('string');
      }
    }
  });

  it('first segment of every theme has cls "status-secure"', () => {
    for (const theme of ALL_THEMES) {
      expect(themeStatusBars[theme][0].cls).toBe('status-secure');
    }
  });

  it('all value functions return non-empty strings', () => {
    for (const theme of ALL_THEMES) {
      for (const seg of themeStatusBars[theme]) {
        if (seg.value) {
          const result = seg.value(120);
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('getStatusBarConfig()', () => {
  it('returns correct config for a given theme', () => {
    const config = getStatusBarConfig('dracula');
    expect(config).toBe(themeStatusBars.dracula);
  });

  it('returns hacker config for an unknown theme', () => {
    const config = getStatusBarConfig('nonexistent' as ThemeName);
    expect(config).toBe(themeStatusBars.hacker);
  });

  it('returns a config for every valid theme', () => {
    for (const theme of ALL_THEMES) {
      const config = getStatusBarConfig(theme);
      expect(config).toHaveLength(5);
    }
  });
});
