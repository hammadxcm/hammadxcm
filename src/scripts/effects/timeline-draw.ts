import { prefersReducedMotion } from '../state';

let initialized = false;
let svgEl: SVGSVGElement | null = null;
let pathEl: SVGPathElement | null = null;
let scrollHandler: (() => void) | null = null;
let rafId = 0;

function updatePath(timeline: HTMLElement): void {
  if (!pathEl) return;

  const totalLength = pathEl.getTotalLength();
  if (totalLength === 0) return;

  const progress =
    parseFloat(getComputedStyle(timeline).getPropertyValue('--timeline-progress')) || 0;

  const offset = totalLength * (1 - progress);
  pathEl.style.strokeDashoffset = String(offset);
}

export function initTimelineDraw(): void {
  if (initialized) return;

  const timeline = document.querySelector<HTMLElement>('.timeline');
  if (!timeline) return;

  initialized = true;

  // Skip SVG overlay on mobile — CSS ::before handles timeline line
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) return;

  const rect = timeline.getBoundingClientRect();
  const height = timeline.scrollHeight || rect.height;

  // Create SVG overlay
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '4');
  svg.setAttribute('height', String(height));
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.style.left = '27px';
  svg.style.top = '0';
  svg.style.pointerEvents = 'none';
  svg.style.zIndex = '1';

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', `M2 0 L2 ${height}`);
  path.setAttribute('stroke', 'var(--accent)');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap', 'round');

  svg.appendChild(path);
  timeline.style.position = 'relative';
  timeline.appendChild(svg);

  svgEl = svg;
  pathEl = path;

  const totalLength = path.getTotalLength();
  path.style.strokeDasharray = String(totalLength);

  if (prefersReducedMotion) {
    path.style.strokeDashoffset = '0';
    return;
  }

  path.style.strokeDashoffset = String(totalLength);

  const onScroll = () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => updatePath(timeline));
  };

  scrollHandler = onScroll;
  window.addEventListener('scroll', onScroll, { passive: true });

  // Initial update
  updatePath(timeline);
}

export function destroyTimelineDraw(): void {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler);
    scrollHandler = null;
  }
  cancelAnimationFrame(rafId);

  if (svgEl?.parentNode) {
    svgEl.parentNode.removeChild(svgEl);
  }
  svgEl = null;
  pathEl = null;
  initialized = false;
}
