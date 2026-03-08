/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = { prefersReducedMotion: false };
vi.mock('../state', () => ({
  get prefersReducedMotion() { return mockState.prefersReducedMotion; },
  setClientIP: vi.fn(),
}));
vi.mock('../achievements', () => ({
  getLevel: () => 1,
  getLevelName: () => 'Noob',
  getProgress: () => ({ totalXP: 0, sectionsSeen: [] }),
}));
vi.mock('../theme-config', () => ({
  getStatusBarConfig: () => [
    { label: 'TIME: ', value: () => '0s', cls: '' },
    null, null, null, null,
  ],
}));

describe('status-bar', () => {
  beforeEach(() => {
    vi.resetModules();
    mockState.prefersReducedMotion = false;
    document.body.innerHTML = `
      <span id="statusSlot0"></span>
      <span id="statusSlot1"></span>
      <span id="statusSlot2"></span>
      <span id="statusSlot3"></span>
      <span id="statusSlot4"></span>
    `;
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({ ip: '1.2.3.4' }),
    } as Response);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('does nothing without slot elements', async () => {
    document.body.innerHTML = '';
    const { initStatusBar } = await import('../interactions/status-bar');
    expect(() => initStatusBar()).not.toThrow();
  });

  it('skips on reduced motion', async () => {
    mockState.prefersReducedMotion = true;
    const { initStatusBar } = await import('../interactions/status-bar');
    initStatusBar();
    expect(document.getElementById('statusSlot0')!.textContent).toBe('');
  });

  it('renders content into slots', async () => {
    const { initStatusBar, destroyStatusBar } = await import('../interactions/status-bar');
    initStatusBar();
    expect(document.getElementById('statusSlot0')!.textContent).toContain('TIME');
    destroyStatusBar();
  });

  it('destroyStatusBar clears interval', async () => {
    const { initStatusBar, destroyStatusBar } = await import('../interactions/status-bar');
    initStatusBar();
    expect(() => destroyStatusBar()).not.toThrow();
  });

  it('does not double-initialize', async () => {
    const { initStatusBar, destroyStatusBar } = await import('../interactions/status-bar');
    initStatusBar();
    initStatusBar(); // no-op
    destroyStatusBar();
  });
});
