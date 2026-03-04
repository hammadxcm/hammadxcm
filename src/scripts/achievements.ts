/**
 * Achievement Engine — localStorage-based XP/level system.
 * Tracks exploration, interaction, and discovery achievements.
 * Emits 'achievement-unlocked' and 'level-up' custom events.
 */

import { reportEvent } from './global-stats';

// ── Types ──────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  name: string;
  /** SVG path data (viewBox 0 0 24 24) — rendered inside <svg> elements */
  icon: string;
  description: string;
  xp: number;
  category: 'explore' | 'interact' | 'discover' | 'social';
  secret: boolean;
}

interface AchievementProgress {
  unlocked: string[];
  counters: Record<string, number>;
  totalXP: number;
  visitDays: string[];
  themesUsed: string[];
  sectionsSeen: string[];
  startTime: number;
  scrollDistance: number;
}

// ── SVG Icon Paths (viewBox 0 0 24 24) ───────────────────────────────

const ICONS = {
  // Explore
  satellite:
    '<path d="M13 7l2 2M9.7 17.7l-2.4-2.4M6.3 14.3l-2.4-2.4"/><circle cx="15" cy="5" r="2"/><path d="M14.3 9.7l-7 7M9.3 4.7L4 10l2.5 2.5M19.3 14.7L14 20l-2.5-2.5"/>',
  map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
  books:
    '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>',
  bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  refresh:
    '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>',
  scroll:
    '<path d="M8 21h12a2 2 0 002-2v-2H10v2a2 2 0 11-4 0V5a2 2 0 10-4 0v2h12v12a2 2 0 002 2z"/>',
  flame:
    '<path d="M12 22c-4.97 0-9-2.69-9-6 0-4 5-11 9-14 4 3 9 10 9 14 0 3.31-4.03 6-9 6z"/><path d="M12 22c-1.66 0-3-1.12-3-2.5 0-2.04 3-6.5 3-6.5s3 4.46 3 6.5c0 1.38-1.34 2.5-3 2.5z"/>',
  calendar:
    '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  // Interact
  palette:
    '<circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="11.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.04-.23-.29-.38-.63-.38-1.01 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.17-4.49-9-10-9z"/>',
  rainbow:
    '<path d="M22 17a10 10 0 00-20 0"/><path d="M6 17a6 6 0 0112 0"/><path d="M10 17a2 2 0 014 0"/>',
  gem: '<path d="M6 3h12l4 6-10 13L2 9z"/><path d="M2 9h20"/><path d="M12 22L6 9"/><path d="M12 22l6-13"/>',
  folder: '<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>',
  keyboard:
    '<rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><path d="M6 8h0M10 8h0M14 8h0M18 8h0M8 12h0M12 12h0M16 12h0M6 16h12"/>',
  fileText:
    '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>',
  clipboard:
    '<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><polyline points="9 14 11 16 15 12"/>',
  share:
    '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
  // Discover
  gamepad:
    '<line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><path d="M17.32 5H6.68a4 4 0 00-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 003 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 019.828 16h4.344a2 2 0 011.414.586L17 18c.5.5 1 1 2 1a3 3 0 003-3c0-1.544-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.152A4 4 0 0017.32 5z"/>',
  trophy:
    '<path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 1012 0V2z"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  moon: '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>',
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/>',
  // New: Phase 2
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  barChart:
    '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  sunrise:
    '<path d="M17 18a5 5 0 00-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/>',
  umbrella:
    '<path d="M18 18a6 6 0 01-12 0"/><path d="M12 12v6"/><path d="M22 12H2a10 10 0 0120 0z"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  stopwatch:
    '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M10 2h4"/><path d="M12 2v3"/>',
  loop: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>',
  languages:
    '<path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/>',
} as const;

// ── Constants ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'hk-achievements';
const XP_THRESHOLDS = [0, 50, 130, 230, 350, 500, 680, 880, 1100, 1400];

export const LEVEL_NAMES = [
  'Script Kiddie',
  'Packet Sniffer',
  'Port Scanner',
  'Exploit Writer',
  'Payload Crafter',
  'Shell Hacker',
  'Root Access',
  'Kernel Hacker',
  'Zero-Day Hunter',
  'System Architect',
];

export const ACHIEVEMENTS: Achievement[] = [
  // Explore
  {
    id: 'first_scroll',
    name: 'First Contact',
    icon: ICONS.satellite,
    description: 'Scroll past the hero section',
    xp: 10,
    category: 'explore',
    secret: false,
  },
  {
    id: 'section_explorer',
    name: 'Section Explorer',
    icon: ICONS.map,
    description: 'Visit all sections',
    xp: 50,
    category: 'explore',
    secret: false,
  },
  {
    id: 'deep_reader',
    name: 'Deep Reader',
    icon: ICONS.books,
    description: 'Spend 3+ minutes on site',
    xp: 30,
    category: 'explore',
    secret: false,
  },
  {
    id: 'speed_reader',
    name: 'Speed Reader',
    icon: ICONS.bolt,
    description: 'Reach the bottom in under 30 seconds',
    xp: 15,
    category: 'explore',
    secret: false,
  },
  {
    id: 'return_visitor',
    name: 'Return Visitor',
    icon: ICONS.refresh,
    description: 'Visit on 2+ different days',
    xp: 30,
    category: 'explore',
    secret: false,
  },
  {
    id: 'marathon_scroller',
    name: 'Marathon Scroller',
    icon: ICONS.scroll,
    description: 'Scroll 5000px total',
    xp: 20,
    category: 'explore',
    secret: false,
  },
  {
    id: 'streak_3',
    name: '3-Day Streak',
    icon: ICONS.flame,
    description: 'Visit 3 different days',
    xp: 40,
    category: 'explore',
    secret: false,
  },
  {
    id: 'streak_7',
    name: 'Weekly Regular',
    icon: ICONS.calendar,
    description: 'Visit 7 different days',
    xp: 75,
    category: 'explore',
    secret: false,
  },
  // Interact
  {
    id: 'theme_switcher',
    name: 'Chameleon',
    icon: ICONS.palette,
    description: 'Switch theme 3 times',
    xp: 25,
    category: 'interact',
    secret: false,
  },
  {
    id: 'theme_collector',
    name: 'Theme Collector',
    icon: ICONS.rainbow,
    description: 'Use 5 different themes',
    xp: 50,
    category: 'interact',
    secret: false,
  },
  {
    id: 'all_themes',
    name: 'Chromatic',
    icon: ICONS.gem,
    description: 'Use all 10 themes',
    xp: 100,
    category: 'interact',
    secret: false,
  },
  {
    id: 'project_clicker',
    name: 'Repo Raider',
    icon: ICONS.folder,
    description: 'Click 3 project links',
    xp: 25,
    category: 'interact',
    secret: false,
  },
  {
    id: 'command_palette',
    name: 'Power User',
    icon: ICONS.keyboard,
    description: 'Use the command palette',
    xp: 25,
    category: 'interact',
    secret: false,
  },
  {
    id: 'resume_export',
    name: 'Dossier Acquired',
    icon: ICONS.fileText,
    description: 'Export resume PDF',
    xp: 20,
    category: 'interact',
    secret: false,
  },
  {
    id: 'lang_switcher',
    name: 'Polyglot',
    icon: ICONS.globe,
    description: 'Switch language',
    xp: 25,
    category: 'interact',
    secret: false,
  },
  {
    id: 'code_copier',
    name: 'Code Copier',
    icon: ICONS.clipboard,
    description: 'Copy about code',
    xp: 15,
    category: 'interact',
    secret: false,
  },
  {
    id: 'social_networker',
    name: 'Social Networker',
    icon: ICONS.share,
    description: 'Click 3 social links',
    xp: 25,
    category: 'interact',
    secret: false,
  },
  {
    id: 'view_expander',
    name: 'Completionist',
    icon: ICONS.eye,
    description: 'Use any View More button',
    xp: 15,
    category: 'interact',
    secret: false,
  },
  {
    id: 'analytics_nerd',
    name: 'Analytics Nerd',
    icon: ICONS.barChart,
    description: 'View GitHub + LeetCode analytics tabs',
    xp: 30,
    category: 'interact',
    secret: false,
  },
  // Discover
  {
    id: 'konami',
    name: 'Konami Master',
    icon: ICONS.gamepad,
    description: 'Trigger the Konami code',
    xp: 50,
    category: 'discover',
    secret: true,
  },
  {
    id: 'ctf_solved',
    name: 'Elite Hacker',
    icon: ICONS.trophy,
    description: 'Solve the CTF challenge',
    xp: 100,
    category: 'discover',
    secret: true,
  },
  {
    id: 'annotations',
    name: 'Source Diver',
    icon: ICONS.search,
    description: 'Toggle source annotations',
    xp: 30,
    category: 'discover',
    secret: true,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    icon: ICONS.moon,
    description: 'Visit between midnight and 5am',
    xp: 20,
    category: 'discover',
    secret: true,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    icon: ICONS.sunrise,
    description: 'Visit between 5am and 8am',
    xp: 20,
    category: 'discover',
    secret: true,
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    icon: ICONS.umbrella,
    description: 'Visit on Saturday or Sunday',
    xp: 15,
    category: 'discover',
    secret: false,
  },
  {
    id: 'completionist',
    name: 'Completionist',
    icon: ICONS.star,
    description: 'Unlock all non-secret achievements',
    xp: 150,
    category: 'discover',
    secret: true,
  },
  // Social
  {
    id: 'guestbook',
    name: 'Transmission Logged',
    icon: ICONS.mail,
    description: 'Reach the guestbook',
    xp: 15,
    category: 'social',
    secret: false,
  },
  // Phase 3
  {
    id: 'persistence_pays',
    name: 'Persistence Pays',
    icon: ICONS.stopwatch,
    description: 'Spend 10+ minutes on site',
    xp: 40,
    category: 'explore',
    secret: false,
  },
  {
    id: 'full_circle',
    name: 'Full Circle',
    icon: ICONS.loop,
    description: 'Scroll to bottom, then back to top',
    xp: 35,
    category: 'explore',
    secret: true,
  },
  {
    id: 'linguist',
    name: 'Linguist',
    icon: ICONS.languages,
    description: 'Switch language 3+ times',
    xp: 35,
    category: 'interact',
    secret: false,
  },
  {
    id: 'rapid_switcher',
    name: 'Rapid Switcher',
    icon: ICONS.bolt,
    description: '5 theme switches within 30 seconds',
    xp: 25,
    category: 'discover',
    secret: true,
  },
];

const ALL_SECTIONS = [
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

// ── State ──────────────────────────────────────────────────────────────

let progress: AchievementProgress;
let initialized = false;
let deepReaderTimer: ReturnType<typeof setTimeout> | undefined;
let persistenceTimer: ReturnType<typeof setTimeout> | undefined;

function defaultProgress(): AchievementProgress {
  return {
    unlocked: [],
    counters: {},
    totalXP: 0,
    visitDays: [],
    themesUsed: [],
    sectionsSeen: [],
    startTime: Date.now(),
    scrollDistance: 0,
  };
}

function load(): AchievementProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AchievementProgress;
      // Ensure all fields exist (migration)
      return { ...defaultProgress(), ...parsed };
    }
  } catch {
    /* corrupt data — reset */
  }
  return defaultProgress();
}

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* storage full — silent */
  }
}

// ── Level Calculation ──────────────────────────────────────────────────

export function getLevel(xp?: number): number {
  const total = xp ?? progress.totalXP;
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (total >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getLevelName(level?: number): string {
  const lvl = level ?? getLevel();
  return LEVEL_NAMES[Math.min(lvl - 1, LEVEL_NAMES.length - 1)];
}

export function getXPForNextLevel(): { current: number; needed: number; progress: number } {
  const lvl = getLevel();
  if (lvl >= XP_THRESHOLDS.length) {
    return {
      current: progress.totalXP,
      needed: XP_THRESHOLDS[XP_THRESHOLDS.length - 1],
      progress: 1,
    };
  }
  const prevThreshold = XP_THRESHOLDS[lvl - 1];
  const nextThreshold = XP_THRESHOLDS[lvl];
  const inLevel = progress.totalXP - prevThreshold;
  const levelRange = nextThreshold - prevThreshold;
  return {
    current: progress.totalXP,
    needed: nextThreshold,
    progress: Math.min(1, inLevel / levelRange),
  };
}

// ── Achievement Unlock ─────────────────────────────────────────────────

function unlock(id: string): void {
  if (progress.unlocked.includes(id)) return;
  const achievement = ACHIEVEMENTS.find((a) => a.id === id);
  if (!achievement) return;

  const prevLevel = getLevel();
  progress.unlocked.push(id);
  progress.totalXP += achievement.xp;
  save();

  // Emit achievement event
  window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: achievement }));

  // Report to global stats
  reportEvent('achievement_unlocked');
  reportEvent(`ach:${id}`);

  // Check for level up
  const newLevel = getLevel();
  if (newLevel > prevLevel) {
    window.dispatchEvent(
      new CustomEvent('level-up', { detail: { level: newLevel, name: getLevelName(newLevel) } }),
    );
    reportEvent(`level:${newLevel}_reached`);
  }
}

// ── Event Tracking ─────────────────────────────────────────────────────

export function trackEvent(key: string, increment = 1): void {
  if (!progress) return;

  // Increment counter
  progress.counters[key] = (progress.counters[key] || 0) + increment;
  save();

  // Check achievement conditions
  checkAchievements(key);
}

function checkAchievements(triggerKey: string): void {
  const c = progress.counters;

  // first_scroll
  if (triggerKey === 'first_scroll' && c.first_scroll >= 1) {
    unlock('first_scroll');
  }

  // speed_reader — bottom reached with startTime < 30s ago
  if (triggerKey === 'speed_reader') {
    unlock('speed_reader');
  }

  // deep_reader — checked via timer, not counter
  if (triggerKey === 'deep_reader') {
    unlock('deep_reader');
  }

  // section tracking
  if (triggerKey.startsWith('section:')) {
    const sectionId = triggerKey.replace('section:', '');
    if (!progress.sectionsSeen.includes(sectionId)) {
      progress.sectionsSeen.push(sectionId);
      save();
    }
    // section_explorer — all sections visited
    if (ALL_SECTIONS.every((s) => progress.sectionsSeen.includes(s))) {
      unlock('section_explorer');
    }
  }

  // theme tracking
  if (triggerKey.startsWith('theme:')) {
    const themeName = triggerKey.replace('theme:', '');
    if (!progress.themesUsed.includes(themeName)) {
      progress.themesUsed.push(themeName);
      save();
    }
    reportEvent(`theme:${themeName}`);
  }
  if (triggerKey === 'theme_switch') {
    if (c.theme_switch >= 3) unlock('theme_switcher');
    if (progress.themesUsed.length >= 5) unlock('theme_collector');
    if (progress.themesUsed.length >= 10) unlock('all_themes');
  }

  // project clicks
  if (triggerKey === 'project_click' && c.project_click >= 3) {
    unlock('project_clicker');
  }

  // Single-trigger achievements
  if (triggerKey === 'command_palette') unlock('command_palette');
  if (triggerKey === 'resume_export') unlock('resume_export');
  if (triggerKey === 'lang_switched') unlock('lang_switcher');
  if (triggerKey === 'konami') {
    unlock('konami');
    reportEvent('konami');
  }
  if (triggerKey === 'ctf_solved') {
    unlock('ctf_solved');
    reportEvent('ctf_solved');
  }
  if (triggerKey === 'annotations') unlock('annotations');
  if (triggerKey === 'guestbook') {
    unlock('guestbook');
    reportEvent('guestbook_reached');
  }

  // code_copier
  if (triggerKey === 'code_copy') unlock('code_copier');

  // social_networker
  if (triggerKey === 'social_click' && c.social_click >= 3) unlock('social_networker');

  // view_expander
  if (triggerKey === 'view_more') unlock('view_expander');

  // analytics_nerd — needs both github_tab and leetcode_tab
  if (
    (triggerKey === 'github_tab' || triggerKey === 'leetcode_tab') &&
    c.github_tab >= 1 &&
    c.leetcode_tab >= 1
  ) {
    unlock('analytics_nerd');
  }

  // marathon_scroller — checked via scrollDistance
  if (triggerKey === 'scroll_distance' && progress.scrollDistance >= 5000) {
    unlock('marathon_scroller');
  }

  // streak_3 / streak_7 — checked via visitDays
  if (triggerKey === 'visit_day') {
    if (progress.visitDays.length >= 3) unlock('streak_3');
    if (progress.visitDays.length >= 7) unlock('streak_7');
  }

  // weekend_warrior
  if (triggerKey === 'weekend_warrior') unlock('weekend_warrior');

  // early_bird
  if (triggerKey === 'early_bird') unlock('early_bird');

  // persistence_pays — checked via timer
  if (triggerKey === 'persistence_pays') unlock('persistence_pays');

  // full_circle — scroll to bottom then back to top
  if (triggerKey === 'full_circle') unlock('full_circle');

  // linguist — switch language 3+ times
  if (triggerKey === 'lang_switched' && c.lang_switched >= 3) unlock('linguist');

  // rapid_switcher — 5 theme switches in 30 seconds
  if (triggerKey === 'rapid_switcher') unlock('rapid_switcher');

  // completionist — after any unlock, check if all non-secret achievements are unlocked
  const nonSecret = ACHIEVEMENTS.filter((a) => !a.secret && a.id !== 'completionist');
  if (nonSecret.every((a) => progress.unlocked.includes(a.id))) {
    unlock('completionist');
  }
}

// ── Public Getters ─────────────────────────────────────────────────────

export function getProgress(): AchievementProgress {
  return progress;
}

export function getAchievements(): Achievement[] {
  return ACHIEVEMENTS;
}

export function isUnlocked(id: string): boolean {
  return progress.unlocked.includes(id);
}

export function getVisitCount(): number {
  return progress.visitDays.length;
}

// ── Cleanup ──────────────────────────────────────────────────────────

function onAchievementUnlocked(e: Event): void {
  const detail = (e as CustomEvent<Achievement>).detail;
  const { spawnToast } = window.__achievementToast ?? {};
  if (spawnToast) {
    spawnToast(`🏆 ${detail.name} — +${detail.xp} XP`, {
      className: 'hacker-toast achievement-toast',
    });
  }
}

function onLevelUp(e: Event): void {
  const detail = (e as CustomEvent<{ level: number; name: string }>).detail;
  const overlay = document.getElementById('levelUpOverlay');
  const levelNum = document.getElementById('levelUpNum');
  const levelName = document.getElementById('levelUpName');
  if (overlay && levelNum && levelName) {
    levelNum.textContent = `LEVEL ${detail.level}`;
    levelName.textContent = detail.name;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
    }, 3000);
  }
}

export function destroyAchievements(): void {
  if (deepReaderTimer) clearTimeout(deepReaderTimer);
  if (persistenceTimer) clearTimeout(persistenceTimer);
  window.removeEventListener('achievement-unlocked', onAchievementUnlocked);
  window.removeEventListener('level-up', onLevelUp);
  deepReaderTimer = undefined;
  persistenceTimer = undefined;
  initialized = false;
}

// ── Initialization ─────────────────────────────────────────────────────

export function initAchievements(): void {
  if (initialized) return;
  initialized = true;
  progress = load();

  // Track visit day
  const today = new Date().toISOString().slice(0, 10);
  if (!progress.visitDays.includes(today)) {
    progress.visitDays.push(today);
    save();
  }

  // Return visitor check
  if (progress.visitDays.length >= 2) {
    unlock('return_visitor');
  }

  // Night owl check (midnight–5am)
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) {
    unlock('night_owl');
  }

  // Early bird check (5am–8am)
  if (hour >= 5 && hour < 8) {
    unlock('early_bird');
  }

  // Weekend warrior check
  const day = new Date().getDay();
  if (day === 0 || day === 6) {
    unlock('weekend_warrior');
  }

  // Streak checks
  if (progress.visitDays.length >= 3) unlock('streak_3');
  if (progress.visitDays.length >= 7) unlock('streak_7');

  // Deep reader timer — 3 minutes
  deepReaderTimer = setTimeout(
    () => {
      trackEvent('deep_reader');
    },
    3 * 60 * 1000,
  );

  // Persistence pays timer — 10 minutes
  persistenceTimer = setTimeout(
    () => {
      trackEvent('persistence_pays');
    },
    10 * 60 * 1000,
  );

  // Record session start time
  progress.startTime = Date.now();
  save();

  // Report global visit
  reportEvent('visit');

  // Listen for achievement + level-up events to show toasts
  window.addEventListener('achievement-unlocked', onAchievementUnlocked);
  window.addEventListener('level-up', onLevelUp);
}

// Bridge for toast — avoids circular import
declare global {
  interface Window {
    __achievementToast?: {
      spawnToast: (msg: string, opts?: { className?: string }) => void;
    };
  }
}
