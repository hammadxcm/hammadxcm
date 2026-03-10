/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../achievements', () => ({ trackEvent: vi.fn() }));

import { initLangSwitcher } from '../interactions/lang-switcher';

describe('initLangSwitcher', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="langSwitcherWrap">
        <button id="langToggleBtn" aria-expanded="false">Lang</button>
        <div id="langDropdown"><a href="/es">ES</a></div>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing without elements', () => {
    document.body.innerHTML = '';
    expect(() => initLangSwitcher()).not.toThrow();
  });

  it('toggles dropdown on button click', () => {
    initLangSwitcher();
    document.getElementById('langToggleBtn')?.click();
    expect(document.getElementById('langDropdown')?.classList.contains('open')).toBe(true);
  });

  it('closes on Escape', () => {
    initLangSwitcher();
    document.getElementById('langToggleBtn')?.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.getElementById('langDropdown')?.classList.contains('open')).toBe(false);
  });

  it('closes on outside click', () => {
    initLangSwitcher();
    document.getElementById('langToggleBtn')?.click();
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(document.getElementById('langDropdown')?.classList.contains('open')).toBe(false);
  });
});
