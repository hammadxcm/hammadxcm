/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { trapFocus } from '../utils/focus-trap';

describe('trapFocus', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="modal">
        <button id="first">First</button>
        <button id="second">Second</button>
        <button id="third">Third</button>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns a cleanup function', () => {
    const container = document.getElementById('modal')!;
    const release = trapFocus(container);
    expect(typeof release).toBe('function');
    release();
  });

  it('focuses first focusable element on activate', () => {
    const container = document.getElementById('modal')!;
    const release = trapFocus(container);
    expect(document.activeElement).toBe(document.getElementById('first'));
    release();
  });

  it('wraps focus from last to first on Tab', () => {
    const container = document.getElementById('modal')!;
    const release = trapFocus(container);
    const last = document.getElementById('third')!;
    last.focus();
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(document.getElementById('first'));
    release();
  });

  it('wraps focus from first to last on Shift+Tab', () => {
    const container = document.getElementById('modal')!;
    const release = trapFocus(container);
    const first = document.getElementById('first')!;
    first.focus();
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(document.getElementById('third'));
    release();
  });

  it('handles empty container', () => {
    document.body.innerHTML = '<div id="empty"></div>';
    const container = document.getElementById('empty')!;
    const release = trapFocus(container);
    expect(() => release()).not.toThrow();
  });
});
