import type { Direction, Locale, TranslationMap } from './types';
import { DEFAULT_LOCALE, LOCALES, RTL_LOCALES } from './types';

export { LOCALES, RTL_LOCALES, DEFAULT_LOCALE };
export type { Locale, Direction, TranslationMap };

const translationCache = new Map<Locale, TranslationMap>();

export async function getTranslations(locale: Locale): Promise<TranslationMap> {
  const cached = translationCache.get(locale);
  if (cached) return cached;

  let translations: TranslationMap;
  switch (locale) {
    case 'es':
      translations = (await import('./locales/es')).default;
      break;
    case 'fr':
      translations = (await import('./locales/fr')).default;
      break;
    case 'ar':
      translations = (await import('./locales/ar')).default;
      break;
    case 'ur':
      translations = (await import('./locales/ur')).default;
      break;
    case 'fa':
      translations = (await import('./locales/fa')).default;
      break;
    case 'zh':
      translations = (await import('./locales/zh')).default;
      break;
    case 'hi':
      translations = (await import('./locales/hi')).default;
      break;
    case 'de':
      translations = (await import('./locales/de')).default;
      break;
    case 'bn':
      translations = (await import('./locales/bn')).default;
      break;
    case 'pt':
      translations = (await import('./locales/pt')).default;
      break;
    case 'ru':
      translations = (await import('./locales/ru')).default;
      break;
    case 'id':
      translations = (await import('./locales/id')).default;
      break;
    default:
      translations = (await import('./locales/en')).default;
  }

  translationCache.set(locale, translations);
  return translations;
}

export function t(
  translations: TranslationMap,
  key: string,
  params?: Record<string, string | number>,
): string {
  const keys = key.split('.');
  let value: unknown = translations;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // fallback to key path
    }
  }
  if (typeof value !== 'string') return key;
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
}

export function getLocaleFromUrl(url: URL): Locale {
  const segments = url.pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (first && (LOCALES as readonly string[]).includes(first)) {
    return first as Locale;
  }
  return DEFAULT_LOCALE;
}

export function getDirection(locale: Locale): Direction {
  return RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
}

export function localePath(path: string, locale: Locale): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  if (locale === DEFAULT_LOCALE) return clean ? `/${clean}/` : '/';
  return clean ? `/${locale}/${clean}/` : `/${locale}/`;
}

export function getAlternateLinks(
  path: string,
  siteUrl: string,
): { locale: Locale; href: string; hreflang: string }[] {
  const base = siteUrl.replace(/\/$/, '');
  return LOCALES.map((locale) => ({
    locale,
    href: `${base}${localePath(path, locale)}`,
    hreflang: locale,
  }));
}
