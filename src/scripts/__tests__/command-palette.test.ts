/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../achievements', () => ({ trackEvent: vi.fn() }));

import { initCommandPalette } from '../interactions/command-palette';

const paletteData = JSON.stringify({
  sections: [{ id: 'about', label: 'About' }],
  themes: [{ id: 'hacker', label: 'Hacker' }],
  locales: [{ id: 'en', label: 'English' }],
  projects: [{ id: 'proj1', label: 'My Project', url: 'https://example.com' }],
  tech: [],
});

function setupDOM(): void {
  document.body.innerHTML = `
    <div id="cmdPaletteOverlay" aria-hidden="true">
      <input id="cmdPaletteInput" />
      <div id="cmdPaletteResults"></div>
      <script id="cmdPaletteData" type="application/json">${paletteData}</script>
    </div>
  `;
}

describe('initCommandPalette', () => {
  beforeEach(() => {
    setupDOM();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing without required elements', () => {
    document.body.innerHTML = '';
    expect(() => initCommandPalette()).not.toThrow();
  });

  it('opens on Ctrl+K', () => {
    initCommandPalette();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    expect(document.getElementById('cmdPaletteOverlay')?.classList.contains('open')).toBe(true);
  });

  it('closes on Escape', () => {
    initCommandPalette();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.getElementById('cmdPaletteOverlay')?.classList.contains('open')).toBe(false);
  });

  it('renders results on open', () => {
    initCommandPalette();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    const results = document.getElementById('cmdPaletteResults')!;
    expect(results.innerHTML).toContain('About');
  });

  it('filters results on input', () => {
    initCommandPalette();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    const input = document.getElementById('cmdPaletteInput') as HTMLInputElement;
    input.value = 'proj';
    input.dispatchEvent(new Event('input'));
    const results = document.getElementById('cmdPaletteResults')!;
    expect(results.innerHTML).toContain('My Project');
  });

  it('shows no results for non-matching query', () => {
    initCommandPalette();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    const input = document.getElementById('cmdPaletteInput') as HTMLInputElement;
    input.value = 'zzzzzzz';
    input.dispatchEvent(new Event('input'));
    const results = document.getElementById('cmdPaletteResults')!;
    expect(results.innerHTML).toContain('No results');
  });

  it('closes on overlay click', () => {
    initCommandPalette();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    const overlay = document.getElementById('cmdPaletteOverlay')!;
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    // Click target is the overlay itself
    expect(overlay.classList.contains('open')).toBe(false);
  });

  it('toggles with Ctrl+K', () => {
    initCommandPalette();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    expect(document.getElementById('cmdPaletteOverlay')?.classList.contains('open')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    expect(document.getElementById('cmdPaletteOverlay')?.classList.contains('open')).toBe(false);
  });
});
