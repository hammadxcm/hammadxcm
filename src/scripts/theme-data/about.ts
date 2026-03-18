import type { AboutTheme, ThemeName } from '../types';
import { themeGetter } from './core';

export const aboutThemes: Record<ThemeName, AboutTheme> = {
  hacker: {
    sectionLabel: '// cat /etc/target',
    filename: 'classified_dossier.sh',
    headerComment: 'CLASSIFIED \u2014 SECURITY CLEARANCE: ROOT',
    echoMessage: '[STATUS] Dossier loaded. Target identified.',
    defaultLang: 'python',
  },
  dracula: {
    sectionLabel: '// cat /castle/resident',
    filename: 'blood_oath_registry.sh',
    headerComment: 'CASTLE DRACUL \u2014 BLOOD OATH REGISTRY',
    echoMessage: '[ETERNAL] Profile immortalized. The night awaits.',
    defaultLang: 'ruby',
  },
  nord: {
    sectionLabel: '// cat /fjord/manifest',
    filename: 'nordic_expedition.sh',
    headerComment: 'NORDIC EXPEDITION \u2014 CREW MANIFEST',
    echoMessage: '[FROST] Manifest loaded. Course set north.',
    defaultLang: 'go',
  },
  catppuccin: {
    sectionLabel: '// cat ~/.config/me',
    filename: 'cozy_profile.sh',
    headerComment: 'CATPPUCCIN BLEND \u2014 DEVELOPER PROFILE',
    echoMessage: '[BREW] Profile steeped. Ready to serve.',
    defaultLang: 'javascript',
  },
  synthwave: {
    sectionLabel: '// LOAD PROFILE.DAT',
    filename: 'neon_profile.dat',
    headerComment: 'SYNTHCORP \u2014 OPERATOR DATAFILE',
    echoMessage: '[NEON] Datafile loaded. Welcome to the grid.',
    defaultLang: 'javascript',
  },
  matrix: {
    sectionLabel: '// cat /dev/construct',
    filename: 'construct_profile.sh',
    headerComment: 'THE MATRIX \u2014 OPERATIVE CONSTRUCT',
    echoMessage: '[SIGNAL] Construct loaded. Follow the white rabbit.',
    defaultLang: 'cpp',
  },
  bloodmoon: {
    sectionLabel: '// cat /blood/pact',
    filename: 'crimson_dossier.sh',
    headerComment: 'BLOOD MOON COVENANT \u2014 DARK REGISTRY',
    echoMessage: '[RITUAL] Dossier sealed in crimson.',
    defaultLang: 'java',
  },
  midnight: {
    sectionLabel: '// cat /cosmos/signal',
    filename: 'stellar_manifest.sh',
    headerComment: 'MIDNIGHT OBSERVATORY \u2014 STELLAR MANIFEST',
    echoMessage: '[COSMIC] Signal decoded. Stars aligned.',
    defaultLang: 'typescript',
  },
  arctic: {
    sectionLabel: '// cat /sys/profile',
    filename: 'engineer_profile.sh',
    headerComment: 'SYSTEM PROFILE \u2014 ENGINEERING RECORD',
    echoMessage: '[SYSTEM] Profile loaded successfully.',
    defaultLang: 'typescript',
  },
  gruvbox: {
    sectionLabel: '// cat /workshop/log',
    filename: 'craftsman_log.sh',
    headerComment: 'WORKSHOP LOG \u2014 MASTER CRAFTSMAN',
    echoMessage: '[CRAFT] Workbench loaded. Tools ready.',
    defaultLang: 'bash',
  },
  cyberpunk: {
    sectionLabel: '// cat /net/runner',
    filename: 'netrunner_profile.sh',
    headerComment: 'NCPD DATABANK \u2014 RUNNER PROFILE',
    echoMessage: '[NCPD] Profile uploaded. Stay frosty, choom.',
    defaultLang: 'typescript',
  },
  nebula: {
    sectionLabel: '// cat /cosmos/relay',
    filename: 'stellar_profile.sh',
    headerComment: 'DEEP SPACE RELAY \u2014 CREW MANIFEST',
    echoMessage: '[RELAY] Signal decoded. Stargazer identified.',
    defaultLang: 'python',
  },
  solarized: {
    sectionLabel: '// cat /sys/display',
    filename: 'display_profile.sh',
    headerComment: 'SOLARIZED SHELL \u2014 SYSTEM PROFILE',
    echoMessage: '[SYSTEM] Profile loaded. Display calibrated.',
    defaultLang: 'go',
  },
  rosepine: {
    sectionLabel: '// cat /garden/bloom',
    filename: 'garden_profile.sh',
    headerComment: 'ROS\u00C9 GARDEN \u2014 BOTANIST LOG',
    echoMessage: '[GARDEN] Profile planted. Bloom incoming.',
    defaultLang: 'ruby',
  },
  monokai: {
    sectionLabel: '// cat /editor/config',
    filename: 'editor_profile.sh',
    headerComment: 'SUBLIME EDITOR \u2014 USER CONFIG',
    echoMessage: '[EDITOR] Config loaded. Start coding.',
    defaultLang: 'javascript',
  },
};

export const getAboutTheme = themeGetter(aboutThemes);
