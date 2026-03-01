import { describe, expect, it } from 'vitest';
import { config } from '../index';

describe('Config data integrity', () => {
  it('exports a config object with all required top-level keys', () => {
    const requiredKeys = [
      'site',
      'hero',
      'about',
      'techStack',
      'experience',
      'projects',
      'certifications',
      'github',
      'socials',
      'sections',
      'boot',
    ];
    for (const key of requiredKeys) {
      expect(config).toHaveProperty(key);
    }
  });

  describe('site', () => {
    it('has non-empty string fields', () => {
      expect(config.site.name).toBeTruthy();
      expect(config.site.title).toBeTruthy();
      expect(config.site.description).toBeTruthy();
      expect(config.site.logoText).toBeTruthy();
    });

    it('has a valid URL', () => {
      expect(() => new URL(config.site.url)).not.toThrow();
    });
  });

  describe('hero', () => {
    it('typewriterTexts is a non-empty array', () => {
      expect(config.hero.typewriterTexts).toBeInstanceOf(Array);
      expect(config.hero.typewriterTexts.length).toBeGreaterThan(0);
    });
  });

  describe('about', () => {
    it('has all required string fields', () => {
      const fields = [
        'codename',
        'title',
        'experience',
        'location',
        'clearance',
        'currentOp',
        'currentFocus',
      ] as const;
      for (const field of fields) {
        expect(config.about[field]).toBeTruthy();
      }
    });

    it('arsenal is a non-empty array with key/value entries', () => {
      expect(config.about.arsenal.length).toBeGreaterThan(0);
      for (const entry of config.about.arsenal) {
        expect(entry.key).toBeTruthy();
        expect(entry.value).toBeTruthy();
      }
    });

    it('missionLog is a non-empty array', () => {
      expect(config.about.missionLog.length).toBeGreaterThan(0);
    });

    it('philosophy is a non-empty array', () => {
      expect(config.about.philosophy.length).toBeGreaterThan(0);
    });
  });

  describe('techStack', () => {
    it('has at least 1 category', () => {
      expect(config.techStack.length).toBeGreaterThan(0);
    });

    it('each category has a title and non-empty items', () => {
      for (const category of config.techStack) {
        expect(category.title).toBeTruthy();
        expect(category.items.length).toBeGreaterThan(0);
      }
    });
  });

  describe('experience', () => {
    it('has at least 1 entry', () => {
      expect(config.experience.length).toBeGreaterThan(0);
    });

    it('each entry has non-empty achievements and tags', () => {
      for (const entry of config.experience) {
        expect(entry.role).toBeTruthy();
        expect(entry.company).toBeTruthy();
        expect(entry.achievements.length).toBeGreaterThan(0);
        expect(entry.tags.length).toBeGreaterThan(0);
      }
    });
  });

  describe('projects', () => {
    it('has at least 1 entry with required fields', () => {
      expect(config.projects.length).toBeGreaterThan(0);
      for (const project of config.projects) {
        expect(project.name).toBeTruthy();
        expect(project.url).toBeTruthy();
        expect(project.description).toBeTruthy();
        expect(project.linkText).toBeTruthy();
      }
    });
  });

  describe('certifications', () => {
    it('image badges have src, width, and alt', () => {
      const imageBadges = config.certifications.filter((c) => c.badge.type === 'image');
      expect(imageBadges.length).toBeGreaterThan(0);
      for (const cert of imageBadges) {
        const badge = cert.badge as { type: 'image'; src: string; width: number; alt: string };
        expect(badge.src).toBeTruthy();
        expect(badge.width).toBeGreaterThan(0);
        expect(badge.alt).toBeTruthy();
      }
    });

    it('svg badges have svg string', () => {
      const svgBadges = config.certifications.filter((c) => c.badge.type === 'svg');
      expect(svgBadges.length).toBeGreaterThan(0);
      for (const cert of svgBadges) {
        const badge = cert.badge as { type: 'svg'; svg: string };
        expect(badge.svg).toBeTruthy();
      }
    });
  });

  describe('socials', () => {
    it('every platform is a valid SocialPlatform', () => {
      const validPlatforms = ['github', 'twitter', 'linkedin', 'stackoverflow', 'leetcode', 'hackerrank'];
      for (const social of config.socials) {
        expect(validPlatforms).toContain(social.platform);
      }
    });

    it('every social has a valid URL', () => {
      for (const social of config.socials) {
        expect(() => new URL(social.url)).not.toThrow();
      }
    });
  });

  describe('sections', () => {
    it('every section has non-empty id and label', () => {
      for (const section of config.sections) {
        expect(section.id).toBeTruthy();
        expect(section.label).toBeTruthy();
      }
    });

    it('has no duplicate section ids', () => {
      const ids = config.sections.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('github', () => {
    it('username is non-empty', () => {
      expect(config.github.username).toBeTruthy();
    });

    it('utcOffset is a number', () => {
      expect(typeof config.github.utcOffset).toBe('number');
    });
  });

  describe('URL format validation', () => {
    it('all project URLs are valid', () => {
      for (const project of config.projects) {
        expect(() => new URL(project.url)).not.toThrow();
      }
    });

    it('all certification hrefs are valid URLs', () => {
      for (const cert of config.certifications) {
        expect(() => new URL(cert.href)).not.toThrow();
      }
    });

    it('all experience companyUrls are valid URLs', () => {
      for (const entry of config.experience) {
        expect(() => new URL(entry.companyUrl)).not.toThrow();
      }
    });

    it('all tech item URLs are valid', () => {
      for (const category of config.techStack) {
        for (const item of category.items) {
          expect(() => new URL(item.url)).not.toThrow();
        }
      }
    });
  });

  describe('duplicate detection', () => {
    it('has no duplicate project names', () => {
      const names = config.projects.map((p) => p.name);
      expect(new Set(names).size).toBe(names.length);
    });

    it('has no duplicate certification names', () => {
      const names = config.certifications.map((c) => c.name);
      expect(new Set(names).size).toBe(names.length);
    });
  });

  describe('theme validation', () => {
    it('site.theme is a valid ThemeName', () => {
      const validThemes = [
        'hacker',
        'dracula',
        'nord',
        'catppuccin',
        'synthwave',
        'matrix',
        'bloodmoon',
        'midnight',
        'arctic',
        'gruvbox',
      ];
      if (config.site.theme) {
        expect(validThemes).toContain(config.site.theme);
      }
    });
  });
});
