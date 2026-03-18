import type { ThemeName } from '@config/types';
import { useEffect, useState } from 'react';

const SSR_DEFAULT: ThemeName = 'hacker';

export function useTheme(): ThemeName {
  const [theme, setTheme] = useState<ThemeName>(() => {
    if (typeof document === 'undefined') return SSR_DEFAULT;
    return (document.documentElement.getAttribute('data-theme') as ThemeName) || SSR_DEFAULT;
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'data-theme') {
          const next = document.documentElement.getAttribute('data-theme') as ThemeName;
          if (next) setTheme(next);
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}
