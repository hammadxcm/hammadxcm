import { prefersReducedMotion } from '../state';
import { getBootMessages, getCurrentTheme, getThemeConfig } from '../theme-config';
import type { ThemeName } from '../types';

const BOOT_INITIAL_DELAY_MS = 80;
const BOOT_LINE_DELAY_MS = 60;
const BOOT_DONE_DELAY_MS = 150;
const BOOT_FADE_MS = 300;

const RETURN_LINE_DELAY_MS = 120;
const RETURN_FADE_MS = 300;
const RETURN_DONE_DELAY_MS = 100;

interface NetworkInformation {
  effectiveType: string;
}
declare global {
  interface Navigator {
    connection?: NetworkInformation;
  }
}

const SLOW_CONNECTIONS = new Set(['slow-2g', '2g', '3g']);

function isSlowConnection(): boolean {
  return SLOW_CONNECTIONS.has(navigator.connection?.effectiveType ?? '');
}

function getLineDelay(base: number): number {
  return isSlowConnection() ? Math.round(base / 2) : base;
}

function getReturnBootLines(_theme: string, welcomeName: string): { text: string; cls: string }[] {
  return [
    { text: '> Resuming session...', cls: 'boot-cmd' },
    { text: `[  OK  ] Welcome back, ${welcomeName}`, cls: 'boot-ok' },
    { text: '>>> SESSION RESTORED <<<', cls: 'boot-access' },
  ];
}

function updateProgress(bar: HTMLElement | null, current: number, total: number): void {
  if (bar) bar.style.width = `${Math.round((current / total) * 100)}%`;
}

function buildBootLines(
  isReturn: boolean,
  theme: ThemeName,
  userName: string,
  welcomeName: string,
): { text: string; cls: string }[] {
  if (isReturn) {
    return getReturnBootLines(theme, welcomeName);
  }
  const messages = getBootMessages(theme);
  const lines = [...messages, { text: `>>> WELCOME, ${welcomeName} <<<`, cls: 'boot-access' }];
  if (theme === 'hacker') {
    lines[3] = {
      text: `[  OK  ] Started portfolio.service — ${userName} Runtime`,
      cls: 'boot-ok',
    };
  }
  return lines;
}

function appendBootSpans(container: HTMLElement, lines: { text: string; cls: string }[]): void {
  for (const l of lines) {
    const span = document.createElement('span');
    span.textContent = l.text;
    if (l.cls) span.classList.add(l.cls);
    container.appendChild(span);
  }
}

export function initBoot(): void {
  if (prefersReducedMotion) {
    const boot = document.getElementById('bootScreen');
    if (boot) boot.classList.add('hidden');
    return;
  }

  const bootScreen = document.getElementById('bootScreen');
  const bootLines = document.getElementById('bootLines');
  const progressBar = document.getElementById('bootProgress');
  if (!bootScreen || !bootLines) return;

  const isReturn = !!sessionStorage.getItem('boot-done');

  const theme = getCurrentTheme();
  const tc = getThemeConfig(theme);

  if (tc.bootBg) bootScreen.style.background = tc.bootBg;
  if (theme === 'arctic') bootScreen.style.color = '#0369A1';

  const userName = bootScreen.dataset.name || 'User';
  const welcomeName = bootScreen.dataset.welcome || 'USER';

  const lines = buildBootLines(isReturn, theme, userName, welcomeName);
  appendBootSpans(bootLines, lines);

  const spans = bootLines.querySelectorAll('span');
  const lineDelay = isReturn ? RETURN_LINE_DELAY_MS : getLineDelay(BOOT_LINE_DELAY_MS);
  const initialDelay = isReturn ? 0 : BOOT_INITIAL_DELAY_MS;
  const doneDelay = isReturn ? RETURN_DONE_DELAY_MS : BOOT_DONE_DELAY_MS;
  const fadeMs = isReturn ? RETURN_FADE_MS : BOOT_FADE_MS;
  const totalSteps = spans.length;
  const timers: ReturnType<typeof setTimeout>[] = [];

  const ac = new AbortController();

  function finishBoot(): void {
    if (!bootScreen || bootScreen.classList.contains('fade-out')) return;

    for (const t of timers) clearTimeout(t);
    timers.length = 0;

    for (const s of spans) s.classList.add('show');
    updateProgress(progressBar, totalSteps, totalSteps);

    ac.abort();

    bootScreen.classList.add('fade-out');
    const screen = bootScreen;
    setTimeout(() => {
      screen.classList.add('hidden');
      sessionStorage.setItem('boot-done', '1');
    }, fadeMs);
  }

  const skipOpts: AddEventListenerOptions = { once: true, signal: ac.signal };
  document.addEventListener('click', finishBoot, skipOpts);
  document.addEventListener('keydown', finishBoot, skipOpts);
  document.addEventListener('touchstart', finishBoot, skipOpts);

  spans.forEach((span, i) => {
    const t = setTimeout(
      () => {
        span.classList.add('show');
        updateProgress(progressBar, i + 1, totalSteps);
      },
      initialDelay + i * lineDelay,
    );
    timers.push(t);
  });

  const totalTime = initialDelay + totalSteps * lineDelay + doneDelay;
  const doneTimer = setTimeout(finishBoot, totalTime);
  timers.push(doneTimer);
}
