/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../achievements', () => ({ trackEvent: vi.fn() }));

describe('initAnnotations', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = `
      <section id="about">About</section>
      <section id="tech">Tech</section>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('creates annotation badges for known sections', async () => {
    const { initAnnotations } = await import('../interactions/annotations');
    initAnnotations();
    const badges = document.querySelectorAll('.annotation-badge');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('toggles badges on backtick key', async () => {
    const { initAnnotations } = await import('../interactions/annotations');
    initAnnotations();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '`' }));
    const badge = document.querySelector('.annotation-badge') as HTMLElement;
    expect(badge.style.opacity).toBe('1');
  });

  it('hides badges on second backtick', async () => {
    const { initAnnotations } = await import('../interactions/annotations');
    initAnnotations();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '`' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '`' }));
    const badge = document.querySelector('.annotation-badge') as HTMLElement;
    expect(badge.style.opacity).toBe('0');
  });

  it('ignores backtick in input fields', async () => {
    const { initAnnotations } = await import('../interactions/annotations');
    initAnnotations();
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: '`', bubbles: true }));
  });
});
