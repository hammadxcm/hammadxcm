import {
  destroyAchievements,
  flushPendingToasts,
  initAchievements,
  trackEvent,
} from './achievements';
import { initGithubTabs, initLeetcodeTabs } from './analytics';
import { initBoot } from './effects/boot';
import { destroyCanvas, initCanvas } from './effects/canvas';
import { destroyCursor, initCursor } from './effects/cursor';
import { destroyFavicon, initFavicon } from './effects/favicon';
import { destroyHackerLog, initHackerLog } from './effects/hacker-log';
import { initHeroName } from './effects/hero-name';
import { destroyMatrixRain, initMatrixRain } from './effects/matrix-rain';
import { initNavLogo } from './effects/nav-logo';
import { initPageTransitions } from './effects/page-transitions';
import { destroyScreenEffects, initScreenEffects } from './effects/screen-effects';
import { destroySectionScramble, initSectionScramble } from './effects/section-scramble';
import { destroySpotlight, initSpotlight } from './effects/spotlight';
import { spawnToast } from './effects/toast';
import { initTypewriter } from './effects/typewriter';
import { initAboutLang } from './interactions/about-lang';
import { initBlurUp } from './interactions/blur-up';
import { destroyCommandPalette, initCommandPalette } from './interactions/command-palette';
import { initCopy } from './interactions/copy';
import { initFloatingIcons } from './interactions/floating-icons';
import { destroyGuestbookStats, initGuestbookStats } from './interactions/guestbook-stats';
import { destroyKeyboard, initKeyboard } from './interactions/keyboard';
import { initLangSwitcher } from './interactions/lang-switcher';
import { initNav } from './interactions/nav';
import { destroyObserver, initObserver } from './interactions/observer';
import { initProjectCards } from './interactions/project-cards';
import { destroyScrollHandler, initScrollHandler } from './interactions/scroll';
import { initSmoothScroll } from './interactions/smooth-scroll';
import { destroyStatusBar, initStatusBar } from './interactions/status-bar';
import { initTilt } from './interactions/tilt';
import { setHeroVisible } from './state';
import { destroyThemeSwitcher, initThemeSwitcher } from './theme-switcher';

function safeInit(fn: () => void): void {
  try {
    fn();
  } catch (e) {
    console.error(`[init] ${fn.name} failed:`, e);
  }
}

async function safeLazy(
  loader: () => Promise<Record<string, unknown>>,
  fnName: string,
  destroyName?: string,
): Promise<void> {
  try {
    const mod = await loader();
    if (destroyName && typeof mod[destroyName] === 'function') {
      (mod[destroyName] as () => void)();
    }
    (mod[fnName] as () => void)();
  } catch (e) {
    console.error(`[lazy] ${fnName} failed:`, e);
  }
}

/* ── Destroy all eager modules that have cleanup ── */
function destroyEager(): void {
  // Tier 2
  destroyCanvas();
  destroyMatrixRain();
  destroyCursor();
  destroyHackerLog();
  destroyScreenEffects();
  destroyObserver();
  destroyScrollHandler();
  destroySectionScramble();
  destroySpotlight();
  // Tier 3
  destroyKeyboard();
  destroyStatusBar();
  destroyAchievements();
  destroyGuestbookStats();
  destroyFavicon();
  destroyThemeSwitcher();
  destroyCommandPalette();
}

/* ── Page initialisation (runs on first load + each View Transition) ── */
function initPage(): void {
  // ── Tier 1: Synchronous — critical for first paint ──
  safeInit(initPageTransitions);
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
    safeInit(initSectionScramble);
    safeInit(initSpotlight);
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
    safeInit(initFavicon);

    // Nav logo before theme switcher so initial state is set
    safeInit(initNavLogo);
    safeInit(initThemeSwitcher);
    safeInit(initGithubTabs);
    safeInit(initLeetcodeTabs);
    safeInit(initCommandPalette);

    // Bridge toast for achievement notifications
    window.__achievementToast = { spawnToast };

    // Show any toasts queued before navigation (e.g. language switch)
    flushPendingToasts();

    // Listing page visit tracking
    const listingMain = document.querySelector<HTMLElement>('.listing-page[data-listing-section]');
    if (listingMain) {
      const section = listingMain.dataset.listingSection;
      trackEvent('listing_visit');
      trackEvent(`listing:${section}`);
    }

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

  // ── Tier 4: Idle — easter eggs, panels, & lazy features ──
  requestIdleCallback(
    () => {
      safeLazy(() => import('./interactions/konami'), 'initKonami');
      safeLazy(() => import('./interactions/ctf'), 'initCTF');
      safeLazy(() => import('./interactions/annotations'), 'initAnnotations');
      safeLazy(() => import('./interactions/achievement-panel'), 'initAchievementPanel');
      safeLazy(() => import('./interactions/resume-export'), 'initResumeExport');
      safeLazy(() => import('./effects/magnetic-nav'), 'initMagneticNav', 'destroyMagneticNav');
      safeLazy(() => import('./effects/timeline-draw'), 'initTimelineDraw', 'destroyTimelineDraw');
      safeLazy(
        () => import('./effects/scroll-terminal'),
        'initScrollTerminal',
        'destroyScrollTerminal',
      );
      safeLazy(() => import('./effects/action-log'), 'initActionLog', 'destroyActionLog');
      safeLazy(
        () => import('./effects/code-editor-hero'),
        'initCodeEditorHero',
        'destroyCodeEditorHero',
      );
      safeLazy(
        () => import('./effects/contribution-3d'),
        'initContribution3d',
        'destroyContribution3d',
      );
      safeLazy(() => import('./effects/particle-text'), 'initParticleText', 'destroyParticleText');
      safeLazy(() => import('./effects/wireframe'), 'initWireframe', 'destroyWireframe');
      safeLazy(() => import('./effects/sound'), 'initSound', 'destroySound');
      safeLazy(() => import('./effects/ripple'), 'initRipple');
      safeLazy(() => import('./games/breakout'), 'initBreakout', 'destroyBreakout');
      safeLazy(() => import('./integrations/spotify'), 'initSpotify', 'destroySpotify');
      safeLazy(
        () => import('./integrations/visitor-presence'),
        'initVisitorPresence',
        'destroyVisitorPresence',
      );
      safeLazy(() => import('./integrations/chatbot'), 'initChatbot', 'destroyChatbot');
    },
    { timeout: 3000 },
  );
}

// ── Initial load ──
initPage();

// ── View Transitions: re-init after DOM swap ──
document.addEventListener('astro:after-swap', () => {
  destroyEager();
  initPage();
});
