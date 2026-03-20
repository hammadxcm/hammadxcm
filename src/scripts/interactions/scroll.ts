import { getProgress, trackEvent } from '../achievements';
import { prefersReducedMotion } from '../state';
import { getThemeConfig } from '../theme-config';

let initialized = false;
let scrollAC: AbortController | null = null;

export function destroyScrollHandler(): void {
  scrollAC?.abort();
  scrollAC = null;
  initialized = false;
}

export function initScrollHandler(): void {
  if (initialized) return;
  initialized = true;

  scrollAC = new AbortController();

  const heroContent = document.querySelector<HTMLElement>('.hero-content');
  const scrollIndicator = document.querySelector<HTMLElement>('.scroll-indicator');
  const heroGridLayer = document.querySelector<HTMLElement>('.hero-grid-layer');
  const heroShapesLayer = document.querySelector<HTMLElement>('.hero-shapes-layer');
  const orbs = document.querySelectorAll<HTMLElement>('.orb');
  const nav = document.querySelector<HTMLElement>('nav');
  const progressBar = document.getElementById('scrollProgress');
  const timeline = document.querySelector<HTMLElement>('.timeline');
  const sectionTitles = document.querySelectorAll<HTMLElement>('.section-title');
  let ticking = false;
  let scrolledPastHero = false;
  let reachedBottom = false;
  const loadTime = Date.now();
  let lastScrollY = window.scrollY;

  // Cache timeline position (document-relative) — avoids forced layout per frame
  let timelineTop = 0;
  let timelineHeight = 0;

  function cacheTimelineRect(): void {
    if (!timeline) return;
    const rect = timeline.getBoundingClientRect();
    timelineTop = rect.top + window.scrollY;
    timelineHeight = rect.height;
  }
  cacheTimelineRect();

  // Invalidate on resize
  if (timeline) {
    const ro = new ResizeObserver(() => cacheTimelineRect());
    ro.observe(timeline);
    scrollAC.signal.addEventListener('abort', () => ro.disconnect());
  }

  // Invalidate after View Transition DOM swap
  document.addEventListener('astro:after-swap', cacheTimelineRect, { signal: scrollAC.signal });

  function updateHeroParallax(scrollY: number, vh: number): void {
    if (scrollY >= vh || !heroContent) return;
    const progress = scrollY / vh;
    const scale = 1 - progress * 0.15;
    const opacity = 1 - progress * 1.2;
    heroContent.style.transform = `scale(${Math.max(scale, 0.85)}) translateY(${scrollY * 0.3}px)`;
    heroContent.style.opacity = String(Math.max(opacity, 0));
    if (scrollIndicator) {
      scrollIndicator.style.opacity = String(Math.max(1 - progress * 3, 0));
    }
    if (heroGridLayer) heroGridLayer.style.transform = `translateY(${scrollY * 0.15}px)`;
    if (heroShapesLayer) heroShapesLayer.style.transform = `translateY(${scrollY * 0.4}px)`;
  }

  function updateOrbOpacity(scrollY: number, docHeight: number): void {
    const orbOpacity = Math.max(0.05, 0.12 - (scrollY / docHeight) * 0.06);
    for (let i = 0; i < orbs.length; i++) {
      orbs[i].style.opacity = String(orbOpacity);
    }
  }

  function updateNavBackground(scrollY: number): void {
    if (!nav) return;
    const tc = getThemeConfig();
    const navBgBase = tc.navBg || 'rgba(13, 17, 23, ';
    nav.style.background = scrollY > 50 ? `${navBgBase}0.95)` : `${navBgBase}0.8)`;
  }

  function updateProgressBarWidth(scrollY: number, docHeight: number): void {
    if (!progressBar || CSS.supports('animation-timeline', 'scroll()')) return;
    progressBar.style.width = `${(scrollY / docHeight) * 100}%`;
  }

  function updateTimelineProgress(scrollY: number, vh: number): void {
    if (!timeline || prefersReducedMotion || timelineHeight <= 0) return;
    const viewBottom = scrollY + vh;
    if (viewBottom > timelineTop && scrollY < timelineTop + timelineHeight) {
      const progress = Math.min(
        1,
        Math.max(0, (viewBottom - timelineTop) / (timelineHeight + vh * 0.5)),
      );
      timeline.style.setProperty('--timeline-progress', String(progress));
    }
  }

  function updateSectionTitleGradients(vh: number): void {
    for (let t = 0; t < sectionTitles.length; t++) {
      const titleRect = sectionTitles[t].getBoundingClientRect();
      let titleProgress = 1 - titleRect.top / vh;
      titleProgress = Math.min(1, Math.max(0, titleProgress));
      sectionTitles[t].style.backgroundPosition = `${titleProgress * 100}% 50%`;
    }
  }

  function trackScrollAchievements(scrollY: number, vh: number, docHeight: number): void {
    if (!scrolledPastHero && scrollY > vh * 0.5) {
      scrolledPastHero = true;
      trackEvent('first_scroll');
    }
    if (!reachedBottom && scrollY >= docHeight - 10) {
      reachedBottom = true;
      if (Date.now() - loadTime < 30_000) trackEvent('speed_reader');
    }
    if (reachedBottom && scrollY === 0) trackEvent('full_circle');

    const delta = Math.abs(scrollY - lastScrollY);
    if (delta > 0) {
      const p = getProgress();
      p.scrollDistance = (p.scrollDistance || 0) + delta;
      trackEvent('scroll_distance', 0);
    }
    lastScrollY = scrollY;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const vh = window.innerHeight;
          const docHeight = document.documentElement.scrollHeight - vh;

          updateHeroParallax(scrollY, vh);
          updateOrbOpacity(scrollY, docHeight);
          updateNavBackground(scrollY);
          updateProgressBarWidth(scrollY, docHeight);
          updateTimelineProgress(scrollY, vh);
          updateSectionTitleGradients(vh);
          trackScrollAchievements(scrollY, vh, docHeight);

          ticking = false;
        });
        ticking = true;
      }
    },
    { signal: scrollAC.signal },
  );
}
