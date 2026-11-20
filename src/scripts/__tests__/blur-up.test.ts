/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initBlurUp } from '../interactions/blur-up';

describe('initBlurUp', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <img class="blur-up" src="test.jpg" />
      <div class="analytics-grid"><img src="chart.png" /></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('adds loaded class to complete images', () => {
    const img = document.querySelector('.blur-up') as HTMLImageElement;
    Object.defineProperty(img, 'complete', { value: true });
    initBlurUp();
    expect(img.classList.contains('loaded')).toBe(true);
  });

  it('applies blur filter to analytics images', () => {
    const img = document.querySelector('.analytics-grid img') as HTMLImageElement;
    // happy-dom >= 21 reports unloaded images as complete; force the loading state.
    Object.defineProperty(img, 'complete', { value: false });
    initBlurUp();
    expect(img.style.filter).toBe('blur(8px)');
  });
});
