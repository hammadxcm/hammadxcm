#!/usr/bin/env node

/**
 * Fetch GitHub Repos
 *
 * Queries GitHub REST API for user's own repositories (non-forks),
 * sorted by stars, and writes:
 *   - src/data/projects.json  (consumed by Astro component)
 *
 * Env vars:
 *   GITHUB_USERNAME  (required)
 *   GITHUB_TOKEN     (optional — raises rate limit)
 *   MAX_REPOS        (optional — default 30)
 */

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const USERNAME = process.env.GITHUB_USERNAME;
const TOKEN = process.env.GITHUB_TOKEN || '';
const MAX_REPOS = parseInt(process.env.MAX_REPOS || '30', 10);

if (!USERNAME) {
  console.error('GITHUB_USERNAME is required');
  process.exit(1);
}

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'fetch-projects',
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

async function fetchUserRepos() {
  const allRepos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `https://api.github.com/users/${USERNAME}/repos?type=owner&sort=stars&direction=desc&per_page=${perPage}&page=${page}`;
    const data = await fetchWithRetry(url);
    allRepos.push(...data);

    if (data.length < perPage) break;
    page++;
    await new Promise((r) => setTimeout(r, 300));
  }

  return allRepos;
}

async function fetchNpmDownloads(packageName) {
  try {
    const url = `https://api.npmjs.org/downloads/point/last-year/${encodeURIComponent(packageName)}`;
    const data = await fetchWithRetry(url);
    return data.downloads || 0;
  } catch {
    console.warn(`Could not fetch npm downloads for ${packageName}`);
    return 0;
  }
}

async function fetchGemDownloads(gemName) {
  try {
    const url = `https://rubygems.org/api/v1/gems/${encodeURIComponent(gemName)}.json`;
    const data = await fetchWithRetry(url);
    return data.downloads || 0;
  } catch {
    console.warn(`Could not fetch gem downloads for ${gemName}`);
    return 0;
  }
}

// Package names to fetch downloads for (matches portfolio.config.ts)
const NPM_PACKAGES = ['ramadan-cli-pro', '@hammadxcm/image-magnifier', 'electric-border-css'];
const GEM_PACKAGES = ['rubocop-hk'];

async function fetchAllDownloads() {
  const downloads = {};

  console.log('Fetching npm download counts...');
  for (const pkg of NPM_PACKAGES) {
    downloads[pkg] = await fetchNpmDownloads(pkg);
    console.log(`  ${pkg}: ${downloads[pkg].toLocaleString()} downloads`);
  }

  console.log('Fetching RubyGems download counts...');
  for (const gem of GEM_PACKAGES) {
    downloads[gem] = await fetchGemDownloads(gem);
    console.log(`  ${gem}: ${downloads[gem].toLocaleString()} downloads`);
  }

  return downloads;
}

async function main() {
  console.log(`Fetching repos for ${USERNAME}...`);
  const repos = await fetchUserRepos();
  console.log(`Found ${repos.length} repos`);

  // Filter: non-fork, non-empty, has description or stars
  const filtered = repos
    .filter((r) => !r.fork && !r.archived && !r.disabled)
    .filter((r) => r.description || r.stargazers_count > 0)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, MAX_REPOS);

  const result = filtered.map((r) => ({
    name: r.name,
    fullName: r.full_name,
    url: r.html_url,
    description: r.description,
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language,
    topics: r.topics || [],
    updatedAt: r.updated_at,
  }));

  // Fetch package download counts
  const downloads = await fetchAllDownloads();

  const data = {
    generatedAt: new Date().toISOString(),
    username: USERNAME,
    repos: result,
    downloads,
  };

  const jsonPath = resolve(__dirname, '..', 'src', 'data', 'projects.json');
  writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n');
  console.log(`Wrote ${jsonPath} (${result.length} repos)`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
