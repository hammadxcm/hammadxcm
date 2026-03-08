/**
 * Portfolio Stats API — Cloudflare Worker + KV
 * Anonymous aggregate counters for social proof. No PII stored.
 *
 * POST /api/track  { event: string }  → increment counter
 * GET  /api/stats                     → return all counters
 */

interface Env {
  STATS: KVNamespace;
  ALLOWED_ORIGIN: string;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  SPOTIFY_REFRESH_TOKEN: string;
}

const VALID_EVENTS = [
  'visit',
  'ctf_solved',
  'konami',
  'achievement_unlocked',
  'guestbook_reached',
  'code_copy',
  'social_click',
  'resume_export',
  'command_palette',
  'annotations',
];
const THEME_PREFIX = 'theme:';
const LEVEL_PREFIX = 'level:';
const ACHIEVEMENT_PREFIX = 'ach:';

const RATE_LIMIT_MS = 10_000;
const ipLastWrite = new Map<string, number>();

function cors(env: Env): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const headers = cors(env);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // POST /api/track
    if (url.pathname === '/api/track' && request.method === 'POST') {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

      // Rate limit: 1 write per 10s per IP
      const last = ipLastWrite.get(ip) || 0;
      if (Date.now() - last < RATE_LIMIT_MS) {
        return new Response(JSON.stringify({ error: 'rate_limited' }), {
          status: 429,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      let body: { event?: string };
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: 'invalid_json' }), {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      const event = body.event?.trim();
      if (!event) {
        return new Response(JSON.stringify({ error: 'missing_event' }), {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      // Validate event name
      const isValid =
        VALID_EVENTS.includes(event) ||
        event.startsWith(THEME_PREFIX) ||
        event.startsWith(LEVEL_PREFIX) ||
        event.startsWith(ACHIEVEMENT_PREFIX);
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'invalid_event' }), {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      // Increment counter
      const current = parseInt((await env.STATS.get(event)) || '0', 10);
      await env.STATS.put(event, String(current + 1));
      ipLastWrite.set(ip, Date.now());

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // GET /api/stats
    if (url.pathname === '/api/stats' && request.method === 'GET') {
      const keys = await env.STATS.list();
      const values = await Promise.all(keys.keys.map((k) => env.STATS.get(k.name)));
      const stats: Record<string, number> = {};
      for (let i = 0; i < keys.keys.length; i++) {
        stats[keys.keys[i].name] = parseInt(values[i] || '0', 10);
      }
      return new Response(JSON.stringify(stats), {
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
        },
      });
    }

    // GET /api/spotify
    if (url.pathname === '/api/spotify' && request.method === 'GET') {
      return handleSpotify(env, headers);
    }

    return new Response('Not found', { status: 404, headers });
  },
};

// ── Spotify Now Playing ─────────────────────────────────────────────

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const SPOTIFY_TOKEN_KV_KEY = 'spotify:access_token';
const NOT_PLAYING = JSON.stringify({ isPlaying: false });

async function getSpotifyToken(env: Env): Promise<string | null> {
  // Check KV cache first
  const cached = await env.STATS.get(SPOTIFY_TOKEN_KV_KEY);
  if (cached) return cached;

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) return null;

  const basic = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });

  if (!res.ok) return null;

  const data: { access_token: string; expires_in: number } = await res.json();
  // Cache token in KV with TTL (expire 60s early)
  const ttl = Math.max(data.expires_in - 60, 60);
  await env.STATS.put(SPOTIFY_TOKEN_KV_KEY, data.access_token, { expirationTtl: ttl });
  return data.access_token;
}

async function handleSpotify(env: Env, headers: Record<string, string>): Promise<Response> {
  const jsonHeaders = { ...headers, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' };

  const token = await getSpotifyToken(env);
  if (!token) {
    return new Response(NOT_PLAYING, { headers: jsonHeaders });
  }

  try {
    const res = await fetch(SPOTIFY_NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 204 || !res.ok) {
      return new Response(NOT_PLAYING, { headers: jsonHeaders });
    }

    const data = await res.json() as {
      is_playing: boolean;
      currently_playing_type: string;
      progress_ms: number;
      item: {
        name: string;
        artists: { name: string }[];
        album: { name: string; images: { url: string }[] };
        external_urls: { spotify: string };
        duration_ms: number;
      };
    };

    if (!data.is_playing || data.currently_playing_type !== 'track') {
      return new Response(NOT_PLAYING, { headers: jsonHeaders });
    }

    const item = data.item;
    return new Response(
      JSON.stringify({
        isPlaying: true,
        track: item.name,
        artist: item.artists.map((a) => a.name).join(', '),
        album: item.album.name,
        albumArt: item.album.images[0]?.url,
        songUrl: item.external_urls.spotify,
        progress: data.progress_ms,
        duration: item.duration_ms,
      }),
      { headers: jsonHeaders },
    );
  } catch {
    return new Response(NOT_PLAYING, { headers: jsonHeaders });
  }
}
