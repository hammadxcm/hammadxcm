import { prefersReducedMotion } from '../state';
import { getBootMessages, getCurrentTheme, getThemeConfig } from '../theme-config';

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
  const delay = 80;
  spans.forEach((span, i) => {
    setTimeout(() => span.classList.add('show'), delay + i * 60);
  });

  const totalTime = delay + spans.length * 60 + 150;
  setTimeout(() => {
    bootScreen.classList.add('fade-out');
    setTimeout(() => bootScreen.classList.add('hidden'), 300);
  }, totalTime);
}
