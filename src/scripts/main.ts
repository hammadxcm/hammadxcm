import { initAchievements, trackEvent } from './achievements';
import { initGithubTabs, initLeetcodeTabs } from './analytics';
import { initBoot } from './effects/boot';
import { initCanvas } from './effects/canvas';
import { initCursor } from './effects/cursor';
import { initHackerLog } from './effects/hacker-log';
import { initHeroName } from './effects/hero-name';
import { initMatrixRain } from './effects/matrix-rain';
import { initNavLogo } from './effects/nav-logo';
import { initScreenEffects } from './effects/screen-effects';
import { spawnToast } from './effects/toast';
import { initTypewriter } from './effects/typewriter';
import { initAboutLang } from './interactions/about-lang';
import { initBlurUp } from './interactions/blur-up';
import { initCopy } from './interactions/copy';
import { initFloatingIcons } from './interactions/floating-icons';
import { initGuestbookStats } from './interactions/guestbook-stats';
import { initKeyboard } from './interactions/keyboard';
import { initLangSwitcher } from './interactions/lang-switcher';
import { initNav } from './interactions/nav';
import { initObserver } from './interactions/observer';
import { initProjectCards } from './interactions/project-cards';
import { initScrollHandler } from './interactions/scroll';
import { initSmoothScroll } from './interactions/smooth-scroll';
import { initStatusBar } from './interactions/status-bar';
import { initTilt } from './interactions/tilt';
import { setHeroVisible } from './state';
import { initThemeSwitcher } from './theme-switcher';

function safeInit(fn: () => void): void {
  try {
    fn();
  } catch (e) {
    console.error(`[init] ${fn.name} failed:`, e);
  }
}

async function safeLazy(
  loader: () => Promise<{ [k: string]: () => void }>,
  fnName: string,
): Promise<void> {
  try {
    const mod = await loader();
    mod[fnName]();
  } catch (e) {
    console.error(`[lazy] ${fnName} failed:`, e);
  }
}

// ── Tier 1: Synchronous — critical for first paint ──
safeInit(initBoot);
safeInit(initHeroName);
safeInit(initTypewriter);

// ── Tier 2: Next frame — visible effects ──
requestAnimationFrame(() => {
  safeInit(initCanvas);
  safeInit(initMatrixRain);
  safeInit(initCursor);
  safeInit(initHackerLog);
  safeInit(initScreenEffects);
  safeInit(initObserver);
  safeInit(initScrollHandler);
  safeInit(initNav);
});

// ── Tier 3: Deferred — non-visual interactions ──
setTimeout(() => {
  safeInit(initTilt);
  safeInit(initCopy);
  safeInit(initKeyboard);
  safeInit(initFloatingIcons);
  safeInit(initBlurUp);
  safeInit(initSmoothScroll);
  safeInit(initProjectCards);
  safeInit(initStatusBar);
  safeInit(initAboutLang);
  safeInit(initLangSwitcher);
  safeInit(initAchievements);
  safeInit(initGuestbookStats);

  // Nav logo before theme switcher so initial state is set
  safeInit(initNavLogo);
  safeInit(initThemeSwitcher);
  safeInit(initGithubTabs);
  safeInit(initLeetcodeTabs);

  // Bridge toast for achievement notifications
  window.__achievementToast = { spawnToast };

  // Social link tracking
  document.querySelectorAll('.social-btn').forEach((el) => {
    el.addEventListener('click', () => {
      trackEvent('social_click');
    });
  });

  // Shared hero visibility observer
  const heroSection = document.getElementById('hero');
  if (heroSection && window.IntersectionObserver) {
    new IntersectionObserver((entries) => setHeroVisible(entries[0].isIntersecting), {
      threshold: 0,
    }).observe(heroSection);
  }
}, 0);

// ── Tier 4: Idle — easter eggs & panels (already deferred) ──
requestIdleCallback(
  () => {
    safeLazy(() => import('./interactions/konami'), 'initKonami');
    safeLazy(() => import('./interactions/ctf'), 'initCTF');
    safeLazy(() => import('./interactions/annotations'), 'initAnnotations');
    safeLazy(() => import('./interactions/achievement-panel'), 'initAchievementPanel');
    safeLazy(() => import('./interactions/resume-export'), 'initResumeExport');
  },
  { timeout: 3000 },
);
