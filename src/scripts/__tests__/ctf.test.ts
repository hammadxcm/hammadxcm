/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../achievements', () => ({ trackEvent: vi.fn() }));

describe('ctf', () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
    document.body.innerHTML = `
      <section id="certs"></section>
      <div class="footer-wave"></div>
      <div id="ctfOverlay"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('skips if already solved', async () => {
    sessionStorage.setItem('ctf-solved', 'true');
    const { initCTF } = await import('../interactions/ctf');
    initCTF();
    expect((window as any).__ctfSubmit).toBeUndefined();
  });

  it('adds ctf clue to certs section', async () => {
    const { initCTF } = await import('../interactions/ctf');
    initCTF();
    const clue = document.querySelector('[data-ctf-clue]');
    expect(clue).not.toBeNull();
  });

  it('adds title to footer wave', async () => {
    const { initCTF } = await import('../interactions/ctf');
    initCTF();
    const wave = document.querySelector('.footer-wave');
    expect(wave!.getAttribute('title')).toContain('CTF');
  });

  it('__ctfSubmit returns true for correct passphrase', async () => {
    const { initCTF } = await import('../interactions/ctf');
    initCTF();
    expect((window as any).__ctfSubmit('HACKTHESITE!')).toBe(true);
  });
});
