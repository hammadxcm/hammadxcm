import { prefersReducedMotion, isTouchDevice, isPageVisible } from '../state';
import { getCurrentTheme, getThemeConfig } from '../theme-config';

export function initMatrixRain(): void {
  if (prefersReducedMotion || isTouchDevice) return;

  const canvas = document.getElementById('matrix-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let w: number, h: number, columns: number, drops: number[];
  const chars =
    'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
  const fontSize = 14;
  let frameCount = 0;

  function resize(): void {
    w = canvas!.width = canvas!.offsetWidth;
    h = canvas!.height = canvas!.offsetHeight;
    columns = Math.floor(w / fontSize);
    drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }
  }
  resize();
  window.addEventListener('resize', resize);

  let matrixHeroVisible = true;
  const matrixHeroSection = document.getElementById('hero');
  if (matrixHeroSection && window.IntersectionObserver) {
    const matrixHeroObserver = new IntersectionObserver(
      (entries) => {
        matrixHeroVisible = entries[0].isIntersecting;
      },
      { threshold: 0 },
    );
    matrixHeroObserver.observe(matrixHeroSection);
  }

  function draw(): void {
    if (!isPageVisible() || !matrixHeroVisible) {
      requestAnimationFrame(draw);
      return;
    }
    const theme = getCurrentTheme();
    const tc = getThemeConfig(theme);

    if (!tc.hasMatrixRain) {
      ctx!.clearRect(0, 0, w, h);
      requestAnimationFrame(draw);
      return;
    }

    frameCount++;
    const speed = theme === 'matrix' ? 2 : 3;
    if (frameCount % speed !== 0) {
      requestAnimationFrame(draw);
      return;
    }

    ctx!.fillStyle = tc.matrixBg || 'rgba(10, 14, 20, 0.06)';
    ctx!.fillRect(0, 0, w, h);
    ctx!.fillStyle = tc.matrixColor || 'rgba(0, 191, 191, 0.6)';
    ctx!.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      if (Math.random() > 0.3) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx!.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > h && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}
