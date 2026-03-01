import type { PortfolioConfig } from './types';

const config: PortfolioConfig = {
  /* ─── Site ─── */
  site: {
    name: 'Hammad Khan',
    title: 'Senior Full Stack Engineer',
    description:
      'Hammad Khan — Senior Full Stack Engineer with 6+ years building distributed systems at scale. Ruby on Rails, React, Node.js, and cloud architecture.',
    url: 'https://hammadxcm.github.io/hammadxcm/',
    logoText: 'hammadkhan',
    logoSuffix: '.dev',
    theme: 'hacker',
  },

  /* ─── Hero ─── */
  hero: {
    greeting: 'root@kali:~# whoami',
    typewriterTexts: [
      '> Senior Software Engineer',
      '> Ruby on Rails Virtuoso',
      '> Initializing neural interface...',
      '> Node.js Systems Architect',
      '> Bypassing firewall protocols...',
      '> React & Vue Evangelist',
      '> Decrypting classified payloads...',
      '> AWS Infrastructure Strategist',
      '> Establishing encrypted tunnel...',
      '> PostgreSQL Performance Alchemist',
      '> Compiling exploit modules...',
      '> Docker & Kubernetes Orchestrator',
      '> GraphQL Schema Architect',
      '> TypeScript Perfectionist',
      '> Redis & Distributed Queue Specialist',
      '> Open Source Advocate & Contributor',
      '> Root access granted. Welcome back.',
    ],
  },

  /* ─── About ─── */
  about: {
    codename: 'hammad_khan',
    title: 'Senior Full Stack Engineer',
    experience: '8+ years building systems at scale',
    location: 'Lahore, Pakistan',
    clearance: 'Level 5 \u2014 Platform Architecture',
    currentOp: 'Senior Full Stack Engineer @ NexaQuanta',
    arsenal: [
      { key: 'system_design', value: 'Microservices | Event-Driven | DDD' },
      { key: 'backend', value: 'Rails | NestJS | Node | GraphQL' },
      { key: 'frontend', value: 'React | Vue | Next.js | PWA' },
      { key: 'infrastructure', value: 'AWS | Docker | Redis | BullMQ | K8s' },
      { key: 'databases', value: 'PostgreSQL | MongoDB | MySQL | Prisma' },
      { key: 'security', value: 'OWASP Top 10 | Audit Systems | HIPAA' },
    ],
    missionLog: [
      '115+ MRs delivered in 5 months @ NexaQuanta',
      'Rails Core Contributor \u2014 merged PR to rails/rails',
      'Zero-downtime Stripe migration \u2014 99.9% uptime',
      'Progressive loading: page load 12s \u2192 2.3s',
    ],
    knownAliases: ['daemon-os', 'rubocop-hk', 'ramadan-cli-pro'],
    currentFocus: 'Platform Engineering & Technical Strategy',
    philosophy: ['Building systems that scale, teams that deliver,', 'and solutions that last.'],
  },

  /* ─── Tech Stack ─── */
  techStack: [
    {
      title: 'Frontend',
      emoji: '\uD83C\uDFA8',
      items: [
        {
          name: 'React',
          icon: 'https://techstack-generator.vercel.app/react-icon.svg',
          url: 'https://react.dev',
        },
        { name: 'Vue', icon: 'https://skillicons.dev/icons?i=vue', url: 'https://vuejs.org' },
        {
          name: 'Next.js',
          icon: 'https://skillicons.dev/icons?i=nextjs',
          url: 'https://nextjs.org',
        },
        {
          name: 'TypeScript',
          icon: 'https://techstack-generator.vercel.app/ts-icon.svg',
          url: 'https://www.typescriptlang.org',
        },
        {
          name: 'JavaScript',
          icon: 'https://techstack-generator.vercel.app/js-icon.svg',
          url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        },
        {
          name: 'Tailwind',
          icon: 'https://skillicons.dev/icons?i=tailwind',
          url: 'https://tailwindcss.com',
        },
        {
          name: 'Sass',
          icon: 'https://techstack-generator.vercel.app/sass-icon.svg',
          url: 'https://sass-lang.com',
        },
        {
          name: 'Redux',
          icon: 'https://techstack-generator.vercel.app/redux-icon.svg',
          url: 'https://redux.js.org',
        },
        {
          name: 'Angular',
          icon: 'https://skillicons.dev/icons?i=angular',
          url: 'https://angular.dev',
        },
      ],
    },
    {
      title: 'Backend',
      emoji: '\u2699\uFE0F',
      items: [
        {
          name: 'Ruby',
          icon: 'https://skillicons.dev/icons?i=ruby',
          url: 'https://www.ruby-lang.org',
        },
        {
          name: 'Rails',
          icon: 'https://skillicons.dev/icons?i=rails',
          url: 'https://rubyonrails.org',
        },
        {
          name: 'Node.js',
          icon: 'https://skillicons.dev/icons?i=nodejs',
          url: 'https://nodejs.org',
        },
        {
          name: 'GraphQL',
          icon: 'https://techstack-generator.vercel.app/graphql-icon.svg',
          url: 'https://graphql.org',
        },
        {
          name: 'Python',
          icon: 'https://techstack-generator.vercel.app/python-icon.svg',
          url: 'https://www.python.org',
        },
        {
          name: 'NestJS',
          icon: 'https://skillicons.dev/icons?i=nestjs',
          url: 'https://nestjs.com',
        },
        {
          name: 'Django',
          icon: 'https://techstack-generator.vercel.app/django-icon.svg',
          url: 'https://www.djangoproject.com',
        },
        {
          name: 'Nginx',
          icon: 'https://techstack-generator.vercel.app/nginx-icon.svg',
          url: 'https://nginx.org',
        },
        {
          name: 'REST API',
          icon: 'https://techstack-generator.vercel.app/restapi-icon.svg',
          url: 'https://restfulapi.net',
        },
        {
          name: 'BullMQ',
          icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='22' fill='%23e53935'/%3E%3Cpath d='M10 16c-1-3 0-7 2-9 1 2 3 4 6 4M38 16c1-3 0-7-2-9-1 2-3 4-6 4' stroke='%23fff' stroke-width='2.5' fill='none' stroke-linecap='round'/%3E%3Ccircle cx='17' cy='22' r='2.5' fill='%23fff'/%3E%3Ccircle cx='31' cy='22' r='2.5' fill='%23fff'/%3E%3Cellipse cx='24' cy='31' rx='7' ry='4.5' fill='%23c62828'/%3E%3Ccircle cx='21' cy='31' r='1.5' fill='%23ffcdd2'/%3E%3Ccircle cx='27' cy='31' r='1.5' fill='%23ffcdd2'/%3E%3C/svg%3E",
          url: 'https://docs.bullmq.io',
        },
        {
          name: 'Sidekiq',
          icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='22' fill='%23b1003e'/%3E%3Cpath d='M15 32c0-7 4-10 9-16 5 6 9 9 9 16 0 6-4 10-9 10s-9-4-9-10z' fill='%23e74c3c'/%3E%3Cpath d='M20 33c0-3 2-5 4-8 2 3 4 5 4 8 0 3-2 5-4 5s-4-2-4-5z' fill='%23f1c40f'/%3E%3C/svg%3E",
          url: 'https://sidekiq.org',
        },
      ],
    },
    {
      title: 'Databases',
      emoji: '\uD83D\uDDC3\uFE0F',
      items: [
        {
          name: 'PostgreSQL',
          icon: 'https://skillicons.dev/icons?i=postgresql',
          url: 'https://www.postgresql.org',
        },
        {
          name: 'MongoDB',
          icon: 'https://skillicons.dev/icons?i=mongodb',
          url: 'https://www.mongodb.com',
        },
        {
          name: 'MySQL',
          icon: 'https://techstack-generator.vercel.app/mysql-icon.svg',
          url: 'https://www.mysql.com',
        },
        { name: 'Redis', icon: 'https://skillicons.dev/icons?i=redis', url: 'https://redis.io' },
        {
          name: 'SQLite',
          icon: 'https://skillicons.dev/icons?i=sqlite',
          url: 'https://www.sqlite.org',
        },
        {
          name: 'Prisma',
          icon: 'https://skillicons.dev/icons?i=prisma',
          url: 'https://www.prisma.io',
        },
      ],
    },
    {
      title: 'Cloud & DevOps',
      emoji: '\u2601\uFE0F',
      items: [
        {
          name: 'AWS',
          icon: 'https://techstack-generator.vercel.app/aws-icon.svg',
          url: 'https://aws.amazon.com',
        },
        {
          name: 'Azure',
          icon: 'https://skillicons.dev/icons?i=azure',
          url: 'https://azure.microsoft.com',
        },
        {
          name: 'Docker',
          icon: 'https://techstack-generator.vercel.app/docker-icon.svg',
          url: 'https://www.docker.com',
        },
        {
          name: 'K8s',
          icon: 'https://techstack-generator.vercel.app/kubernetes-icon.svg',
          url: 'https://kubernetes.io',
        },
        { name: 'Git', icon: 'https://skillicons.dev/icons?i=git', url: 'https://git-scm.com' },
        {
          name: 'GitHub',
          icon: 'https://techstack-generator.vercel.app/github-icon.svg',
          url: 'https://github.com',
        },
        {
          name: 'Heroku',
          icon: 'https://skillicons.dev/icons?i=heroku',
          url: 'https://www.heroku.com',
        },
      ],
    },
    {
      title: 'Testing',
      emoji: '\uD83E\uDDEA',
      items: [
        {
          name: 'Jest',
          icon: 'https://techstack-generator.vercel.app/jest-icon.svg',
          url: 'https://jestjs.io',
        },
        {
          name: 'Vitest',
          icon: 'https://skillicons.dev/icons?i=vitest',
          url: 'https://vitest.dev',
        },
        {
          name: 'RSpec',
          icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/rspec/rspec-original.svg',
          url: 'https://rspec.info',
        },
        {
          name: 'Testing Lib',
          icon: 'https://techstack-generator.vercel.app/testinglibrary-icon.svg',
          url: 'https://testing-library.com',
        },
        {
          name: 'ESLint',
          icon: 'https://techstack-generator.vercel.app/eslint-icon.svg',
          url: 'https://eslint.org',
        },
        {
          name: 'Prettier',
          icon: 'https://techstack-generator.vercel.app/prettier-icon.svg',
          url: 'https://prettier.io',
        },
        {
          name: 'rubocop-hk',
          icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23cc342d'/%3E%3Cstop offset='1' stop-color='%23e55039'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M24 2L4 14v20l20 12 20-12V14z' fill='url(%23a)'/%3E%3Cpath d='M24 10l-12 7v14l12 7 12-7V17z' fill='none' stroke='%23fff' stroke-width='1.5' opacity='.4'/%3E%3Cpath d='M24 16l-6 3.5v7L24 30l6-3.5v-7z' fill='%23fff' opacity='.9'/%3E%3Cpath d='M24 20l-2 1.2v2.4l2 1.2 2-1.2v-2.4z' fill='%23cc342d'/%3E%3C/svg%3E",
          url: 'https://rubygems.org/gems/rubocop-hk',
        },
      ],
    },
    {
      title: 'AI & Tools',
      emoji: '\uD83E\uDD16',
      items: [
        {
          name: 'VS Code',
          icon: 'https://skillicons.dev/icons?i=vscode',
          url: 'https://code.visualstudio.com',
        },
        {
          name: 'WebStorm',
          icon: 'https://skillicons.dev/icons?i=webstorm',
          url: 'https://www.jetbrains.com/webstorm',
        },
        {
          name: 'Webpack',
          icon: 'https://techstack-generator.vercel.app/webpack-icon.svg',
          url: 'https://webpack.js.org',
        },
        {
          name: 'Storybook',
          icon: 'https://techstack-generator.vercel.app/storybook-icon.svg',
          url: 'https://storybook.js.org',
        },
        {
          name: 'Swift',
          icon: 'https://techstack-generator.vercel.app/swift-icon.svg',
          url: 'https://www.swift.org',
        },
        {
          name: 'Stripe',
          icon: 'https://skillicons.dev/icons?i=stripe',
          url: 'https://stripe.com',
        },
        {
          name: 'Daemon OS',
          icon: 'daemon-icon.svg',
          url: 'https://github.com/hammadxcm/daemon-os',
          isLocal: true,
        },
      ],
    },
  ],

  /* ─── Experience ─── */
  experience: [
    {
      date: 'Oct 2025 &mdash; Present',
      role: 'Senior Full Stack Engineer',
      company: 'NexaQuanta',
      companyUrl: 'https://nexaquanta.ai/',
      meta: 'Full-time &middot; Remote (London, UK)',
      achievements: [
        'Built CRM &amp; product reporting module with email-based delivery for business intelligence',
        'Designed &amp; executed enterprise database schema migration achieving 100% parity',
        'Built complete aftersales appointment lifecycle module &mdash; 60+ merged MRs',
        'Integrated CitNOW video library eliminating cross-system context-switching',
        'Architected CSV data import pipeline with batch optimization &amp; duplicate detection',
        'Implemented multi-dealer org scoping with dual-database architecture',
        'Patched critical injection vulnerability; built generic audit module',
        'Fixed Redis Cluster CROSSSLOT errors for stable BullMQ job processing',
      ],
      tags: ['NestJS', 'React', 'Next.js', 'MongoDB', 'PostgreSQL', 'AWS', 'Redis', 'BullMQ'],
    },
    {
      date: 'Dec 2023 &mdash; Oct 2025',
      role: 'Staff Software Engineer',
      company: 'TechXMation',
      companyUrl: 'https://www.linkedin.com/company/techxmation/about/',
      meta: 'Freelance &middot; Lahore, Pakistan',
      achievements: [
        'Designed event-driven export system reducing wait times from 30+ min to under 5 min',
        'Architected progressive loading cutting page load from 12s to 2.3s (70% improvement)',
        'Built multi-level batch processing improving job success rate from 60% to 95%',
        'Designed service mesh architecture eliminating 90% of data duplicates',
      ],
      tags: ['Rails', 'React', 'Redis', 'Sidekiq', 'AWS S3', 'PostgreSQL'],
    },
    {
      date: 'Feb &mdash; Nov 2023',
      role: 'Application Developer',
      company: 'Machine Tools',
      companyUrl: 'https://www.machinetools.com/en',
      meta: 'Full-time &middot; Lahore, Pakistan',
      achievements: [
        'Implemented Sphinx Search improving response time by 300%',
        'Built advanced filtering with role-based access &mdash; 85% faster data filtering',
        'Architected scalable email delivery system improving delivery rate by 25%',
      ],
      tags: ['Rails', 'Sphinx Search', 'Arel SQL', 'PostgreSQL'],
    },
    {
      date: 'Jun 2022 &mdash; Jan 2023',
      role: 'Senior Software Engineer',
      company: 'Freelance',
      companyUrl: 'https://www.linkedin.com/in/hammadxcm/',
      meta: 'Remote &middot; Lahore, Pakistan',
      achievements: [
        'Designed HMAC-based API signature verification with JWT &amp; rate limiting',
        'Built reusable React component library reducing dev time by 40%',
        'Architected unified multi-platform API integration layer',
      ],
      tags: ['Rails', 'React', 'GraphQL', 'JWT', 'Chrome Extensions'],
    },
    {
      date: '2018 &mdash; 2022',
      role: 'Software Engineer',
      company: 'Sendoso',
      companyUrl: 'https://www.sendoso.com/',
      meta: 'Full-time &middot; Lahore, Pakistan &middot; 4 Years',
      achievements: [
        'Architected multi-API integration platform supporting 10+ APIs (Azure, Kolide, Kandji)',
        'Led zero-downtime Stripe v2 &rarr; v3 migration with 99.9% uptime',
        'Built real-time monitoring dashboard handling 1M+ requests/day',
        'Designed event-driven CRM automation for Salesforce, HubSpot, Marketo',
        'Built Chrome extension for CRM integration used by 1000+ sales reps',
        'Implemented i18n system for email templates supporting 20+ languages',
      ],
      tags: ['Rails', 'React', 'Redux', 'GraphQL', 'Stripe', 'Salesforce', 'New Relic', 'DDD'],
    },
    {
      date: '2017 &mdash; 2018',
      role: 'Software Engineer',
      company: 'Engin Technologies',
      companyUrl: 'https://www.engintechnologies.com/',
      meta: 'Full-time &middot; Lahore, Pakistan',
      achievements: [
        'Built scalable e-commerce solutions using Spree Commerce framework',
        'Implemented React + Redux frontend with GraphQL data flow',
        'Created responsive, interactive user interfaces',
      ],
      tags: ['Rails', 'React', 'Redux', 'GraphQL', 'Spree Commerce'],
    },
  ],

  /* ─── Projects ─── */
  projects: [
    {
      icon: 'https://skillicons.dev/icons?i=rails',
      name: 'Rails Core Contribution',
      url: 'https://github.com/rails/rails/pull/56867',
      description:
        'Merged PR to <strong>rails/rails</strong> &mdash; Fixed Ruby 4.0 delegator warning in ActiveModel/ActiveRecord.',
      tags: ['Ruby on Rails', 'Open Source', 'Core'],
      linkText: 'View PR',
    },
    {
      icon: 'https://skillicons.dev/icons?i=nodejs',
      name: 'ramadan-cli-pro',
      url: 'https://www.npmjs.com/package/ramadan-cli-pro',
      description:
        'Published npm package &mdash; TUI dashboard with prayer times, i18n &amp; notifications.',
      tags: ['npm', 'Node.js', 'CLI', 'i18n'],
      linkText: 'View Package',
    },
    {
      icon: 'https://skillicons.dev/icons?i=ruby',
      name: 'rubocop-hk',
      url: 'https://rubygems.org/gems/rubocop-hk',
      description:
        'Published RubyGem &mdash; 2,800+ downloads. Modern RuboCop config for Ruby &amp; Rails projects.',
      tags: ['RubyGems', 'RuboCop', 'Linting'],
      linkText: 'View Gem',
    },
    {
      icon: 'https://techstack-generator.vercel.app/react-icon.svg',
      name: 'image-magnifier',
      url: 'https://www.npmjs.com/package/@hammadxcm/image-magnifier',
      description:
        'React zoom component &mdash; 8 stars, 748+ downloads. TypeScript with 7 releases.',
      tags: ['React', 'TypeScript', 'npm'],
      linkText: 'View Package',
    },
    {
      icon: 'https://skillicons.dev/icons?i=css',
      name: 'electric-border-css',
      url: 'https://www.npmjs.com/package/electric-border-css',
      description:
        'Animated CSS border effects &mdash; React, Vue, Next.js &amp; Svelte with live demo.',
      tags: ['CSS', 'React', 'Vue', 'Svelte'],
      linkText: 'View Package',
    },
    {
      icon: 'daemon-icon.svg',
      iconIsLocal: true,
      name: 'daemon-os',
      url: 'https://github.com/hammadxcm/daemon-os',
      description:
        'macOS MCP server for AI agent computer-use &mdash; gives AI eyes &amp; hands on your Mac.',
      tags: ['MCP', 'macOS', 'AI', 'Swift'],
      linkText: 'View Repo',
    },
  ],

  /* ─── Certifications ─── */
  certifications: [
    {
      href: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/1526fe3f-31e1-4cab-85a5-16669ad20b8b-hammad-khan-a4dafb82-c00d-4efd-965b-1194fb66f7e9-certificate.pdf',
      ariaLabel: 'View OWASP Top 10 Security Threats certificate',
      badge: {
        type: 'svg',
        svg: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" role="img" aria-label="Security badge"><path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="#00bfbf" stroke-width="1.5" fill="rgba(0,191,191,0.1)"/><path d="M9 12l2 2 4-4" stroke="#00bfbf" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      },
      category: 'Security',
      name: 'OWASP Top 10 Security Threats',
      issuer: 'The Linux Foundation',
      date: 'December 2025',
    },
    {
      href: 'https://www.linkedin.com/learning/certificates/d57c36b7fe8db2dbb80431f9fbdfb3a48253ce9cb59576d9d5e8720851029878',
      ariaLabel: 'View Ethical Hacking Introduction certificate',
      badge: {
        type: 'svg',
        svg: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" role="img" aria-label="Lock badge"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#557C94" stroke-width="1.5" fill="rgba(85,124,148,0.1)"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="#557C94" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="16" r="1.5" fill="#557C94"/></svg>',
      },
      category: 'Security',
      name: 'Ethical Hacking: Introduction',
      issuer: 'LinkedIn Learning',
    },
    {
      href: 'https://www.linkedin.com/learning/certificates/2dcfc22edd19dfca6f8a8d057a4ae887d0b915268a3887680a9d0a9234e25a62',
      ariaLabel: 'View HIPAA Compliance Program certificate',
      badge: {
        type: 'svg',
        svg: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" role="img" aria-label="Document badge"><path d="M9 12h6M9 16h6M13 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-5-5z" stroke="#0093DD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="rgba(0,147,221,0.1)"/><path d="M13 4v5h5" stroke="#0093DD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      },
      category: 'Compliance',
      name: 'Building a HIPAA Compliance Program',
      issuer: 'LinkedIn Learning',
    },
    {
      href: 'https://www.linkedin.com/learning/certificates/f6fad5371eae0d8acfee3b3a2c8edca7cbe33a63730f0cd560bb993df5438309',
      ariaLabel: 'View Networking Foundations Basics certificate',
      badge: {
        type: 'svg',
        svg: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" role="img" aria-label="Network badge"><circle cx="5" cy="12" r="2" stroke="#1BA0D7" stroke-width="1.5" fill="rgba(27,160,215,0.1)"/><circle cx="12" cy="12" r="2" stroke="#1BA0D7" stroke-width="1.5" fill="rgba(27,160,215,0.1)"/><circle cx="19" cy="12" r="2" stroke="#1BA0D7" stroke-width="1.5" fill="rgba(27,160,215,0.1)"/><path d="M7 12h3M14 12h3" stroke="#1BA0D7" stroke-width="1.5"/><path d="M5 8v-2M12 6v-2M19 8v-2M5 16v2M12 18v2M19 16v2" stroke="#1BA0D7" stroke-width="2" stroke-linecap="round"/></svg>',
      },
      category: 'Networking',
      name: 'Networking Foundations: Basics',
      issuer: 'LinkedIn Learning',
    },
    {
      href: 'https://www.linkedin.com/learning/certificates/b36c2bda03eda9a68e4dec50def0daad8dcb9b6c67492627c9b8bd377fb67f4c',
      ariaLabel: 'View Hotwire Reactive Rails Apps certificate',
      badge: {
        type: 'image',
        src: 'https://skillicons.dev/icons?i=rails',
        width: 44,
        alt: 'Hotwire',
      },
      category: 'Web Frameworks',
      name: 'Hotwire: Reactive Rails Apps',
      issuer: 'LinkedIn Learning',
      date: 'June 2024',
    },
    {
      href: 'https://www.linkedin.com/learning/certificates/d335c38204c29a4f8ce7e07c0ecaa5077067865b9792595e481905b3fd06586d',
      ariaLabel: 'View Ruby Testing with RSpec certificate',
      badge: {
        type: 'image',
        src: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/rspec/rspec-original.svg',
        width: 44,
        alt: 'RSpec',
      },
      category: 'Testing',
      name: 'Ruby Testing with RSpec',
      issuer: 'LinkedIn Learning',
      date: 'August 2024',
    },
    {
      href: 'https://www.linkedin.com/learning/certificates/e30b66061cc2080040e0df0c0e173d00a2203112628954ed1355fab6fcc85956',
      ariaLabel: 'View TypeScript Essential Training certificate',
      badge: {
        type: 'image',
        src: 'https://techstack-generator.vercel.app/ts-icon.svg',
        width: 50,
        alt: 'TypeScript',
      },
      category: 'Languages',
      name: 'TypeScript Essential Training',
      issuer: 'LinkedIn Learning',
    },
    {
      href: 'https://www.linkedin.com/learning/certificates/0bf6f582259007a4e436be7004b0f7ed3e8bf9972b6a7dbac68ea2867493aacf',
      ariaLabel: 'View MySQL Installation and Configuration certificate',
      badge: {
        type: 'image',
        src: 'https://techstack-generator.vercel.app/mysql-icon.svg',
        width: 50,
        alt: 'MySQL',
      },
      category: 'Databases',
      name: 'MySQL Installation & Configuration',
      issuer: 'LinkedIn Learning',
      date: 'March 2024',
    },
    {
      href: 'https://www.linkedin.com/learning/certificates/3b36f2ca76a1876379837a9403195e104dd354781a13989cbfcc452188e85a8e',
      ariaLabel: 'View Learning Git and GitHub certificate',
      badge: {
        type: 'image',
        src: 'https://techstack-generator.vercel.app/github-icon.svg',
        width: 50,
        alt: 'Git & GitHub',
      },
      category: 'Tools',
      name: 'Learning Git and GitHub',
      issuer: 'LinkedIn Learning',
    },
    {
      href: 'https://www.coursera.org/account/accomplishments/verify/BLQ2MA03WL9N',
      ariaLabel: 'View Programming for Everybody Python certificate',
      badge: {
        type: 'image',
        src: 'https://techstack-generator.vercel.app/python-icon.svg',
        width: 50,
        alt: 'Python',
      },
      category: 'Python',
      name: 'Programming for Everybody (Python)',
      issuer: 'Coursera &middot; University of Michigan',
      date: 'December 2024',
    },
    {
      href: 'https://www.coursera.org/account/accomplishments/verify/J79EC6EVAUDM',
      ariaLabel: 'View Python Data Structures certificate',
      badge: {
        type: 'image',
        src: 'https://techstack-generator.vercel.app/python-icon.svg',
        width: 50,
        alt: 'Python',
      },
      category: 'Python',
      name: 'Python Data Structures',
      issuer: 'Coursera &middot; University of Michigan',
      date: 'May 2025',
    },
    {
      href: 'https://www.linkedin.com/learning/certificates/9e3c21550dc5afe1ada5f58b16174065b0bf2318149047b316d954b800a731b4',
      ariaLabel: 'View Build AI Agents with n8n certificate',
      badge: {
        type: 'svg',
        svg: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" role="img" aria-label="AI network badge"><circle cx="6" cy="12" r="3" stroke="#EA4B71" stroke-width="1.5" fill="rgba(234,75,113,0.1)"/><circle cx="18" cy="8" r="3" stroke="#EA4B71" stroke-width="1.5" fill="rgba(234,75,113,0.1)"/><circle cx="18" cy="16" r="3" stroke="#EA4B71" stroke-width="1.5" fill="rgba(234,75,113,0.1)"/><path d="M8.5 10.5L15.5 8.5M8.5 13.5l7 2" stroke="#EA4B71" stroke-width="1.5"/></svg>',
      },
      category: 'AI &amp; Automation',
      name: 'Build AI Agents with n8n',
      issuer: 'LinkedIn Learning',
    },
  ],

  /* ─── GitHub ─── */
  github: {
    username: 'hammadxcm',
    utcOffset: 5,
  },

  /* ─── LeetCode (optional) ─── */
  leetcode: { username: 'hammadxcm' },

  /* ─── StackOverflow (optional) ─── */
  stackoverflow: { userId: 6485663 },

  /* ─── HackerRank (optional) ─── */
  hackerrank: { username: 'hammadxcm' },

  /* ─── Socials ─── */
  socials: [
    { platform: 'github', url: 'https://github.com/hammadxcm', label: 'GitHub' },
    { platform: 'linkedin', url: 'https://linkedin.com/in/hammadxcm', label: 'LinkedIn' },
    { platform: 'twitter', url: 'https://twitter.com/hammadkhanxcm', label: 'Twitter' },
    {
      platform: 'stackoverflow',
      url: 'https://stackoverflow.com/users/6485663',
      label: 'Stack Overflow',
    },
    { platform: 'leetcode', url: 'https://leetcode.com/u/hammadxcm', label: 'LeetCode' },
    {
      platform: 'hackerrank',
      url: 'https://www.hackerrank.com/profile/hammadxcm',
      label: 'HackerRank',
    },
  ],

  /* ─── Sections (nav order) ─── */
  sections: [
    { id: 'about', label: 'About' },
    { id: 'tech', label: 'Skills' },
    { id: 'journey', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'certs', label: 'Certifications' },
    { id: 'analytics', label: 'Analytics' },
  ],

  /* ─── Boot Sequence ─── */
  boot: {
    welcomeName: 'HAMMAD',
  },
};

export default config;
