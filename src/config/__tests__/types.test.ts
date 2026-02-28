import { describe, it, expect } from 'vitest';
import { config } from '../index';
import type { CertBadge, SocialPlatform } from '../types';

function isValidUrlOrPath(s: string): boolean {
  // data: URIs and local paths are valid
  if (s.startsWith('data:') || (!s.startsWith('http') && !s.includes('://'))) {
    return true;
  }
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

describe('CertBadge discriminated union', () => {
  it('image badges have src, width, and alt — no svg field', () => {
    const imageCerts = config.certifications.filter(c => c.badge.type === 'image');
    for (const cert of imageCerts) {
      const badge = cert.badge as Extract<CertBadge, { type: 'image' }>;
      expect(typeof badge.src).toBe('string');
      expect(badge.src.length).toBeGreaterThan(0);
      expect(typeof badge.width).toBe('number');
      expect(typeof badge.alt).toBe('string');
      expect((badge as any).svg).toBeUndefined();
    }
  });

  it('svg badges have svg string — no src/width/alt fields', () => {
    const svgCerts = config.certifications.filter(c => c.badge.type === 'svg');
    for (const cert of svgCerts) {
      const badge = cert.badge as Extract<CertBadge, { type: 'svg' }>;
      expect(typeof badge.svg).toBe('string');
      expect(badge.svg).toContain('<svg');
      expect((badge as any).src).toBeUndefined();
      expect((badge as any).width).toBeUndefined();
      expect((badge as any).alt).toBeUndefined();
    }
  });
});

describe('SocialPlatform values', () => {
  const validPlatforms: SocialPlatform[] = ['github', 'twitter', 'linkedin'];

  it('all social entries use a valid platform', () => {
    for (const social of config.socials) {
      expect(validPlatforms).toContain(social.platform);
    }
  });
});

describe('URL validation across config', () => {
  it('techStack icon URLs are valid', () => {
    for (const category of config.techStack) {
      for (const item of category.items) {
        expect(isValidUrlOrPath(item.icon)).toBe(true);
        expect(isValidUrlOrPath(item.url)).toBe(true);
      }
    }
  });

  it('project URLs are valid', () => {
    for (const project of config.projects) {
      expect(isValidUrlOrPath(project.url)).toBe(true);
      expect(isValidUrlOrPath(project.icon)).toBe(true);
    }
  });

  it('certification hrefs are valid', () => {
    for (const cert of config.certifications) {
      expect(isValidUrlOrPath(cert.href)).toBe(true);
    }
  });

  it('social URLs are valid', () => {
    for (const social of config.socials) {
      expect(isValidUrlOrPath(social.url)).toBe(true);
    }
  });
});
