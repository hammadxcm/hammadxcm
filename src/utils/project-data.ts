/**
 * Shared project data preparation — used by Projects section and ProjectsListing.
 */
import { config } from '@config/index';
import type { ProjectsData, GitHubRepo, Project } from '@config/types';
import projectsRaw from '../data/projects.json';

export function getProjectData(): {
  featured: Project[];
  dynamicRepos: GitHubRepo[];
  downloadCounts: Record<string, number>;
} {
  const projectsData = projectsRaw as ProjectsData;
  const featured = config.projects;
  const featuredNames = new Set(featured.map((p) => p.name.toLowerCase()));
  const downloadCounts: Record<string, number> = projectsData.downloads || {};

  const dynamicRepos = projectsData.repos.filter((r) => {
    const lower = r.name.toLowerCase();
    if (featuredNames.has(lower)) return false;
    if (lower === config.github.username.toLowerCase()) return false;
    if (lower.startsWith('homebrew-')) return false;
    return true;
  });

  return { featured, dynamicRepos, downloadCounts };
}
