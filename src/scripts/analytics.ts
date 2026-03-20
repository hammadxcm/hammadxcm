import { trackEvent } from './achievements';
import { analyticsThemeMap } from './theme-config';
import type { ThemeName } from './types';

type ThemeMapEntry = (typeof analyticsThemeMap)[keyof typeof analyticsThemeMap];

const LEETCODE_FONT = 'Source%20Code%20Pro';

function buildLeetcodeUrl(user: string, theme: string, ext: string, colors?: string): string {
  const width = ext === 'heatmap' ? '&width=750' : '';
  const colorsParam = colors ? `&colors=${colors}` : '';
  return `https://leetcard.jacoblin.cool/${user}?theme=${theme}&font=${LEETCODE_FONT}&ext=${ext}${width}${colorsParam}`;
}

const GITHUB_STAT_BUILDERS: Record<
  string,
  (user: string, m: ThemeMapEntry, utc?: string) => string
> = {
  streak: (user, m) =>
    `https://streak-stats.demolab.com?user=${user}&theme=${m.stats}&hide_border=true&stroke=0000&background=${m.streakBg}`,
  stats: (user, m) =>
    `https://github-readme-stats-sigma-five.vercel.app/api?username=${user}&show_icons=true&theme=${m.stats}&hide_border=true&bg_color=${m.streakBg}`,
  activity: (user, m) =>
    `https://github-readme-activity-graph.vercel.app/graph?username=${user}&theme=${m.activityTheme}&bg_color=${m.streakBg}&area=true&hide_border=true`,
  trophy: (user, m) =>
    `https://github-trophies.vercel.app/?username=${user}&theme=${m.trophy}&no-frame=true&no-bg=false&margin-w=4&column=7`,
  'repos-lang': (user, m) =>
    `https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=${user}&theme=${m.summary}`,
  'commit-lang': (user, m) =>
    `https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=${user}&theme=${m.summary}`,
  'card-stats': (user, m) =>
    `https://github-profile-summary-cards.vercel.app/api/cards/stats?username=${user}&theme=${m.summary}`,
  productive: (user, m, utc) =>
    `https://github-profile-summary-cards.vercel.app/api/cards/productive-time?username=${user}&theme=${m.summary}&utcOffset=${utc}`,
  profile: (user, m) =>
    `https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=${user}&theme=${m.summary}`,
  'top-langs': (user, m) =>
    `https://github-readme-stats-sigma-five.vercel.app/api/top-langs/?username=${user}&layout=compact&theme=${m.stats}&hide_border=true&bg_color=${m.streakBg}`,
};

function updateGithubGrid(m: ThemeMapEntry, theme: ThemeName): void {
  const githubGrid = document.querySelector<HTMLElement>('.analytics-grid[data-github-user]');
  if (!githubGrid) return;
  const user = githubGrid.dataset.githubUser;
  const utc = githubGrid.dataset.utcOffset;
  if (!user) return;

  const imgs = githubGrid.querySelectorAll<HTMLImageElement>('img[data-stat]');
  for (const img of imgs) {
    const stat = img.dataset.stat;
    if (!stat) continue;
    const builder = GITHUB_STAT_BUILDERS[stat];
    if (builder) {
      img.src = builder(user, m, utc);
    } else if (stat === 'isocalendar' || stat === 'stars') {
      img.style.filter = theme === 'arctic' ? 'invert(0.85) hue-rotate(180deg)' : 'none';
      img.style.transition = 'filter 0.35s ease';
    }
  }
}

function updateLeetcodeGrid(m: ThemeMapEntry): void {
  const leetcodeGrid = document.querySelector<HTMLElement>('.analytics-grid[data-leetcode-user]');
  if (!leetcodeGrid) return;
  const user = leetcodeGrid.dataset.leetcodeUser;
  if (!user) return;
  const img = leetcodeGrid.querySelector<HTMLImageElement>('img[data-stat="leetcode-card"]');
  if (img) {
    const ext = img.dataset.currentExt || 'activity';
    img.src = buildLeetcodeUrl(user, m.leetcodeTheme, ext, m.leetcodeColors);
  }
}

function updateStackoverflowGrid(m: ThemeMapEntry): void {
  const soGrid = document.querySelector<HTMLElement>('.analytics-grid[data-stackoverflow-user]');
  if (!soGrid) return;
  const userId = soGrid.dataset.stackoverflowUser;
  if (!userId) return;
  const imgs = soGrid.querySelectorAll<HTMLImageElement>('img[data-stat="stackoverflow-stats"]');
  for (const img of imgs) {
    const layout = img.dataset.soLayout || 'compact';
    img.src = `https://github-readme-stackoverflow.vercel.app/?userID=${userId}&theme=${m.stackoverflowTheme}&layout=${layout === 'small' ? 'compact' : layout}`;
  }
}

function updateDevQuote(m: ThemeMapEntry): void {
  const quoteImg = document.querySelector<HTMLImageElement>('.dev-quote img[data-stat="quote"]');
  if (quoteImg) {
    quoteImg.src = `https://quotes-github-readme.vercel.app/api?type=horizontal&theme=${m.stats}`;
  }
}

export function updateAnalyticsTheme(theme: ThemeName): void {
  const m = analyticsThemeMap[theme] || analyticsThemeMap.hacker;
  updateGithubGrid(m, theme);
  updateLeetcodeGrid(m);
  updateStackoverflowGrid(m);
  updateDevQuote(m);
}

function initTabGroup(
  containerSelector: string,
  tabSelector: string,
  trackName: string,
  onTabClick: (
    tab: HTMLButtonElement,
    tabs: NodeListOf<HTMLButtonElement>,
    container: HTMLElement,
  ) => void,
): void {
  const container = document.querySelector<HTMLElement>(containerSelector);
  if (!container) return;

  const tabs = container.querySelectorAll<HTMLButtonElement>(tabSelector);
  if (!tabs.length) return;

  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      for (const t of tabs) t.classList.remove('active');
      tab.classList.add('active');
      onTabClick(tab, tabs, container);
      trackEvent(trackName);
    });
  }
}

export function initLeetcodeTabs(): void {
  initTabGroup(
    '.analytics-grid[data-leetcode-user]',
    '.analytics-tab',
    'leetcode_tab',
    (tab, _tabs, container) => {
      const img = container.querySelector<HTMLImageElement>('img[data-stat="leetcode-card"]');
      const user = container.dataset.leetcodeUser;
      if (!img || !user) return;

      const ext = tab.dataset.ext || 'activity';
      const theme = (document.documentElement.getAttribute('data-theme') || 'hacker') as ThemeName;
      const m = analyticsThemeMap[theme] || analyticsThemeMap.hacker;

      img.src = buildLeetcodeUrl(user, m.leetcodeTheme, ext, m.leetcodeColors);
      img.dataset.currentExt = ext;
    },
  );
}

export function initGithubTabs(): void {
  initTabGroup(
    '.analytics-grid[data-github-user]',
    '.analytics-tab',
    'github_tab',
    (tab, _tabs, container) => {
      const panelName = tab.dataset.panel;
      const panels = container.querySelectorAll<HTMLElement>('.github-panel');
      for (const p of panels) {
        p.classList.toggle('active', p.dataset.panel === panelName);
      }
    },
  );
}
