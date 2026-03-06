import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/config/**', 'src/utils/**', 'src/scripts/achievements.ts'],
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
