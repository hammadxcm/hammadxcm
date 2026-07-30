import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Regression guard: a CSS minifier that folds `animation-timeline: view()` into the
 * `animation` shorthand (`animation: linear both reveal-up view()`) produces a
 * declaration Chrome rejects outright. That silently drops every scroll-driven
 * reveal, leaving `.reveal` elements stuck at `opacity: 0` site-wide.
 * astro.config.mjs pins cssMinify to esbuild to avoid the fold.
 */
const CSS_DIR = join(process.cwd(), 'dist', '_astro');
const MERGED_TIMELINE = /animation\s*:[^;}]*\bview\s*\(/;

describe('built CSS scroll timelines', () => {
  it('never folds animation-timeline into the animation shorthand', () => {
    if (!existsSync(CSS_DIR)) return; // ponytail: no dist = nothing to check; `npm run build` first

    const offenders = readdirSync(CSS_DIR)
      .filter((f) => f.endsWith('.css'))
      .filter((f) => MERGED_TIMELINE.test(readFileSync(join(CSS_DIR, f), 'utf8')));

    expect(offenders).toEqual([]);
  });
});
