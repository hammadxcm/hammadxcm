/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../global-stats', () => ({
  reportEvent: vi.fn(),
}));

import {
  ACHIEVEMENTS,
  destroyAchievements,
  flushPendingToasts,
  getAchievements,
  getLevel,
  getLevelName,
  getProgress,
  getVisitCount,
  getXPForNextLevel,
  initAchievements,
  isUnlocked,
  LEVEL_NAMES,
  trackEvent,
} from '../achievements';
import { reportEvent } from '../global-stats';

const STORAGE_KEY = 'hk-achievements';

function clearState(): void {
  localStorage.clear();
  sessionStorage.clear();
  destroyAchievements();
  vi.restoreAllMocks();
}

describe('ACHIEVEMENTS constant', () => {
  it('has unique ids', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every achievement has required fields', () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.id).toBeTruthy();
      expect(a.name).toBeTruthy();
      expect(a.icon).toBeTruthy();
      expect(a.description).toBeTruthy();
      expect(a.xp).toBeGreaterThan(0);
      expect(['explore', 'interact', 'discover', 'social']).toContain(a.category);
      expect(typeof a.secret).toBe('boolean');
    }
  });

  it('includes listing page achievements', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(ids).toContain('listing_explorer');
    expect(ids).toContain('listing_completionist');
    expect(ids).toContain('analytics_deep_dive');
  });

  it('listing_explorer has correct xp and category', () => {
    const a = ACHIEVEMENTS.find((a) => a.id === 'listing_explorer');
    expect(a?.xp).toBe(15);
    expect(a?.category).toBe('explore');
    expect(a?.secret).toBe(false);
  });

  it('listing_completionist has correct xp and category', () => {
    const a = ACHIEVEMENTS.find((a) => a.id === 'listing_completionist');
    expect(a?.xp).toBe(50);
    expect(a?.category).toBe('explore');
  });

  it('analytics_deep_dive has correct xp and category', () => {
    const a = ACHIEVEMENTS.find((a) => a.id === 'analytics_deep_dive');
    expect(a?.xp).toBe(20);
    expect(a?.category).toBe('explore');
  });
});

describe('LEVEL_NAMES', () => {
  it('has 10 level names', () => {
    expect(LEVEL_NAMES).toHaveLength(10);
  });

  it('starts with Script Kiddie', () => {
    expect(LEVEL_NAMES[0]).toBe('Script Kiddie');
  });

  it('ends with System Architect', () => {
    expect(LEVEL_NAMES[9]).toBe('System Architect');
  });
});

describe('initAchievements', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-03-06T12:00:00Z') });
    clearState();
  });

  afterEach(() => {
    clearState();
    vi.useRealTimers();
  });

  it('initializes progress from empty localStorage', () => {
    initAchievements();
    const p = getProgress();
    expect(p.unlocked).toEqual([]);
    expect(p.totalXP).toBe(0);
    expect(p.visitDays).toHaveLength(1);
  });

  it('tracks visit day on init', () => {
    initAchievements();
    const p = getProgress();
    expect(p.visitDays).toContain('2026-03-06');
  });

  it('does not duplicate visit day on re-init same day', () => {
    initAchievements();
    destroyAchievements();
    initAchievements();
    const p = getProgress();
    const dayCount = p.visitDays.filter((d) => d === '2026-03-06').length;
    expect(dayCount).toBe(1);
  });

  it('unlocks return_visitor with 2+ visit days', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        unlocked: [],
        counters: {},
        totalXP: 0,
        visitDays: ['2026-03-05'],
        themesUsed: [],
        sectionsSeen: [],
        startTime: 0,
        scrollDistance: 0,
      }),
    );
    initAchievements();
    expect(isUnlocked('return_visitor')).toBe(true);
  });

  it('unlocks night_owl between midnight and 5am', () => {
    vi.setSystemTime(new Date('2026-03-06T02:00:00'));
    initAchievements();
    expect(isUnlocked('night_owl')).toBe(true);
  });

  it('does not unlock night_owl at 10am', () => {
    vi.setSystemTime(new Date('2026-03-06T10:00:00'));
    initAchievements();
    expect(isUnlocked('night_owl')).toBe(false);
  });

  it('unlocks early_bird between 5am and 8am', () => {
    vi.setSystemTime(new Date('2026-03-06T06:00:00'));
    initAchievements();
    expect(isUnlocked('early_bird')).toBe(true);
  });

  it('does not unlock early_bird at noon', () => {
    vi.setSystemTime(new Date('2026-03-06T12:00:00'));
    initAchievements();
    expect(isUnlocked('early_bird')).toBe(false);
  });

  it('unlocks weekend_warrior on Saturday', () => {
    // 2026-03-07 is Saturday
    vi.setSystemTime(new Date('2026-03-07T12:00:00'));
    initAchievements();
    expect(isUnlocked('weekend_warrior')).toBe(true);
  });

  it('does not unlock weekend_warrior on weekday', () => {
    // 2026-03-06 is Friday
    vi.setSystemTime(new Date('2026-03-06T12:00:00'));
    initAchievements();
    expect(isUnlocked('weekend_warrior')).toBe(false);
  });

  it('unlocks streak_3 with 3+ visit days', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        unlocked: [],
        counters: {},
        totalXP: 0,
        visitDays: ['2026-03-04', '2026-03-05'],
        themesUsed: [],
        sectionsSeen: [],
        startTime: 0,
        scrollDistance: 0,
      }),
    );
    initAchievements();
    expect(isUnlocked('streak_3')).toBe(true);
  });

  it('unlocks streak_7 with 7+ visit days', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        unlocked: [],
        counters: {},
        totalXP: 0,
        visitDays: [
          '2026-02-28',
          '2026-03-01',
          '2026-03-02',
          '2026-03-03',
          '2026-03-04',
          '2026-03-05',
        ],
        themesUsed: [],
        sectionsSeen: [],
        startTime: 0,
        scrollDistance: 0,
      }),
    );
    // This adds today (2026-03-06) making 7
    initAchievements();
    expect(isUnlocked('streak_7')).toBe(true);
  });

  it('sets up deep reader timer (3 min)', () => {
    initAchievements();
    vi.advanceTimersByTime(3 * 60 * 1000);
    expect(isUnlocked('deep_reader')).toBe(true);
  });

  it('sets up persistence timer (10 min)', () => {
    initAchievements();
    vi.advanceTimersByTime(10 * 60 * 1000);
    expect(isUnlocked('persistence_pays')).toBe(true);
  });

  it('reports global visit event', () => {
    initAchievements();
    expect(reportEvent).toHaveBeenCalledWith('visit');
  });

  it('listens for achievement-unlocked events', () => {
    document.body.innerHTML = '<div id="alert-region" aria-live="assertive"></div>';
    initAchievements();
    // Set up toast bridge
    const spawnToast = vi.fn();
    window.__achievementToast = { spawnToast };
    trackEvent('first_scroll');
    expect(spawnToast).toHaveBeenCalled();
    const alertRegion = document.getElementById('alert-region');
    expect(alertRegion?.textContent).toContain('Achievement unlocked');
    document.body.innerHTML = '';
  });

  it('listens for level-up events and shows overlay', () => {
    document.body.innerHTML = `
      <div id="levelUpOverlay" aria-hidden="true">
        <div class="levelup-content">
          <div id="levelUpNum">LEVEL 1</div>
          <div id="levelUpName">Script Kiddie</div>
        </div>
      </div>
      <div id="alert-region" aria-live="assertive"></div>
    `;
    initAchievements();
    // Earn enough XP to level up (50 XP needed for level 2)
    trackEvent('first_scroll'); // 10 XP
    trackEvent('speed_reader'); // 15 XP
    trackEvent('command_palette'); // 25 XP -> total 50 -> level 2
    const overlay = document.getElementById('levelUpOverlay');
    expect(overlay?.classList.contains('active')).toBe(true);
    expect(overlay?.getAttribute('aria-hidden')).toBe('false');
    const alertRegion = document.getElementById('alert-region');
    expect(alertRegion?.textContent).toContain('Level up');
    document.body.innerHTML = '';
  });

  it('removes overlay after 3 seconds on level-up', () => {
    document.body.innerHTML = `
      <div id="levelUpOverlay" aria-hidden="true">
        <div class="levelup-content">
          <div id="levelUpNum">LEVEL 1</div>
          <div id="levelUpName">Script Kiddie</div>
        </div>
      </div>
    `;
    initAchievements();
    trackEvent('first_scroll');
    trackEvent('speed_reader');
    trackEvent('command_palette');
    vi.advanceTimersByTime(3000);
    const overlay = document.getElementById('levelUpOverlay');
    expect(overlay?.classList.contains('active')).toBe(false);
    expect(overlay?.getAttribute('aria-hidden')).toBe('true');
    document.body.innerHTML = '';
  });

  it('does not re-initialize if already initialized', () => {
    initAchievements();
    const daysBefore = getProgress().visitDays.length;
    // Call again — should be a no-op
    initAchievements();
    expect(getProgress().visitDays.length).toBe(daysBefore);
  });

  it('loads corrupted localStorage gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json{{{');
    initAchievements();
    expect(getProgress().unlocked).toEqual([]);
  });

  it('migrates partial saved progress', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ unlocked: ['first_scroll'], totalXP: 10 }));
    initAchievements();
    const p = getProgress();
    expect(p.unlocked).toContain('first_scroll');
    expect(p.counters).toBeDefined();
    expect(p.themesUsed).toBeDefined();
  });
});

describe('destroyAchievements', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-03-06T12:00:00Z') });
    clearState();
  });

  afterEach(() => {
    clearState();
    vi.useRealTimers();
  });

  it('clears timers and event listeners', () => {
    initAchievements();
    destroyAchievements();
    // Should be able to re-init without issues
    initAchievements();
    expect(getProgress()).toBeDefined();
  });
});

describe('getLevel', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-03-06T12:00:00Z') });
    clearState();
    initAchievements();
  });

  afterEach(() => {
    clearState();
    vi.useRealTimers();
  });

  it('returns 1 for 0 XP', () => {
    expect(getLevel(0)).toBe(1);
  });

  it('returns 2 for 50 XP', () => {
    expect(getLevel(50)).toBe(2);
  });

  it('returns 10 for 1400+ XP', () => {
    expect(getLevel(1400)).toBe(10);
    expect(getLevel(9999)).toBe(10);
  });

  it('returns 1 for negative XP (fallback branch)', () => {
    expect(getLevel(-1)).toBe(1);
  });

  it('uses progress totalXP when no arg given', () => {
    expect(getLevel()).toBe(1);
  });
});

describe('getLevelName', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-03-06T12:00:00Z') });
    clearState();
    initAchievements();
  });

  afterEach(() => {
    clearState();
    vi.useRealTimers();
  });

  it('returns Script Kiddie for level 1', () => {
    expect(getLevelName(1)).toBe('Script Kiddie');
  });

  it('returns System Architect for level 10', () => {
    expect(getLevelName(10)).toBe('System Architect');
  });

  it('clamps to max level name for level > 10', () => {
    expect(getLevelName(99)).toBe('System Architect');
  });

  it('uses current level when no arg given', () => {
    expect(getLevelName()).toBe('Script Kiddie');
  });
});

describe('getXPForNextLevel', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-03-06T12:00:00Z') });
    clearState();
    initAchievements();
  });

  afterEach(() => {
    clearState();
    vi.useRealTimers();
  });

  it('returns correct next threshold for level 1', () => {
    const info = getXPForNextLevel();
    expect(info.current).toBe(0);
    expect(info.needed).toBe(50);
    expect(info.progress).toBe(0);
  });

  it('returns progress=1 when at max level', () => {
    // Seed with enough XP for max level
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        unlocked: [],
        counters: {},
        totalXP: 1500,
        visitDays: [],
        themesUsed: [],
        sectionsSeen: [],
        startTime: 0,
        scrollDistance: 0,
      }),
    );
    destroyAchievements();
    initAchievements();
    const info = getXPForNextLevel();
    expect(info.progress).toBe(1);
  });
});

describe('trackEvent + checkAchievements', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-03-06T12:00:00Z') });
    clearState();
    initAchievements();
  });

  afterEach(() => {
    clearState();
    vi.useRealTimers();
  });

  it('does nothing if progress is not initialized', () => {
    destroyAchievements();
    // Force progress to be undefined by not re-initing
    // trackEvent should bail out
    expect(() => trackEvent('first_scroll')).not.toThrow();
  });

  it('does not unlock streak_3 with fewer than 3 visit days via visit_day event', () => {
    // progress.visitDays starts with just today (1 day)
    trackEvent('visit_day');
    expect(isUnlocked('streak_3')).toBe(false);
  });

  it('does not unlock streak_7 with fewer than 7 visit days via visit_day event', () => {
    const p = getProgress();
    p.visitDays.push('2026-03-04', '2026-03-05');
    trackEvent('visit_day');
    expect(isUnlocked('streak_7')).toBe(false);
  });

  it('increments counter on trackEvent', () => {
    trackEvent('test_key');
    expect(getProgress().counters.test_key).toBe(1);
    trackEvent('test_key');
    expect(getProgress().counters.test_key).toBe(2);
  });

  it('increments by custom amount', () => {
    trackEvent('test_key', 5);
    expect(getProgress().counters.test_key).toBe(5);
  });

  // first_scroll
  it('unlocks first_scroll on first scroll', () => {
    trackEvent('first_scroll');
    expect(isUnlocked('first_scroll')).toBe(true);
  });

  // speed_reader
  it('unlocks speed_reader', () => {
    trackEvent('speed_reader');
    expect(isUnlocked('speed_reader')).toBe(true);
  });

  // deep_reader
  it('unlocks deep_reader', () => {
    trackEvent('deep_reader');
    expect(isUnlocked('deep_reader')).toBe(true);
  });

  // section tracking
  it('tracks section visits and unlocks section_explorer when all visited', () => {
    const sections = [
      'hero',
      'about',
      'tech',
      'journey',
      'projects',
      'contributions',
      'certs',
      'testimonials',
      'analytics',
      'guestbook',
    ];
    for (let i = 0; i < sections.length - 1; i++) {
      trackEvent(`section:${sections[i]}`);
    }
    expect(isUnlocked('section_explorer')).toBe(false);
    trackEvent(`section:${sections[sections.length - 1]}`);
    expect(isUnlocked('section_explorer')).toBe(true);
  });

  it('does not duplicate sections in sectionsSeen', () => {
    trackEvent('section:hero');
    trackEvent('section:hero');
    expect(getProgress().sectionsSeen.filter((s) => s === 'hero')).toHaveLength(1);
  });

  // theme tracking
  it('tracks unique themes used', () => {
    trackEvent('theme:hacker');
    trackEvent('theme:dracula');
    trackEvent('theme:hacker'); // duplicate
    expect(getProgress().themesUsed).toHaveLength(2);
  });

  it('unlocks theme_switcher after 3 switches', () => {
    trackEvent('theme_switch');
    trackEvent('theme_switch');
    expect(isUnlocked('theme_switcher')).toBe(false);
    trackEvent('theme_switch');
    expect(isUnlocked('theme_switcher')).toBe(true);
  });

  it('unlocks theme_collector with 5 unique themes', () => {
    for (const t of ['hacker', 'dracula', 'nord', 'catppuccin', 'synthwave']) {
      trackEvent(`theme:${t}`);
    }
    trackEvent('theme_switch');
    expect(isUnlocked('theme_collector')).toBe(true);
  });

  it('unlocks palette_master with 12 unique themes', () => {
    for (const t of [
      'hacker',
      'dracula',
      'nord',
      'catppuccin',
      'synthwave',
      'matrix',
      'bloodmoon',
      'midnight',
      'arctic',
      'gruvbox',
      'cyberpunk',
      'nebula',
    ]) {
      trackEvent(`theme:${t}`);
    }
    trackEvent('theme_switch');
    expect(isUnlocked('palette_master')).toBe(true);
  });

  it('unlocks all_themes with 15 unique themes', () => {
    for (const t of [
      'hacker',
      'dracula',
      'nord',
      'catppuccin',
      'synthwave',
      'matrix',
      'bloodmoon',
      'midnight',
      'arctic',
      'gruvbox',
      'cyberpunk',
      'nebula',
      'solarized',
      'rosepine',
      'monokai',
    ]) {
      trackEvent(`theme:${t}`);
    }
    trackEvent('theme_switch');
    expect(isUnlocked('all_themes')).toBe(true);
  });

  // project_clicker
  it('unlocks project_clicker after 3 clicks', () => {
    trackEvent('project_click');
    trackEvent('project_click');
    expect(isUnlocked('project_clicker')).toBe(false);
    trackEvent('project_click');
    expect(isUnlocked('project_clicker')).toBe(true);
  });

  // single-trigger achievements
  it('unlocks command_palette', () => {
    trackEvent('command_palette');
    expect(isUnlocked('command_palette')).toBe(true);
  });

  it('unlocks resume_export', () => {
    trackEvent('resume_export');
    expect(isUnlocked('resume_export')).toBe(true);
  });

  it('unlocks lang_switcher on lang_switched', () => {
    trackEvent('lang_switched');
    expect(isUnlocked('lang_switcher')).toBe(true);
  });

  it('unlocks konami and reports event', () => {
    trackEvent('konami');
    expect(isUnlocked('konami')).toBe(true);
    expect(reportEvent).toHaveBeenCalledWith('konami');
  });

  it('unlocks ctf_solved and reports event', () => {
    trackEvent('ctf_solved');
    expect(isUnlocked('ctf_solved')).toBe(true);
    expect(reportEvent).toHaveBeenCalledWith('ctf_solved');
  });

  it('unlocks annotations', () => {
    trackEvent('annotations');
    expect(isUnlocked('annotations')).toBe(true);
  });

  it('unlocks guestbook and reports event', () => {
    trackEvent('guestbook');
    expect(isUnlocked('guestbook')).toBe(true);
    expect(reportEvent).toHaveBeenCalledWith('guestbook_reached');
  });

  it('unlocks code_copier', () => {
    trackEvent('code_copy');
    expect(isUnlocked('code_copier')).toBe(true);
  });

  // social_networker
  it('unlocks social_networker after 3 clicks', () => {
    trackEvent('social_click');
    trackEvent('social_click');
    expect(isUnlocked('social_networker')).toBe(false);
    trackEvent('social_click');
    expect(isUnlocked('social_networker')).toBe(true);
  });

  // view_expander
  it('unlocks view_expander', () => {
    trackEvent('view_more');
    expect(isUnlocked('view_expander')).toBe(true);
  });

  // analytics_nerd
  it('unlocks analytics_nerd after both tabs visited', () => {
    trackEvent('github_tab');
    expect(isUnlocked('analytics_nerd')).toBe(false);
    trackEvent('leetcode_tab');
    expect(isUnlocked('analytics_nerd')).toBe(true);
  });

  it('unlocks analytics_nerd from leetcode_tab first', () => {
    trackEvent('leetcode_tab');
    expect(isUnlocked('analytics_nerd')).toBe(false);
    trackEvent('github_tab');
    expect(isUnlocked('analytics_nerd')).toBe(true);
  });

  // marathon_scroller
  it('unlocks marathon_scroller at 5000px distance', () => {
    const p = getProgress();
    p.scrollDistance = 5000;
    trackEvent('scroll_distance');
    expect(isUnlocked('marathon_scroller')).toBe(true);
  });

  it('does not unlock marathon_scroller below 5000px', () => {
    const p = getProgress();
    p.scrollDistance = 4999;
    trackEvent('scroll_distance');
    expect(isUnlocked('marathon_scroller')).toBe(false);
  });

  // visit_day streaks
  it('unlocks streak_3 via visit_day event', () => {
    const p = getProgress();
    p.visitDays.push('2026-03-04', '2026-03-05');
    trackEvent('visit_day');
    expect(isUnlocked('streak_3')).toBe(true);
  });

  it('unlocks streak_7 via visit_day event', () => {
    const p = getProgress();
    p.visitDays.push(
      '2026-02-28',
      '2026-03-01',
      '2026-03-02',
      '2026-03-03',
      '2026-03-04',
      '2026-03-05',
    );
    trackEvent('visit_day');
    expect(isUnlocked('streak_7')).toBe(true);
  });

  // weekend_warrior / early_bird via event
  it('unlocks weekend_warrior via event', () => {
    trackEvent('weekend_warrior');
    expect(isUnlocked('weekend_warrior')).toBe(true);
  });

  it('unlocks early_bird via event', () => {
    trackEvent('early_bird');
    expect(isUnlocked('early_bird')).toBe(true);
  });

  // persistence_pays
  it('unlocks persistence_pays via event', () => {
    trackEvent('persistence_pays');
    expect(isUnlocked('persistence_pays')).toBe(true);
  });

  // full_circle
  it('unlocks full_circle', () => {
    trackEvent('full_circle');
    expect(isUnlocked('full_circle')).toBe(true);
  });

  // linguist
  it('unlocks linguist after 3 language switches', () => {
    trackEvent('lang_switched');
    trackEvent('lang_switched');
    expect(isUnlocked('linguist')).toBe(false);
    trackEvent('lang_switched');
    expect(isUnlocked('linguist')).toBe(true);
  });

  // rapid_switcher
  it('unlocks rapid_switcher', () => {
    trackEvent('rapid_switcher');
    expect(isUnlocked('rapid_switcher')).toBe(true);
  });

  // ── Listing page achievements ──

  it('unlocks listing_explorer on listing_visit', () => {
    trackEvent('listing_visit');
    expect(isUnlocked('listing_explorer')).toBe(true);
  });

  it('unlocks analytics_deep_dive on listing:analytics', () => {
    trackEvent('listing:analytics');
    expect(isUnlocked('analytics_deep_dive')).toBe(true);
  });

  it('does not unlock listing_completionist with partial visits', () => {
    trackEvent('listing:testimonials');
    trackEvent('listing:projects');
    trackEvent('listing:contributions');
    trackEvent('listing:certifications');
    expect(isUnlocked('listing_completionist')).toBe(false);
  });

  it('unlocks listing_completionist when all 5 listing pages visited', () => {
    trackEvent('listing:testimonials');
    trackEvent('listing:projects');
    trackEvent('listing:contributions');
    trackEvent('listing:certifications');
    trackEvent('listing:analytics');
    expect(isUnlocked('listing_completionist')).toBe(true);
  });

  it('listing_completionist not triggered by non-listing: prefixed events', () => {
    trackEvent('listing_visit');
    expect(isUnlocked('listing_completionist')).toBe(false);
  });

  // achievement not re-awarded
  it('does not double-award an achievement', () => {
    trackEvent('first_scroll');
    const xpAfterFirst = getProgress().totalXP;
    trackEvent('first_scroll');
    expect(getProgress().totalXP).toBe(xpAfterFirst);
  });

  // unknown achievement id
  it('ignores unlock of unknown achievement id', () => {
    // Indirectly — tracking an unknown trigger should not crash
    trackEvent('nonexistent_trigger');
    expect(getProgress().totalXP).toBe(0);
  });
});

describe('completionist achievement', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-03-07T12:00:00Z') }); // Saturday for weekend_warrior
    clearState();
  });

  afterEach(() => {
    clearState();
    vi.useRealTimers();
  });

  it('unlocks completionist when all non-secret achievements are unlocked', () => {
    // Seed progress with 7+ visit days for streak_7
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        unlocked: [],
        counters: {},
        totalXP: 0,
        visitDays: [
          '2026-03-01',
          '2026-03-02',
          '2026-03-03',
          '2026-03-04',
          '2026-03-05',
          '2026-03-06',
        ],
        themesUsed: [],
        sectionsSeen: [],
        startTime: 0,
        scrollDistance: 5000,
      }),
    );
    initAchievements();
    // weekend_warrior auto-unlocked (Saturday)
    // streak_3, streak_7, return_visitor auto-unlocked (7 days)

    // Trigger all non-secret achievements
    trackEvent('first_scroll');
    trackEvent('speed_reader');
    trackEvent('deep_reader');
    trackEvent('persistence_pays');

    // section_explorer
    for (const s of [
      'hero',
      'about',
      'tech',
      'journey',
      'projects',
      'contributions',
      'certs',
      'testimonials',
      'analytics',
      'guestbook',
    ]) {
      trackEvent(`section:${s}`);
    }

    // marathon_scroller
    trackEvent('scroll_distance');

    // theme achievements
    for (const t of [
      'hacker',
      'dracula',
      'nord',
      'catppuccin',
      'synthwave',
      'matrix',
      'bloodmoon',
      'midnight',
      'arctic',
      'gruvbox',
      'cyberpunk',
      'nebula',
      'solarized',
      'rosepine',
      'monokai',
    ]) {
      trackEvent(`theme:${t}`);
    }
    for (let i = 0; i < 3; i++) trackEvent('theme_switch');

    // interact
    for (let i = 0; i < 3; i++) trackEvent('project_click');
    trackEvent('command_palette');
    trackEvent('resume_export');
    trackEvent('lang_switched');
    trackEvent('lang_switched');
    trackEvent('lang_switched'); // linguist
    trackEvent('code_copy');
    for (let i = 0; i < 3; i++) trackEvent('social_click');
    trackEvent('view_more');
    trackEvent('github_tab');
    trackEvent('leetcode_tab');

    // social
    trackEvent('guestbook');

    // listing
    trackEvent('listing_visit');
    trackEvent('listing:testimonials');
    trackEvent('listing:projects');
    trackEvent('listing:contributions');
    trackEvent('listing:certifications');
    trackEvent('listing:analytics');

    // New achievements unlocked via achievement-trigger events
    window.dispatchEvent(new CustomEvent('achievement-trigger', { detail: 'terminal_explorer' }));
    window.dispatchEvent(new CustomEvent('achievement-trigger', { detail: 'terminal_hacker' }));
    window.dispatchEvent(new CustomEvent('achievement-trigger', { detail: 'speed_demon' }));
    window.dispatchEvent(new CustomEvent('achievement-trigger', { detail: 'perfect_accuracy' }));
    window.dispatchEvent(new CustomEvent('achievement-trigger', { detail: 'ai_chat' }));

    // Trigger completionist check
    trackEvent('completionist_check');

    expect(isUnlocked('completionist')).toBe(true);
  });
});

describe('getProgress / getAchievements / isUnlocked / getVisitCount', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-03-06T12:00:00Z') });
    clearState();
    initAchievements();
  });

  afterEach(() => {
    clearState();
    vi.useRealTimers();
  });

  it('getAchievements returns the ACHIEVEMENTS array', () => {
    expect(getAchievements()).toBe(ACHIEVEMENTS);
  });

  it('isUnlocked returns false for not-unlocked achievements', () => {
    expect(isUnlocked('konami')).toBe(false);
  });

  it('isUnlocked returns true after unlock', () => {
    trackEvent('konami');
    expect(isUnlocked('konami')).toBe(true);
  });

  it('getVisitCount returns number of visit days', () => {
    expect(getVisitCount()).toBe(1);
  });
});

describe('flushPendingToasts', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-03-06T12:00:00Z') });
    clearState();
    initAchievements();
  });

  afterEach(() => {
    clearState();
    vi.useRealTimers();
  });

  it('does nothing with no pending toasts', () => {
    const spawnToast = vi.fn();
    window.__achievementToast = { spawnToast };
    flushPendingToasts();
    expect(spawnToast).not.toHaveBeenCalled();
  });

  it('flushes pending toasts from sessionStorage', () => {
    sessionStorage.setItem('hk-pending-toasts', JSON.stringify(['toast1', 'toast2']));
    const spawnToast = vi.fn();
    window.__achievementToast = { spawnToast };
    flushPendingToasts();
    expect(spawnToast).toHaveBeenCalledTimes(2);
    expect(spawnToast).toHaveBeenCalledWith('toast1', {
      className: 'hacker-toast achievement-toast',
    });
    expect(spawnToast).toHaveBeenCalledWith('toast2', {
      className: 'hacker-toast achievement-toast',
    });
  });

  it('clears pending toasts after flushing', () => {
    sessionStorage.setItem('hk-pending-toasts', JSON.stringify(['toast1']));
    const spawnToast = vi.fn();
    window.__achievementToast = { spawnToast };
    flushPendingToasts();
    expect(sessionStorage.getItem('hk-pending-toasts')).toBeNull();
  });

  it('handles missing spawnToast bridge gracefully', () => {
    sessionStorage.setItem('hk-pending-toasts', JSON.stringify(['toast1']));
    window.__achievementToast = undefined;
    expect(() => flushPendingToasts()).not.toThrow();
  });

  it('handles corrupted sessionStorage gracefully', () => {
    sessionStorage.setItem('hk-pending-toasts', 'not-json{{{');
    window.__achievementToast = { spawnToast: vi.fn() };
    expect(() => flushPendingToasts()).not.toThrow();
  });
});

describe('onLevelUp with missing DOM elements', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-03-06T12:00:00Z') });
    clearState();
  });

  afterEach(() => {
    clearState();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('does not crash when overlay elements are missing', () => {
    initAchievements();
    // Trigger enough XP for level up with no overlay DOM
    trackEvent('first_scroll');
    trackEvent('speed_reader');
    trackEvent('command_palette');
    // Should not throw
    expect(getLevel()).toBe(2);
  });
});

describe('onAchievementUnlocked queues pending toast', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-03-06T12:00:00Z') });
    clearState();
  });

  afterEach(() => {
    clearState();
    vi.useRealTimers();
  });

  it('queues toast to sessionStorage when no spawnToast bridge', () => {
    window.__achievementToast = undefined;
    initAchievements();
    trackEvent('first_scroll');
    const raw = sessionStorage.getItem('hk-pending-toasts');
    expect(raw).toBeTruthy();
    const pending = JSON.parse(raw as string);
    expect(pending.length).toBeGreaterThan(0);
    expect(pending[0]).toContain('First Contact');
  });
});

describe('trackEvent before init (fresh module)', () => {
  it('bails out when progress is undefined', async () => {
    vi.useFakeTimers({ now: new Date('2026-03-06T12:00:00Z') });
    clearState();
    vi.resetModules();
    const fresh = await import('../achievements');
    // trackEvent on a fresh module where initAchievements was never called
    expect(() => fresh.trackEvent('first_scroll')).not.toThrow();
    // Re-import the original module to restore state for subsequent tests
    vi.resetModules();
    clearState();
    vi.useRealTimers();
  });
});

describe('save handles localStorage errors', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-03-06T12:00:00Z') });
    clearState();
    initAchievements();
  });

  afterEach(() => {
    clearState();
    vi.useRealTimers();
  });

  it('does not throw when localStorage.setItem fails', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => trackEvent('first_scroll')).not.toThrow();
    spy.mockRestore();
  });

  it('first_scroll handler does not unlock when counter is 0', () => {
    initAchievements();
    // Trigger first_scroll without incrementing the counter first
    trackEvent('first_scroll', 0);
    expect(isUnlocked('first_scroll')).toBe(false);
  });

  it('achievement-trigger event with empty detail is ignored', () => {
    initAchievements();
    const before = getProgress().unlocked.length;
    window.dispatchEvent(new CustomEvent('achievement-trigger', { detail: '' }));
    expect(getProgress().unlocked.length).toBe(before);
  });

  it('unlock with invalid achievement id is a no-op', () => {
    initAchievements();
    const before = getProgress().totalXP;
    // Dispatch with an ID not in ACHIEVEMENTS — hits the !achievement guard in unlock()
    window.dispatchEvent(new CustomEvent('achievement-trigger', { detail: '__nonexistent_xyz__' }));
    expect(getProgress().totalXP).toBe(before);
  });
});
