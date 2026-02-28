import { initBoot } from './effects/boot';
import { initCanvas } from './effects/canvas';
import { initMatrixRain } from './effects/matrix-rain';
import { initHeroName } from './effects/hero-name';
import { initTypewriter } from './effects/typewriter';
import { initHackerLog } from './effects/hacker-log';
import { initCursor } from './effects/cursor';
import { initScreenEffects } from './effects/screen-effects';
import { initObserver } from './interactions/observer';
import { initScrollHandler } from './interactions/scroll';
import { initTilt } from './interactions/tilt';
import { initNav } from './interactions/nav';
import { initCopy } from './interactions/copy';
import { initKeyboard } from './interactions/keyboard';
import { initFloatingIcons } from './interactions/floating-icons';
import { initBlurUp } from './interactions/blur-up';
import { initSmoothScroll } from './interactions/smooth-scroll';
import { initProjectCards } from './interactions/project-cards';
import { initKonami } from './interactions/konami';
import { initStatusBar } from './interactions/status-bar';
import { initAboutLang } from './interactions/about-lang';
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
