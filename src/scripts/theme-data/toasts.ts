import type { ThemeName, ThemeToasts } from '../types';
import { themeGetter } from './core';

export const themeToasts: Record<ThemeName, ThemeToasts> = {
  hacker: {
    click: [
      '# Firewall bypassed on port 443',
      '> Packet intercepted: 192.168.x.x',
      '$ Buffer overflow in sector 7',
      '# Encryption key rotated: SHA256:a3f82c',
      '> SSH tunnel to darknet established',
      '$ Payload delivered — 0 traces',
      '# Root shell spawned (PID 31337)',
      '> Memory dump: 0xDEADBEEF',
      '$ Brute force: 12,847 combos/sec',
      '# Certificate pinning bypassed',
    ],
    ambient: [
      '[CRON] Scheduled recon scan completed',
      '[ALERT] New device detected on network',
      '[SYNC] Encrypted backup: 100% complete',
      '[MONITOR] Intrusion detection: all clear',
      '[DAEMON] Process health check: nominal',
    ],
  },
  dracula: {
    click: [
      '> The Count approves',
      '# Nocturnal mode active',
      '> Blood bank: replenished',
      '$ Bat sonar: 3 echoes detected',
      '> Cape swirl animation: smooth',
    ],
    ambient: [
      '[NIGHT] Moon phase updated',
      '[CRYPT] Coffin integrity: 100%',
      '[BAT] Sonar sweep complete',
    ],
  },
  nord: {
    click: [
      '> Northern lights detected',
      '# Ice core sample analyzed',
      '> Frost pattern: unique',
      '$ Aurora intensity: 7/10',
      '> Polar wind shift logged',
    ],
    ambient: [
      '[AURORA] Light display active',
      '[TEMP] Arctic readings nominal',
      '[SNOW] Accumulation: 2cm/hr',
    ],
  },
  catppuccin: {
    click: [
      '> Latte art complete',
      '# Comfort mode engaged',
      '> Warm pixels: deployed',
      '$ Cozy level: maximum',
      '> Mocha blend: perfected',
    ],
    ambient: [
      '[BREW] Fresh batch ready',
      '[COZY] Ambient warmth stable',
      '[PIXEL] Pastel palette refreshed',
    ],
  },
  synthwave: {
    click: [
      '> Tape rewound',
      '# Signal boosted to 11',
      '$ Neon circuit: overclocked',
      '> Synth key pressed: C major',
      '> Chrome reflection: maximum',
    ],
    ambient: [
      '[FM] Radio frequency locked',
      '[VHS] Tape playback smooth',
      '[NEON] Grid power: stable',
    ],
  },
  matrix: {
    click: [
      '> Red pill accepted',
      '# Agent detected nearby',
      '$ Glitch in the matrix',
      '> Deja vu — same cat',
      '> Code is raining',
    ],
    ambient: [
      `[MATRIX] Simulation tick #${String(Math.floor(Math.random() * 99999))}`,
      '[AGENT] Patrol route updated',
      '[ORACLE] Prediction logged',
    ],
  },
  bloodmoon: {
    click: [
      '> Lunar anomaly detected',
      '# Eclipse phase complete',
      '$ Crimson wave incoming',
      '> Shadow index: rising',
      '> Blood tide: receding',
    ],
    ambient: ['[ECLIPSE] Next phase in 3h', '[LUNAR] Anomaly stable', '[CRIMSON] Protocol holding'],
  },
  midnight: {
    click: [
      '> Midnight oil burning',
      '# Night mode optimized',
      '$ Star map updated',
      '> Constellation found',
      '> Deep focus achieved',
    ],
    ambient: [
      '[STAR] New constellation mapped',
      '[NIGHT] Ambient noise: minimal',
      '[FOCUS] Productivity: peak',
    ],
  },
  arctic: {
    click: [
      '> Brightness optimized',
      '# Clean compile complete',
      '$ Frost defragmented',
      '> Crystal clarity achieved',
      '> Light mode: pristine',
    ],
    ambient: ['[LIGHT] Display calibrated', '[ICE] Structure: optimal', '[CLEAN] Build successful'],
  },
  gruvbox: {
    click: [
      '> :w saved successfully',
      '# Buffer cleaned',
      '$ :qa! — force quit averted',
      '> Vim macro recorded',
      '> Retro mode: engaged',
    ],
    ambient: [
      '[VIM] Swap file cleaned',
      '[TERM] Shell history saved',
      '[RETRO] CRT warmth optimal',
    ],
  },
  cyberpunk: {
    click: [
      '> Neural link synced',
      '# ICE breaker deployed',
      '$ Quickhack uploaded',
      '> Cyberware: upgraded',
      '> Eddies transferred',
    ],
    ambient: [
      '[NCPD] Patrol route updated',
      '[NET] Bandwidth spike detected',
      '[CYBER] Firmware auto-updated',
    ],
  },
  nebula: {
    click: [
      '> New star cataloged',
      '# Spectrum analyzed',
      '$ Nebula density measured',
      '> Cosmic ray detected',
      '> Telescope refocused',
    ],
    ambient: [
      '[SPACE] New signal detected',
      '[HUBBLE] Imaging complete',
      '[RELAY] Deep space ping received',
    ],
  },
  solarized: {
    click: [
      '> Display calibrated',
      '# Gamma adjusted',
      '$ Color profile applied',
      '> Contrast: optimal',
      '> Readability: maximum',
    ],
    ambient: [
      '[DISPLAY] Refresh cycle complete',
      '[COLOR] Profile stable',
      '[SYSTEM] Environment nominal',
    ],
  },
  rosepine: {
    click: [
      '> New bloom detected',
      '# Petal count increased',
      '$ Dew collected',
      '> Garden expanding',
      '> Roots deepening',
    ],
    ambient: ['[GARDEN] Watering complete', '[BLOOM] New bud forming', '[SOIL] Nutrients balanced'],
  },
  monokai: {
    click: [
      '> File saved',
      '# Build successful',
      '$ Syntax: valid',
      '> Linter: 0 errors',
      '> Package installed',
    ],
    ambient: [
      '[BUILD] Compile complete',
      '[LINT] Code quality: A+',
      '[PKG] Dependencies up to date',
    ],
  },
};

export const getThemeToasts = themeGetter(themeToasts);
