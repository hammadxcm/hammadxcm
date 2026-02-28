import { describe, it, expect } from 'vitest';
import { escapeHtml, buildAboutLines } from '../about-builder';
import type { PortfolioConfig } from '../types';

type About = PortfolioConfig['about'];

const baseAbout: About = {
  codename: 'test_user',
  title: 'Engineer',
  experience: '5 years',
  location: 'Earth',
  clearance: 'Level 1',
  currentOp: 'Testing',
  arsenal: [
    { key: 'lang', value: 'TypeScript' },
    { key: 'tool', value: 'Vitest' },
  ],
  missionLog: ['Shipped v1', 'Fixed bugs'],
  knownAliases: ['alias1', 'alias2'],
  currentFocus: 'Quality',
  philosophy: ['Build well,', 'test often.'],
};

describe('escapeHtml', () => {
  it('escapes &, <, > correctly', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    expect(escapeHtml('a < b > c & d')).toBe('a &lt; b &gt; c &amp; d');
  });

  it('leaves clean strings unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
    expect(escapeHtml('TypeScript')).toBe('TypeScript');
    expect(escapeHtml('')).toBe('');
  });
});

describe('buildAboutLines', () => {
  it('returns displayLines and copyLines of equal length', () => {
    const { displayLines, copyLines } = buildAboutLines(baseAbout);
    expect(displayLines.length).toBe(copyLines.length);
  });

  it('produces the expected total line count', () => {
    const { displayLines } = buildAboutLines(baseAbout);
    // header: 5 (shebang + 2 borders + classified + blank)
    // vars: 6
    // blank: 1
    // arsenal: header + 2 entries + footer = 4
    // blank: 1
    // mission: header + 2 entries + footer = 4
    // blank: 1
    // aliases: 1
    // focus: 1
    // philosophy: 2 lines (multi-line: opening + closing)
    // blank: 1
    // echo: 1
    // Total: 5 + 6 + 1 + 4 + 1 + 4 + 1 + 1 + 1 + 2 + 1 + 1 = 28
    expect(displayLines.length).toBe(28);
  });

  it('single-element philosophy produces one line with closing quote', () => {
    const about: About = { ...baseAbout, philosophy: ['Just ship it.'] };
    const { displayLines, copyLines } = buildAboutLines(about);

    const philDisplayLine = displayLines.find(l => l.includes('PHILOSOPHY'));
    expect(philDisplayLine).toContain('"');
    // should have opening and closing quote in the span
    expect(philDisplayLine).toMatch(/PHILOSOPHY.*"Just ship it\."/);

    const philCopyLine = copyLines.find(l => l.includes('PHILOSOPHY'));
    expect(philCopyLine).toBe('PHILOSOPHY="Just ship it."');
  });

  it('multi-element philosophy spans multiple lines with closing quote only on last', () => {
    const { displayLines, copyLines } = buildAboutLines(baseAbout);

    const philStart = displayLines.findIndex(l => l.includes('PHILOSOPHY'));
    // First philosophy line should NOT have a closing quote after content
    expect(displayLines[philStart]).not.toMatch(/Build well,"<\/span>$/);
    // Second (last) line should end with closing quote
    expect(displayLines[philStart + 1]).toContain('test often."');

    const copyPhilStart = copyLines.findIndex(l => l.includes('PHILOSOPHY'));
    expect(copyLines[copyPhilStart]).not.toMatch(/test often/);
    expect(copyLines[copyPhilStart + 1]).toContain('test often."');
  });

  it('copyLines contain no HTML tags', () => {
    const { copyLines } = buildAboutLines(baseAbout);
    for (const line of copyLines) {
      expect(line).not.toMatch(/<[a-z]+[\s>]/i);
    }
  });

  it('displayLines contain proper CSS class spans', () => {
    const { displayLines } = buildAboutLines(baseAbout);
    const allDisplay = displayLines.join('\n');

    expect(allDisplay).toContain('class="keyword"');
    expect(allDisplay).toContain('class="comment"');
    expect(allDisplay).toContain('class="const"');
    expect(allDisplay).toContain('class="string"');
    expect(allDisplay).toContain('class="bracket"');
    expect(allDisplay).toContain('class="property"');
  });

  it('arsenal entries render with [key]="value" format', () => {
    const { copyLines } = buildAboutLines(baseAbout);
    const arsenalLines = copyLines.filter(l => l.trimStart().startsWith('['));
    expect(arsenalLines.length).toBe(2);
    expect(arsenalLines[0]).toBe('  [lang]="TypeScript"');
    expect(arsenalLines[1]).toBe('  [tool]="Vitest"');
  });

  it('HTML entities in values are escaped in displayLines but raw in copyLines', () => {
    const about: About = {
      ...baseAbout,
      arsenal: [{ key: 'test', value: 'a & b < c' }],
    };
    const { displayLines, copyLines } = buildAboutLines(about);

    const displayArsenal = displayLines.find(l => l.includes('[test]') || l.includes('property">test'));
    expect(displayArsenal).toContain('a &amp; b &lt; c');

    const copyArsenal = copyLines.find(l => l.includes('[test]'));
    expect(copyArsenal).toContain('a & b < c');
  });
});
