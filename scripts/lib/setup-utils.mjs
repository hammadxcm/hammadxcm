/**
 * Shared utilities for setup wizard and TUI config editor.
 *
 * Exports: constants, serializer, validators, prompt helpers, loaders, tech helpers.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as p from '@clack/prompts';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '../..');

// ── Theme definitions ──────────────────────────────────────────────────
export const THEMES = [
  { value: 'hacker', label: 'Hacker', hint: '#00bfbf cyan terminal' },
  { value: 'dracula', label: 'Dracula', hint: '#BD93F9 purple dark' },
  { value: 'nord', label: 'Nord', hint: '#88C0D0 frost blue' },
  { value: 'catppuccin', label: 'Catppuccin', hint: '#CBA6F7 lavender' },
  { value: 'synthwave', label: 'Synthwave', hint: '#FF2E97 neon pink' },
  { value: 'matrix', label: 'Matrix', hint: '#00FF41 neon green' },
  { value: 'bloodmoon', label: 'Blood Moon', hint: '#FF0040 crimson' },
  { value: 'midnight', label: 'Midnight', hint: '#7B73FF deep purple' },
  { value: 'arctic', label: 'Arctic', hint: '#0369A1 deep blue (light)' },
  { value: 'gruvbox', label: 'Gruvbox', hint: '#FABD2F warm gold' },
  { value: 'cyberpunk', label: 'Cyberpunk', hint: '#FFD700 electric gold' },
  { value: 'nebula', label: 'Nebula', hint: '#E040FB cosmic purple' },
  { value: 'solarized', label: 'Solarized', hint: '#268BD2 classic blue' },
  { value: 'rosepine', label: 'Rosé Pine', hint: '#EA9A97 muted rose' },
  { value: 'monokai', label: 'Monokai', hint: '#A6E22E neon green' },
];

// ── Skillicons slug map ────────────────────────────────────────────────
export const SKILLICONS_SLUG_MAP = {
  react: 'react', typescript: 'ts', javascript: 'js', 'next.js': 'nextjs',
  nextjs: 'nextjs', 'node.js': 'nodejs', nodejs: 'nodejs', python: 'python',
  django: 'django', flask: 'flask', fastapi: 'fastapi', java: 'java',
  spring: 'spring', kotlin: 'kotlin', go: 'go', golang: 'go', rust: 'rust',
  'c++': 'cpp', cpp: 'cpp', c: 'c', 'c#': 'cs', csharp: 'cs',
  php: 'php', laravel: 'laravel', ruby: 'ruby', rails: 'rails',
  swift: 'swift', dart: 'dart', flutter: 'flutter', lua: 'lua',
  perl: 'perl', r: 'r', scala: 'scala', elixir: 'elixir', haskell: 'haskell',
  html: 'html', css: 'css', sass: 'sass', tailwind: 'tailwind',
  tailwindcss: 'tailwind', bootstrap: 'bootstrap', vue: 'vue', 'vue.js': 'vue',
  angular: 'angular', svelte: 'svelte', astro: 'astro', ember: 'ember',
  jquery: 'jquery', express: 'express', 'express.js': 'express',
  nestjs: 'nestjs', 'nest.js': 'nestjs', graphql: 'graphql',
  postgresql: 'postgresql', postgres: 'postgresql', mysql: 'mysql',
  mongodb: 'mongodb', redis: 'redis', sqlite: 'sqlite', cassandra: 'cassandra',
  dynamodb: 'dynamodb', firebase: 'firebase', supabase: 'supabase',
  prisma: 'prisma', aws: 'aws', azure: 'azure', gcp: 'gcp',
  'google cloud': 'gcp', docker: 'docker', kubernetes: 'kubernetes',
  k8s: 'kubernetes', terraform: 'terraform', ansible: 'ansible',
  jenkins: 'jenkins', nginx: 'nginx', linux: 'linux', bash: 'bash',
  git: 'git', github: 'github', gitlab: 'gitlab', bitbucket: 'bitbucket',
  vscode: 'vscode', vim: 'vim', neovim: 'neovim', figma: 'figma',
  webpack: 'webpack', vite: 'vite', rollup: 'rollup', babel: 'babel',
  jest: 'jest', vitest: 'vitest', cypress: 'cypress', selenium: 'selenium',
  vercel: 'vercel', netlify: 'netlify', heroku: 'heroku', cloudflare: 'cloudflare',
  electron: 'electron', tauri: 'tauri', threejs: 'threejs', 'three.js': 'threejs',
  unity: 'unity', unreal: 'unreal', blender: 'blender', pytorch: 'pytorch',
  tensorflow: 'tensorflow', opencv: 'opencv', solidity: 'solidity',
  remix: 'remix', deno: 'deno', bun: 'bun', htmx: 'htmx',
  nuxt: 'nuxt', 'nuxt.js': 'nuxt', gatsby: 'gatsby',
};

// ── Tech URL map ──────────────────────────────────────────────────────
export const TECH_URL_MAP = {
  react: 'https://react.dev', typescript: 'https://www.typescriptlang.org',
  javascript: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
  'next.js': 'https://nextjs.org', nextjs: 'https://nextjs.org',
  'node.js': 'https://nodejs.org', nodejs: 'https://nodejs.org',
  python: 'https://www.python.org', django: 'https://www.djangoproject.com',
  flask: 'https://flask.palletsprojects.com', fastapi: 'https://fastapi.tiangolo.com',
  java: 'https://www.java.com', spring: 'https://spring.io',
  kotlin: 'https://kotlinlang.org', go: 'https://go.dev', golang: 'https://go.dev',
  rust: 'https://www.rust-lang.org', 'c++': 'https://isocpp.org',
  cpp: 'https://isocpp.org', 'c#': 'https://learn.microsoft.com/en-us/dotnet/csharp/',
  php: 'https://www.php.net', laravel: 'https://laravel.com',
  ruby: 'https://www.ruby-lang.org', rails: 'https://rubyonrails.org',
  swift: 'https://www.swift.org', dart: 'https://dart.dev',
  flutter: 'https://flutter.dev', html: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
  css: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
  sass: 'https://sass-lang.com', tailwind: 'https://tailwindcss.com',
  tailwindcss: 'https://tailwindcss.com', bootstrap: 'https://getbootstrap.com',
  vue: 'https://vuejs.org', 'vue.js': 'https://vuejs.org',
  angular: 'https://angular.dev', svelte: 'https://svelte.dev',
  astro: 'https://astro.build', express: 'https://expressjs.com',
  'express.js': 'https://expressjs.com', nestjs: 'https://nestjs.com',
  graphql: 'https://graphql.org', postgresql: 'https://www.postgresql.org',
  postgres: 'https://www.postgresql.org', mysql: 'https://www.mysql.com',
  mongodb: 'https://www.mongodb.com', redis: 'https://redis.io',
  sqlite: 'https://www.sqlite.org', firebase: 'https://firebase.google.com',
  supabase: 'https://supabase.com', prisma: 'https://www.prisma.io',
  aws: 'https://aws.amazon.com', azure: 'https://azure.microsoft.com',
  gcp: 'https://cloud.google.com', 'google cloud': 'https://cloud.google.com',
  docker: 'https://www.docker.com', kubernetes: 'https://kubernetes.io',
  terraform: 'https://www.terraform.io', git: 'https://git-scm.com',
  linux: 'https://www.linux.org', nginx: 'https://nginx.org',
  webpack: 'https://webpack.js.org', vite: 'https://vite.dev',
  jest: 'https://jestjs.io', vitest: 'https://vitest.dev',
  vercel: 'https://vercel.com', netlify: 'https://www.netlify.com',
  electron: 'https://www.electronjs.org', figma: 'https://www.figma.com',
  pytorch: 'https://pytorch.org', tensorflow: 'https://www.tensorflow.org',
  deno: 'https://deno.com', bun: 'https://bun.sh',
  remix: 'https://remix.run', gatsby: 'https://www.gatsbyjs.com',
  nuxt: 'https://nuxt.com', 'nuxt.js': 'https://nuxt.com',
};

// ── Shared state ──────────────────────────────────────────────────────
export const isInteractive = process.stdin.isTTY;

// ── Validation helpers ────────────────────────────────────────────────
export function validateUsername(val) {
  if (!val || val.trim().length === 0) return 'Username is required';
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(val.trim()))
    return 'Invalid GitHub username (alphanumeric and hyphens only, cannot start/end with hyphen)';
}

export function validateRequired(label) {
  return (val) => {
    if (!val || val.trim().length === 0) return `${label} is required`;
  };
}

export function validateUrl(val) {
  if (!val || val.trim().length === 0) return; // optional
  try { new URL(val.trim()); } catch { return 'Must be a valid URL (e.g. https://example.com)'; }
}

export function validateRequiredUrl(val) {
  if (!val || val.trim().length === 0) return 'URL is required';
  try { new URL(val.trim()); } catch { return 'Must be a valid URL (e.g. https://example.com)'; }
}

export function validateNumber(val) {
  if (val === '' || val === undefined) return;
  if (Number.isNaN(Number(val))) return 'Must be a number';
}

// ── Prompt helpers ────────────────────────────────────────────────────
export function handleCancel(val) {
  if (p.isCancel(val)) { p.cancel('Setup cancelled.'); process.exit(0); }
  return val;
}

export async function promptText(cliValue, options) {
  if (cliValue !== undefined && cliValue !== true) return String(cliValue);
  if (!isInteractive) return options.defaultValue || '';
  return handleCancel(await p.text(options)) || options.defaultValue || '';
}

export async function promptSelect(cliValue, options) {
  if (cliValue) return cliValue;
  if (!isInteractive) return options.initialValue;
  return handleCancel(await p.select(options));
}

export async function promptConfirm(cliValue, options) {
  if (cliValue !== undefined) return cliValue === true || cliValue === 'true';
  if (!isInteractive) return options.initialValue ?? true;
  return handleCancel(await p.confirm(options));
}

// ── Generic array collector ───────────────────────────────────────────
export async function collectArrayItems(label, promptFn, { min = 0, max = Infinity } = {}) {
  if (!isInteractive) return [];
  const items = [];
  while (items.length < max) {
    if (items.length < min) {
      p.log.info(chalk.dim(`${label} — entry ${items.length + 1} (required)`));
    } else {
      const more = handleCancel(await p.confirm({
        message: `Add ${items.length === 0 ? 'a' : 'another'} ${label}?`,
        initialValue: items.length === 0,
      }));
      if (!more) break;
    }
    const item = await promptFn(items.length);
    if (item) items.push(item);
  }
  return items;
}

// ── Tech icon / URL resolution ────────────────────────────────────────
export function resolveTechIcon(name) {
  const key = name.toLowerCase().trim();
  const slug = SKILLICONS_SLUG_MAP[key];
  return slug ? `https://skillicons.dev/icons?i=${slug}` : `https://skillicons.dev/icons?i=${key}`;
}

export function resolveTechUrl(name) {
  const key = name.toLowerCase().trim();
  return TECH_URL_MAP[key] || `https://www.google.com/search?q=${encodeURIComponent(name)}`;
}

// ── Split comma-separated input into trimmed array ────────────────────
export function splitCSV(input) {
  if (!input) return [];
  return input.split(',').map((s) => s.trim()).filter(Boolean);
}

// ── Edit-mode helpers ─────────────────────────────────────────────────
export function loadExistingConfig(configPath) {
  try {
    if (!fs.existsSync(configPath)) return null;
    let src = fs.readFileSync(configPath, 'utf8');
    src = src.replace(/^import\s+type\s+.*;\s*$/gm, '');
    src = src.replace(/const\s+config:\s*PortfolioConfig\s*=/, 'const config =');
    src = src.replace(/export\s+default\s+config;\s*$/, 'return config;');
    const fn = new Function(src);
    return fn();
  } catch (err) {
    console.warn(chalk.yellow(`  Warning: Could not parse existing config — starting fresh. (${err.message})`));
    return null;
  }
}

export function summarizeArray(items, labelFn, noun) {
  if (!items || items.length === 0) return `(0 ${noun}s)`;
  const labels = items.slice(0, 3).map(labelFn);
  let summary = labels.join(', ');
  if (items.length > 3) summary += ', ...';
  summary += ` (${items.length} ${noun}${items.length !== 1 ? 's' : ''})`;
  return summary;
}

export async function promptKeepArray(label, summary) {
  if (!isInteractive) return true;
  p.log.info(chalk.dim(`Current ${label}: ${summary}`));
  return handleCancel(await p.confirm({
    message: `Keep current ${label}?`,
    initialValue: true,
  }));
}

// ── TypeScript serializer ─────────────────────────────────────────────
export function serializeToTypeScript(config) {
  const lines = [];
  lines.push("import type { PortfolioConfig } from './types';");
  lines.push('');
  lines.push('const config: PortfolioConfig = {');

  const topKeys = [
    'site', 'hero', 'about', 'techStack', 'experience', 'projects',
    'certifications', 'github', 'leetcode', 'stackoverflow', 'hackerrank',
    'guestbook', 'chat', 'spotify', 'contributions', 'testimonials',
    'socials', 'sections', 'boot',
  ];

  const sectionLabels = {
    site: 'Site', hero: 'Hero', about: 'About', techStack: 'Tech Stack',
    experience: 'Experience', projects: 'Projects', certifications: 'Certifications',
    github: 'GitHub', leetcode: 'LeetCode', stackoverflow: 'StackOverflow',
    hackerrank: 'HackerRank', guestbook: 'Guestbook',
    chat: 'Chat (Gemini via Cloudflare Worker)', spotify: 'Spotify',
    contributions: 'Contributions',
    testimonials: 'Testimonials', socials: 'Socials', sections: 'Sections', boot: 'Boot Sequence',
  };

  let first = true;
  for (const key of topKeys) {
    if (config[key] === undefined) continue;
    if (!first) lines.push('');
    first = false;
    const label = sectionLabels[key] || key;
    lines.push(`  /* ─── ${label} ─── */`);
    const serialized = serializeValue(config[key], 1);
    lines.push(`  ${key}: ${serialized},`);
  }

  lines.push('};');
  lines.push('');
  lines.push('export default config;');
  lines.push('');
  return lines.join('\n');
}

export function serializeValue(val, depth) {
  const indent = '  '.repeat(depth + 1);
  const closingIndent = '  '.repeat(depth);

  if (val === null || val === undefined) return 'undefined';
  if (typeof val === 'boolean') return String(val);
  if (typeof val === 'number') return String(val);
  if (typeof val === 'string') return quoteString(val);

  if (Array.isArray(val)) {
    if (val.length === 0) return '[]';
    if (val.length <= 3 && val.every((v) => typeof v === 'string' && v.length < 40 && !v.includes('\n'))) {
      return `[${val.map(quoteString).join(', ')}]`;
    }
    if (val.every((v) => typeof v === 'string')) {
      const items = val.map((v) => `${indent}${quoteString(v)},`);
      return `[\n${items.join('\n')}\n${closingIndent}]`;
    }
    const items = val.map((v) => `${indent}${serializeValue(v, depth + 1)},`);
    return `[\n${items.join('\n')}\n${closingIndent}]`;
  }

  if (typeof val === 'object') {
    const entries = Object.entries(val).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return '{}';
    if (entries.length <= 2 && entries.every(([, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')) {
      const inner = entries.map(([k, v]) => `${safeKey(k)}: ${serializeValue(v, depth)}`).join(', ');
      if (inner.length < 70) return `{ ${inner} }`;
    }
    const objLines = entries.map(([k, v]) => `${indent}${safeKey(k)}: ${serializeValue(v, depth + 1)},`);
    return `{\n${objLines.join('\n')}\n${closingIndent}}`;
  }

  return String(val);
}

export function quoteString(s) {
  const escaped = String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `'${escaped}'`;
}

export function safeKey(key) {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : quoteString(key);
}

// ── Config save helpers (shared between wizard + TUI) ─────────────────
export function saveConfig(configObj) {
  const configDest = path.join(ROOT, 'src/config/portfolio.config.ts');
  const tsOutput = serializeToTypeScript(configObj);
  fs.writeFileSync(configDest, tsOutput, 'utf8');

  // Patch astro.config.mjs
  const astroConfigPath = path.join(ROOT, 'astro.config.mjs');
  let astroConfig = fs.readFileSync(astroConfigPath, 'utf8');
  const parsedUrl = new URL(configObj.site.url);
  const basePath = parsedUrl.pathname === '/' ? '/' : parsedUrl.pathname.replace(/\/$/, '');
  const siteOrigin = `${parsedUrl.protocol}//${parsedUrl.host}`;
  astroConfig = astroConfig.replace(/site: '[^']*'/, `site: '${siteOrigin}'`);
  astroConfig = astroConfig.replace(/base: '[^']*'/, `base: '${basePath}'`);
  fs.writeFileSync(astroConfigPath, astroConfig, 'utf8');

  // Patch lighthouse.yml URL
  const lighthousePath = path.join(ROOT, '.github/workflows/lighthouse.yml');
  if (fs.existsSync(lighthousePath)) {
    let lighthouse = fs.readFileSync(lighthousePath, 'utf8');
    lighthouse = lighthouse.replace(
      /urls: \|\n\s+https?:\/\/[^\n]+/,
      `urls: |\n            ${configObj.site.url.replace(/\/$/, '')}`,
    );
    fs.writeFileSync(lighthousePath, lighthouse, 'utf8');
  }
}

// ── Truncate helper ───────────────────────────────────────────────────
export function truncate(str, maxLen) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '\u2026';
}
