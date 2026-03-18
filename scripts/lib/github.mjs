/**
 * Shared GitHub API utilities for build scripts.
 */

export function createGitHubHeaders(token, userAgent = 'github-fetch') {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': userAgent,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function createFetchWithRetry(headers) {
  return async function fetchWithRetry(url, attempt = 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const res = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeout);

    if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
      const reset = parseInt(res.headers.get('x-ratelimit-reset') || '0', 10);
      const waitMs = Math.max((reset - Math.floor(Date.now() / 1000)) * 1000, 1000);
      if (attempt <= 3) {
        console.warn(`Rate limited. Waiting ${Math.ceil(waitMs / 1000)}s (attempt ${attempt}/3)...`);
        await new Promise((r) => setTimeout(r, waitMs));
        return fetchWithRetry(url, attempt + 1);
      }
      throw new Error(`Rate limited after ${attempt} retries`);
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
    return res.json();
  };
}
