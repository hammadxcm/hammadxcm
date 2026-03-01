import { prefersReducedMotion } from '../state';
import { getStatusBarConfig } from '../theme-config';

const SLOT_COUNT = 5;
const STATUS_UPDATE_INTERVAL_MS = 2000;
const slots: (HTMLElement | null)[] = [];
let startTime = 0;
let intervalId: ReturnType<typeof setInterval> | undefined;

function render(): void {
  const config = getStatusBarConfig();
  const elapsed = Math.floor((Date.now() - startTime) / 1000);

  for (let i = 0; i < SLOT_COUNT; i++) {
    const el = slots[i];
    if (!el) continue;
    const seg = config[i];
    if (!seg) {
      el.textContent = '';
      el.className = 'status-slot';
      continue;
    }
    el.textContent = seg.label + (seg.value ? seg.value(elapsed) : '');
    el.className = seg.cls ? `status-slot ${seg.cls}` : 'status-slot';
  }
}

export function updateStatusBar(): void {
  render();
}

export function initStatusBar(): void {
  if (prefersReducedMotion) return;

  for (let i = 0; i < SLOT_COUNT; i++) {
    slots[i] = document.getElementById(`statusSlot${i}`);
  }
  if (!slots[0]) return;

  startTime = Date.now();
  render();

  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(render, STATUS_UPDATE_INTERVAL_MS);
}
