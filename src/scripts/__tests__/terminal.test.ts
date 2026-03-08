/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { destroyTerminal, initTerminal } from '../pages/terminal';

function setupDOM(): void {
  document.body.innerHTML = `
    <div id="terminalBody">
      <div id="terminalOutput"></div>
      <div class="terminal-input-line">
        <span id="terminalPrompt">visitor@portfolio:~$</span>
        <input type="text" id="terminalInput" autocomplete="off" />
      </div>
    </div>
  `;
}

function typeAndEnter(text: string): void {
  const input = document.getElementById('terminalInput') as HTMLInputElement;
  input.value = text;
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
}

function getOutput(): string {
  return document.getElementById('terminalOutput')?.textContent || '';
}

describe('terminal', () => {
  beforeEach(() => {
    setupDOM();
  });

  afterEach(() => {
    destroyTerminal();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('initializes without error', () => {
    expect(() => initTerminal()).not.toThrow();
  });

  it('does not double-initialize', () => {
    initTerminal();
    initTerminal();
    expect(document.getElementById('terminalOutput')).toBeTruthy();
  });

  it('does nothing when DOM is missing', () => {
    document.body.innerHTML = '';
    expect(() => initTerminal()).not.toThrow();
  });

  it('shows welcome message on init', () => {
    initTerminal();
    const output = getOutput();
    expect(output).toContain('Welcome');
  });

  it('executes help command', () => {
    initTerminal();
    typeAndEnter('help');
    const output = getOutput();
    expect(output).toContain('ls');
    expect(output).toContain('cd');
    expect(output).toContain('cat');
  });

  it('executes pwd command', () => {
    initTerminal();
    typeAndEnter('pwd');
    const output = getOutput();
    expect(output).toContain('/home/hammad');
  });

  it('executes whoami command', () => {
    initTerminal();
    typeAndEnter('whoami');
    const output = getOutput();
    expect(output).toContain('visitor');
  });

  it('executes ls command', () => {
    initTerminal();
    typeAndEnter('ls');
    const output = getOutput();
    expect(output).toContain('about');
  });

  it('executes cd and pwd', () => {
    initTerminal();
    typeAndEnter('cd skills');
    typeAndEnter('pwd');
    const output = getOutput();
    expect(output).toContain('/home/hammad/skills');
  });

  it('handles cd to nonexistent dir', () => {
    initTerminal();
    typeAndEnter('cd nonexistent');
    const output = getOutput();
    expect(output).toContain('no such directory');
  });

  it('executes cat command', () => {
    initTerminal();
    typeAndEnter('cat about.txt');
    const output = getOutput();
    expect(output).toContain('Hammad');
  });

  it('handles cat on nonexistent file', () => {
    initTerminal();
    typeAndEnter('cat nope.txt');
    const output = getOutput();
    expect(output).toContain('No such file');
  });

  it('executes echo command', () => {
    initTerminal();
    typeAndEnter('echo hello world');
    const output = getOutput();
    expect(output).toContain('hello world');
  });

  it('executes clear command', () => {
    initTerminal();
    typeAndEnter('echo test');
    typeAndEnter('clear');
    const outputEl = document.getElementById('terminalOutput');
    expect(outputEl?.innerHTML).toBe('');
  });

  it('handles unknown command', () => {
    initTerminal();
    typeAndEnter('badcmd');
    const output = getOutput();
    expect(output).toContain('command not found');
  });

  it('executes history command', () => {
    initTerminal();
    typeAndEnter('pwd');
    typeAndEnter('history');
    const output = getOutput();
    expect(output).toContain('pwd');
  });

  it('navigates history with arrow keys', () => {
    initTerminal();
    const input = document.getElementById('terminalInput') as HTMLInputElement;
    typeAndEnter('first');
    typeAndEnter('second');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(input.value).toBe('second');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(input.value).toBe('first');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(input.value).toBe('second');
  });

  it('handles empty input', () => {
    initTerminal();
    typeAndEnter('');
    // No crash, no output added
  });

  it('executes tree command', () => {
    initTerminal();
    typeAndEnter('tree');
    const output = getOutput();
    expect(output).toContain('about');
  });

  it('allows re-init after destroy', () => {
    initTerminal();
    destroyTerminal();
    setupDOM();
    expect(() => initTerminal()).not.toThrow();
  });
});
