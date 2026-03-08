export interface FSNode {
  type: 'file' | 'dir';
  content?: string;
  children?: Record<string, FSNode>;
}

export function buildFileSystem(): FSNode {
  const root: FSNode = {
    type: 'dir',
    children: {
      home: {
        type: 'dir',
        children: {
          hammad: {
            type: 'dir',
            children: {
              'about.txt': {
                type: 'file',
                content: [
                  'Hammad Khan',
                  '============',
                  'Senior Full Stack Engineer',
                  '',
                  '6+ years building distributed systems at scale.',
                  'Ruby on Rails, React, Node.js, TypeScript, AWS.',
                  '',
                  'Based in Islamabad, Pakistan.',
                  'Currently working at Toptal.',
                ].join('\n'),
              },
              skills: {
                type: 'dir',
                children: {
                  'frontend.txt': {
                    type: 'file',
                    content:
                      'Frontend Skills\n===============\nReact, Next.js, TypeScript, Tailwind CSS, Astro\nHTML5, CSS3, SCSS, Responsive Design\nState Management: Redux, Zustand, Context API',
                  },
                  'backend.txt': {
                    type: 'file',
                    content:
                      'Backend Skills\n==============\nRuby on Rails, Node.js, Express, NestJS\nGraphQL, REST APIs, WebSockets\nPostgreSQL, Redis, MongoDB, ElasticSearch',
                  },
                  'devops.txt': {
                    type: 'file',
                    content:
                      'DevOps & Cloud\n==============\nAWS (EC2, S3, Lambda, ECS, RDS)\nDocker, Kubernetes, Terraform\nCI/CD: GitHub Actions, CircleCI\nMonitoring: Datadog, Sentry',
                  },
                },
              },
              experience: {
                type: 'dir',
                children: {
                  'current.txt': {
                    type: 'file',
                    content:
                      'Senior Software Engineer @ Toptal\n2022 - Present\n\nBuilding distributed systems and microservices.\nLeading architecture decisions for scalable platforms.',
                  },
                  'previous.txt': {
                    type: 'file',
                    content:
                      'Full Stack Developer @ Various Companies\n2018 - 2022\n\nBuilt production applications with Ruby on Rails and React.\nManaged cloud infrastructure on AWS.\nContributed to open source projects.',
                  },
                },
              },
              projects: {
                type: 'dir',
                children: {
                  'README.txt': {
                    type: 'file',
                    content:
                      'Open Source Projects\n===================\nVisit the portfolio to see all projects with live demos and GitHub links.\n\nNotable:\n- hammadxcm (this portfolio)\n- Various open source contributions\n- Developer tools and utilities',
                  },
                },
              },
              certifications: {
                type: 'dir',
                children: {
                  'README.txt': {
                    type: 'file',
                    content:
                      'Certifications\n==============\nAWS Solutions Architect\nRuby on Rails Certified Developer\nAnd more — see the portfolio for details.',
                  },
                },
              },
              '.secret': {
                type: 'file',
                content: [
                  'You found the hidden file!',
                  '',
                  'Achievement Unlocked: Hidden File',
                  '',
                  'Fun facts:',
                  '- This portfolio has 50+ interactive features',
                  '- There are 37+ achievements to unlock',
                  '- Try the Konami code on the main page',
                  '- The CTF challenge is hidden in the source',
                  '',
                  '// Stay curious, keep hacking.',
                ].join('\n'),
              },
            },
          },
        },
      },
    },
  };

  return root;
}
