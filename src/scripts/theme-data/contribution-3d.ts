import type { ThemeName } from '../types';

/**
 * Maps each theme to a profile-3d-contrib SVG variant that best fits its palette.
 * Variants live at /generated/profile-3d-contrib/<variant>.svg (mirrored into /public at prebuild).
 */
export const contribution3DVariantMap: Record<ThemeName, string> = {
  hacker: 'profile-green-animate',
  matrix: 'profile-green-animate',
  monokai: 'profile-night-green',
  dracula: 'profile-night-rainbow',
  catppuccin: 'profile-night-rainbow',
  synthwave: 'profile-night-rainbow',
  cyberpunk: 'profile-night-rainbow',
  nebula: 'profile-night-rainbow',
  nord: 'profile-night-view',
  midnight: 'profile-night-view',
  bloodmoon: 'profile-night-rainbow',
  gruvbox: 'profile-season-animate',
  rosepine: 'profile-season-animate',
  arctic: 'profile-season-animate',
  solarized: 'profile-season-animate',
};

export function getContribution3DVariant(theme: string | null | undefined): string {
  if (!theme) return contribution3DVariantMap.hacker;
  return contribution3DVariantMap[theme as ThemeName] ?? contribution3DVariantMap.hacker;
}
