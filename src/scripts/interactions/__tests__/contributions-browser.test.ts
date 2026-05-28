/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../achievements', () => ({ trackEvent: vi.fn() }));
vi.mock('../../state', () => ({ prefersReducedMotion: false }));

import { destroyContributionsBrowser, initContributionsBrowser } from '../contributions-browser';

interface PR {
  title: string;
  url: string;
  number: number;
  state: string;
  mergedAt: string;
  createdAt?: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  labels: { name: string; color: string }[];
  repo: {
    fullName: string;
    url: string;
    stars: number;
    forks: number;
    language: string | null;
    description: string | null;
    ownerAvatar: string;
    topics: string[];
    license: string | null;
  };
}

function pr(i: number, over: Partial<PR> & { repo?: Partial<PR['repo']> } = {}): PR {
  const { repo, ...rest } = over;
  return {
    title: `PR ${i}`,
    url: `https://gh/pull/${i}`,
    number: i,
    state: 'merged',
    mergedAt: `2025-01-${String((i % 28) + 1).padStart(2, '0')}`,
    additions: i,
    deletions: 0,
    changedFiles: i,
    labels: [],
    ...rest,
    repo: {
      fullName: `org${i}/repo${i}`,
      url: `https://gh/org${i}`,
      stars: i,
      forks: 0,
      language: 'TypeScript',
      description: null,
      ownerAvatar: '',
      topics: [],
      license: null,
      ...repo,
    },
  };
}

function uniq(xs: string[]): string[] {
  return [...new Set(xs)];
}

function mount(prs: PR[], opts: { pageSize?: number; storage?: string; omit?: string } = {}): void {
  const pageSize = opts.pageSize ?? 50;
  localStorage.clear();
  if (opts.storage) localStorage.setItem('contrib-view', opts.storage);

  const langs = uniq(prs.map((p) => p.repo.language).filter(Boolean) as string[]);
  const orgs = uniq(prs.map((p) => p.repo.fullName.split('/')[0]));

  document.body.innerHTML = `
    <section id="contributions-browser" data-page-size="${pageSize}"
      data-label-prev="Prev" data-label-next="Next" data-label-page="Page"
      data-label-showing="Showing {start}-{end} of {total}"
      data-label-show-all="Show all ({count})" data-label-show-less="Show less"
      data-label-result-count="{count} of {total}" data-label-no-results="No results">
      <div id="contrib-toolbar">
        <input id="contrib-search" />
        <button class="contrib-chip active" data-state="merged" aria-pressed="true"></button>
        <button class="contrib-chip active" data-state="open" aria-pressed="true"></button>
        <button class="contrib-chip" data-state="closed" aria-pressed="false"></button>
        <select id="contrib-lang"><option value="">all</option>${langs.map((l) => `<option value="${l}">${l}</option>`).join('')}</select>
        <select id="contrib-org"><option value="">all</option>${orgs.map((o) => `<option value="${o}">${o}</option>`).join('')}</select>
        <select id="contrib-sort">
          <option value="recent">recent</option>
          <option value="stars">stars</option>
          <option value="impact">impact</option>
          <option value="size">size</option>
        </select>
        <button id="contrib-clear" hidden></button>
        <button class="contrib-view-btn active" data-view="cards" aria-pressed="true"></button>
        <button class="contrib-view-btn" data-view="table" aria-pressed="false"></button>
      </div>
      <div id="contrib-result-count"></div>
      <div id="contributions-cards-view"><div id="contributions-cards-grid"></div></div>
      <div id="contributions-table-view" class="contrib-hidden">
        <table><thead><tr>
          <th class="contrib-th-sort" data-sort-key="stars"><button></button></th>
          <th class="contrib-th-sort" data-sort-key="impact"><button></button></th>
          <th class="contrib-th-sort" data-sort-key="recent"><button></button></th>
        </tr></thead><tbody id="contributions-table-body"></tbody></table>
      </div>
      <div id="contrib-empty" class="contrib-hidden"></div>
      <nav id="contributions-pagination"></nav>
      <button id="contrib-show-all" hidden></button>
      <script type="application/json" id="contributions-data"></script>
    </section>
    <dialog id="contrib-modal" data-label-merged="Merged" data-label-open="Open"
      data-label-closed="Closed" data-label-files="files" data-label-view-pr="View PR"
      data-label-repository="Repository" data-label-time-to-merge="Time to merge"
      data-label-created="Created">
      <button id="contrib-modal-close"></button>
      <div id="contrib-modal-body"></div>
    </dialog>
  `;

  const grid = document.getElementById('contributions-cards-grid');
  const tb = document.getElementById('contributions-table-body');
  prs.forEach((_, i) => {
    const a = document.createElement('a');
    a.className = 'contrib-card';
    a.dataset.prId = String(i);
    a.setAttribute('href', '#');
    grid?.appendChild(a);
    const tr = document.createElement('tr');
    tr.className = 'contrib-row';
    tr.dataset.prId = String(i);
    tr.tabIndex = 0;
    tb?.appendChild(tr);
  });

  const island = document.getElementById('contributions-data');
  if (island && opts.omit !== 'data') island.textContent = JSON.stringify(prs);
  if (opts.omit === 'badjson' && island) island.textContent = '{not json';

  initContributionsBrowser();
}

const $ = (sel: string) => document.querySelector(sel) as HTMLElement;
const id = (x: string) => document.getElementById(x);
const visibleCardIds = (): string[] =>
  [
    ...document.querySelectorAll('#contributions-cards-grid > .contrib-card:not(.contrib-hidden)'),
  ].map((c) => (c as HTMLElement).dataset.prId as string);
const visibleRowIds = (): string[] =>
  [
    ...document.querySelectorAll('#contributions-table-body > .contrib-row:not(.contrib-hidden)'),
  ].map((c) => (c as HTMLElement).dataset.prId as string);
const clickChip = (state: string) =>
  $(`.contrib-chip[data-state="${state}"]`).dispatchEvent(new Event('click', { bubbles: true }));
const changeSelect = (sel: string, value: string) => {
  const el = id(sel) as HTMLSelectElement;
  el.value = value;
  el.dispatchEvent(new Event('change'));
};

beforeEach(() => {
  const proto = globalThis.HTMLDialogElement.prototype as unknown as {
    showModal: () => void;
    close: () => void;
    open: boolean;
  };
  proto.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
  proto.close = function (this: HTMLDialogElement) {
    this.open = false;
  };
});

afterEach(() => {
  destroyContributionsBrowser();
  document.body.innerHTML = '';
  localStorage.clear();
  vi.clearAllMocks();
});

describe('initContributionsBrowser — guards', () => {
  it('no-ops without root/data island', () => {
    document.body.innerHTML = '';
    expect(() => initContributionsBrowser()).not.toThrow();
  });

  it('no-ops on invalid JSON data island', () => {
    mount([pr(0)], { omit: 'badjson' });
    expect(id('contrib-result-count')?.textContent).toBe('');
  });

  it('no-ops when grid/table/nav missing', () => {
    document.body.innerHTML = `<section id="contributions-browser"><script type="application/json" id="contributions-data">[]</script></section>`;
    expect(() => initContributionsBrowser()).not.toThrow();
  });
});

describe('default state = Merged + Open', () => {
  it('hides Closed by default and counts merged+open', () => {
    mount([pr(0, { state: 'merged' }), pr(1, { state: 'open' }), pr(2, { state: 'closed' })]);
    expect(id('contrib-result-count')?.textContent).toBe('2 of 3');
    expect(visibleCardIds()).toEqual(['0', '1']);
    expect((id('contrib-clear') as HTMLButtonElement).hidden).toBe(true);
  });

  it('clicking Closed chip reveals closed and shows Clear', () => {
    mount([pr(0, { state: 'merged' }), pr(1, { state: 'closed' })]);
    clickChip('closed');
    expect(id('contrib-result-count')?.textContent).toBe('2 of 2');
    expect((id('contrib-clear') as HTMLButtonElement).hidden).toBe(false);
    expect($('.contrib-chip[data-state="closed"]').getAttribute('aria-pressed')).toBe('true');
  });

  it('toggling a chip off removes that state', () => {
    mount([pr(0, { state: 'merged' }), pr(1, { state: 'open' })]);
    clickChip('open');
    expect(visibleCardIds()).toEqual(['0']);
    expect($('.contrib-chip[data-state="open"]').classList.contains('active')).toBe(false);
  });
});

describe('filters', () => {
  it('search filters across repo/title (debounced)', () => {
    vi.useFakeTimers();
    mount([
      pr(0, { repo: { fullName: 'vercel/next' } }),
      pr(1, { repo: { fullName: 'rails/rails' } }),
    ]);
    const input = id('contrib-search') as HTMLInputElement;
    input.value = 'vercel';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(150);
    vi.useRealTimers();
    expect(visibleCardIds()).toEqual(['0']);
  });

  it('language filter', () => {
    mount([pr(0, { repo: { language: 'Ruby' } }), pr(1, { repo: { language: 'TypeScript' } })]);
    changeSelect('contrib-lang', 'Ruby');
    expect(visibleCardIds()).toEqual(['0']);
  });

  it('org filter', () => {
    mount([pr(0, { repo: { fullName: 'a/x' } }), pr(1, { repo: { fullName: 'b/y' } })]);
    changeSelect('contrib-org', 'b');
    expect(visibleCardIds()).toEqual(['1']);
  });

  it('empty state when nothing matches', () => {
    vi.useFakeTimers();
    mount([pr(0)]);
    const input = id('contrib-search') as HTMLInputElement;
    input.value = 'zzz-nomatch';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(150);
    vi.useRealTimers();
    expect(id('contrib-result-count')?.textContent).toBe('0 of 1');
    expect(id('contrib-empty')?.classList.contains('contrib-hidden')).toBe(false);
  });

  it('clear resets to default Merged+Open', () => {
    mount([pr(0, { state: 'merged', repo: { language: 'Ruby' } }), pr(1, { state: 'closed' })]);
    clickChip('closed');
    changeSelect('contrib-lang', 'Ruby');
    id('contrib-clear')?.dispatchEvent(new Event('click', { bubbles: true }));
    expect(id('contrib-result-count')?.textContent).toBe('1 of 2');
    expect((id('contrib-search') as HTMLInputElement).value).toBe('');
    expect((id('contrib-lang') as HTMLSelectElement).value).toBe('');
    expect($('.contrib-chip[data-state="closed"]').getAttribute('aria-pressed')).toBe('false');
    expect((id('contrib-clear') as HTMLButtonElement).hidden).toBe(true);
  });
});

describe('sorting', () => {
  const prs = [
    pr(0, { additions: 5, deletions: 0, changedFiles: 2, repo: { stars: 10 } }),
    pr(1, { additions: 1, deletions: 1, changedFiles: 9, repo: { stars: 999 } }),
    pr(2, { additions: 200, deletions: 0, changedFiles: 1, repo: { stars: 50 } }),
  ];

  it('sort dropdown by stars', () => {
    mount(prs);
    changeSelect('contrib-sort', 'stars');
    expect(visibleCardIds()).toEqual(['1', '2', '0']);
  });

  it('sort dropdown by impact and size', () => {
    mount(prs);
    changeSelect('contrib-sort', 'impact');
    expect(visibleCardIds()[0]).toBe('2');
    changeSelect('contrib-sort', 'size');
    expect(visibleCardIds()[0]).toBe('1');
  });

  it('table header click sorts and toggles asc/desc, syncs dropdown', () => {
    mount(prs);
    const starsTh = $('.contrib-th-sort[data-sort-key="stars"]');
    starsTh.dispatchEvent(new Event('click', { bubbles: true }));
    expect(starsTh.classList.contains('sorted')).toBe(true);
    expect(starsTh.dataset.dir).toBe('desc');
    expect((id('contrib-sort') as HTMLSelectElement).value).toBe('stars');
    const descOrder = visibleCardIds();
    starsTh.dispatchEvent(new Event('click', { bubbles: true }));
    expect(starsTh.dataset.dir).toBe('asc');
    expect(visibleCardIds()).toEqual([...descOrder].reverse());
    // third click flips asc -> desc again
    starsTh.dispatchEvent(new Event('click', { bubbles: true }));
    expect(starsTh.dataset.dir).toBe('desc');
  });
});

describe('view toggle', () => {
  it('switches Cards <-> Table and persists', () => {
    // Dates descending by id so display order == id order under the default 'recent' sort.
    mount([pr(0, { mergedAt: '2025-02-10' }), pr(1, { mergedAt: '2025-02-09' })]);
    $('.contrib-view-btn[data-view="table"]').dispatchEvent(new Event('click', { bubbles: true }));
    expect(id('contributions-table-view')?.classList.contains('contrib-hidden')).toBe(false);
    expect(id('contributions-cards-view')?.classList.contains('contrib-hidden')).toBe(true);
    expect(localStorage.getItem('contrib-view')).toBe('table');
    expect(visibleRowIds()).toEqual(['0', '1']);
    // clicking active view again is a no-op
    $('.contrib-view-btn[data-view="table"]').dispatchEvent(new Event('click', { bubbles: true }));
    expect(localStorage.getItem('contrib-view')).toBe('table');
    $('.contrib-view-btn[data-view="cards"]').dispatchEvent(new Event('click', { bubbles: true }));
    expect(id('contributions-cards-view')?.classList.contains('contrib-hidden')).toBe(false);
  });

  it('restores table view from localStorage on init', () => {
    mount([pr(0)], { storage: 'table' });
    expect(id('contributions-table-view')?.classList.contains('contrib-hidden')).toBe(false);
  });
});

describe('pagination + show all', () => {
  // Dates descending by id so display order == id order under the default 'recent' sort.
  const many = Array.from({ length: 7 }, (_, i) =>
    pr(i, { mergedAt: `2025-02-${String(20 - i).padStart(2, '0')}` }),
  );

  it('paginates at pageSize and navigates', () => {
    mount(many, { pageSize: 3 });
    expect(visibleCardIds().length).toBe(3);
    expect(document.querySelectorAll('#contributions-pagination .pagination-page').length).toBe(3);
    expect((document.querySelector('.pagination-prev') as HTMLButtonElement).disabled).toBe(true);
    (document.querySelector('.pagination-page[data-page="2"]') as HTMLElement).dispatchEvent(
      new Event('click', { bubbles: true }),
    );
    expect(visibleCardIds()).toEqual(['3', '4', '5']);
    (document.querySelector('.pagination-next') as HTMLButtonElement).dispatchEvent(
      new Event('click', { bubbles: true }),
    );
    expect(visibleCardIds()).toEqual(['6']);
    expect((document.querySelector('.pagination-next') as HTMLButtonElement).disabled).toBe(true);
    (document.querySelector('.pagination-prev') as HTMLButtonElement).dispatchEvent(
      new Event('click', { bubbles: true }),
    );
    expect(visibleCardIds()).toEqual(['3', '4', '5']);
  });

  it('renders ellipsis for many pages', () => {
    mount(
      Array.from({ length: 10 }, (_, i) => pr(i)),
      { pageSize: 1 },
    );
    (document.querySelector('.pagination-page[data-page="6"]') as HTMLElement)?.dispatchEvent(
      new Event('click', { bubbles: true }),
    );
    expect(
      document.querySelectorAll('#contributions-pagination .pagination-ellipsis').length,
    ).toBeGreaterThan(0);
  });

  it('show all reveals every row and hides pagination', () => {
    mount(many, { pageSize: 3 });
    const btn = id('contrib-show-all') as HTMLButtonElement;
    expect(btn.hidden).toBe(false);
    btn.dispatchEvent(new Event('click', { bubbles: true }));
    expect(visibleCardIds().length).toBe(7);
    expect(id('contributions-pagination')?.innerHTML.trim()).toBe('');
    expect(btn.textContent).toBe('Show less');
    btn.dispatchEvent(new Event('click', { bubbles: true }));
    expect(visibleCardIds().length).toBe(3);
  });

  it('hides show-all when not enough items', () => {
    mount([pr(0), pr(1)], { pageSize: 3 });
    expect((id('contrib-show-all') as HTMLButtonElement).hidden).toBe(true);
    expect(id('contributions-pagination')?.innerHTML.trim()).toBe('');
  });

  it('clamps the page when filtering reduces total pages', () => {
    vi.useFakeTimers();
    mount(many, { pageSize: 3 });
    (document.querySelector('.pagination-page[data-page="2"]') as HTMLElement).dispatchEvent(
      new Event('click', { bubbles: true }),
    );
    expect(visibleCardIds()).not.toContain('0');
    const input = id('contrib-search') as HTMLInputElement;
    input.value = 'org0/repo0';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(150);
    vi.useRealTimers();
    expect(visibleCardIds()).toEqual(['0']); // clamped back to a valid page
  });
});

describe('modal', () => {
  it('opens on card click and closes via button/backdrop', () => {
    mount([pr(0, { title: 'Hello' })]);
    $('.contrib-card[data-pr-id="0"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const modal = id('contrib-modal') as HTMLDialogElement;
    expect(modal.open).toBe(true);
    expect(id('contrib-modal-body')?.innerHTML).toContain('Hello');
    expect(id('contrib-modal-body')?.innerHTML).toContain('https://gh/pull/0');
    id('contrib-modal-close')?.dispatchEvent(new Event('click', { bubbles: true }));
    expect(modal.open).toBe(false);
    // backdrop click (target === dialog)
    $('.contrib-card[data-pr-id="0"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(modal.open).toBe(false);
  });

  it('modified/middle clicks do NOT open modal (lets href through)', () => {
    mount([pr(0)]);
    const card = $('.contrib-card[data-pr-id="0"]');
    for (const opts of [
      { metaKey: true },
      { ctrlKey: true },
      { shiftKey: true },
      { altKey: true },
      { button: 1 },
    ]) {
      card.dispatchEvent(new MouseEvent('click', { bubbles: true, ...opts }));
      expect((id('contrib-modal') as HTMLDialogElement).open).toBe(false);
    }
  });

  it('clicking inside the dialog (not backdrop) keeps it open', () => {
    mount([pr(0)]);
    $('.contrib-card[data-pr-id="0"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const modal = id('contrib-modal') as HTMLDialogElement;
    expect(modal.open).toBe(true);
    id('contrib-modal-body')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(modal.open).toBe(true);
  });

  it('opens on row Enter key, ignores other keys', () => {
    mount([pr(0)], { storage: 'table' });
    const row = $('.contrib-row[data-pr-id="0"]');
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect((id('contrib-modal') as HTMLDialogElement).open).toBe(false);
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect((id('contrib-modal') as HTMLDialogElement).open).toBe(true);
  });

  it('click on empty grid area opens nothing', () => {
    mount([pr(0)]);
    id('contributions-cards-grid')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect((id('contrib-modal') as HTMLDialogElement).open).toBe(false);
  });

  it('renders rich detail: topics, labels, license, language, time-to-merge', () => {
    mount([
      pr(0, {
        state: 'merged',
        createdAt: '2025-01-01',
        mergedAt: '2025-01-05',
        title: 'A & B <x> "q"',
        labels: [
          { name: 'bug', color: 'ff0000' },
          { name: 'bad', color: 'ZZZ' },
        ],
        repo: {
          language: 'Ruby',
          license: 'MIT',
          description: 'desc',
          topics: ['t1', 't2'],
          stars: 1200,
        },
      }),
    ]);
    $('.contrib-card[data-pr-id="0"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const html = id('contrib-modal-body')?.innerHTML ?? '';
    expect(html).toContain('topic-tag');
    expect(html).toContain('pr-label');
    expect(html).toContain('#ff0000'); // valid hex kept
    expect(html).toContain('#888888'); // invalid hex sanitized
    expect(html).toContain('MIT');
    expect(html).toContain('Ruby');
    expect(html).toContain('4d'); // time to merge
    // & and <> are escaped before innerHTML (the DOM normalizes &quot;->" in text on re-serialize).
    expect(html).toContain('A &amp; B &lt;x&gt;');
  });

  it('time-to-merge shows <1d for same-day and is omitted for non-merged', () => {
    mount([
      pr(0, { state: 'merged', createdAt: '2025-01-05', mergedAt: '2025-01-05' }),
      pr(1, { state: 'open', createdAt: '2025-01-01' }),
    ]);
    $('.contrib-card[data-pr-id="0"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(id('contrib-modal-body')?.innerHTML).toContain('<1d');
    clickChip('closed'); // ensure pr1 (open) still visible; it is by default
    $('.contrib-card[data-pr-id="1"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(id('contrib-modal-body')?.innerHTML).not.toContain('Time to merge');
  });

  it('handles invalid createdAt date gracefully', () => {
    mount([pr(0, { state: 'merged', createdAt: 'not-a-date', mergedAt: '2025-01-05' })]);
    $('.contrib-card[data-pr-id="0"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    // createdAt present but unparseable -> Created row renders with empty date, no throw
    expect((id('contrib-modal') as HTMLDialogElement).open).toBe(true);
  });

  it('renders modal for closed state, null language, and NOASSERTION license', () => {
    mount([
      pr(0, { state: 'closed', repo: { license: 'NOASSERTION', language: null, topics: [] } }),
    ]);
    clickChip('closed');
    $('.contrib-card[data-pr-id="0"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const html = id('contrib-modal-body')?.innerHTML ?? '';
    expect(html).toContain('closed-badge'); // closed stateLabel arm
    expect(html).not.toContain('lang-dot'); // null language -> no language item
    expect(html).not.toContain('NOASSERTION'); // license omitted
  });

  it('row keydown ignores non-row targets and empty ids', () => {
    mount([pr(0)], { storage: 'table' });
    id('contributions-table-body')?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    expect((id('contrib-modal') as HTMLDialogElement).open).toBe(false);
  });

  it('row keydown with empty id opens nothing', () => {
    document.body.innerHTML = `
      <section id="contributions-browser" data-page-size="10" data-label-result-count="{count} of {total}">
        <div id="contributions-cards-grid"></div>
        <table><tbody id="contributions-table-body"><tr class="contrib-row" data-pr-id="" tabindex="0"></tr></tbody></table>
        <nav id="contributions-pagination"></nav>
        <script type="application/json" id="contributions-data"></script>
      </section>
      <dialog id="contrib-modal"><div id="contrib-modal-body"></div></dialog>`;
    const isl = document.getElementById('contributions-data');
    if (isl) isl.textContent = JSON.stringify([pr(0)]);
    initContributionsBrowser();
    $('.contrib-row[data-pr-id=""]').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    expect((id('contrib-modal') as HTMLDialogElement).open).toBe(false);
  });
});

describe('edge cases & defensive paths', () => {
  const island = (prs: unknown) => {
    const el = document.getElementById('contributions-data');
    if (el) el.textContent = JSON.stringify(prs);
  };

  it('runs with only the required elements (optional toolbar/modal absent)', () => {
    document.body.innerHTML = `
      <section id="contributions-browser" data-page-size="2"
        data-label-result-count="{count} of {total}">
        <div id="contributions-cards-grid">
          <a class="contrib-card" data-pr-id="0" href="#"></a>
          <a class="contrib-card" data-pr-id="1" href="#"></a>
          <a class="contrib-card" data-pr-id="2" href="#"></a>
        </div>
        <table><tbody id="contributions-table-body"></tbody></table>
        <nav id="contributions-pagination"></nav>
        <script type="application/json" id="contributions-data"></script>
      </section>`;
    island([pr(0), pr(1), pr(2)]);
    expect(() => initContributionsBrowser()).not.toThrow();
    // pagination still renders against the required nav
    expect(document.querySelectorAll('#contributions-pagination .pagination-page').length).toBe(2);
    // a card click without a modal present must not throw
    expect(() =>
      $('.contrib-card[data-pr-id="0"]').dispatchEvent(new MouseEvent('click', { bubbles: true })),
    ).not.toThrow();
  });

  it('clear works when search/lang/org inputs are absent', () => {
    document.body.innerHTML = `
      <section id="contributions-browser" data-page-size="10" data-label-result-count="{count} of {total}">
        <button class="contrib-chip active" data-state="merged" aria-pressed="true"></button>
        <button class="contrib-chip active" data-state="open" aria-pressed="true"></button>
        <button class="contrib-chip" data-state="closed" aria-pressed="false"></button>
        <button id="contrib-clear"></button>
        <div id="contributions-cards-grid"><a class="contrib-card" data-pr-id="0" href="#"></a></div>
        <table><tbody id="contributions-table-body"></tbody></table>
        <nav id="contributions-pagination"></nav>
        <script type="application/json" id="contributions-data"></script>
      </section>`;
    island([pr(0)]);
    initContributionsBrowser();
    clickChip('closed');
    expect(() =>
      id('contrib-clear')?.dispatchEvent(new Event('click', { bubbles: true })),
    ).not.toThrow();
    expect($('.contrib-chip[data-state="closed"]').getAttribute('aria-pressed')).toBe('false');
  });

  it('tolerates a data PR that has no matching DOM node', () => {
    document.body.innerHTML = `
      <section id="contributions-browser" data-page-size="10" data-label-result-count="{count} of {total}">
        <div id="contrib-result-count"></div>
        <div id="contributions-cards-grid"><a class="contrib-card" data-pr-id="0" href="#"></a></div>
        <table><tbody id="contributions-table-body"></tbody></table>
        <nav id="contributions-pagination"></nav>
        <script type="application/json" id="contributions-data"></script>
      </section>`;
    island([pr(0), pr(1)]); // two PRs, only one node
    expect(() => initContributionsBrowser()).not.toThrow();
    expect(id('contrib-result-count')?.textContent).toBe('2 of 2');
  });

  it('header with a sort key not in the dropdown still sorts (no sync)', () => {
    document.body.innerHTML = `
      <section id="contributions-browser" data-page-size="10" data-label-result-count="{count} of {total}">
        <select id="contrib-sort"><option value="recent">recent</option></select>
        <div id="contributions-table-view"><table><thead><tr>
          <th class="contrib-th-sort" data-sort-key="bogus"><button></button></th>
        </tr></thead></table></div>
        <div id="contributions-cards-grid"><a class="contrib-card" data-pr-id="0" href="#"></a></div>
        <table><tbody id="contributions-table-body"></tbody></table>
        <nav id="contributions-pagination"></nav>
        <script type="application/json" id="contributions-data"></script>
      </section>`;
    island([pr(0), pr(1)]);
    initContributionsBrowser();
    const th = $('.contrib-th-sort[data-sort-key="bogus"]');
    expect(() => th.dispatchEvent(new Event('click', { bubbles: true }))).not.toThrow();
    expect((id('contrib-sort') as HTMLSelectElement).value).toBe('recent'); // unchanged
  });

  it('falls back to defaults when toolbar elements have empty data attributes', () => {
    document.body.innerHTML = `
      <section id="contributions-browser" data-page-size="10" data-label-result-count="{count} of {total}">
        <button class="contrib-chip" data-state="" aria-pressed="false"></button>
        <select id="contrib-sort"><option value="recent">recent</option></select>
        <button class="contrib-view-btn active" data-view="" aria-pressed="true"></button>
        <div id="contributions-table-view"><table><thead><tr>
          <th class="contrib-th-sort" data-sort-key=""><button></button></th>
        </tr></thead></table></div>
        <div id="contributions-cards-grid"><a class="contrib-card" data-pr-id="0" href="#"></a></div>
        <table><tbody id="contributions-table-body"></tbody></table>
        <nav id="contributions-pagination"></nav>
        <script type="application/json" id="contributions-data"></script>
      </section>`;
    island([pr(0), pr(1)]);
    initContributionsBrowser();
    expect(() => {
      $('.contrib-chip[data-state=""]').dispatchEvent(new Event('click', { bubbles: true }));
      $('.contrib-th-sort[data-sort-key=""]').dispatchEvent(new Event('click', { bubbles: true }));
      $('.contrib-view-btn[data-view=""]').dispatchEvent(new Event('click', { bubbles: true }));
    }).not.toThrow();
  });

  it('ignores a click on a node with an empty pr id', () => {
    document.body.innerHTML = `
      <section id="contributions-browser" data-page-size="10" data-label-result-count="{count} of {total}">
        <div id="contributions-cards-grid"><a class="contrib-card" data-pr-id="" href="#"></a></div>
        <table><tbody id="contributions-table-body"></tbody></table>
        <nav id="contributions-pagination"></nav>
        <script type="application/json" id="contributions-data"></script>
      </section>
      <dialog id="contrib-modal"><div id="contrib-modal-body"></div></dialog>`;
    island([pr(0)]);
    initContributionsBrowser();
    $('.contrib-card[data-pr-id=""]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect((id('contrib-modal') as HTMLDialogElement).open).toBe(false);
  });
});

describe('resilience', () => {
  it('survives a localStorage that throws', () => {
    const getItem = Storage.prototype.getItem;
    const setItem = Storage.prototype.setItem;
    Storage.prototype.getItem = () => {
      throw new Error('boom');
    };
    Storage.prototype.setItem = () => {
      throw new Error('boom');
    };
    expect(() => mount([pr(0), pr(1)])).not.toThrow();
    $('.contrib-view-btn[data-view="table"]').dispatchEvent(new Event('click', { bubbles: true }));
    expect(id('contributions-table-view')?.classList.contains('contrib-hidden')).toBe(false);
    Storage.prototype.getItem = getItem;
    Storage.prototype.setItem = setItem;
  });
});
