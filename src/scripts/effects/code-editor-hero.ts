import { isTouchDevice, prefersReducedMotion } from '../state';
import { getCurrentTheme } from '../theme-config';
import type { ThemeName } from '../types';
import {
  AUTOCOMPLETE_ITEMS,
  EXTENSIONS_LIST,
  GIT_STATUS,
  SETTINGS_PAIRS,
  SNIPPETS,
  TAB_LANG,
  TAB_NAMES,
  type TabName,
  TERMINAL_OUTPUT,
} from './code-editor-data';

/* ── Activity bar SVG icons (16×16 viewBox) ── */
const ACTIVITY_ICONS = [
  { title: 'Files', path: 'M4 2h5l1 1h2a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z' },
  { title: 'Search', path: 'M10.5 10.5L14 14M6.5 11a4.5 4.5 0 110-9 4.5 4.5 0 010 9z' },
  {
    title: 'Git',
    path: 'M8 2v4M8 10v4M8 6a2 2 0 104 0 2 2 0 00-4 0zM8 10a2 2 0 104 0 2 2 0 00-4 0z',
  },
  {
    title: 'Extensions',
    path: 'M3 3h4v4H3V3zm6 0h4v4H9V3zM3 9h4v4H3V9zm6 2a2 2 0 114 0 2 2 0 01-4 0z',
  },
  {
    title: 'Settings',
    path: 'M8 10a2 2 0 100-4 2 2 0 000 4zM8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41',
  },
];

/* ── Syntax highlighting ── */
const JS_KEYWORD_RE =
  /\b(const|let|var|function|async|await|return|import|from|export|if|else|new|require|for|of|while)\b/g;
const RUBY_KEYWORD_RE =
  /\b(def|end|class|module|if|else|elsif|unless|do|while|return|require|puts|nil|true|false|self|yield)\b/g;
const PYTHON_KEYWORD_RE =
  /\b(def|class|import|from|return|if|elif|else|for|in|while|with|as|try|except|raise|True|False|None|print|self|lambda|async|await)\b/g;
const STRING_RE = /("[^"]*"|'[^']*'|`[^`]*`)/g;
const JS_COMMENT_RE = /(\/\/.*)/g;
const HASH_COMMENT_RE = /(#.*)/g;
const NUMBER_RE = /\b(\d+\.?\d*)\b/g;

type LangKey = 'js' | 'rb' | 'py';

function getLangFromTab(tab: TabName): LangKey {
  if (tab.endsWith('.rb')) return 'rb';
  if (tab.endsWith('.py')) return 'py';
  return 'js';
}

function highlightLine(raw: string, lang: LangKey = 'js'): string {
  let line = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const tokens: { start: number; end: number; html: string }[] = [];

  const commentRe =
    lang === 'js'
      ? new RegExp(JS_COMMENT_RE.source, 'g')
      : new RegExp(HASH_COMMENT_RE.source, 'g');
  for (let m = commentRe.exec(line); m !== null; m = commentRe.exec(line)) {
    tokens.push({
      start: m.index,
      end: m.index + m[0].length,
      html: `<span style="color:var(--text-dim)">${m[0]}</span>`,
    });
  }

  const stringRe = new RegExp(STRING_RE.source, 'g');
  for (let m = stringRe.exec(line); m !== null; m = stringRe.exec(line)) {
    if (!tokens.some((t) => m.index >= t.start && m.index < t.end)) {
      tokens.push({
        start: m.index,
        end: m.index + m[0].length,
        html: `<span style="color:var(--accent-mint)">${m[0]}</span>`,
      });
    }
  }

  const kwSource =
    lang === 'rb'
      ? RUBY_KEYWORD_RE.source
      : lang === 'py'
        ? PYTHON_KEYWORD_RE.source
        : JS_KEYWORD_RE.source;
  const kwRe = new RegExp(kwSource, 'g');
  for (let m = kwRe.exec(line); m !== null; m = kwRe.exec(line)) {
    if (!tokens.some((t) => m.index >= t.start && m.index < t.end)) {
      tokens.push({
        start: m.index,
        end: m.index + m[0].length,
        html: `<span style="color:var(--accent)">${m[0]}</span>`,
      });
    }
  }

  const numRe = new RegExp(NUMBER_RE.source, 'g');
  for (let m = numRe.exec(line); m !== null; m = numRe.exec(line)) {
    if (!tokens.some((t) => m.index >= t.start && m.index < t.end)) {
      tokens.push({
        start: m.index,
        end: m.index + m[0].length,
        html: `<span style="color:var(--accent-blue)">${m[0]}</span>`,
      });
    }
  }

  tokens.sort((a, b) => b.start - a.start);
  for (const t of tokens) {
    line = line.slice(0, t.start) + t.html + line.slice(t.end);
  }

  return line;
}

/* ── State ── */
let initialized = false;
let editorEl: HTMLElement | null = null;
let typingTimer: number | null = null;
let autocompleteTimer: number | null = null;
let terminalTimer: number | null = null;
let terminalOutputTimer: number | null = null;
let terminalTypingTimer: number | null = null;
let cursorEl: HTMLElement | null = null;
let statusLnCol: HTMLElement | null = null;
let statusLangEl: HTMLElement | null = null;
let lineNumberEls: HTMLElement[] = [];
let autocompleteEl: HTMLElement | null = null;
let terminalEl: HTMLElement | null = null;
let clickHandlers: Array<{ el: HTMLElement; handler: EventListener }> = [];
let keyHandlers: Array<{ el: HTMLElement | Document; event: string; handler: EventListener }> = [];

// Tab state
let activeTab: TabName = 'main.js';
let currentTheme: ThemeName = 'hacker';
const tabTyped = new Map<string, boolean>();
const tabContent = new Map<string, string[]>();
let highlightedLine: number | null = null;

// Sidebar state
let sidebarEl: HTMLElement | null = null;
let searchPanelEl: HTMLElement | null = null;
let gitPanelEl: HTMLElement | null = null;
let extensionsPanelEl: HTMLElement | null = null;
let settingsPanelEl: HTMLElement | null = null;
let activeSidebarPanel: 'files' | 'search' | 'git' | 'extensions' | 'settings' | null = null;

// Terminal state
let activeTerminalTab: 'terminal' | 'problems' | 'output' = 'terminal';
let terminalContentEl: HTMLElement | null = null;
let problemsContentEl: HTMLElement | null = null;
let outputContentEl: HTMLElement | null = null;

// Command history
const commandHistory: string[] = [];
let historyIndex = -1;
const MAX_HISTORY = 20;

// Editable state
let textareaEl: HTMLTextAreaElement | null = null;
let editDebounceTimer: number | null = null;

/* ── Helpers ── */
function createSvgIcon(pathD: string): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.5');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathD);
  svg.appendChild(path);
  return svg;
}

function findAutocompleteIndex(text: string): number {
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '.' || text[i] === '(') return i;
  }
  return -1;
}

function getCurrentSnippet(): string[] {
  const cached = tabContent.get(activeTab);
  if (cached) return cached;
  const themeSnippets = SNIPPETS[currentTheme] || SNIPPETS.hacker;
  return themeSnippets[activeTab] || themeSnippets['main.js'];
}

function getCurrentTerminalData(): { command: string; output: string } {
  const themeTerminal = TERMINAL_OUTPUT[currentTheme] || TERMINAL_OUTPUT.hacker;
  return themeTerminal[activeTab] || themeTerminal['main.js'];
}

function getRawText(snippet: string[]): string {
  return snippet.join('\n');
}

/* ── Render helpers ── */
function renderCode(snippet: string[], contentEl: HTMLElement, cursor: HTMLElement): void {
  const lang = getLangFromTab(activeTab);
  const highlighted = snippet.map((l) => highlightLine(l, lang)).join('\n');
  contentEl.innerHTML = '';
  const pre = document.createElement('span');
  pre.className = 'code-editor-code-display';
  pre.innerHTML = highlighted;
  contentEl.appendChild(pre);
  contentEl.appendChild(cursor);
  if (textareaEl) contentEl.appendChild(textareaEl);
}

function updateLineNumbers(snippet: string[], activeLine?: number): void {
  const linesContainer = editorEl?.querySelector('.code-editor-lines');
  if (!linesContainer) return;

  linesContainer.innerHTML = '';
  lineNumberEls = [];
  for (let i = 1; i <= snippet.length; i++) {
    const ln = document.createElement('div');
    ln.className = 'code-editor-line-number';
    ln.textContent = String(i);
    ln.dataset.line = String(i);
    if (activeLine !== undefined && i === activeLine + 1) ln.classList.add('active');
    else if (activeLine === undefined && i === snippet.length) ln.classList.add('active');
    linesContainer.appendChild(ln);
    lineNumberEls.push(ln);
  }
}

function updateMinimap(snippet: string[]): void {
  const minimap = editorEl?.querySelector('.code-editor-minimap');
  if (!minimap) return;
  const viewport = minimap.querySelector('.code-editor-minimap-viewport');
  minimap.innerHTML = '';
  if (viewport) minimap.appendChild(viewport);
  for (const line of snippet) {
    const minimapLine = document.createElement('div');
    minimapLine.className = 'code-editor-minimap-line';
    minimapLine.style.width = `${Math.min(100, Math.max(20, line.length * 3))}%`;
    minimap.appendChild(minimapLine);
  }
}

function updateStatusLnCol(line: number, col: number): void {
  if (statusLnCol) statusLnCol.textContent = `Ln ${line}, Col ${col}`;
}

function updateStatusLang(): void {
  if (statusLangEl) statusLangEl.textContent = TAB_LANG[activeTab].lang;
}

function clearHighlightedLines(): void {
  for (const el of editorEl?.querySelectorAll('.code-editor-line-highlight') ?? []) {
    el.classList.remove('code-editor-line-highlight');
  }
  for (const ln of lineNumberEls) ln.classList.remove('highlighted');
  highlightedLine = null;
}

/* ── Tab switching ── */
function stopAllTimers(): void {
  if (typingTimer !== null) {
    clearTimeout(typingTimer);
    typingTimer = null;
  }
  if (autocompleteTimer !== null) {
    clearTimeout(autocompleteTimer);
    autocompleteTimer = null;
  }
  if (terminalTimer !== null) {
    clearTimeout(terminalTimer);
    terminalTimer = null;
  }
  if (terminalOutputTimer !== null) {
    clearTimeout(terminalOutputTimer);
    terminalOutputTimer = null;
  }
  if (terminalTypingTimer !== null) {
    clearTimeout(terminalTypingTimer);
    terminalTypingTimer = null;
  }
}

function renderTabContent(tab: TabName): void {
  stopAllTimers();
  activeTab = tab;
  highlightedLine = null;

  const contentEl = editorEl?.querySelector<HTMLElement>('.code-editor-content');
  if (!contentEl || !cursorEl) return;

  // Clear search highlights
  clearSearchHighlights();

  const snippet = getCurrentSnippet();
  const hasTyped = tabTyped.get(tab);

  // Update textarea if active
  if (textareaEl) {
    textareaEl.value = getRawText(snippet);
  }

  if (hasTyped || prefersReducedMotion) {
    // Instant render
    renderCode(snippet, contentEl, cursorEl);
    updateLineNumbers(snippet);
    updateMinimap(snippet);
    updateStatusLnCol(snippet.length, (snippet[snippet.length - 1]?.length || 0) + 1);
  } else {
    // Typing animation at faster speed for non-main tabs
    const speed = tab === 'main.js' ? 50 : 30;
    contentEl.innerHTML = '';
    contentEl.appendChild(cursorEl);
    updateLineNumbers(snippet, 0);
    updateStatusLnCol(1, 1);
    typeSnippet(snippet, contentEl, cursorEl, currentTheme, speed);
    tabTyped.set(tab, true);
  }

  // Update breadcrumbs
  const breadcrumbsEl = editorEl?.querySelector<HTMLElement>('.code-editor-breadcrumbs');
  if (breadcrumbsEl) breadcrumbsEl.textContent = `src > scripts > ${tab}`;

  // Update tabs active state
  const allTabs = editorEl?.querySelectorAll<HTMLElement>('.code-editor-tab');
  allTabs?.forEach((t) => {
    t.classList.toggle('active', t.textContent === tab);
  });

  // Update titlebar
  const titlebarText = editorEl?.querySelector<HTMLElement>('.code-editor-titlebar-text');
  if (titlebarText) titlebarText.textContent = tab;

  // Update file explorer active
  sidebarEl?.querySelectorAll('.code-editor-file-item').forEach((f) => {
    f.classList.toggle('active', f.textContent === tab);
  });

  // Update status bar language
  updateStatusLang();
}

/* ── Build editor DOM ── */
function buildEditor(snippet: string[], theme: ThemeName, container: HTMLElement): void {
  currentTheme = theme;
  activeTab = 'main.js';
  tabTyped.clear();
  tabContent.clear();
  tabTyped.set('main.js', false);
  commandHistory.length = 0;
  historyIndex = -1;

  editorEl = document.createElement('div');
  editorEl.className = 'code-editor-hero';

  // Titlebar
  const titlebar = document.createElement('div');
  titlebar.className = 'code-editor-titlebar';
  const colors = ['#ff5f57', '#ffbd2e', '#28c840'];
  for (const c of colors) {
    const dot = document.createElement('span');
    dot.className = 'code-editor-dot';
    dot.style.background = c;
    titlebar.appendChild(dot);
  }
  const titleText = document.createElement('span');
  titleText.className = 'code-editor-titlebar-text';
  titleText.textContent = 'main.js';
  titlebar.appendChild(titleText);

  // Run button in titlebar
  const runBtn = document.createElement('button');
  runBtn.className = 'code-editor-run-btn';
  runBtn.title = 'Run';
  runBtn.innerHTML =
    '<svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" stroke="none"><path d="M4 2l10 6-10 6V2z"/></svg>';
  titlebar.appendChild(runBtn);

  editorEl.appendChild(titlebar);

  // Tabs
  const tabs = document.createElement('div');
  tabs.className = 'code-editor-tabs';
  for (let i = 0; i < TAB_NAMES.length; i++) {
    const tab = document.createElement('div');
    tab.className = `code-editor-tab${i === 0 ? ' active' : ''}`;
    tab.textContent = TAB_NAMES[i];
    tabs.appendChild(tab);
  }
  editorEl.appendChild(tabs);

  // Breadcrumbs
  const breadcrumbs = document.createElement('div');
  breadcrumbs.className = 'code-editor-breadcrumbs';
  breadcrumbs.textContent = 'src > scripts > main.js';
  editorEl.appendChild(breadcrumbs);

  // Main horizontal wrapper
  const main = document.createElement('div');
  main.className = 'code-editor-main';

  // Activity bar
  const activityBar = document.createElement('div');
  activityBar.className = 'code-editor-activity-bar';
  for (let i = 0; i < ACTIVITY_ICONS.length; i++) {
    const icon = document.createElement('div');
    icon.className = `code-editor-activity-icon${i === 0 ? ' active' : ''}`;
    icon.title = ACTIVITY_ICONS[i].title;
    icon.dataset.panel = ACTIVITY_ICONS[i].title.toLowerCase();
    icon.appendChild(createSvgIcon(ACTIVITY_ICONS[i].path));
    activityBar.appendChild(icon);
  }
  main.appendChild(activityBar);

  // File explorer sidebar (hidden by default)
  sidebarEl = document.createElement('div');
  sidebarEl.className = 'code-editor-sidebar';
  buildFileExplorer(sidebarEl);
  main.appendChild(sidebarEl);

  // Search panel sidebar (hidden by default)
  searchPanelEl = document.createElement('div');
  searchPanelEl.className = 'code-editor-sidebar code-editor-search-panel';
  buildSearchPanel(searchPanelEl);
  main.appendChild(searchPanelEl);

  // Git panel (hidden by default)
  gitPanelEl = document.createElement('div');
  gitPanelEl.className = 'code-editor-sidebar code-editor-git-panel';
  buildGitPanel(gitPanelEl);
  main.appendChild(gitPanelEl);

  // Extensions panel (hidden by default)
  extensionsPanelEl = document.createElement('div');
  extensionsPanelEl.className = 'code-editor-sidebar code-editor-extensions-panel';
  buildExtensionsPanel(extensionsPanelEl);
  main.appendChild(extensionsPanelEl);

  // Settings panel (hidden by default)
  settingsPanelEl = document.createElement('div');
  settingsPanelEl.className = 'code-editor-sidebar code-editor-settings-panel';
  buildSettingsPanel(settingsPanelEl);
  main.appendChild(settingsPanelEl);

  // Body
  const body = document.createElement('div');
  body.className = 'code-editor-body';

  // Line numbers
  const lines = document.createElement('div');
  lines.className = 'code-editor-lines';
  lineNumberEls = [];
  for (let i = 1; i <= snippet.length; i++) {
    const ln = document.createElement('div');
    ln.className = 'code-editor-line-number';
    ln.textContent = String(i);
    ln.dataset.line = String(i);
    if (i === 1) ln.classList.add('active');
    lines.appendChild(ln);
    lineNumberEls.push(ln);
  }
  body.appendChild(lines);

  // Content area
  const content = document.createElement('div');
  content.className = 'code-editor-content';
  cursorEl = document.createElement('span');
  cursorEl.className = 'code-editor-cursor';
  content.appendChild(cursorEl);

  // Hidden textarea overlay for editing
  textareaEl = document.createElement('textarea');
  textareaEl.className = 'code-editor-textarea-overlay';
  textareaEl.setAttribute('spellcheck', 'false');
  textareaEl.setAttribute('autocomplete', 'off');
  textareaEl.setAttribute('autocorrect', 'off');
  textareaEl.setAttribute('autocapitalize', 'off');
  textareaEl.value = getRawText(snippet);
  content.appendChild(textareaEl);

  body.appendChild(content);

  // Copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'code-editor-copy-btn';
  copyBtn.title = 'Copy code';
  copyBtn.innerHTML =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
  body.appendChild(copyBtn);

  // Minimap (desktop only, skip on touch)
  if (!isTouchDevice) {
    const minimap = document.createElement('div');
    minimap.className = 'code-editor-minimap';
    const viewportIndicator = document.createElement('div');
    viewportIndicator.className = 'code-editor-minimap-viewport';
    minimap.appendChild(viewportIndicator);
    for (const line of snippet) {
      const minimapLine = document.createElement('div');
      minimapLine.className = 'code-editor-minimap-line';
      minimapLine.style.width = `${Math.min(100, Math.max(20, line.length * 3))}%`;
      minimap.appendChild(minimapLine);
    }
    body.appendChild(minimap);
  }

  main.appendChild(body);
  editorEl.appendChild(main);

  // Terminal panel
  terminalEl = document.createElement('div');
  terminalEl.className = 'code-editor-terminal';
  const termTabs = document.createElement('div');
  termTabs.className = 'code-editor-terminal-tabs';
  const termTabNames = ['TERMINAL', 'PROBLEMS', 'OUTPUT'];
  for (let i = 0; i < termTabNames.length; i++) {
    const tt = document.createElement('span');
    tt.className = `code-editor-terminal-tab${i === 0 ? ' active' : ''}`;
    tt.textContent = termTabNames[i];
    tt.dataset.termTab = termTabNames[i].toLowerCase();
    termTabs.appendChild(tt);
  }
  terminalEl.appendChild(termTabs);

  // Terminal content container
  terminalContentEl = document.createElement('div');
  terminalContentEl.className = 'code-editor-terminal-content';
  terminalEl.appendChild(terminalContentEl);

  // Problems content container (hidden by default)
  problemsContentEl = document.createElement('div');
  problemsContentEl.className = 'code-editor-terminal-content code-editor-terminal-problems';
  problemsContentEl.style.display = 'none';
  const problemsLine = document.createElement('div');
  problemsLine.className = 'code-editor-terminal-line output';
  problemsLine.textContent = '✓ 0 problems, 0 warnings';
  problemsContentEl.appendChild(problemsLine);
  terminalEl.appendChild(problemsContentEl);

  // Output content container (hidden by default)
  outputContentEl = document.createElement('div');
  outputContentEl.className = 'code-editor-terminal-content code-editor-terminal-output';
  outputContentEl.style.display = 'none';
  const outputLine = document.createElement('div');
  outputLine.className = 'code-editor-terminal-line output';
  outputLine.textContent = '[build] compiled successfully in 1.2s';
  outputContentEl.appendChild(outputLine);
  terminalEl.appendChild(outputContentEl);

  editorEl.appendChild(terminalEl);

  // Status bar
  const statusbar = document.createElement('div');
  statusbar.className = 'code-editor-statusbar';
  const statusLeft = document.createElement('div');
  statusLeft.className = 'code-editor-statusbar-left';
  statusLeft.innerHTML = `<span class="code-editor-statusbar-branch">${createBranchSvg()} main</span>`;
  statusbar.appendChild(statusLeft);
  const statusRight = document.createElement('div');
  statusRight.className = 'code-editor-statusbar-right';
  statusLnCol = document.createElement('span');
  statusLnCol.className = 'code-editor-statusbar-item';
  statusLnCol.textContent = 'Ln 1, Col 1';
  statusLangEl = document.createElement('span');
  statusLangEl.className = 'code-editor-statusbar-item';
  statusLangEl.textContent = TAB_LANG[activeTab].lang;
  const statusEnc = document.createElement('span');
  statusEnc.className = 'code-editor-statusbar-item code-editor-statusbar-encoding';
  statusEnc.textContent = 'UTF-8';
  statusRight.appendChild(statusLnCol);
  statusRight.appendChild(statusLangEl);
  statusRight.appendChild(statusEnc);
  statusbar.appendChild(statusRight);
  editorEl.appendChild(statusbar);

  // Autocomplete popup (hidden)
  autocompleteEl = document.createElement('div');
  autocompleteEl.className = 'code-editor-autocomplete';
  const items = AUTOCOMPLETE_ITEMS[theme] || AUTOCOMPLETE_ITEMS.hacker;
  for (let i = 0; i < items.length; i++) {
    const item = document.createElement('div');
    item.className = `code-editor-autocomplete-item${i === 0 ? ' active' : ''}`;
    const iconSpan = document.createElement('span');
    iconSpan.className = `code-editor-autocomplete-icon ${items[i].icon === 'fn' ? 'fn' : 'var'}`;
    iconSpan.textContent = items[i].icon === 'fn' ? 'f' : 'x';
    const labelSpan = document.createElement('span');
    labelSpan.className = 'code-editor-autocomplete-label';
    labelSpan.textContent = items[i].label;
    const detailSpan = document.createElement('span');
    detailSpan.className = 'code-editor-autocomplete-detail';
    detailSpan.textContent = items[i].detail;
    item.appendChild(iconSpan);
    item.appendChild(labelSpan);
    item.appendChild(detailSpan);
    autocompleteEl.appendChild(item);
  }
  body.appendChild(autocompleteEl);

  // ── Click handlers ──
  registerClickHandlers(editorEl);

  container.appendChild(editorEl);
}

/* ── File Explorer ── */
function buildFileExplorer(container: HTMLElement): void {
  const header = document.createElement('div');
  header.className = 'code-editor-sidebar-header';
  header.textContent = 'EXPLORER';
  container.appendChild(header);

  const tree = document.createElement('div');
  tree.className = 'code-editor-file-tree';

  // Folder structure
  const srcFolder = document.createElement('div');
  srcFolder.className = 'code-editor-folder';
  srcFolder.innerHTML = '<span class="code-editor-folder-name">▾ src</span>';

  const scriptsFolder = document.createElement('div');
  scriptsFolder.className = 'code-editor-folder code-editor-folder-nested';
  scriptsFolder.innerHTML = '<span class="code-editor-folder-name">▾ scripts</span>';

  for (const tab of TAB_NAMES) {
    const fileItem = document.createElement('div');
    fileItem.className = `code-editor-file-item${tab === 'main.js' ? ' active' : ''}`;
    fileItem.textContent = tab;
    scriptsFolder.appendChild(fileItem);
  }

  srcFolder.appendChild(scriptsFolder);
  tree.appendChild(srcFolder);
  container.appendChild(tree);
}

/* ── Search Panel ── */
function buildSearchPanel(container: HTMLElement): void {
  const header = document.createElement('div');
  header.className = 'code-editor-sidebar-header';
  header.textContent = 'SEARCH';
  container.appendChild(header);

  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'code-editor-search-wrapper';
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'code-editor-search-input';
  input.placeholder = 'Search...';
  inputWrapper.appendChild(input);
  container.appendChild(inputWrapper);

  const results = document.createElement('div');
  results.className = 'code-editor-search-results';
  container.appendChild(results);
}

/* ── Git Panel ── */
function buildGitPanel(container: HTMLElement): void {
  const header = document.createElement('div');
  header.className = 'code-editor-sidebar-header';
  header.textContent = 'SOURCE CONTROL';
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'code-editor-panel-content';
  for (const line of GIT_STATUS) {
    const div = document.createElement('div');
    div.className = 'code-editor-panel-line';
    if (line.includes('modified:')) div.classList.add('modified');
    else if (line.includes('Untracked:')) div.classList.add('untracked');
    div.textContent = line || '\u00A0';
    content.appendChild(div);
  }
  container.appendChild(content);
}

/* ── Extensions Panel ── */
function buildExtensionsPanel(container: HTMLElement): void {
  const header = document.createElement('div');
  header.className = 'code-editor-sidebar-header';
  header.textContent = 'EXTENSIONS';
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'code-editor-panel-content';
  for (const [name, version] of EXTENSIONS_LIST) {
    const div = document.createElement('div');
    div.className = 'code-editor-panel-line code-editor-extension-item';
    div.innerHTML = `<span class="code-editor-ext-icon">⬡</span> <span>${name}</span> <span class="code-editor-ext-version">${version}</span>`;
    content.appendChild(div);
  }
  container.appendChild(content);
}

/* ── Settings Panel ── */
function buildSettingsPanel(container: HTMLElement): void {
  const header = document.createElement('div');
  header.className = 'code-editor-sidebar-header';
  header.textContent = 'SETTINGS';
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'code-editor-panel-content';
  for (const [key, value] of SETTINGS_PAIRS) {
    const div = document.createElement('div');
    div.className = 'code-editor-panel-line code-editor-setting-item';
    div.innerHTML = `<span class="code-editor-setting-key">${key}</span>: <span class="code-editor-setting-value">${value}</span>`;
    content.appendChild(div);
  }
  container.appendChild(content);
}

function clearSearchHighlights(): void {
  const content = editorEl?.querySelector<HTMLElement>('.code-editor-content');
  if (!content) return;
  content.querySelectorAll('mark.code-editor-search-match').forEach((m) => {
    const parent = m.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(m.textContent || ''), m);
      parent.normalize();
    }
  });
  const resultsEl = searchPanelEl?.querySelector('.code-editor-search-results');
  if (resultsEl) resultsEl.textContent = '';
}

function performSearch(query: string): void {
  clearSearchHighlights();
  if (!query) return;

  const codeDisplay = editorEl?.querySelector<HTMLElement>('.code-editor-code-display');
  if (!codeDisplay) return;

  let count = 0;
  const walker = document.createTreeWalker(codeDisplay, NodeFilter.SHOW_TEXT);
  const nodesToProcess: { node: Text; indices: number[] }[] = [];

  let node: Text | null = walker.nextNode() as Text | null;
  while (node) {
    const text = node.textContent || '';
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const indices: number[] = [];
    let idx = lowerText.indexOf(lowerQuery);
    while (idx !== -1) {
      indices.push(idx);
      count++;
      idx = lowerText.indexOf(lowerQuery, idx + 1);
    }
    if (indices.length > 0) {
      nodesToProcess.push({ node, indices });
    }
    node = walker.nextNode() as Text | null;
  }

  // Process in reverse to avoid offset issues
  for (let n = nodesToProcess.length - 1; n >= 0; n--) {
    const { node: textNode, indices } = nodesToProcess[n];
    const text = textNode.textContent || '';
    const parent = textNode.parentNode;
    if (!parent) continue;

    const frag = document.createDocumentFragment();
    let lastEnd = 0;
    for (const idx of indices) {
      if (idx > lastEnd) frag.appendChild(document.createTextNode(text.slice(lastEnd, idx)));
      const mark = document.createElement('mark');
      mark.className = 'code-editor-search-match';
      mark.textContent = text.slice(idx, idx + query.length);
      frag.appendChild(mark);
      lastEnd = idx + query.length;
    }
    if (lastEnd < text.length) frag.appendChild(document.createTextNode(text.slice(lastEnd)));
    parent.replaceChild(frag, textNode);
  }

  const resultsEl = searchPanelEl?.querySelector('.code-editor-search-results');
  if (resultsEl)
    resultsEl.textContent = count > 0 ? `${count} result${count !== 1 ? 's' : ''}` : 'No results';
}

/* ── Terminal commands ── */
function addTerminalPrompt(): void {
  if (!terminalContentEl) return;

  const promptLine = document.createElement('div');
  promptLine.className = 'code-editor-terminal-prompt';

  const promptSpan = document.createElement('span');
  promptSpan.className = 'code-editor-terminal-prompt-char';
  promptSpan.textContent = '$ ';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'code-editor-terminal-input';
  input.setAttribute('spellcheck', 'false');
  input.setAttribute('autocomplete', 'off');

  promptLine.appendChild(promptSpan);
  promptLine.appendChild(input);
  terminalContentEl.appendChild(promptLine);

  // Scroll to bottom
  terminalContentEl.scrollTop = terminalContentEl.scrollHeight;

  // Reset history index for new prompt
  historyIndex = -1;

  const handler = (e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key === 'Enter') {
      e.preventDefault();
      const cmd = input.value.trim();
      input.removeEventListener('keydown', handler);
      promptLine.innerHTML = '';
      promptLine.className = 'code-editor-terminal-line';
      promptLine.textContent = `$ ${cmd}`;

      // Add to history
      if (cmd) {
        commandHistory.push(cmd);
        if (commandHistory.length > MAX_HISTORY) commandHistory.shift();
      }

      processTerminalCommand(cmd);
    } else if (ke.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      if (historyIndex === -1) historyIndex = commandHistory.length;
      if (historyIndex > 0) {
        historyIndex--;
        input.value = commandHistory[historyIndex];
      }
    } else if (ke.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        input.value = commandHistory[historyIndex];
      } else {
        historyIndex = -1;
        input.value = '';
      }
    }
  };
  input.addEventListener('keydown', handler);
  keyHandlers.push({ el: input, event: 'keydown', handler });
}

function processTerminalCommand(cmd: string): void {
  if (!terminalContentEl) return;

  const addOutput = (text: string, cls = '') => {
    const line = document.createElement('div');
    line.className = `code-editor-terminal-line${cls ? ` ${cls}` : ''}`;
    line.textContent = text;
    terminalContentEl!.appendChild(line);
  };

  if (!cmd) {
    // Empty command, just add new prompt
  } else if (cmd === 'clear') {
    terminalContentEl.innerHTML = '';
    addTerminalPrompt();
    return;
  } else if (cmd === 'help') {
    addOutput('Files:     ls, cat <file>, pwd');
    addOutput('Run:       run, node <file>, ruby <file>, python3 <file>');
    addOutput('Utility:   echo <text>, date, uptime, whoami, history');
    addOutput('Terminal:  clear, help');
  } else if (
    cmd === 'run' ||
    cmd.startsWith('node ') ||
    cmd.startsWith('ruby ') ||
    cmd.startsWith('python3 ')
  ) {
    // Check if command matches a specific file runner
    const parts = cmd.split(' ');
    if (parts.length === 2) {
      const file = parts[1] as TabName;
      if (TAB_NAMES.includes(file)) {
        const themeTerminal = TERMINAL_OUTPUT[currentTheme] || TERMINAL_OUTPUT.hacker;
        const termData = themeTerminal[file] || themeTerminal['main.js'];
        addOutput(termData.output, 'output');
      } else {
        addOutput(`Error: file not found: ${parts[1]}`);
      }
    } else {
      const termData = getCurrentTerminalData();
      addOutput(termData.output, 'output');
    }
  } else if (cmd.startsWith('cat ')) {
    const fileName = cmd.slice(4).trim() as TabName;
    if (TAB_NAMES.includes(fileName)) {
      const themeSnippets = SNIPPETS[currentTheme] || SNIPPETS.hacker;
      const snippetLines = themeSnippets[fileName] || themeSnippets['main.js'];
      for (const line of snippetLines) {
        addOutput(line || ' ');
      }
    } else {
      addOutput(`cat: ${fileName}: No such file`);
    }
  } else if (cmd.startsWith('echo ')) {
    addOutput(cmd.slice(5));
  } else if (cmd === 'whoami') {
    addOutput('visitor');
  } else if (cmd === 'ls') {
    addOutput(TAB_NAMES.join('  '));
  } else if (cmd === 'pwd') {
    addOutput('/home/visitor/project');
  } else if (cmd === 'date') {
    addOutput(new Date().toString());
  } else if (cmd === 'uptime') {
    addOutput('up 42 days, 3:14');
  } else if (cmd === 'history') {
    for (let i = 0; i < commandHistory.length; i++) {
      addOutput(`  ${i + 1}  ${commandHistory[i]}`);
    }
  } else {
    addOutput(`command not found: ${cmd}`);
  }

  addTerminalPrompt();
  terminalContentEl.scrollTop = terminalContentEl.scrollHeight;
}

function switchTerminalTab(tabName: string): void {
  activeTerminalTab = tabName as 'terminal' | 'problems' | 'output';

  if (terminalContentEl) terminalContentEl.style.display = tabName === 'terminal' ? '' : 'none';
  if (problemsContentEl) problemsContentEl.style.display = tabName === 'problems' ? '' : 'none';
  if (outputContentEl) outputContentEl.style.display = tabName === 'output' ? '' : 'none';
}

function runCurrentTab(): void {
  if (!terminalEl) return;
  terminalEl.classList.add('open');

  // Switch to terminal tab
  switchTerminalTab('terminal');
  const allTermTabs = terminalEl.querySelectorAll<HTMLElement>('.code-editor-terminal-tab');
  for (const t of allTermTabs) t.classList.toggle('active', t.dataset.termTab === 'terminal');

  if (!terminalContentEl) return;

  // Clear existing content
  terminalContentEl.innerHTML = '';

  const termData = getCurrentTerminalData();

  if (prefersReducedMotion) {
    const cmdLine = document.createElement('div');
    cmdLine.className = 'code-editor-terminal-line';
    cmdLine.textContent = termData.command;
    terminalContentEl.appendChild(cmdLine);
    const outLine = document.createElement('div');
    outLine.className = 'code-editor-terminal-line output';
    outLine.textContent = termData.output;
    terminalContentEl.appendChild(outLine);
    addTerminalPrompt();
    return;
  }

  // Type command char by char
  let cmdIndex = 0;
  const cmdSpan = document.createElement('div');
  cmdSpan.className = 'code-editor-terminal-line';
  terminalContentEl.appendChild(cmdSpan);

  function typeCmd(): void {
    if (cmdIndex < termData.command.length) {
      cmdSpan.textContent = termData.command.slice(0, cmdIndex + 1);
      cmdIndex++;
      terminalTypingTimer = window.setTimeout(typeCmd, 20);
    } else {
      terminalOutputTimer = window.setTimeout(() => {
        const outLine = document.createElement('div');
        outLine.className = 'code-editor-terminal-line output';
        outLine.textContent = termData.output;
        terminalContentEl!.appendChild(outLine);
        addTerminalPrompt();
      }, 500);
    }
  }
  typeCmd();
}

/* ── Click handler registration ── */
function addClickHandler(el: HTMLElement, handler: EventListener): void {
  el.addEventListener('click', handler);
  clickHandlers.push({ el, handler });
}

function registerClickHandlers(editor: HTMLElement): void {
  // Tab switching — now renders different code
  const allTabs = editor.querySelectorAll<HTMLElement>('.code-editor-tab');
  for (const tab of allTabs) {
    addClickHandler(tab, () => {
      const name = (tab.textContent || 'main.js') as TabName;
      if (TAB_NAMES.includes(name)) {
        renderTabContent(name);
      }
    });
  }

  // Activity bar icon switching with sidebar panels
  const allIcons = editor.querySelectorAll<HTMLElement>('.code-editor-activity-icon');
  for (const icon of allIcons) {
    addClickHandler(icon, () => {
      const panel = icon.dataset.panel as typeof activeSidebarPanel;
      const wasActive = icon.classList.contains('active');

      for (const ic of allIcons) ic.classList.remove('active');
      icon.classList.add('active');

      // Handle sidebar panels
      const panelMap: Record<string, typeof activeSidebarPanel> = {
        files: 'files',
        search: 'search',
        git: 'git',
        extensions: 'extensions',
        settings: 'settings',
      };

      const targetPanel = panelMap[panel || ''];
      if (targetPanel) {
        if (wasActive && activeSidebarPanel === targetPanel) {
          closeSidebar();
        } else {
          openSidebar(targetPanel);
        }
      } else {
        closeSidebar();
      }
    });
  }

  // File explorer clicks
  if (sidebarEl) {
    const fileItems = sidebarEl.querySelectorAll<HTMLElement>('.code-editor-file-item');
    for (const item of fileItems) {
      addClickHandler(item, () => {
        const name = item.textContent as TabName;
        if (TAB_NAMES.includes(name)) {
          renderTabContent(name);
        }
      });
    }
  }

  // Search input
  if (searchPanelEl) {
    const searchInput = searchPanelEl.querySelector<HTMLInputElement>('.code-editor-search-input');
    if (searchInput) {
      const handler = () => performSearch(searchInput.value);
      searchInput.addEventListener('input', handler);
      keyHandlers.push({ el: searchInput, event: 'input', handler });
    }
  }

  // Line number clicks
  const linesContainer = editor.querySelector<HTMLElement>('.code-editor-lines');
  if (linesContainer) {
    addClickHandler(linesContainer, (e: Event) => {
      const target = (e.target as HTMLElement).closest(
        '.code-editor-line-number',
      ) as HTMLElement | null;
      if (!target) return;
      const lineNum = parseInt(target.dataset.line || '0', 10);
      if (!lineNum) return;

      if (highlightedLine === lineNum) {
        clearHighlightedLines();
        return;
      }

      clearHighlightedLines();
      highlightedLine = lineNum;
      target.classList.add('highlighted');

      // Highlight the code line visually
      const codeDisplay = editor.querySelector('.code-editor-code-display');
      if (codeDisplay) {
        const textContent = codeDisplay.innerHTML.split('\n');
        if (textContent[lineNum - 1] !== undefined) {
          // Re-render with highlight wrapper
          const snippet = getCurrentSnippet();
          const lang = getLangFromTab(activeTab);
          const highlighted = snippet
            .map((l, i) => {
              const hl = highlightLine(l, lang);
              return i === lineNum - 1
                ? `<span class="code-editor-line-highlight">${hl}</span>`
                : hl;
            })
            .join('\n');
          const display = editor.querySelector<HTMLElement>('.code-editor-code-display');
          if (display) display.innerHTML = highlighted;
        }
      }

      updateStatusLnCol(lineNum, 1);
    });
  }

  // Copy button
  const copyBtn = editor.querySelector<HTMLElement>('.code-editor-copy-btn');
  if (copyBtn) {
    addClickHandler(copyBtn, () => {
      const snippet = getCurrentSnippet();
      const text = getRawText(snippet);
      navigator.clipboard
        .writeText(text)
        .then(() => {
          copyBtn.classList.add('copied');
          copyBtn.innerHTML =
            '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
          setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML =
              '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
          }, 1500);
        })
        .catch(() => {
          /* clipboard not available */
        });
    });
  }

  // Run button
  const runBtn = editor.querySelector<HTMLElement>('.code-editor-run-btn');
  if (runBtn) {
    addClickHandler(runBtn, () => {
      runBtn.classList.add('pulse');
      setTimeout(() => runBtn.classList.remove('pulse'), 400);
      runCurrentTab();
    });
  }

  // Terminal tab switching
  const allTermTabs = editor.querySelectorAll<HTMLElement>('.code-editor-terminal-tab');
  for (const tt of allTermTabs) {
    addClickHandler(tt, () => {
      for (const t of allTermTabs) t.classList.remove('active');
      tt.classList.add('active');
      const tabName = tt.dataset.termTab || 'terminal';
      switchTerminalTab(tabName);
    });
  }

  // Titlebar dots
  const dots = editor.querySelectorAll<HTMLElement>('.code-editor-dot');
  // Red dot — collapse
  if (dots[0]) {
    addClickHandler(dots[0], () => {
      editor.classList.remove('minimized', 'maximized');
      editor.classList.toggle('collapsed');
    });
  }
  // Yellow dot — minimize
  if (dots[1]) {
    addClickHandler(dots[1], () => {
      dots[1].classList.add('pulse');
      setTimeout(() => dots[1].classList.remove('pulse'), 400);
      editor.classList.remove('collapsed', 'maximized');
      editor.classList.toggle('minimized');
    });
  }
  // Green dot — maximize
  if (dots[2]) {
    addClickHandler(dots[2], () => {
      dots[2].classList.add('pulse');
      setTimeout(() => dots[2].classList.remove('pulse'), 400);
      editor.classList.remove('collapsed', 'minimized');
      editor.classList.toggle('maximized');
    });
  }

  // Editable code area — double-click to enter edit mode
  if (textareaEl) {
    const content = editor.querySelector<HTMLElement>('.code-editor-content');
    if (content) {
      const dblClickHandler = () => {
        if (textareaEl && document.activeElement !== textareaEl) {
          textareaEl.focus();
          content.classList.add('editing');
          if (cursorEl) cursorEl.style.display = 'none';
        }
      };
      content.addEventListener('dblclick', dblClickHandler);
      keyHandlers.push({ el: content, event: 'dblclick', handler: dblClickHandler });

      const onInput = () => {
        if (editDebounceTimer !== null) clearTimeout(editDebounceTimer);
        editDebounceTimer = window.setTimeout(() => {
          if (!textareaEl) return;
          const lines = textareaEl.value.split('\n');
          tabContent.set(activeTab, lines);

          const lang = getLangFromTab(activeTab);
          const display = editor.querySelector<HTMLElement>('.code-editor-code-display');
          if (display) {
            display.innerHTML = lines.map((l) => highlightLine(l, lang)).join('\n');
          }
          updateLineNumbers(lines);
          updateMinimap(lines);

          // Update status bar from cursor position
          const pos = textareaEl.selectionStart;
          const beforeCursor = textareaEl.value.slice(0, pos);
          const cursorLines = beforeCursor.split('\n');
          updateStatusLnCol(cursorLines.length, cursorLines[cursorLines.length - 1].length + 1);
        }, 30);
      };
      textareaEl.addEventListener('input', onInput);
      keyHandlers.push({ el: textareaEl, event: 'input', handler: onInput });

      const onSelectionChange = () => {
        if (!textareaEl || document.activeElement !== textareaEl) return;
        const pos = textareaEl.selectionStart;
        const beforeCursor = textareaEl.value.slice(0, pos);
        const cursorLines = beforeCursor.split('\n');
        updateStatusLnCol(cursorLines.length, cursorLines[cursorLines.length - 1].length + 1);
      };
      document.addEventListener('selectionchange', onSelectionChange);
      keyHandlers.push({ el: document, event: 'selectionchange', handler: onSelectionChange });

      const onBlur = () => {
        content.classList.remove('editing');
        if (cursorEl) cursorEl.style.display = '';
      };
      textareaEl.addEventListener('blur', onBlur);
      keyHandlers.push({ el: textareaEl, event: 'blur', handler: onBlur });
    }
  }
}

/* ── Sidebar control ── */
function openSidebar(panel: typeof activeSidebarPanel): void {
  activeSidebarPanel = panel;
  if (sidebarEl) sidebarEl.classList.toggle('open', panel === 'files');
  if (searchPanelEl) searchPanelEl.classList.toggle('open', panel === 'search');
  if (gitPanelEl) gitPanelEl.classList.toggle('open', panel === 'git');
  if (extensionsPanelEl) extensionsPanelEl.classList.toggle('open', panel === 'extensions');
  if (settingsPanelEl) settingsPanelEl.classList.toggle('open', panel === 'settings');

  if (panel === 'search') {
    const input = searchPanelEl?.querySelector<HTMLInputElement>('.code-editor-search-input');
    if (input) setTimeout(() => input.focus(), 100);
  }
}

function closeSidebar(): void {
  activeSidebarPanel = null;
  sidebarEl?.classList.remove('open');
  searchPanelEl?.classList.remove('open');
  gitPanelEl?.classList.remove('open');
  extensionsPanelEl?.classList.remove('open');
  settingsPanelEl?.classList.remove('open');
  clearSearchHighlights();
}

function createBranchSvg(): string {
  return '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" style="vertical-align:-2px;margin-right:3px"><path d="M5 3v6a3 3 0 003 3h1M5 3a2 2 0 100-4 2 2 0 000 4zM12 9a2 2 0 100 4 2 2 0 000-4z"/></svg>';
}

/* ── Typing animation ── */
function typeSnippet(
  snippet: string[],
  contentEl: HTMLElement,
  cursor: HTMLElement,
  _theme: ThemeName,
  speed = 50,
): void {
  const fullText = snippet.join('\n');
  let charIndex = 0;
  const autocompleteCharIndex = findAutocompleteIndex(fullText);
  let autocompleteShown = false;
  const lang = getLangFromTab(activeTab);

  function updateActiveLine(): void {
    const typed = fullText.slice(0, charIndex);
    let currentLine = 0;
    for (const ch of typed) {
      if (ch === '\n') currentLine++;
    }
    for (let i = 0; i < lineNumberEls.length; i++) {
      lineNumberEls[i].classList.toggle('active', i === currentLine);
    }
  }

  function updateStatusBar(): void {
    if (!statusLnCol) return;
    const typed = fullText.slice(0, charIndex);
    const lines = typed.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    statusLnCol.textContent = `Ln ${line}, Col ${col}`;
  }

  function showAutocomplete(): void {
    if (!autocompleteEl || autocompleteShown) return;
    autocompleteShown = true;

    if (cursorEl && autocompleteEl.parentElement) {
      const bodyRect = autocompleteEl.parentElement.getBoundingClientRect();
      const cursorRect = cursorEl.getBoundingClientRect();
      autocompleteEl.style.top = `${cursorRect.bottom - bodyRect.top + 2}px`;
      autocompleteEl.style.left = `${cursorRect.left - bodyRect.left}px`;
    }

    autocompleteEl.classList.add('visible');
    autocompleteTimer = window.setTimeout(() => {
      autocompleteEl?.classList.remove('visible');
    }, 1500);
  }

  function onTypingDone(): void {
    tabTyped.set(activeTab, true);
    // Update textarea with final content
    if (textareaEl) textareaEl.value = fullText;

    terminalTimer = window.setTimeout(() => {
      runCurrentTab();
    }, 400);
  }

  function typeNext(): void {
    if (charIndex >= fullText.length) {
      onTypingDone();
      return;
    }

    const char = fullText[charIndex];
    charIndex++;

    const typed = fullText.slice(0, charIndex);
    const typedLines = typed.split('\n');
    const highlighted = typedLines.map((l) => highlightLine(l, lang)).join('\n');
    contentEl.innerHTML = '';
    const pre = document.createElement('span');
    pre.className = 'code-editor-code-display';
    pre.innerHTML = highlighted;
    contentEl.appendChild(pre);
    contentEl.appendChild(cursor);
    // Keep textarea in DOM
    if (textareaEl && !contentEl.contains(textareaEl)) {
      contentEl.appendChild(textareaEl);
    }

    updateActiveLine();
    updateStatusBar();

    if (autocompleteCharIndex >= 0 && charIndex === autocompleteCharIndex + 1) {
      showAutocomplete();
    }

    const delay = char === '\n' ? Math.min(200, speed * 4) : speed;
    typingTimer = window.setTimeout(typeNext, delay);
  }

  typeNext();
}

/* ── Public API ── */
export function initCodeEditorHero(): void {
  if (initialized) return;

  const heroContent = document.querySelector<HTMLElement>('.hero-content');
  if (!heroContent) return;

  initialized = true;

  const theme = getCurrentTheme();
  const themeSnippets = SNIPPETS[theme] || SNIPPETS.hacker;
  const snippet = themeSnippets['main.js'];

  buildEditor(snippet, theme, heroContent);

  if (!editorEl) return;

  const content = editorEl.querySelector<HTMLElement>('.code-editor-content');
  if (!content || !cursorEl) return;

  if (prefersReducedMotion) {
    renderCode(snippet, content, cursorEl);
    if (textareaEl) textareaEl.value = getRawText(snippet);

    if (statusLnCol) {
      statusLnCol.textContent = `Ln ${snippet.length}, Col ${snippet[snippet.length - 1].length + 1}`;
    }

    for (let i = 0; i < lineNumberEls.length; i++) {
      lineNumberEls[i].classList.toggle('active', i === snippet.length - 1);
    }

    tabTyped.set('main.js', true);

    if (terminalEl) {
      terminalEl.classList.add('open');
      if (terminalContentEl) {
        const termData = getCurrentTerminalData();
        const cmdLine = document.createElement('div');
        cmdLine.className = 'code-editor-terminal-line';
        cmdLine.textContent = termData.command;
        terminalContentEl.appendChild(cmdLine);
        const outLine = document.createElement('div');
        outLine.className = 'code-editor-terminal-line output';
        outLine.textContent = termData.output;
        terminalContentEl.appendChild(outLine);
        addTerminalPrompt();
      }
    }
    return;
  }

  typeSnippet(snippet, content, cursorEl, theme);
}

export function destroyCodeEditorHero(): void {
  stopAllTimers();
  if (editDebounceTimer !== null) {
    clearTimeout(editDebounceTimer);
    editDebounceTimer = null;
  }
  for (const { el, handler } of clickHandlers) {
    el.removeEventListener('click', handler);
  }
  clickHandlers = [];
  for (const { el, event, handler } of keyHandlers) {
    el.removeEventListener(event, handler);
  }
  keyHandlers = [];
  if (editorEl?.parentNode) {
    editorEl.parentNode.removeChild(editorEl);
  }
  editorEl = null;
  cursorEl = null;
  statusLnCol = null;
  statusLangEl = null;
  lineNumberEls = [];
  autocompleteEl = null;
  terminalEl = null;
  terminalContentEl = null;
  problemsContentEl = null;
  outputContentEl = null;
  sidebarEl = null;
  searchPanelEl = null;
  gitPanelEl = null;
  extensionsPanelEl = null;
  settingsPanelEl = null;
  textareaEl = null;
  tabTyped.clear();
  tabContent.clear();
  highlightedLine = null;
  activeSidebarPanel = null;
  activeTerminalTab = 'terminal';
  commandHistory.length = 0;
  historyIndex = -1;
  initialized = false;
}

/* ── Expose for testing ── */
export { AUTOCOMPLETE_ITEMS, SNIPPETS, TERMINAL_OUTPUT } from './code-editor-data';
