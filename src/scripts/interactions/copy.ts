import { trackEvent } from '../achievements';
import { reportEvent } from '../global-stats';

export function initCopy(): void {
  const btn = document.getElementById('copyBtn') as HTMLButtonElement | null;
  const label = document.getElementById('copyLabel');
  const icon = document.getElementById('copyIcon');
  if (!btn || !label || !icon) return;

  const labelCopy = btn.dataset.labelCopy || 'Copy';
  const labelCopied = btn.dataset.labelCopied || 'Copied!';

  btn.addEventListener('click', () => {
    // Read data-code at click time (not init time) so it reflects language switches
    const code = btn.dataset.code || '';
    navigator.clipboard
      .writeText(code)
      .then(() => {
        trackEvent('code_copy');
        reportEvent('code_copy');
        label.textContent = labelCopied;
        icon.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
        btn.classList.add('copied');
        setTimeout(() => {
          label.textContent = labelCopy;
          icon.innerHTML =
            '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>';
          btn.classList.remove('copied');
        }, 2000);
      })
      .catch(() => {
        label.textContent = labelCopy;
      });
  });
}
