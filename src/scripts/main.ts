import { initGithubTabs, initLeetcodeTabs } from './analytics';
import { initBoot } from './effects/boot';
import { initCanvas } from './effects/canvas';
import { initCursor } from './effects/cursor';
import { initHackerLog } from './effects/hacker-log';
import { initHeroName } from './effects/hero-name';
import { initMatrixRain } from './effects/matrix-rain';
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
import { initThemeSwitcher } from './theme-switcher';

// Effects (order matters: boot first, canvas next)
initBoot();
initCanvas();
initMatrixRain();
initHeroName();
initTypewriter();
initHackerLog();
initScreenEffects();
initCursor();

// Interactions (independent, any order)
initObserver();
initScrollHandler();
initTilt();
initNav();
initCopy();
initKeyboard();
initFloatingIcons();
initBlurUp();
initSmoothScroll();
initProjectCards();
initKonami();
initStatusBar();
initAboutLang();

// Orchestrator (last — depends on all exports above)
initThemeSwitcher();
initGithubTabs();
initLeetcodeTabs();
