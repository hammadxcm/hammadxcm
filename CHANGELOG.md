# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-03-04

### Added

#### Internationalization (i18n)
- **13-language support**: English, Spanish, French, German, Portuguese, Russian, Hindi, Bengali, Urdu, Farsi, Arabic, Mandarin Chinese, and Indonesian — each with full UI translations covering all sections, achievements, and meta tags
- **RTL layout support**: Arabic, Urdu, and Farsi render right-to-left with flipped timelines, repositioned dropdowns, and Noto Sans Arabic font fallback — code blocks remain LTR
- **Locale routing**: URL-based locale prefixes (`/es/`, `/ar/`, `/zh/`, etc.) with English as the unprefixed default
- **Async lazy-loading**: Locale files load on demand via dynamic `import()` with an in-memory Map cache — only the active language is bundled per page
- **SEO hreflang links**: `getAlternateLinks()` generates `<link rel="alternate">` tags for all 13 locales
- **Language Switcher component**: Globe icon dropdown in the nav with 13 options, `role="listbox"` accessibility, click-outside dismissal, Escape key close, and RTL-aware positioning
- **Shared page template**: Single `_Page.astro` master component handles all locale variants — each `/[locale]/index.astro` delegates with `<Page locale="xx" />`

#### Gamification & Engagement
- **Achievement system**: 50 achievements across 4 categories (Explore, Interact, Discover, Social) with XP rewards, 10 progression levels from "Script Kiddie" to "System Architect", and XP thresholds `[0, 50, 130, 230, 350, 500, 680, 880, 1100, 1400]`
- **Achievement panel**: Modal overlay (`Shift+A` or trophy button) displaying all 50 achievements in a responsive grid — unlocked cards show accent glow, secret achievements display "???" until earned, global rarity percentages fetched from the stats API
- **Capture The Flag challenge**: 5 clues hidden across the site (HTML comment, console log, `data-ctf-clue` attribute, hidden `<span>`, title attribute) — solving the passphrase `HACKTHESITE!` triggers a full-screen overlay and awards the secret "Elite Hacker" achievement (100 XP)
- **Level-up notifications**: Toast notification on level progression with level name and XP milestone
- **Guestbook stats card**: 8-column responsive grid showing visit count, sections explored, current level, session timer (live MM:SS), plus global stats (total visitors, CTF solve rate, popular theme, total achievements) — engagement prompts change based on player level

#### Interactive Features
- **Command Palette**: `Cmd+K` / `Ctrl+K` triggers a full-screen fuzzy search modal — search across sections, themes (10), languages (13), projects, and tech stack with keyboard navigation (arrow keys, Enter, Escape) and instant action execution (scroll to section, switch theme, change language, open links)
- **Resume PDF export**: One-click A4 PDF generation using lazy-loaded jsPDF — reads current theme colors from CSS custom properties, renders header, socials, skills, achievements, experience (up to 4 bullets per role), and certifications with multi-page support and HTML entity handling
- **Annotations overlay**: Press backtick (`` ` ``) to toggle engineering commentary badges on each section — shows design decisions (lazy loading strategy, GPU acceleration notes, SSR approach, API choices) as positioned monospace badges
- **View More pattern**: Reusable expand/collapse for grid sections — shows first N items with a glass-styled button displaying hidden count and rotating chevron, used on Contributions and Projects

#### New Sections & Components
- **Testimonials marquee**: Horizontal CSS-only scrolling carousel of LinkedIn recommendations with glass cards, 40x40 lazy-loaded avatars, 4-line truncation with fade overlay, pause on hover, and grid fallback for `prefers-reduced-motion` (40s desktop / 25s mobile animation)
- **Contributions section**: Displays merged and open pull requests to external repositories — data fetched at build time via GitHub Search API with repo metadata (stars, forks, language, topics, license, owner avatar), sorted by state then date, with View More beyond 6 cards and locale-aware relative time formatting
- **Lighthouse scores**: SVG circular gauge charts (54×54px) for Performance, Accessibility, Best Practices, and SEO — color-coded green (90+), orange (50-89), red (<50) with stroke-dasharray/dashoffset rendering
- **Guestbook**: GitHub Discussions embed via Giscus with IntersectionObserver lazy-loading, theme-aware appearance synced via `postMessage`, and the stats card above for engagement metrics

#### Analytics Panels
- **GitHub Panel**: 7 switchable tabs (Overview, Activity, Trophies, Languages, Summary, Contributions, Stars) embedding Vercel-hosted SVG generators — streak stats, activity graph, trophies, language breakdown, profile summary, snake contribution animation, and metrics cards
- **LeetCode Panel**: 3 tabs (Activity, Heatmap, Contest) using jacoblin.cool card generator with theme-mapped colors
- **StackOverflow Panel**: 3 responsive layout variants (desktop, tablet compact, mobile small) using github-readme-stackoverflow generator
- **Panel components**: Extracted `GitHubPanel.astro`, `LeetCodePanel.astro`, `StackOverflowPanel.astro` as standalone components with conditional rendering based on config presence

#### Backend & Data Pipeline
- **Cloudflare Stats API Worker**: Serverless endpoint (`POST /api/track`, `GET /api/stats`) for anonymous aggregate counters stored in KV — supports themed counters (`theme:*`), achievement tracking (`ach:*`), level tracking (`level:*`), rate-limited to 1 write per 10s per IP, CORS-enabled
- **Global stats client**: Fire-and-forget `reportEvent()` with `keepalive: true`, `fetchGlobalStats()` with 5-minute client-side cache, graceful fallback if Worker is offline
- **Build-time data fetching**: `fetch-contributions.mjs` queries GitHub Search API for PRs by author with pagination, rate-limit retry (exponential backoff, 3 attempts), repo metadata enrichment, MIN_STARS filtering, and EXCLUDE_ORGS support; `fetch-projects.mjs` fetches repos + npm/RubyGems download counts
- **Static data files**: `contributions.json`, `projects.json`, `lighthouse.json` generated at build time — zero runtime API calls for content

#### Utility Modules
- **Format utils**: `formatStars()` (1000+ → "1.0k") and `formatDownloads()` (1M+ → "1.0M", 1k+ → "1.0k")
- **Time utils**: `relativeTime(iso, translations)` with i18n-aware day/month/year calculations and parameterized translation keys
- **Icon components**: `StarIcon.astro`, `ForkIcon.astro`, `DownloadIcon.astro` as reusable inline SVGs
- **Default project icon**: Fallback SVG for projects without custom icons

#### Assets
- **Testimonial avatars**: 6 professional avatar images (Cody Farmer, Kris Rudeegraap, Majid Mohammed, Rashid Mukhtar, Sajid Ali, Usman Ali)

#### Styles
- **Boot progress bar**: 2px animated progress bar at bottom of boot overlay with percentage-based width
- **CTF effect styles**: Fixed overlay with 0.9 opacity backdrop, centered achievement box, bounce-in icon animation (`ctfBounce` keyframe), accent glow title
- **Level-up effect**: Toast-style notification with accent border and glow
- **Achievement panel styles**: Responsive grid (280px min-width cards), glassmorphism locked/unlocked states, accent glow for earned achievements
- **RTL utilities**: Timeline flip, dropdown repositioning, LTR code preservation
- **Tag mixins**: Monospace pill-style tags (`@mixin tag`, `@mixin topic-tag`) for tech labels and repo topics
- **View More mixins**: Reusable `view-more-wrapper`, `view-more-btn`, `view-more-count`, `view-more-chevron` with glass background and accent hover glow

### Changed

#### Architecture
- **Page delegation pattern**: All 13 locale pages delegate to a single `_Page.astro` master template — eliminates duplicated section markup across locales
- **Component modularization**: Analytics section restructured from flat image list to composable panel components (`GitHubPanel`, `LeetCodePanel`, `StackOverflowPanel`) with conditional rendering
- **Config-driven content**: Every section now reads from `portfolio.config.ts` and i18n translations — zero hardcoded display strings in components

#### Script Architecture
- **Centralized state management**: `state.ts` provides global atoms (`prefersReducedMotion`, `isTouchDevice`, `_isPageVisible`, `_currentTheme`, `_clientIP`, `_heroVisible`) with setter functions and visibility listener subscriptions
- **Ordered initialization**: `main.ts` uses sequential `safeInit()` wrapper — effects initialize before interactions, achievements before theme switcher, preventing race conditions
- **Theme switcher orchestration**: Central `theme-switcher.ts` coordinates all theme-dependent updates (overlays, cursor, canvas, hero, analytics, about, nav) with View Transition API support and rapid-switcher detection (5 switches in 30s)
- **Canvas effect system**: Unified mote system with `MoteEffectConfig` interface supporting 8 particle presets plus custom `particles` (mouse-reactive with connection lines) and `retroGrid` (synthwave perspective grid) — touch devices get 60% particle reduction
- **Scroll handler**: RAF-throttled with hero fade/scale, orb opacity, nav background, timeline progress bar, section title gradients, and cumulative scroll distance tracking for achievements
- **Observer system**: Dual IntersectionObservers — element reveal (`threshold: 0.08, rootMargin: 0px 0px -60px 0px`) with staggered child animation, plus section tracking for achievement events
- **Hero name effect**: State-managed encrypt/decrypt cycle (decrypt → hold 30s → encrypt) with per-theme effects — glitch/lightning for hacker/matrix, lightning strikes for synthwave, blood splatter for bloodmoon

#### Style Architecture
- **Modular SCSS imports**: `global.scss` reorganized with `@use` statements across base, themes, layout, effects (10+ files), utilities (6 files), and responsive layers
- **Glassmorphism system**: `_glass.scss` provides CSS variable-based glass cards with backdrop-filter, glow-border hover with 3D translate, and icon/link scale effects
- **Section layout system**: `.section` max-width 1200px with responsive padding, `.section-header` centered layout, `.section-label` monospace accent pill, `.section-title` at 2.5rem/800 weight
- **Mixin library**: `respond-to($breakpoint)` for DRY responsive (tablet 1024px, mobile 768px, small 480px), `responsive-grid()` with auto-fit columns, `card-padding()`, `reduced-motion()`, `hide-scrollbar()`
- **Theme system**: 10 themes with 40+ CSS variables each — now includes boot colors (`--boot-bg`, `--boot-ok`, `--boot-warn`, `--boot-cmd`, `--boot-access-shadow`), code syntax colors, and glass/border variables
- **Toast enhancements**: Glassmorphism toasts with `ease-out-expo` slide-in (0.4s) and slide-out (0.3s), achievement variant with accent left border, ambient dimmed styling, mobile-responsive distances

#### Config System
- **About builder**: 18 programming language variants (bash, python, ruby, JS, TS, java, C++, Go, Rust, PHP, Perl, C#, Swift, Kotlin, COBOL, Fortran, Assembly, Binary) with shared helpers (`escapeHtml`, `commentHeader`, `extract`, `buildVariant`) and per-language `LanguageSyntax` definitions
- **Type system**: `TranslationMap` interface covers all sections (meta, nav, hero, about, tech, journey, projects, contributions, certs, testimonials, guestbook, analytics, achievements, commandPalette, resume, footer, a11y)
- **Guestbook config**: Added giscus configuration types and portfolio config values for GitHub Discussions integration

#### Components
- **About**: Multi-language code display with 18 language variants, language switcher dropdown, copy-to-clipboard, resume export button, scoped SCSS with responsive breakpoints
- **Hero**: Structured data attributes (`data-text`, `data-texts` as JSON), particle canvas + matrix canvas + geometric shapes layers, config-driven content with SocialLinks injection
- **Nav**: Receives translations and locale props, integrates Language Switcher and theme controls
- **Projects**: Responsive grid with `@include responsive-grid()` and `glow-border` hover effects, View More integration
- **Social Links**: Expanded to 6 platforms with inline SVG map (GitHub, Twitter, LinkedIn, StackOverflow, LeetCode, HackerRank)
- **Tech Arsenal**: BASE_URL normalization with `.replace(/\/?$/, '/')`, local/external icon support, category emoji display

#### Boot Sequence
- **Network-aware delays**: Detects `navigator.connection.effectiveType` — halves line delay for 2g/3g connections
- **Per-theme boot messages**: Theme-specific terminal output stored in theme-config.ts
- **Return session handling**: Short "Resuming session..." sequence for `sessionStorage['boot-done']` visitors
- **Progress bar**: Animated width percentage at bottom of boot overlay

### Fixed
- **Nav inline styles**: Theme switcher now clears stale nav inline styles on switch to prevent style bleed
- **Lint compliance**: Replaced all `forEach` with `for...of` loops to satisfy `useIterableCallbackReturn` Biome rule
- **Non-null assertion chains**: Fixed `noNonNullAssertedOptionalChain` violations in a11y tests
- **Copy interaction**: Reads `data-copy` attribute at click time (not init time) so dynamically updated content copies correctly

### Testing
- **Config types tests**: Vitest suite validating TypeScript type exports and interface shapes
- **Config validation tests**: Validates all required top-level keys, non-empty site fields, valid URLs, hero typewriter texts, about fields, arsenal, mission log, tech stack categories, experience/projects/certifications arrays
- **A11y test suite update**: DOM inspection tests for img alt attributes, skip link, button/link labels, canvas `aria-hidden`, and decorative overlay accessibility — updated for new sections (testimonials, guestbook, contributions, lighthouse)
- **Format utility tests**: Coverage for `formatStars()` and `formatDownloads()` edge cases and thresholds

### Performance
- **Build-time data fetching**: Contributions, projects, and lighthouse scores fetched at build — zero runtime API calls for content
- **Lazy-loaded libraries**: jsPDF loaded only on resume export click, Giscus loaded on viewport intersection
- **Async i18n loading**: Only the active locale bundle is imported per page visit
- **Client-side stats cache**: 5-minute TTL on global stats to reduce Worker API calls
- **Touch device optimization**: Canvas particle counts reduced 60% on touch devices
- **RAF throttling**: Scroll handler and canvas animations use requestAnimationFrame gating
- **CSS containment**: Boot overlay uses `contain: layout size style` for render performance
- **Fire-and-forget tracking**: `reportEvent()` uses `keepalive: true` and never blocks UI thread

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

[1.3.0]: https://github.com/hammadxcm/hammadxcm/compare/v1.2.3...v1.3.0
[1.2.0]: https://github.com/hammadxcm/hammadxcm/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/hammadxcm/hammadxcm/compare/v1.0.3...v1.1.0
[1.0.3]: https://github.com/hammadxcm/hammadxcm/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/hammadxcm/hammadxcm/releases/tag/v1.0.2
