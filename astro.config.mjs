import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://hk.fyniti.co.uk',
  base: '/',
  compressHTML: true,
  devToolbar: { enabled: false },
  prefetch: { prefetchAll: false, defaultStrategy: 'viewport' },
  build: { inlineStylesheets: 'auto' },
  // ponytail: lightningcss merges `animation-timeline: view()` into the `animation`
  // shorthand (`animation: linear both reveal-up view()`), which Chrome rejects as
  // invalid — killing every .reveal/.count-up scroll animation. esbuild doesn't
  // merge shorthands. Revisit if lightningcss stops emitting the merged form.
  vite: { build: { cssMinify: 'esbuild' } },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr', 'ar', 'ur', 'fa', 'zh', 'hi', 'de', 'bn', 'pt', 'ru', 'id'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', es: 'es', fr: 'fr', ar: 'ar', ur: 'ur', fa: 'fa', zh: 'zh', hi: 'hi', de: 'de', bn: 'bn', pt: 'pt', ru: 'ru', id: 'id' },
      },
    }),
  ],
});
