import { prefersReducedMotion } from '../state';
import { getBootMessages, getCurrentTheme, getThemeConfig } from '../theme-config';

const BOOT_INITIAL_DELAY_MS = 80;
const BOOT_LINE_DELAY_MS = 60;
const BOOT_DONE_DELAY_MS = 150;
const BOOT_FADE_MS = 300;

export function initBoot(): void {
  if (prefersReducedMotion) {
    const boot = document.getElementById('bootScreen');
    if (boot) boot.classList.add('hidden');
    return;
  }

  const bootScreen = document.getElementById('bootScreen');
  const bootLines = document.getElementById('bootLines');
  if (!bootScreen || !bootLines) return;

  const theme = getCurrentTheme();
  const tc = getThemeConfig(theme);

  if (tc.bootBg) bootScreen.style.background = tc.bootBg;
  if (theme === 'arctic') bootScreen.style.color = '#0369A1';

  const messages = getBootMessages(theme);
  const userName = bootScreen.dataset.name || 'User';
  const welcomeName = bootScreen.dataset.welcome || 'USER';

  const lines = [...messages, { text: `>>> WELCOME, ${welcomeName} <<<`, cls: 'boot-access' }];

  if (theme === 'hacker') {
    lines[3] = {
      text: `[  OK  ] Started portfolio.service — ${userName} Runtime`,
      cls: 'boot-ok',
    };
  }

  for (const l of lines) {
    const span = document.createElement('span');
    span.textContent = l.text;
    if (l.cls) span.classList.add(l.cls);
    bootLines.appendChild(span);
  }

  const spans = bootLines.querySelectorAll('span');
  spans.forEach((span, i) => {
    setTimeout(() => span.classList.add('show'), BOOT_INITIAL_DELAY_MS + i * BOOT_LINE_DELAY_MS);
  });

  const totalTime = BOOT_INITIAL_DELAY_MS + spans.length * BOOT_LINE_DELAY_MS + BOOT_DONE_DELAY_MS;
  setTimeout(() => {
    bootScreen.classList.add('fade-out');
    setTimeout(() => bootScreen.classList.add('hidden'), BOOT_FADE_MS);
  }, totalTime);
}
