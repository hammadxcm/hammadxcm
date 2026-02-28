import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Window } from 'happy-dom';

let document: Document;

beforeAll(() => {
  const html = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf-8');
  const window = new Window();
  window.document.write(html);
  document = window.document as unknown as Document;
});

describe('Structural accessibility', () => {
  describe('Images', () => {
    it('every <img> has a non-empty alt attribute', () => {
      const images = document.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
      for (const img of images) {
        const alt = img.getAttribute('alt');
        expect(alt, `<img src="${img.getAttribute('src')?.slice(0, 60)}"> missing alt`).toBeTruthy();
      }
    });
  });

  describe('Skip link', () => {
    it('skip link exists with class "skip-link"', () => {
      const skipLink = document.querySelector('.skip-link');
      expect(skipLink).not.toBeNull();
    });

    it('skip link href points to an existing element id', () => {
      const skipLink = document.querySelector('.skip-link');
      const href = skipLink?.getAttribute('href');
      expect(href).toBeTruthy();
      const targetId = href!.replace('#', '');
      const target = document.getElementById(targetId);
      expect(target, `skip-link target #${targetId} not found`).not.toBeNull();
    });
  });

  describe('Buttons', () => {
    it('no empty buttons (must have text content or aria-label)', () => {
      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      for (const btn of buttons) {
        const hasText = btn.textContent?.trim().length! > 0;
        const hasAriaLabel = !!btn.getAttribute('aria-label');
        expect(
          hasText || hasAriaLabel,
          `<button> without text or aria-label: ${btn.outerHTML.slice(0, 100)}`,
        ).toBe(true);
      }
    });
  });

  describe('Links', () => {
    it('no empty links (must have text, aria-label, or child with text)', () => {
      const links = document.querySelectorAll('a');
      expect(links.length).toBeGreaterThan(0);
      for (const link of links) {
        const hasText = link.textContent?.trim().length! > 0;
        const hasAriaLabel = !!link.getAttribute('aria-label');
        expect(
          hasText || hasAriaLabel,
          `<a href="${link.getAttribute('href')}"> is empty with no aria-label`,
        ).toBe(true);
      }
    });
  });

  describe('ARIA attributes', () => {
    it('canvas elements are aria-hidden', () => {
      const canvases = document.querySelectorAll('canvas');
      for (const canvas of canvases) {
        expect(
          canvas.getAttribute('aria-hidden'),
          `<canvas id="${canvas.id}"> missing aria-hidden`,
        ).toBe('true');
      }
    });

    it('decorative overlays are aria-hidden', () => {
      const decorativeSelectors = [
        '.crt-overlay',
        '.crosshair-cursor',
        '.cursor-trail',
        '.key-flash',
        '.click-glitch-overlay',
        '.konami-overlay',
      ];
      for (const selector of decorativeSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          expect(
            el.getAttribute('aria-hidden'),
            `${selector} missing aria-hidden`,
          ).toBe('true');
        }
      }
    });

    it('scroll progress has role="progressbar" and aria-label', () => {
      const progress = document.querySelector('.scroll-progress');
      if (progress) {
        expect(progress.getAttribute('role')).toBe('progressbar');
        expect(progress.getAttribute('aria-label')).toBeTruthy();
      }
    });
  });

  describe('Document structure', () => {
    it('html has lang attribute', () => {
      const html = document.querySelector('html');
      expect(html?.getAttribute('lang')).toBeTruthy();
    });

    it('page has exactly one <h1>', () => {
      const h1s = document.querySelectorAll('h1');
      expect(h1s.length).toBe(1);
    });

    it('heading hierarchy is sequential (no skipped levels)', () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let lastLevel = 0;
      for (const heading of headings) {
        const level = parseInt(heading.tagName.charAt(1), 10);
        // Heading level can go up by 1, stay same, or go back to any lower level
        if (level > lastLevel) {
          expect(
            level - lastLevel,
            `Heading level skipped from h${lastLevel} to h${level}`,
          ).toBeLessThanOrEqual(1);
        }
        lastLevel = level;
      }
    });
  });
});
