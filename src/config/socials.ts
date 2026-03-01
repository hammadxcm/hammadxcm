import type { PortfolioConfig, SocialLink, SocialPlatform } from './types';

export interface ResolvedSocialLink extends SocialLink {
  url: string;
}

const SOCIAL_URL_TEMPLATES: Partial<Record<SocialPlatform, (id: string) => string>> = {
  github: (u) => `https://github.com/${u}`,
  leetcode: (u) => `https://leetcode.com/u/${u}`,
  stackoverflow: (id) => `https://stackoverflow.com/users/${id}`,
  hackerrank: (u) => `https://www.hackerrank.com/profile/${u}`,
};

function getPlatformId(platform: SocialPlatform, config: PortfolioConfig): string | undefined {
  switch (platform) {
    case 'github':
      return config.github.username;
    case 'leetcode':
      return config.leetcode?.username;
    case 'stackoverflow':
      return config.stackoverflow?.userId?.toString();
    case 'hackerrank':
      return config.hackerrank?.username;
    default:
      return undefined;
  }
}

export function resolveSocials(config: PortfolioConfig): ResolvedSocialLink[] {
  return config.socials.map((social) => {
    if (social.url) return social as ResolvedSocialLink;

    const template = SOCIAL_URL_TEMPLATES[social.platform];
    const id = getPlatformId(social.platform, config);

    if (template && id) {
      return { ...social, url: template(id) };
    }

    throw new Error(
      `Social "${social.platform}" has no url and no auto-generation config available.`,
    );
  });
}
