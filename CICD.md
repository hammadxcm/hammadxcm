# CI/CD Pipeline

## Overview

This project uses three GitHub Actions workflows to handle deployment, versioning, and profile metrics.

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| Deploy | `deploy.yml` | Push to `main` | Build Astro, deploy to GitHub Pages, auto-release |
| Metrics | `metrics.yml` | Daily at 4:30 AM UTC | Generate GitHub profile metrics SVGs |
| Snake | `snake.yml` | Daily at 5:30 AM UTC | Generate contribution snake animation |

## Deploy & Auto-Release (`deploy.yml`)

Every push to `main` triggers two jobs:

### 1. Build & Deploy

- Checks out code, installs dependencies (`npm ci`), builds (`npm run build`)
- Uploads the `dist/` folder and deploys to GitHub Pages
- Skips if the only changes are `metrics.*.svg` files (`paths-ignore`)

### 2. Release (Auto Version Bump)

Runs after a successful deploy:

1. Reads the current version from `package.json`
2. Checks if a git tag `v<version>` already exists
3. **Tag doesn't exist** — creates the tag + GitHub Release with auto-generated notes
4. **Tag already exists** — bumps the patch version (e.g. `1.0.1` → `1.0.2`), commits with `[skip ci]`, pushes, then creates the new tag + release

This means every deploy gets its own unique version automatically. No manual version bumps needed for patch releases.

### Version Bump Commit

The auto-bump commit message includes `[skip ci]` to prevent an infinite deployment loop. The commit is authored by `github-actions[bot]`.

### Manual Major/Minor Bumps

To release a major or minor version, manually update `package.json`:

```bash
# For a minor bump (1.0.x → 1.1.0)
npm version minor --no-git-tag-version

# For a major bump (1.x.x → 2.0.0)
npm version major --no-git-tag-version
```

Commit and push — the release job will create the tag since it doesn't exist yet. Subsequent pushes will auto-increment the patch from there (e.g. `2.0.0` → `2.0.1` → `2.0.2`).

## Metrics (`metrics.yml`)

Runs once daily at **4:30 AM UTC** (also triggerable manually via `workflow_dispatch`).

Generates five SVG files committed directly to `main`:

| File | Content |
|------|---------|
| `metrics.classic.svg` | Profile overview (activity, community, repos) |
| `metrics.plugin.isocalendar.fullyear.svg` | Full-year contribution calendar |
| `metrics.plugin.languages.svg` | Most used programming languages |
| `metrics.plugin.stars.svg` | Recently starred repositories |
| `metrics.plugin.leetcode.svg` | LeetCode stats |

Each commit message includes `[skip ci]` to avoid triggering a deploy.

**Required secret:** `METRICS_TOKEN` (GitHub PAT with repo access, stored in the `production` environment).

## Snake Animation (`snake.yml`)

Runs once daily at **5:30 AM UTC** (offset from metrics to avoid overlap).

Generates `snake.svg` using the contribution graph and pushes it to the `output` branch.

**Uses:** `GITHUB_TOKEN` (built-in, no extra secrets needed).

## Concurrency & Safety

- Deploy uses `concurrency.group: "pages"` — only one deploy runs at a time, no in-progress cancellation
- `paths-ignore: metrics.*.svg` prevents metric SVG commits from triggering deploys
- `[skip ci]` in metric and version bump commits is a secondary safeguard
- Metrics and snake run on separate schedules to avoid resource contention

## Workflow Runs

| Workflow | Frequency | Estimated minutes/month |
|----------|-----------|------------------------|
| Deploy | Per push to main | ~2 min/run |
| Metrics | 1x/day | ~30 min/run |
| Snake | 1x/day | ~1 min/run |
