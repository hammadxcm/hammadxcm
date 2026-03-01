import { initGithubTabs, initLeetcodeTabs } from './analytics';
import { initBoot } from './effects/boot';
import { initCanvas } from './effects/canvas';
import { initCursor } from './effects/cursor';
import { initHackerLog } from './effects/hacker-log';
import { initHeroName } from './effects/hero-name';
import { initMatrixRain } from './effects/matrix-rain';
import { initNavLogo } from './effects/nav-logo';
import { initScreenEffects } from './effects/screen-effects';
import { initTypewriter } from './effects/typewriter';
import { initAboutLang } from './interactions/about-lang';
import { initBlurUp } from './interactions/blur-up';
import { initCopy } from './interactions/copy';
import { initFloatingIcons } from './interactions/floating-icons';
import { initKeyboard } from './interactions/keyboard';
import { initKonami } from './interactions/konami';
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

// Effects (order matters: boot first, canvas next)
safeInit(initBoot);
safeInit(initCanvas);
safeInit(initMatrixRain);
safeInit(initHeroName);
safeInit(initTypewriter);
safeInit(initHackerLog);
safeInit(initScreenEffects);
safeInit(initCursor);

// Interactions (independent, any order)
safeInit(initObserver);
safeInit(initScrollHandler);
safeInit(initTilt);
safeInit(initNav);
safeInit(initCopy);
safeInit(initKeyboard);
safeInit(initFloatingIcons);
safeInit(initBlurUp);
safeInit(initSmoothScroll);
safeInit(initProjectCards);
safeInit(initKonami);
safeInit(initStatusBar);
safeInit(initAboutLang);

// Shared hero visibility observer
const heroSection = document.getElementById('hero');
if (heroSection && window.IntersectionObserver) {
  new IntersectionObserver(
    (entries) => setHeroVisible(entries[0].isIntersecting),
    { threshold: 0 },
  ).observe(heroSection);
}

// Nav logo (before theme switcher so initial state is set)
safeInit(initNavLogo);

// Orchestrator (last — depends on all exports above)
safeInit(initThemeSwitcher);
safeInit(initGithubTabs);
safeInit(initLeetcodeTabs);
