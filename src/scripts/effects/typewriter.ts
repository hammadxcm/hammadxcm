import { prefersReducedMotion } from '../state';
import { getCurrentTheme, themeTypewriterTexts } from '../theme-config';
import type { ThemeName } from '../types';

const defaultTitles = ['> Software Engineer'];

let titles: string[] = defaultTitles;
let titleIdx = 0;
let charIdx = 0;
let deleting = false;
let pause = 0;
let el: HTMLElement | null = null;

function getTextsForTheme(theme: ThemeName): string[] {
  return themeTypewriterTexts[theme] || themeTypewriterTexts.hacker || defaultTitles;
}

function tick(): void {
  if (!el) return;
  if (prefersReducedMotion) {
    el.textContent = titles[0];
    return;
  }
  const current = titles[titleIdx];
  if (pause > 0) {
    pause--;
    requestAnimationFrame(tick);
    return;
  }
  if (!deleting) {
    el.textContent = current.substring(0, charIdx + 1);
    charIdx++;
    if (charIdx === current.length) {
      deleting = true;
      pause = 90;
    }
  } else {
    el.textContent = current.substring(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      deleting = false;
      titleIdx = (titleIdx + 1) % titles.length;
      pause = 20;
    }
  }
  setTimeout(() => requestAnimationFrame(tick), deleting ? 30 : 60);
}

export function updateTypewriterTexts(theme: ThemeName): void {
  const newTexts = getTextsForTheme(theme);
  if (newTexts !== titles) {
    titles = newTexts;
    titleIdx = 0;
    charIdx = 0;
    deleting = false;
    pause = 0;
  }
}

export function initTypewriter(): void {
  el = document.getElementById('typewriter');
  if (!el) return;
  titles = getTextsForTheme(getCurrentTheme());
  tick();
}
