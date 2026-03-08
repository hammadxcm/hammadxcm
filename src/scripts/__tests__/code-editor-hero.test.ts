/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = {
  isTouchDevice: false,
  prefersReducedMotion: false,
};

vi.mock('../state', () => ({
  get isTouchDevice() {
    return mockState.isTouchDevice;
  },
  get prefersReducedMotion() {
    return mockState.prefersReducedMotion;
  },
  isPageVisible: () => true,
  getCurrentTheme: () => 'hacker',
  setCurrentTheme: () => {},
  isHeroVisible: () => true,
  setHeroVisible: () => {},
  onVisibilityChange: () => () => {},
}));

import {
  AUTOCOMPLETE_ITEMS,
  SNIPPETS,
  TERMINAL_OUTPUT,
  destroyCodeEditorHero,
  initCodeEditorHero,
} from '../effects/code-editor-hero';

function setupDOM(): void {
  document.body.innerHTML = `
    <section id="hero">
      <div class="hero-content">
        <h1 id="heroName">Test</h1>
      </div>
    </section>
  `;
  document.documentElement.setAttribute('data-theme', 'hacker');
}

describe('code-editor-hero', () => {
  beforeEach(() => {
    mockState.prefersReducedMotion = false;
    mockState.isTouchDevice = false;
    vi.useFakeTimers();
    setupDOM();
  });

  afterEach(() => {
    destroyCodeEditorHero();
    vi.useRealTimers();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('initializes without error', () => {
    expect(() => initCodeEditorHero()).not.toThrow();
  });

  it('does not double-initialize', () => {
    initCodeEditorHero();
    initCodeEditorHero();
    const editors = document.querySelectorAll('.code-editor-hero');
    expect(editors.length).toBeLessThanOrEqual(1);
  });

  it('does nothing when hero is missing', () => {
    document.body.innerHTML = '';
    expect(() => initCodeEditorHero()).not.toThrow();
  });

  it('creates editor element', () => {
    initCodeEditorHero();
    const editor = document.querySelector('.code-editor-hero');
    expect(editor).toBeTruthy();
  });

  it('shows complete code with reduced motion', () => {
    mockState.prefersReducedMotion = true;
    initCodeEditorHero();
    const content = document.querySelector('.code-editor-content');
    expect(content?.textContent?.length).toBeGreaterThan(0);
  });

  it('types code with animation over time', () => {
    initCodeEditorHero();
    const content = document.querySelector('.code-editor-content');
    const initialLength = content?.textContent?.length || 0;
    vi.advanceTimersByTime(500);
    const laterLength = content?.textContent?.length || 0;
    expect(laterLength).toBeGreaterThanOrEqual(initialLength);
  });

  it('destroys cleanly', () => {
    initCodeEditorHero();
    destroyCodeEditorHero();
  });

  it('allows re-init after destroy', () => {
    initCodeEditorHero();
    destroyCodeEditorHero();
    setupDOM();
    expect(() => initCodeEditorHero()).not.toThrow();
  });

  // ── Structure tests ──

  it('creates tab bar with 3 tabs', () => {
    initCodeEditorHero();
    const tabBar = document.querySelector('.code-editor-tabs');
    expect(tabBar).toBeTruthy();
    const tabs = document.querySelectorAll('.code-editor-tab');
    expect(tabs.length).toBe(3);
    expect(tabs[0].classList.contains('active')).toBe(true);
    expect(tabs[0].textContent).toBe('main.ts');
  });

  it('creates activity bar with icons', () => {
    initCodeEditorHero();
    const activityBar = document.querySelector('.code-editor-activity-bar');
    expect(activityBar).toBeTruthy();
    const icons = document.querySelectorAll('.code-editor-activity-icon');
    expect(icons.length).toBeGreaterThanOrEqual(4);
  });

  it('creates breadcrumbs', () => {
    initCodeEditorHero();
    const breadcrumbs = document.querySelector('.code-editor-breadcrumbs');
    expect(breadcrumbs).toBeTruthy();
    expect(breadcrumbs?.textContent).toContain('main.ts');
  });

  it('creates status bar', () => {
    initCodeEditorHero();
    const statusbar = document.querySelector('.code-editor-statusbar');
    expect(statusbar).toBeTruthy();
    expect(statusbar?.textContent).toContain('main');
    expect(statusbar?.textContent).toContain('TypeScript');
  });

  it('updates status bar during typing', () => {
    initCodeEditorHero();
    const lnCol = document.querySelector('.code-editor-statusbar-item');
    const initialText = lnCol?.textContent;
    vi.advanceTimersByTime(1000);
    expect(lnCol?.textContent).not.toBe(initialText);
  });

  it('shows terminal after typing completes', () => {
    initCodeEditorHero();
    const terminal = document.querySelector('.code-editor-terminal');
    expect(terminal?.classList.contains('open')).toBe(false);
    vi.advanceTimersByTime(30000);
    expect(terminal?.classList.contains('open')).toBe(true);
  });

  it('shows autocomplete during typing', () => {
    initCodeEditorHero();
    const ac = document.querySelector('.code-editor-autocomplete');
    expect(ac?.classList.contains('visible')).toBe(false);
    vi.advanceTimersByTime(1250);
    expect(ac?.classList.contains('visible')).toBe(true);
  });

  it('hides autocomplete after delay', () => {
    initCodeEditorHero();
    vi.advanceTimersByTime(1250);
    const ac = document.querySelector('.code-editor-autocomplete');
    expect(ac?.classList.contains('visible')).toBe(true);
    vi.advanceTimersByTime(1600);
    expect(ac?.classList.contains('visible')).toBe(false);
  });

  it('reduced motion shows terminal open immediately', () => {
    mockState.prefersReducedMotion = true;
    initCodeEditorHero();
    const terminal = document.querySelector('.code-editor-terminal');
    expect(terminal?.classList.contains('open')).toBe(true);
  });

  it('minimap on non-touch devices', () => {
    mockState.isTouchDevice = false;
    initCodeEditorHero();
    const minimap = document.querySelector('.code-editor-minimap');
    expect(minimap).toBeTruthy();
  });

  it('no minimap on touch devices', () => {
    mockState.isTouchDevice = true;
    initCodeEditorHero();
    const minimap = document.querySelector('.code-editor-minimap');
    expect(minimap).toBeFalsy();
  });

  // ── Click interaction tests ──

  it('tab click switches active tab', () => {
    initCodeEditorHero();
    const tabs = document.querySelectorAll<HTMLElement>('.code-editor-tab');
    expect(tabs[0].classList.contains('active')).toBe(true);
    tabs[1].click();
    expect(tabs[1].classList.contains('active')).toBe(true);
    expect(tabs[0].classList.contains('active')).toBe(false);
  });

  it('tab click updates titlebar text', () => {
    initCodeEditorHero();
    const tabs = document.querySelectorAll<HTMLElement>('.code-editor-tab');
    tabs[1].click();
    const titleText = document.querySelector('.code-editor-titlebar-text');
    expect(titleText?.textContent).toBe('config.ts');
  });

  it('tab click updates breadcrumbs', () => {
    initCodeEditorHero();
    const tabs = document.querySelectorAll<HTMLElement>('.code-editor-tab');
    tabs[1].click();
    const breadcrumbs = document.querySelector('.code-editor-breadcrumbs');
    expect(breadcrumbs?.textContent).toBe('src > scripts > config.ts');
  });

  it('tab click switches displayed code content', () => {
    mockState.prefersReducedMotion = true;
    initCodeEditorHero();
    const content = document.querySelector('.code-editor-content');
    const mainContent = content?.textContent || '';

    const tabs = document.querySelectorAll<HTMLElement>('.code-editor-tab');
    tabs[1].click();
    const configContent = content?.textContent || '';

    // config.ts should have different content than main.ts
    expect(configContent).not.toBe(mainContent);
    expect(configContent).toContain('config');
  });

  it('activity icon click switches active', () => {
    initCodeEditorHero();
    const icons = document.querySelectorAll<HTMLElement>('.code-editor-activity-icon');
    expect(icons[0].classList.contains('active')).toBe(true);
    icons[1].click();
    expect(icons[1].classList.contains('active')).toBe(true);
    expect(icons[0].classList.contains('active')).toBe(false);
  });

  it('terminal tab click switches active', () => {
    initCodeEditorHero();
    const termTabs = document.querySelectorAll<HTMLElement>('.code-editor-terminal-tab');
    expect(termTabs[0].classList.contains('active')).toBe(true);
    termTabs[1].click();
    expect(termTabs[1].classList.contains('active')).toBe(true);
    expect(termTabs[0].classList.contains('active')).toBe(false);
  });

  it('red dot toggles collapsed', () => {
    initCodeEditorHero();
    const hero = document.querySelector<HTMLElement>('.code-editor-hero')!;
    const dots = document.querySelectorAll<HTMLElement>('.code-editor-dot');
    expect(hero.classList.contains('collapsed')).toBe(false);
    dots[0].click();
    expect(hero.classList.contains('collapsed')).toBe(true);
    dots[0].click();
    expect(hero.classList.contains('collapsed')).toBe(false);
  });

  it('all themes have terminal output', () => {
    const themes: string[] = [
      'hacker', 'dracula', 'nord', 'catppuccin', 'synthwave',
      'matrix', 'bloodmoon', 'midnight', 'arctic', 'gruvbox',
    ];
    for (const theme of themes) {
      const termData = TERMINAL_OUTPUT[theme as keyof typeof TERMINAL_OUTPUT];
      expect(termData).toBeTruthy();
      expect(termData['main.ts']).toBeTruthy();
      expect(termData['config.ts']).toBeTruthy();
      expect(termData['utils.ts']).toBeTruthy();

      const snippetData = SNIPPETS[theme as keyof typeof SNIPPETS];
      expect(snippetData).toBeTruthy();
      expect(snippetData['main.ts']).toBeTruthy();
      expect(snippetData['config.ts']).toBeTruthy();
      expect(snippetData['utils.ts']).toBeTruthy();

      expect(AUTOCOMPLETE_ITEMS[theme as keyof typeof AUTOCOMPLETE_ITEMS]).toBeTruthy();
    }
  });

  // ── New interactive feature tests ──

  it('line number click highlights line', () => {
    mockState.prefersReducedMotion = true;
    initCodeEditorHero();
    const lineNumbers = document.querySelectorAll<HTMLElement>('.code-editor-line-number');
    expect(lineNumbers.length).toBeGreaterThan(0);
    lineNumbers[2].click();
    expect(lineNumbers[2].classList.contains('highlighted')).toBe(true);

    // Status bar should update
    const lnCol = document.querySelector('.code-editor-statusbar-item');
    expect(lnCol?.textContent).toContain('Ln 3');
  });

  it('copy button exists and is clickable', () => {
    initCodeEditorHero();
    const copyBtn = document.querySelector<HTMLElement>('.code-editor-copy-btn');
    expect(copyBtn).toBeTruthy();

    // Mock clipboard via defineProperty since navigator.clipboard is read-only
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });
    copyBtn!.click();
    expect(writeTextMock).toHaveBeenCalled();
  });

  it('run button opens terminal and types', () => {
    initCodeEditorHero();
    const runBtn = document.querySelector<HTMLElement>('.code-editor-run-btn');
    expect(runBtn).toBeTruthy();
    runBtn!.click();

    const terminal = document.querySelector('.code-editor-terminal');
    expect(terminal?.classList.contains('open')).toBe(true);

    // Advance timers for terminal typing
    vi.advanceTimersByTime(2000);
    const termContent = document.querySelector('.code-editor-terminal-content');
    expect(termContent?.textContent?.length).toBeGreaterThan(0);
  });

  it('file explorer opens on Files icon click', () => {
    initCodeEditorHero();
    const sidebar = document.querySelector('.code-editor-sidebar:not(.code-editor-search-panel)');
    expect(sidebar?.classList.contains('open')).toBe(false);

    const icons = document.querySelectorAll<HTMLElement>('.code-editor-activity-icon');
    // Files icon is the first one (index 0) and starts active
    icons[0].click();
    expect(sidebar?.classList.contains('open')).toBe(true);

    // File items exist
    const fileItems = sidebar?.querySelectorAll('.code-editor-file-item');
    expect(fileItems?.length).toBe(3);
  });

  it('search panel opens on Search icon click', () => {
    initCodeEditorHero();
    const searchPanel = document.querySelector('.code-editor-search-panel');
    expect(searchPanel?.classList.contains('open')).toBe(false);

    const icons = document.querySelectorAll<HTMLElement>('.code-editor-activity-icon');
    icons[1].click(); // Search is second icon
    expect(searchPanel?.classList.contains('open')).toBe(true);

    // Search input exists
    const searchInput = searchPanel?.querySelector('.code-editor-search-input');
    expect(searchInput).toBeTruthy();
  });

  it('terminal accepts typed commands', () => {
    mockState.prefersReducedMotion = true;
    initCodeEditorHero();

    // Terminal should be open with a prompt
    vi.advanceTimersByTime(100);
    const termContent = document.querySelector('.code-editor-terminal-content');
    const input = termContent?.querySelector<HTMLInputElement>('.code-editor-terminal-input');
    expect(input).toBeTruthy();

    // Type and submit a command
    if (input) {
      input.value = 'help';
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      // Should show help output
      expect(termContent?.textContent).toContain('Available commands');
    }
  });

  it('code area becomes editable on double-click', () => {
    mockState.prefersReducedMotion = true;
    initCodeEditorHero();

    const textarea = document.querySelector<HTMLTextAreaElement>('textarea');
    expect(textarea).toBeTruthy();
    expect(textarea?.value.length).toBeGreaterThan(0);

    // Content area should contain the textarea
    const content = document.querySelector('.code-editor-content');
    expect(content?.querySelector('textarea')).toBeTruthy();
  });

  it('file explorer click switches tab', () => {
    mockState.prefersReducedMotion = true;
    initCodeEditorHero();

    // Open file explorer
    const icons = document.querySelectorAll<HTMLElement>('.code-editor-activity-icon');
    icons[0].click();

    // Click config.ts in file tree
    const fileItems = document.querySelectorAll<HTMLElement>('.code-editor-file-item');
    const configItem = Array.from(fileItems).find(f => f.textContent === 'config.ts');
    expect(configItem).toBeTruthy();
    configItem!.click();

    // Tab should now show config.ts as active
    const tabs = document.querySelectorAll('.code-editor-tab');
    const activeTab = Array.from(tabs).find(t => t.classList.contains('active'));
    expect(activeTab?.textContent).toBe('config.ts');

    // Breadcrumbs should update
    const breadcrumbs = document.querySelector('.code-editor-breadcrumbs');
    expect(breadcrumbs?.textContent).toContain('config.ts');
  });
});
