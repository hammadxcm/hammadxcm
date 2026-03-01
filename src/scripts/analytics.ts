import { analyticsThemeMap } from './theme-config';
import type { ThemeName } from './types';

const LEETCODE_FONT = 'Source%20Code%20Pro';

function buildLeetcodeUrl(user: string, theme: string, ext: string): string {
  const width = ext === 'heatmap' ? '&width=750' : '';
  return `https://leetcard.jacoblin.cool/${user}?theme=${theme}&font=${LEETCODE_FONT}&ext=${ext}${width}`;
}

export function updateAnalyticsTheme(theme: ThemeName): void {
  const m = analyticsThemeMap[theme] || analyticsThemeMap.hacker;

  // GitHub grid
  const githubGrid = document.querySelector<HTMLElement>('.analytics-grid[data-github-user]');
  if (githubGrid) {
    const user = githubGrid.dataset.githubUser;
    const utc = githubGrid.dataset.utcOffset;
    if (user) {
      const imgs = githubGrid.querySelectorAll<HTMLImageElement>('img[data-stat]');
      for (const img of imgs) {
        const stat = img.dataset.stat;
        switch (stat) {
          case 'streak':
            img.src = `https://streak-stats.demolab.com?user=${user}&theme=${m.stats}&hide_border=true&stroke=0000&background=${m.streakBg}`;
            break;
          case 'stats':
            img.src = `https://github-readme-stats-sigma-five.vercel.app/api?username=${user}&show_icons=true&theme=${m.stats}&hide_border=true&bg_color=${m.streakBg}`;
            break;
          case 'activity':
            img.src = `https://github-readme-activity-graph.vercel.app/graph?username=${user}&theme=${m.activityTheme}&bg_color=${m.streakBg}&area=true&hide_border=true`;
            break;
          case 'trophy':
            img.src = `https://github-trophies.vercel.app/?username=${user}&theme=${m.trophy}&no-frame=true&no-bg=false&margin-w=4&column=7`;
            break;
          case 'repos-lang':
            img.src = `https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=${user}&theme=${m.summary}`;
            break;
          case 'commit-lang':
            img.src = `https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=${user}&theme=${m.summary}`;
            break;
          case 'card-stats':
            img.src = `https://github-profile-summary-cards.vercel.app/api/cards/stats?username=${user}&theme=${m.summary}`;
            break;
          case 'productive':
            img.src = `https://github-profile-summary-cards.vercel.app/api/cards/productive-time?username=${user}&theme=${m.summary}&utcOffset=${utc}`;
            break;
          case 'profile':
            img.src = `https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=${user}&theme=${m.summary}`;
            break;
          case 'top-langs':
            img.src = `https://github-readme-stats-sigma-five.vercel.app/api/top-langs/?username=${user}&layout=compact&theme=${m.stats}&hide_border=true&bg_color=${m.streakBg}`;
            break;
          case 'isocalendar':
          case 'stars':
            img.style.filter = theme === 'arctic' ? 'invert(0.85) hue-rotate(180deg)' : 'none';
            img.style.transition = 'filter 0.35s ease';
            break;
        }
      }
    }
  }

  // LeetCode grid — single tabbed card
  const leetcodeGrid = document.querySelector<HTMLElement>('.analytics-grid[data-leetcode-user]');
  if (leetcodeGrid) {
    const user = leetcodeGrid.dataset.leetcodeUser;
    if (user) {
      const img = leetcodeGrid.querySelector<HTMLImageElement>('img[data-stat="leetcode-card"]');
      if (img) {
        const ext = img.dataset.currentExt || 'activity';
        img.src = buildLeetcodeUrl(user, m.leetcodeTheme, ext);
      }
    }
  }

  // StackOverflow grid — update all 3 layout variants (CSS shows only one)
  const soGrid = document.querySelector<HTMLElement>('.analytics-grid[data-stackoverflow-user]');
  if (soGrid) {
    const userId = soGrid.dataset.stackoverflowUser;
    if (userId) {
      const imgs = soGrid.querySelectorAll<HTMLImageElement>(
        'img[data-stat="stackoverflow-stats"]',
      );
      for (const img of imgs) {
        const layout = img.dataset.soLayout || 'compact';
        img.src = `https://github-readme-stackoverflow.vercel.app/?userID=${userId}&theme=${m.stackoverflowTheme}&layout=${layout === 'small' ? 'compact' : layout}`;
      }
    }
  }

  // Dev quote (outside analytics grids)
  const quoteImg = document.querySelector<HTMLImageElement>('.dev-quote img[data-stat="quote"]');
  if (quoteImg) {
    quoteImg.src = `https://quotes-github-readme.vercel.app/api?type=horizontal&theme=${m.stats}`;
  }
}

export function initLeetcodeTabs(): void {
  const leetcodeGrid = document.querySelector<HTMLElement>('.analytics-grid[data-leetcode-user]');
  if (!leetcodeGrid) return;

  const tabs = leetcodeGrid.querySelectorAll<HTMLButtonElement>('.analytics-tab');
  const img = leetcodeGrid.querySelector<HTMLImageElement>('img[data-stat="leetcode-card"]');
  if (!tabs.length || !img) return;

  const user = leetcodeGrid.dataset.leetcodeUser;
  if (!user) return;

  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      for (const t of tabs) t.classList.remove('active');
      tab.classList.add('active');

      const ext = tab.dataset.ext || 'activity';
      const theme = (document.documentElement.getAttribute('data-theme') || 'hacker') as ThemeName;
      const m = analyticsThemeMap[theme] || analyticsThemeMap.hacker;

      img.src = buildLeetcodeUrl(user, m.leetcodeTheme, ext);
      img.dataset.currentExt = ext;
    });
  }
}

export function initGithubTabs(): void {
  const grid = document.querySelector<HTMLElement>('.analytics-grid[data-github-user]');
  if (!grid) return;

  const tabs = grid.querySelectorAll<HTMLButtonElement>('.analytics-tab');
  const panels = grid.querySelectorAll<HTMLElement>('.github-panel');
  if (!tabs.length || !panels.length) return;

  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      const panelName = tab.dataset.panel;

      for (const t of tabs) t.classList.remove('active');
      tab.classList.add('active');

      for (const p of panels) {
        p.classList.toggle('active', p.dataset.panel === panelName);
      }
    });
  }
}
