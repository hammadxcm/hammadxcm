# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-03-01

### Added
- **Multi-platform analytics**: Config-driven LeetCode, StackOverflow, and HackerRank analytics sections that conditionally render based on config presence
- **GitHub tabbed panels**: Analytics split into 7 switchable tabs — Overview, Activity, Trophies, Languages, Summary, Contributions, Stars
- **LeetCode tabbed card**: Activity, Heatmap, and Contest views with tab switching and theme-aware stat cards
- **StackOverflow responsive layouts**: Three layout variants (default, compact, small) that switch automatically per breakpoint
- **Social link icons**: SVG icons for StackOverflow, LeetCode, and HackerRank added to the social links component
- **Blood rain canvas effect**: Falling rain streaks with gradient trails and horizontal drift for the Blood Moon theme
- **Hero text effects**: Per-theme lightning strike (Synthwave), blood splatter (Blood Moon), and ambient glows across all themes
- **Per-theme screen effects**: Each of the 10 themes now has a unique screen overlay effect on click interaction
- **Template guide**: Full config reference documentation for contributors and template users with analytics setup instructions
- **CI quality gates**: Lint (`biome check`) and test (`vitest`) steps added to the deploy pipeline — builds now fail on lint errors or test failures

### Changed
- **Architecture**: Complete migration from monolithic JS/CSS to modular TypeScript + SCSS with design tokens, mixins, and theme system
- **Config system**: Single `portfolio.config.ts` file drives all content — hero, about, tech stack, experience, projects, certifications, analytics, and social links
- **Analytics component**: Restructured from flat image list to subsection layout with tabbed navigation, CTA cards with SVG icons, and responsive image containers
- **Analytics theming**: All 10 themes now map to platform-specific theme values for GitHub, LeetCode, and StackOverflow stats
- **Dev quote**: Moved outside GitHub analytics grid into standalone `.dev-quote` container so it actually themes correctly on theme switch
- **Blood Moon screen overlay**: Replaced sequential drip-fall animations with radial mist burst and vignette flash
- **Section order**: Analytics section moved after Certifications in page layout
- **Biome**: Upgraded from v1.9.4 to v2.4.4 with migrated config schema
- **Social platforms**: Expanded from 3 (`github`, `twitter`, `linkedin`) to 6 (added `stackoverflow`, `leetcode`, `hackerrank`)

### Fixed
- **Dev quote theme sync**: Quote image was inside a `querySelectorAll` scoped to `.analytics-grid[data-github-user]` but lived outside that container — theme updates never reached it. Now uses a standalone selector
- **Dead code removal**: Removed unreachable `case 'quote'` from GitHub grid switch statement
- **Lint errors**: Fixed `noNonNullAssertedOptionalChain` violations in a11y tests, replaced `forEach` with `for...of` loops to satisfy `useIterableCallbackReturn` rule
- **LeetCode URL duplication**: Extracted `buildLeetcodeUrl` helper to eliminate duplicated URL template, font constant, and width ternary across `updateAnalyticsTheme` and `initLeetcodeTabs`

### Documentation
- **README**: Added LeetCode stats section with heatmap/activity/contest cards, StackOverflow stats section, and HackerRank profile badge
- **TEMPLATE_GUIDE.md**: Added config reference for `leetcode`, `stackoverflow`, `hackerrank` keys, updated socials list to 6 platforms, added Analytics Dashboard behavior section

## [1.1.0] - 2026-02-27

### Added
- **Boot sequence**: Realistic bash terminal session with `nmap` scans, SSH connections, and colored output classes (`.boot-cmd`, `.boot-output`, `.boot-ok`, `.boot-access`)
- **Hacker toast notifications**: Glassmorphism toasts on click with hacker-themed messages, max 3 stacked, auto-dismiss after 2.5s
- **Ambient auto-toasts**: System-feel toasts every 12-18s with randomized messages (`[CRON]`, `[ALERT]`, `[SYNC]`, etc.)
- **Click screen glitch**: 150ms full-screen glitch overlay on every click with `clip-path` slices and `hue-rotate`
- **Global environment glitch**: Periodic (6-12s) full-body glitch with `skewX`, `translate`, and `hue-rotate` on `<body>`
- **Konami code easter egg**: `Up Up Down Down Left Right Left Right B A` triggers "SYSTEM COMPROMISED" overlay with intense RGB split animation
- **Terminal status bar**: Fixed bottom bar with live uptime counter, fluctuating KB/s stats, process count, and AES-256 indicator
- **Project tech stack icons**: Replaced emoji icons with real tech images from `skillicons.dev` and `techstack-generator.vercel.app`
- **CHANGELOG.md**: Added changelog following Keep a Changelog format

### Changed
- **Hero greeting**: Updated from `root@system:~$ ./hammad_khan --init` to `root@kali:~# whoami`
- **Hero name effect**: Continuous encrypt/decrypt cycle — name scrambles with ASCII glyphs then decrypts back to "Hammad Khan" in a loop
- **Typewriter titles**: Now alternates between tech identity titles (Ruby on Rails Virtuoso, AWS Infrastructure Strategist, etc.) and hacker ops messages
- **About section**: Transformed from JS object (`hammadKhan.js`) to bash dossier (`classified_dossier.sh`) with classified file theme and syntax highlighting
- **Matrix rain**: Slowed to ~20fps with staggered column drops, increased opacity (0.12 to 0.22 CSS, 0.4 to 0.6 JS fill)
- **Version**: Bumped from 1.0.3 to 1.1.0

### Removed
- **Click burst words**: Replaced by the new toast notification system
- **CSS pseudo-element name glitch**: Removed `::before`/`::after` clip-path split that was cutting the name in half, replaced with JS-driven encrypt/decrypt effect

### Fixed
- **daemon-os project icon**: Fixed `BASE_URL` trailing slash normalization to match TechArsenal pattern

### Performance
- All new features respect `prefers-reduced-motion` media query
- Toast DOM nodes capped at 3 (auto-removed)
- Auto-toast interval randomized (12-18s) to avoid predictable patterns
- Click glitch overlay: CSS-only animation, auto-removed after 150ms
- Status bar updates throttled to every 2s
- Status bar and ambient toasts hidden on mobile (<768px)

## [1.0.3] - 2026-02-26

### Added
- CI/CD documentation and contributing guide
- Auto patch bump on every deploy

## [1.0.2] - 2026-02-26

### Fixed
- daemon-os UI: reverted full-width card, added animated demon icon

[1.2.0]: https://github.com/hammadxcm/hammadxcm/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/hammadxcm/hammadxcm/compare/v1.0.3...v1.1.0
[1.0.3]: https://github.com/hammadxcm/hammadxcm/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/hammadxcm/hammadxcm/releases/tag/v1.0.2
