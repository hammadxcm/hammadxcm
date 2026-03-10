/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../achievements', () => ({
  ACHIEVEMENTS: [
    {
      id: 'test1',
      name: 'Test',
      description: 'Desc',
      category: 'explore',
      xp: 10,
      icon: '',
      secret: false,
    },
  ],
  getLevel: () => 1,
  getLevelName: () => 'Noob',
  getXPForNextLevel: () => ({ current: 0, needed: 100, progress: 0 }),
  isUnlocked: () => false,
}));
vi.mock('../global-stats', () => ({ fetchGlobalStats: () => Promise.resolve(null) }));
vi.mock('../utils/focus-trap', () => ({ trapFocus: () => () => {} }));

import { initAchievementPanel } from '../interactions/achievement-panel';

function setupDOM(): void {
  document.body.innerHTML = `
    <div id="achievementPanelOverlay" aria-hidden="true">
      <button id="apCloseBtn">X</button>
      <div id="apLevelBadge"></div>
      <div id="apLevelName"></div>
      <div id="apXpBar"></div>
      <div id="apXpText"></div>
      <div id="apGrid"></div>
    </div>
    <button id="achievementTrophyBtn">Trophy</button>
  `;
}

describe('initAchievementPanel', () => {
  beforeEach(() => {
    setupDOM();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing without overlay', () => {
    document.body.innerHTML = '';
    expect(() => initAchievementPanel()).not.toThrow();
  });

  it('opens on trophy button click', () => {
    initAchievementPanel();
    document.getElementById('achievementTrophyBtn')?.click();
    expect(document.getElementById('achievementPanelOverlay')?.classList.contains('open')).toBe(
      true,
    );
  });

  it('closes on close button click', () => {
    initAchievementPanel();
    document.getElementById('achievementTrophyBtn')?.click();
    document.getElementById('apCloseBtn')?.click();
    expect(document.getElementById('achievementPanelOverlay')?.classList.contains('open')).toBe(
      false,
    );
  });

  it('closes on Escape', () => {
    initAchievementPanel();
    document.getElementById('achievementTrophyBtn')?.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.getElementById('achievementPanelOverlay')?.classList.contains('open')).toBe(
      false,
    );
  });

  it('renders achievement cards on open', () => {
    initAchievementPanel();
    document.getElementById('achievementTrophyBtn')?.click();
    const cards = document.querySelectorAll('.achievement-card');
    expect(cards.length).toBeGreaterThan(0);
  });
});
