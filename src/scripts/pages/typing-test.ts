const CODE_SNIPPETS: Record<string, string[]> = {
  javascript: [
    'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}',
    'const debounce = (fn, ms) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n};',
    'async function fetchData(url) {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error(res.statusText);\n  return res.json();\n}',
    'const flatten = (arr) =>\n  arr.reduce((acc, val) =>\n    Array.isArray(val)\n      ? acc.concat(flatten(val))\n      : acc.concat(val), []);',
  ],
  typescript: [
    'interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\nfunction greet(user: User): string {\n  return "Hello, " + user.name + "!";\n}',
    'type Result<T, E = Error> =\n  | { ok: true; value: T }\n  | { ok: false; error: E };\n\nfunction wrap<T>(fn: () => T): Result<T> {\n  try {\n    return { ok: true, value: fn() };\n  } catch (e) {\n    return { ok: false, error: e as Error };\n  }\n}',
    'async function retry<T>(\n  fn: () => Promise<T>,\n  attempts: number = 3\n): Promise<T> {\n  for (let i = 0; i < attempts; i++) {\n    try { return await fn(); }\n    catch (e) {\n      if (i === attempts - 1) throw e;\n    }\n  }\n  throw new Error("unreachable");\n}',
  ],
  python: [
    'def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    mid = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + mid + quicksort(right)',
    'from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n: int) -> int:\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)',
    'class EventEmitter:\n    def __init__(self):\n        self._events = {}\n\n    def on(self, event, fn):\n        self._events.setdefault(event, []).append(fn)\n\n    def emit(self, event, *args):\n        for fn in self._events.get(event, []):\n            fn(*args)',
  ],
  ruby: [
    'def merge_sort(arr)\n  return arr if arr.length <= 1\n  mid = arr.length / 2\n  left = merge_sort(arr[0...mid])\n  right = merge_sort(arr[mid..])\n  merge(left, right)\nend',
    'class Memoize\n  def initialize(fn)\n    @fn = fn\n    @cache = {}\n  end\n\n  def call(*args)\n    @cache[args] ||= @fn.call(*args)\n  end\nend',
    'module Enumerable\n  def my_map(&block)\n    result = []\n    each { |e| result << block.call(e) }\n    result\n  end\nend',
  ],
};

const STORAGE_KEY = 'hk-typing-best';

let initialized = false;
let startTime = 0;
let totalChars = 0;
let correctChars = 0;
let currentStreak = 0;
let bestStreak = 0;
let currentSnippet = '';
let currentIndex = 0;
let timerInterval: ReturnType<typeof setInterval> | null = null;
let finished = false;

export function getSnippets(): Record<string, string[]> {
  return CODE_SNIPPETS;
}

export function calculateWPM(correct: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60000;
  // Standard: 5 chars = 1 word
  return Math.round(correct / 5 / minutes);
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((correct / total) * 100);
}

export function loadBest(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return {};
}

export function saveBest(lang: string, wpm: number): void {
  try {
    const bests = loadBest();
    if (!bests[lang] || wpm > bests[lang]) {
      bests[lang] = wpm;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bests));
    }
  } catch {
    /* ignore */
  }
}

function pickSnippet(lang: string): string {
  const snippets = CODE_SNIPPETS[lang] || CODE_SNIPPETS.javascript;
  return snippets[Math.floor(Math.random() * snippets.length)];
}

function renderDisplay(display: HTMLElement, snippet: string, idx: number, inputVal: string): void {
  let html = '';
  for (let i = 0; i < snippet.length; i++) {
    const ch = snippet[i];
    const escaped = ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch === '&' ? '&amp;' : ch;
    if (i < idx) {
      // Already typed
      const typedChar = inputVal[i] ?? '';
      if (typedChar === ch) {
        html += `<span class="char-correct">${escaped}</span>`;
      } else {
        html += `<span class="char-wrong">${escaped}</span>`;
      }
    } else if (i === idx) {
      html += `<span class="char-current">${escaped}</span>`;
    } else {
      html += `<span class="char-pending">${escaped}</span>`;
    }
  }
  display.innerHTML = html;
}

export function resetState(): void {
  startTime = 0;
  totalChars = 0;
  correctChars = 0;
  currentStreak = 0;
  bestStreak = 0;
  currentSnippet = '';
  currentIndex = 0;
  finished = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

export function initTypingTest(): void {
  if (initialized) return;

  const display = document.getElementById('typingDisplay');
  const input = document.getElementById('typingInput') as HTMLInputElement | null;
  const wpmEl = document.getElementById('wpmValue');
  const accEl = document.getElementById('accuracyValue');
  const streakEl = document.getElementById('streakValue');
  const restartBtn = document.getElementById('typingRestart');
  const langSelect = document.getElementById('typingLang') as HTMLSelectElement | null;
  const bestEl = document.getElementById('typingBest');

  if (!display || !input || !wpmEl || !accEl || !streakEl) return;
  initialized = true;

  function getLang(): string {
    return langSelect?.value || 'javascript';
  }

  function showBest(): void {
    if (!bestEl) return;
    const bests = loadBest();
    const lang = getLang();
    if (bests[lang]) {
      bestEl.textContent = `Personal best (${lang}): ${bests[lang]} WPM`;
    } else {
      bestEl.textContent = '';
    }
  }

  function startNewRound(): void {
    resetState();
    const lang = getLang();
    currentSnippet = pickSnippet(lang);
    currentIndex = 0;
    if (input) input.value = '';
    if (wpmEl) wpmEl.textContent = '0';
    if (accEl) accEl.textContent = '100';
    if (streakEl) streakEl.textContent = '0';
    if (display) renderDisplay(display, currentSnippet, 0, '');
    showBest();
    if (input) input.focus();
  }

  function updateStats(): void {
    if (startTime <= 0) return;
    const elapsed = Date.now() - startTime;
    const wpm = calculateWPM(correctChars, elapsed);
    const acc = calculateAccuracy(correctChars, totalChars);
    if (wpmEl) wpmEl.textContent = String(wpm);
    if (accEl) accEl.textContent = String(acc);
    if (streakEl) streakEl.textContent = String(currentStreak);
  }

  function finishTest(): void {
    finished = true;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    updateStats();
    const wpm = parseInt(wpmEl?.textContent || '0', 10);
    saveBest(getLang(), wpm);
    showBest();

    // Dispatch achievements
    try {
      window.dispatchEvent(new CustomEvent('achievement-trigger', { detail: 'typing_test' }));
      if (wpm >= 60) {
        window.dispatchEvent(new CustomEvent('achievement-trigger', { detail: 'speed_demon' }));
      }
      if (wpm >= 100) {
        window.dispatchEvent(new CustomEvent('achievement-trigger', { detail: 'typing_master' }));
      }
    } catch {
      /* ignore */
    }
  }

  input.addEventListener('input', () => {
    if (finished) return;

    const val = input.value;

    // Start timer on first keystroke
    if (startTime === 0 && val.length > 0) {
      startTime = Date.now();
      timerInterval = setInterval(updateStats, 500);
    }

    // Process each new character
    const newIndex = val.length;
    if (newIndex > currentIndex) {
      // Characters were added
      for (let i = currentIndex; i < newIndex && i < currentSnippet.length; i++) {
        totalChars++;
        if (val[i] === currentSnippet[i]) {
          correctChars++;
          currentStreak++;
          if (currentStreak > bestStreak) bestStreak = currentStreak;
        } else {
          currentStreak = 0;
        }
      }
    }
    currentIndex = newIndex;

    if (display) renderDisplay(display, currentSnippet, currentIndex, val);
    updateStats();

    // Check if finished
    if (currentIndex >= currentSnippet.length) {
      finishTest();
    }
  });

  // Prevent certain keys from interfering
  input.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      // Insert two spaces for tab
      const pos = input.selectionStart || 0;
      input.value = `${input.value.substring(0, pos)}  ${input.value.substring(pos)}`;
      input.selectionStart = input.selectionEnd = pos + 2;
      input.dispatchEvent(new Event('input'));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Insert newline character
      const pos = input.selectionStart || 0;
      input.value = `${input.value.substring(0, pos)}\n${input.value.substring(pos)}`;
      input.selectionStart = input.selectionEnd = pos + 1;
      input.dispatchEvent(new Event('input'));
    }
  });

  restartBtn?.addEventListener('click', startNewRound);
  langSelect?.addEventListener('change', startNewRound);

  // Initial round
  startNewRound();
}

export function destroyTypingTest(): void {
  initialized = false;
  resetState();
}
