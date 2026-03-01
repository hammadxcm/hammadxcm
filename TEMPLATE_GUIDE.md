# Portfolio Template Guide

A config-driven hacker-themed developer portfolio built with Astro. Fork it, edit one config file, and deploy.

## Quick Start (5 minutes)

1. **Fork** this repository
2. **Edit** `src/config/portfolio.config.ts` with your info (copy from `portfolio.config.example.ts` to start fresh)
3. **Add** your images to `public/images/`
4. **Push** — GitHub Pages deploys automatically

```bash
# Local development
npm install
npm run dev     # http://localhost:4321
npm run build   # production build
```

## Config Reference

All content lives in `src/config/portfolio.config.ts`. Here's what each section controls:

### `site`
| Field | Description | Example |
|-------|-------------|---------|
| `name` | Your full name (used in hero, footer, meta tags) | `"Jane Doe"` |
| `title` | Professional title | `"Full Stack Developer"` |
| `description` | Meta description for SEO | `"Jane Doe — Full Stack Developer..."` |
| `url` | Deployed site URL (used in OG tags) | `"https://janedoe.github.io/portfolio/"` |
| `logoText` | Nav logo text | `"janedoe"` |
| `logoSuffix` | Nav logo suffix (default: `.dev`) | `".io"` |

### `hero`
| Field | Description |
|-------|-------------|
| `greeting` | Terminal prompt text above your name |
| `typewriterTexts` | Array of strings that cycle in the typewriter effect |

### `about`
The "About Me" section renders as a styled bash script. All fields map to bash variables:

| Field | Bash Variable |
|-------|--------------|
| `codename` | `CODENAME` |
| `title` | `TITLE` |
| `experience` | `EXPERIENCE` |
| `location` | `LOCATION` |
| `clearance` | `CLEARANCE` |
| `currentOp` | `CURRENT_OP` |
| `arsenal` | `ARSENAL` associative array — `[{ key, value }]` |
| `missionLog` | `MISSION_LOG` array — `string[]` |
| `knownAliases` | `KNOWN_ALIASES` — `string[]` |
| `currentFocus` | `CURRENT_FOCUS` |
| `philosophy` | `PHILOSOPHY` — `string[]` (one string per display line) |

### `techStack`
Array of category objects. **Add a new object = new tech card appears automatically.**

```ts
{
  title: 'Mobile',           // card title
  emoji: '📱',               // displayed before title
  items: [
    {
      name: 'React Native',
      icon: 'https://skillicons.dev/icons?i=react',
      url: 'https://reactnative.dev',
    },
    {
      name: 'My Logo',
      icon: 'my-logo.svg',       // file in public/
      url: 'https://example.com',
      isLocal: true,              // prefix with base URL
    },
  ],
}
```

### `experience`
Array of timeline entries. **Add a new object = new journey card.**

```ts
{
  date: 'Jan 2023 &mdash; Present',  // supports HTML entities
  role: 'Senior Developer',
  company: 'Acme Corp',
  companyUrl: 'https://acme.com',
  meta: 'Full-time &middot; Remote',  // supports HTML entities
  achievements: [                      // supports HTML entities
    'Led migration to microservices',
    'Reduced latency by 40%',
  ],
  tags: ['React', 'Node.js', 'AWS'],
}
```

### `projects`
Array of project cards. **Add a new object = new project card.**

```ts
{
  icon: 'https://skillicons.dev/icons?i=react',
  name: 'My Project',
  url: 'https://github.com/you/project',
  description: 'Description with <strong>HTML</strong> support.',
  tags: ['React', 'TypeScript'],
  linkText: 'View Repo',
  // For local icons:
  // icon: 'my-icon.svg', iconIsLocal: true,
}
```

### `certifications`
Array of certification cards. **Add a new object = new cert card.**

Badges can be images or inline SVG:
```ts
// Image badge
{ type: 'image', src: 'https://...icon.svg', width: 44, alt: 'AWS' }

// SVG badge (inline)
{ type: 'svg', svg: '<svg width="44" height="44">...</svg>' }
```

### `github`
| Field | Description |
|-------|-------------|
| `username` | Your GitHub username (used in analytics URLs) |
| `utcOffset` | Your UTC offset for the productive-time chart |

### `leetcode` (optional)
Remove this key entirely to hide the LeetCode analytics section.

| Field | Description | Example |
|-------|-------------|---------|
| `username` | Your LeetCode username | `"janedoe"` |

```ts
leetcode: { username: 'janedoe' },
```

### `stackoverflow` (optional)
Remove this key entirely to hide the StackOverflow analytics section.

| Field | Description | Example |
|-------|-------------|---------|
| `userId` | Your numeric StackOverflow user ID (from your profile URL) | `1234567` |

```ts
stackoverflow: { userId: 1234567 },
```

### `hackerrank` (optional)
Used for the social link icon. No public stats badge API exists, so this does not render an analytics section.

| Field | Description | Example |
|-------|-------------|---------|
| `username` | Your HackerRank username | `"janedoe"` |

```ts
hackerrank: { username: 'janedoe' },
```

### `socials`
Array of social links. Supported platforms: `github`, `linkedin`, `twitter`, `stackoverflow`, `leetcode`, `hackerrank`.

```ts
socials: [
  { platform: 'github', url: 'https://github.com/janedoe', label: 'GitHub' },
  { platform: 'linkedin', url: 'https://linkedin.com/in/janedoe', label: 'LinkedIn' },
  { platform: 'twitter', url: 'https://twitter.com/janedoe', label: 'Twitter' },
  { platform: 'stackoverflow', url: 'https://stackoverflow.com/users/1234567', label: 'Stack Overflow' },
  { platform: 'leetcode', url: 'https://leetcode.com/u/janedoe', label: 'LeetCode' },
  { platform: 'hackerrank', url: 'https://www.hackerrank.com/profile/janedoe', label: 'HackerRank' },
],
```

Only include platforms you use — icons render automatically for each entry.

### `sections`
Ordered array that generates the navigation. Reorder, add, or remove entries to update the nav.

### `boot.welcomeName`
The name shown in the boot sequence: `>>> WELCOME, {NAME} <<<`

## Analytics Dashboard

The analytics section is fully config-driven. GitHub stats always render (required), while LeetCode and StackOverflow are optional and conditionally rendered.

**How it works:**
- **GitHub**: Tabbed panels (Overview, Activity, Trophies, Languages, Summary, Contributions, Stars) with theme-aware stat cards that update automatically on theme switch
- **LeetCode**: Tabbed card switching between Activity, Heatmap, and Contest views. Remove the `leetcode` key from config to hide entirely
- **StackOverflow**: Responsive layout that shows full/compact/small variants per breakpoint. Remove the `stackoverflow` key from config to hide entirely
- **Dev Quote**: A random developer quote displayed at the bottom of the analytics section, themed to match the active theme

All analytics images re-theme automatically when users switch between the 10 available themes.

## Image Guide

Place images in the organized directories:

```
public/images/
├── profile/     → profile photos
├── projects/    → project screenshots
└── badges/      → certification badge images
```

Reference in config with `isLocal: true`:
```ts
{ icon: 'images/projects/my-app.png', iconIsLocal: true, ... }
```

**Recommended sizes:**
- Project icons: 48x48 or use CDN icon services
- Cert badges: 44-50px wide
- Profile photos: 400x400+

## Tech Icon Sources

- **SkillIcons**: `https://skillicons.dev/icons?i=react` — [Browse all](https://skillicons.dev)
- **TechStack Generator**: `https://techstack-generator.vercel.app/react-icon.svg` — [Browse](https://github.com/pheralb/techstack-generator)
- **DevIcon**: `https://raw.githubusercontent.com/devicons/devicon/master/icons/{name}/{name}-original.svg`
- **Inline SVG data URIs**: For custom icons, use `data:image/svg+xml,...`

## Deployment

### GitHub Pages (pre-configured)

1. Go to repo Settings > Pages
2. Set Source to **GitHub Actions**
3. Push to `main` — the workflow in `.github/workflows/` handles the rest

Update `astro.config.mjs` with your repo details:
```js
export default defineConfig({
  site: 'https://yourusername.github.io',
  base: '/your-repo-name',
});
```

And update `config.site.url` to match.

### Other Platforms

The `npm run build` output in `dist/` works on any static hosting (Vercel, Netlify, Cloudflare Pages). For root-domain deploys, set `base: '/'` in `astro.config.mjs`.
