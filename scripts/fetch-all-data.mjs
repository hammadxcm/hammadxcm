#!/usr/bin/env node

/**
 * Fetch All Data (Build-Time Orchestrator)
 *
 * Runs all three fetch scripts sequentially before Astro builds.
 * Per-script failures are non-fatal when existing JSON fallbacks exist.
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '..', 'src', 'data');

const scripts = [
  { name: 'contributions', file: 'fetch-contributions.mjs', json: 'contributions.json' },
  { name: 'projects', file: 'fetch-projects.mjs', json: 'projects.json' },
  { name: 'contribution-graph', file: 'fetch-contribution-graph.mjs', json: 'contribution-graph.json' },
];

let failed = 0;

for (const script of scripts) {
  const scriptPath = resolve(__dirname, script.file);
  console.log(`\n--- Fetching ${script.name} ---`);
  try {
    execSync(`node ${scriptPath}`, { stdio: 'inherit', timeout: 120_000 });
  } catch (err) {
    console.warn(`Warning: ${script.name} fetch failed (${err.message})`);
    const fallback = resolve(dataDir, script.json);
    if (existsSync(fallback)) {
      console.warn(`Using existing ${script.json} as fallback.`);
    } else {
      console.error(`FATAL: ${script.json} does not exist and fetch failed.`);
      failed++;
    }
  }
}

// Verify all JSON files exist
for (const script of scripts) {
  const jsonPath = resolve(dataDir, script.json);
  if (!existsSync(jsonPath)) {
    console.error(`Missing: ${jsonPath}`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n${failed} data file(s) missing — build cannot proceed.`);
  process.exit(1);
}

console.log('\nAll data files ready.');
