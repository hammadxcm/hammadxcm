#!/usr/bin/env node

/**
 * Generates the animated README panels in assets/universe/.
 *
 * System Architecture is static. The other panels mix hand-written content with
 * live data from the GitHub REST API and src/data/{contribution-graph,
 * contributions,projects}.json (run the matching fetch-*.mjs scripts first).
 *
 * Env vars:
 *   GITHUB_TOKEN / GH_TOKEN  (optional; unauthenticated works for public data)
 *   GITHUB_USERNAME          (default: hammadxcm)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createFetchWithRetry, createGitHubHeaders } from './lib/github.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'assets', 'universe');
const GRAPH_PATH = join(ROOT, 'src', 'data', 'contribution-graph.json');
const CONTRIB_PATH = join(ROOT, 'src', 'data', 'contributions.json');
const PROJECTS_PATH = join(ROOT, 'src', 'data', 'projects.json');
const USERNAME = process.env.GITHUB_USERNAME || 'hammadxcm';

const W = 1664;
const H = 936;
const X0 = 64;
const INNER = W - X0 * 2;
const C = {
  bg: '#0d1117',
  card: '#0f1b20',
  line: '#1f3a40',
  accent: '#00bfbf',
  bright: '#a9fef7',
  text: '#e6edf3',
  dim: '#7d8590',
};
const LEVELS = ['#161b22', '#0b3d40', '#0a6e70', '#00a3a3', '#a9fef7'];
// ponytail: monospace width estimate, no font metrics available inside an <img> SVG
const textW = (s, size, spacing = 0) => s.length * (size * 0.6 + spacing);

export const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const t = (x, y, s, cls, extra = '') =>
  `<text x="${x}" y="${y}" class="${cls}"${extra}>${esc(s)}</text>`;

/** Greedy word wrap by character count. */
export function wrap(s, max) {
  const lines = [];
  let cur = '';
  for (const word of s.split(' ')) {
    if (cur && (cur + ' ' + word).length > max) {
      lines.push(cur);
      cur = word;
    } else cur = cur ? `${cur} ${word}` : word;
  }
  if (cur) lines.push(cur);
  return lines;
}

const STYLE = `
text{font-family:ui-monospace,SFMono-Regular,'JetBrains Mono',Menlo,Consolas,monospace;fill:${C.text}}
.k{fill:${C.accent};font-size:14px;letter-spacing:3px}
.t{fill:${C.bright};font-size:44px;font-weight:700;letter-spacing:5px}
.s{fill:${C.dim};font-size:16px;letter-spacing:1px}
.h{fill:${C.bright};font-size:28px;font-weight:700;letter-spacing:3px}
.b{font-size:15px}
.d{fill:${C.dim};font-size:14px}
.chip{fill:${C.accent};font-size:13px;font-weight:700;letter-spacing:1px}
.v{fill:${C.bright};font-size:40px;font-weight:700}
.card{fill:${C.card};stroke:${C.line};stroke-width:1.5}
.fade{animation:fade .9s ease-out backwards}
.pulse{animation:pulse 2s ease-in-out infinite}
.blink{animation:blink 1s steps(1) infinite}
.flow{stroke-dasharray:6 10;animation:flow 1.2s linear infinite}
.grow{transform-box:fill-box;transform-origin:left;animation:grow 2.6s ease-in-out infinite alternate}
.spin{transform-box:fill-box;transform-origin:center;animation:spin 24s linear infinite}
.rspin{transform-box:fill-box;transform-origin:center;animation:spin 16s linear infinite reverse}
.draw{stroke-dasharray:900;animation:draw 3s ease-out infinite alternate}
.scan{animation:scan 7s linear infinite}
@keyframes fade{from{opacity:0}}
@keyframes pulse{50%{opacity:.25}}
@keyframes blink{50%{opacity:0}}
@keyframes flow{to{stroke-dashoffset:-32}}
@keyframes grow{from{transform:scaleX(.3)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes draw{from{stroke-dashoffset:900}}
@keyframes scan{from{transform:translateX(0)}to{transform:translateX(${INNER}px)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

/** Shared chrome: background grid, prompt line, title, status chip, footer ticker. */
function frame({ title, desc, cmd, heading, sub, status, ticker, body }) {
  const chipW = textW(status, 14, 3) + 60;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title>
<desc id="desc">${esc(desc)}</desc>
<style>${STYLE}</style>
<defs>
<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${C.accent}" stroke-opacity=".06"/></pattern>
<radialGradient id="glow" cx="85%" cy="0%" r="70%"><stop offset="0" stop-color="${C.accent}" stop-opacity=".16"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
<linearGradient id="beam" x1="0" x2="1"><stop offset="0" stop-color="${C.bright}" stop-opacity="0"/><stop offset="1" stop-color="${C.bright}"/></linearGradient>
</defs>
<rect width="${W}" height="${H}" rx="18" fill="${C.bg}"/>
<rect width="${W}" height="${H}" rx="18" fill="url(#grid)"/>
<rect width="${W}" height="${H}" rx="18" fill="url(#glow)"/>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="none" stroke="${C.line}"/>
${t(X0, 72, `${USERNAME}@universe:~$ ${cmd}`, 'k')}<rect x="${X0 + textW(`${USERNAME}@universe:~$ ${cmd}`, 14, 3) + 8}" y="58" width="9" height="17" fill="${C.accent}" class="blink"/>
${t(X0, 128, heading, 't')}
${t(X0, 162, sub, 's')}
<g transform="translate(${W - X0 - chipW} 50)"><rect width="${chipW}" height="40" rx="20" fill="${C.card}" stroke="${C.accent}" stroke-opacity=".5"/><circle cx="24" cy="20" r="6" fill="${C.bright}" class="pulse"/>${t(42, 25, status, 'k')}</g>
<line x1="${X0}" y1="192" x2="${W - X0}" y2="192" stroke="${C.line}"/>
<rect x="${X0 - 120}" y="191" width="120" height="3" fill="url(#beam)" class="scan"/>
${body}
<line x1="${X0}" y1="${H - 66}" x2="${W - X0}" y2="${H - 66}" stroke="${C.line}"/>
${t(X0, H - 32, ticker, 'k')}
${t(W - X0, H - 32, `github.com/${USERNAME}`, 'k', ' text-anchor="end"')}
</svg>
`;
}

function card(x, y, w, h) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" class="card"/>
<path d="M${x} ${y + 28}V${y + 12}a12 12 0 0 1 12-12h16" fill="none" stroke="${C.accent}" stroke-width="2"/>
<path d="M${x + w} ${y + h - 28}v16a12 12 0 0 1-12 12h-16" fill="none" stroke="${C.accent}" stroke-width="2" stroke-opacity=".5"/>`;
}

/** Row of outlined chips, wrapping at maxW. Returns { svg, height }. */
function chips(x, y, labels, maxW) {
  let cx = 0;
  let cy = 0;
  const out = labels.map((label) => {
    const w = textW(label, 13, 1) + 24;
    if (cx && cx + w > maxW) {
      cx = 0;
      cy += 38;
    }
    const s = `<g transform="translate(${x + cx} ${y + cy})"><rect width="${w}" height="28" rx="6" fill="${C.accent}" fill-opacity=".08" stroke="${C.accent}" stroke-opacity=".45"/>${t(12, 19, label, 'chip')}</g>`;
    cx += w + 10;
    return s;
  });
  return { svg: out.join(''), height: cy + 28 };
}

const bullet = (x, y, s, cls = 'b') =>
  `<circle cx="${x + 4}" cy="${y - 5}" r="3.5" fill="${C.accent}"/>${t(x + 20, y, s, cls)}`;

function statusBar(x, y, w, label, delay) {
  return `${t(x, y, label, 'd')}
<rect x="${x}" y="${y + 14}" width="${w}" height="6" rx="3" fill="${C.line}"/>
<rect x="${x}" y="${y + 14}" width="${w}" height="6" rx="3" fill="${C.accent}" class="grow" style="animation-delay:${delay}s"/>`;
}

// ---------------------------------------------------------------------------
// Panel 1: Technology Universe
// ---------------------------------------------------------------------------

const STACK = [
  {
    idx: '01 / INTERFACE',
    name: 'FRONTEND',
    sub: 'Experience • Components • PWA',
    codes: ['REACT', 'NEXT', 'VUE', 'TS', 'TW'],
    tools: ['React', 'Next.js', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'Progressive Web Apps'],
    status: 'UI LAYER ONLINE',
  },
  {
    idx: '02 / LOGIC',
    name: 'BACKEND',
    sub: 'APIs • Services • Distributed',
    codes: ['RAILS', 'NEST', 'NODE', 'GQL'],
    tools: ['Ruby on Rails', 'NestJS', 'Node.js', 'GraphQL', 'Python', 'Sidekiq / BullMQ'],
    status: 'SERVICES SYNCED',
  },
  {
    idx: '03 / KNOWLEDGE',
    name: 'DATA',
    sub: 'Persistence • Caching • Modeling',
    codes: ['PG', 'MONGO', 'MYSQL', 'REDIS'],
    tools: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Prisma ORM', 'Data Modeling'],
    status: 'DATA STREAMS HEALTHY',
  },
  {
    idx: '04 / INFRASTRUCTURE',
    name: 'CLOUD',
    sub: 'Scale • Containers • Automation',
    codes: ['AWS', 'AZURE', 'DOCKER', 'K8S'],
    tools: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Cloudflare Workers', 'CI / CD'],
    status: 'CLUSTERS OPERATIONAL',
  },
];

/** @param {{ languages?: {name:string, pct:number}[] }} [live] */
export function renderTechUniverse(live = {}) {
  const w = (INNER - 16 * 3) / 4;
  const y = 224;
  const h = 612;
  const body = STACK.map((s, i) => {
    const x = X0 + i * (w + 16);
    const px = x + 28;
    const c = chips(px, y + 148, s.codes, w - 56);
    const listY = y + 148 + c.height + 56;
    return `<g class="fade" style="animation-delay:${i * 0.15}s">${card(x, y, w, h)}
${t(px, y + 44, s.idx, 'k')}${t(px, y + 90, s.name, 'h')}${t(px, y + 118, s.sub, 'd')}
${c.svg}
${t(px, listY - 26, 'CORE TOOLCHAIN', 'k')}
${s.tools.map((tool, j) => bullet(px, listY + 8 + j * 34, tool)).join('')}
${statusBar(px, y + h - 70, w - 56, s.status, i * 0.4)}</g>`;
  }).join('\n');
  return frame({
    title: 'Technology Universe — hammadxcm',
    desc: 'Animated overview of the frontend, backend, data and cloud technologies Hammad Khan works with.',
    cmd: './stack --map',
    heading: 'TECHNOLOGY UNIVERSE',
    sub: 'Full-stack systems across interface, logic, data and infrastructure',
    status: 'ALL SYSTEMS ONLINE',
    ticker: live.languages?.length
      ? `LANGUAGE MIX // ${live.languages.map((l) => `${l.name.toUpperCase()} ${l.pct}%`).join(' // ')}`
      : 'RUBY // RAILS // TYPESCRIPT // REACT // NEXT.JS // POSTGRES // AWS',
    body,
  });
}

// ---------------------------------------------------------------------------
// Panel 2: System Architecture
// ---------------------------------------------------------------------------

const LAYERS = [
  {
    idx: '01 / EXPERIENCE',
    name: 'CLIENT',
    sub: 'UI • CLIENT RUNTIME',
    codes: ['REACT', 'NEXT', 'VUE'],
    items: ['React / Next.js / Vue', 'Progressive Web Apps', 'Progressive loading'],
  },
  {
    idx: '02 / GATEWAY',
    name: 'API',
    sub: 'EDGE • AUTH • CONTRACTS',
    codes: ['REST', 'GQL', 'HOOKS'],
    items: ['REST / GraphQL APIs', 'Auth / RBAC / Audit', 'Payments & CRM APIs'],
  },
  {
    idx: '03 / COMPUTE',
    name: 'SERVICES',
    sub: 'WORKERS • EVENTS • QUEUES',
    codes: ['RAILS', 'NEST', 'MQ'],
    items: ['Microservices / DDD', 'Event-driven workers', 'Sidekiq / BullMQ jobs'],
  },
  {
    idx: '04 / PERSISTENCE',
    name: 'DATA',
    sub: 'STORAGE • CACHE • MODEL',
    codes: ['PG', 'MONGO', 'REDIS'],
    items: ['Dual-DB org scoping', 'Redis caching', 'CSV import pipelines'],
  },
  {
    idx: '05 / PLATFORM',
    name: 'INFRA',
    sub: 'CLOUD • CONTAINERS • CI',
    codes: ['AWS', 'AZ', 'K8S'],
    items: ['AWS / Azure', 'Docker / Kubernetes', 'CI / CD automation'],
  },
];

const IMPACT = [
  { v: '99.9%', label: 'UPTIME', detail: 'Zero-downtime Stripe migration' },
  { v: '95%', label: 'JOB SUCCESS', detail: 'Real-time data pipelines' },
  { v: '-70%', label: 'PAGE LOAD', detail: 'Progressive loading system' },
  { v: '115+', label: 'MERGE REQUESTS', detail: 'Shipped in 5 months @ NexaQuanta' },
];

export function renderArchitecture() {
  const gap = 48;
  const w = (INNER - gap * 4) / 5;
  const y = 224;
  const h = 420;
  const busY = 676;
  const layers = LAYERS.map((l, i) => {
    const x = X0 + i * (w + gap);
    const px = x + 24;
    const link =
      i < LAYERS.length - 1
        ? `<line x1="${x + w + 4}" y1="${y + 100}" x2="${x + w + gap - 10}" y2="${y + 100}" stroke="${C.accent}" stroke-width="2" class="flow"/><path d="M${x + w + gap - 12} ${y + 94}l8 6-8 6" fill="none" stroke="${C.accent}" stroke-width="2"/>`
        : '';
    return `<g class="fade" style="animation-delay:${i * 0.15}s">${card(x, y, w, h)}
${t(px, y + 40, l.idx, 'k')}${t(px, y + 86, l.name, 'h')}${t(px, y + 112, l.sub, 'd')}
${chips(px, y + 140, l.codes, w - 48).svg}
${l.items.map((it, j) => bullet(px, y + 236 + j * 36, it, 'd')).join('')}
${statusBar(px, y + h - 58, w - 48, 'THROUGHPUT', i * 0.3)}</g>
${link}
<line x1="${x + w / 2}" y1="${y + h}" x2="${x + w / 2}" y2="${busY}" stroke="${C.accent}" stroke-opacity=".5" class="flow"/>`;
  }).join('\n');

  const packets = [0, 1.4, 2.8]
    .map(
      (d) =>
        `<circle cx="${X0}" cy="${busY}" r="5" fill="${C.bright}" class="scan" style="animation-delay:${d}s;animation-duration:4.2s"/>`,
    )
    .join('');
  const bus = `<line x1="${X0}" y1="${busY}" x2="${W - X0}" y2="${busY}" stroke="${C.line}" stroke-width="3"/>${packets}`;

  const mw = (INNER - 16 * 3) / 4;
  const impact = IMPACT.map((m, i) => {
    const x = X0 + i * (mw + 16);
    return `<g class="fade" style="animation-delay:${0.8 + i * 0.15}s">${card(x, 700, mw, 128)}
${t(x + 24, 756, m.v, 'v')}${t(x + 40 + textW(m.v, 40), 756, m.label, 'k')}
${t(x + 24, 796, m.detail, 'd')}</g>`;
  }).join('\n');

  return frame({
    title: 'System Architecture — hammadxcm',
    desc: 'Animated five-layer architecture diagram of the systems Hammad Khan designs, with real delivery metrics.',
    cmd: './architecture --trace',
    heading: 'SYSTEM ARCHITECTURE',
    sub: 'Client → API → Services → Data → Platform, with the numbers from production',
    status: 'REQUEST FLOW SYNCED',
    ticker: 'MICROSERVICES // EVENT-DRIVEN // DDD // FAULT TOLERANT // ZERO DOWNTIME',
    body: `${layers}\n${bus}\n${impact}`,
  });
}

// ---------------------------------------------------------------------------
// Panel 3: AI Engineering
// ---------------------------------------------------------------------------

const AI = [
  {
    idx: '01 / COMPUTER-USE AGENTS',
    name: 'MCP SERVERS',
    sub: 'daemon-os · Swift · macOS',
    items: [
      'MCP server giving AI agents eyes & hands',
      'Screen, input and app control on macOS',
      'Native Swift for low-latency tool calls',
    ],
    codes: ['MCP', 'SWIFT', 'MACOS'],
  },
  {
    idx: '02 / LLM APPLICATIONS',
    name: 'EDGE AI CHAT',
    sub: 'portfolio-chat · Cloudflare Workers AI',
    items: [
      'Llama 3.3 70B assistant served at the edge',
      'Grounded system prompt from my profile',
      'Input sanitization & origin allow-listing',
    ],
    codes: ['WORKERS AI', 'LLAMA 3.3', 'TS'],
  },
  {
    idx: '03 / AUTOMATION',
    name: 'AI AGENTS',
    sub: 'n8n · workflows · integrations',
    items: [
      'n8n AI agents and workflow automation',
      'Certified: Build AI Agents & Workflows',
      'Multi-API platforms & CRM integrations',
    ],
    codes: ['N8N', 'AGENTS', 'WEBHOOKS'],
  },
  {
    idx: '04 / AI-ASSISTED ENGINEERING',
    name: 'AI TOOLCHAIN',
    sub: 'Claude · Copilot · ChatGPT · Midjourney',
    items: [
      'Claude & Copilot in the daily dev loop',
      'Automated reviews, tests and refactors',
      'Prompt engineering for dev workflows',
    ],
    codes: ['CLAUDE', 'COPILOT', 'CHATGPT'],
  },
];

/** @param {{ daemon?: {stars:number, pushed:string} }} [live] */
export function renderAI(live = {}) {
  const w = 500;
  const h = 290;
  const cx = W / 2;
  const cy = 530;
  const pos = [
    [X0, 224],
    [W - X0 - w, 224],
    [X0, 534],
    [W - X0 - w, 534],
  ];
  const cards = AI.map((a, i) => {
    const [x, y] = pos[i];
    const d = i === 0 ? live.daemon : null;
    const codes = d ? [...a.codes, `★ ${d.stars}`] : a.codes;
    const sub = d ? `${a.sub} · pushed ${d.pushed}` : a.sub;
    const px = x + 28;
    const edgeX = x < cx ? x + w : x;
    return `<line x1="${edgeX}" y1="${y + h / 2}" x2="${cx + (x < cx ? -150 : 150)}" y2="${cy}" stroke="${C.accent}" stroke-opacity=".6" class="flow"/>
<g class="fade" style="animation-delay:${i * 0.15}s">${card(x, y, w, h)}
${t(px, y + 40, a.idx, 'k')}${t(px, y + 84, a.name, 'h')}${t(px, y + 110, sub, 'd')}
${a.items.map((it, j) => bullet(px, y + 150 + j * 32, it)).join('')}
${chips(px, y + h - 50, codes, w - 56).svg}</g>`;
  }).join('\n');

  const orbit = [0, 1, 2, 3];
  const core = `<g>
<circle cx="${cx}" cy="${cy}" r="150" fill="${C.bg}" stroke="${C.line}"/>
<circle cx="${cx}" cy="${cy}" r="128" fill="none" stroke="${C.accent}" stroke-opacity=".5" stroke-dasharray="4 10" class="spin"/>
<circle cx="${cx}" cy="${cy}" r="96" fill="none" stroke="${C.bright}" stroke-opacity=".35" stroke-dasharray="40 16" class="rspin"/>
<circle cx="${cx}" cy="${cy}" r="62" fill="${C.accent}" fill-opacity=".12" stroke="${C.accent}" class="pulse"/>
<g class="spin">${orbit.map((_, i) => {
    const a = (i * Math.PI) / 2 - Math.PI / 4;
    const ox = cx + Math.cos(a) * 128;
    const oy = cy + Math.sin(a) * 128;
    return `<circle cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="6" fill="${C.bright}"/>`;
  }).join('')}</g>
${t(cx, cy - 4, 'AI_CORE', 'k', ' text-anchor="middle"')}
${t(cx, cy + 20, 'ACTIVE', 'd', ' text-anchor="middle"')}
</g>`;

  return frame({
    title: 'AI Engineering — hammadxcm',
    desc: 'Animated panel of Hammad Khan’s AI work: an MCP server for computer-use agents, an edge LLM chat assistant, n8n agent automation and AI-assisted engineering.',
    cmd: './ai --status',
    heading: 'AI ENGINEERING',
    sub: 'Agents, LLM apps and automation — shipped, not just prompted',
    status: 'INFERENCE READY',
    ticker: 'MCP // LLAMA 3.3 // WORKERS AI // N8N AGENTS // CLAUDE // COPILOT',
    body: `${cards}\n${core}`,
  });
}

// ---------------------------------------------------------------------------
// Panel 4: Engineering Philosophy
// ---------------------------------------------------------------------------

const SIGNALS = [
  { name: 'OBSERVABILITY', detail: 'Structured logs • job telemetry' },
  { name: 'RELIABILITY', detail: 'Retries • idempotency • failover' },
  { name: 'SECURITY', detail: 'OWASP Top 10 • audit trails • HIPAA' },
  { name: 'QUALITY', detail: 'Review standards • tests • CI gates' },
];

const PRINCIPLES = [
  { name: 'CLARITY', body: 'Boring, explicit code outlives clever code.', tag: 'SIMPLE & EXPLICIT' },
  {
    name: 'SCALE',
    body: 'Start with a monolith; split when the seams are real.',
    tag: 'SCALE WITH INTENT',
  },
  {
    name: 'SECURITY',
    body: 'Audit trails and least privilege by default.',
    tag: 'DEFENSE IN DEPTH',
  },
  { name: 'PERFORMANCE', body: 'Measure first, then make it fast.', tag: 'FAST BY DESIGN' },
  { name: 'AUTOMATION', body: 'If it runs twice, script it.', tag: 'AUTOMATE THE REPEATABLE' },
];

/** Decorative wave used when a signal has no live series. */
const wave = (seed) =>
  Array.from({ length: 12 }, (_, i) => Math.sin(i * 1.3 + seed) + Math.sin(i * 0.7 + seed * 2));

function sparkline(x, y, w, h, values) {
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const pts = values
    .map((v, i) => {
      const px = x + (i * w) / (values.length - 1);
      return `${px.toFixed(1)},${(y + h - ((v - min) / span) * h).toFixed(1)}`;
    })
    .join(' ');
  return `<polyline points="${pts}" fill="none" stroke="${C.accent}" stroke-width="2.5" stroke-linejoin="round" class="draw"/>`;
}

/**
 * @param {{ signals?: Record<string, {value:string, detail:string, series:number[]}> }} [live]
 *   Keyed by SIGNALS name; a missing key keeps the static detail and decorative wave.
 */
export function renderPhilosophy(live = {}) {
  const sw = (INNER - 16 * 3) / 4;
  const signals = SIGNALS.map((s, i) => {
    const x = X0 + i * (sw + 16);
    const l = live.signals?.[s.name];
    const series = l?.series?.length > 1 ? l.series : wave(i + 1);
    return `<g class="fade" style="animation-delay:${i * 0.12}s">${card(x, 224, sw, 180)}
${t(x + 24, 262, s.name, 'k')}${l ? t(x + sw - 24, 262, l.value, 'chip', ' text-anchor="end"') : ''}
${t(x + 24, 290, l?.detail ?? s.detail, 'd')}
${sparkline(x + 24, 312, sw - 48, 64, series)}</g>`;
  }).join('\n');

  const pw = (INNER - 16 * 4) / 5;
  const principles = PRINCIPLES.map((p, i) => {
    const x = X0 + i * (pw + 16);
    const lines = wrap(p.body, Math.floor((pw - 48) / 10.2));
    return `<g class="fade" style="animation-delay:${0.5 + i * 0.12}s">${card(x, 428, pw, 412)}
<text x="${x + 24}" y="${508}" style="font-size:64px;font-weight:700;fill:${C.accent};fill-opacity:.25">0${i + 1}</text>
${t(x + 24, 560, p.name, 'h')}
${lines.map((l, j) => `<text x="${x + 24}" y="${606 + j * 28}" style="font-size:17px">${esc(l)}</text>`).join('')}
<line x1="${x + 24}" y1="${780}" x2="${x + pw - 24}" y2="${780}" stroke="${C.line}"/>
${t(x + 24, 810, p.tag, 'k', ' style="font-size:12px"')}</g>`;
  }).join('\n');

  return frame({
    title: 'Engineering Philosophy — hammadxcm',
    desc: 'Animated panel of Hammad Khan’s engineering signals and five principles: clarity, scale, security, performance and automation.',
    cmd: './principles --list',
    heading: 'ENGINEERING PHILOSOPHY',
    sub: 'Measure, secure, simplify — principles for systems that last',
    status: 'SYSTEM NOMINAL',
    ticker: 'OBSERVABILITY // RELIABILITY // SECURITY // PERFORMANCE // AUTOMATION',
    body: `${signals}\n${principles}`,
  });
}

// ---------------------------------------------------------------------------
// Panel 5: Contribution Telemetry (live data)
// ---------------------------------------------------------------------------

/**
 * Open-source summary from src/data/contributions.json and src/data/projects.json.
 * @returns {{ merged:number, upstream:number, topUpstream:string[], downloads:number,
 *             topProject:{name:string, stars:number}|null }}
 */
export function summarizeOSS(contributions = [], repos = []) {
  const merged = contributions.filter((c) => c.state === 'merged');
  const upstream = new Map();
  for (const c of merged) upstream.set(c.repo.fullName, c.repo.stars ?? 0);
  const topUpstream = [...upstream].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([n]) => n);
  const topProject = repos.reduce((best, r) => (!best || r.stars > best.stars ? r : best), null);
  return {
    merged: merged.length,
    upstream: upstream.size,
    topUpstream,
    downloads: repos.reduce((s, r) => s + (r.downloads || 0), 0),
    topProject: topProject && { name: topProject.name, stars: topProject.stars },
  };
}

/** Counts of ISO dates per calendar month for the `n` months ending at `now`, oldest first. */
export function monthlyCounts(dates, now = new Date(), n = 12) {
  const key = (d) => d.getUTCFullYear() * 12 + d.getUTCMonth();
  const end = key(now);
  const out = Array(n).fill(0);
  for (const iso of dates) {
    const i = n - 1 - (end - key(new Date(iso)));
    if (i >= 0 && i < n) out[i]++;
  }
  return out;
}

/** Weekly contribution totals for the last `n` weeks. */
export const weeklyTotals = (weeks, n = 12) =>
  weeks.slice(-n).map((w) => w.contributionDays.reduce((s, d) => s + d.count, 0));

/** Consecutive days with contributions, ending today (or yesterday if today is still empty). */
export function currentStreak(days) {
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--;
  let n = 0;
  while (i >= 0 && days[i].count > 0) {
    n++;
    i--;
  }
  return n;
}

const fmt = (n) => Number(n).toLocaleString('en-US');

/**
 * @param {{ weeks: {contributionDays:{date:string,count:number,level:number}[]}[],
 *           stats: {followers:number, stars:number, repos:number, since:string},
 *           updated: string, oss?: ReturnType<typeof summarizeOSS> }} data
 */
export function renderTelemetry({ weeks, stats, updated, oss = summarizeOSS() }) {
  const days = weeks.flatMap((w) => w.contributionDays);
  const total = days.reduce((s, d) => s + d.count, 0);
  const streak = currentStreak(days);
  const cell = 22;
  const step = 28;
  const gx = X0 + (INNER - weeks.length * step + (step - cell)) / 2;
  const gy = 256;

  let lastMonth = -1;
  const months = [];
  const cells = weeks
    .map((w, wi) => {
      const first = new Date(`${w.contributionDays[0].date}T00:00:00Z`);
      if (first.getUTCMonth() !== lastMonth && wi < weeks.length - 2) {
        lastMonth = first.getUTCMonth();
        months.push(
          t(gx + wi * step, gy - 14, first.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase(), 'd', ' style="font-size:12px"'),
        );
      }
      return w.contributionDays
        .map((d) => {
          const row = new Date(`${d.date}T00:00:00Z`).getUTCDay();
          return `<rect x="${gx + wi * step}" y="${gy + row * step}" width="${cell}" height="${cell}" rx="4" fill="${LEVELS[d.level] ?? LEVELS[0]}" class="fade" style="animation-delay:${(wi * 0.03).toFixed(2)}s"><title>${d.date}: ${d.count}</title></rect>`;
        })
        .join('');
    })
    .join('');

  const legendX = W - X0 - 5 * 28 - 90;
  const legend = `${t(legendX - 12, gy + 7 * step + 30, 'LESS', 'd', ' text-anchor="end" style="font-size:12px"')}${LEVELS.map((c, i) => `<rect x="${legendX + i * 28}" y="${gy + 7 * step + 14}" width="22" height="22" rx="4" fill="${c}"/>`).join('')}${t(legendX + 5 * 28 + 4, gy + 7 * step + 30, 'MORE', 'd', ' style="font-size:12px"')}`;

  const tiles = [
    { v: fmt(total), label: 'CONTRIBUTIONS', detail: 'last 12 months' },
    // A streak spanning the whole fetched window may be longer than the data shows.
    { v: `${streak}d${streak >= days.length - 1 ? '+' : ''}`, label: 'CURRENT STREAK', detail: 'consecutive days' },
    { v: fmt(stats.stars), label: 'STARS', detail: 'across own repos' },
    { v: fmt(stats.followers), label: 'FOLLOWERS', detail: 'on GitHub' },
    { v: fmt(stats.repos), label: 'REPOSITORIES', detail: 'public' },
  ];
  const tw = (INNER - 16 * 4) / 5;
  const statRow = tiles
    .map((s, i) => {
      const x = X0 + i * (tw + 16);
      return `<g class="fade" style="animation-delay:${0.6 + i * 0.1}s">${card(x, 540, tw, 136)}
${t(x + 24, 578, s.label, 'k')}${t(x + 24, 628, s.v, 'v')}${t(x + 24, 656, s.detail, 'd')}</g>`;
    })
    .join('\n');

  const ossTiles = [
    { label: 'MERGED UPSTREAM PRS', v: fmt(oss.merged), detail: 'to open-source projects' },
    {
      label: 'UPSTREAM PROJECTS',
      v: fmt(oss.upstream),
      detail: oss.topUpstream.join(' · ') || 'open source',
    },
    { label: 'PACKAGE DOWNLOADS', v: fmt(oss.downloads), detail: 'npm + RubyGems' },
    {
      label: 'TOP PROJECT',
      v: oss.topProject ? `★ ${fmt(oss.topProject.stars)}` : '-',
      detail: oss.topProject?.name ?? '',
    },
  ];
  const fw = (INNER - 16 * 3) / 4;
  const ossRow = ossTiles
    .map((f, i) => {
      const x = X0 + i * (fw + 16);
      return `<g class="fade" style="animation-delay:${1.1 + i * 0.1}s">${card(x, 700, fw, 146)}
<circle cx="${x + 32}" cy="${734}" r="6" fill="${C.bright}" class="pulse" style="animation-delay:${i * 0.4}s"/>
${t(x + 50, 739, f.label, 'k')}${t(x + 24, 792, f.v, 'v')}${t(x + 24, 824, f.detail, 'd')}</g>`;
    })
    .join('\n');

  return frame({
    title: 'Contribution Telemetry — hammadxcm',
    desc: `Live GitHub telemetry for ${USERNAME}: ${fmt(total)} contributions in the last 12 months, ${fmt(stats.stars)} stars, ${fmt(stats.followers)} followers, ${fmt(stats.repos)} public repositories.`,
    cmd: './telemetry --live',
    heading: 'CONTRIBUTION TELEMETRY',
    sub: `Live from the GitHub API · on GitHub since ${stats.since} · updated ${updated}`,
    status: 'STREAM LIVE',
    ticker: `${fmt(total)} CONTRIBUTIONS // ${fmt(oss.merged)} MERGED OSS PRS // ${fmt(oss.downloads)} DOWNLOADS`,
    body: `${months.join('')}${cells}\n${legend}\n${statRow}\n${ossRow}`,
  });
}

// ---------------------------------------------------------------------------

const readJSON = (path) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null);

/** Everything the panels need from the GitHub REST API. */
async function fetchLive() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
  const get = createFetchWithRetry(createGitHubHeaders(token, 'generate-universe'));
  const user = await get(`https://api.github.com/users/${USERNAME}`);
  const repos = [];
  for (let page = 1; ; page++) {
    const batch = await get(
      `https://api.github.com/users/${USERNAME}/repos?per_page=100&type=owner&page=${page}`,
    );
    repos.push(...batch.filter((r) => !r.fork));
    if (batch.length < 100) break;
  }

  const langCount = {};
  for (const r of repos) if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
  const langTotal = Object.values(langCount).reduce((a, b) => a + b, 0);
  const languages = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, n]) => ({ name, pct: Math.round((n / langTotal) * 100) }));

  const daemonRepo = repos.find((r) => r.name === 'daemon-os');

  // ponytail: CI health = this profile repo's last 100 completed runs; add other repos if wanted
  const { workflow_runs: runs = [] } = await get(
    `https://api.github.com/repos/${USERNAME}/${USERNAME}/actions/runs?status=completed&per_page=100`,
  );
  const outcomes = runs
    .filter((r) => r.conclusion === 'success' || r.conclusion === 'failure')
    .map((r) => (r.conclusion === 'success' ? 1 : 0))
    .reverse();
  const ciSeries = [];
  for (let i = 0; i + 10 <= outcomes.length; i += 10) {
    ciSeries.push(outcomes.slice(i, i + 10).reduce((a, b) => a + b, 0) * 10);
  }

  return {
    stats: {
      followers: user.followers,
      stars: repos.reduce((s, r) => s + r.stargazers_count, 0),
      repos: user.public_repos,
      since: user.created_at.slice(0, 4),
    },
    languages,
    daemon: daemonRepo && {
      stars: daemonRepo.stargazers_count,
      pushed: daemonRepo.pushed_at.slice(0, 10),
    },
    ci: outcomes.length
      ? {
          rate: Math.round((outcomes.reduce((a, b) => a + b, 0) / outcomes.length) * 100),
          runs: outcomes.length,
          series: ciSeries,
        }
      : null,
  };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const write = (name, svg) => {
    writeFileSync(join(OUT_DIR, name), svg);
    console.log(`Wrote assets/universe/${name}`);
  };
  write('system-architecture.svg', renderArchitecture());

  // On API failure keep the previous live panels rather than regress them to static fallbacks.
  let live;
  try {
    live = await fetchLive();
  } catch (err) {
    console.warn(`GitHub API failed (${err.message}); keeping existing live panels`);
    return;
  }

  const graph = readJSON(GRAPH_PATH);
  const weeks = graph?.weeks ?? [];
  const contributions = readJSON(CONTRIB_PATH)?.contributions ?? [];
  const projects = readJSON(PROJECTS_PATH)?.repos ?? [];
  const oss = summarizeOSS(contributions, projects);
  const mergedDates = contributions.filter((c) => c.state === 'merged').map((c) => c.mergedAt);
  const thisWeek = weeklyTotals(weeks, 1)[0] ?? 0;

  const signals = {
    QUALITY: {
      value: `${oss.merged} MERGED`,
      detail: 'Upstream PRs merged · last 12 months',
      series: monthlyCounts(mergedDates),
    },
  };
  if (weeks.length) {
    signals.OBSERVABILITY = {
      value: `${fmt(thisWeek)} THIS WK`,
      detail: 'Weekly contributions · last 12 weeks',
      series: weeklyTotals(weeks),
    };
  }
  if (live.ci) {
    signals.RELIABILITY = {
      value: `${live.ci.rate}% PASS`,
      detail: `CI runs · last ${live.ci.runs} completed`,
      series: live.ci.series,
    };
  }

  write('tech-universe.svg', renderTechUniverse(live));
  write('ai-engineering.svg', renderAI(live));
  write('engineering-philosophy.svg', renderPhilosophy({ signals }));

  if (!weeks.length) {
    console.warn('No contribution graph data; keeping existing telemetry.svg');
    return;
  }
  const updated = new Date().toISOString().slice(0, 10);
  write('telemetry.svg', renderTelemetry({ weeks, stats: live.stats, updated, oss }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
