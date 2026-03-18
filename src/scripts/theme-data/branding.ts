import type { ThemeName } from '../types';
import { themeGetter } from './core';

export const themeLogos: Record<ThemeName, { text: string; suffix: string }> = {
  hacker: { text: 'fyniti', suffix: '://hk' },
  dracula: { text: 'fyniti', suffix: '::hk' },
  nord: { text: 'fyniti', suffix: '.hk' },
  catppuccin: { text: 'fyniti', suffix: '~/hk' },
  synthwave: { text: 'fyniti', suffix: '>>hk' },
  matrix: { text: 'fyniti', suffix: '/hk' },
  bloodmoon: { text: 'fyniti', suffix: '#hk' },
  midnight: { text: 'fyniti', suffix: '@hk' },
  arctic: { text: 'fyniti', suffix: '.hk' },
  gruvbox: { text: 'fyniti', suffix: '\\hk' },
  cyberpunk: { text: 'fyniti', suffix: '>_hk' },
  nebula: { text: 'fyniti', suffix: '*hk' },
  solarized: { text: 'fyniti', suffix: '~hk' },
  rosepine: { text: 'fyniti', suffix: '~>hk' },
  monokai: { text: 'fyniti', suffix: '$hk' },
};

export const themePrompts: Record<ThemeName, string> = {
  hacker: 'root@kali:~# whoami',
  dracula: 'dracula@castle:~$ whoami',
  nord: 'user@fjord:~$ whoami',
  catppuccin: 'neko@mocha:~$ whoami',
  synthwave: 'dj@neonGrid:~$ whoami',
  matrix: 'neo@matrix:~# whoami',
  bloodmoon: 'hunter@eclipse:~# whoami',
  midnight: 'astro@nebula:~$ whoami',
  arctic: 'dev@glacier:~$ whoami',
  gruvbox: 'user@retro:~$ whoami',
  cyberpunk: 'v@ncpd:~# whoami',
  nebula: 'astro@hubble:~$ whoami',
  solarized: 'dev@sol:~$ whoami',
  rosepine: 'bloom@garden:~$ whoami',
  monokai: 'dev@sublime:~$ whoami',
};

export const getThemeLogo = themeGetter(themeLogos);
