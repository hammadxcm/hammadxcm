const TOAST_DURATION_MS = 2500;
const MAX_TOASTS = 3;

export function spawnToast(message: string, options?: { className?: string }): void {
  const container = document.getElementById('hackerToastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = options?.className ?? 'hacker-toast';
  toast.textContent = message;
  container.appendChild(toast);

  let all = container.querySelectorAll('.hacker-toast');
  while (all.length > MAX_TOASTS) {
    all[0].remove();
    all = container.querySelectorAll('.hacker-toast');
  }

  setTimeout(() => {
    toast.classList.add('dismiss');
    toast.addEventListener('animationend', () => toast.remove());
  }, TOAST_DURATION_MS);
}
