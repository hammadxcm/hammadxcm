<div align="center">

# Hacker Portfolio — Template Setup Guide

**A config-driven, hacker-themed developer portfolio built with [Astro](https://astro.build).**
**Fork it, edit one file, deploy in under 5 minutes.**

[Live Demo](https://your-site-url.com) · [Report Bug](https://github.com/<your-username>/<your-repo>/issues) · [Request Feature](https://github.com/<your-username>/<your-repo>/issues)

</div>

---

## Features

- **Minimal client-side JS** — Astro with React islands for interactive components
- **Single config file** — every section is driven by `src/config/portfolio.config.ts`
- **15 built-in themes** — hacker, dracula, nord, catppuccin, synthwave, matrix, bloodmoon, midnight, arctic, gruvbox, cyberpunk, nebula, solarized, rosepine, monokai
- **Boot sequence animation** — terminal-style loading screen on first visit
- **Interactive effects** — matrix rain, CRT overlay, custom cursor, card tilt, konami code easter egg
- **Analytics dashboard** — GitHub stats, LeetCode, StackOverflow (all optional & theme-aware)
- **Responsive** — mobile-first, works on every screen size
- **Accessible** — semantic HTML, skip links, keyboard navigation, ARIA labels
- **CI/CD included** — lint + test on PRs, auto-deploy + auto-release on `main`
- **Daily metrics** — auto-generated GitHub stats SVGs via scheduled workflow
- **SEO ready** — sitemap, Open Graph tags, meta descriptions

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| [Node.js](https://nodejs.org) | 20+ | `node -v` |
| npm | 10+ (ships with Node 20) | `npm -v` |
| [Git](https://git-scm.com) | any | `git --version` |

---

## Quick Start

```bash
# 1. Fork & clone
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2. Install dependencies
npm install

# 3. Run the setup wizard (generates portfolio.config.ts from your answers)
npm run setup:init

# 4. (Optional) Edit config visually with the TUI editor
npm run setup:edit

# 5. Start the dev server
npm run dev
# → http://localhost:4321

# 6. Build for production
npm run build

# 7. Preview the production build
npm run preview
```

> **Tip:** The setup wizard builds a complete config from your answers. After initial setup, use `npm run setup:edit` for a visual, menu-driven editor. You can also copy the example manually: `cp src/config/portfolio.config.example.ts src/config/portfolio.config.ts`

---

## Setup Wizard

The interactive setup wizard (`npm run setup:init`) walks you through every section of the portfolio config and generates a fully populated `portfolio.config.ts`. No manual file editing required to get started.

### Running the Wizard

```bash
# Interactive mode — prompts for everything
npm run setup:init

# Non-interactive mode — generates a minimal valid config from flags
npm run setup:init -- --username janedoe --name "Jane Doe" --force

# Mix — CLI flags fill in what they can, prompts ask for the rest
npm run setup:init -- --username janedoe --name "Jane Doe" --theme dracula

# Launch the TUI config editor instead
npm run setup:init -- --tui
```

### Wizard Phases

The wizard collects information in 8 phases:

| Phase | What it collects | Config sections produced |
|-------|------------------|------------------------|
| **1. Identity & Site** | GitHub username, full name, professional title, site URL, logo suffix, theme, UTC offset | `site`, `github`, `boot` |
| **2. Hero** | Terminal greeting, typewriter texts | `hero` |
| **3. About You** | Codename, experience summary, location, clearance label, current role, arsenal (skills), mission log, aliases, focus, philosophy | `about` |
| **4. Tech Stack** | Categories with emoji and tech names (icons and URLs auto-resolved) | `techStack` |
| **5. Experience** | Date range, role, company, company URL, meta, achievements, tags | `experience` |
| **6. Projects** | Name, URL, description, tags, link text (icons auto-generated from first tag) | `projects` |
| **7. Integrations** | LeetCode, StackOverflow, HackerRank, LinkedIn, Twitter, contributions toggle, guestbook, testimonials | `leetcode?`, `stackoverflow?`, `hackerrank?`, `contributions`, `guestbook?`, `testimonials?`, `socials` |
| **8. Generate** | Assembles everything, writes config, patches `astro.config.mjs` and `lighthouse.yml` | All files |

### Phase Skipping (Edit Mode)

When `portfolio.config.ts` already exists, the wizard runs in **edit mode**. In edit mode, before Phases 2–7, you're asked "Edit Phase N: \<label\>?" — the default is **No** (skip), so you can press Enter to jump past sections you don't want to touch.

| Phase | Skippable? | On skip, preserved from existing config |
|-------|-----------|----------------------------------------|
| **1. Identity & Site** | No (required fields) | N/A |
| **2. Hero** | Yes | `greeting`, `typewriterTexts` |
| **3. About You** | Yes | All about fields (codename, experience, arsenal, etc.) |
| **4. Tech Stack** | Yes | `techStack` array |
| **5. Experience** | Yes | `experience` array |
| **6. Projects** | Yes | `projects` array |
| **7. Integrations** | Yes | All integrations, socials, sections, certifications |
| **8. Generate** | Always runs | N/A |

This makes edit-mode runs much faster — skip straight to the section you want to change.

### "Add Another?" Loops

Phases 3–6 use an "Add another?" pattern for dynamic-length arrays (arsenal entries, tech categories, experience entries, projects). The wizard enforces minimums — you must add at least one entry for required arrays like tech stack, experience, and projects.

### Auto-Resolved Icons and URLs

When you enter tech names in Phase 4 (Tech Stack) or tags in Phase 6 (Projects), the wizard automatically resolves:

- **Icons** via [skillicons.dev](https://skillicons.dev) — e.g., entering "React" produces `https://skillicons.dev/icons?i=react`
- **URLs** to official documentation — e.g., entering "TypeScript" produces `https://www.typescriptlang.org`

The wizard recognizes ~80 technologies by name. Unknown technologies get a best-effort skillicons URL and a Google search fallback URL.

### CLI Flags

All flags are optional. In interactive mode, flags pre-fill prompts. In non-interactive mode (`--username` and `--name` are required), flags provide values and everything else gets sensible defaults.

| Flag | Description | Example |
|------|-------------|---------|
| `--username` | GitHub username | `--username janedoe` |
| `--name` | Full name | `--name "Jane Doe"` |
| `--url` | Site URL | `--url "https://janedoe.dev"` |
| `--theme` | Default theme | `--theme dracula` |
| `--title` | Professional title | `--title "Full Stack Developer"` |
| `--utc-offset` | UTC offset for contribution graph | `--utc-offset -5` |
| `--greeting` | Hero terminal greeting | `--greeting "user@dev:~$"` |
| `--codename` | About section codename | `--codename jd` |
| `--experience` | Experience summary text | `--experience "5+ years"` |
| `--location` | Your location | `--location "NYC"` |
| `--current-op` | Current role/company | `--current-op "SDE @ Acme"` |
| `--focus` | Current focus area | `--focus "Cloud Architecture"` |
| `--logo-suffix` | Logo suffix | `--logo-suffix ".io"` |
| `--leetcode` | LeetCode username (enables integration) | `--leetcode janedoe` |
| `--stackoverflow` | StackOverflow user ID (enables integration) | `--stackoverflow 1234567` |
| `--hackerrank` | HackerRank username (enables integration) | `--hackerrank janedoe` |
| `--linkedin` | LinkedIn URL | `--linkedin "https://linkedin.com/in/jd"` |
| `--twitter` | Twitter/X URL | `--twitter "https://twitter.com/jd"` |
| `--force` | Overwrite existing config without prompting | `--force` |
| `--tui` | Launch the TUI config editor instead of the wizard | `--tui` |

### Non-Interactive Mode

When stdin is not a TTY (e.g., in CI or piped input), the wizard runs non-interactively:

- All prompts use their default values
- Array collectors (tech stack, experience, projects) produce sensible single-entry defaults
- `--username` and `--name` must be provided via CLI flags or the wizard exits with an error
- Placeholder certifications (both image and SVG badge types) are always included
- Contributions are enabled by default

```bash
# Minimal CI-friendly invocation
npm run setup:init -- --username janedoe --name "Jane Doe" --force
```

### What the Wizard Generates

1. **`src/config/portfolio.config.ts`** — Complete, type-safe config with all sections populated
2. **`astro.config.mjs`** — `site` and `base` fields patched to match your site URL
3. **`.github/workflows/lighthouse.yml`** — URL updated for Lighthouse CI

### After Running the Wizard

The generated config is fully functional but uses placeholder certifications. Review and customize:

1. Replace placeholder certifications with your real credentials
2. Run `npm run dev` to preview
3. Fine-tune any section by editing `src/config/portfolio.config.ts` directly — or use the TUI editor below

---

## TUI Config Editor

The TUI (Text User Interface) config editor (`npm run setup:edit`) provides a **menu-driven**, non-linear interface for editing your config. Instead of walking through the wizard sequentially, you can jump to any section and edit individual fields.

### Running the TUI Editor

```bash
# Direct invocation
npm run setup:edit

# Or via the wizard flag
npm run setup:init -- --tui
```

> **Requires:** An existing `portfolio.config.ts`. Run `npm run setup:init` first for initial setup.

### How It Works

The editor presents a **dashboard** showing all config sections with summaries. Select a section to edit, make changes, then return to the dashboard. When done, choose "Save & Exit" or "Discard & Exit".

```
┌─────────────────── Current Configuration ───────────────────┐
│  Site               name=Hammad Khan, title=Senior Full...  │
│  Hero               16 items                                │
│  About              codename=hammad_khan, title=Senior...   │
│  Tech Stack         6 items                                 │
│  Experience         6 items                                 │
│  Projects           5 items                                 │
│  Certifications     11 items                                │
│  Integrations       github, leetcode, stackoverflow, ...    │
│  Testimonials       13 items                                │
│  Socials            6 items                                 │
│  Sections           9 items                                 │
│  Boot               welcomeName=HAMMAD                      │
└─────────────────────────────────────────────────────────────┘
```

### Editing by Field Type

| Field Type | Editor | Interaction |
|------------|--------|-------------|
| Text | `text` prompt pre-filled with current value | Type to replace, Enter to keep |
| URL | `text` prompt with URL validation | Same as text |
| Number | `text` prompt with number validation | Same as text |
| Boolean | `confirm` toggle | Y/N |
| Select | Arrow-key selection (e.g. theme picker) | Arrow keys + Enter |
| String array | Numbered list with add/edit/delete | Select item or action |
| Key-value array | Key + value pairs with add/edit/delete | Two prompts per entry |
| Object array | Items listed by label, select to edit fields | Nested field editor |

### Integrations Sub-Menu

The **Integrations** section groups 8 config keys under one menu: GitHub, LeetCode, StackOverflow, HackerRank, Chat, Spotify, Contributions, and Guestbook. Optional integrations (LeetCode, StackOverflow, etc.) can be enabled or disabled with a toggle. Required integrations (GitHub, Contributions) can only be edited.

### Save Behavior

On "Save & Exit":
1. Serializes config to TypeScript and writes `portfolio.config.ts`
2. Patches `astro.config.mjs` (site/base from URL)
3. Patches `lighthouse.yml` URL
4. Preserves unknown top-level keys (hand-added config keys survive)

---

## Configuration Reference

All content lives in **`src/config/portfolio.config.ts`**. The file exports a single `PortfolioConfig` object. Every array is extensible — add more objects to grow any section automatically.

Type definitions: [`src/config/types.ts`](src/config/types.ts)

---

### `site`

Top-level site metadata used in `<head>`, navigation, and Open Graph tags.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | yes | Your full name (hero, footer, meta tags) |
| `title` | `string` | yes | Professional title |
| `description` | `string` | yes | Meta description for SEO |
| `url` | `string` | yes | Deployed site URL (must match `astro.config.mjs`) |
| `logoText` | `string` | yes | Navigation logo text |
| `logoSuffix` | `string` | no | Logo suffix (e.g. `.dev`, `.io`) |
| `theme` | `ThemeName` | no | Default theme on first visit (default: `hacker`) |

```typescript
site: {
  name: 'Jane Doe',
  title: 'Full Stack Developer',
  description: 'Jane Doe — Full Stack Developer...',
  url: 'https://janedoe.github.io/portfolio/',
  logoText: 'janedoe',
  logoSuffix: '.dev',
  theme: 'dracula',  // optional — sets the default
},
```

---

### `hero`

The landing section with a terminal prompt and typewriter animation.

| Field | Type | Description |
|-------|------|-------------|
| `greeting` | `string` | Terminal prompt text above your name |
| `typewriterTexts` | `string[]` | Strings that cycle in the typewriter effect |

```typescript
hero: {
  greeting: 'root@kali:~# whoami',
  typewriterTexts: [
    '> Full Stack Developer',
    '> Open Source Contributor',
    '> Root access granted. Welcome back.',
  ],
},
```

---

### `about`

Renders as a styled terminal/bash script card. Each field maps to a bash variable in the UI.

| Field | Type | Bash Variable | Description |
|-------|------|---------------|-------------|
| `codename` | `string` | `CODENAME` | Short handle |
| `title` | `string` | `TITLE` | Your role/title |
| `experience` | `string` | `EXPERIENCE` | Experience summary |
| `location` | `string` | `LOCATION` | Where you're based |
| `clearance` | `string` | `CLEARANCE` | Fun clearance level label |
| `currentOp` | `string` | `CURRENT_OP` | Current role/company |
| `arsenal` | `{ key, value }[]` | `ARSENAL` | Skills as key-value pairs |
| `missionLog` | `string[]` | `MISSION_LOG` | Notable achievements |
| `knownAliases` | `string[]` | `KNOWN_ALIASES` | Online handles |
| `currentFocus` | `string` | `CURRENT_FOCUS` | What you're working on |
| `philosophy` | `string[]` | `PHILOSOPHY` | One string per display line |

---

### `techStack`

Extensible grid of skill categories. **Add a new object = a new card appears automatically.**

```typescript
techStack: [
  {
    title: 'Frontend',
    emoji: '🎨',
    items: [
      {
        name: 'React',
        icon: 'https://techstack-generator.vercel.app/react-icon.svg',
        url: 'https://react.dev',
      },
      {
        name: 'My Logo',
        icon: 'my-logo.svg',       // file in public/
        url: 'https://example.com',
        isLocal: true,              // resolves relative to base URL
      },
    ],
  },
  // Add more categories here...
],
```

<details>
<summary><strong>Icon sources</strong></summary>

| Source | URL Pattern | Browse |
|--------|-------------|--------|
| SkillIcons | `https://skillicons.dev/icons?i=react` | [skillicons.dev](https://skillicons.dev) |
| TechStack Generator | `https://techstack-generator.vercel.app/react-icon.svg` | [GitHub](https://github.com/pheralb/techstack-generator) |
| DevIcon | `https://raw.githubusercontent.com/devicons/devicon/master/icons/{name}/{name}-original.svg` | [devicon.dev](https://devicon.dev) |
| Local files | Place in `public/`, set `isLocal: true` | — |

</details>

---

### `experience`

Timeline entries for your career journey. **Add a new object = a new timeline card.**

```typescript
experience: [
  {
    date: 'Jan 2023 &mdash; Present',  // HTML entities supported
    role: 'Senior Developer',
    company: 'Acme Corp',
    companyUrl: 'https://acme.com',
    meta: 'Full-time &middot; Remote',
    achievements: [
      'Led migration to microservices',
      'Reduced latency by 40%',
    ],
    tags: ['React', 'Node.js', 'AWS'],
  },
],
```

---

### `projects`

Card grid of your work. **Add a new object = a new project card.**

```typescript
projects: [
  {
    icon: 'https://skillicons.dev/icons?i=react',
    name: 'My Project',
    url: 'https://github.com/you/project',
    description: 'Description with <strong>HTML</strong> support.',
    tags: ['React', 'TypeScript'],
    linkText: 'View Repo',
    // For local icons:
    // icon: 'my-icon.svg', iconIsLocal: true,
  },
],
```

---

### `certifications`

Badge grid for certs and credentials. **Add a new object = a new cert card.**

Badges support two formats:

```typescript
// Image badge
badge: { type: 'image', src: 'https://...icon.svg', width: 50, alt: 'AWS' }

// Inline SVG badge
badge: { type: 'svg', svg: '<svg width="44" height="44">...</svg>' }
```

<details>
<summary><strong>Full certification example</strong></summary>

```typescript
certifications: [
  {
    href: 'https://example.com/cert',
    ariaLabel: 'View AWS certification',
    badge: {
      type: 'image',
      src: 'https://techstack-generator.vercel.app/aws-icon.svg',
      width: 50,
      alt: 'AWS',
    },
    category: 'Cloud',
    name: 'AWS Solutions Architect',
    issuer: 'Amazon Web Services',
    date: 'January 2024',  // optional
  },
],
```

</details>

---

### Analytics: `github`, `leetcode`, `stackoverflow`, `hackerrank`

The analytics dashboard is conditionally rendered based on which keys are present.

| Key | Required | Fields | Effect |
|-----|----------|--------|--------|
| `github` | **yes** | `username`, `utcOffset` | GitHub stats tabs (overview, activity, trophies, languages, contributions) |
| `leetcode` | no | `username` | LeetCode stats card. **Remove key to hide.** |
| `stackoverflow` | no | `userId` | StackOverflow flair card. **Remove key to hide.** |
| `hackerrank` | no | `username` | Used for social link only (no public stats API) |

```typescript
github: { username: 'janedoe', utcOffset: -8 },
leetcode: { username: 'janedoe' },         // optional
stackoverflow: { userId: 1234567 },        // optional
hackerrank: { username: 'janedoe' },       // optional
```

All analytics images re-theme automatically when users switch themes.

---

### `socials`

Array of social links rendered in the footer. Supported platforms: `github`, `linkedin`, `twitter`, `stackoverflow`, `leetcode`, `hackerrank`.

**Auto-generated URLs:** For `github`, `leetcode`, `stackoverflow`, and `hackerrank`, the URL is automatically built from the corresponding analytics config. You only need an explicit `url` for platforms without a dedicated config key (like `linkedin` and `twitter`) or to override the generated URL.

```typescript
socials: [
  { platform: 'github', label: 'GitHub' },                                         // auto-generated
  { platform: 'linkedin', url: 'https://linkedin.com/in/janedoe', label: 'LinkedIn' }, // explicit
  { platform: 'twitter', url: 'https://twitter.com/janedoe', label: 'Twitter' },       // explicit
  { platform: 'stackoverflow', label: 'Stack Overflow' },                           // auto-generated
  { platform: 'leetcode', label: 'LeetCode' },                                     // auto-generated
  { platform: 'hackerrank', label: 'HackerRank' },                                 // auto-generated
],
```

Only include platforms you use — icons render automatically for each entry.

---

### `sections`

Ordered array that generates the navigation bar. Reorder, add, or remove entries to update the nav.

```typescript
sections: [
  { id: 'about', label: 'About' },
  { id: 'tech', label: 'Skills' },
  { id: 'journey', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'certs', label: 'Certifications' },
],
```

---

### `boot`

The boot sequence animation shown on first page load.

| Field | Type | Description |
|-------|------|-------------|
| `welcomeName` | `string` | Displayed as `>>> WELCOME, {NAME} <<<` |

```typescript
boot: {
  welcomeName: 'JANE',
},
```

---

### `guestbook`

Giscus-powered GitHub Discussions embed with optional stats API.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `giscus.repo` | `string` | yes | GitHub repo in `owner/repo` format |
| `giscus.repoId` | `string` | yes | Repository ID from Giscus setup |
| `giscus.category` | `string` | yes | Discussion category name |
| `giscus.categoryId` | `string` | yes | Category ID from Giscus setup |
| `statsApi` | `string` | no | URL to your stats Cloudflare Worker |

```typescript
guestbook: {
  giscus: {
    repo: 'janedoe/janedoe.github.io',
    repoId: 'R_kgDOxxxxxxx',
    category: 'General',
    categoryId: 'DIC_kwDOxxxxxxx',
  },
  statsApi: 'https://your-stats-worker.workers.dev', // optional
},
```

**Remove the entire `guestbook` key to disable.**

---

### `contributions`

Enables the OSS contributions section showing your merged PRs to external repos.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `enabled` | `boolean` | yes | Toggle the section |
| `excludeOrgs` | `string[]` | no | GitHub orgs to exclude |
| `minStars` | `number` | no | Minimum stars threshold for displayed repos |
| `maxItems` | `number` | no | Max contributions to show |

```typescript
contributions: {
  enabled: true,
  excludeOrgs: [],
  minStars: 0,
  maxItems: 20,
},
```

**Remove the entire `contributions` key to disable.**

---

### `testimonials`

Testimonial quotes displayed in a dedicated section.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `quote` | `string` | yes | The testimonial text |
| `author` | `string` | yes | Person's name |
| `role` | `string` | no | Job title |
| `company` | `string` | no | Company name |
| `avatar` | `string` | no | URL to avatar image |

```typescript
testimonials: [
  {
    quote: 'An exceptional developer who delivers quality work.',
    author: 'John Smith',
    role: 'Engineering Manager',
    company: 'Acme Corp',
    avatar: 'https://example.com/avatar.jpg',
  },
],
```

**Remove the entire `testimonials` key to disable.**

---

## Theming

### Built-in Themes

The portfolio ships with 15 themes. Users can switch at any time via the theme picker in the navigation bar.

| Theme | Accent Color | Background | Vibe |
|-------|-------------|------------|------|
| **Hacker** | `#00bfbf` Cyan | Dark | Classic terminal hacker |
| **Dracula** | `#BD93F9` Purple | Dark | Popular dark theme |
| **Nord** | `#88C0D0` Frost Blue | Dark | Calm arctic palette |
| **Catppuccin** | `#CBA6F7` Lavender | Dark | Soothing pastel dark |
| **Synthwave** | `#FF2E97` Hot Pink | Dark | Retro 80s neon |
| **Matrix** | `#00FF41` Neon Green | Dark | The Matrix rain |
| **Blood Moon** | `#FF0040` Crimson | Dark | Red eclipse |
| **Midnight** | `#7B73FF` Purple | Dark | Deep night purple |
| **Arctic** | `#0369A1` Deep Blue | Light | Clean light mode |
| **Gruvbox** | `#FABD2F` Gold | Dark | Warm retro coding |
| **Cyberpunk** | `#FFD700` Electric Gold | Dark | Neon-lit future city |
| **Nebula** | `#E040FB` Cosmic Purple | Dark | Deep space cosmic |
| **Solarized** | `#268BD2` Classic Blue | Dark | Precision-engineered colors |
| **Rosé Pine** | `#EA9A97` Muted Rose | Dark | Soft natural palette |
| **Monokai** | `#A6E22E` Neon Green | Dark | Classic code editor |

### Setting the Default Theme

Set `site.theme` in your config to any `ThemeName`:

```typescript
site: {
  // ...
  theme: 'dracula',  // visitors see Dracula on first visit
},
```

If omitted, the default is `hacker`. Users' theme choices are persisted to `localStorage` and restored on return visits.

### Theme Switcher Behavior

- Click the sun icon in the nav bar to open the theme picker
- Each theme applies unique effects (matrix rain, CRT overlay, canvas particles, etc.)
- Smooth transitions via the View Transition API (when supported)
- Theme-specific analytics images update automatically
- Keyboard: press `Escape` to close the picker

---

## Project Structure

```
.
├── .github/workflows/
│   ├── ci.yml                       # Lint + build + test on PRs
│   ├── deploy.yml                   # Build → GitHub Pages → auto-release
│   ├── contributions.yml            # Update OSS contributions table
│   ├── lighthouse.yml               # Lighthouse CI scores
│   ├── metrics.yml                  # Daily GitHub stats SVGs
│   ├── snake.yml                    # Daily contribution snake animation
│   ├── deploy-worker.yml            # Deploy stats Cloudflare Worker
│   └── deploy-chat-worker.yml       # Deploy chat Cloudflare Worker
├── public/
│   ├── fonts/
│   │   ├── firacode-latin.woff2     # Monospace font (code blocks)
│   │   └── inter-latin.woff2        # Sans-serif font (body text)
│   ├── favicon.svg                  # Site favicon
│   ├── og-image.png                 # Open Graph social image
│   └── robots.txt                   # SEO robots config
├── scripts/
│   ├── setup.mjs                    # Interactive setup wizard (phase-skip gates)
│   ├── setup-tui.mjs                # TUI config editor (menu-driven)
│   ├── lib/
│   │   ├── github.mjs               # GitHub API helpers
│   │   └── setup-utils.mjs          # Shared constants, serializer, validators
│   ├── fetch-all-data.mjs           # Pre-build data fetcher
│   ├── fetch-contributions.mjs      # GitHub contributions fetcher
│   ├── fetch-contribution-graph.mjs # Contribution graph data
│   └── fetch-projects.mjs           # GitHub projects fetcher
├── src/
│   ├── __tests__/                   # Accessibility tests
│   ├── components/
│   │   ├── react/                   # React island components
│   │   │   ├── hooks/               # useTheme, useReducedMotion, etc.
│   │   │   ├── ScrollReveal.tsx     # Scroll-triggered reveal
│   │   │   ├── ProjectCard.tsx      # Animated project cards
│   │   │   └── ...
│   │   ├── About.astro              # Terminal-style bio card
│   │   ├── Analytics.astro          # GitHub/LeetCode/SO stats
│   │   ├── Certifications.astro     # Cert badge grid
│   │   ├── Contributions.astro      # OSS contributions section
│   │   ├── Footer.astro             # Footer with socials
│   │   ├── GlobalOverlays.astro     # CRT, matrix rain overlays
│   │   ├── Guestbook.astro          # Giscus guestbook embed
│   │   ├── Hero.astro               # Landing section
│   │   ├── Journey.astro            # Career timeline
│   │   ├── Nav.astro                # Navigation + theme switcher
│   │   ├── Projects.astro           # Project card grid
│   │   ├── SocialLinks.astro        # Social icon links
│   │   ├── Testimonials.astro       # Testimonials section
│   │   └── TechArsenal.astro        # Skills grid
│   ├── config/
│   │   ├── portfolio.config.ts      # ← YOUR CONFIG FILE
│   │   ├── portfolio.config.example.ts  # Template to copy
│   │   ├── types.ts                 # TypeScript interfaces
│   │   ├── socials.ts               # Social URL auto-generation
│   │   ├── theme-colors.ts          # Browser meta theme colors
│   │   └── index.ts                 # Config barrel export
│   ├── data/                        # Build-time fetched data (lighthouse, contributions)
│   ├── layouts/
│   │   └── Layout.astro             # HTML shell, <head>, fonts
│   ├── pages/
│   │   └── index.astro              # Single-page entry point
│   ├── scripts/
│   │   ├── effects/                 # Boot, canvas, cursor, matrix, etc.
│   │   ├── interactions/            # Nav, scroll, tilt, konami, etc.
│   │   ├── theme-data/              # Per-theme branding, prompts, etc.
│   │   ├── main.ts                  # Script entry point
│   │   ├── theme-config.ts          # Per-theme logos, prompts, effects
│   │   └── theme-switcher.ts        # Theme switching logic
│   └── styles/
│       ├── base/                    # Reset, tokens, typography
│       ├── effects/                 # Boot, cursor, glitch, overlays
│       ├── layout/                  # Glass, sections, scroll-reveal
│       ├── themes/
│       │   └── _themes.scss         # All 15 theme definitions
│       ├── responsive/              # Media queries
│       ├── utilities/               # Skip link, separators, etc.
│       ├── _mixins.scss             # Shared SCSS mixins
│       └── global.scss              # Main stylesheet entry
├── astro.config.mjs                 # Site URL + base path
├── biome.json                       # Linter & formatter config
├── vitest.config.ts                 # Test runner config
├── tsconfig.json                    # TypeScript config with path aliases
└── package.json                     # Dependencies & scripts
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at `http://localhost:4321` with hot reload |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run tests once with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Lint `src/` with Biome |
| `npm run format` | Auto-fix lint + formatting issues in `src/` |
| `npm run typecheck` | TypeScript type checking via `astro check` |
| `npm run setup` | Fetch all build-time data (contributions, projects) |
| `npm run setup:init` | Interactive setup wizard — generates config from prompts |
| `npm run setup:edit` | TUI config editor — menu-driven visual config editing |

---

## CI/CD Pipeline

Three GitHub Actions workflows handle quality gates, deployment, and metrics.

### CI — Pull Request Checks (`.github/workflows/ci.yml`)

Runs on every PR targeting `main`.

| Job | Steps | Purpose |
|-----|-------|---------|
| **Lint** | `npm ci` → `npm run lint` | Code style & quality |
| **Build & Test** | `npm ci` → `npm run build` → `npm test` | Compilation + test suite |

Both jobs must pass before merging.

### Deploy — Production (`.github/workflows/deploy.yml`)

Runs on every push to `main` (ignores `metrics.*.svg` changes).

| Job | Steps | Purpose |
|-----|-------|---------|
| **Build & Deploy** | `npm ci` → `npm run build` → upload artifact → deploy to GitHub Pages | Ship to production |
| **Release** | Check version tag → bump patch if exists → create GitHub Release with auto-generated notes | Automatic versioning |

The release job auto-bumps the patch version (e.g. `1.2.1` → `1.2.2`) and creates a tagged GitHub Release. Version bump commits use `[skip ci]` to prevent infinite loops.

**Manual major/minor bumps:**

```bash
npm version minor --no-git-tag-version   # 1.2.x → 1.3.0
npm version major --no-git-tag-version   # 1.x.x → 2.0.0
# Commit and push — the release job creates the new tag
```

### Metrics — Daily Stats (`.github/workflows/metrics.yml`)

Runs daily at 04:30 UTC (also supports `workflow_dispatch`).

| Generated File | Content |
|----------------|---------|
| `metrics.classic.svg` | Profile overview (activity, community, repos) |
| `metrics.plugin.isocalendar.fullyear.svg` | Full-year contribution calendar |
| `metrics.plugin.languages.svg` | Most-used programming languages |
| `metrics.plugin.stars.svg` | Recently starred repositories |
| `metrics.plugin.leetcode.svg` | LeetCode stats |

**Required secret:** `METRICS_TOKEN` — a GitHub PAT with `repo` scope, stored in the `production` environment.

To set it up:
1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Generate a token with `repo` scope
3. In your repo: **Settings → Environments → production → Add secret → `METRICS_TOKEN`**

### Optional Workflows

These workflows enhance the portfolio but can be safely deleted if you don't need them:

| Workflow | File | Purpose | Safe to delete? |
|----------|------|---------|-----------------|
| **Metrics** | `metrics.yml` | Daily GitHub stats SVGs | Yes — removes analytics images from README |
| **Snake** | `snake.yml` | Contribution snake animation | Yes — decorative only |
| **Contributions** | `contributions.yml` | OSS contributions README table | Yes — only affects README |
| **Lighthouse** | `lighthouse.yml` | Lighthouse CI scores | Yes — removes automated score tracking |
| **Deploy Worker** | `deploy-worker.yml` | Stats Cloudflare Worker | Yes — only needed for guestbook stats |
| **Deploy Chat Worker** | `deploy-chat-worker.yml` | Chat Cloudflare Worker | Yes — only needed for AI chat feature |

### Username Override

All workflows auto-detect your GitHub username via `github.repository_owner` — no YAML editing needed for forks.

To override (e.g., when your GitHub username differs from your display name):

1. Go to **Settings → Secrets and variables → Actions → Variables**
2. Create a repository variable: `PORTFOLIO_USERNAME` = your desired username
3. (Optional) Create `LEETCODE_USERNAME` if your LeetCode username differs

---

## Deployment Guide

### GitHub Pages (Default)

This is pre-configured. Just enable it:

1. Go to **repo Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Update `astro.config.mjs` with your URL:

```javascript
export default defineConfig({
  site: 'https://<username>.github.io',
  base: '/<repo-name>',   // or '/' for user.github.io repos
  compressHTML: true,
  integrations: [sitemap()],
});
```

4. Update `site.url` in your portfolio config to match
5. Push to `main` — the deploy workflow handles the rest

### Custom Domain

1. In **repo Settings → Pages → Custom domain**, enter your domain
2. Add DNS records (per [GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)):
   - **Apex domain:** four `A` records pointing to GitHub's IPs + a `CNAME` for `www`
   - **Subdomain:** a single `CNAME` record
3. Update `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://yourdomain.com',
  base: '/',
});
```

4. Enable **Enforce HTTPS** in Pages settings

### Vercel

```bash
npm i -g vercel
vercel
# Follow the prompts — framework is auto-detected as Astro
```

Set `base: '/'` in `astro.config.mjs` for root-domain deploys.

### Netlify

```bash
npm i -g netlify-cli
netlify init
netlify deploy --prod
```

Or connect the repo in the Netlify dashboard — build command: `npm run build`, publish directory: `dist`.

---

## Customization Beyond Config

### Fonts

Fonts live in `public/fonts/`. The default setup uses:
- **Fira Code** — monospace, used for code and terminal elements
- **Inter** — sans-serif, used for body text

To swap fonts:
1. Add your `.woff2` files to `public/fonts/`
2. Update the `@font-face` declarations in `src/layouts/Layout.astro`
3. Update the font-family references in `src/styles/base/_tokens.scss`

### Favicon & Open Graph Image

| File | Purpose | Recommended |
|------|---------|-------------|
| `public/favicon.svg` | Browser tab icon | SVG for scalability |
| `public/og-image.png` | Social media preview card | 1200 x 630px |

Replace these files directly — filenames must stay the same.

### Styles

The styling system uses SCSS with design tokens:

- **Design tokens:** `src/styles/base/_tokens.scss` — spacing, radii, z-indices, transition durations
- **Theme definitions:** `src/styles/themes/_themes.scss` — all CSS custom properties per theme
- **Mixins:** `src/styles/_mixins.scss` — reusable patterns

Key CSS variables available in every theme:

```css
--bg          /* page background */
--bg-card     /* transparent card background */
--accent      /* primary accent color */
--accent-blue /* secondary accent */
--accent-mint /* tertiary accent */
--text        /* primary text */
--text-dim    /* muted text */
--border      /* card borders */
--glass-bg    /* glassmorphism background */
```

### Components

All components are `.astro` files in `src/components/`. They receive data from the config via the barrel export in `src/config/index.ts`. To modify a section's layout or markup, edit the corresponding component directly.

Path aliases available in `tsconfig.json`:

```typescript
import config from '@config/portfolio.config';
import { someUtil } from '@scripts/utils';
```

---

## Testing

Tests use [Vitest](https://vitest.dev) with [happy-dom](https://github.com/nicedayfor/happy-dom) for DOM simulation.

```bash
npm test              # run once
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

### Coverage

Coverage is collected with the following thresholds:

| Metric | Threshold |
|--------|-----------|
| Statements | 60% |
| Branches | 50% |
| Functions | 58% |
| Lines | 60% |

Tests live alongside the code they cover:

```
src/config/__tests__/config.test.ts
src/config/__tests__/types.test.ts
src/config/__tests__/about-builder.test.ts
src/scripts/__tests__/theme-logos.test.ts
src/scripts/__tests__/nav-logo.test.ts
src/scripts/__tests__/status-bar-config.test.ts
src/__tests__/a11y.test.ts
```

---

## Troubleshooting

<details>
<summary><strong>Dev server won't start</strong></summary>

```bash
# Clear caches and reinstall
rm -rf node_modules .astro dist
npm install
npm run dev
```

Make sure you're on Node.js 20+: `node -v`

</details>

<details>
<summary><strong>Build fails with config errors</strong></summary>

Ensure `src/config/portfolio.config.ts` exists and exports a valid `PortfolioConfig` object. Compare against `portfolio.config.example.ts` for the expected shape.

Common issues:
- Missing required fields (check `src/config/types.ts` for the interface)
- Trailing commas in JSON-like positions (TypeScript allows them, but check for syntax errors)
- Incorrect import: the file must `export default config`

</details>

<details>
<summary><strong>GitHub Pages shows 404</strong></summary>

1. Verify **Settings → Pages → Source** is set to **GitHub Actions** (not "Deploy from branch")
2. Check that `site` and `base` in `astro.config.mjs` match your GitHub Pages URL:
   - User/org site (`username.github.io`): `base: '/'`
   - Project site (`username.github.io/repo`): `base: '/repo'`
3. Ensure the deploy workflow ran successfully (check **Actions** tab)

</details>

<details>
<summary><strong>Metrics workflow fails</strong></summary>

The metrics workflow requires a `METRICS_TOKEN` secret in the `production` environment:

1. Create a [GitHub PAT](https://github.com/settings/tokens) with `repo` scope
2. Go to **repo Settings → Environments → production**
3. Add a secret named `METRICS_TOKEN` with the PAT value

</details>

<details>
<summary><strong>Fonts not loading</strong></summary>

- Verify `.woff2` files exist in `public/fonts/`
- Check that `@font-face` `src` paths in `Layout.astro` match the filenames
- In production, ensure `base` in `astro.config.mjs` is correct (fonts resolve relative to it)

</details>

<details>
<summary><strong>Theme not persisting on refresh</strong></summary>

Theme selection is stored in `localStorage` under the key `portfolio-theme`. If it resets:
- Check that JavaScript is not blocked
- Clear localStorage and try again: `localStorage.removeItem('portfolio-theme')`
- Verify no browser extension is clearing storage

</details>

---

## License

This project is open source. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with [Astro](https://astro.build)**

[Back to top](#hacker-portfolio--template-setup-guide)

</div>
