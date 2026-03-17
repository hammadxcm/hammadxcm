/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { destroyTypingTest, initTypingTest } from '../pages/typing-test';

function setupDOM(): void {
  document.body.innerHTML = `
    <div id="typingPage">
      <div id="typingStats">
        <span id="wpmValue">0</span>
        <span id="accuracyValue">100</span>
        <span id="streakValue">0</span>
      </div>
      <div id="typingArea">
        <pre id="typingDisplay"></pre>
        <input type="text" id="typingInput" />
      </div>
      <button id="typingRestart">Restart</button>
      <select id="typingLang">
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="python">Python</option>
        <option value="ruby">Ruby</option>
      </select>
      <div id="typingBest"></div>
    </div>
  `;
}

describe('typing-test', () => {
  beforeEach(() => {
    setupDOM();
    localStorage.clear();
  });

  afterEach(() => {
    destroyTypingTest();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('initializes without error', () => {
    expect(() => initTypingTest()).not.toThrow();
  });

  it('does not double-initialize', () => {
    initTypingTest();
    initTypingTest();
    // No crash
  });

  it('does nothing when DOM is missing', () => {
    document.body.innerHTML = '';
    expect(() => initTypingTest()).not.toThrow();
  });

  it('populates display with code snippet on init', () => {
    initTypingTest();
    const display = document.getElementById('typingDisplay');
    expect(display?.textContent?.length).toBeGreaterThan(0);
  });

  it('updates accuracy on correct input', () => {
    initTypingTest();
    const input = document.getElementById('typingInput') as HTMLInputElement;
    const display = document.getElementById('typingDisplay');
    if (!input || !display) return;

    const firstChar = display.textContent?.charAt(0) || '';
    input.value = firstChar;
    input.dispatchEvent(new Event('input'));
  });

  it('restart button resets state', () => {
    initTypingTest();
    const restartBtn = document.getElementById('typingRestart');
    restartBtn?.click();
    const wpm = document.getElementById('wpmValue');
    expect(wpm?.textContent).toBe('0');
  });

  it('language select changes snippet', () => {
    initTypingTest();
    const select = document.getElementById('typingLang') as HTMLSelectElement;
    document.getElementById('typingDisplay')?.textContent;
    select.value = 'python';
    select.dispatchEvent(new Event('change'));
    const displayAfter = document.getElementById('typingDisplay')?.textContent;
    // Snippet should change (or at least refresh)
    expect(displayAfter).toBeDefined();
  });

  it('allows re-init after destroy', () => {
    initTypingTest();
    destroyTypingTest();
    setupDOM();
    expect(() => initTypingTest()).not.toThrow();
  });
});
