import { trackEvent } from '../achievements';

export function initViewMore(btnId: string, gridSelector: string, hiddenClass: string): void {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  let expanded = false;
  const labelMore = btn.dataset.labelMore || 'View More';
  const labelLess = btn.dataset.labelLess || 'Show Less';

  btn.addEventListener('click', () => {
    expanded = !expanded;
    trackEvent('view_more');
    const cards = document.querySelectorAll(`${gridSelector} > *`);
    const initial = parseInt(btn.dataset.initial || '6', 10);

    cards.forEach((card, i) => {
      if (i >= initial) {
        card.classList.toggle(hiddenClass, !expanded);
        if (expanded) {
          card.classList.add('visible');
        }
      }
    });

    const text = btn.querySelector('.view-more-text') as HTMLElement;
    const count = btn.querySelector('.view-more-count') as HTMLElement;
    const chevron = btn.querySelector('.view-more-chevron') as HTMLElement;
    if (text) text.textContent = expanded ? labelLess : labelMore;
    if (count) count.style.display = expanded ? 'none' : '';
    if (chevron) chevron.style.transform = expanded ? 'rotate(180deg)' : '';
  });
}
