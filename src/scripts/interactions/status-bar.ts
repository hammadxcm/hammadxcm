import { getLevel, getLevelName, getProgress } from '../achievements';
import { prefersReducedMotion, setClientIP } from '../state';
import { getStatusBarConfig } from '../theme-config';

const SLOT_COUNT = 5;
const STATUS_UPDATE_INTERVAL_MS = 1000;
const slots: (HTMLElement | null)[] = [];
let startTime = 0;
let intervalId: ReturnType<typeof setInterval> | undefined;
let initialized = false;

function renderXPSlot(el: HTMLElement): boolean {
  try {
    const progress = getProgress();
    if (progress) {
      const lvl = getLevel();
      el.textContent = `LVL ${lvl} ${getLevelName(lvl)} [${progress.totalXP} XP]`;
      el.className = 'status-slot';
      return true;
    }
  } catch {
    /* achievements not yet initialized */
  }
  return false;
}

function renderConfigSlot(
  el: HTMLElement,
  seg: ReturnType<typeof getStatusBarConfig>[number],
  elapsed: number,
): void {
  if (!seg) {
    el.textContent = '';
    el.className = 'status-slot';
    return;
  }
  el.textContent = seg.label + (seg.value ? seg.value(elapsed) : '');
  el.className = seg.cls ? `status-slot ${seg.cls}` : 'status-slot';
}

function render(): void {
  const config = getStatusBarConfig();
  const elapsed = Math.floor((Date.now() - startTime) / 1000);

  for (let i = 0; i < SLOT_COUNT; i++) {
    const el = slots[i];
    if (!el) continue;
    if (i === SLOT_COUNT - 1 && renderXPSlot(el)) continue;
    renderConfigSlot(el, config[i], elapsed);
  }
}

export function updateStatusBar(): void {
  render();
}

async function fetchClientIP(): Promise<void> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    if (data.ip) setClientIP(data.ip);
  } catch {
    // Silently fall back — getClientIP() returns '' which the config handles
  }
}

export function destroyStatusBar(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
  initialized = false;
}

export function initStatusBar(): void {
  if (initialized) return;
  if (prefersReducedMotion) return;

  for (let i = 0; i < SLOT_COUNT; i++) {
    slots[i] = document.getElementById(`statusSlot${i}`);
  }
  if (!slots[0]) return;

  initialized = true;
  startTime = Date.now();
  render();

  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(render, STATUS_UPDATE_INTERVAL_MS);

  fetchClientIP();
}
