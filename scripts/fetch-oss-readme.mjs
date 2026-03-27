#!/usr/bin/env node

/**
 * Fetch Open Source Projects Stats
 *
 * Fetches live download counts (npm / RubyGems) and GitHub stars
 * for showcased projects, then generates the HTML table injected
 * into README.md between <!-- OSS_PROJECTS:START/END --> markers.
 *
 * Env vars:
 *   GITHUB_TOKEN  (optional — raises rate limit)
 */

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGitHubHeaders, createFetchWithRetry } from './lib/github.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = process.env.GITHUB_TOKEN || '';
const headers = createGitHubHeaders(TOKEN, 'fetch-oss-readme');
const fetchWithRetry = createFetchWithRetry(headers);

// ── Project definitions ──────────────────────────────────────────────
// Each project defines its display info and where to fetch live stats.
const PROJECTS = [
  {
    emoji: '🌙',
    name: 'ramadan-cli-pro',
    url: 'https://www.npmjs.com/package/ramadan-cli-pro',
    badge: 'npm-ramadan--cli--pro-CB3837',
    badgeLogo: 'npm',
    desc: 'Published npm package — TUI dashboard\nwith prayer times, i18n & notifications',
    npm: 'ramadan-cli-pro',
    github: 'hammadxcm/ramadan-cli-pro',
  },
  {
    emoji: '💎',
    name: 'rubocop-hk',
    url: 'https://rubygems.org/gems/rubocop-hk',
    badge: 'RubyGems-rubocop--hk-E9573F',
    badgeLogo: 'rubygems',
    desc: 'Published RubyGem —\nModern RuboCop config for Ruby & Rails',
    gem: 'rubocop-hk',
    github: 'hammadxcm/rubocop-hk',
  },
  {
    emoji: '🔍',
    name: 'image-magnifier',
    url: 'https://www.npmjs.com/package/@hammadxcm/image-magnifier',
    badge: 'npm-image--magnifier-CB3837',
    badgeLogo: 'npm',
    desc: 'React zoom component —\nTypeScript with 7 releases',
    npm: '@hammadxcm/image-magnifier',
    github: 'hammadxcm/image-magnifier',
  },
  {
    emoji: '⚡',
    name: 'electric-border-css',
    url: 'https://www.npmjs.com/package/electric-border-css',
    badge: 'npm-electric--border--css-CB3837',
    badgeLogo: 'npm',
    desc: 'Animated CSS border effects — React, Vue,\nNext.js & Svelte with live demo',
    npm: 'electric-border-css',
    github: 'hammadxcm/electric-border-css',
  },
  {
    emoji: '🖥️',
    name: 'daemon-os',
    url: 'https://github.com/hammadxcm/daemon-os',
    badgeImg: 'https://raw.githubusercontent.com/hammadxcm/hammadxcm/main/public/daemon-os.svg',
    desc: 'macOS MCP server for AI agent computer-use\n— gives AI eyes & hands on your Mac',
    github: 'hammadxcm/daemon-os',
  },
  {
    emoji: '🚀',
    name: 'hammadxcm',
    url: 'https://github.com/hammadxcm/hammadxcm',
    badge: 'Astro-Portfolio-FF5D01',
    badgeLogo: 'astro',
    desc: 'This portfolio — Astro, TypeScript, SCSS\n10 themes, glass UI, dynamic data',
    github: 'hammadxcm/hammadxcm',
  },
  {
    emoji: '💀',
    name: 'slay',
    url: 'https://www.npmjs.com/package/slay-port',
    badge: 'npm-slay--port-CB3837',
    badgeLogo: 'npm',
    desc: 'Published npm package —\nZero-dep CLI to kill processes by port',
    npm: 'slay-port',
    github: 'hammadxcm/slay',
  },
];

// ── Stat fetchers ────────────────────────────────────────────────────

async function fetchNpmDownloads(packageName) {
  try {
    const url = `https://api.npmjs.org/downloads/point/last-year/${encodeURIComponent(packageName)}`;
    const data = await fetchWithRetry(url);
    return data.downloads || 0;
  } catch {
    console.warn(`  ⚠ npm downloads failed for ${packageName}`);
    return 0;
  }
}

async function fetchGemDownloads(gemName) {
  try {
    const url = `https://rubygems.org/api/v1/gems/${encodeURIComponent(gemName)}.json`;
    const data = await fetchWithRetry(url);
    return data.downloads || 0;
  } catch {
    console.warn(`  ⚠ gem downloads failed for ${gemName}`);
    return 0;
  }
}

async function fetchGitHubStars(repo) {
  try {
    const data = await fetchWithRetry(`https://api.github.com/repos/${repo}`);
    return data.stargazers_count || 0;
  } catch {
    console.warn(`  ⚠ GitHub stars failed for ${repo}`);
    return 0;
  }
}

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k+`.replace('.0k+', 'k+');
  return `${n.toLocaleString()}+`;
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching live stats for Open Source projects...\n');

  // Fetch all stats
  for (const p of PROJECTS) {
    const stats = [];

    if (p.github) {
      p._stars = await fetchGitHubStars(p.github);
      if (p._stars > 0) stats.push(`${p._stars} stars`);
    }

    if (p.npm) {
      p._downloads = await fetchNpmDownloads(p.npm);
      if (p._downloads > 0) stats.push(`${formatCount(p._downloads)} downloads`);
    }

    if (p.gem) {
      p._downloads = await fetchGemDownloads(p.gem);
      if (p._downloads > 0) stats.push(`${formatCount(p._downloads)} downloads`);
    }

    console.log(`  ${p.name}: ${stats.join(', ') || 'no stats'}`);
    await new Promise((r) => setTimeout(r, 200));
  }

  // Build HTML table
  const rows = [];
  for (let i = 0; i < PROJECTS.length; i += 3) {
    const chunk = PROJECTS.slice(i, i + 3);
    const cells = chunk.map((p) => buildCell(p));
    // Pad to 3 cells if last row is incomplete
    while (cells.length < 3) {
      cells.push('<td align="center" width="33%">\n</td>');
    }
    rows.push(`<tr>\n${cells.join('\n')}\n</tr>`);
  }

  const html = `<table>\n${rows.join('\n')}\n</table>`;

  const outPath = resolve(__dirname, '..', 'OSS_PROJECTS_README.md');
  writeFileSync(outPath, html + '\n');
  console.log(`\nWrote ${outPath}`);
}

function buildCell(p) {
  // Build stat badges
  const statParts = [];
  if (p._stars && p._stars > 0) statParts.push(`${p._stars} stars`);
  if (p._downloads && p._downloads > 0) statParts.push(`${formatCount(p._downloads)} downloads`);
  const statLine = statParts.length > 0 ? `\n${statParts.join(' · ')}` : '';

  // Description as-is with line breaks
  const descHtml = p.desc.split('\n').join('<br/>\n');

  // Badge
  let badgeHtml;
  if (p.badgeImg) {
    badgeHtml = `<a href="${p.url}"><img src="${p.badgeImg}" alt="${p.name}" width="100%"/></a>`;
  } else {
    badgeHtml = `<img src="https://img.shields.io/badge/${p.badge}?style=flat-square&logo=${p.badgeLogo}&logoColor=white" width="100%"/>`;
  }

  return `<td align="center" width="33%">
<div>
${badgeHtml}
<br/><br/>
<b>${p.emoji} <a href="${p.url}">${p.name}</a></b><br/>
<sub>${descHtml}${statLine}</sub>
</div>
</td>`;
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
