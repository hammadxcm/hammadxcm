import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://hk.fyniti.co.uk',
  base: '/',
  compressHTML: true,
  integrations: [sitemap()],
});
