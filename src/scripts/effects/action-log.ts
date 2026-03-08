let initialized = false;
let logEl: HTMLElement | null = null;

const MAX_ENTRIES = 5;
const buffer: string[] = [];

function render(): void {
  if (!logEl) return;
  logEl.innerHTML = buffer.map((msg) => `<div class="action-log-entry">${msg}</div>`).join('');
}

export function logAction(msg: string): void {
  if (!initialized) return;

  buffer.push(msg);
  if (buffer.length > MAX_ENTRIES) {
    buffer.shift();
  }
  render();
}

export function getActionLog(): readonly string[] {
  return [...buffer];
}

export function initActionLog(): void {
  if (initialized) return;
  initialized = true;

  let el = document.getElementById('actionLog');
  if (!el) {
    el = document.createElement('div');
    el.id = 'actionLog';
    el.className = 'action-log';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
  }
  logEl = el;

  render();
}

export function destroyActionLog(): void {
  if (logEl?.parentNode) {
    logEl.parentNode.removeChild(logEl);
  }
  logEl = null;
  buffer.length = 0;
  initialized = false;
}
