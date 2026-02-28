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

export type LangKey =
  | 'bash'
  | 'python'
  | 'ruby'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'cpp'
  | 'go'
  | 'php'
  | 'perl'
  | 'rust'
  | 'csharp'
  | 'swift'
  | 'kotlin'
  | 'cobol'
  | 'fortran'
  | 'assembly'
  | 'binary';

export type ScreenEffect =
  | 'glitch'
  | 'bloodDrip'
  | 'iceCrack'
  | 'vhsDistortion'
  | 'fogWisps'
  | 'auroraShimmer'
  | 'pastelBloom'
  | 'shootingStar'
  | 'tvStatic'
  | 'none';

export interface HeroTiming {
  flicker: number;
  resolve: number;
}

export interface ThemeConfig {
  canvasEffect: string;
  hasMatrixRain: boolean;
  hasCRT: boolean;
  screenEffect: ScreenEffect;
  hasHackerLog: boolean;
  hasCursor: false | 'crosshair' | 'dot';
  hasStatusBar: boolean;
  particleColor: string;
  matrixColor?: string;
  matrixBg?: string;
  bootBg: string;
  navBg: string;
  heroGlyphs: string;
  heroTiming: HeroTiming;
}

export interface BootMessage {
  text: string;
  cls: string;
}

export interface ThemeToasts {
  click: string[];
  ambient: string[];
}

export interface AboutTheme {
  sectionLabel: string;
  filename: string;
  headerComment: string;
  echoMessage: string;
  defaultLang: LangKey;
}

export interface LangVariant {
  displayLines: string[];
  copyLines: string[];
  extension: string;
  langLabel: string;
  commentLineIndex: number;
  echoLineIndex: number;
  commentPrefix: string;
  printTemplate: { display: string; copy: string };
}

export interface AnalyticsThemeMap {
  stats: string;
  summary: string;
  trophy: string;
  streakBg: string;
  activityTheme: string;
}
