import { prefersReducedMotion } from '../state';

/* ── Constants ── */
const WEEKS = 52;
const DAYS = 7;
const TOTAL_CELLS = WEEKS * DAYS;
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

/* ── State ── */
let initialized = false;
let wrapperEl: HTMLElement | null = null;

/* ── Generate mock contribution data ── */
function generateData(): number[] {
  const data: number[] = [];
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const r = Math.random();
    if (r < 0.25) data.push(0);
    else if (r < 0.5) data.push(1);
    else if (r < 0.7) data.push(2);
    else if (r < 0.88) data.push(3);
    else data.push(4);
  }
  return data;
}

/* ── Get date string for a cell ── */
function getCellDate(weekIdx: number, dayIdx: number): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysAgo = (WEEKS - 1 - weekIdx) * 7 + (6 - dayIdx) + dayOfWeek;
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Build the DOM ── */
function buildGraph(target: HTMLElement): void {
  wrapperEl = document.createElement('div');
  wrapperEl.className = 'contrib-heatmap';

  // Header
  const header = document.createElement('div');
  header.className = 'contrib-heatmap-header';
  const title = document.createElement('span');
  title.className = 'contrib-heatmap-title';
  title.textContent = '365 days of code';
  header.appendChild(title);
  const count = document.createElement('span');
  count.className = 'contrib-heatmap-count';
  const data = generateData();
  const total = data.filter((d) => d > 0).length;
  count.textContent = `${total} contributions`;
  header.appendChild(count);
  wrapperEl.appendChild(header);

  // Graph area
  const graphArea = document.createElement('div');
  graphArea.className = 'contrib-heatmap-graph';

  // Day labels column
  const dayCol = document.createElement('div');
  dayCol.className = 'contrib-heatmap-days';
  for (const label of DAY_LABELS) {
    const span = document.createElement('span');
    span.textContent = label;
    dayCol.appendChild(span);
  }
  graphArea.appendChild(dayCol);

  // Grid container (months + cells)
  const gridWrap = document.createElement('div');
  gridWrap.className = 'contrib-heatmap-grid-wrap';

  // Month labels
  const monthRow = document.createElement('div');
  monthRow.className = 'contrib-heatmap-months';
  const weeksPerMonth = Math.ceil(WEEKS / 12);
  for (const m of MONTH_LABELS) {
    const span = document.createElement('span');
    span.style.width = `${weeksPerMonth * 13}px`;
    span.textContent = m;
    monthRow.appendChild(span);
  }
  gridWrap.appendChild(monthRow);

  // Cell grid
  const grid = document.createElement('div');
  grid.className = 'contrib-heatmap-grid';

  const levelClasses = [
    'contrib-level-0',
    'contrib-level-1',
    'contrib-level-2',
    'contrib-level-3',
    'contrib-level-4',
  ];
  const levelLabels = [
    'No contributions',
    '1-3 contributions',
    '4-6 contributions',
    '7-9 contributions',
    '10+ contributions',
  ];

  for (let w = 0; w < WEEKS; w++) {
    const col = document.createElement('div');
    col.className = 'contrib-heatmap-col';
    for (let d = 0; d < DAYS; d++) {
      const cell = document.createElement('div');
      const level = data[w * DAYS + d];
      cell.className = `contrib-heatmap-cell ${levelClasses[level]}`;
      cell.setAttribute('data-date', getCellDate(w, d));
      cell.setAttribute('data-level', String(level));
      cell.title = `${levelLabels[level]} on ${getCellDate(w, d)}`;
      col.appendChild(cell);
    }
    grid.appendChild(col);
  }

  gridWrap.appendChild(grid);
  graphArea.appendChild(gridWrap);
  wrapperEl.appendChild(graphArea);

  // Legend
  const legend = document.createElement('div');
  legend.className = 'contrib-heatmap-legend';
  const lessSpan = document.createElement('span');
  lessSpan.textContent = 'Less';
  legend.appendChild(lessSpan);
  for (const cls of levelClasses) {
    const cell = document.createElement('span');
    cell.className = `contrib-heatmap-cell ${cls}`;
    legend.appendChild(cell);
  }
  const moreSpan = document.createElement('span');
  moreSpan.textContent = 'More';
  legend.appendChild(moreSpan);
  wrapperEl.appendChild(legend);

  target.appendChild(wrapperEl);
}

/* ── Public API ── */
export function initContribution3d(): void {
  if (initialized) return;

  const target = document.getElementById('contribution3d');
  if (!target) return;

  initialized = true;
  buildGraph(target);

  // Animate cells in with staggered fade if motion OK
  if (!prefersReducedMotion) {
    const cells = target.querySelectorAll<HTMLElement>('.contrib-heatmap-cell');
    let delay = 0;
    for (const cell of cells) {
      cell.style.opacity = '0';
      cell.style.transition = `opacity 0.3s ${delay}ms`;
      delay += 0.5;
    }
    requestAnimationFrame(() => {
      for (const cell of cells) {
        cell.style.opacity = '';
      }
    });
  }
}

export function destroyContribution3d(): void {
  if (wrapperEl?.parentNode) {
    wrapperEl.parentNode.removeChild(wrapperEl);
  }
  wrapperEl = null;
  initialized = false;
}
