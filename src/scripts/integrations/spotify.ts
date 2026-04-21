let initialized = false;
let pollInterval: ReturnType<typeof setInterval> | null = null;
let tickInterval: ReturnType<typeof setInterval> | null = null;
let widgetEl: HTMLElement | null = null;
let consecutiveIdle = 0;

// Local tick state so the progress bar and elapsed-time label move between polls.
let localProgress = 0;
let localDuration = 0;
let lastPollAt = 0;

interface NowPlaying {
  isPlaying: boolean;
  track?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  songUrl?: string;
  progress?: number;
  duration?: number;
}

function getApiBase(): string {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return '';
  return document.documentElement.dataset.statsApi || '';
}

function fmtTime(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

const SPOTIFY_LOGO_SVG = `
<svg class="spotify-logo" viewBox="0 0 168 168" width="14" height="14" aria-hidden="true">
  <path fill="#1ED760" d="M83.996.277C37.747.277.253 37.77.253 84.019c0 46.251 37.494 83.741 83.743 83.741 46.254 0 83.744-37.49 83.744-83.741 0-46.246-37.49-83.738-83.745-83.738l.001-.004zm38.404 120.78a5.217 5.217 0 01-7.18 1.73c-19.662-12.01-44.414-14.73-73.564-8.07a5.222 5.222 0 01-6.249-3.93 5.213 5.213 0 013.926-6.25c31.9-7.29 59.263-4.15 81.337 9.34 2.46 1.51 3.24 4.72 1.73 7.18zm10.25-22.805c-1.89 3.075-5.91 4.045-8.98 2.155-22.51-13.839-56.823-17.846-83.448-9.764-3.453 1.043-7.1-.903-8.148-4.35a6.538 6.538 0 014.354-8.143c30.413-9.228 68.222-4.758 94.072 11.127 3.07 1.89 4.04 5.91 2.15 8.976v-.001zm.88-23.744c-26.99-16.031-71.52-17.505-97.289-9.684-4.138 1.255-8.514-1.081-9.768-5.219a7.835 7.835 0 015.221-9.771c29.581-8.98 78.756-7.245 109.83 11.202a7.823 7.823 0 012.74 10.733c-2.2 3.722-7.02 4.949-10.73 2.739z"/>
</svg>
`;

function createWidget(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'spotify-widget';
  el.id = 'spotifyWidget';
  el.innerHTML = `
    <a class="spotify-link" id="spotifyLink" target="_blank" rel="noopener noreferrer" aria-label="Open in Spotify">
      <img class="spotify-art" id="spotifyArt" alt="" />
      <div class="spotify-info">
        <div class="spotify-status">
          <span class="spotify-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
          ${SPOTIFY_LOGO_SVG}
          <span class="spotify-status-label">Listening on Spotify</span>
        </div>
        <div class="spotify-track" id="spotifyTrack"></div>
        <div class="spotify-meta">
          <span class="spotify-artist" id="spotifyArtist"></span>
          <span class="spotify-meta-sep" id="spotifyAlbumSep">·</span>
          <span class="spotify-album" id="spotifyAlbum"></span>
        </div>
        <div class="spotify-progress">
          <div class="spotify-bar" id="spotifyBar"></div>
        </div>
        <div class="spotify-time">
          <span id="spotifyElapsed">0:00</span>
          <span id="spotifyDuration">0:00</span>
        </div>
      </div>
    </a>
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

function applyTick(): void {
  if (!widgetEl || !localDuration) return;
  const elapsed = Date.now() - lastPollAt;
  const p = Math.min(localProgress + elapsed, localDuration);
  const bar = document.getElementById('spotifyBar');
  const elapsedEl = document.getElementById('spotifyElapsed');
  if (bar) bar.style.width = `${(p / localDuration) * 100}%`;
  if (elapsedEl) elapsedEl.textContent = fmtTime(p);
}

function startTick(): void {
  if (tickInterval) clearInterval(tickInterval);
  tickInterval = setInterval(applyTick, 1000);
}

function stopTick(): void {
  if (tickInterval) clearInterval(tickInterval);
  tickInterval = null;
}

function setText(id: string, value: string | undefined): void {
  const el = document.getElementById(id);
  if (el) el.textContent = value || '';
}

function setLinkAndArt(data: NowPlaying): void {
  const link = document.getElementById('spotifyLink') as HTMLAnchorElement | null;
  if (link) link.href = data.songUrl || 'https://open.spotify.com/';

  const art = document.getElementById('spotifyArt') as HTMLImageElement | null;
  if (art && data.albumArt) {
    art.src = data.albumArt;
    art.alt = data.track || '';
  }

  const albumSep = document.getElementById('spotifyAlbumSep');
  if (albumSep) albumSep.style.display = data.album ? '' : 'none';
}

function setProgress(data: NowPlaying): void {
  const bar = document.getElementById('spotifyBar');
  if (bar && data.duration && data.progress) {
    bar.style.width = `${(data.progress / data.duration) * 100}%`;
  }
}

function updatePlayingDisplay(data: NowPlaying): void {
  setLinkAndArt(data);
  setText('spotifyTrack', data.track);
  setText('spotifyArtist', data.artist);
  setText('spotifyAlbum', data.album);
  setText('spotifyDuration', fmtTime(data.duration || 0));
  setText('spotifyElapsed', fmtTime(data.progress || 0));
  setProgress(data);

  localProgress = data.progress || 0;
  localDuration = data.duration || 0;
  lastPollAt = Date.now();
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
      updatePlayingDisplay(data);
      startTick();

      try {
        window.dispatchEvent(new CustomEvent('achievement-trigger', { detail: 'music_lover' }));
      } catch {}
    } else {
      consecutiveIdle++;
      schedulePoll();
      widgetEl.classList.remove('visible');
      stopTick();
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
  stopTick();
  if (widgetEl) {
    widgetEl.remove();
    widgetEl = null;
  }
  initialized = false;
  consecutiveIdle = 0;
  localProgress = 0;
  localDuration = 0;
  lastPollAt = 0;
}
