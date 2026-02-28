import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://hammadxcm.github.io',
  base: '/hammadxcm',
  compressHTML: true,
  integrations: [sitemap()],
});
