/**
 * Achievement Panel — renders achievements into the modal grid and manages open/close.
 */

import {
  ACHIEVEMENTS,
  getLevel,
  getLevelName,
  getXPForNextLevel,
  isUnlocked,
} from '../achievements';
import { fetchGlobalStats } from '../global-stats';

export function initAchievementPanel(): void {
  const overlay = document.getElementById('achievementPanelOverlay');
  const closeBtn = document.getElementById('apCloseBtn');
  const trophyBtn = document.getElementById('achievementTrophyBtn');
  const grid = document.getElementById('apGrid');

  if (!overlay || !grid) return;

  const crosshair = document.getElementById('crosshairCursor');
  const cursorTrail = document.getElementById('cursorTrail');

  function open(): void {
    render();
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    // Lift cursor above modal
    if (crosshair) crosshair.style.zIndex = '10002';
    if (cursorTrail) cursorTrail.style.zIndex = '10002';
  }

  function close(): void {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    // Restore default z-index
    if (crosshair) crosshair.style.zIndex = '';
    if (cursorTrail) cursorTrail.style.zIndex = '';
  }

  function render(): void {
    const level = getLevel();
    const levelName = getLevelName(level);
    const xp = getXPForNextLevel();

    const badgeEl = document.getElementById('apLevelBadge');
    const nameEl = document.getElementById('apLevelName');
    const barEl = document.getElementById('apXpBar');
    const textEl = document.getElementById('apXpText');

    if (badgeEl) badgeEl.textContent = `LVL ${level}`;
    if (nameEl) nameEl.textContent = levelName;
    if (barEl) barEl.style.width = `${Math.round(xp.progress * 100)}%`;
    if (textEl) textEl.textContent = `${xp.current} / ${xp.needed} XP`;

    // Build achievement cards
    grid.innerHTML = '';
    const categories = ['explore', 'interact', 'discover', 'social'] as const;
    for (const cat of categories) {
      const items = ACHIEVEMENTS.filter((a) => a.category === cat);
      for (const a of items) {
        const unlocked = isUnlocked(a.id);
        const card = document.createElement('div');
        card.className = `achievement-card${unlocked ? ' unlocked' : ' locked'}`;

        if (a.secret && !unlocked) {
          card.innerHTML = `
            <span class="ac-icon">???</span>
            <div class="ac-info">
              <span class="ac-name">???</span>
              <span class="ac-desc">Hidden achievement</span>
            </div>
            <span class="ac-xp">+${a.xp} XP</span>
          `;
        } else {
          card.innerHTML = `
            <span class="ac-icon"><svg viewBox="0 0 24 24">${a.icon}</svg></span>
            <div class="ac-info">
              <span class="ac-name">${a.name}</span>
              <span class="ac-desc">${a.description}</span>
              <span class="ac-rarity" data-achievement-id="${a.id}"></span>
            </div>
            <span class="ac-xp${unlocked ? ' earned' : ''}">+${a.xp} XP</span>
          `;
        }
        grid.appendChild(card);
      }
    }

    // Fetch global rarity (async) — per-achievement stats via ach:{id}
    fetchGlobalStats()
      .then((stats) => {
        if (!stats || !stats.visit) return;
        for (const a of ACHIEVEMENTS) {
          const rarityEl = grid.querySelector(`[data-achievement-id="${a.id}"]`);
          if (!rarityEl) continue;
          const achCount = stats[`ach:${a.id}`] || 0;
          if (achCount > 0) {
            const pct = Math.round((achCount / stats.visit) * 100);
            rarityEl.textContent = `${Math.max(1, pct)}% of visitors`;
          }
        }
      })
      .catch(() => {
        /* silent */
      });
  }

  // Open triggers
  if (trophyBtn) trophyBtn.addEventListener('click', open);

  // Keyboard shortcut: Shift+A
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.shiftKey && e.key === 'A') {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      if (overlay.classList.contains('open')) close();
      else open();
    }
  });

  // Close triggers
  if (closeBtn) closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
}
