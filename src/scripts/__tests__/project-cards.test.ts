/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../achievements', () => ({ trackEvent: vi.fn() }));

import { initProjectCards } from '../interactions/project-cards';

describe('initProjectCards', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="project-card">
        <h3 class="project-name"><a href="https://example.com">Proj</a></h3>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('does nothing without project cards', () => {
    document.body.innerHTML = '';
    expect(() => initProjectCards()).not.toThrow();
  });

  it('attaches click listeners to cards', () => {
    const card = document.querySelector('.project-card') as HTMLElement;
    const spy = vi.spyOn(card, 'addEventListener');
    initProjectCards();
    expect(spy).toHaveBeenCalledWith('click', expect.any(Function));
  });
});
