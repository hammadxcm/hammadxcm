/**
 * Contributions browser — search / filter / sort, Cards or Table view,
 * pagination + Show all, and a detail modal. Operates on the JSON data island
 * (#contributions-data) for filtering/sorting/modal content and reorders the
 * pre-rendered card/row nodes by id.
 */

import { getLangColor } from '../../config/lang-colors';
import type { ContributionPR } from '../../config/types';
import {
  DEFAULT_STATES,
  filterContributions,
  type SortKey,
  sortBy,
  statesAreDefault,
} from '../../utils/contribution-filter';
import { formatStars } from '../../utils/format';
import { buildPageRange } from '../../utils/page-range';
import { trackEvent } from '../achievements';
import { prefersReducedMotion } from '../state';

type View = 'cards' | 'table';
type Dir = 'asc' | 'desc';

interface ModalLabels {
  merged: string;
  open: string;
  closed: string;
  files: string;
  viewPr: string;
  repository: string;
  timeToMerge: string;
  created: string;
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hexColor(c: string): string {
  return /^[0-9a-fA-F]{6}$/.test(c) ? c : '888888';
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString();
}

function timeToMerge(pr: ContributionPR): string {
  if (pr.state !== 'merged' || !pr.createdAt || !pr.mergedAt) return '';
  const days = Math.round(
    (new Date(pr.mergedAt).getTime() - new Date(pr.createdAt).getTime()) / 86400000,
  );
  if (Number.isNaN(days)) return '';
  return days <= 0 ? '<1d' : `${days}d`;
}

function tagsHTML(items: string[], wrapClass: string, itemClass: string): string {
  if (items.length === 0) return '';
  const inner = items.map((t) => `<span class="${itemClass}">${esc(t)}</span>`).join('');
  return `<div class="${wrapClass}">${inner}</div>`;
}

function labelsHTML(labels: ContributionPR['labels']): string {
  if (!labels || labels.length === 0) return '';
  const inner = labels
    .map(
      (lb) =>
        `<span class="pr-label" style="--label-color:#${hexColor(lb.color)};--label-bg:#${hexColor(lb.color)}20;">${esc(lb.name)}</span>`,
    )
    .join('');
  return `<div class="contrib-labels">${inner}</div>`;
}

/** Update the result counter, empty-state, and clear-button visibility. */
function updateMeta(
  resultCount: HTMLElement | null,
  emptyEl: HTMLElement | null,
  clearBtn: HTMLButtonElement | null,
  total: number,
  totalAll: number,
  resultCountTpl: string,
  filtersActive: boolean,
): void {
  if (resultCount) {
    resultCount.textContent = resultCountTpl
      .replace('{count}', String(total))
      .replace('{total}', String(totalAll));
  }
  if (emptyEl) emptyEl.classList.toggle('contrib-hidden', total !== 0);
  if (clearBtn) clearBtn.hidden = !filtersActive;
}

/** Reorder matching nodes into display order and toggle visibility for the page slice. */
function applyOrdering(
  container: HTMLElement,
  nodeMap: Map<number, HTMLElement>,
  ordered: number[],
  start: number,
  end: number,
): void {
  const matchSet = new Set(ordered);
  ordered.forEach((id, idx) => {
    const n = nodeMap.get(id);
    if (!n) return;
    container.appendChild(n);
    n.classList.toggle('contrib-hidden', !(idx >= start && idx < end));
  });
  for (const [id, n] of nodeMap) {
    if (!matchSet.has(id)) n.classList.add('contrib-hidden');
  }
}

function buildModalBody(pr: ContributionPR, ML: ModalLabels): string {
  const repo = pr.repo;
  const stateLabel = pr.state === 'open' ? ML.open : pr.state === 'closed' ? ML.closed : ML.merged;
  const ttm = timeToMerge(pr);
  const langItem = repo.language
    ? `<span class="cm-meta-item"><span class="lang-dot" style="background:${getLangColor(repo.language)}"></span>${esc(repo.language)}</span>`
    : '';
  const licenseItem =
    repo.license && repo.license !== 'NOASSERTION'
      ? `<span class="cm-meta-item">${esc(repo.license)}</span>`
      : '';
  const descHTML = repo.description ? `<p class="cm-desc">${esc(repo.description)}</p>` : '';
  const createdRow = pr.createdAt
    ? `<div><dt>${esc(ML.created)}</dt><dd>${esc(fmtDate(pr.createdAt))}</dd></div>`
    : '';
  const ttmRow = ttm ? `<div><dt>${esc(ML.timeToMerge)}</dt><dd>${ttm}</dd></div>` : '';

  return `
      <div class="cm-header">
        <img class="cm-avatar" src="${esc(repo.ownerAvatar)}" alt="" width="44" height="44" loading="lazy" />
        <div class="cm-headtext">
          <a class="cm-repo" href="${esc(repo.url)}" target="_blank" rel="noopener noreferrer">${esc(repo.fullName)}</a>
          <span class="state-badge ${pr.state}-badge cm-state">${esc(stateLabel)}</span>
        </div>
      </div>
      <h3 class="cm-title"><span class="pr-number">#${pr.number}</span> ${esc(pr.title)}</h3>
      ${descHTML}
      <div class="cm-meta">
        ${langItem}
        <span class="cm-meta-item">★ ${formatStars(repo.stars)}</span>
        <span class="cm-meta-item">⑂ ${formatStars(repo.forks || 0)}</span>
        ${licenseItem}
      </div>
      ${tagsHTML(repo.topics || [], 'contrib-topics', 'topic-tag')}
      ${labelsHTML(pr.labels)}
      <div class="cm-stats">
        <span class="diff-add">+${(pr.additions || 0).toLocaleString()}</span>
        <span class="diff-del">-${(pr.deletions || 0).toLocaleString()}</span>
        <span class="diff-files">${pr.changedFiles || 0} ${esc(ML.files)}</span>
      </div>
      <dl class="cm-dates">
        ${createdRow}
        ${ttmRow}
      </dl>
      <div class="cm-actions">
        <a class="cm-cta" href="${esc(pr.url)}" target="_blank" rel="noopener noreferrer">${esc(ML.viewPr)}</a>
        <a class="cm-cta cm-cta--ghost" href="${esc(repo.url)}" target="_blank" rel="noopener noreferrer">${esc(ML.repository)}</a>
      </div>
    `;
}

let cleanup: (() => void) | null = null;

export function destroyContributionsBrowser(): void {
  if (cleanup) cleanup();
  cleanup = null;
}

export function initContributionsBrowser(): void {
  destroyContributionsBrowser();

  const rootEl = document.getElementById('contributions-browser');
  const dataEl = document.getElementById('contributions-data');
  if (!rootEl || !dataEl) return;
  const root = rootEl;

  let prs: (ContributionPR & { _idx: number })[];
  try {
    prs = (JSON.parse(dataEl.textContent || '[]') as ContributionPR[]).map((pr, i) => ({
      ...pr,
      _idx: i,
    }));
  } catch {
    return;
  }

  const cardsGridEl = document.getElementById('contributions-cards-grid');
  const tableBodyEl = document.getElementById('contributions-table-body');
  const cardsView = document.getElementById('contributions-cards-view');
  const tableView = document.getElementById('contributions-table-view');
  const navEl = document.getElementById('contributions-pagination');
  const showAllBtn = document.getElementById('contrib-show-all') as HTMLButtonElement | null;
  const resultCount = document.getElementById('contrib-result-count');
  const emptyEl = document.getElementById('contrib-empty');
  const searchInput = document.getElementById('contrib-search') as HTMLInputElement | null;
  const langSelect = document.getElementById('contrib-lang') as HTMLSelectElement | null;
  const orgSelect = document.getElementById('contrib-org') as HTMLSelectElement | null;
  const sortSelect = document.getElementById('contrib-sort') as HTMLSelectElement | null;
  const clearBtn = document.getElementById('contrib-clear') as HTMLButtonElement | null;
  const chips = Array.from(root.querySelectorAll<HTMLButtonElement>('.contrib-chip'));
  const viewBtns = Array.from(root.querySelectorAll<HTMLButtonElement>('.contrib-view-btn'));
  const sortHeaders = Array.from(root.querySelectorAll<HTMLElement>('.contrib-th-sort'));
  const modal = document.getElementById('contrib-modal') as HTMLDialogElement | null;
  const modalBody = document.getElementById('contrib-modal-body');
  const modalClose = document.getElementById('contrib-modal-close');

  if (!cardsGridEl || !tableBodyEl || !navEl) return;
  const cardsGrid = cardsGridEl;
  const tableBody = tableBodyEl;
  const nav = navEl;

  const PAGE_SIZE = parseInt(root.dataset.pageSize || '24', 10);
  const TOTAL = prs.length;
  const L = {
    prev: root.dataset.labelPrev || 'Previous',
    next: root.dataset.labelNext || 'Next',
    page: root.dataset.labelPage || 'Page',
    showing: root.dataset.labelShowing || 'Showing {start}–{end} of {total}',
    showAll: root.dataset.labelShowAll || 'Show all ({count})',
    showLess: root.dataset.labelShowLess || 'Show less',
    resultCount: root.dataset.labelResultCount || '{count} of {total}',
    noResults: root.dataset.labelNoResults || 'No results',
  };

  // Build id -> node maps for each view.
  const cardNodes = new Map<number, HTMLElement>();
  cardsGrid.querySelectorAll<HTMLElement>('[data-pr-id]').forEach((n) => {
    cardNodes.set(parseInt(n.dataset.prId || '-1', 10), n);
  });
  const rowNodes = new Map<number, HTMLElement>();
  tableBody.querySelectorAll<HTMLElement>('[data-pr-id]').forEach((n) => {
    rowNodes.set(parseInt(n.dataset.prId || '-1', 10), n);
  });

  // ── State ──
  let search = '';
  const states = new Set<string>(DEFAULT_STATES);
  let language = '';
  let org = '';
  let sort: SortKey = 'recent';
  let dir: Dir = 'desc';
  let view: View = 'cards';
  let page = 1;
  let showAll = false;

  try {
    const saved = localStorage.getItem('contrib-view');
    if (saved === 'table') view = 'table';
  } catch {
    /* ignore */
  }

  function hasActiveFilters(): boolean {
    return Boolean(search.trim()) || !statesAreDefault(states) || Boolean(language) || Boolean(org);
  }

  function computeOrdered(): number[] {
    const filtered = filterContributions(prs, {
      search,
      states,
      languages: language ? [language] : [],
      orgs: org ? [org] : [],
    });
    let sorted = sortBy(filtered, sort);
    if (dir === 'asc') sorted = sorted.slice().reverse();
    return sorted.map((pr) => (pr as ContributionPR & { _idx: number })._idx);
  }

  function render(scroll = false): void {
    const ordered = computeOrdered();
    const total = ordered.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > totalPages) page = totalPages;
    const start = showAll ? 0 : (page - 1) * PAGE_SIZE;
    const end = showAll ? total : Math.min(start + PAGE_SIZE, total);

    applyOrdering(
      view === 'cards' ? cardsGrid : tableBody,
      view === 'cards' ? cardNodes : rowNodes,
      ordered,
      start,
      end,
    );

    renderControls(total, totalPages);
    renderShowAll(total);
    updateMeta(resultCount, emptyEl, clearBtn, total, TOTAL, L.resultCount, hasActiveFilters());

    if (scroll && !prefersReducedMotion) {
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderControls(total: number, totalPages: number): void {
    if (showAll || totalPages <= 1) {
      nav.innerHTML = '';
      return;
    }
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, total);
    const showingText = L.showing
      .replace('{start}', String(start))
      .replace('{end}', String(end))
      .replace('{total}', String(total));
    const pageNumbers = buildPageRange(page, totalPages);

    nav.innerHTML = `
      <button class="pagination-btn pagination-prev glass" ${page === 1 ? 'disabled' : ''} aria-label="${L.prev}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        ${L.prev}
      </button>
      <div class="pagination-pages">
        ${pageNumbers
          .map((p) =>
            p === '...'
              ? '<span class="pagination-ellipsis">&hellip;</span>'
              : `<button class="pagination-page glass ${p === page ? 'active' : ''}" data-page="${p}" aria-label="${L.page} ${p}" ${p === page ? 'aria-current="page"' : ''}>${p}</button>`,
          )
          .join('')}
      </div>
      <button class="pagination-btn pagination-next glass" ${page === totalPages ? 'disabled' : ''} aria-label="${L.next}">
        ${L.next}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
      <div class="pagination-info">${showingText}</div>
    `;

    nav.querySelector('.pagination-prev')?.addEventListener('click', () => goTo(page - 1));
    nav.querySelector('.pagination-next')?.addEventListener('click', () => goTo(page + 1));
    nav.querySelectorAll('.pagination-page').forEach((btn) => {
      btn.addEventListener('click', () =>
        goTo(parseInt((btn as HTMLElement).dataset.page || '1', 10)),
      );
    });
  }

  function renderShowAll(total: number): void {
    if (!showAllBtn) return;
    if (total <= PAGE_SIZE) {
      showAllBtn.hidden = true;
      return;
    }
    showAllBtn.hidden = false;
    showAllBtn.textContent = showAll ? L.showLess : L.showAll.replace('{count}', String(total));
  }

  function goTo(p: number): void {
    page = p;
    render(true);
    trackEvent('pagination_navigate');
  }

  // ── Modal ──
  const ML = modal
    ? {
        merged: modal.dataset.labelMerged || 'Merged',
        open: modal.dataset.labelOpen || 'Open',
        closed: modal.dataset.labelClosed || 'Closed',
        files: modal.dataset.labelFiles || 'files',
        viewPr: modal.dataset.labelViewPr || 'View Pull Request',
        repository: modal.dataset.labelRepository || 'Repository',
        timeToMerge: modal.dataset.labelTimeToMerge || 'Time to merge',
        created: modal.dataset.labelCreated || 'Created',
      }
    : null;

  function openModal(id: number): void {
    if (!modal || !modalBody || !ML) return;
    const pr = prs[id];
    if (!pr) return;
    modalBody.innerHTML = buildModalBody(pr, ML);
    modal.showModal();
    trackEvent('contribution_detail_open');
  }

  function onContainerActivate(e: Event): void {
    const item = (e.target as HTMLElement).closest<HTMLElement>('[data-pr-id]');
    if (!item) return;
    const me = e as MouseEvent;
    // Let modified/middle clicks fall through so the card's href opens the PR.
    if (me.metaKey || me.ctrlKey || me.shiftKey || me.altKey || me.button === 1) return;
    e.preventDefault();
    openModal(parseInt(item.dataset.prId || '-1', 10));
  }
  function onRowKey(e: KeyboardEvent): void {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const item = (e.target as HTMLElement).closest<HTMLElement>('[data-pr-id]');
    if (!item) return;
    e.preventDefault();
    openModal(parseInt(item.dataset.prId || '-1', 10));
  }

  // ── Wire events ──
  const listeners: Array<() => void> = [];
  function on<T extends EventTarget>(el: T | null, type: string, fn: EventListener): void {
    if (!el) return;
    el.addEventListener(type, fn);
    listeners.push(() => el.removeEventListener(type, fn));
  }

  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  on(searchInput, 'input', (e) => {
    const value = (e.target as HTMLInputElement).value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      search = value;
      page = 1;
      render();
    }, 150);
  });

  for (const chip of chips) {
    on(chip, 'click', () => {
      const s = chip.dataset.state || '';
      if (states.has(s)) states.delete(s);
      else states.add(s);
      chip.setAttribute('aria-pressed', states.has(s) ? 'true' : 'false');
      chip.classList.toggle('active', states.has(s));
      page = 1;
      render();
    });
  }

  on(langSelect, 'change', (e) => {
    language = (e.target as HTMLSelectElement).value;
    page = 1;
    render();
  });
  on(orgSelect, 'change', (e) => {
    org = (e.target as HTMLSelectElement).value;
    page = 1;
    render();
  });
  on(sortSelect, 'change', (e) => {
    sort = ((e.target as HTMLSelectElement).value as SortKey) || 'recent';
    dir = 'desc';
    syncSortHeaders();
    page = 1;
    render();
  });

  function syncSortHeaders(): void {
    for (const th of sortHeaders) {
      const key = th.dataset.sortKey;
      th.classList.toggle('sorted', key === sort);
      th.dataset.dir = key === sort ? dir : '';
    }
  }

  for (const th of sortHeaders) {
    on(th, 'click', () => {
      const key = (th.dataset.sortKey as SortKey) || 'recent';
      if (sort === key) dir = dir === 'desc' ? 'asc' : 'desc';
      else {
        sort = key;
        dir = 'desc';
      }
      if (sortSelect && Array.from(sortSelect.options).some((o) => o.value === sort)) {
        sortSelect.value = sort;
      }
      syncSortHeaders();
      page = 1;
      render();
    });
  }

  on(clearBtn, 'click', () => {
    search = '';
    if (searchInput) searchInput.value = '';
    states.clear();
    for (const s of DEFAULT_STATES) states.add(s);
    for (const chip of chips) {
      const on = DEFAULT_STATES.includes(chip.dataset.state || '');
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      chip.classList.toggle('active', on);
    }
    language = '';
    if (langSelect) langSelect.value = '';
    org = '';
    if (orgSelect) orgSelect.value = '';
    page = 1;
    render();
  });

  for (const btn of viewBtns) {
    on(btn, 'click', () => {
      const v = (btn.dataset.view as View) || 'cards';
      if (v === view) return;
      setView(v);
    });
  }

  function setView(v: View): void {
    view = v;
    try {
      localStorage.setItem('contrib-view', v);
    } catch {
      /* ignore */
    }
    cardsView?.classList.toggle('contrib-hidden', v !== 'cards');
    tableView?.classList.toggle('contrib-hidden', v !== 'table');
    for (const b of viewBtns) {
      const active = b.dataset.view === v;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
    render();
    trackEvent('contributions_view_toggle');
  }

  on(showAllBtn, 'click', () => {
    showAll = !showAll;
    page = 1;
    render(true);
  });

  // Cards are real links — native Enter/click works; we only intercept plain clicks.
  on(cardsGrid, 'click', onContainerActivate as EventListener);
  // Table rows aren't links, so they need explicit click + keyboard handling.
  on(tableBody, 'click', onContainerActivate as EventListener);
  on(tableBody, 'keydown', onRowKey as EventListener);

  if (modal) {
    on(modalClose, 'click', () => modal.close());
    // Backdrop click closes (click lands on the dialog element itself).
    on(modal, 'click', (e) => {
      if (e.target === modal) modal.close();
    });
  }

  // ── Initial paint ──
  syncSortHeaders();
  if (view === 'table') setView('table');
  else render();

  cleanup = () => {
    for (const off of listeners) off();
    listeners.length = 0;
    clearTimeout(searchTimer);
    if (modal?.open) modal.close();
  };
}
