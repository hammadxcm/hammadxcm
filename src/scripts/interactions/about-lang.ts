import { getAboutTheme, getCurrentTheme } from '../theme-config';
import type { LangKey, LangVariant, ThemeName } from '../types';

let langData: Record<LangKey, LangVariant> | null = null;
let _currentLang: LangKey = 'bash';

function loadLangData(): Record<LangKey, LangVariant> | null {
  if (langData) return langData;
  const el = document.getElementById('aboutMultiLangData');
  if (!el) return null;
  try {
    langData = JSON.parse(el.textContent || '{}');
    return langData;
  } catch {
    return null;
  }
}

function switchLanguage(lang: LangKey): void {
  const data = loadLangData();
  if (!data) return;
  const variant = data[lang];
  if (!variant) return;

  _currentLang = lang;

  // Update filename
  const filenameEl = document.getElementById('aboutFilename');
  if (filenameEl) {
    const at = getAboutTheme();
    const baseName = at.filename.replace(/\.[^.]+$/, '');
    filenameEl.textContent = `${baseName}.${variant.extension}`;
  }

  // Update code body
  const codeBody = document.getElementById('aboutCodeBody');
  if (codeBody) {
    codeBody.innerHTML = variant.displayLines
      .map((line, i) => {
        const dataAbout =
          i === variant.commentLineIndex
            ? ' data-about="comment"'
            : i === variant.echoLineIndex
              ? ' data-about="echo"'
              : '';
        return `<span class="code-line"${dataAbout}><span class="code-line-num">${i + 1}</span>${line}</span>`;
      })
      .join('');
  }

  // Update copy data
  const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement | null;
  if (copyBtn) {
    copyBtn.dataset.code = variant.copyLines.join('\n');
  }

  // Update dropdown selected state
  const langSwitcher = document.getElementById('langSwitcher') as HTMLSelectElement | null;
  if (langSwitcher && langSwitcher.value !== lang) {
    langSwitcher.value = lang;
  }
}

function updateThemedLines(variant: LangVariant, theme: ThemeName): void {
  const at = getAboutTheme(theme);

  const commentLine = document.querySelector<HTMLElement>('[data-about="comment"]');
  if (commentLine) {
    const numHtml = commentLine.querySelector('.code-line-num')?.outerHTML ?? '';
    commentLine.innerHTML = `${numHtml}<span class="comment">${variant.commentPrefix} ${at.headerComment}</span>`;
  }

  const echoLine = document.querySelector<HTMLElement>('[data-about="echo"]');
  if (echoLine) {
    const numHtml = echoLine.querySelector('.code-line-num')?.outerHTML ?? '';
    echoLine.innerHTML = `${numHtml}${variant.printTemplate.display.replace('__MSG__', at.echoMessage)}`;
  }
}

export function updateAboutTheme(theme: ThemeName): void {
  const at = getAboutTheme(theme);

  const sectionLabel = document.querySelector('#about .section-label');
  if (sectionLabel) sectionLabel.textContent = at.sectionLabel;

  switchLanguage(at.defaultLang);

  const data = loadLangData();
  if (!data) return;
  const variant = data[at.defaultLang];
  if (variant) updateThemedLines(variant, theme);
}

export function initAboutLang(): void {
  const langSwitcher = document.getElementById('langSwitcher') as HTMLSelectElement | null;
  if (!langSwitcher) return;

  langSwitcher.addEventListener('change', () => {
    const lang = langSwitcher.value as LangKey;
    switchLanguage(lang);

    const theme = getCurrentTheme();
    const data = loadLangData();
    if (!data) return;
    const variant = data[lang];
    if (variant) updateThemedLines(variant, theme);
  });

  // Apply initial theme's default language
  updateAboutTheme(getCurrentTheme());
}
