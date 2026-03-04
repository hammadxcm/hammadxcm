/**
 * Global Stats Client — queued event reporting + cached stats fetching.
 * Batches events client-side to avoid 429s from the Worker's 10s rate limit.
 * Persists cooldown across page refreshes via sessionStorage.
 * Graceful fallback: if Worker is down, everything works without it.
 */

function getApiBase(): string {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return '';
  return document.documentElement.dataset.statsApi || '';
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const FLUSH_INTERVAL_MS = 11_000; // slightly over Worker's 10s window
const STORAGE_KEY = 'hk-stats-last-send';

let cachedStats: Record<string, number> | null = null;
let cacheTimestamp = 0;

// ── Event Queue ───────────────────────────────────────────────────────

const eventQueue = new Map<string, number>(); // event → count
let flushTimer: ReturnType<typeof setTimeout> | null = null;

/** Milliseconds remaining in the cooldown window (survives page refresh). */
function cooldownRemaining(): number {
  try {
    const last = Number(sessionStorage.getItem(STORAGE_KEY) || '0');
    return Math.max(0, FLUSH_INTERVAL_MS - (Date.now() - last));
  } catch {
    return 0;
  }
}

function markSent(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* private browsing — ignore */
  }
}

function flush(): void {
  flushTimer = null;
  if (eventQueue.size === 0) return;

  const remaining = cooldownRemaining();
  if (remaining > 0) {
    flushTimer = setTimeout(flush, remaining);
    return;
  }

  const base = getApiBase();
  if (!base) {
    eventQueue.clear();
    return;
  }

  // Drain queue into a local copy
  const batch = Array.from(eventQueue.entries());
  eventQueue.clear();

  // Send first event, re-queue the rest for next window
  const [first] = batch;
  send(base, first[0]);
  markSent();

  for (let i = 1; i < batch.length; i++) {
    const [evt, count] = batch[i];
    eventQueue.set(evt, (eventQueue.get(evt) || 0) + count);
  }

  if (eventQueue.size > 0) {
    scheduleFlush();
  }
}

function scheduleFlush(): void {
  if (flushTimer !== null) return;
  const delay = Math.max(cooldownRemaining(), FLUSH_INTERVAL_MS);
  flushTimer = setTimeout(flush, delay);
}

function send(base: string, event: string): void {
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

/** Queue an event for batched reporting. Never blocks UI. */
export function reportEvent(event: string): void {
  const base = getApiBase();
  if (!base) return;

  const remaining = cooldownRemaining();

  // If no cooldown active and queue is empty, send immediately
  if (remaining === 0 && eventQueue.size === 0 && flushTimer === null) {
    send(base, event);
    markSent();
    // Start cooldown timer for any subsequent events
    flushTimer = setTimeout(flush, FLUSH_INTERVAL_MS);
    return;
  }

  // Otherwise queue it for the next window
  eventQueue.set(event, (eventQueue.get(event) || 0) + 1);
  scheduleFlush();
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
