# Contributing

Thanks for your interest in contributing to this project.

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install
npm run dev
```

The dev server runs at `http://localhost:4321`.

### Build

```bash
npm run build
npm run preview   # preview the production build locally
```

## Project Structure

```
src/
├── pages/
│   └── index.astro              # Main page
├── layouts/
│   └── Layout.astro             # HTML wrapper, meta tags, fonts
├── components/
│   ├── react/                   # React island components
│   │   ├── hooks/               # useTheme, useReducedMotion, etc.
│   │   ├── ScrollReveal.tsx     # Scroll-triggered reveal wrapper
│   │   ├── ProjectCard.tsx      # Animated project cards
│   │   └── ...
│   ├── Nav.astro                # Navigation
│   ├── Hero.astro               # Hero section
│   ├── About.astro              # About/bio with code display
│   ├── TechArsenal.astro        # Tech stack grid
│   ├── Projects.astro           # Open source projects
│   ├── Journey.astro            # Career timeline
│   ├── Analytics.astro          # GitHub metrics display
│   ├── Contributions.astro      # OSS contributions section
│   ├── Guestbook.astro          # Guestbook with Giscus
│   ├── Testimonials.astro       # Testimonials section
│   ├── Certifications.astro     # Certifications
│   ├── Footer.astro             # Footer
│   └── ...                      # Shared/utility components
├── config/
│   ├── portfolio.config.ts      # Your config file
│   ├── portfolio.config.example.ts
│   ├── types.ts                 # TypeScript interfaces
│   └── ...
├── data/                        # Build-time fetched data (lighthouse, contributions)
├── scripts/
│   ├── effects/                 # Boot, canvas, cursor, matrix, etc.
│   ├── interactions/            # Nav, scroll, tilt, konami, etc.
│   └── theme-data/              # Per-theme branding, toasts, etc.
├── styles/
│   ├── base/                    # Reset, tokens, typography
│   ├── effects/                 # Boot, cursor, glitch, overlays
│   ├── layout/                  # Glass, sections, scroll-reveal
│   ├── themes/
│   │   └── _themes.scss         # All 15 theme definitions
│   ├── responsive/              # Media queries
│   ├── utilities/               # Skip link, separators, etc.
│   ├── _mixins.scss             # Shared SCSS mixins
│   └── global.scss              # Main stylesheet entry
scripts/
├── setup.mjs                    # Interactive setup wizard (phase-skip gates)
├── setup-tui.mjs                # TUI config editor (menu-driven)
├── lib/
│   ├── github.mjs               # GitHub API helpers
│   └── setup-utils.mjs          # Shared setup constants, serializer, validators
├── fetch-all-data.mjs           # Pre-build data fetcher
├── fetch-contributions.mjs      # GitHub contributions fetcher
├── fetch-contribution-graph.mjs # Contribution graph data
└── fetch-projects.mjs           # GitHub projects fetcher
public/
├── fonts/                       # Fira Code + Inter woff2
├── favicon.svg
├── og-image.png
└── robots.txt
```

## Making Changes

1. Fork the repo
2. Create a branch from `main`
   ```bash
   git checkout -b feature/your-change
   ```
3. Make your changes
4. Test locally with `npm run build` to ensure it compiles
5. Commit with a clear message
   ```bash
   git commit -m "Add/Fix/Update: brief description"
   ```
6. Push and open a pull request against `main`

## Guidelines

- **Astro components** — all pages and sections are `.astro` files. Follow existing patterns.
- **React islands** — interactive components use React via `@astrojs/react`. Keep islands small and focused.
- **Styles** — SCSS lives in `src/styles/` using design tokens (`src/styles/base/_tokens.scss`). Use existing CSS variables (`--accent`, `--text`, `--bg`, etc.).
- **Static assets** — place images and SVGs in `public/`.
- **Commit messages** — use imperative tense (`Add feature`, not `Added feature`).

## CI/CD

Pushes to `main` trigger an automatic build, deploy, and release. See [CICD.md](CICD.md) for full details.

- The version in `package.json` auto-bumps on each deploy
- Metric SVG commits use `[skip ci]` to avoid unnecessary deploys

## Reporting Issues

Open an issue on [GitHub Issues](https://github.com/<your-username>/<your-repo>/issues) with:

- What you expected
- What happened instead
- Steps to reproduce (if applicable)

## License

By contributing, you agree that your contributions will be licensed under the same license as this project.
