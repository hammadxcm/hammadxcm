#!/usr/bin/env node

/**
 * Fetch GitHub Contribution Graph
 *
 * Queries GitHub GraphQL API for the contribution calendar across multiple years,
 * computes intensity levels (0–4) using quartile bucketing, and writes:
 *   - src/data/contribution-graph.json  (consumed by Astro component)
 *
 * Token resolution (in order):
 *   1. GITHUB_TOKEN env var
 *   2. GH_TOKEN env var
 *   3. `gh auth token` (GitHub CLI)
 *
 * Env vars:
 *   GITHUB_USERNAME  (default: hammadxcm)
 *   GITHUB_TOKEN     (optional — auto-detected from gh CLI)
 *   GRAPH_YEARS      (optional — how many years to fetch, default 5)
 */

import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const USERNAME = process.env.GITHUB_USERNAME || 'hammadxcm';
const YEARS = parseInt(process.env.GRAPH_YEARS || '5', 10);
const OUTPUT_PATH = resolve(__dirname, '..', 'src', 'data', 'contribution-graph.json');

const EMPTY_DATA = {
  generatedAt: '',
  username: '',
  totalContributions: 0,
  years: [],
  weeks: [],
};

/** Resolve token from env vars or gh CLI */
function resolveToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  try {
    const token = execSync('gh auth token', { encoding: 'utf8', timeout: 5000 }).trim();
    if (token) {
      console.log('Using token from gh CLI');
      return token;
    }
  } catch {
    // gh CLI not available or not authenticated
  }
  return '';
}

const TOKEN = resolveToken();

if (!TOKEN) {
  console.warn('No GitHub token found (checked GITHUB_TOKEN, GH_TOKEN, gh auth token).');
  console.warn('Writing empty contribution graph seed.');
  writeFileSync(OUTPUT_PATH, JSON.stringify(EMPTY_DATA, null, 2) + '\n');
  process.exit(0);
}

const GRAPHQL_URL = 'https://api.github.com/graphql';

/**
 * GitHub's contributionsCollection accepts `from` and `to` ISO date strings
 * to query specific year ranges. We query each year separately.
 */
function buildQuery(yearRanges) {
  const fragments = yearRanges
    .map(
      (range, i) => `
    year${i}: contributionsCollection(from: "${range.from}", to: "${range.to}") {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }`
    )
    .join('\n');

  return `
query($username: String!) {
  user(login: $username) {
    createdAt
    ${fragments}
  }
}`;
}

async function fetchGraphQL(query) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
      'User-Agent': 'fetch-contribution-graph',
    },
    body: JSON.stringify({ query, variables: { username: USERNAME } }),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  return json.data;
}

/**
 * Compute intensity levels (0–4) using quartile bucketing of nonzero counts.
 * Matches GitHub's algorithm.
 */
function computeLevels(weeks) {
  const nonzeroCounts = [];
  for (const week of weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > 0) {
        nonzeroCounts.push(day.contributionCount);
      }
    }
  }

  if (nonzeroCounts.length === 0) {
    return weeks.map((week) => ({
      contributionDays: week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: 0,
      })),
    }));
  }

  nonzeroCounts.sort((a, b) => a - b);
  const q1 = nonzeroCounts[Math.floor(nonzeroCounts.length * 0.25)];
  const q2 = nonzeroCounts[Math.floor(nonzeroCounts.length * 0.5)];
  const q3 = nonzeroCounts[Math.floor(nonzeroCounts.length * 0.75)];

  function getLevel(count) {
    if (count === 0) return 0;
    if (count <= q1) return 1;
    if (count <= q2) return 2;
    if (count <= q3) return 3;
    return 4;
  }

  return weeks.map((week) => ({
    contributionDays: week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: getLevel(day.contributionCount),
    })),
  }));
}

async function main() {
  console.log(`Fetching contribution graph for ${USERNAME} (${YEARS} years)...`);

  // Build year ranges
  const now = new Date();
  const yearRanges = [];
  for (let i = 0; i < YEARS; i++) {
    const yearEnd = new Date(now);
    yearEnd.setFullYear(yearEnd.getFullYear() - i);
    const yearStart = new Date(yearEnd);
    yearStart.setFullYear(yearStart.getFullYear() - 1);
    // GitHub expects ISO strings, contribution collections are date-bounded
    yearRanges.push({
      from: yearStart.toISOString(),
      to: yearEnd.toISOString(),
      label: `${yearStart.getFullYear()}-${yearEnd.getFullYear()}`,
    });
  }

  const query = buildQuery(yearRanges);
  const data = await fetchGraphQL(query);

  // Process each year
  const years = [];
  let allWeeks = [];

  for (let i = 0; i < yearRanges.length; i++) {
    const collection = data.user[`year${i}`];
    if (!collection) continue;

    const calendar = collection.contributionCalendar;
    const weeks = computeLevels(calendar.weeks);

    const yearLabel = i === 0 ? 'Last year' : yearRanges[i].label;

    years.push({
      year: yearLabel,
      totalContributions: calendar.totalContributions,
      weeks,
    });

    // The first year (most recent) is used as the default "all weeks"
    if (i === 0) {
      allWeeks = weeks;
    }
  }

  const output = {
    generatedAt: new Date().toISOString(),
    username: USERNAME,
    totalContributions: years[0]?.totalContributions || 0,
    years,
    weeks: allWeeks,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n');

  const yearSummary = years.map((y) => `${y.year}: ${y.totalContributions}`).join(', ');
  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`  Years: ${yearSummary}`);
  console.log(`  Total weeks (current year): ${allWeeks.length}`);
}

main().catch((err) => {
  console.error('Error fetching contribution graph:', err.message);
  writeFileSync(OUTPUT_PATH, JSON.stringify(EMPTY_DATA, null, 2) + '\n');
  console.warn('Wrote empty seed file as fallback.');
  process.exit(0);
});
