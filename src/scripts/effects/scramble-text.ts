export function shuffleIndices(arr: number[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
}

export function createScrambleReveal(opts: {
  text: string;
  glyphs: string;
  timing: { flicker: number; resolve: number };
  onFrame: (text: string) => void;
  onDone?: () => void;
}): { flickerTimer: number; resolverTimer: number } {
  const { text, glyphs, timing, onFrame, onDone } = opts;
  const len = text.length;
  const resolved: boolean[] = new Array(len).fill(false);
  const pool: number[] = [];
  for (let i = 0; i < len; i++) {
    if (text[i] !== ' ') pool.push(i);
  }
  shuffleIndices(pool);

  function buildText(): string {
    let out = '';
    for (let i = 0; i < len; i++) {
      if (text[i] === ' ') out += ' ';
      else if (resolved[i]) out += text[i];
      else out += glyphs[Math.floor(Math.random() * glyphs.length)];
    }
    return out;
  }

  const flickerTimer = window.setInterval(() => {
    onFrame(buildText());
  }, timing.flicker);

  let step = 0;
  const resolverTimer = window.setInterval(() => {
    if (step < pool.length) {
      resolved[pool[step]] = true;
      step++;
    } else {
      clearInterval(resolverTimer);
      clearInterval(flickerTimer);
      onFrame(text);
      onDone?.();
    }
  }, timing.resolve);

  return { flickerTimer, resolverTimer };
}
