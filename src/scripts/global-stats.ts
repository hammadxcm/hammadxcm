/**
 * Global Stats Client — queued event reporting + cached stats fetching.
 * Batches events client-side to avoid 429s from the Worker's 10s rate limit.
 * Graceful fallback: if Worker is down, everything works without it.
 */

function getApiBase(): string {
  return document.documentElement.dataset.statsApi || '';
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const FLUSH_INTERVAL_MS = 10_000; // match Worker rate limit window

let cachedStats: Record<string, number> | null = null;
let cacheTimestamp = 0;

// ── Event Queue ───────────────────────────────────────────────────────

const eventQueue = new Map<string, number>(); // event → count
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function flush(): void {
  flushTimer = null;
  if (eventQueue.size === 0) return;

  const base = getApiBase();
  if (!base) {
    eventQueue.clear();
    return;
  }

  // Drain queue into a local copy
  const batch = Array.from(eventQueue.entries());
  eventQueue.clear();

  // Send first event immediately, re-queue the rest for next window
  const [first] = batch;
  send(base, first[0]);

  // Put remaining events back for the next flush
  for (let i = 1; i < batch.length; i++) {
    const [evt, count] = batch[i];
    eventQueue.set(evt, (eventQueue.get(evt) || 0) + count);
  }

  // Schedule next flush if there are remaining events
  if (eventQueue.size > 0) {
    scheduleFlush();
  }
}

function scheduleFlush(): void {
  if (flushTimer !== null) return;
  flushTimer = setTimeout(flush, FLUSH_INTERVAL_MS);
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

  // If queue is empty, send this event immediately and start the cooldown
  if (eventQueue.size === 0 && flushTimer === null) {
    send(base, event);
    // Start cooldown — any events arriving in the next 10s get queued
    flushTimer = setTimeout(flush, FLUSH_INTERVAL_MS);
    return;
  }

  // Otherwise queue it
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
