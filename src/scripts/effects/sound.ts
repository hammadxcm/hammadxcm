type SoundName = 'click' | 'beep' | 'achievement' | 'levelup';

let initialized = false;
let enabled = false;
let audioCtx: AudioContext | null = null;
let achievementHandler: ((e: Event) => void) | null = null;
let levelupHandler: ((e: Event) => void) | null = null;

function getCtx(): AudioContext | null {
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', delay = 0): void {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = 0.15;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration / 1000);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration / 1000);
}

export function playSound(name: SoundName): void {
  if (!enabled) return;
  switch (name) {
    case 'click':
      playTone(800, 100, 'sine');
      break;
    case 'beep':
      playTone(600, 150, 'square');
      break;
    case 'achievement':
      playTone(500, 200, 'sine');
      playTone(800, 200, 'sine', 0.2);
      break;
    case 'levelup':
      playTone(400, 150, 'sine');
      playTone(600, 150, 'sine', 0.15);
      playTone(800, 150, 'sine', 0.3);
      break;
  }
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export function toggleSound(): void {
  enabled = !enabled;
  try {
    localStorage.setItem('hk-sound', enabled ? '1' : '0');
  } catch {
    /* noop */
  }
}

export function initSound(): void {
  if (initialized) return;
  initialized = true;

  try {
    enabled = localStorage.getItem('hk-sound') === '1';
  } catch {
    /* noop */
  }

  achievementHandler = () => playSound('achievement');
  levelupHandler = () => playSound('levelup');
  window.addEventListener('achievement-unlocked', achievementHandler);
  window.addEventListener('level-up', levelupHandler);
}

export function destroySound(): void {
  if (achievementHandler) window.removeEventListener('achievement-unlocked', achievementHandler);
  if (levelupHandler) window.removeEventListener('level-up', levelupHandler);
  achievementHandler = null;
  levelupHandler = null;
  if (audioCtx) {
    audioCtx.close().catch(() => {});
    audioCtx = null;
  }
  initialized = false;
}
