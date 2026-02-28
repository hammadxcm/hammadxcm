export function initObserver(): void {
  const selectors =
    '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .reveal-clip, .stagger, .section-separator';
  const elements = document.querySelectorAll(selectors);
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (entry.target.classList.contains('stagger')) {
            const children = entry.target.children;
            for (let i = 0; i < children.length; i++) {
              children[i].classList.add('visible');
            }
          }
        }
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -60px 0px' },
  );

  elements.forEach((el) => observer.observe(el));
}
