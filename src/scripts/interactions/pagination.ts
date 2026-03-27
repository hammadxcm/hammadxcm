import { trackEvent } from '../achievements';
import { prefersReducedMotion } from '../state';

const GRID_ID = 'contributions-paginated-grid';
const NAV_ID = 'contributions-pagination';
const HIDDEN_CLASS = 'contrib-hidden';

let currentPage = 1;
let cleanupFn: (() => void) | null = null;

export function destroyPagination(): void {
  cleanupFn?.();
  cleanupFn = null;
  currentPage = 1;
}

export function initPagination(): void {
  const gridEl = document.getElementById(GRID_ID);
  const navEl = document.getElementById(NAV_ID);
  if (!gridEl || !navEl) return;

  // Local constants so TS narrows inside closures
  const grid = gridEl;
  const nav = navEl;
  const cards = Array.from(grid.children) as HTMLElement[];
  const totalItems = cards.length;
  const pageSize = parseInt(nav.dataset.pageSize || '12', 10);
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return;

  const labels = {
    prev: nav.dataset.labelPrev || 'Previous',
    next: nav.dataset.labelNext || 'Next',
    page: nav.dataset.labelPage || 'Page',
    of: nav.dataset.labelOf || 'of',
    showing: nav.dataset.labelShowing || 'Showing {start}\u2013{end} of {total}',
  };

  // Restore page from URL hash
  const hashPage = parseInt(new URL(location.href).hash.replace('#page=', ''), 10);
  if (hashPage >= 1 && hashPage <= totalPages) {
    currentPage = hashPage;
  }

  function showPage(page: number, scroll = true): void {
    currentPage = page;
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, totalItems);

    cards.forEach((card, i) => {
      const shouldShow = i >= start && i < end;
      card.classList.toggle(HIDDEN_CLASS, !shouldShow);
      if (shouldShow) card.classList.add('visible');
    });

    history.replaceState(null, '', `#page=${page}`);

    if (scroll) {
      grid.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }

    renderControls();
    trackEvent('pagination_navigate');
  }

  function renderControls(): void {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    const showingText = labels.showing
      .replace('{start}', String(start))
      .replace('{end}', String(end))
      .replace('{total}', String(totalItems));

    const pageNumbers = buildPageRange(currentPage, totalPages);

    nav.innerHTML = `
      <button class="pagination-btn pagination-prev glass"
              ${currentPage === 1 ? 'disabled' : ''}
              aria-label="${labels.prev}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round"
             stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        ${labels.prev}
      </button>

      <div class="pagination-pages">
        ${pageNumbers
          .map((p) =>
            p === '...'
              ? '<span class="pagination-ellipsis">&hellip;</span>'
              : `<button class="pagination-page glass ${p === currentPage ? 'active' : ''}"
                         data-page="${p}"
                         aria-label="${labels.page} ${p}"
                         ${p === currentPage ? 'aria-current="page"' : ''}>
                  ${p}
                </button>`,
          )
          .join('')}
      </div>

      <button class="pagination-btn pagination-next glass"
              ${currentPage === totalPages ? 'disabled' : ''}
              aria-label="${labels.next}">
        ${labels.next}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round"
             stroke-linejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      <div class="pagination-info">${showingText}</div>
    `;

    nav.querySelector('.pagination-prev')?.addEventListener('click', () => {
      if (currentPage > 1) showPage(currentPage - 1);
    });
    nav.querySelector('.pagination-next')?.addEventListener('click', () => {
      if (currentPage < totalPages) showPage(currentPage + 1);
    });
    nav.querySelectorAll('.pagination-page').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = parseInt((btn as HTMLElement).dataset.page || '1', 10);
        showPage(p);
      });
    });
  }

  // Initial render (no scroll on first load)
  showPage(currentPage, false);

  function onKeydown(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft' && currentPage > 1) {
      showPage(currentPage - 1);
    } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
      showPage(currentPage + 1);
    }
  }

  nav.addEventListener('keydown', onKeydown);

  cleanupFn = () => {
    nav.removeEventListener('keydown', onKeydown);
    nav.innerHTML = '';
  };
}

/**
 * Build a page range like [1, '...', 4, 5, 6, '...', 9].
 * Shows first, last, and up to 2 neighbours around current.
 */
function buildPageRange(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | string)[] = [];
  const addPage = (p: number): void => {
    if (!pages.includes(p)) pages.push(p);
  };

  addPage(1);
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    addPage(i);
  }
  if (current < total - 2) pages.push('...');
  addPage(total);

  return pages;
}
