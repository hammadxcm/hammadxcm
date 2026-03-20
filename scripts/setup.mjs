#!/usr/bin/env node

/**
 * Hacker Portfolio — Interactive Setup Wizard
 *
 * Usage:
 *   npm run setup:init                          # Interactive mode
 *   npm run setup:init -- --username janedoe    # CLI mode (missing required values prompt interactively)
 *   npm run setup:init -- --tui                 # Launch TUI config editor
 *
 * CLI flags (all optional except --username and --name for non-interactive):
 *   --username, --name, --url, --theme, --title, --utc-offset, --greeting,
 *   --codename, --experience, --location, --current-op, --focus,
 *   --logo-suffix, --leetcode, --stackoverflow, --hackerrank,
 *   --linkedin, --twitter, --force, --tui
 *
 * Edit mode: When portfolio.config.ts already exists, the wizard loads it and
 * pre-fills all prompts with current values. Press Enter to keep, or type a
 * new value to change. In edit mode, Phases 2–7 can be skipped entirely.
 */

import fs from 'node:fs';
import path from 'node:path';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import gradient from 'gradient-string';
import ora from 'ora';
import boxen from 'boxen';

import {
  ROOT,
  THEMES,
  isInteractive,
  handleCancel,
  loadExistingConfig,
  saveConfig,
  serializeToTypeScript,
  validateUsername,
  validateRequired,
  validateUrl,
  validateRequiredUrl,
  validateNumber,
  promptText,
  promptSelect,
  promptConfirm,
  promptKeepArray,
  collectArrayItems,
  summarizeArray,
  splitCSV,
  resolveTechIcon,
  resolveTechUrl,
} from './lib/setup-utils.mjs';

// ── CLI arg parsing ────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        parsed[key] = next;
        i++;
      } else {
        parsed[key] = true;
      }
    }
  }
  return parsed;
}

// ── Phase-skip gate (edit mode only) ──────────────────────────────────
async function shouldEditPhase(phaseNum, phaseLabel, editMode) {
  if (!editMode || !isInteractive) return true;
  return handleCancel(await p.confirm({
    message: `Edit Phase ${phaseNum}: ${phaseLabel}?`,
    initialValue: false,
  }));
}

// ── Main ───────────────────────────────────────────────────────────────
async function main() {
  const cliArgs = parseArgs();

  // --tui flag: delegate to TUI editor
  if (cliArgs.tui) {
    const { execFileSync } = await import('node:child_process');
    execFileSync('node', [path.join(ROOT, 'scripts/setup-tui.mjs')], { stdio: 'inherit' });
    return;
  }

  // Header
  console.log();
  console.log(gradient.cristal.multiline('  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n  \u2551     Hacker Portfolio Setup Wizard    \u2551\n  \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D'));
  console.log();

  p.intro(chalk.cyan('Configure your portfolio — full setup'));

  // ════════════════════════════════════════════════════════════════════
  // Startup: Load existing config & overwrite check
  // ════════════════════════════════════════════════════════════════════
  const configDest = path.join(ROOT, 'src/config/portfolio.config.ts');
  const existing = loadExistingConfig(configDest);
  const editMode = existing !== null;

  if (editMode && isInteractive) {
    p.log.info(chalk.green('Existing config loaded — press Enter to keep current values'));
    p.log.info(chalk.dim('In edit mode you can skip entire phases to keep those sections unchanged'));
  }

  // Overwrite check upfront
  if (fs.existsSync(configDest) && cliArgs.force !== true) {
    if (!isInteractive) {
      p.cancel('portfolio.config.ts exists — use --force to overwrite.');
      process.exit(1);
    }
    if (!editMode) {
      const overwrite = await p.confirm({
        message: 'portfolio.config.ts already exists. Overwrite?',
        initialValue: false,
      });
      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel('Setup cancelled — existing config preserved.');
        process.exit(0);
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // Phase 1: Identity & Site (never skippable — required fields)
  // ════════════════════════════════════════════════════════════════════
  if (isInteractive) p.log.step(chalk.bold('Phase 1: Identity & Site'));

  const username = (await promptText(cliArgs.username, {
    message: 'GitHub username',
    placeholder: existing?.github?.username || 'janedoe',
    defaultValue: existing?.github?.username || '',
    validate: validateUsername,
  })).trim();
  if (!username) { p.cancel('Username is required.'); process.exit(1); }

  const fullName = (await promptText(cliArgs.name, {
    message: 'Full name',
    placeholder: existing?.site?.name || 'Jane Doe',
    defaultValue: existing?.site?.name || '',
    validate: validateRequired('Name'),
  })).trim();
  if (!fullName) { p.cancel('Name is required.'); process.exit(1); }

  const title = (await promptText(cliArgs.title, {
    message: 'Professional title',
    placeholder: existing?.site?.title || 'Full Stack Developer',
    defaultValue: existing?.site?.title || 'Software Engineer',
  })).trim();

  const defaultUrl = existing?.site?.url || `https://${username}.github.io/${username}`;
  const siteUrl = (await promptText(cliArgs.url, {
    message: 'Site URL',
    placeholder: defaultUrl,
    defaultValue: defaultUrl,
    validate: validateRequiredUrl,
  })).trim();

  const logoSuffix = (await promptText(cliArgs['logo-suffix'], {
    message: 'Logo suffix',
    placeholder: existing?.site?.logoSuffix || '.dev',
    defaultValue: existing?.site?.logoSuffix || '.dev',
  })).trim();

  const theme = await promptSelect(cliArgs.theme, {
    message: 'Default theme',
    options: THEMES,
    initialValue: existing?.site?.theme || 'hacker',
  });

  const utcOffsetRaw = await promptText(cliArgs['utc-offset'], {
    message: 'UTC offset (e.g. -5, 5.5, 0)',
    placeholder: existing ? String(existing.github?.utcOffset ?? 0) : '0',
    defaultValue: existing ? String(existing.github?.utcOffset ?? 0) : '0',
    validate: validateNumber,
  });
  const utcOffset = Number(utcOffsetRaw) || 0;

  // ════════════════════════════════════════════════════════════════════
  // Phase 2: Hero
  // ════════════════════════════════════════════════════════════════════
  let greeting, typewriterTexts;
  if (await shouldEditPhase(2, 'Hero', editMode)) {
    if (isInteractive) { console.log(); p.log.step(chalk.bold('Phase 2: Hero')); }

    greeting = (await promptText(cliArgs.greeting, {
      message: 'Terminal greeting',
      placeholder: existing?.hero?.greeting || 'root@kali:~# whoami',
      defaultValue: existing?.hero?.greeting || 'root@kali:~# whoami',
    })).trim();

    // Typewriter texts — keep/redo pattern
    if (editMode && existing.hero?.typewriterTexts?.length > 0) {
      const keep = await promptKeepArray(
        'typewriter texts',
        summarizeArray(existing.hero.typewriterTexts, (t) => t, 'text'),
      );
      if (keep) {
        typewriterTexts = existing.hero.typewriterTexts;
      }
    }
    if (!typewriterTexts) {
      const typewriterRaw = await promptText(undefined, {
        message: 'Typewriter texts (comma-separated)',
        placeholder: `> ${title}, > Open Source Contributor`,
        defaultValue: `> ${title}`,
      });
      typewriterTexts = splitCSV(typewriterRaw);
      if (typewriterTexts.length === 0) typewriterTexts.push(`> ${title}`);
    }
  } else {
    greeting = existing.hero?.greeting || 'root@kali:~# whoami';
    typewriterTexts = existing.hero?.typewriterTexts || [`> ${title}`];
  }

  // ════════════════════════════════════════════════════════════════════
  // Phase 3: About You
  // ════════════════════════════════════════════════════════════════════
  let codename, experienceSummary, location, clearance, currentOp,
    arsenal, missionLog, knownAliases, currentFocus, philosophy;

  if (await shouldEditPhase(3, 'About You', editMode)) {
    if (isInteractive) { console.log(); p.log.step(chalk.bold('Phase 3: About You')); }

    codename = (await promptText(cliArgs.codename, {
      message: 'Codename',
      placeholder: existing?.about?.codename || username,
      defaultValue: existing?.about?.codename || username,
    })).trim();

    experienceSummary = (await promptText(cliArgs.experience, {
      message: 'Experience summary',
      placeholder: existing?.about?.experience || '5+ years building web apps',
      defaultValue: existing?.about?.experience || 'Building software',
    })).trim();

    location = (await promptText(cliArgs.location, {
      message: 'Location',
      placeholder: existing?.about?.location || 'San Francisco, CA',
      defaultValue: existing?.about?.location || 'Earth',
    })).trim();

    clearance = (await promptText(undefined, {
      message: 'Clearance level (thematic label)',
      placeholder: existing?.about?.clearance || 'Level 4 — Systems Architecture',
      defaultValue: existing?.about?.clearance || 'Level 4 \u2014 Systems Architecture',
    })).trim();

    currentOp = (await promptText(cliArgs['current-op'], {
      message: 'Current role / company',
      placeholder: existing?.about?.currentOp || 'Senior Developer @ Acme Corp',
      defaultValue: existing?.about?.currentOp || `${title} @ Company`,
    })).trim();

    // Arsenal — keep/redo
    if (editMode && existing.about?.arsenal?.length > 0) {
      const keep = await promptKeepArray(
        'arsenal',
        summarizeArray(existing.about.arsenal, (e) => e.key, 'entry'),
      );
      if (keep) arsenal = existing.about.arsenal;
    }
    if (!arsenal) {
      arsenal = await collectArrayItems('arsenal entry', async () => {
        const key = handleCancel(await p.text({
          message: 'Category key (e.g. frontend, backend, devops)',
          validate: validateRequired('Key'),
        }));
        const value = handleCancel(await p.text({
          message: 'Techs (pipe-separated, e.g. React | TypeScript | Next.js)',
          validate: validateRequired('Value'),
        }));
        return { key: key.trim(), value: value.trim() };
      }, { min: 1 });

      if (arsenal.length === 0) {
        arsenal.push({ key: 'tools', value: 'JavaScript | TypeScript | React' });
      }
    }

    // Mission log — keep/redo
    if (editMode && existing.about?.missionLog?.length > 0) {
      const keep = await promptKeepArray(
        'mission log',
        summarizeArray(existing.about.missionLog, (m) => m, 'entry'),
      );
      if (keep) missionLog = existing.about.missionLog;
    }
    if (!missionLog) {
      const missionLogRaw = await promptText(undefined, {
        message: 'Achievements / mission log (comma-separated)',
        placeholder: 'Shipped production apps, Open source contributor',
        defaultValue: 'Building great software',
      });
      missionLog = splitCSV(missionLogRaw);
      if (missionLog.length === 0) missionLog.push('Building great software');
    }

    // Known aliases — keep/redo
    if (editMode && existing.about?.knownAliases?.length > 0) {
      const keep = await promptKeepArray(
        'known aliases',
        summarizeArray(existing.about.knownAliases, (a) => a, 'alias'),
      );
      if (keep) knownAliases = existing.about.knownAliases;
    }
    if (!knownAliases) {
      const aliasesRaw = await promptText(undefined, {
        message: 'Known aliases (comma-separated, optional)',
        placeholder: `${username}, code-ninja`,
        defaultValue: username,
      });
      knownAliases = splitCSV(aliasesRaw);
      if (knownAliases.length === 0) knownAliases.push(username);
    }

    // Current focus
    currentFocus = (await promptText(cliArgs.focus, {
      message: 'Current focus',
      placeholder: existing?.about?.currentFocus || 'Cloud-Native Architecture & Developer Experience',
      defaultValue: existing?.about?.currentFocus || 'Building great products',
    })).trim();

    // Philosophy — keep/redo
    if (editMode && existing.about?.philosophy?.length > 0) {
      const keep = await promptKeepArray(
        'philosophy',
        summarizeArray(existing.about.philosophy, (ph) => ph, 'line'),
      );
      if (keep) philosophy = existing.about.philosophy;
    }
    if (!philosophy) {
      const philosophyRaw = await promptText(undefined, {
        message: 'Philosophy (comma-separated lines)',
        placeholder: 'Writing clean code, Building products that matter',
        defaultValue: 'Writing clean code.',
      });
      philosophy = splitCSV(philosophyRaw);
      if (philosophy.length === 0) philosophy.push('Writing clean code.');
    }
  } else {
    codename = existing.about?.codename || username;
    experienceSummary = existing.about?.experience || 'Building software';
    location = existing.about?.location || 'Earth';
    clearance = existing.about?.clearance || 'Level 4 \u2014 Systems Architecture';
    currentOp = existing.about?.currentOp || `${title} @ Company`;
    arsenal = existing.about?.arsenal || [{ key: 'tools', value: 'JavaScript | TypeScript | React' }];
    missionLog = existing.about?.missionLog || ['Building great software'];
    knownAliases = existing.about?.knownAliases || [username];
    currentFocus = existing.about?.currentFocus || 'Building great products';
    philosophy = existing.about?.philosophy || ['Writing clean code.'];
  }

  // ════════════════════════════════════════════════════════════════════
  // Phase 4: Tech Stack
  // ════════════════════════════════════════════════════════════════════
  let techStack;
  if (await shouldEditPhase(4, 'Tech Stack', editMode)) {
    if (isInteractive) { console.log(); p.log.step(chalk.bold('Phase 4: Tech Stack')); }

    if (editMode && existing.techStack?.length > 0) {
      const keep = await promptKeepArray(
        'tech stack',
        summarizeArray(existing.techStack, (c) => c.title, 'category'),
      );
      if (keep) techStack = existing.techStack;
    }
    if (!techStack) {
      techStack = await collectArrayItems('tech category', async () => {
        const catTitle = handleCancel(await p.text({
          message: 'Category name (e.g. Frontend, Backend, DevOps)',
          validate: validateRequired('Category name'),
        }));
        const emoji = handleCancel(await p.text({
          message: 'Emoji for category',
          placeholder: '\uD83D\uDCBB',
          defaultValue: '\uD83D\uDCBB',
        }));
        const techsRaw = handleCancel(await p.text({
          message: 'Tech names (comma-separated, e.g. React, TypeScript, Next.js)',
          validate: validateRequired('At least one tech'),
        }));
        const techNames = splitCSV(techsRaw);
        if (techNames.length === 0) return null;

        const items = techNames.map((name) => ({
          name,
          icon: resolveTechIcon(name),
          url: resolveTechUrl(name),
        }));

        return { title: catTitle.trim(), emoji: emoji.trim(), items };
      }, { min: 1 });

      if (techStack.length === 0) {
        techStack.push({
          title: 'Languages & Tools',
          emoji: '\uD83D\uDCBB',
          items: [
            { name: 'JavaScript', icon: resolveTechIcon('JavaScript'), url: resolveTechUrl('JavaScript') },
            { name: 'TypeScript', icon: resolveTechIcon('TypeScript'), url: resolveTechUrl('TypeScript') },
          ],
        });
      }
    }
  } else {
    techStack = existing.techStack || [];
  }

  // ════════════════════════════════════════════════════════════════════
  // Phase 5: Experience / Journey
  // ════════════════════════════════════════════════════════════════════
  let experience;
  if (await shouldEditPhase(5, 'Experience', editMode)) {
    if (isInteractive) { console.log(); p.log.step(chalk.bold('Phase 5: Experience / Journey')); }

    if (editMode && existing.experience?.length > 0) {
      const keep = await promptKeepArray(
        'experience',
        summarizeArray(existing.experience, (e) => `${e.role} @ ${e.company}`, 'entry'),
      );
      if (keep) experience = existing.experience;
    }
    if (!experience) {
      experience = await collectArrayItems('experience entry', async () => {
        const date = handleCancel(await p.text({
          message: 'Date range (e.g. Jan 2023 — Present)',
          validate: validateRequired('Date'),
        }));
        const role = handleCancel(await p.text({
          message: 'Role',
          validate: validateRequired('Role'),
        }));
        const company = handleCancel(await p.text({
          message: 'Company',
          validate: validateRequired('Company'),
        }));
        const companyUrl = handleCancel(await p.text({
          message: 'Company URL',
          placeholder: 'https://example.com',
          defaultValue: 'https://example.com',
          validate: validateRequiredUrl,
        }));
        const meta = handleCancel(await p.text({
          message: 'Meta line (e.g. Full-time · Remote)',
          placeholder: 'Full-time',
          defaultValue: 'Full-time',
        }));
        const achievementsRaw = handleCancel(await p.text({
          message: 'Achievements (comma-separated)',
          validate: validateRequired('At least one achievement'),
        }));
        const tagsRaw = handleCancel(await p.text({
          message: 'Tags (comma-separated)',
          validate: validateRequired('At least one tag'),
        }));
        return {
          date: date.trim(),
          role: role.trim(),
          company: company.trim(),
          companyUrl: companyUrl.trim(),
          meta: meta.trim(),
          achievements: splitCSV(achievementsRaw),
          tags: splitCSV(tagsRaw),
        };
      }, { min: 1 });

      if (experience.length === 0) {
        experience.push({
          date: '2024 &mdash; Present',
          role: title,
          company: 'Company',
          companyUrl: 'https://example.com',
          meta: 'Full-time',
          achievements: ['Building great software'],
          tags: ['Development'],
        });
      }
    }
  } else {
    experience = existing.experience || [];
  }

  // ════════════════════════════════════════════════════════════════════
  // Phase 6: Projects
  // ════════════════════════════════════════════════════════════════════
  let projects;
  if (await shouldEditPhase(6, 'Projects', editMode)) {
    if (isInteractive) { console.log(); p.log.step(chalk.bold('Phase 6: Projects')); }

    if (editMode && existing.projects?.length > 0) {
      const keep = await promptKeepArray(
        'projects',
        summarizeArray(existing.projects, (proj) => proj.name, 'project'),
      );
      if (keep) projects = existing.projects;
    }
    if (!projects) {
      const existingProjectNames = new Set();
      projects = await collectArrayItems('project', async () => {
        const name = handleCancel(await p.text({
          message: 'Project name',
          validate: (val) => {
            if (!val || !val.trim()) return 'Name is required';
            if (existingProjectNames.has(val.trim())) return 'Duplicate project name';
          },
        }));
        existingProjectNames.add(name.trim());
        const url = handleCancel(await p.text({
          message: 'Project URL',
          placeholder: `https://github.com/${username}/${name.trim().toLowerCase().replace(/\s+/g, '-')}`,
          defaultValue: `https://github.com/${username}/${name.trim().toLowerCase().replace(/\s+/g, '-')}`,
          validate: validateRequiredUrl,
        }));
        const description = handleCancel(await p.text({
          message: 'Short description',
          validate: validateRequired('Description'),
        }));
        const tagsRaw = handleCancel(await p.text({
          message: 'Tags (comma-separated)',
          placeholder: 'React, TypeScript',
          defaultValue: 'JavaScript',
        }));
        const linkText = handleCancel(await p.text({
          message: 'Link text',
          placeholder: 'View Repo',
          defaultValue: 'View Repo',
        }));
        const tags = splitCSV(tagsRaw);
        const firstTag = tags[0] || 'github';
        const icon = resolveTechIcon(firstTag);
        return {
          icon,
          name: name.trim(),
          url: url.trim(),
          description: description.trim(),
          tags,
          linkText: linkText.trim(),
        };
      }, { min: 1 });

      if (projects.length === 0) {
        projects.push({
          icon: 'https://skillicons.dev/icons?i=github',
          name: 'My Project',
          url: `https://github.com/${username}/${username}`,
          description: 'A project built with modern technologies.',
          tags: ['JavaScript'],
          linkText: 'View Repo',
        });
      }
    }
  } else {
    projects = existing.projects || [];
  }

  // ════════════════════════════════════════════════════════════════════
  // Phase 7: Integrations & Socials
  // ════════════════════════════════════════════════════════════════════
  let leetcodeConfig, stackoverflowConfig, hackerrankConfig,
    linkedin, twitter, enableContributions, guestbookConfig,
    testimonialsConfig, certifications, socials, sections;

  if (await shouldEditPhase(7, 'Integrations & Socials', editMode)) {
    if (isInteractive) { console.log(); p.log.step(chalk.bold('Phase 7: Integrations & Socials')); }

    // LeetCode
    const enableLeetcode = await promptConfirm(cliArgs.leetcode ? true : undefined, {
      message: 'Enable LeetCode integration?',
      initialValue: !!existing?.leetcode,
    });
    if (enableLeetcode) {
      const lcUser = (await promptText(cliArgs.leetcode, {
        message: 'LeetCode username',
        placeholder: existing?.leetcode?.username || username,
        defaultValue: existing?.leetcode?.username || username,
      })).trim();
      if (lcUser) leetcodeConfig = { username: lcUser };
    }

    // StackOverflow
    const enableSO = await promptConfirm(cliArgs.stackoverflow ? true : undefined, {
      message: 'Enable StackOverflow integration?',
      initialValue: !!existing?.stackoverflow,
    });
    if (enableSO) {
      const soDefault = existing?.stackoverflow?.userId ? String(existing.stackoverflow.userId) : '';
      const soId = (await promptText(cliArgs.stackoverflow, {
        message: 'StackOverflow user ID',
        placeholder: soDefault || '1234567',
        defaultValue: soDefault,
        validate: (val) => {
          if (!val || !val.trim()) return 'User ID is required';
          if (Number.isNaN(Number(val.trim()))) return 'Must be a number';
        },
      })).trim();
      if (soId) stackoverflowConfig = { userId: Number(soId) };
    }

    // HackerRank
    const enableHR = await promptConfirm(cliArgs.hackerrank ? true : undefined, {
      message: 'Enable HackerRank integration?',
      initialValue: !!existing?.hackerrank,
    });
    if (enableHR) {
      const hrUser = (await promptText(cliArgs.hackerrank, {
        message: 'HackerRank username',
        placeholder: existing?.hackerrank?.username || username,
        defaultValue: existing?.hackerrank?.username || username,
      })).trim();
      if (hrUser) hackerrankConfig = { username: hrUser };
    }

    // LinkedIn
    const existingLinkedin = existing?.socials?.find((s) => s.platform === 'linkedin')?.url || '';
    linkedin = (await promptText(cliArgs.linkedin, {
      message: 'LinkedIn URL (optional — press Enter to skip)',
      placeholder: existingLinkedin || 'https://linkedin.com/in/username',
      validate: validateUrl,
      defaultValue: existingLinkedin,
    })).trim();

    // Twitter/X
    const existingTwitter = existing?.socials?.find((s) => s.platform === 'twitter')?.url || '';
    twitter = (await promptText(cliArgs.twitter, {
      message: 'Twitter/X URL (optional — press Enter to skip)',
      placeholder: existingTwitter || 'https://twitter.com/username',
      validate: validateUrl,
      defaultValue: existingTwitter,
    })).trim();

    // Contributions
    enableContributions = await promptConfirm(undefined, {
      message: 'Enable OSS contributions section?',
      initialValue: existing?.contributions?.enabled ?? true,
    });

    // Guestbook
    const enableGuestbook = await promptConfirm(undefined, {
      message: 'Enable guestbook (requires Giscus)?',
      initialValue: !!existing?.guestbook,
    });
    if (enableGuestbook) {
      if (editMode && existing?.guestbook) {
        guestbookConfig = existing.guestbook;
      } else {
        guestbookConfig = {
          giscus: {
            repo: `${username}/${username}.github.io`,
            repoId: 'R_kgDOxxxxxxx',
            category: 'General',
            categoryId: 'DIC_kwDOxxxxxxx',
          },
          statsApi: 'https://your-stats-worker.workers.dev',
        };
        if (isInteractive) {
          p.log.warn(chalk.yellow('Guestbook enabled with placeholder Giscus IDs — update them in portfolio.config.ts'));
        }
      }
    }

    // Testimonials — keep/redo
    const enableTestimonials = await promptConfirm(undefined, {
      message: 'Enable testimonials section?',
      initialValue: editMode && existing?.testimonials?.length > 0,
    });
    if (enableTestimonials) {
      if (editMode && existing?.testimonials?.length > 0) {
        const keep = await promptKeepArray(
          'testimonials',
          summarizeArray(existing.testimonials, (t) => t.author, 'entry'),
        );
        if (keep) {
          testimonialsConfig = existing.testimonials;
        } else {
          testimonialsConfig = [
            { quote: 'A great developer to work with.', author: 'Colleague', role: 'Engineer', company: 'Company' },
          ];
        }
      } else {
        testimonialsConfig = [
          { quote: 'A great developer to work with.', author: 'Colleague', role: 'Engineer', company: 'Company' },
        ];
      }
    }

    // Certifications
    if (editMode && existing?.certifications?.length > 0) {
      certifications = existing.certifications;
    } else {
      certifications = [
        {
          href: 'https://example.com/cert1',
          ariaLabel: 'View certification',
          badge: { type: 'image', src: 'https://techstack-generator.vercel.app/aws-icon.svg', width: 50, height: 50, alt: 'Certification' },
          category: 'Cloud',
          name: 'Cloud Certification',
          issuer: 'Cloud Provider',
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
          name: 'Security Fundamentals',
          issuer: 'Security Org',
        },
      ];
    }

    // Socials — keep/redo
    if (editMode && existing?.socials?.length > 0) {
      const keep = await promptKeepArray(
        'socials',
        summarizeArray(existing.socials, (s) => s.platform, 'entry'),
      );
      if (keep) socials = existing.socials;
    }
    if (!socials) {
      socials = [];
      socials.push({ platform: 'github', label: 'GitHub' });
      if (linkedin) socials.push({ platform: 'linkedin', url: linkedin, label: 'LinkedIn' });
      if (twitter) socials.push({ platform: 'twitter', url: twitter, label: 'Twitter' });
      if (stackoverflowConfig) socials.push({ platform: 'stackoverflow', label: 'Stack Overflow' });
      if (leetcodeConfig) socials.push({ platform: 'leetcode', label: 'LeetCode' });
      if (hackerrankConfig) socials.push({ platform: 'hackerrank', label: 'HackerRank' });
    }

    // Sections — keep/redo
    if (editMode && existing?.sections?.length > 0) {
      const keep = await promptKeepArray(
        'sections',
        summarizeArray(existing.sections, (s) => s.id, 'entry'),
      );
      if (keep) sections = existing.sections;
    }
    if (!sections) {
      sections = [
        { id: 'about', label: 'About' },
        { id: 'tech', label: 'Skills' },
        { id: 'journey', label: 'Experience' },
        { id: 'projects', label: 'Projects' },
      ];
      if (enableContributions) sections.push({ id: 'contributions', label: 'Contributions' });
      sections.push({ id: 'analytics', label: 'Analytics' });
      sections.push({ id: 'certs', label: 'Certifications' });
      if (testimonialsConfig) sections.push({ id: 'testimonials', label: 'Testimonials' });
      if (guestbookConfig) sections.push({ id: 'guestbook', label: 'Guestbook' });
    }
  } else {
    // Phase 7 skipped — preserve all existing values
    leetcodeConfig = existing.leetcode || undefined;
    stackoverflowConfig = existing.stackoverflow || undefined;
    hackerrankConfig = existing.hackerrank || undefined;
    enableContributions = existing.contributions?.enabled ?? true;
    guestbookConfig = existing.guestbook || undefined;
    testimonialsConfig = existing.testimonials || undefined;
    certifications = existing.certifications || [];
    socials = existing.socials || [{ platform: 'github', label: 'GitHub' }];
    sections = existing.sections || [
      { id: 'about', label: 'About' },
      { id: 'tech', label: 'Skills' },
      { id: 'journey', label: 'Experience' },
      { id: 'projects', label: 'Projects' },
    ];
  }

  // ════════════════════════════════════════════════════════════════════
  // Phase 8: Generate
  // ════════════════════════════════════════════════════════════════════

  const spinner = ora({ text: 'Generating config files...', color: 'cyan' }).start();

  try {
    // Preserve derived fields when source data is unchanged
    const nameUnchanged = editMode && fullName === existing?.site?.name;
    const titleUnchanged = editMode && title === existing?.site?.title;

    const siteDescription =
      (nameUnchanged && titleUnchanged && existing?.site?.description)
        ? existing.site.description
        : `${fullName} \u2014 ${title} portfolio`;

    const logoText = editMode
      ? (existing?.site?.logoText || username)
      : username;

    const firstName = fullName.split(' ')[0].toUpperCase();
    const welcomeName =
      (nameUnchanged && existing?.boot?.welcomeName)
        ? existing.boot.welcomeName
        : firstName;

    // Assemble full config object
    const configObj = {
      site: {
        name: fullName,
        title,
        description: siteDescription,
        url: siteUrl,
        logoText,
        logoSuffix,
        ...(theme !== 'hacker' ? { theme } : {}),
      },
      hero: {
        greeting,
        typewriterTexts,
      },
      about: {
        codename,
        title,
        experience: experienceSummary,
        location,
        clearance,
        currentOp,
        arsenal,
        missionLog,
        knownAliases,
        currentFocus,
        philosophy,
      },
      techStack,
      experience,
      projects,
      certifications,
      github: {
        username,
        utcOffset,
      },
      ...(leetcodeConfig ? { leetcode: leetcodeConfig } : {}),
      ...(stackoverflowConfig ? { stackoverflow: stackoverflowConfig } : {}),
      ...(hackerrankConfig ? { hackerrank: hackerrankConfig } : {}),
      ...(guestbookConfig ? { guestbook: guestbookConfig } : {}),
      ...(editMode && existing?.chat ? { chat: existing.chat } : {}),
      ...(editMode && existing?.spotify ? { spotify: existing.spotify } : {}),
      contributions: {
        enabled: enableContributions,
        excludeOrgs: editMode ? (existing?.contributions?.excludeOrgs || []) : [],
        minStars: editMode ? (existing?.contributions?.minStars ?? 0) : 0,
        maxItems: editMode ? (existing?.contributions?.maxItems ?? 20) : 20,
      },
      ...(testimonialsConfig ? { testimonials: testimonialsConfig } : {}),
      socials,
      sections,
      boot: {
        welcomeName,
      },
    };

    saveConfig(configObj);
    spinner.succeed(chalk.green('Config files generated!'));
  } catch (err) {
    spinner.fail(chalk.red('Failed to generate config'));
    console.error(err);
    process.exit(1);
  }

  // ── Success panel ──────────────────────────────────────────────────
  const nextSteps = editMode
    ? [
        `${chalk.cyan('1.')} Review ${chalk.bold('src/config/portfolio.config.ts')}`,
        `${chalk.cyan('2.')} Run ${chalk.bold('npm run dev')} to preview locally`,
        `${chalk.cyan('3.')} Push to GitHub — workflows auto-detect your username`,
      ].join('\n')
    : [
        `${chalk.cyan('1.')} Review ${chalk.bold('src/config/portfolio.config.ts')}`,
        `${chalk.cyan('2.')} Update certifications with your real credentials`,
        `${chalk.cyan('3.')} Run ${chalk.bold('npm run dev')} to preview locally`,
        `${chalk.cyan('4.')} Push to GitHub — workflows auto-detect your username`,
      ].join('\n');

  console.log();
  console.log(
    boxen(nextSteps, {
      title: 'Next Steps',
      titleAlignment: 'center',
      padding: 1,
      margin: { top: 0, bottom: 0, left: 2, right: 2 },
      borderStyle: 'round',
      borderColor: 'cyan',
    }),
  );

  p.outro(chalk.green(`Portfolio configured for ${chalk.bold(username)}!`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
