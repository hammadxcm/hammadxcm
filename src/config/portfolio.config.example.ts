/**
 * Portfolio Config — Example Template
 *
 * Copy this file to `portfolio.config.ts` and fill in your details.
 * Every array (techStack, experience, projects, certifications, socials, sections)
 * is fully extensible — just add more objects to grow any section.
 *
 * Icon sources:
 *   - https://skillicons.dev  (e.g. https://skillicons.dev/icons?i=react)
 *   - https://techstack-generator.vercel.app  (e.g. .../react-icon.svg)
 *   - https://devicon.dev  (raw SVGs from devicons/devicon repo)
 *   - Local files in public/ directory (set isLocal: true)
 */
import type { PortfolioConfig } from './types';

const config: PortfolioConfig = {
  /* ─── Site ─── */
  site: {
    name: 'Jane Doe',
    title: 'Full Stack Developer',
    description: 'Jane Doe — Full Stack Developer building modern web applications with React, Node.js, and cloud technologies.',
    url: 'https://janedoe.github.io/portfolio/',
    logoText: 'janedoe',
    logoSuffix: '.dev',
  },

  /* ─── Hero ─── */
  hero: {
    greeting: 'root@kali:~# whoami',
    typewriterTexts: [
      '> Full Stack Developer',
      '> React & TypeScript Enthusiast',
      '> Cloud Architecture Specialist',
      '> Open Source Contributor',
      '> Root access granted. Welcome back.',
    ],
  },

  /* ─── About ─── */
  about: {
    codename: 'jane_doe',
    title: 'Full Stack Developer',
    experience: '5+ years building web applications',
    location: 'San Francisco, CA',
    clearance: 'Level 4 \u2014 Systems Architecture',
    currentOp: 'Senior Developer @ Acme Corp',
    arsenal: [
      { key: 'frontend', value: 'React | Next.js | TypeScript | Tailwind' },
      { key: 'backend', value: 'Node.js | Express | Python | Django' },
      { key: 'databases', value: 'PostgreSQL | MongoDB | Redis' },
      { key: 'devops', value: 'AWS | Docker | GitHub Actions' },
    ],
    missionLog: [
      'Shipped 3 production apps serving 100K+ users',
      'Open source contributor to major frameworks',
      'Reduced API response time by 60%',
    ],
    knownAliases: ['open-source-jane', 'code-ninja'],
    currentFocus: 'Cloud-Native Architecture & Developer Experience',
    philosophy: [
      'Writing clean code that tells a story,',
      'and building products that make a difference.',
    ],
  },

  /* ─── Tech Stack — Add more categories to grow the grid ─── */
  techStack: [
    {
      title: 'Frontend',
      emoji: '\uD83C\uDFA8',
      items: [
        { name: 'React', icon: 'https://techstack-generator.vercel.app/react-icon.svg', url: 'https://react.dev' },
        { name: 'TypeScript', icon: 'https://techstack-generator.vercel.app/ts-icon.svg', url: 'https://www.typescriptlang.org' },
        { name: 'Next.js', icon: 'https://skillicons.dev/icons?i=nextjs', url: 'https://nextjs.org' },
        { name: 'Tailwind', icon: 'https://skillicons.dev/icons?i=tailwind', url: 'https://tailwindcss.com' },
      ],
    },
    {
      title: 'Backend',
      emoji: '\u2699\uFE0F',
      items: [
        { name: 'Node.js', icon: 'https://skillicons.dev/icons?i=nodejs', url: 'https://nodejs.org' },
        { name: 'Python', icon: 'https://techstack-generator.vercel.app/python-icon.svg', url: 'https://www.python.org' },
        { name: 'PostgreSQL', icon: 'https://skillicons.dev/icons?i=postgresql', url: 'https://www.postgresql.org' },
        { name: 'Redis', icon: 'https://skillicons.dev/icons?i=redis', url: 'https://redis.io' },
      ],
    },
    {
      title: 'DevOps',
      emoji: '\u2601\uFE0F',
      items: [
        { name: 'AWS', icon: 'https://techstack-generator.vercel.app/aws-icon.svg', url: 'https://aws.amazon.com' },
        { name: 'Docker', icon: 'https://techstack-generator.vercel.app/docker-icon.svg', url: 'https://www.docker.com' },
        { name: 'Git', icon: 'https://skillicons.dev/icons?i=git', url: 'https://git-scm.com' },
      ],
    },
  ],

  /* ─── Experience — Add entries to grow the timeline ─── */
  experience: [
    {
      date: 'Jan 2023 &mdash; Present',
      role: 'Senior Developer',
      company: 'Acme Corp',
      companyUrl: 'https://example.com',
      meta: 'Full-time &middot; San Francisco, CA',
      achievements: [
        'Led migration to microservices architecture',
        'Built real-time analytics dashboard serving 50K+ users',
        'Mentored team of 4 junior developers',
      ],
      tags: ['React', 'Node.js', 'AWS', 'PostgreSQL'],
    },
    {
      date: '2020 &mdash; 2023',
      role: 'Full Stack Developer',
      company: 'StartupXYZ',
      companyUrl: 'https://example.com',
      meta: 'Full-time &middot; Remote',
      achievements: [
        'Built core product features from scratch',
        'Implemented CI/CD pipeline reducing deployment time by 80%',
      ],
      tags: ['React', 'Python', 'Docker', 'MongoDB'],
    },
  ],

  /* ─── Projects — Add entries to grow the grid ─── */
  projects: [
    {
      icon: 'https://skillicons.dev/icons?i=react',
      name: 'My Awesome App',
      url: 'https://github.com/janedoe/awesome-app',
      description: 'A full-stack application with real-time features and <strong>50K+ users</strong>.',
      tags: ['React', 'Node.js', 'WebSocket'],
      linkText: 'View Repo',
    },
    {
      icon: 'https://skillicons.dev/icons?i=nodejs',
      name: 'CLI Tool',
      url: 'https://www.npmjs.com/package/my-cli-tool',
      description: 'Published npm package &mdash; developer productivity CLI with 1K+ downloads.',
      tags: ['Node.js', 'CLI', 'npm'],
      linkText: 'View Package',
    },
  ],

  /* ─── Certifications — Add entries to grow the grid ─── */
  certifications: [
    {
      href: 'https://example.com/cert1',
      ariaLabel: 'View AWS certification',
      badge: { type: 'image', src: 'https://techstack-generator.vercel.app/aws-icon.svg', width: 50, alt: 'AWS' },
      category: 'Cloud',
      name: 'AWS Solutions Architect',
      issuer: 'Amazon Web Services',
      date: 'January 2024',
    },
    {
      href: 'https://example.com/cert2',
      ariaLabel: 'View security certification',
      badge: {
        type: 'svg',
        svg: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="#00bfbf" stroke-width="1.5" fill="rgba(0,191,191,0.1)"/><path d="M9 12l2 2 4-4" stroke="#00bfbf" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      },
      category: 'Security',
      name: 'Web Security Fundamentals',
      issuer: 'The Linux Foundation',
    },
  ],

  /* ─── GitHub ─── */
  github: {
    username: 'janedoe',
    utcOffset: -8,
  },

  /* ─── Socials — Add more to show additional icons ─── */
  socials: [
    { platform: 'github', url: 'https://github.com/janedoe', label: 'GitHub' },
    { platform: 'twitter', url: 'https://twitter.com/janedoe', label: 'Twitter' },
    { platform: 'linkedin', url: 'https://linkedin.com/in/janedoe', label: 'LinkedIn' },
  ],

  /* ─── Sections — Reorder, add, or remove to update nav ─── */
  sections: [
    { id: 'about', label: 'About' },
    { id: 'tech', label: 'Skills' },
    { id: 'journey', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'certs', label: 'Certifications' },
  ],

  /* ─── Boot Sequence ─── */
  boot: {
    welcomeName: 'JANE',
  },
};

export default config;
