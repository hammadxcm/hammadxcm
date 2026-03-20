/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../achievements', () => ({ trackEvent: vi.fn() }));

import { destroyCommandPalette, initCommandPalette } from '../interactions/command-palette';

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
    destroyCommandPalette();
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
    const results = document.getElementById('cmdPaletteResults');
    expect(results?.innerHTML).toContain('About');
  });

  it('filters results on input', () => {
    initCommandPalette();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    const input = document.getElementById('cmdPaletteInput') as HTMLInputElement;
    input.value = 'proj';
    input.dispatchEvent(new Event('input'));
    const results = document.getElementById('cmdPaletteResults');
    expect(results?.innerHTML).toContain('My Project');
  });

  it('shows no results for non-matching query', () => {
    initCommandPalette();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    const input = document.getElementById('cmdPaletteInput') as HTMLInputElement;
    input.value = 'zzzzzzz';
    input.dispatchEvent(new Event('input'));
    const results = document.getElementById('cmdPaletteResults');
    expect(results?.innerHTML).toContain('No results');
  });

  it('closes on overlay click', () => {
    initCommandPalette();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    const overlay = document.getElementById('cmdPaletteOverlay');
    overlay?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    // Click target is the overlay itself
    expect(overlay?.classList.contains('open')).toBe(false);
  });

  it('toggles with Ctrl+K', () => {
    initCommandPalette();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    expect(document.getElementById('cmdPaletteOverlay')?.classList.contains('open')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    expect(document.getElementById('cmdPaletteOverlay')?.classList.contains('open')).toBe(false);
  });

  it('destroy prevents duplicate listeners on re-init', () => {
    initCommandPalette();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    expect(document.getElementById('cmdPaletteOverlay')?.classList.contains('open')).toBe(true);

    // Destroy aborts listeners
    destroyCommandPalette();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    // Listener was aborted, so Ctrl+K no longer toggles
    expect(document.getElementById('cmdPaletteOverlay')?.classList.contains('open')).toBe(true);

    // Re-init works
    initCommandPalette();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    expect(document.getElementById('cmdPaletteOverlay')?.classList.contains('open')).toBe(false);
  });

  it('skips re-init when already initialized', () => {
    initCommandPalette();
    // Second call is a no-op (no duplicate listeners)
    initCommandPalette();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    expect(document.getElementById('cmdPaletteOverlay')?.classList.contains('open')).toBe(true);
    // Toggle back — only one listener, so single toggle
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    expect(document.getElementById('cmdPaletteOverlay')?.classList.contains('open')).toBe(false);
  });

  it('navigates results with arrow keys', () => {
    initCommandPalette();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    const results = document.getElementById('cmdPaletteResults');
    expect(results?.querySelector('.cmd-item.active')).toBeTruthy();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    const items = results?.querySelectorAll('.cmd-item') ?? [];
    if (items.length > 1) {
      expect(items[1]?.classList.contains('active')).toBe(true);
    }

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(items[0]?.classList.contains('active')).toBe(true);
  });

  it('selects section result with Enter and scrolls', () => {
    // Add a target section element
    const section = document.createElement('div');
    section.id = 'about';
    document.body.appendChild(section);

    initCommandPalette();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    // First item should be "About" section
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    // Palette should close after selecting
    expect(document.getElementById('cmdPaletteOverlay')?.classList.contains('open')).toBe(false);
  });

  it('clicks on result item to activate', () => {
    // Add target section so scrollToSection can find it and close the palette
    const section = document.createElement('div');
    section.id = 'about';
    document.body.appendChild(section);

    initCommandPalette();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    const results = document.getElementById('cmdPaletteResults');
    const firstItem = results?.querySelector('.cmd-item') as HTMLElement;
    expect(firstItem).toBeTruthy();
    // Dispatch click on the results container with target as the item
    firstItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(document.getElementById('cmdPaletteOverlay')?.classList.contains('open')).toBe(false);
  });
});
