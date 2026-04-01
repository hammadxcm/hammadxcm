/**
 * Shared project data preparation — used by Projects section and ProjectsListing.
 * Merges featured (config) and dynamic (GitHub API) projects into a single
 * list sorted by downloads desc, then stars desc.
 */
import { config } from '@config/index';
import type { GitHubRepo, ProjectsData, ScoredProject } from '@config/types';
import projectsRaw from '../data/projects.json';

export function getProjectData(): { projects: ScoredProject[] } {
  const projectsData = projectsRaw as ProjectsData;
  const featured = config.projects;
  const featuredNames = new Set(featured.map((p) => p.name.toLowerCase()));
  const reposByName = new Map<string, GitHubRepo>();

  for (const r of projectsData.repos) {
    reposByName.set(r.name.toLowerCase(), r);
  }

  const projects: ScoredProject[] = [];

  // Score featured projects using their matching repo data
  for (const project of featured) {
    const repo = reposByName.get(project.name.toLowerCase());
    const stars = repo?.stars ?? 0;
    const forks = repo?.forks ?? 0;
    const downloads = repo?.downloads ?? 0;
    const score = downloads * 1000 + stars;
    projects.push({ kind: 'featured', project, score, downloads, stars, forks });
  }

  // Score remaining dynamic repos
  for (const repo of projectsData.repos) {
    const lower = repo.name.toLowerCase();
    if (featuredNames.has(lower)) continue;
    if (lower === config.github.username.toLowerCase()) continue;
    if (lower.startsWith('homebrew-')) continue;
    const score = (repo.downloads ?? 0) * 1000 + repo.stars;
    projects.push({ kind: 'dynamic', repo, score });
  }

  // Sort by downloads desc, then stars desc
  projects.sort((a, b) => b.score - a.score);

  return { projects };
}
