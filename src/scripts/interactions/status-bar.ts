import { prefersReducedMotion } from '../state';
import { getThemeConfig } from '../theme-config';

export function initStatusBar(): void {
  if (prefersReducedMotion) return;
  const statusBar = document.getElementById('terminalStatusBar');
  const uptimeEl = document.getElementById('statusUptime');
  const upSpeedEl = document.getElementById('statusUpSpeed');
  const downSpeedEl = document.getElementById('statusDownSpeed');
  const processesEl = document.getElementById('statusProcesses');
  if (!uptimeEl) return;

  const startTime = Date.now();

  function pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  function update(): void {
    const tc = getThemeConfig();
    if (statusBar) {
      statusBar.style.display = tc.hasStatusBar ? '' : 'none';
    }
    if (!tc.hasStatusBar) return;

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    uptimeEl!.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    if (upSpeedEl)
      upSpeedEl.textContent = (Math.random() * 4 + 0.5).toFixed(1);
    if (downSpeedEl)
      downSpeedEl.textContent = (Math.random() * 12 + 2).toFixed(1);
    if (processesEl)
      processesEl.textContent = String(Math.floor(Math.random() * 10 + 18));
  }

  update();
  setInterval(update, 2000);
}
