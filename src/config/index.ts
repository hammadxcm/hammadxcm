import raw from './portfolio.config';
import type { ResolvedSocialLink } from './socials';
import { resolveSocials } from './socials';
import type { PortfolioConfig } from './types';

export interface ResolvedPortfolioConfig extends Omit<PortfolioConfig, 'socials'> {
  socials: ResolvedSocialLink[];
}

const config: ResolvedPortfolioConfig = { ...raw, socials: resolveSocials(raw) };

export { config };
export type { PortfolioConfig } from './types';
