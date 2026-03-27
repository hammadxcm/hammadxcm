/**
 * @vitest-environment happy-dom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../achievements', () => ({ trackEvent: vi.fn() }));
vi.mock('../state', () => ({ prefersReducedMotion: false }));

import { destroyPagination, initPagination } from '../interactions/pagination';

function buildGrid(count: number, pageSize: number): void {
  const grid = document.createElement('div');
  grid.id = 'contributions-paginated-grid';
  grid.dataset.pageSize = String(pageSize);
  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    if (i >= pageSize) card.classList.add('contrib-hidden');
    grid.appendChild(card);
  }
  document.body.appendChild(grid);

  const nav = document.createElement('nav');
  nav.id = 'contributions-pagination';
  nav.dataset.total = String(count);
  nav.dataset.pageSize = String(pageSize);
  nav.dataset.labelPrev = 'Previous';
  nav.dataset.labelNext = 'Next';
  nav.dataset.labelPage = 'Page';
  nav.dataset.labelOf = 'of';
  nav.dataset.labelShowing = 'Showing {start}\u2013{end} of {total}';
  document.body.appendChild(nav);
}

describe('initPagination', () => {
  afterEach(() => {
    destroyPagination();
    document.body.innerHTML = '';
    location.hash = '';
  });

  it('does nothing without grid element', () => {
    expect(() => initPagination()).not.toThrow();
  });

  it('does nothing for single page of items', () => {
    buildGrid(6, 12);
    initPagination();
    const nav = document.getElementById('contributions-pagination');
    expect(nav?.innerHTML).toBe('');
  });

  it('renders page controls for 24 items / 12 per page', () => {
    buildGrid(24, 12);
    initPagination();
    const nav = document.getElementById('contributions-pagination');
    expect(nav?.querySelectorAll('.pagination-page').length).toBe(2);
  });

  it('shows first 12 cards and hides rest', () => {
    buildGrid(24, 12);
    initPagination();
    const cards = document.querySelectorAll('#contributions-paginated-grid > *');
    expect(cards[0].classList.contains('contrib-hidden')).toBe(false);
    expect(cards[11].classList.contains('contrib-hidden')).toBe(false);
    expect(cards[12].classList.contains('contrib-hidden')).toBe(true);
    expect(cards[23].classList.contains('contrib-hidden')).toBe(true);
  });

  it('navigating to page 2 shows cards 13-24', () => {
    buildGrid(24, 12);
    initPagination();
    const page2Btn = document.querySelector('.pagination-page[data-page="2"]') as HTMLElement;
    page2Btn?.click();
    const cards = document.querySelectorAll('#contributions-paginated-grid > *');
    expect(cards[0].classList.contains('contrib-hidden')).toBe(true);
    expect(cards[12].classList.contains('contrib-hidden')).toBe(false);
    expect(cards[23].classList.contains('contrib-hidden')).toBe(false);
  });

  it('disables previous button on page 1', () => {
    buildGrid(24, 12);
    initPagination();
    const prev = document.querySelector('.pagination-prev') as HTMLButtonElement;
    expect(prev?.disabled).toBe(true);
  });

  it('disables next button on last page', () => {
    buildGrid(24, 12);
    initPagination();
    const page2Btn = document.querySelector('.pagination-page[data-page="2"]') as HTMLElement;
    page2Btn?.click();
    const next = document.querySelector('.pagination-next') as HTMLButtonElement;
    expect(next?.disabled).toBe(true);
  });

  it('shows info text with correct range', () => {
    buildGrid(24, 12);
    initPagination();
    const info = document.querySelector('.pagination-info');
    expect(info?.textContent).toContain('1');
    expect(info?.textContent).toContain('12');
    expect(info?.textContent).toContain('24');
  });

  it('marks active page with aria-current', () => {
    buildGrid(24, 12);
    initPagination();
    const active = document.querySelector('.pagination-page.active');
    expect(active?.getAttribute('aria-current')).toBe('page');
    expect(active?.textContent?.trim()).toBe('1');
  });
});
