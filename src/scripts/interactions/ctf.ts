/**
 * CTF Easter Egg — "Hack This Site"
 *
 * 5 clues are scattered across the site:
 *   1. HTML comment in Layout.astro body: "The passphrase starts with HACK"
 *   2. Console log on boot: "Second fragment is THE"
 *   3. data-ctf-clue attribute on status bar: "Third fragment is SI"
 *   4. Hidden CSS class in Certifications section: "Fourth fragment is TE"
 *   5. Title attribute on footer wave: "Final fragment is !"
 *
 * Full passphrase: HACKTHESITE!
 * Entering it in the console (or via a hidden input) triggers the achievement overlay.
 *
 * Progress tracked in sessionStorage.
 */

import { trackEvent } from '../achievements';

const PASSPHRASE = 'HACKTHESITE!';
const STORAGE_KEY = 'ctf-solved';

function showAchievement(): void {
  const overlay = document.getElementById('ctfOverlay');
  if (!overlay) return;

  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');

  setTimeout(() => {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
  }, 5000);
}

export function initCTF(): void {
  // Already solved this session
  if (sessionStorage.getItem(STORAGE_KEY) === 'true') return;

  // Log clue 2 to console
  console.log(
    '%c[CTF Clue 2/5] Second fragment is "THE"',
    'color: #00bfbf; font-weight: bold; font-size: 12px;',
  );

  // Add clue 4 as hidden element in certifications
  const certsSection = document.getElementById('certs');
  if (certsSection) {
    const clue = document.createElement('span');
    clue.className = 'ctf-clue-hidden';
    clue.dataset.ctfClue = '4:TE';
    clue.setAttribute('aria-hidden', 'true');
    clue.style.cssText =
      'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';
    certsSection.appendChild(clue);
  }

  // Add clue 5 to footer wave
  const wave = document.querySelector('.footer-wave');
  if (wave) {
    wave.setAttribute('title', 'CTF Clue 5/5: Final fragment is "!"');
  }

  // Listen for passphrase via custom event or console
  (window as Record<string, unknown>).__ctfSubmit = (answer: string) => {
    if (answer.toUpperCase().replace(/\s/g, '') === PASSPHRASE) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      showAchievement();
      trackEvent('ctf_solved');
      console.log(
        '%c ACCESS GRANTED — You solved the CTF! ',
        'background: #00bfbf; color: #000; font-weight: bold; font-size: 14px; padding: 4px 8px;',
      );
      return true;
    }
    console.log('%c Incorrect passphrase. Keep searching!', 'color: #ff4444;');
    return false;
  };

  console.log(
    '%c[CTF] Think you can hack this site? Find all 5 clues and call __ctfSubmit("YOUR_ANSWER") in the console.',
    'color: #888; font-style: italic;',
  );
}
