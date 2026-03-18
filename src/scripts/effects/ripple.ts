/**
 * Glass card click ripple — accent-colored circle expanding from click point.
 * Uses CSS ::after pseudo with clip-path driven by custom properties.
 */

let initialized = false;

export function initRipple(): void {
  if (initialized) return;
  initialized = true;

  document.addEventListener('click', (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('.glass');
    if (!target || !(target instanceof HTMLElement)) return;

    const rect = target.getBoundingClientRect();
    const x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1);
    const y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1);

    target.style.setProperty('--ripple-x', `${x}%`);
    target.style.setProperty('--ripple-y', `${y}%`);
    target.classList.add('ripple-active');

    setTimeout(() => {
      target.classList.remove('ripple-active');
    }, 500);
  });
}
