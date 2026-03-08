/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../achievements', () => ({ trackEvent: vi.fn() }));
vi.mock('../global-stats', () => ({ reportEvent: vi.fn() }));

import { initCopy } from '../interactions/copy';

describe('initCopy', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="copyBtn" data-code="console.log('hi')" data-label-copy="Copy" data-label-copied="Copied!">
        <span id="copyLabel">Copy</span>
        <svg id="copyIcon"><rect/></svg>
      </button>
    `;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('does nothing without button', () => {
    document.body.innerHTML = '';
    expect(() => initCopy()).not.toThrow();
  });

  it('copies code to clipboard on click', async () => {
    initCopy();
    document.getElementById('copyBtn')!.click();
    await vi.waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("console.log('hi')");
    });
  });

  it('updates label to Copied! on success', async () => {
    initCopy();
    document.getElementById('copyBtn')!.click();
    await vi.waitFor(() => {
      expect(document.getElementById('copyLabel')!.textContent).toBe('Copied!');
    });
  });

  it('adds copied class on success', async () => {
    initCopy();
    document.getElementById('copyBtn')!.click();
    await vi.waitFor(() => {
      expect(document.getElementById('copyBtn')!.classList.contains('copied')).toBe(true);
    });
  });

  it('restores label after timeout', async () => {
    vi.useFakeTimers();
    initCopy();
    document.getElementById('copyBtn')!.click();
    await vi.advanceTimersByTimeAsync(2100);
    expect(document.getElementById('copyLabel')!.textContent).toBe('Copy');
    vi.useRealTimers();
  });
});
