import { prefersReducedMotion } from '../state';

export function initSmoothScroll(): void {
  if (prefersReducedMotion) return;
  document.documentElement.style.scrollBehavior = 'auto';

  const navAnchors = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
  navAnchors.forEach((anchor) => {
    anchor.addEventListener('click', function (e: MouseEvent) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      const startY = window.scrollY;
      const targetY = target.getBoundingClientRect().top + startY - 64;
      const distance = targetY - startY;
      const absDist = Math.abs(distance);
      const duration = Math.min(1500, Math.max(800, absDist * 0.4));
      const startTime = performance.now();

      function easeOutExpo(t: number): number {
        return t === 1 ? 1 : 1 - 2 ** (-10 * t);
      }

      function step(now: number): void {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);
        window.scrollTo(0, startY + distance * easedProgress);
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    });
  });
}
