import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/config/**'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
