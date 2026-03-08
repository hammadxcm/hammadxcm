import type { APIRoute } from 'astro';

const CLIENT_ID = import.meta.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = import.meta.env.SPOTIFY_REFRESH_TOKEN;

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

export const GET: APIRoute = async () => {
  const notPlaying = new Response(JSON.stringify({ isPlaying: false }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    return notPlaying;
  }

  const token = await getAccessToken();
  if (!token) return notPlaying;

  const res = await fetch(NOW_PLAYING_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 204 || !res.ok) {
    return notPlaying;
  }

  const data = await res.json();

  if (!data.is_playing || data.currently_playing_type !== 'track') {
    return notPlaying;
  }

  const item = data.item;
  return new Response(
    JSON.stringify({
      isPlaying: true,
      title: item.name,
      artist: item.artists.map((a: { name: string }) => a.name).join(', '),
      album: item.album.name,
      albumArt: item.album.images[0]?.url,
      songUrl: item.external_urls.spotify,
      progress: data.progress_ms,
      duration: item.duration_ms,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};
