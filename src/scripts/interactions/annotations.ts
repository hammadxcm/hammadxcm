/**
 * View Source Commentary Mode
 * Backtick key toggles annotation overlays on each section explaining engineering decisions.
 */

import { trackEvent } from '../achievements';

const annotations: Record<string, string> = {
  about:
    'Multi-language code block with syntax highlighting. Theme-aware via CSS custom properties. Language switcher uses JSON island pattern for zero-JS hydration cost.',
  tech: 'Icon grid with lazy loading. Each icon is a direct URL to avoid bundling 50+ SVGs. Hover animations use CSS transforms for GPU acceleration.',
  journey:
    'Timeline with staggered reveal animations via Intersection Observer. HTML entities in dates for proper typographic dashes.',
  projects:
    'Hybrid data: featured projects from config (curated), dynamic repos from GitHub API (fetch at build time). Download counts from npm/RubyGems APIs.',
  contributions:
    'Data fetched at build time via GitHub GraphQL API. PR cards with relative time formatting per locale.',
  certs: 'Mix of SVG inline badges and external images. Responsive grid with glass morphism cards.',
  testimonials:
    'CSS-only marquee via translateX animation on duplicated content. Pauses on hover. Falls back to wrapped grid for reduced-motion.',
  analytics:
    'GitHub Stats cards via img src pointing to Vercel-hosted SVG generators. Tab system for organizing multiple stat views.',
  guestbook:
    'Giscus (GitHub Discussions) embed. Theme parameter synced with portfolio theme via postMessage API.',
};

let active = false;
const badges: HTMLElement[] = [];

function createBadges(): void {
  for (const [sectionId, text] of Object.entries(annotations)) {
    const section = document.getElementById(sectionId);
    if (!section) continue;

    const badge = document.createElement('div');
    badge.className = 'annotation-badge';
    badge.innerHTML = `<span class="annotation-icon">&lt;/&gt;</span><span class="annotation-text">${text}</span>`;
    badge.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 100;
      max-width: 320px;
      padding: 0.75rem 1rem;
      background: var(--bg-card-solid);
      border: 1px solid var(--accent);
      border-radius: 8px;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      line-height: 1.6;
      color: var(--text);
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s, visibility 0.2s;
      pointer-events: none;
    `;

    // Ensure section is positioned
    const pos = getComputedStyle(section).position;
    if (pos === 'static') section.style.position = 'relative';

    section.appendChild(badge);
    badges.push(badge);
  }
}

function showBadges(): void {
  badges.forEach((b) => {
    b.style.opacity = '1';
    b.style.visibility = 'visible';
  });
}

function hideBadges(): void {
  badges.forEach((b) => {
    b.style.opacity = '0';
    b.style.visibility = 'hidden';
  });
}

export function initAnnotations(): void {
  createBadges();

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key !== '`') return;
    // Don't trigger if typing in an input
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    active = !active;
    if (active) {
      showBadges();
      trackEvent('annotations');
    } else {
      hideBadges();
    }
  });
}
