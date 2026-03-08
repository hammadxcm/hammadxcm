/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../achievements', () => ({ trackEvent: vi.fn() }));

import { initViewMore } from '../interactions/view-more';

describe('initViewMore', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="viewMoreBtn" data-initial="2" data-label-more="View More" data-label-less="Show Less">
        <span class="view-more-text">View More</span>
        <span class="view-more-count">5</span>
        <span class="view-more-chevron"></span>
      </button>
      <div id="grid">
        <div>1</div><div>2</div><div class="hidden-card">3</div><div class="hidden-card">4</div>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing without button', () => {
    document.body.innerHTML = '';
    expect(() => initViewMore('nope', '#grid', 'hidden-card')).not.toThrow();
  });

  it('toggles hidden class on click', () => {
    initViewMore('viewMoreBtn', '#grid', 'hidden-card');
    document.getElementById('viewMoreBtn')!.click();
    const cards = document.querySelectorAll('#grid > *');
    expect(cards[2].classList.contains('hidden-card')).toBe(false);
    expect(cards[2].classList.contains('visible')).toBe(true);
  });

  it('updates text to Show Less on expand', () => {
    initViewMore('viewMoreBtn', '#grid', 'hidden-card');
    document.getElementById('viewMoreBtn')!.click();
    expect(document.querySelector('.view-more-text')!.textContent).toBe('Show Less');
  });

  it('collapses on second click', () => {
    initViewMore('viewMoreBtn', '#grid', 'hidden-card');
    const btn = document.getElementById('viewMoreBtn')!;
    btn.click(); // expand
    btn.click(); // collapse
    expect(document.querySelector('.view-more-text')!.textContent).toBe('View More');
  });
});
