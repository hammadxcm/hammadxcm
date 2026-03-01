<div align="center">

# 🖥️ Hacker Portfolio — Template Setup Guide

**A config-driven, hacker-themed developer portfolio built with [Astro](https://astro.build).**
**Fork it, edit one file, deploy in under 5 minutes.**

[Live Demo](https://hk.fyniti.co.uk) · [Report Bug](https://github.com/hammadxcm/hammadxcm/issues) · [Request Feature](https://github.com/hammadxcm/hammadxcm/issues)

</div>

---

## ✨ Features

- **Zero-framework frontend** — pure Astro with no client-side React/Vue/Svelte
- **Single config file** — every section is driven by `src/config/portfolio.config.ts`
- **10 built-in themes** — hacker, dracula, nord, catppuccin, synthwave, matrix, bloodmoon, midnight, arctic, gruvbox
- **Boot sequence animation** — terminal-style loading screen on first visit
- **Interactive effects** — matrix rain, CRT overlay, custom cursor, card tilt, konami code easter egg
- **Analytics dashboard** — GitHub stats, LeetCode, StackOverflow (all optional & theme-aware)
- **Responsive** — mobile-first, works on every screen size
- **Accessible** — semantic HTML, skip links, keyboard navigation, ARIA labels
- **CI/CD included** — lint + test on PRs, auto-deploy + auto-release on `main`
- **Daily metrics** — auto-generated GitHub stats SVGs via scheduled workflow
- **SEO ready** — sitemap, Open Graph tags, meta descriptions

---

## 📋 Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| [Node.js](https://nodejs.org) | 20+ | `node -v` |
| npm | 10+ (ships with Node 20) | `npm -v` |
| [Git](https://git-scm.com) | any | `git --version` |

---

## 🚀 Quick Start

```bash
# 1. Fork & clone
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2. Install dependencies
npm install

# 3. Copy the example config
cp src/config/portfolio.config.example.ts src/config/portfolio.config.ts

# 4. Edit with your details
#    Open src/config/portfolio.config.ts in your editor

# 5. Start the dev server
npm run dev
# → http://localhost:4321

# 6. Build for production
npm run build

# 7. Preview the production build
npm run preview
```

> **Tip:** The example config (`portfolio.config.example.ts`) contains placeholder data for "Jane Doe". Replace every field with your own information.

---

## 📖 Configuration Reference

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

## 🎨 Theming

### Built-in Themes

The portfolio ships with 10 themes. Users can switch at any time via the theme picker in the navigation bar.

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

## 📁 Project Structure

```
.
├── .github/workflows/
│   ├── ci.yml                       # Lint + build + test on PRs
│   ├── deploy.yml                   # Build → GitHub Pages → auto-release
│   ├── metrics.yml                  # Daily GitHub stats SVGs
│   └── snake.yml                    # Daily contribution snake animation
├── public/
│   ├── fonts/
│   │   ├── firacode-latin.woff2     # Monospace font (code blocks)
│   │   └── inter-latin.woff2        # Sans-serif font (body text)
│   ├── favicon.svg                  # Site favicon
│   ├── og-image.png                 # Open Graph social image
│   └── robots.txt                   # SEO robots config
├── src/
│   ├── __tests__/                   # Accessibility tests
│   ├── components/
│   │   ├── About.astro              # Terminal-style bio card
│   │   ├── Analytics.astro          # GitHub/LeetCode/SO stats
│   │   ├── Certifications.astro     # Cert badge grid
│   │   ├── Footer.astro             # Footer with socials
│   │   ├── GlobalOverlays.astro     # CRT, matrix rain overlays
│   │   ├── Hero.astro               # Landing section
│   │   ├── Journey.astro            # Career timeline
│   │   ├── Nav.astro                # Navigation + theme switcher
│   │   ├── Projects.astro           # Project card grid
│   │   ├── SocialLinks.astro        # Social icon links
│   │   └── TechArsenal.astro        # Skills grid
│   ├── config/
│   │   ├── portfolio.config.ts      # ← YOUR CONFIG FILE
│   │   ├── portfolio.config.example.ts  # Template to copy
│   │   ├── types.ts                 # TypeScript interfaces
│   │   ├── socials.ts               # Social URL auto-generation
│   │   ├── theme-colors.ts          # Browser meta theme colors
│   │   └── index.ts                 # Config barrel export
│   ├── layouts/
│   │   └── Layout.astro             # HTML shell, <head>, fonts
│   ├── pages/
│   │   └── index.astro              # Single-page entry point
│   ├── scripts/
│   │   ├── effects/                 # Boot, canvas, cursor, matrix, etc.
│   │   ├── interactions/            # Nav, scroll, tilt, konami, etc.
│   │   ├── main.ts                  # Script entry point
│   │   ├── theme-config.ts          # Per-theme logos, prompts, effects
│   │   └── theme-switcher.ts        # Theme switching logic
│   └── styles/
│       ├── base/                    # Reset, tokens, typography
│       ├── effects/                 # Boot, cursor, glitch, overlays
│       ├── layout/                  # Glass, sections, scroll-reveal
│       ├── themes/
│       │   └── _themes.scss         # All 10 theme definitions
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

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at `http://localhost:4321` with hot reload |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run tests once with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint `src/` with Biome |
| `npm run format` | Auto-fix lint + formatting issues in `src/` |

---

## ⚙️ CI/CD Pipeline

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

---

## 🌐 Deployment Guide

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

## 🔧 Customization Beyond Config

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

## 🧪 Testing

Tests use [Vitest](https://vitest.dev) with [happy-dom](https://github.com/nicedayfor/happy-dom) for DOM simulation.

```bash
npm test              # run once
npm run test:watch    # watch mode
```

### Coverage

Coverage is collected for `src/config/**` with the following thresholds:

| Metric | Threshold |
|--------|-----------|
| Statements | 80% |
| Branches | 80% |
| Functions | 80% |
| Lines | 80% |

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

## ❓ Troubleshooting

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

## 📄 License

This project is open source. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with [Astro](https://astro.build)**

[Back to top](#-hacker-portfolio--template-setup-guide)

</div>
