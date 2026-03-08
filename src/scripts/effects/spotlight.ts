import { isTouchDevice } from '../state';

let initialized = false;
const handlerMap = new WeakMap<HTMLElement, (e: MouseEvent) => void>();
let elements: HTMLElement[] = [];

function onMouseMove(el: HTMLElement, e: MouseEvent): void {
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  el.style.setProperty('--spotlight-x', `${x}px`);
  el.style.setProperty('--spotlight-y', `${y}px`);
}

export function initSpotlight(): void {
  if (initialized) return;
  if (isTouchDevice) return;

  const els = document.querySelectorAll<HTMLElement>('.glass');
  if (els.length === 0) return;

  initialized = true;
  elements = Array.from(els);

  for (const el of elements) {
    const handler = (e: MouseEvent) => onMouseMove(el, e);
    handlerMap.set(el, handler);
    el.addEventListener('mousemove', handler);
  }
}

export function destroySpotlight(): void {
  for (const el of elements) {
    const handler = handlerMap.get(el);
    if (handler) {
      el.removeEventListener('mousemove', handler);
      handlerMap.delete(el);
    }
  }
  elements = [];
  initialized = false;
}
