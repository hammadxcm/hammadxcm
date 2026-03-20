import { trackEvent } from '../achievements';

function toggleCards(
  gridSelector: string,
  hiddenClass: string,
  expanded: boolean,
  initial: number,
): void {
  const cards = document.querySelectorAll(`${gridSelector} > *`);
  cards.forEach((card, i) => {
    if (i >= initial) {
      card.classList.toggle(hiddenClass, !expanded);
      if (expanded) card.classList.add('visible');
    }
  });
}

function updateButtonUI(
  btn: HTMLElement,
  expanded: boolean,
  labelMore: string,
  labelLess: string,
): void {
  const text = btn.querySelector('.view-more-text') as HTMLElement;
  const count = btn.querySelector('.view-more-count') as HTMLElement;
  const chevron = btn.querySelector('.view-more-chevron') as HTMLElement;
  if (text) text.textContent = expanded ? labelLess : labelMore;
  if (count) count.style.display = expanded ? 'none' : '';
  if (chevron) chevron.style.transform = expanded ? 'rotate(180deg)' : '';
}

export function initViewMore(btnId: string, gridSelector: string, hiddenClass: string): void {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  let expanded = false;
  const labelMore = btn.dataset.labelMore || 'View More';
  const labelLess = btn.dataset.labelLess || 'Show Less';

  btn.addEventListener('click', () => {
    expanded = !expanded;
    trackEvent('view_more');
    const initial = parseInt(btn.dataset.initial || '6', 10);
    toggleCards(gridSelector, hiddenClass, expanded, initial);
    updateButtonUI(btn, expanded, labelMore, labelLess);
  });
}
