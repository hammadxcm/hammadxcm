import { trackEvent } from '../achievements';

export function initLangSwitcher(): void {
  const wrap = document.getElementById('langSwitcherWrap');
  const btn = document.getElementById('langToggleBtn');
  const dropdown = document.getElementById('langDropdown');
  if (!wrap || !btn || !dropdown) return;

  // Track language link clicks
  dropdown.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) trackEvent('lang_switched');
  });

  btn.addEventListener('click', () => {
    const isOpen = dropdown.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target as Node)) {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdown.classList.contains('open')) {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });
}
