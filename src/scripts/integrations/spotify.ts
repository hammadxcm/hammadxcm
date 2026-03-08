let initialized = false;
let pollInterval: ReturnType<typeof setInterval> | null = null;
let widgetEl: HTMLElement | null = null;
let consecutiveIdle = 0;

interface NowPlaying {
  isPlaying: boolean;
  track?: string;
  artist?: string;
  albumArt?: string;
  progress?: number;
  duration?: number;
}

function getApiBase(): string {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return '';
  return document.documentElement.dataset.statsApi || '';
}

function createWidget(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'spotify-widget';
  el.id = 'spotifyWidget';
  el.innerHTML = `
    <img class="spotify-art" id="spotifyArt" alt="" />
    <div class="spotify-info">
      <div class="spotify-track" id="spotifyTrack"></div>
      <div class="spotify-artist" id="spotifyArtist"></div>
      <div class="spotify-progress">
        <div class="spotify-bar" id="spotifyBar"></div>
      </div>
    </div>
  `;
  document.body.appendChild(el);
  return el;
}

function getBackoffInterval(): number {
  if (consecutiveIdle < 5) return 30_000;
  if (consecutiveIdle < 15) return 60_000;
  return 120_000;
}

function schedulePoll(): void {
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(poll, getBackoffInterval());
}

async function poll(): Promise<void> {
  try {
    const base = getApiBase();
    if (!base) return;
    const res = await fetch(`${base}/api/spotify`);
    if (!res.ok) return;
    const data: NowPlaying = await res.json();

    if (!widgetEl) return;

    if (data.isPlaying && data.track) {
      consecutiveIdle = 0;
      schedulePoll();
      widgetEl.classList.add('visible');
      const art = document.getElementById('spotifyArt') as HTMLImageElement | null;
      const track = document.getElementById('spotifyTrack');
      const artist = document.getElementById('spotifyArtist');
      const bar = document.getElementById('spotifyBar');

      if (art && data.albumArt) {
        art.src = data.albumArt;
        art.alt = data.track || '';
      }
      if (track) track.textContent = data.track;
      if (artist) artist.textContent = data.artist || '';
      if (bar && data.duration && data.progress) {
        bar.style.width = `${(data.progress / data.duration) * 100}%`;
      }

      // Achievement
      try {
        window.dispatchEvent(new CustomEvent('achievement-trigger', { detail: 'music_lover' }));
      } catch {}
    } else {
      consecutiveIdle++;
      schedulePoll();
      widgetEl.classList.remove('visible');
    }
  } catch {
    // Silent fail
  }
}

export function initSpotify(): void {
  if (initialized) return;
  initialized = true;
  widgetEl = createWidget();
  poll();
  schedulePoll();
}

export function destroySpotify(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
  if (widgetEl) {
    widgetEl.remove();
    widgetEl = null;
  }
  initialized = false;
  consecutiveIdle = 0;
}
