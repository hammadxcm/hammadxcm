/**
 * ECharts initialization for analytics dashboard.
 * Theme-aware, tree-shaken, scroll-triggered, reduced-motion-respecting.
 *
 * Color strategy: All colors derived from CSS variables so charts adapt
 * to all 15 themes (14 dark + 1 light "arctic") automatically.
 */

import * as echarts from 'echarts';
import { prefersReducedMotion } from './state';

// ── Shared constants ──
const MONO_FONT = 'Fira Code, ui-monospace, monospace';
const ANIMATION_DURATION = prefersReducedMotion ? 0 : 600;
const DOUGHNUT_DURATION = prefersReducedMotion ? 0 : 800;

// ── Theme-aware color extraction ──
interface ThemeColors {
  accent: string;
  accentRgb: string;
  accentBlue: string;
  accentMint: string;
  accentTertiary: string;
  text: string;
  textDim: string;
  bg: string;
  bgCard: string;
  gridLine: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  merged: string;
  open: string;
  closed: string;
  isLight: boolean;
}

function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

let cachedThemeColors: ThemeColors | null = null;
let cachedThemeKey: string | null = null;

function themeColors(): ThemeColors {
  const themeKey = document.documentElement.getAttribute('data-theme') || 'hacker';
  if (cachedThemeColors && cachedThemeKey === themeKey) return cachedThemeColors;

  const isLight = themeKey === 'arctic';

  const accent = getCSSVar('--accent') || '#00bfbf';
  const accentRgb = getCSSVar('--accent-glow') || '0,191,191';
  const accentBlue = getCSSVar('--accent-blue') || '#5BCDEC';
  const accentMint = getCSSVar('--accent-mint') || '#A9FEF7';
  const accentTertiary = getCSSVar('--accent-tertiary') || '#9B59B6';
  const text = getCSSVar('--text') || '#e6edf3';
  const textDim = getCSSVar('--text-dim') || '#8b949e';
  const bg = getCSSVar('--bg') || '#0D1117';
  const bgCard = getCSSVar('--bg-card-solid') || '#161b22';

  cachedThemeKey = themeKey;
  cachedThemeColors = {
    accent,
    accentRgb,
    accentBlue,
    accentMint,
    accentTertiary,
    text,
    textDim,
    bg,
    bgCard,
    isLight,
    gridLine: `rgba(${accentRgb}, ${isLight ? '0.12' : '0.1'})`,
    tooltipBg: bgCard,
    tooltipBorder: `rgba(${accentRgb}, 0.3)`,
    tooltipText: text,
    merged: accent,
    open: accentMint,
    closed: accentBlue,
  };

  return cachedThemeColors;
}

/** Ensure a color has enough contrast against the chart background.
 *  For very dark lang colors on dark themes, lighten them. */
function ensureContrast(hex: string, bgHex: string): string {
  const lum = hexLuminance(hex);
  const bgLum = hexLuminance(bgHex);
  const ratio = (Math.max(lum, bgLum) + 0.05) / (Math.min(lum, bgLum) + 0.05);
  // If contrast ratio is too low, lighten the color
  if (ratio < 2.5) {
    return lightenHex(hex, 0.4);
  }
  return hex;
}

function hexLuminance(hex: string): number {
  const c = hex.replace('#', '');
  if (c.length < 6) return 0.5;
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const toLinear = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function lightenHex(hex: string, amount: number): string {
  const c = hex.replace('#', '');
  if (c.length < 6) return hex;
  const r = Math.min(255, Math.round(parseInt(c.slice(0, 2), 16) + 255 * amount));
  const g = Math.min(255, Math.round(parseInt(c.slice(2, 4), 16) + 255 * amount));
  const b = Math.min(255, Math.round(parseInt(c.slice(4, 6), 16) + 255 * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function adjustAlpha(hex: string, alpha: number): string {
  const c = hex.replace('#', '');
  if (c.length < 6) return hex;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ── Shared tooltip config ──
function tooltipStyle(tc: ThemeColors) {
  return {
    backgroundColor: tc.tooltipBg,
    borderColor: tc.tooltipBorder,
    borderWidth: 1,
    textStyle: {
      fontFamily: MONO_FONT,
      fontSize: 11,
      color: tc.tooltipText,
    },
    extraCssText: `box-shadow: 0 4px 16px rgba(${tc.accentRgb}, 0.15); border-radius: 6px;`,
  };
}

// ── Language Doughnut ──
function initLanguageDoughnut(container: HTMLElement): echarts.ECharts | null {
  const raw = container.dataset.chartLangs;
  if (!raw) return null;

  const langs: { name: string; color: string; count: number; pct: number }[] = JSON.parse(raw);
  if (!langs.length) return null;

  const tc = themeColors();
  const totalPRs = langs.reduce((s, l) => s + l.count, 0);
  const chart = echarts.init(container, undefined, { renderer: 'svg' });

  chart.setOption({
    animation: !prefersReducedMotion,
    animationDuration: DOUGHNUT_DURATION,
    animationEasing: 'cubicOut',
    tooltip: {
      trigger: 'item',
      ...tooltipStyle(tc),
      formatter: (p: Record<string, unknown>) => {
        const lang = langs[p.dataIndex as number];
        return `<b style="color:${tc.accent}">${lang.name}</b><br/>${lang.count} PRs (${lang.pct}%)`;
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['60%', '90%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderWidth: 2,
          borderColor: tc.bgCard,
          borderRadius: 4,
        },
        label: {
          show: true,
          position: 'center',
          formatter: () => `${totalPRs}`,
          fontSize: 20,
          fontWeight: 700,
          fontFamily: MONO_FONT,
          color: tc.accent,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: `rgba(${tc.accentRgb}, 0.5)`,
          },
          scaleSize: 6,
        },
        data: langs.map((l) => {
          const safeColor = ensureContrast(l.color, tc.bgCard);
          return {
            value: l.count,
            name: l.name,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                { offset: 0, color: safeColor },
                { offset: 1, color: adjustAlpha(safeColor, 0.7) },
              ]),
            },
          };
        }),
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: () => (prefersReducedMotion ? 0 : Math.random() * 200),
      },
    ],
  });

  return chart;
}

// ── Organization Horizontal Bar Chart ──
function initOrgBarChart(container: HTMLElement): echarts.ECharts | null {
  const raw = container.dataset.chartOrgs;
  if (!raw) return null;

  const orgs: { name: string; count: number }[] = JSON.parse(raw);
  if (!orgs.length) return null;

  const tc = themeColors();
  const chart = echarts.init(container, undefined, { renderer: 'svg' });

  // Reverse for horizontal bar (bottom-to-top)
  const reversed = [...orgs].reverse();

  chart.setOption({
    animation: !prefersReducedMotion,
    animationDuration: ANIMATION_DURATION,
    animationEasing: 'cubicOut',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      ...tooltipStyle(tc),
      formatter: (params: Record<string, unknown>[]) => {
        const p = params[0];
        return `<b style="color:${tc.accent}">${(p as Record<string, unknown>).name}</b><br/>${(p as Record<string, unknown>).value} PRs`;
      },
    },
    grid: {
      left: 8,
      right: 24,
      top: 8,
      bottom: 8,
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: tc.gridLine } },
      axisLabel: {
        fontFamily: MONO_FONT,
        fontSize: 10,
        color: tc.textDim,
      },
      minInterval: 1,
    },
    yAxis: {
      type: 'category',
      data: reversed.map((o) => o.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        fontFamily: MONO_FONT,
        fontSize: 11,
        color: tc.text,
      },
    },
    series: [
      {
        type: 'bar',
        data: reversed.map((o) => ({
          value: o.count,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: tc.accent },
              { offset: 1, color: `rgba(${tc.accentRgb}, 0.4)` },
            ]),
            borderRadius: [0, 4, 4, 0],
            shadowBlur: 6,
            shadowColor: `rgba(${tc.accentRgb}, 0.12)`,
          },
        })),
        barWidth: '60%',
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: tc.accent },
              { offset: 1, color: `rgba(${tc.accentRgb}, 0.7)` },
            ]),
            shadowBlur: 16,
            shadowColor: `rgba(${tc.accentRgb}, 0.35)`,
          },
        },
        animationDelay: (idx: number) => (prefersReducedMotion ? 0 : idx * 80),
      },
    ],
  });

  return chart;
}

// ── Timeline Stacked Bar Chart ──
function initTimelineChart(container: HTMLElement): echarts.ECharts | null {
  const raw = container.dataset.chartTimeline;
  if (!raw) return null;

  const entries: { month: string; merged: number; open: number; closed: number }[] =
    JSON.parse(raw);
  if (!entries.length) return null;

  const tc = themeColors();
  const chart = echarts.init(container, undefined, { renderer: 'svg' });

  chart.setOption({
    animation: !prefersReducedMotion,
    animationDuration: ANIMATION_DURATION,
    animationEasing: 'cubicOut',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      ...tooltipStyle(tc),
    },
    legend: {
      bottom: 0,
      textStyle: { fontFamily: MONO_FONT, fontSize: 10, color: tc.text },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 16,
      inactiveColor: tc.textDim,
    },
    grid: {
      left: 8,
      right: 8,
      top: 8,
      bottom: 36,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: entries.map((e) => e.month.slice(5)),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        fontFamily: MONO_FONT,
        fontSize: 10,
        color: tc.textDim,
      },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: tc.gridLine } },
      axisLabel: {
        fontFamily: MONO_FONT,
        fontSize: 10,
        color: tc.textDim,
      },
      minInterval: 1,
    },
    series: [
      {
        name: 'Merged',
        type: 'bar',
        stack: 'total',
        data: entries.map((e) => e.merged),
        itemStyle: {
          color: tc.merged,
          borderRadius: [0, 0, 0, 0],
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: `rgba(${tc.accentRgb}, 0.3)`,
          },
        },
      },
      {
        name: 'Open',
        type: 'bar',
        stack: 'total',
        data: entries.map((e) => e.open),
        itemStyle: {
          color: tc.open,
        },
      },
      {
        name: 'Closed',
        type: 'bar',
        stack: 'total',
        data: entries.map((e) => e.closed),
        itemStyle: {
          color: tc.closed,
          borderRadius: [2, 2, 0, 0],
        },
      },
    ],
  });

  return chart;
}

// ── Chart instance management ──
const chartInstances: echarts.ECharts[] = [];

function destroyAll() {
  for (const chart of chartInstances) {
    chart.dispose();
  }
  chartInstances.length = 0;
  cachedThemeColors = null;
  cachedThemeKey = null;
}

function createChart(container: HTMLElement): echarts.ECharts | null {
  if (container.dataset.chartLangs != null) return initLanguageDoughnut(container);
  if (container.dataset.chartOrgs != null) return initOrgBarChart(container);
  if (container.dataset.chartTimeline != null) return initTimelineChart(container);
  return null;
}

// ── Scroll-triggered initialization via IntersectionObserver ──
let activeObserver: IntersectionObserver | null = null;

function observeContainers() {
  const containers = document.querySelectorAll<HTMLElement>(
    '[data-chart-langs],[data-chart-orgs],[data-chart-timeline]',
  );
  if (!containers.length) return;

  activeObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeObserver?.unobserve(entry.target);
          const chart = createChart(entry.target as HTMLElement);
          if (chart) chartInstances.push(chart);
        }
      }
    },
    { threshold: 0.1 },
  );

  for (const c of containers) {
    activeObserver.observe(c);
  }
}

// ── Theme change: destroy + re-observe ──
let themeObserver: MutationObserver | null = null;

function watchThemeChanges() {
  themeObserver?.disconnect();
  themeObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === 'data-theme') {
        destroyAll();
        if (activeObserver) {
          activeObserver.disconnect();
          activeObserver = null;
        }
        observeContainers();
        break;
      }
    }
  });
  themeObserver.observe(document.documentElement, { attributes: true });
}

// ── Resize handling ──
let resizeObserver: ResizeObserver | null = null;

function watchResizes() {
  resizeObserver?.disconnect();
  resizeObserver = new ResizeObserver(() => {
    for (const chart of chartInstances) {
      chart.resize();
    }
  });

  const containers = document.querySelectorAll<HTMLElement>(
    '[data-chart-langs],[data-chart-orgs],[data-chart-timeline]',
  );
  for (const c of containers) {
    resizeObserver.observe(c);
  }
}

export function initDashboardCharts() {
  destroyAll();
  if (activeObserver) {
    activeObserver.disconnect();
    activeObserver = null;
  }

  observeContainers();
  watchThemeChanges();
  watchResizes();
}
