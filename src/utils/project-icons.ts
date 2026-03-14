/**
 * Shared project icon resolver — used by Projects section and ProjectsListing.
 */

export const langIcons: Record<string, string> = {
  Ruby: '/icons/skills/ruby.svg',
  JavaScript: 'https://techstack-generator.vercel.app/js-icon.svg',
  TypeScript: 'https://techstack-generator.vercel.app/ts-icon.svg',
  Python: 'https://techstack-generator.vercel.app/python-icon.svg',
  Go: '/icons/skills/go.svg',
  Rust: '/icons/skills/rust.svg',
  Java: '/icons/skills/java.svg',
  Swift: 'https://techstack-generator.vercel.app/swift-icon.svg',
  HTML: '/icons/skills/html.svg',
  CSS: '/icons/skills/css.svg',
  Shell: '/icons/skills/bash.svg',
  PHP: '/icons/skills/php.svg',
  'C++': '/icons/skills/cpp.svg',
  'C#': '/icons/skills/cs.svg',
};

export const keywordIcons: [string, string][] = [
  ['discord', '/icons/skills/discord.svg'],
  ['react', 'https://techstack-generator.vercel.app/react-icon.svg'],
  ['rails', '/icons/skills/rails.svg'],
  ['vue', '/icons/skills/vue.svg'],
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
