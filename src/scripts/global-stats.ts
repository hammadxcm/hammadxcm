/**
 * Global Stats Client — fire-and-forget event reporting + cached stats fetching.
 * Graceful fallback: if Worker is down, everything works without it.
 */

function getApiBase(): string {
  return document.documentElement.dataset.statsApi || '';
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cachedStats: Record<string, number> | null = null;
let cacheTimestamp = 0;

/** Fire-and-forget POST to increment a global counter. Never blocks UI. */
export function reportEvent(event: string): void {
  const base = getApiBase();
  if (!base) return;
  try {
    fetch(`${base}/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event }),
      keepalive: true,
    }).catch(() => {
      /* silent — worker may be offline */
    });
  } catch {
    /* silent */
  }
}

/** Fetch global stats with 5-min client-side cache. Returns null on failure. */
export async function fetchGlobalStats(): Promise<Record<string, number> | null> {
  if (cachedStats && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedStats;
  }
  const base = getApiBase();
  if (!base) return cachedStats;
  try {
    const res = await fetch(`${base}/api/stats`);
    if (!res.ok) return cachedStats;
    cachedStats = await res.json();
    cacheTimestamp = Date.now();
    return cachedStats;
  } catch {
    return cachedStats;
  }
}
