import { t } from '@i18n/index';
import type { TranslationMap } from '@i18n/types';

export function relativeTime(iso: string, translations: TranslationMap): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return translations.contributions.relativeTime.today;
  if (days === 1) return translations.contributions.relativeTime.dayAgo;
  if (days < 30)
    return t(translations, 'contributions.relativeTime.daysAgo', {
      count: days,
    });
  const months = Math.floor(days / 30);
  if (months === 1) return translations.contributions.relativeTime.monthAgo;
  if (months < 12)
    return t(translations, 'contributions.relativeTime.monthsAgo', {
      count: months,
    });
  const years = Math.floor(months / 12);
  return years === 1
    ? translations.contributions.relativeTime.yearAgo
    : t(translations, 'contributions.relativeTime.yearsAgo', {
        count: years,
      });
}
