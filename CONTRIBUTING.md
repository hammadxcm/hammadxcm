# Contributing

Thanks for your interest in contributing to this project.

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
git clone https://github.com/hammadxcm/hammadxcm.git
cd hammadxcm
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
│   └── index.astro          # Main page
├── layouts/
│   └── Layout.astro         # HTML wrapper, meta tags, fonts
├── components/
│   ├── Nav.astro            # Navigation
│   ├── Hero.astro           # Hero section
│   ├── About.astro          # About/bio with code display
│   ├── TechArsenal.astro    # Tech stack grid
│   ├── Projects.astro       # Open source projects
│   ├── Journey.astro        # Career timeline
│   ├── Analytics.astro      # GitHub metrics display
│   ├── Certifications.astro # Certifications
│   ├── Footer.astro         # Footer
│   └── ...                  # Shared/utility components
├── styles/
│   └── global.css           # All styles
public/
├── daemon-os.svg            # Animated daemon-os banner
├── daemon-icon.svg          # Animated daemon icon (AI & Tools)
└── scripts/
    └── main.js              # Client-side JS
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
- **Styles** — all CSS lives in `src/styles/global.css`. Use existing CSS variables (`--accent`, `--text`, `--bg`, etc.).
- **No frameworks** — this is a vanilla Astro site with zero client-side frameworks. Keep it lightweight.
- **Static assets** — place images and SVGs in `public/`.
- **Commit messages** — use imperative tense (`Add feature`, not `Added feature`).

## CI/CD

Pushes to `main` trigger an automatic build, deploy, and release. See [CICD.md](CICD.md) for full details.

- The version in `package.json` auto-bumps on each deploy
- Metric SVG commits use `[skip ci]` to avoid unnecessary deploys

## Reporting Issues

Open an issue on [GitHub Issues](https://github.com/hammadxcm/hammadxcm/issues) with:

- What you expected
- What happened instead
- Steps to reproduce (if applicable)

## License

By contributing, you agree that your contributions will be licensed under the same license as this project.
