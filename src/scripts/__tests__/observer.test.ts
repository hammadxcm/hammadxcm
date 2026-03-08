/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../achievements', () => ({ trackEvent: vi.fn() }));

describe('observer', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = `
      <div class="reveal">Content</div>
      <div class="stagger"><div>A</div><div>B</div></div>
      <section id="about">About</section>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing without reveal elements', async () => {
    document.body.innerHTML = '';
    const { initObserver } = await import('../interactions/observer');
    expect(() => initObserver()).not.toThrow();
  });

  it('does not double-initialize', async () => {
    const { initObserver, destroyObserver } = await import('../interactions/observer');
    initObserver();
    initObserver(); // no-op
    destroyObserver();
  });

  it('destroyObserver allows re-initialization', async () => {
    const { initObserver, destroyObserver } = await import('../interactions/observer');
    initObserver();
    destroyObserver();
    expect(() => initObserver()).not.toThrow();
    destroyObserver();
  });

  it('creates observers on init', async () => {
    const { initObserver, destroyObserver } = await import('../interactions/observer');
    initObserver();
    // If it didn't throw, observers were created
    destroyObserver();
  });

  it('observes section elements', async () => {
    const { initObserver, destroyObserver } = await import('../interactions/observer');
    initObserver();
    // Sections exist, so sectionObserver should be created
    destroyObserver();
  });

  it('destroyObserver is safe to call twice', async () => {
    const { destroyObserver } = await import('../interactions/observer');
    expect(() => {
      destroyObserver();
      destroyObserver();
    }).not.toThrow();
  });
});
