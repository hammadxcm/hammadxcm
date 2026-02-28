import { prefersReducedMotion } from '../state';

export function initFloatingIcons(): void {
  if (prefersReducedMotion) return;
  const techIcons = document.querySelectorAll<HTMLElement>('.tech-icon');
  techIcons.forEach((icon) => {
    icon.style.animation = 'techFloat 2s ease-in-out infinite';
    icon.style.animationDelay = `${(Math.random() * 2).toFixed(2)}s`;
  });
}
