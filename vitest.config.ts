import { fileURLToPath } from 'node:url';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

// Plain vitest config (no astro getViteConfig). astro's getViteConfig force-inlines all
// node_modules, and vitest's SSR module runner mis-evaluates CJS deps (cookie, react, ...)
// as ESM ("exports/module is not defined") under vite 7 + vitest 4. Unit tests only need
// the tsconfig path aliases and JSX, so we recreate those here and let node deps load
// natively. `.astro` files aren't imported by unit tests.
const r = (p: string): string => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    // Keep these in sync with `compilerOptions.paths` in tsconfig.json.
    alias: {
      '@config': r('./src/config'),
      '@components': r('./src/components'),
      '@react': r('./src/components/react'),
      '@scripts': r('./src/scripts'),
      '@i18n': r('./src/i18n'),
      '@utils': r('./src/utils'),
    },
  },
  esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      include: [
        'src/config/**',
        'src/utils/**',
        'src/scripts/constants.ts',
        'src/scripts/state.ts',
        'src/scripts/analytics.ts',
        'src/scripts/global-stats.ts',
        'src/scripts/theme-switcher.ts',
        'src/scripts/achievements.ts',
        'src/scripts/effects/section-scramble.ts',
        'src/scripts/effects/spotlight.ts',
        'src/scripts/effects/magnetic-nav.ts',
        'src/scripts/effects/favicon.ts',
        'src/scripts/effects/timeline-draw.ts',
        'src/scripts/effects/scroll-terminal.ts',
        'src/scripts/effects/action-log.ts',
        'src/scripts/effects/wireframe.ts',
        'src/scripts/effects/sound.ts',
        'src/scripts/effects/particle-text.ts',
        'src/scripts/effects/code-editor-hero.ts',
        'src/scripts/effects/contribution-3d.ts',
        'src/scripts/effects/toast.ts',
        'src/scripts/effects/ripple.ts',
        'src/scripts/effects/typewriter.ts',
        'src/scripts/effects/boot.ts',
        'src/scripts/effects/scramble-text.ts',
        'src/scripts/effects/cursor.ts',
        'src/scripts/effects/hacker-log.ts',
        'src/scripts/effects/hero-name.ts',
        'src/scripts/effects/matrix-rain.ts',
        'src/scripts/effects/screen-effects.ts',
        'src/scripts/dashboard-charts.ts',
        'src/scripts/interactions/contributions-browser.ts',
        'src/scripts/interactions/copy.ts',
        'src/scripts/interactions/keyboard.ts',
        'src/scripts/interactions/nav.ts',
        'src/scripts/interactions/tilt.ts',
        'src/scripts/interactions/view-more.ts',
        'src/scripts/interactions/blur-up.ts',
        'src/scripts/interactions/floating-icons.ts',
        'src/scripts/interactions/project-cards.ts',
        'src/scripts/interactions/smooth-scroll.ts',
        'src/scripts/interactions/observer.ts',
        'src/scripts/interactions/command-palette.ts',
        'src/scripts/interactions/status-bar.ts',
        'src/scripts/interactions/lang-switcher.ts',
        'src/scripts/interactions/konami.ts',
        'src/scripts/interactions/ctf.ts',
        'src/scripts/interactions/annotations.ts',
        'src/scripts/interactions/achievement-panel.ts',
        'src/scripts/interactions/about-lang.ts',
        'src/scripts/interactions/guestbook-stats.ts',
        'src/scripts/interactions/resume-export.ts',
        'src/scripts/interactions/scroll.ts',
        'src/scripts/utils/focus-trap.ts',
        'src/scripts/pages/terminal.ts',
        'src/scripts/pages/terminal-fs.ts',
        'src/scripts/pages/typing-test.ts',
        'src/scripts/games/breakout.ts',
        'src/scripts/integrations/spotify.ts',
        'src/scripts/integrations/chatbot.ts',
        'src/components/react/hooks/useTheme.ts',
        'src/components/react/hooks/useReducedMotion.ts',
        'src/components/react/hooks/useInViewReveal.ts',
        'src/components/react/ScrollReveal.tsx',
        'src/components/react/SectionHeader.tsx',
        'src/components/react/ProjectCard.tsx',
        'src/components/react/FloatingTechIcon.tsx',
      ],
      exclude: [
        ...coverageConfigDefaults.exclude,
        // Untestable in a headless DOM: no canvas 2D / WebGL context, no Web Audio API.
        'src/scripts/effects/matrix-rain.ts',
        'src/scripts/effects/particle-text.ts',
        'src/scripts/effects/wireframe.ts',
        'src/scripts/effects/contribution-3d.ts',
        'src/scripts/effects/sound.ts',
        'src/scripts/games/breakout.ts',
      ],
      thresholds: {
        // Ratcheted up to the level achieved after the contributions-browser test work
        // (was 60/50/58/60). Driving the remaining legacy files to 100% is tracked
        // separately; raise these further as that coverage lands.
        statements: 63,
        branches: 58,
        functions: 62,
        lines: 64,
        // New, fully-covered logic — enforce it stays at 100%.
        'src/utils/contribution-filter.ts': { statements: 100, branches: 100, functions: 100, lines: 100 },
        'src/utils/page-range.ts': { statements: 100, branches: 100, functions: 100, lines: 100 },
        'src/utils/contribution-sort.ts': { statements: 100, branches: 100, functions: 100, lines: 100 },
        'src/scripts/achievements.ts': {
          statements: 99,
          branches: 98,
          functions: 100,
          lines: 100,
        },
      },
    },
  },
});
