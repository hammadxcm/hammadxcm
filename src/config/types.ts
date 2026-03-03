export type ThemeName =
  | 'hacker'
  | 'dracula'
  | 'nord'
  | 'catppuccin'
  | 'synthwave'
  | 'matrix'
  | 'bloodmoon'
  | 'midnight'
  | 'arctic'
  | 'gruvbox';

export type SocialPlatform =
  | 'github'
  | 'twitter'
  | 'linkedin'
  | 'stackoverflow'
  | 'hackerrank'
  | 'leetcode';

export type SectionId =
  | 'about'
  | 'tech'
  | 'journey'
  | 'projects'
  | 'contributions'
  | 'certs'
  | 'testimonials'
  | 'guestbook'
  | 'analytics';

export type CertBadge =
  | { type: 'image'; src: string; width: number; alt: string }
  | { type: 'svg'; svg: string };

export interface TechItem {
  name: string;
  icon: string;
  url: string;
  isLocal?: boolean;
}

export interface TechCategory {
  title: string;
  emoji: string;
  items: TechItem[];
}

export interface ExperienceEntry {
  date: string;
  role: string;
  company: string;
  companyUrl: string;
  meta: string;
  achievements: string[];
  tags: string[];
}

export interface Project {
  icon: string;
  iconIsLocal?: boolean;
  name: string;
  url: string;
  description: string;
  tags: string[];
  linkText: string;
  npmPackage?: string;
  gemName?: string;
  downloads?: number;
}

export interface GitHubRepo {
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  updatedAt: string;
}

export interface ProjectsData {
  generatedAt: string;
  username: string;
  repos: GitHubRepo[];
  downloads?: Record<string, number>;
}

export interface Certification {
  href: string;
  ariaLabel: string;
  badge: CertBadge;
  category: string;
  name: string;
  issuer: string;
  date?: string;
}

export interface GuestbookConfig {
  giscus: {
    repo: string;
    repoId: string;
    category: string;
    categoryId: string;
  };
  statsApi?: string;
}

export interface ContributionsConfig {
  enabled: boolean;
  excludeOrgs?: string[];
  minStars?: number;
  maxItems?: number;
}

export interface ContributionLabel {
  name: string;
  color: string;
}

export interface ContributionRepo {
  fullName: string;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  description: string | null;
  ownerAvatar: string;
  topics: string[];
  license: string | null;
}

export interface ContributionPR {
  title: string;
  url: string;
  number: number;
  state: 'merged' | 'open';
  mergedAt: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  labels: ContributionLabel[];
  repo: ContributionRepo;
}

export interface ContributionsData {
  generatedAt: string;
  username: string;
  totalCount: number;
  contributions: ContributionPR[];
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
}

export interface SocialLink {
  platform: SocialPlatform;
  url?: string;
  label: string;
}

export interface Section {
  id: SectionId;
  label: string;
}

export interface PortfolioConfig {
  site: {
    name: string;
    title: string;
    description: string;
    url: string;
    logoText: string;
    logoSuffix?: string;
    theme?: ThemeName;
  };
  hero: {
    greeting: string;
    typewriterTexts: string[];
  };
  about: {
    codename: string;
    title: string;
    experience: string;
    location: string;
    clearance: string;
    currentOp: string;
    arsenal: { key: string; value: string }[];
    missionLog: string[];
    knownAliases: string[];
    currentFocus: string;
    philosophy: string[];
  };
  techStack: TechCategory[];
  experience: ExperienceEntry[];
  projects: Project[];
  certifications: Certification[];
  github: {
    username: string;
    utcOffset: number;
  };
  leetcode?: {
    username: string;
  };
  stackoverflow?: {
    userId: number;
  };
  hackerrank?: {
    username: string;
  };
  contributions?: ContributionsConfig;
  guestbook?: GuestbookConfig;
  testimonials?: Testimonial[];
  socials: SocialLink[];
  sections: Section[];
  boot: {
    welcomeName: string;
  };
}
