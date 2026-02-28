import { analyticsThemeMap } from './theme-config';
import type { ThemeName } from './types';

export function updateAnalyticsTheme(theme: ThemeName): void {
  const grid = document.querySelector<HTMLElement>('.analytics-grid');
  if (!grid) return;
  const user = grid.dataset.githubUser;
  const utc = grid.dataset.utcOffset;
  if (!user) return;

  const m = analyticsThemeMap[theme] || analyticsThemeMap.hacker;
  const imgs = grid.querySelectorAll<HTMLImageElement>('img[data-stat]');

  for (const img of imgs) {
    const stat = img.dataset.stat;
    switch (stat) {
      case 'streak':
        img.src = `https://github-readme-streak-stats.herokuapp.com?user=${user}&theme=${m.stats}&hide_border=true&stroke=0000&background=${m.streakBg}`;
        break;
      case 'stats':
        img.src = `https://github-readme-stats.vercel.app/api?username=${user}&show_icons=true&theme=${m.stats}&hide_border=true&bg_color=${m.streakBg}`;
        break;
      case 'activity':
        img.src = `https://github-readme-activity-graph.vercel.app/graph?username=${user}&theme=${m.activityTheme}&bg_color=${m.streakBg}&area=true&hide_border=true`;
        break;
      case 'trophy':
        img.src = `https://github-profile-trophy.vercel.app/?username=${user}&theme=${m.trophy}&no-frame=true&no-bg=false&margin-w=4&column=7`;
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
      case 'quote':
        img.src = `https://quotes-github-readme.vercel.app/api?type=horizontal&theme=${m.stats}`;
        break;
      case 'top-langs':
        img.src = `https://github-readme-stats.vercel.app/api/top-langs/?username=${user}&layout=compact&theme=${m.stats}&hide_border=true&bg_color=${m.streakBg}`;
        break;
    }
  }
}
