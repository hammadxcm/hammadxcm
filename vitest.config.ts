import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      include: [
        'src/config/**',
        'src/utils/**',
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
        'src/scripts/pages/terminal.ts',
        'src/scripts/pages/terminal-fs.ts',
        'src/scripts/pages/typing-test.ts',
        'src/scripts/games/breakout.ts',
        'src/scripts/integrations/spotify.ts',
        'src/scripts/integrations/chatbot.ts',
      ],
      thresholds: {
        'src/scripts/achievements.ts': {
          statements: 99,
          branches: 99,
          functions: 100,
          lines: 100,
        },
      },
    },
  },
});
