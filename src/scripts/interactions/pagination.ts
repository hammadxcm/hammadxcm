import { buildPageRange } from '../../utils/page-range';
import { trackEvent } from '../achievements';
import { prefersReducedMotion } from '../state';

// Contributions has its own richer controller (contributions-browser.ts).
const PAGINATED_GRIDS = [
  { gridId: 'projects-listing-grid', navId: 'projects-pagination', hiddenClass: 'project-hidden' },
];

interface PaginationInstance {
  currentPage: number;
  cleanup: () => void;
}

const instances: PaginationInstance[] = [];

export function destroyPagination(): void {
  for (const inst of instances) inst.cleanup();
  instances.length = 0;
}

export function initPagination(): void {
  for (const cfg of PAGINATED_GRIDS) {
    const inst = initPaginatedGrid(cfg.gridId, cfg.navId, cfg.hiddenClass);
    if (inst) instances.push(inst);
  }
}

function initPaginatedGrid(
  gridId: string,
  navId: string,
  hiddenClass: string,
): PaginationInstance | null {
  const gridEl = document.getElementById(gridId);
  const navEl = document.getElementById(navId);
  if (!gridEl || !navEl) return null;

  const grid = gridEl;
  const nav = navEl;
  const cards = Array.from(grid.children) as HTMLElement[];
  const totalItems = cards.length;
  const pageSize = parseInt(nav.dataset.pageSize || '12', 10);
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  const labels = {
    prev: nav.dataset.labelPrev || 'Previous',
    next: nav.dataset.labelNext || 'Next',
    page: nav.dataset.labelPage || 'Page',
    of: nav.dataset.labelOf || 'of',
    showing: nav.dataset.labelShowing || 'Showing {start}\u2013{end} of {total}',
  };

  let currentPage = 1;

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
      card.classList.toggle(hiddenClass, !shouldShow);
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

  const inst: PaginationInstance = {
    get currentPage() {
      return currentPage;
    },
    set currentPage(v) {
      currentPage = v;
    },
    cleanup: () => {
      nav.removeEventListener('keydown', onKeydown);
      nav.innerHTML = '';
    },
  };

  return inst;
}
