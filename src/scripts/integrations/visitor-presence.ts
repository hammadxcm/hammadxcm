let initialized = false;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

function getSessionId(): string {
  let id = sessionStorage.getItem('hk-session-id');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('hk-session-id', id);
  }
  return id;
}

async function heartbeat(): Promise<void> {
  try {
    // Use the existing global stats endpoint if available, or just track locally
    const sessions = JSON.parse(localStorage.getItem('hk-presence') || '{}') as Record<
      string,
      number
    >;
    const now = Date.now();
    // Clean expired (60s TTL)
    for (const [key, time] of Object.entries(sessions)) {
      if (now - time > 60_000) delete sessions[key];
    }
    // Add current
    sessions[getSessionId()] = now;
    localStorage.setItem('hk-presence', JSON.stringify(sessions));

    // Update display
    const count = Object.keys(sessions).length;
    const el = document.getElementById('visitorCount');
    if (el) el.textContent = String(count);
  } catch {
    // Silent
  }
}

export function getVisitorCount(): number {
  try {
    const sessions = JSON.parse(localStorage.getItem('hk-presence') || '{}') as Record<
      string,
      number
    >;
    const now = Date.now();
    return Object.values(sessions).filter((t) => now - t < 60_000).length;
  } catch {
    return 1;
  }
}

export function initVisitorPresence(): void {
  if (initialized) return;
  initialized = true;
  heartbeat();
  heartbeatInterval = setInterval(heartbeat, 30_000);
}

export function destroyVisitorPresence(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  initialized = false;
}
