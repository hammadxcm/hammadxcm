export function initNav(): void {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  const navAnchors = navLinks.querySelectorAll('a');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
  navAnchors.forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  const sections = document.querySelectorAll('section[id]');
  const activeObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          navAnchors.forEach((a) => a.classList.remove('active'));
          const activeLink = navLinks.querySelector(
            `a[href="#${entry.target.id}"]`,
          );
          if (activeLink) activeLink.classList.add('active');
        }
      }
    },
    { threshold: 0.3, rootMargin: '-64px 0px -50% 0px' },
  );
  sections.forEach((s) => activeObserver.observe(s));
}
