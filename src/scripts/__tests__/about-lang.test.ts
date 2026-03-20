/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ThemeName } from '../types';

vi.mock('../theme-config', () => ({
  getCurrentTheme: () => 'hacker',
  getAboutTheme: () => ({
    sectionLabel: 'About',
    filename: 'about.ts',
    defaultLang: 'typescript',
    headerComment: '// Hello',
    echoMessage: 'Hello World',
  }),
}));

import { initAboutLang, updateAboutTheme } from '../interactions/about-lang';

describe('initAboutLang', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section id="about"><span class="section-label">About</span></section>
      <select id="langSwitcher"><option value="typescript">TS</option></select>
      <span id="aboutFilename">about.ts</span>
      <div id="aboutCodeBody"></div>
      <button id="copyBtn"></button>
      <script id="aboutMultiLangData" type="application/json">{"typescript":{"extension":"ts","displayLines":["line1","line2"],"copyLines":["copy1"],"commentLineIndex":0,"echoLineIndex":1,"commentPrefix":"//","printTemplate":{"display":"console.log('__MSG__')"}}}</script>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing without lang switcher', () => {
    document.body.innerHTML = '';
    expect(() => initAboutLang()).not.toThrow();
  });

  it('initializes with default theme language', () => {
    initAboutLang();
    const filename = document.getElementById('aboutFilename');
    expect(filename?.textContent).toContain('.ts');
  });

  it('updateAboutTheme updates section label', () => {
    updateAboutTheme('hacker' as ThemeName);
    const label = document.querySelector('.section-label');
    expect(label?.textContent).toBe('About');
  });

  it('updates code body on init', () => {
    initAboutLang();
    const codeBody = document.getElementById('aboutCodeBody');
    expect(codeBody?.innerHTML).toContain('code-line');
  });
});
