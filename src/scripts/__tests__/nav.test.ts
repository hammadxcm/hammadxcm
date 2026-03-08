/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initNav } from '../interactions/nav';

describe('initNav', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="hamburger" aria-expanded="false">Menu</button>
      <div id="navLinks">
        <a href="#about">About</a>
        <a href="#projects">Projects</a>
      </div>
      <section id="about">About</section>
      <section id="projects">Projects</section>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing without hamburger', () => {
    document.body.innerHTML = '';
    expect(() => initNav()).not.toThrow();
  });

  it('toggles nav on hamburger click', () => {
    initNav();
    const hamburger = document.getElementById('hamburger')!;
    const navLinks = document.getElementById('navLinks')!;
    hamburger.click();
    expect(hamburger.classList.contains('active')).toBe(true);
    expect(navLinks.classList.contains('open')).toBe(true);
    expect(hamburger.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes nav on link click', () => {
    initNav();
    const hamburger = document.getElementById('hamburger')!;
    hamburger.click(); // open
    document.querySelector('a[href="#about"]')!.dispatchEvent(new Event('click'));
    expect(hamburger.classList.contains('active')).toBe(false);
  });

  it('sets aria-expanded to false on close', () => {
    initNav();
    const hamburger = document.getElementById('hamburger')!;
    hamburger.click(); // open
    hamburger.click(); // close
    expect(hamburger.getAttribute('aria-expanded')).toBe('false');
  });

  it('observes sections for active nav state', () => {
    expect(() => initNav()).not.toThrow();
  });
});
