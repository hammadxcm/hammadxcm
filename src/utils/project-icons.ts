/**
 * Shared project icon resolver — used by Projects section and ProjectsListing.
 */

export const langIcons: Record<string, string> = {
  Ruby: 'https://skillicons.dev/icons?i=ruby',
  JavaScript: 'https://techstack-generator.vercel.app/js-icon.svg',
  TypeScript: 'https://techstack-generator.vercel.app/ts-icon.svg',
  Python: 'https://techstack-generator.vercel.app/python-icon.svg',
  Go: 'https://skillicons.dev/icons?i=go',
  Rust: 'https://skillicons.dev/icons?i=rust',
  Java: 'https://skillicons.dev/icons?i=java',
  Swift: 'https://techstack-generator.vercel.app/swift-icon.svg',
  HTML: 'https://skillicons.dev/icons?i=html',
  CSS: 'https://skillicons.dev/icons?i=css',
  Shell: 'https://skillicons.dev/icons?i=bash',
  PHP: 'https://skillicons.dev/icons?i=php',
  'C++': 'https://skillicons.dev/icons?i=cpp',
  'C#': 'https://skillicons.dev/icons?i=cs',
};

export const keywordIcons: [string, string][] = [
  ['discord', 'https://skillicons.dev/icons?i=discord'],
  ['react', 'https://techstack-generator.vercel.app/react-icon.svg'],
  ['rails', 'https://skillicons.dev/icons?i=rails'],
  ['vue', 'https://skillicons.dev/icons?i=vue'],
  ['docker', 'https://techstack-generator.vercel.app/docker-icon.svg'],
];

export function resolveRepoIcon(
  repo: { name: string; language: string | null; topics: string[] },
  base: string,
): string {
  const haystack = [...repo.topics, repo.name].map((s) => s.toLowerCase());
  for (const [keyword, url] of keywordIcons) {
    if (haystack.some((h) => h.includes(keyword))) return url;
  }
  if (repo.language && langIcons[repo.language]) return langIcons[repo.language];
  return `${base}default-project-icon.svg`;
}
