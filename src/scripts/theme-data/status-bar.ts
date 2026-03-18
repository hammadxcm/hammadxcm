import { getClientIP } from '../state';
import type { StatusBarConfig, ThemeName } from '../types';
import { themeGetter } from './core';

function formatUptime(elapsed: number): string {
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const themeStatusBars: Record<ThemeName, StatusBarConfig> = {
  hacker: [
    { label: '\u25C9 SECURE CONNECTION', cls: 'status-secure' },
    { label: 'IP: ', value: () => getClientIP() || '...' },
    {
      label: '',
      value: () =>
        `\u2191 ${(Math.random() * 36 + 12).toFixed(1)} MB/s \u2193 ${(Math.random() * 75 + 45).toFixed(1)} MB/s`,
    },
    { label: '', value: () => `${Math.floor(Math.random() * 10 + 18)} PROCESSES` },
    { label: 'UPTIME: ', value: (e) => formatUptime(e) },
  ],
  dracula: [
    { label: '\u25C9 NOCTURNAL MODE', cls: 'status-secure' },
    { label: 'BLOOD TYPE: #BD93F9' },
    { label: 'MOON: ', value: () => pick(['FULL', 'WANING', 'NEW', 'CRESCENT', 'BLOOD']) },
    { label: '', value: () => `${Math.floor(Math.random() * 50 + 10)} COFFINS SEALED` },
    { label: 'NIGHT CYCLE: ', value: (e) => formatUptime(e) },
  ],
  nord: [
    { label: '\u25C9 POLAR STATION', cls: 'status-secure' },
    { label: 'REGION: SVALBARD' },
    { label: 'TEMP: ', value: () => `${(-Math.random() * 30 - 5).toFixed(1)}\u00B0C` },
    { label: 'AURORA: ', value: () => `${Math.floor(Math.random() * 10 + 1)}/10` },
    { label: 'WIND: ', value: () => `${(Math.random() * 60 + 5).toFixed(0)} km/h` },
  ],
  catppuccin: [
    { label: '\u25C9 COZY MODE', cls: 'status-secure' },
    { label: 'BLEND: MOCHA' },
    { label: 'BREW: ', value: () => pick(['STEEPING', 'READY', 'POURING', 'FRESH', 'PERFECT']) },
    { label: 'WARMTH: ', value: () => `${Math.floor(Math.random() * 30 + 70)}%` },
    { label: 'COMFORT: ', value: (e) => formatUptime(e) },
  ],
  synthwave: [
    { label: '\u25C9 NEON GRID ONLINE', cls: 'status-secure' },
    { label: 'FM 98.7' },
    { label: 'FREQ: ', value: () => `${(Math.random() * 2000 + 200).toFixed(0)} Hz` },
    { label: 'SIGNAL: ', value: () => `${Math.floor(Math.random() * 10 + 1)}/10` },
    {
      label: 'TAPE: ',
      value: () => pick(['PLAYING', 'REWINDING', 'SIDE A', 'SIDE B', 'RECORDING']),
    },
  ],
  matrix: [
    { label: '\u25C9 SIMULATION ACTIVE', cls: 'status-secure' },
    { label: 'NODE: ', value: () => getClientIP() || '...' },
    { label: 'TICK: ', value: () => `#${Math.floor(Math.random() * 99999)}` },
    { label: '', value: () => `${Math.floor(Math.random() * 8 + 1)} AGENTS DETECTED` },
    { label: 'SIGNAL: ', value: () => `${Math.floor(Math.random() * 40 + 60)}%` },
  ],
  bloodmoon: [
    { label: '\u25C9 CRIMSON PROTOCOL', cls: 'status-secure' },
    { label: 'COVENANT: ACTIVE' },
    {
      label: 'ECLIPSE: ',
      value: () => pick(['TOTAL', 'PARTIAL', 'PENUMBRAL', 'WAXING', 'PEAK']),
    },
    { label: 'CRIMSON: ', value: () => `${(Math.random() * 9 + 1).toFixed(1)}` },
    { label: 'SHADOWS: ', value: () => `${Math.floor(Math.random() * 100 + 1)} DEEP` },
  ],
  midnight: [
    { label: '\u25C9 DEEP SPACE RELAY', cls: 'status-secure' },
    { label: 'SECTOR: ANDROMEDA' },
    { label: '', value: () => `${Math.floor(Math.random() * 9000 + 1000)} STARS MAPPED` },
    { label: 'NEBULA: ', value: () => `${(Math.random() * 500 + 10).toFixed(1)} ly` },
    { label: 'ORBIT: ', value: (e) => formatUptime(e) },
  ],
  arctic: [
    { label: '\u25C9 STATION ONLINE', cls: 'status-secure' },
    { label: 'ENV: CLEAN' },
    { label: 'TEMP: ', value: () => `${(-Math.random() * 15 - 1).toFixed(1)}\u00B0C` },
    { label: 'VISIBILITY: ', value: () => `${Math.floor(Math.random() * 30 + 70)}%` },
    { label: 'ICE: ', value: () => `${Math.floor(Math.random() * 15 + 85)}% INTEGRITY` },
  ],
  gruvbox: [
    { label: '\u25C9 VIM READY', cls: 'status-secure' },
    { label: 'NORMAL' },
    { label: '', value: () => `${Math.floor(Math.random() * 12 + 1)} BUF OPEN` },
    { label: 'TERM: ', value: () => pick(['zsh', 'bash', 'fish', 'tmux', 'screen']) },
    { label: ':w ', value: (e) => formatUptime(e) },
  ],
  cyberpunk: [
    { label: '\u25C9 NCPD CHANNEL', cls: 'status-secure' },
    { label: 'EDDIES: ', value: () => `${Math.floor(Math.random() * 9000 + 1000)}` },
    {
      label: 'THREAT: ',
      value: () => pick(['LOW', 'MODERATE', 'HIGH', 'CRITICAL', 'NONE']),
    },
    { label: 'CYBERWARE: OK' },
    { label: 'NET: ', value: (e) => formatUptime(e) },
  ],
  nebula: [
    { label: '\u25C9 DEEP SPACE RELAY', cls: 'status-secure' },
    {
      label: 'SECTOR: ',
      value: () => pick(['ORION', 'CYGNUS', 'LYRA', 'VELA', 'CARINA']),
    },
    { label: 'LIGHT-YEARS: ', value: () => `${Math.floor(Math.random() * 5000 + 100)}` },
    { label: 'SIGNAL: ', value: () => `${Math.floor(Math.random() * 40 + 60)}%` },
    { label: 'ORBIT: ', value: (e) => formatUptime(e) },
  ],
  solarized: [
    { label: '\u25C9 SOL STATION', cls: 'status-secure' },
    { label: 'GAMMA: 2.2' },
    { label: 'CONTRAST: OPTIMAL' },
    { label: 'DISPLAY: CALIBRATED' },
    { label: 'UPTIME: ', value: (e) => formatUptime(e) },
  ],
  rosepine: [
    { label: '\u25C9 GARDEN MODE', cls: 'status-secure' },
    {
      label: 'SEASON: ',
      value: () => pick(['SPRING', 'SUMMER', 'AUTUMN', 'WINTER', 'BLOOM']),
    },
    { label: 'BLOOM: ', value: () => `${Math.floor(Math.random() * 30 + 70)}%` },
    { label: 'WARMTH: ', value: () => `${Math.floor(Math.random() * 20 + 80)}%` },
    { label: 'GROWTH: ', value: (e) => formatUptime(e) },
  ],
  monokai: [
    { label: '\u25C9 EDITOR READY', cls: 'status-secure' },
    {
      label: 'LANG: ',
      value: () => pick(['TypeScript', 'Python', 'Rust', 'Go', 'Ruby']),
    },
    { label: 'ERRORS: 0' },
    { label: 'BUILD: PASSING' },
    { label: 'SESSION: ', value: (e) => formatUptime(e) },
  ],
};

export const getStatusBarConfig = themeGetter(themeStatusBars);
