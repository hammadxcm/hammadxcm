/**
 * Achievement Engine — localStorage-based XP/level system.
 * Tracks exploration, interaction, and discovery achievements.
 * Emits 'achievement-unlocked' and 'level-up' custom events.
 */

import { ALL_SECTIONS } from './constants';
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
  compass:
    '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  radar:
    '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>',
  microscope:
    '<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 100-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 01-2-2V6h6v4a2 2 0 01-2 2H9z"/><path d="M12 6V3a1 1 0 00-1-1H9a1 1 0 00-1 1v3"/>',
  // New: Phase 4
  terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>',
  timer:
    '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3L2 6"/><path d="M22 6l-3-3"/>',
  target:
    '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  users:
    '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
  joystick:
    '<line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><rect x="2" y="6" width="20" height="12" rx="2"/>',
  layers:
    '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  speaker:
    '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14"/>',
  messageCircle:
    '<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>',
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
    description: 'Use all 15 themes',
    xp: 100,
    category: 'interact',
    secret: false,
  },
  {
    id: 'palette_master',
    name: 'Palette Master',
    icon: ICONS.rainbow,
    description: 'Use 12+ different themes',
    xp: 75,
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
  // Listing page achievements
  {
    id: 'listing_explorer',
    name: 'Deep Diver',
    icon: ICONS.compass,
    description: 'Visit any listing page',
    xp: 15,
    category: 'explore',
    secret: false,
  },
  {
    id: 'listing_completionist',
    name: 'Full Recon',
    icon: ICONS.radar,
    description: 'Visit all 5 listing pages',
    xp: 50,
    category: 'explore',
    secret: false,
  },
  {
    id: 'analytics_deep_dive',
    name: 'Data Scientist',
    icon: ICONS.microscope,
    description: 'Visit the analytics page',
    xp: 20,
    category: 'explore',
    secret: false,
  },
  // Phase 4 — New features
  {
    id: 'terminal_explorer',
    name: 'Terminal Explorer',
    icon: ICONS.terminal,
    description: 'Use the interactive terminal',
    xp: 15,
    category: 'explore',
    secret: false,
  },
  {
    id: 'terminal_hacker',
    name: 'Shell Master',
    icon: ICONS.terminal,
    description: 'Run 15+ terminal commands',
    xp: 40,
    category: 'interact',
    secret: false,
  },
  {
    id: 'terminal_secret',
    name: 'Hidden File',
    icon: ICONS.lock,
    description: 'Find the secret file in the terminal',
    xp: 30,
    category: 'discover',
    secret: true,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    icon: ICONS.timer,
    description: 'Achieve 60+ WPM in the typing test',
    xp: 40,
    category: 'interact',
    secret: false,
  },
  {
    id: 'perfect_accuracy',
    name: 'Flawless Execution',
    icon: ICONS.target,
    description: '100% accuracy in the typing test',
    xp: 50,
    category: 'interact',
    secret: false,
  },
  {
    id: 'music_lover',
    name: 'Audiophile',
    icon: ICONS.music,
    description: 'Discover the now playing widget',
    xp: 15,
    category: 'discover',
    secret: true,
  },
  {
    id: 'social_butterfly',
    name: 'Not Alone',
    icon: ICONS.users,
    description: '5+ visitors online simultaneously',
    xp: 25,
    category: 'social',
    secret: true,
  },
  {
    id: 'breakout_found',
    name: 'Arcade Mode',
    icon: ICONS.joystick,
    description: 'Discover the breakout game',
    xp: 30,
    category: 'discover',
    secret: true,
  },
  {
    id: 'breakout_winner',
    name: 'Brick Breaker',
    icon: ICONS.trophy,
    description: 'Clear all bricks in breakout',
    xp: 75,
    category: 'discover',
    secret: true,
  },
  {
    id: 'wireframe_mode',
    name: "Architect's View",
    icon: ICONS.layers,
    description: 'Toggle wireframe mode',
    xp: 25,
    category: 'discover',
    secret: true,
  },
  {
    id: 'ai_chat',
    name: 'Talk to the Machine',
    icon: ICONS.messageCircle,
    description: 'Chat with the AI assistant',
    xp: 25,
    category: 'interact',
    secret: false,
  },
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

/** Achievements unlocked by a single event trigger with no counter check */
const SIMPLE_UNLOCKS: Record<string, string> = {
  speed_reader: 'speed_reader',
  deep_reader: 'deep_reader',
  command_palette: 'command_palette',
  resume_export: 'resume_export',
  annotations: 'annotations',
  view_more: 'view_expander',
  weekend_warrior: 'weekend_warrior',
  early_bird: 'early_bird',
  persistence_pays: 'persistence_pays',
  full_circle: 'full_circle',
  rapid_switcher: 'rapid_switcher',
  code_copy: 'code_copier',
};

/** Achievements with counter thresholds or special reporting */
const TRIGGER_HANDLERS: Record<string, () => void> = {
  first_scroll: () => {
    if (progress.counters.first_scroll >= 1) unlock('first_scroll');
  },
  lang_switched: () => {
    unlock('lang_switcher');
    if (progress.counters.lang_switched >= 3) unlock('linguist');
  },
  konami: () => {
    unlock('konami');
    reportEvent('konami');
  },
  ctf_solved: () => {
    unlock('ctf_solved');
    reportEvent('ctf_solved');
  },
  guestbook: () => {
    unlock('guestbook');
    reportEvent('guestbook_reached');
  },
  project_click: () => {
    if (progress.counters.project_click >= 3) unlock('project_clicker');
  },
  social_click: () => {
    if (progress.counters.social_click >= 3) unlock('social_networker');
  },
  scroll_distance: () => {
    if (progress.scrollDistance >= 5000) unlock('marathon_scroller');
  },
  visit_day: () => {
    if (progress.visitDays.length >= 3) unlock('streak_3');
    if (progress.visitDays.length >= 7) unlock('streak_7');
  },
  github_tab: () => {
    if (progress.counters.github_tab >= 1 && progress.counters.leetcode_tab >= 1)
      unlock('analytics_nerd');
  },
  leetcode_tab: () => {
    if (progress.counters.github_tab >= 1 && progress.counters.leetcode_tab >= 1)
      unlock('analytics_nerd');
  },
};

function checkSectionTracking(triggerKey: string): void {
  if (!triggerKey.startsWith('section:')) return;
  const sectionId = triggerKey.replace('section:', '');
  if (!progress.sectionsSeen.includes(sectionId)) {
    progress.sectionsSeen.push(sectionId);
    save();
  }
  if (ALL_SECTIONS.every((s) => progress.sectionsSeen.includes(s))) {
    unlock('section_explorer');
  }
}

function checkThemeTracking(triggerKey: string): void {
  if (triggerKey.startsWith('theme:')) {
    const themeName = triggerKey.replace('theme:', '');
    if (!progress.themesUsed.includes(themeName)) {
      progress.themesUsed.push(themeName);
      save();
    }
    reportEvent(`theme:${themeName}`);
  }
  if (triggerKey === 'theme_switch') {
    const c = progress.counters;
    if (c.theme_switch >= 3) unlock('theme_switcher');
    if (progress.themesUsed.length >= 5) unlock('theme_collector');
    if (progress.themesUsed.length >= 12) unlock('palette_master');
    if (progress.themesUsed.length >= 15) unlock('all_themes');
  }
}

function checkListingTracking(triggerKey: string): void {
  if (triggerKey === 'listing_visit') unlock('listing_explorer');
  if (triggerKey === 'listing:analytics') unlock('analytics_deep_dive');
  if (triggerKey.startsWith('listing:')) {
    const listingSections = [
      'testimonials',
      'projects',
      'contributions',
      'certifications',
      'analytics',
    ];
    const c = progress.counters;
    if (listingSections.every((s) => (c[`listing:${s}`] || 0) > 0)) {
      unlock('listing_completionist');
    }
  }
}

function checkCompletionist(): void {
  const nonSecret = ACHIEVEMENTS.filter((a) => !a.secret && a.id !== 'completionist');
  if (nonSecret.every((a) => progress.unlocked.includes(a.id))) {
    unlock('completionist');
  }
}

function checkAchievements(triggerKey: string): void {
  // Simple single-trigger unlocks
  if (SIMPLE_UNLOCKS[triggerKey]) {
    unlock(SIMPLE_UNLOCKS[triggerKey]);
  }

  // Counter-based and special handlers
  const handler = TRIGGER_HANDLERS[triggerKey];
  if (handler) handler();

  // Section, theme, and listing tracking
  checkSectionTracking(triggerKey);
  checkThemeTracking(triggerKey);
  checkListingTracking(triggerKey);

  // Completionist check — after any unlock
  checkCompletionist();
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

function queuePendingToast(message: string): void {
  try {
    const pending = JSON.parse(sessionStorage.getItem('hk-pending-toasts') || '[]');
    pending.push(message);
    sessionStorage.setItem('hk-pending-toasts', JSON.stringify(pending));
  } catch {
    /* private browsing */
  }
}

export function flushPendingToasts(): void {
  try {
    const raw = sessionStorage.getItem('hk-pending-toasts');
    if (!raw) return;
    sessionStorage.removeItem('hk-pending-toasts');
    const pending: string[] = JSON.parse(raw);
    const { spawnToast } = window.__achievementToast ?? {};
    if (spawnToast) {
      for (const msg of pending) {
        spawnToast(msg, { className: 'hacker-toast achievement-toast' });
      }
    }
  } catch {
    /* ignore */
  }
}

function onAchievementUnlocked(e: Event): void {
  const detail = (e as CustomEvent<Achievement>).detail;
  const msg = `🏆 ${detail.name} — +${detail.xp} XP`;
  // Queue for display after navigation (e.g. language switch)
  queuePendingToast(msg);
  const { spawnToast } = window.__achievementToast ?? {};
  if (spawnToast) {
    spawnToast(msg, { className: 'hacker-toast achievement-toast' });
  }
  // Announce to screen readers via assertive aria-live region
  const alertRegion = document.getElementById('alert-region');
  if (alertRegion)
    alertRegion.textContent = `Achievement unlocked: ${detail.name}. Plus ${detail.xp} XP.`;
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
  // Announce level-up to screen readers
  const alertRegion = document.getElementById('alert-region');
  if (alertRegion)
    alertRegion.textContent = `Level up! You are now level ${detail.level}: ${detail.name}.`;
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

  // Listen for achievement triggers from new features (terminal, breakout, etc.)
  window.addEventListener('achievement-trigger', (e: Event) => {
    const id = (e as CustomEvent<string>).detail;
    if (id) unlock(id);
  });
}

// Bridge for toast — avoids circular import
declare global {
  interface Window {
    __achievementToast?: {
      spawnToast: (msg: string, opts?: { className?: string }) => void;
    };
  }
}
