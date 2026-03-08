export const langColors: Record<string, string> = {
  Ruby: '#e53935',
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3776ab',
  Go: '#00add8',
  Rust: '#dea584',
  Java: '#b07219',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Swift: '#fa7343',
  Kotlin: '#A97BFF',
  PHP: '#4F5D95',
  Elixir: '#6e4a7e',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
};

export function getLangColor(language: string | null): string {
  if (!language) return 'var(--text-dim)';
  return langColors[language] || 'var(--text-dim)';
}
