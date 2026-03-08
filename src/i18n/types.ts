export const LOCALES = [
  'en',
  'es',
  'fr',
  'ar',
  'ur',
  'fa',
  'zh',
  'hi',
  'de',
  'bn',
  'pt',
  'ru',
  'id',
] as const;
export type Locale = (typeof LOCALES)[number];
export const RTL_LOCALES: Locale[] = ['ar', 'ur', 'fa'];
export const DEFAULT_LOCALE: Locale = 'en';
export type Direction = 'ltr' | 'rtl';

export interface TranslationMap {
  meta: {
    title: string;
    description: string;
    ogLocale: string;
  };
  nav: {
    switchTheme: string;
    selectTheme: string;
    toggleMenu: string;
    switchLanguage: string;
    sections: Record<import('../config/types').SectionId, string>;
  };
  hero: {
    scroll: string;
  };
  about: {
    label: string;
    title: string;
    filename: string;
    selectLanguage: string;
    copy: string;
    copied: string;
  };
  tech: {
    label: string;
    title: string;
    categories: Record<
      'Frontend' | 'Backend' | 'Databases' | 'Cloud & DevOps' | 'Testing' | 'AI & Tools',
      string
    >;
  };
  journey: {
    label: string;
    title: string;
  };
  projects: {
    label: string;
    title: string;
    viewRepo: string;
    viewMore: string;
    showLess: string;
    moreCount: string;
  };
  contributions: {
    label: string;
    title: string;
    prsMerged: string;
    prsOpen: string;
    prsClosed: string;
    repos: string;
    combinedStars: string;
    linesChanged: string;
    filesChanged: string;
    languages: string;
    orgs: string;
    merged: string;
    open: string;
    closed: string;
    files: string;
    viewPullRequest: string;
    viewMore: string;
    showLess: string;
    notableTitle: string;
    notableSubtitle: string;
    relativeTime: {
      today: string;
      dayAgo: string;
      daysAgo: string;
      monthAgo: string;
      monthsAgo: string;
      yearAgo: string;
      yearsAgo: string;
    };
  };
  contributionAnalytics: {
    languageBreakdown: string;
    orgDistribution: string;
    impactMetrics: string;
    timeline: string;
    avgLinesPerPR: string;
    largestPR: string;
    mostActiveOrg: string;
    successRate: string;
    contributionGraph: string;
    totalContributions: string;
  };
  certs: {
    label: string;
    title: string;
    viewCertificate: string;
  };
  analytics: {
    label: string;
    title: string;
    github: string;
    leetcode: string;
    stackoverflow: string;
    tabs: {
      overview: string;
      activity: string;
      trophies: string;
      languages: string;
      summary: string;
      contributions: string;
      stars: string;
      heatmap: string;
      contest: string;
    };
    cta: {
      githubProfile: string;
      githubProfileDesc: string;
      githubSkyline: string;
      githubSkylineDesc: string;
      leetcodeProfile: string;
      leetcodeProfileDesc: string;
      stackoverflowProfile: string;
      stackoverflowProfileDesc: string;
    };
    alt: {
      streak: string;
      stats: string;
      activityGraph: string;
      trophies: string;
      reposPerLang: string;
      commitLang: string;
      topLangs: string;
      cardStats: string;
      productiveTime: string;
      profileDetails: string;
      contributionSnake: string;
      contributionCalendar: string;
      starredRepos: string;
      profileViews: string;
      leetcodeStats: string;
      stackoverflowStats: string;
      devQuote: string;
    };
  };
  testimonials: {
    label: string;
    title: string;
  };
  listing: {
    backToHome: string;
    viewAll: string;
  };
  guestbook: {
    label: string;
    title: string;
    visitors: string;
    visitNum: string;
    sessionTime: string;
    explored: string;
    hackerLevel: string;
    ctfSolvers: string;
    globalVisitors: string;
    popularTheme: string;
    globalAchievements: string;
    prompts: {
      beginner: string;
      intermediate: string;
      advanced: string;
      master: string;
    };
  };
  achievements: {
    title: string;
    unlocked: string;
    levelUp: string;
    levelNames: string[];
    items: Record<string, { name: string; description: string }>;
  };
  commandPalette: {
    placeholder: string;
    noResults: string;
    sections: string;
    themes: string;
    languages: string;
  };
  resume: {
    download: string;
  };
  footer: {
    builtWith: string;
  };
  terminal: {
    title: string;
    help: string;
    welcome: string;
    unknownCommand: string;
    fileNotFound: string;
  };
  typingTest: {
    title: string;
    start: string;
    wpm: string;
    accuracy: string;
    streak: string;
    bestWpm: string;
    tryAgain: string;
    complete: string;
  };
  chatbot: {
    placeholder: string;
    send: string;
    typing: string;
    rateLimit: string;
    title: string;
  };
  sound: {
    enable: string;
    disable: string;
  };
  a11y: {
    skipToContent: string;
    scrollProgress: string;
    copyCode: string;
  };
}
