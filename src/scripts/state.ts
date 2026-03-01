import type { ThemeName } from './types';

export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

/* ── Page visibility ── */
let _isPageVisible = !document.hidden;

type VisibilityListener = (visible: boolean) => void;
const visibilityListeners: VisibilityListener[] = [];

document.addEventListener('visibilitychange', () => {
  _isPageVisible = !document.hidden;
  for (const fn of visibilityListeners) fn(_isPageVisible);
});

export function isPageVisible(): boolean {
  return _isPageVisible;
}

export function onVisibilityChange(fn: VisibilityListener): void {
  visibilityListeners.push(fn);
}

/* ── Cached theme ── */
let _currentTheme: ThemeName =
  (document.documentElement.getAttribute('data-theme') as ThemeName) || 'hacker';

export function getCurrentTheme(): ThemeName {
  return _currentTheme;
}

export function setCurrentTheme(t: ThemeName): void {
  _currentTheme = t;
}

/* ── Client IP (fetched once on init) ── */
let _clientIP = '';

export function getClientIP(): string {
  return _clientIP;
}

export function setClientIP(ip: string): void {
  _clientIP = ip;
}

/* ── Hero visibility ── */
let _heroVisible = true;

export function isHeroVisible(): boolean {
  return _heroVisible;
}

export function setHeroVisible(v: boolean): void {
  _heroVisible = v;
}
