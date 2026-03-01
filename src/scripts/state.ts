export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

let _isPageVisible = !document.hidden;
document.addEventListener('visibilitychange', () => {
  _isPageVisible = !document.hidden;
});

export function isPageVisible(): boolean {
  return _isPageVisible;
}
