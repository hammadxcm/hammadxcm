/**
 * Guestbook Stats — populates the stats card with personal + global data.
 */

import { getLevel, getLevelName, getProgress, getVisitCount, trackEvent } from '../achievements';
import { ALL_SECTIONS } from '../constants';
import { fetchGlobalStats } from '../global-stats';

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function animateValue(el: HTMLElement, target: number, duration = 800): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = formatNumber(target);
    return;
  }
  const start = performance.now();
  function tick(now: number): void {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - t) ** 3; // ease-out cubic
    el.textContent = formatNumber(Math.round(eased * target));
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function getPrompt(container: HTMLElement, level: number): string {
  const ds = container.dataset;
  if (level >= 10) return ds.promptMaster || '';
  if (level >= 7) return ds.promptAdvanced || '';
  if (level >= 4) return ds.promptIntermediate || '';
  return ds.promptBeginner || '';
}

let timerInterval: ReturnType<typeof setInterval> | undefined;
let initialized = false;

export function destroyGuestbookStats(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = undefined;
  }
  initialized = false;
}

function updateVisitorCount(stats: Record<string, number>): void {
  const visitorsEl = document.getElementById('gsGlobalVisitors');
  if (visitorsEl && stats.visit) animateValue(visitorsEl, stats.visit);
}

function updateCtfSolvers(stats: Record<string, number>): void {
  const ctfEl = document.getElementById('gsCtfSolvers');
  if (ctfEl && stats.visit && stats.ctf_solved) {
    const pct = Math.round((stats.ctf_solved / stats.visit) * 100);
    ctfEl.textContent = `${pct}% solved`;
  }
}

function updatePopularTheme(stats: Record<string, number>): void {
  const themeKeys = Object.keys(stats).filter((k) => k.startsWith('theme:'));
  if (themeKeys.length === 0) return;
  const sorted = themeKeys.sort((a, b) => stats[b] - stats[a]);
  const topTheme = sorted[0].replace('theme:', '');
  const total = themeKeys.reduce((sum, k) => sum + stats[k], 0);
  const pct = Math.round((stats[sorted[0]] / total) * 100);
  const themeEl = document.getElementById('gsPopularTheme');
  if (themeEl) themeEl.textContent = `${topTheme} (${pct}%)`;
}

function updateGlobalAchievements(stats: Record<string, number>): void {
  const achievementEl = document.getElementById('gsGlobalAchievements');
  if (achievementEl && stats.achievement_unlocked) {
    animateValue(achievementEl, stats.achievement_unlocked);
  }
}

export function initGuestbookStats(): void {
  if (initialized) return;
  const container = document.getElementById('guestbookStats');
  if (!container) return;
  initialized = true;

  // Track guestbook section reached
  trackEvent('guestbook');

  // Personal stats
  const progress = getProgress();
  const level = getLevel();

  const visitEl = document.getElementById('gsVisitNum');
  if (visitEl) visitEl.textContent = `#${getVisitCount()}`;

  const sectionsEl = document.getElementById('gsSections');
  if (sectionsEl) sectionsEl.textContent = `${progress.sectionsSeen.length}/${ALL_SECTIONS.length}`;

  const levelEl = document.getElementById('gsLevel');
  if (levelEl) levelEl.textContent = `LVL ${level} — ${getLevelName(level)}`;

  const promptEl = document.getElementById('gsPrompt');
  if (promptEl) promptEl.textContent = getPrompt(container, level);

  // Session timer
  const sessionStart = Date.now();
  const timeEl = document.getElementById('gsSessionTime');
  function updateTimer(): void {
    if (!timeEl) return;
    const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    timeEl.textContent = `${mins}:${secs}`;
  }
  updateTimer();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);

  // Global stats (async, best-effort)
  fetchGlobalStats()
    .then((stats) => {
      if (!stats) return;
      updateVisitorCount(stats);
      updateCtfSolvers(stats);
      updatePopularTheme(stats);
      updateGlobalAchievements(stats);
    })
    .catch(() => {
      /* Worker offline — silent */
    });
}

// Cleanup interval on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (timerInterval) clearInterval(timerInterval);
  });
}
