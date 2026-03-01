import raw from './portfolio.config';
import { resolveSocials } from './socials';
import type { PortfolioConfig } from './types';
import type { ResolvedSocialLink } from './socials';

export interface ResolvedPortfolioConfig extends Omit<PortfolioConfig, 'socials'> {
  socials: ResolvedSocialLink[];
}

const config: ResolvedPortfolioConfig = { ...raw, socials: resolveSocials(raw) };

export { config };
export type { PortfolioConfig } from './types';
