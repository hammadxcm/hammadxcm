/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../achievements', () => ({
  getLevel: () => 1,
  getLevelName: () => 'Noob',
  getProgress: () => ({ totalXP: 0, sectionsSeen: ['hero', 'about'], scrollDistance: 0 }),
  getVisitCount: () => 5,
  trackEvent: vi.fn(),
}));
vi.mock('../constants', () => ({ ALL_SECTIONS: ['hero', 'about', 'projects'] }));
vi.mock('../global-stats', () => ({ fetchGlobalStats: () => Promise.resolve(null) }));

describe('guestbook-stats', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = `
      <div id="guestbookStats" data-prompt-beginner="Welcome!">
        <span id="gsVisitNum"></span>
        <span id="gsSections"></span>
        <span id="gsLevel"></span>
        <span id="gsPrompt"></span>
        <span id="gsSessionTime"></span>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing without container', async () => {
    document.body.innerHTML = '';
    const { initGuestbookStats } = await import('../interactions/guestbook-stats');
    expect(() => initGuestbookStats()).not.toThrow();
  });

  it('populates visit number', async () => {
    const { initGuestbookStats, destroyGuestbookStats } = await import('../interactions/guestbook-stats');
    initGuestbookStats();
    expect(document.getElementById('gsVisitNum')!.textContent).toBe('#5');
    destroyGuestbookStats();
  });

  it('shows sections seen count', async () => {
    const { initGuestbookStats, destroyGuestbookStats } = await import('../interactions/guestbook-stats');
    initGuestbookStats();
    expect(document.getElementById('gsSections')!.textContent).toBe('2/3');
    destroyGuestbookStats();
  });

  it('does not double-initialize', async () => {
    const { initGuestbookStats, destroyGuestbookStats } = await import('../interactions/guestbook-stats');
    initGuestbookStats();
    initGuestbookStats(); // no-op
    destroyGuestbookStats();
  });
});
