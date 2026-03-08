import { getCurrentTheme } from '../state';
import type { ThemeName } from '../types';
import { spawnToast } from './toast';

let initialized = false;
let terminalEl: HTMLElement | null = null;
let observer: IntersectionObserver | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
let scrollHandler: (() => void) | null = null;
let currentSection = '';

const SECTION_LABELS: Record<string, string> = {
  hero: 'home',
  about: 'about',
  tech: 'tech arsenal',
  journey: 'journey',
  projects: 'projects',
  contributions: 'contributions',
  certs: 'certifications',
  testimonials: 'testimonials',
  analytics: 'analytics',
  guestbook: 'guestbook',
};

const PROMPT_MAP: Record<string, string> = {
  hacker: '#',
  matrix: '#',
  catppuccin: '>',
};

function getPrompt(): string {
  const theme: ThemeName = getCurrentTheme();
  return PROMPT_MAP[theme] || '$';
}

function show(): void {
  if (!terminalEl) return;
  terminalEl.classList.add('visible');
}

function hide(): void {
  if (!terminalEl) return;
  terminalEl.classList.remove('visible');
}

function scheduleHide(): void {
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(hide, 3000);
}

function onSectionIntersect(entries: IntersectionObserverEntry[]): void {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const id = (entry.target as HTMLElement).id;
    if (!id || id === currentSection) continue;

    currentSection = id;
    const label = SECTION_LABELS[id] || id;
    const msg = `${getPrompt()} Entering ${label} sector...`;
    if (terminalEl) {
      terminalEl.textContent = msg;
      show();
      scheduleHide();
    }
    spawnToast(msg);
  }
}

export function initScrollTerminal(): void {
  if (initialized) return;

  const sections = document.querySelectorAll<HTMLElement>('section[id]');
  if (sections.length === 0) return;

  initialized = true;

  // Create terminal element
  const el = document.createElement('div');
  el.className = 'scroll-terminal';
  el.setAttribute('aria-hidden', 'true');
  document.body.appendChild(el);
  terminalEl = el;

  // Set up IntersectionObserver for sections
  observer = new IntersectionObserver(onSectionIntersect, {
    threshold: 0.3,
  });
  for (const s of sections) observer?.observe(s);

  // Show on scroll, auto-hide after 3s
  const onScroll = () => {
    if (terminalEl && currentSection) {
      show();
      scheduleHide();
    }
  };
  scrollHandler = onScroll;
  window.addEventListener('scroll', onScroll, { passive: true });
}

export function destroyScrollTerminal(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler);
    scrollHandler = null;
  }
  if (terminalEl?.parentNode) {
    terminalEl.parentNode.removeChild(terminalEl);
  }
  terminalEl = null;
  currentSection = '';
  initialized = false;
}
