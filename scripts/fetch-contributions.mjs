#!/usr/bin/env node

/**
 * Fetch OSS Contributions
 *
 * Queries GitHub REST API for merged PRs to external repositories,
 * enriches with repo metadata, and writes:
 *   - src/data/contributions.json  (consumed by Astro component)
 *   - CONTRIBUTIONS_README.md      (injected into README by workflow)
 *
 * Env vars:
 *   GITHUB_USERNAME  (required)
 *   GITHUB_TOKEN     (optional — raises rate limit)
 *   EXCLUDE_ORGS     (optional — comma-separated orgs to skip)
 *   MIN_STARS        (optional — default 0)
 *   MAX_ITEMS        (optional — default 20)
 */

import { writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const USERNAME = process.env.GITHUB_USERNAME;
const TOKEN = process.env.GITHUB_TOKEN || '';
const EXCLUDE_ORGS = (process.env.EXCLUDE_ORGS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const MIN_STARS = parseInt(process.env.MIN_STARS || '0', 10);
const MAX_ITEMS = parseInt(process.env.MAX_ITEMS || '20', 10);

if (!USERNAME) {
  console.error('GITHUB_USERNAME is required');
  process.exit(1);
}

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'fetch-contributions',
};
if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

async function fetchWithRetry(url, attempt = 1) {
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
}

async function fetchPRsByState(state) {
  const query = `author:${USERNAME}+type:pr+is:${state}+-user:${USERNAME}`;
  const perPage = 100;
  const allItems = [];
  let page = 1;

  while (true) {
    const url = `https://api.github.com/search/issues?q=${query}&sort=updated&order=desc&per_page=${perPage}&page=${page}`;
    const data = await fetchWithRetry(url);
    allItems.push(...data.items.map((item) => ({ ...item, _state: state })));

    if (allItems.length >= data.total_count || data.items.length < perPage) break;
    page++;
    // Small delay between paginated requests
    await new Promise((r) => setTimeout(r, 500));
  }

  return allItems;
}

function parseRepoFromUrl(htmlUrl) {
  // html_url looks like https://github.com/owner/repo/pull/123
  const match = htmlUrl.match(/github\.com\/([^/]+\/[^/]+)/);
  return match ? match[1] : null;
}

async function fetchRepoMeta(fullName) {
  try {
    const data = await fetchWithRetry(`https://api.github.com/repos/${fullName}`);
    return {
      fullName: data.full_name,
      url: data.html_url,
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language,
      description: data.description,
      ownerAvatar: data.owner?.avatar_url || '',
      topics: data.topics || [],
      license: data.license?.spdx_id || null,
    };
  } catch (err) {
    console.warn(`Failed to fetch repo metadata for ${fullName}: ${err.message}`);
    return {
      fullName,
      url: `https://github.com/${fullName}`,
      stars: 0,
      forks: 0,
      language: null,
      description: null,
      ownerAvatar: '',
      topics: [],
      license: null,
    };
  }
}

async function fetchPRDetails(fullName, prNumber) {
  try {
    const data = await fetchWithRetry(
      `https://api.github.com/repos/${fullName}/pulls/${prNumber}`
    );
    return {
      additions: data.additions || 0,
      deletions: data.deletions || 0,
      changedFiles: data.changed_files || 0,
    };
  } catch (err) {
    console.warn(`Failed to fetch PR details for ${fullName}#${prNumber}: ${err.message}`);
    return { additions: 0, deletions: 0, changedFiles: 0 };
  }
}

async function main() {
  console.log(`Fetching merged PRs for ${USERNAME}...`);
  const mergedPRs = await fetchPRsByState('merged');
  console.log(`Found ${mergedPRs.length} merged PRs to external repos`);

  console.log(`Fetching open PRs for ${USERNAME}...`);
  const openPRs = await fetchPRsByState('open');
  console.log(`Found ${openPRs.length} open PRs to external repos`);

  console.log(`Fetching closed (unmerged) PRs for ${USERNAME}...`);
  const allClosed = await fetchPRsByState('closed');
  // Remove merged PRs from closed set (GitHub's is:closed includes merged)
  const mergedUrls = new Set(mergedPRs.map((pr) => pr.html_url));
  const closedPRs = allClosed.filter((pr) => !mergedUrls.has(pr.html_url));
  console.log(`Found ${closedPRs.length} closed (unmerged) PRs to external repos`);

  const prs = [...mergedPRs, ...openPRs, ...closedPRs];

  if (prs.length === 0) {
    const emptyData = {
      generatedAt: new Date().toISOString(),
      username: USERNAME,
      totalCount: 0,
      contributions: [],
    };
    writeOutput(emptyData);
    return;
  }

  // Collect unique repos
  const repoNames = new Set();
  for (const pr of prs) {
    const repo = parseRepoFromUrl(pr.html_url);
    if (repo) repoNames.add(repo);
  }

  // Fetch repo metadata (with small delays to avoid rate limits)
  console.log(`Fetching metadata for ${repoNames.size} repos...`);
  const repoMeta = new Map();
  for (const name of repoNames) {
    repoMeta.set(name, await fetchRepoMeta(name));
    await new Promise((r) => setTimeout(r, 200));
  }

  // Build contributions list (before PR detail enrichment)
  const contributions = [];
  for (const pr of prs) {
    const repoFullName = parseRepoFromUrl(pr.html_url);
    if (!repoFullName) continue;

    const repo = repoMeta.get(repoFullName);
    if (!repo) continue;

    // Filter by excluded orgs
    const orgName = repoFullName.split('/')[0].toLowerCase();
    if (EXCLUDE_ORGS.includes(orgName)) continue;

    // Filter by min stars
    if (repo.stars < MIN_STARS) continue;

    // Extract labels from search response (already available, zero extra calls)
    const labels = (pr.labels || []).map((l) => ({
      name: l.name,
      color: l.color || '888888',
    }));

    contributions.push({
      title: pr.title,
      url: pr.html_url,
      number: pr.number,
      state: pr._state,
      mergedAt: pr._state === 'merged'
        ? (pr.pull_request?.merged_at || pr.closed_at || '')
        : pr._state === 'closed'
        ? (pr.closed_at || pr.created_at || '')
        : (pr.created_at || ''),
      additions: 0,
      deletions: 0,
      changedFiles: 0,
      labels,
      repo,
    });
  }

  // Sort by merge date descending
  contributions.sort((a, b) => new Date(b.mergedAt).getTime() - new Date(a.mergedAt).getTime());

  // Limit
  const limited = contributions.slice(0, MAX_ITEMS);

  // Fetch PR details (diff stats) for the limited set only
  console.log(`Fetching PR details for ${limited.length} contributions...`);
  for (const c of limited) {
    const repoFullName = c.repo.fullName;
    const details = await fetchPRDetails(repoFullName, c.number);
    c.additions = details.additions;
    c.deletions = details.deletions;
    c.changedFiles = details.changedFiles;
    await new Promise((r) => setTimeout(r, 200));
  }

  const data = {
    generatedAt: new Date().toISOString(),
    username: USERNAME,
    totalCount: limited.length,
    contributions: limited,
  };

  writeOutput(data);
}

function writeOutput(data) {
  // Write JSON for Astro component
  const jsonPath = resolve(__dirname, '..', 'src', 'data', 'contributions.json');
  writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n');
  console.log(`Wrote ${jsonPath} (${data.totalCount} contributions)`);

  // Generate README snippet
  const readmePath = resolve(__dirname, '..', 'CONTRIBUTIONS_README.md');
  if (data.contributions.length === 0) {
    writeFileSync(readmePath, '');
    return;
  }

  const lines = [
    '| Repository | PR | Status | Date | Stars | Impact |',
    '|:-----------|:---|:-------|:-----|------:|-------:|',
  ];

  for (const c of data.contributions) {
    // Skip closed (unmerged) PRs from the README table
    if (c.state === 'closed') continue;
    const date = c.mergedAt ? new Date(c.mergedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
    const stars = c.repo.stars >= 1000 ? `${(c.repo.stars / 1000).toFixed(1)}k` : String(c.repo.stars);
    const impact = `+${c.additions} -${c.deletions}`;
    const status = c.state === 'open' ? '🟢 Open' : '🟣 Merged';
    lines.push(
      `| [${c.repo.fullName}](${c.repo.url}) | [${c.title}](${c.url}) | ${status} | ${date} | ${stars} | ${impact} |`
    );
  }

  writeFileSync(readmePath, lines.join('\n') + '\n');
  console.log(`Wrote ${readmePath}`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  const fallback = resolve(__dirname, '..', 'src', 'data', 'contributions.json');
  if (existsSync(fallback)) {
    console.warn('Using existing contributions.json as fallback.');
    process.exit(0);
  }
  process.exit(1);
});
