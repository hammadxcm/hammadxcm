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

    return new Response('Not found', { status: 404, headers });
  },
};
