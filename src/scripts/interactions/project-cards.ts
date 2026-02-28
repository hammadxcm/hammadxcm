export function initProjectCards(): void {
  const projectCards = document.querySelectorAll<HTMLElement>('.project-card');
  projectCards.forEach((card) => {
    card.addEventListener('click', (e: MouseEvent) => {
      if ((e.target as Element).closest('a')) return;
      const link =
        card.querySelector<HTMLAnchorElement>('.project-name a') ||
        card.querySelector<HTMLAnchorElement>('a');
      if (link) {
        window.open(link.href, '_blank', 'noopener');
      }
    });
  });
}
