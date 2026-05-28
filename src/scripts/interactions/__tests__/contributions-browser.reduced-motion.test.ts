/**
 * @vitest-environment happy-dom
 * Separate file: mocks prefersReducedMotion = true to cover the no-scroll branch.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../achievements', () => ({ trackEvent: vi.fn() }));
vi.mock('../../state', () => ({ prefersReducedMotion: true }));

import { destroyContributionsBrowser, initContributionsBrowser } from '../contributions-browser';

afterEach(() => {
  destroyContributionsBrowser();
  document.body.innerHTML = '';
});

describe('reduced motion', () => {
  it('does not scroll when prefers-reduced-motion is set', () => {
    const scrollSpy = vi
      .spyOn(HTMLElement.prototype, 'scrollIntoView')
      .mockImplementation(() => {});
    document.body.innerHTML = `
      <section id="contributions-browser" data-page-size="1"
        data-label-result-count="{count} of {total}" data-label-show-all="all ({count})">
        <div id="contributions-cards-view"><div id="contributions-cards-grid">
          <a class="contrib-card" data-pr-id="0" href="#"></a>
          <a class="contrib-card" data-pr-id="1" href="#"></a>
        </div></div>
        <div id="contributions-table-view"><tbody id="contributions-table-body"></tbody></div>
        <nav id="contributions-pagination"></nav>
        <button id="contrib-show-all" hidden></button>
        <div id="contrib-result-count"></div>
        <script type="application/json" id="contributions-data"></script>
      </section>`;
    const island = document.getElementById('contributions-data');
    if (island) {
      island.textContent = JSON.stringify([
        {
          number: 0,
          state: 'merged',
          mergedAt: '2025-01-02',
          additions: 0,
          deletions: 0,
          changedFiles: 0,
          labels: [],
          title: 'a',
          url: '#',
          repo: {
            fullName: 'a/a',
            url: '#',
            stars: 0,
            forks: 0,
            language: null,
            description: null,
            ownerAvatar: '',
            topics: [],
            license: null,
          },
        },
        {
          number: 1,
          state: 'merged',
          mergedAt: '2025-01-01',
          additions: 0,
          deletions: 0,
          changedFiles: 0,
          labels: [],
          title: 'b',
          url: '#',
          repo: {
            fullName: 'b/b',
            url: '#',
            stars: 0,
            forks: 0,
            language: null,
            description: null,
            ownerAvatar: '',
            topics: [],
            license: null,
          },
        },
      ]);
    }
    initContributionsBrowser();
    scrollSpy.mockClear();
    // Navigate (scroll=true path) — should NOT scroll under reduced motion.
    (document.querySelector('.pagination-page[data-page="2"]') as HTMLElement)?.dispatchEvent(
      new Event('click', { bubbles: true }),
    );
    expect(scrollSpy).not.toHaveBeenCalled();
    scrollSpy.mockRestore();
  });
});
