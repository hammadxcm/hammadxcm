/**
 * Page Navigation Transitions
 * Detects forward/back navigation direction and sets data-nav-direction
 * on <html> for CSS-driven directional slide+scale animations.
 */

let initialized = false;

function isListingPage(url: string): boolean {
  const path = new URL(url, location.origin).pathname;
  return /\/(testimonials|projects|contributions|certifications|analytics)(\/|$)/.test(path);
}

function getDirection(from: string, to: string): 'forward' | 'back' | 'none' {
  const fromListing = isListingPage(from);
  const toListing = isListingPage(to);

  if (!fromListing && toListing) return 'forward';
  if (fromListing && !toListing) return 'back';
  return 'none';
}

function spawnFlash(): void {
  const flash = document.createElement('div');
  flash.className = 'nav-transition-flash';
  document.body.appendChild(flash);

  // Trigger reflow then animate
  flash.offsetHeight; // eslint-disable-line @typescript-eslint/no-unused-expressions
  flash.classList.add('active');

  flash.addEventListener(
    'animationend',
    () => {
      flash.remove();
    },
    { once: true },
  );
}

export function initPageTransitions(): void {
  if (initialized) return;
  initialized = true;

  document.addEventListener('astro:before-preparation', ((e: CustomEvent) => {
    const from = (e as CustomEvent & { from: URL }).from?.href || location.href;
    const to = (e as CustomEvent & { to: URL }).to?.href || '';
    const dir = getDirection(from, to);
    document.documentElement.setAttribute('data-nav-direction', dir);
  }) as EventListener);

  document.addEventListener('astro:after-swap', () => {
    const dir = document.documentElement.getAttribute('data-nav-direction');
    if (dir && dir !== 'none') {
      spawnFlash();
    }

    // Clean up after transition settles (2 rAFs)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.removeAttribute('data-nav-direction');
      });
    });
  });
}
