/**
 * Focus trap for modals — cycles Tab/Shift+Tab within a container.
 * Returns a cleanup function to remove the listener.
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function trapFocus(container: HTMLElement): () => void {
  let previousFocus: Element | null = null;

  function onKeyDown(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function activate(): void {
    previousFocus = document.activeElement;
    container.addEventListener('keydown', onKeyDown);
    // Focus first focusable element
    const first = container.querySelector<HTMLElement>(FOCUSABLE);
    if (first) first.focus();
  }

  function deactivate(): void {
    container.removeEventListener('keydown', onKeyDown);
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
  }

  activate();
  return deactivate;
}
