import { trackEvent } from '../achievements';

let initialized = false;
let revealObserver: IntersectionObserver | null = null;
let sectionObserver: IntersectionObserver | null = null;

export function destroyObserver(): void {
  revealObserver?.disconnect();
  sectionObserver?.disconnect();
  revealObserver = null;
  sectionObserver = null;
  initialized = false;
}

export function initObserver(): void {
  if (initialized) return;
  initialized = true;

  const selectors =
    '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .reveal-clip, .stagger, .section-separator';
  const elements = document.querySelectorAll(selectors);
  if (!elements.length) return;

  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (entry.target.classList.contains('stagger')) {
            const children = entry.target.children;
            for (let i = 0; i < children.length; i++) {
              children[i].classList.add('visible');
            }
          }
        }
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -60px 0px' },
  );

  for (const el of elements) revealObserver.observe(el);

  // Section visibility tracking for achievements
  const sections = document.querySelectorAll<HTMLElement>('section[id]');
  if (sections.length) {
    sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target.id) {
            trackEvent(`section:${entry.target.id}`);
          }
        }
      },
      { threshold: 0.2 },
    );
    for (const section of sections) sectionObserver.observe(section);
  }
}
