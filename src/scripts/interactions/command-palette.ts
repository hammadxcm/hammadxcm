/**
 * Command Palette — fuzzy search modal
 * Navigate sections, switch themes/locales, search projects and tech.
 */

import { trackEvent } from '../achievements';
import { trapFocus } from '../utils/focus-trap';

interface PaletteItem {
  id: string;
  label: string;
  url?: string;
}

interface PaletteData {
  sections: PaletteItem[];
  themes: PaletteItem[];
  locales: PaletteItem[];
  projects: PaletteItem[];
  tech: PaletteItem[];
}

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

let initialized = false;
let paletteAC: AbortController | null = null;

export function destroyCommandPalette(): void {
  paletteAC?.abort();
  paletteAC = null;
  initialized = false;
}

export function initCommandPalette(): void {
  if (initialized) return;
  initialized = true;
  paletteAC = new AbortController();
  const signal = paletteAC.signal;

  const overlay = document.getElementById('cmdPaletteOverlay');
  const input = document.getElementById('cmdPaletteInput') as HTMLInputElement | null;
  const results = document.getElementById('cmdPaletteResults');
  const dataEl = document.getElementById('cmdPaletteData');

  if (!overlay || !input || !results || !dataEl) return;

  const _overlay = overlay;
  const _input = input;
  const _results = results;

  let data: PaletteData;
  try {
    data = JSON.parse(dataEl.textContent || '{}');
  } catch {
    return;
  }

  let activeIndex = 0;
  let flatItems: { group: string; item: PaletteItem; action: () => void }[] = [];
  let releaseFocusTrap: (() => void) | null = null;

  function open(): void {
    _overlay.classList.add('open');
    _overlay.setAttribute('aria-hidden', 'false');
    _input.value = '';
    _input.focus();
    trackEvent('command_palette');
    render('');
    releaseFocusTrap = trapFocus(_overlay);
    // Re-focus input after trap activates (trap focuses first focusable)
    _input.focus();
  }

  function close(): void {
    _overlay.classList.remove('open');
    _overlay.setAttribute('aria-hidden', 'true');
    if (releaseFocusTrap) {
      releaseFocusTrap();
      releaseFocusTrap = null;
    }
  }

  function isOpen(): boolean {
    return _overlay.classList.contains('open');
  }

  function scrollToSection(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      close();
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function switchTheme(themeId: string): void {
    close();
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('portfolio-theme', themeId);
    window.dispatchEvent(new CustomEvent('theme-change', { detail: themeId }));
  }

  function switchLocale(localeId: string): void {
    close();
    const current = window.location.pathname;
    const isDefault = localeId === 'en';
    const cleaned = current.replace(/^\/(en|es|fr|ar|ur|fa)(\/|$)/, '/');
    const newPath = isDefault ? cleaned : `/${localeId}${cleaned}`;
    window.location.href = newPath;
  }

  function openUrl(url: string): void {
    close();
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function render(query: string): void {
    flatItems = [];
    let html = '';

    const groups: {
      label: string;
      group: string;
      items: PaletteItem[];
      action: (item: PaletteItem) => void;
    }[] = [
      {
        label: 'Sections',
        group: 'section',
        items: data.sections,
        action: (i) => scrollToSection(i.id),
      },
      { label: 'Themes', group: 'theme', items: data.themes, action: (i) => switchTheme(i.id) },
      {
        label: 'Languages',
        group: 'locale',
        items: data.locales,
        action: (i) => switchLocale(i.id),
      },
      {
        label: 'Projects',
        group: 'project',
        items: data.projects,
        action: (i) => i.url && openUrl(i.url),
      },
      { label: 'Tech', group: 'tech', items: data.tech, action: (i) => i.url && openUrl(i.url) },
    ];

    for (const g of groups) {
      const filtered = query ? g.items.filter((i) => fuzzyMatch(query, i.label)) : g.items;
      if (filtered.length === 0) continue;

      html += `<div class="cmd-group-label">${g.label}</div>`;
      for (const item of filtered) {
        const idx = flatItems.length;
        flatItems.push({ group: g.group, item, action: () => g.action(item) });
        html += `<div class="cmd-item" data-idx="${idx}">${item.label}`;
        if (g.group === 'section') html += `<span class="cmd-item-hint">#${item.id}</span>`;
        html += `</div>`;
      }
    }

    if (flatItems.length === 0) {
      html = `<div class="cmd-no-results">No results found</div>`;
    }

    _results.innerHTML = html;
    activeIndex = 0;
    updateActive();
  }

  function updateActive(): void {
    const items = _results.querySelectorAll('.cmd-item');
    items.forEach((el, i) => {
      el.classList.toggle('active', i === activeIndex);
      if (i === activeIndex) el.scrollIntoView({ block: 'nearest' });
    });
  }

  // Keyboard shortcut: Cmd+K / Ctrl+K
  document.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen()) close();
        else open();
        return;
      }

      if (!isOpen()) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % Math.max(flatItems.length, 1);
        updateActive();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + flatItems.length) % Math.max(flatItems.length, 1);
        updateActive();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatItems[activeIndex]) flatItems[activeIndex].action();
      }
    },
    { signal },
  );

  // Click on result
  _results.addEventListener(
    'click',
    (e) => {
      const target = (e.target as HTMLElement).closest('.cmd-item') as HTMLElement | null;
      if (!target) return;
      const idx = parseInt(target.dataset.idx || '0', 10);
      if (flatItems[idx]) flatItems[idx].action();
    },
    { signal },
  );

  // Click on overlay to close
  _overlay.addEventListener(
    'click',
    (e) => {
      if (e.target === _overlay) close();
    },
    { signal },
  );

  // Typing in input
  _input.addEventListener(
    'input',
    () => {
      render(_input.value.trim());
    },
    { signal },
  );
}
