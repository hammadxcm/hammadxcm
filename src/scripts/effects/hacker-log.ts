import { isPageVisible, isTouchDevice, onVisibilityChange, prefersReducedMotion } from '../state';
import { getThemeConfig } from '../theme-config';

function rand(a: number, b: number): number {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}
function randHex(n: number): string {
  let s = '';
  for (let i = 0; i < n; i++) s += '0123456789abcdef'[Math.floor(Math.random() * 16)];
  return s;
}
function randIP(): string {
  return `${rand(10, 192)}.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 254)}`;
}
function randPort(): number {
  return [22, 80, 443, 3000, 5432, 6379, 8080, 8443, 9090][Math.floor(Math.random() * 9)];
}
function randDomain(): string {
  return `${['api', 'cdn', 'db', 'cache', 'auth'][Math.floor(Math.random() * 5)]}.internal`;
}

const templates: (() => string)[] = [
  () => `[SCAN] ${randIP()} — port ${randPort()} open`,
  () => `[AUTH] Token refresh: SHA256:${randHex(7)}`,
  () => `[REDIS] PING → PONG (${rand(1, 9)}ms)`,
  () => `[K8S] pod/api-deployment-${randHex(6)} ready`,
  () => `[NET] TLS handshake ${randIP()}:${randPort()}`,
  () => `[SYS] CPU: ${rand(12, 78)}% | MEM: ${rand(40, 88)}%`,
  () => `[LOG] PID ${rand(1000, 9999)} — request completed 200 OK`,
  () => `[DB] Query executed in ${rand(1, 45)}ms — ${rand(1, 500)} rows`,
  () => `[SSH] Session ${randHex(8)} authenticated`,
  () => `[GIT] push origin main — ${randHex(7)}`,
  () => `[DNS] Resolved ${randDomain()} → ${randIP()}`,
  () => `[CRON] Job #${rand(100, 999)} completed successfully`,
  () => `[SSL] Certificate valid — expires in ${rand(30, 365)}d`,
  () => `[API] POST /v2/deploy — 201 Created (${rand(80, 400)}ms)`,
  () => `[DOCKER] Container ${randHex(12)} healthy`,
  () => `[PROXY] 301 redirect → /api/v${rand(1, 3)}`,
  () => `[FS] /var/log/syslog rotated — ${rand(1, 50)}MB freed`,
  () => `[CACHE] HIT ratio: ${rand(85, 99)}.${rand(0, 9)}%`,
  () => `[QUEUE] ${rand(0, 15)} jobs pending — ${rand(100, 999)} processed`,
  () => `[MONITOR] Uptime: ${rand(1, 999)}d ${rand(0, 23)}h ${rand(0, 59)}m`,
];

export function initHackerLog(): void {
  if (prefersReducedMotion || isTouchDevice) return;

  const container = document.getElementById('hackerLog');
  if (!container) return;

  const MAX_LOG_NODES = 20;
  const LOG_SPAWN_INTERVAL_MS = 800;
  let nodeCount = 0;
  let spawnIntervalId: number | null = null;

  function spawnLine(): void {
    if (!isPageVisible()) return;
    const tc = getThemeConfig();
    if (!tc.hasHackerLog) {
      stopSpawning();
      return;
    }
    if (nodeCount >= MAX_LOG_NODES) return;

    const line = document.createElement('div');
    line.className = 'hacker-log-line';
    line.textContent = templates[Math.floor(Math.random() * templates.length)]();
    line.style.left = `${rand(5, 85)}%`;
    line.style.top = `${rand(20, 90)}%`;
    container?.appendChild(line);
    nodeCount++;
    line.addEventListener('animationend', () => {
      line.remove();
      nodeCount--;
    });
  }

  function startSpawning(): void {
    if (spawnIntervalId !== null) return;
    spawnIntervalId = window.setInterval(spawnLine, LOG_SPAWN_INTERVAL_MS);
  }

  function stopSpawning(): void {
    if (spawnIntervalId !== null) {
      clearInterval(spawnIntervalId);
      spawnIntervalId = null;
    }
  }

  onVisibilityChange((visible) => {
    if (!visible) {
      stopSpawning();
    } else {
      const tc = getThemeConfig();
      if (tc.hasHackerLog) startSpawning();
    }
  });

  startSpawning();
}
