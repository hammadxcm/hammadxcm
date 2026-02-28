export function initBlurUp(): void {
  const blurImages = document.querySelectorAll<HTMLImageElement>('.blur-up');
  blurImages.forEach((img) => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
    }
  });

  const analyticsImgs =
    document.querySelectorAll<HTMLImageElement>('.analytics-grid img');
  analyticsImgs.forEach((img) => {
    if (!img.classList.contains('blur-up')) {
      img.style.filter = 'blur(8px)';
      img.style.transition = 'filter 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      if (img.complete) {
        img.style.filter = 'blur(0)';
      } else {
        img.addEventListener('load', () => {
          img.style.filter = 'blur(0)';
        });
      }
    }
  });
}
