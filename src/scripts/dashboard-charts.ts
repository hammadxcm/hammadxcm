/**
 * Chart.js initialization for analytics dashboard.
 * Theme-aware, DRY, scroll-triggered, reduced-motion-respecting.
 */
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { prefersReducedMotion } from './state';

Chart.register(
  DoughnutController,
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
);

// ── Shared constants ──
const MONO_FONT = 'Fira Code, ui-monospace, monospace';
const ANIMATION_DURATION = prefersReducedMotion ? 0 : 600;
const DOUGHNUT_DURATION = prefersReducedMotion ? 0 : 800;

// ── Theme-aware color extraction ──
interface ThemeColors {
  accent: string;
  text: string;
  textDim: string;
  bgCard: string;
  gridLine: string;
  tooltipBg: string;
  merged: string;
  open: string;
  closed: string;
}

function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function themeColors(): ThemeColors {
  const accent = getCSSVar('--accent') || '#00bfbf';
  const accentGlow = getCSSVar('--accent-glow') || '0,191,191';
  const text = getCSSVar('--text') || '#e6edf3';
  const textDim = getCSSVar('--text-dim') || '#8b949e';
  const bgCard = getCSSVar('--bg-card-solid') || '#161b22';
  return {
    accent,
    text,
    textDim,
    bgCard,
    gridLine: `rgba(${accentGlow}, 0.08)`,
    tooltipBg: `rgba(${accentGlow}, 0.9)`,
    merged: accent,
    open: getCSSVar('--accent-mint') || '#3fb950',
    closed: textDim,
  };
}

function tooltipConfig(tc: ThemeColors) {
  return {
    backgroundColor: tc.tooltipBg,
    titleFont: { family: MONO_FONT, size: 12 },
    bodyFont: { family: MONO_FONT, size: 11 },
  };
}

function tickConfig(tc: ThemeColors, color?: string, size = 10) {
  return {
    color: color || tc.textDim,
    font: { family: MONO_FONT, size },
  };
}

// ── Language Doughnut ──
function initLanguageDoughnut(canvas: HTMLCanvasElement): Chart | null {
  const raw = canvas.dataset.chartLangs;
  if (!raw) return null;

  const langs: { name: string; color: string; count: number; pct: number }[] = JSON.parse(raw);
  if (!langs.length) return null;

  const tc = themeColors();

  return new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: langs.map((l) => l.name),
      datasets: [
        {
          data: langs.map((l) => l.count),
          backgroundColor: langs.map((l) => l.color),
          borderWidth: 0,
          hoverBorderWidth: 2,
          hoverBorderColor: tc.bgCard,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          ...tooltipConfig(tc),
          callbacks: {
            label: (ctx) => {
              const lang = langs[ctx.dataIndex];
              return ` ${lang.name}: ${lang.count} PRs (${lang.pct}%)`;
            },
          },
        },
      },
      animation: {
        animateRotate: true,
        duration: DOUGHNUT_DURATION,
      },
    },
  });
}

// ── Organization Horizontal Bar Chart ──
function initOrgBarChart(canvas: HTMLCanvasElement): Chart | null {
  const raw = canvas.dataset.chartOrgs;
  if (!raw) return null;

  const orgs: { name: string; count: number }[] = JSON.parse(raw);
  if (!orgs.length) return null;

  const tc = themeColors();

  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels: orgs.map((o) => o.name),
      datasets: [
        {
          data: orgs.map((o) => o.count),
          backgroundColor: tc.accent,
          borderRadius: 4,
          barPercentage: 0.7,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...tooltipConfig(tc),
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.x} PRs`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { ...tickConfig(tc), stepSize: 1 },
          grid: { color: tc.gridLine },
        },
        y: {
          ticks: tickConfig(tc, tc.text, 11),
          grid: { display: false },
        },
      },
      animation: { duration: ANIMATION_DURATION },
    },
  });
}

// ── Timeline Stacked Bar Chart ──
function initTimelineChart(canvas: HTMLCanvasElement): Chart | null {
  const raw = canvas.dataset.chartTimeline;
  if (!raw) return null;

  const entries: { month: string; merged: number; open: number; closed: number }[] =
    JSON.parse(raw);
  if (!entries.length) return null;

  const tc = themeColors();

  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels: entries.map((e) => e.month.slice(5)),
      datasets: [
        {
          label: 'Merged',
          data: entries.map((e) => e.merged),
          backgroundColor: tc.merged,
          borderRadius: 2,
        },
        {
          label: 'Open',
          data: entries.map((e) => e.open),
          backgroundColor: tc.open,
          borderRadius: 2,
        },
        {
          label: 'Closed',
          data: entries.map((e) => e.closed),
          backgroundColor: tc.closed,
          borderRadius: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            ...tickConfig(tc),
            boxWidth: 10,
            padding: 12,
          },
        },
        tooltip: tooltipConfig(tc),
      },
      scales: {
        x: {
          stacked: true,
          ticks: tickConfig(tc),
          grid: { display: false },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: { ...tickConfig(tc), stepSize: 1 },
          grid: { color: tc.gridLine },
        },
      },
      animation: { duration: ANIMATION_DURATION },
    },
  });
}

// ── Chart instance management ──
const chartInstances: Chart[] = [];

function destroyAll() {
  for (const chart of chartInstances) {
    chart.destroy();
  }
  chartInstances.length = 0;
}

function createChart(canvas: HTMLCanvasElement): Chart | null {
  if (canvas.dataset.chartLangs != null) return initLanguageDoughnut(canvas);
  if (canvas.dataset.chartOrgs != null) return initOrgBarChart(canvas);
  if (canvas.dataset.chartTimeline != null) return initTimelineChart(canvas);
  return null;
}

// ── Scroll-triggered initialization via IntersectionObserver ──
let activeObserver: IntersectionObserver | null = null;

function observeCanvases() {
  const canvases = document.querySelectorAll<HTMLCanvasElement>(
    '[data-chart-langs],[data-chart-orgs],[data-chart-timeline]',
  );
  if (!canvases.length) return;

  activeObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeObserver?.unobserve(entry.target);
          const chart = createChart(entry.target as HTMLCanvasElement);
          if (chart) chartInstances.push(chart);
        }
      }
    },
    { threshold: 0.1 },
  );

  for (const c of canvases) {
    activeObserver.observe(c);
  }
}

// ── Theme change: destroy + re-observe ──
function watchThemeChanges() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === 'data-theme') {
        destroyAll();
        if (activeObserver) {
          activeObserver.disconnect();
          activeObserver = null;
        }
        observeCanvases();
        break;
      }
    }
  });
  observer.observe(document.documentElement, { attributes: true });
}

export function initDashboardCharts() {
  observeCanvases();
  watchThemeChanges();
}
