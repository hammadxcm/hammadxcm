#!/usr/bin/env node

/**
 * Hacker Portfolio — TUI Config Editor
 *
 * A menu-driven interface for browsing and editing portfolio.config.ts by section.
 * Uses @clack/prompts, chalk, gradient-string, and boxen (zero new dependencies).
 *
 * Usage:
 *   npm run setup:edit
 *   npm run setup:init -- --tui
 */

import fs from 'node:fs';
import path from 'node:path';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import gradient from 'gradient-string';
import boxen from 'boxen';

import {
  ROOT,
  THEMES,
  isInteractive,
  handleCancel,
  loadExistingConfig,
  serializeToTypeScript,
  saveConfig,
  truncate,
  validateRequired,
  validateUrl,
  validateRequiredUrl,
  validateNumber,
} from './lib/setup-utils.mjs';

// ── Banner ────────────────────────────────────────────────────────────
const BANNER = `  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
  \u2551     Hacker Portfolio Config Editor   \u2551
  \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D`;

// ── Section definitions ───────────────────────────────────────────────
const SECTION_DEFS = [
  {
    key: 'site', label: 'Site', fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'url', label: 'URL', type: 'url', required: true },
      { key: 'logoText', label: 'Logo Text', type: 'text' },
      { key: 'logoSuffix', label: 'Logo Suffix', type: 'text' },
      { key: 'theme', label: 'Theme', type: 'select', options: THEMES },
    ],
  },
  {
    key: 'hero', label: 'Hero', fields: [
      { key: 'greeting', label: 'Greeting', type: 'text' },
      { key: 'typewriterTexts', label: 'Typewriter Texts', type: 'string-array' },
    ],
  },
  {
    key: 'about', label: 'About', fields: [
      { key: 'codename', label: 'Codename', type: 'text' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'experience', label: 'Experience', type: 'text' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'clearance', label: 'Clearance', type: 'text' },
      { key: 'currentOp', label: 'Current Op', type: 'text' },
      { key: 'arsenal', label: 'Arsenal', type: 'kv-array' },
      { key: 'missionLog', label: 'Mission Log', type: 'string-array' },
      { key: 'knownAliases', label: 'Known Aliases', type: 'string-array' },
      { key: 'currentFocus', label: 'Current Focus', type: 'text' },
      { key: 'philosophy', label: 'Philosophy', type: 'string-array' },
    ],
  },
  {
    key: 'techStack', label: 'Tech Stack', type: 'object-array',
    labelFn: (c) => `${c.emoji} ${c.title} (${c.items?.length || 0} items)`,
    itemFields: [
      { key: 'title', label: 'Category Name', type: 'text', required: true },
      { key: 'emoji', label: 'Emoji', type: 'text' },
      { key: 'items', label: 'Tech Items', type: 'tech-items' },
    ],
  },
  {
    key: 'experience', label: 'Experience', type: 'object-array',
    labelFn: (e) => `${e.role} @ ${e.company}`,
    itemFields: [
      { key: 'date', label: 'Date', type: 'text', required: true },
      { key: 'role', label: 'Role', type: 'text', required: true },
      { key: 'company', label: 'Company', type: 'text', required: true },
      { key: 'companyUrl', label: 'Company URL', type: 'url' },
      { key: 'meta', label: 'Meta', type: 'text' },
      { key: 'achievements', label: 'Achievements', type: 'string-array' },
      { key: 'tags', label: 'Tags', type: 'string-array' },
    ],
  },
  {
    key: 'projects', label: 'Projects', type: 'object-array',
    labelFn: (proj) => proj.name,
    itemFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'icon', label: 'Icon URL', type: 'text' },
      { key: 'tags', label: 'Tags', type: 'string-array' },
      { key: 'linkText', label: 'Link Text', type: 'text' },
      { key: 'npmPackage', label: 'npm Package', type: 'text' },
      { key: 'gemName', label: 'Gem Name', type: 'text' },
    ],
  },
  {
    key: 'certifications', label: 'Certifications', type: 'object-array',
    labelFn: (c) => `${c.name} \u2014 ${c.issuer}`,
    itemFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'issuer', label: 'Issuer', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'href', label: 'Certificate URL', type: 'url' },
      { key: 'ariaLabel', label: 'Aria Label', type: 'text' },
      { key: 'date', label: 'Date', type: 'text' },
    ],
  },
  {
    key: 'integrations', label: 'Integrations', virtual: true,
    subKeys: ['github', 'leetcode', 'stackoverflow', 'hackerrank', 'chat', 'spotify', 'contributions', 'guestbook'],
  },
  {
    key: 'testimonials', label: 'Testimonials', type: 'object-array',
    labelFn: (t) => `${t.author} (${t.company})`,
    itemFields: [
      { key: 'quote', label: 'Quote', type: 'text', required: true },
      { key: 'author', label: 'Author', type: 'text', required: true },
      { key: 'role', label: 'Role', type: 'text' },
      { key: 'company', label: 'Company', type: 'text' },
      { key: 'avatar', label: 'Avatar Path', type: 'text' },
    ],
  },
  {
    key: 'socials', label: 'Socials', type: 'object-array',
    labelFn: (s) => `${s.platform}${s.url ? ` \u2014 ${truncate(s.url, 30)}` : ''}`,
    itemFields: [
      { key: 'platform', label: 'Platform', type: 'text', required: true },
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'label', label: 'Label', type: 'text' },
    ],
  },
  {
    key: 'sections', label: 'Sections', type: 'object-array',
    labelFn: (s) => `${s.id}: ${s.label}`,
    itemFields: [
      { key: 'id', label: 'ID', type: 'text', required: true },
      { key: 'label', label: 'Label', type: 'text', required: true },
    ],
  },
  {
    key: 'boot', label: 'Boot', fields: [
      { key: 'welcomeName', label: 'Welcome Name', type: 'text' },
    ],
  },
];

// ── Integration field defs ────────────────────────────────────────────
const INTEGRATION_DEFS = {
  github: {
    label: 'GitHub',
    required: true,
    fields: [
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'utcOffset', label: 'UTC Offset', type: 'number' },
    ],
  },
  leetcode: {
    label: 'LeetCode',
    fields: [
      { key: 'username', label: 'Username', type: 'text', required: true },
    ],
  },
  stackoverflow: {
    label: 'StackOverflow',
    fields: [
      { key: 'userId', label: 'User ID', type: 'number', required: true },
    ],
  },
  hackerrank: {
    label: 'HackerRank',
    fields: [
      { key: 'username', label: 'Username', type: 'text', required: true },
    ],
  },
  chat: {
    label: 'Chat',
    fields: [
      { key: 'enabled', label: 'Enabled', type: 'boolean' },
      { key: 'apiUrl', label: 'API URL', type: 'url' },
    ],
  },
  spotify: {
    label: 'Spotify',
    fields: [
      { key: 'enabled', label: 'Enabled', type: 'boolean' },
    ],
  },
  contributions: {
    label: 'Contributions',
    required: true,
    fields: [
      { key: 'enabled', label: 'Enabled', type: 'boolean' },
      { key: 'minStars', label: 'Min Stars', type: 'number' },
      { key: 'maxItems', label: 'Max Items', type: 'number' },
    ],
  },
  guestbook: {
    label: 'Guestbook',
    fields: [
      { key: 'giscus.repo', label: 'Giscus Repo', type: 'text' },
      { key: 'giscus.repoId', label: 'Giscus Repo ID', type: 'text' },
      { key: 'giscus.category', label: 'Giscus Category', type: 'text' },
      { key: 'giscus.categoryId', label: 'Giscus Category ID', type: 'text' },
      { key: 'statsApi', label: 'Stats API URL', type: 'url' },
    ],
  },
};

// ── Deep get/set for dotted keys ──────────────────────────────────────
function deepGet(obj, dottedKey) {
  const parts = dottedKey.split('.');
  let cur = obj;
  for (const part of parts) {
    if (cur == null) return undefined;
    cur = cur[part];
  }
  return cur;
}

function deepSet(obj, dottedKey, value) {
  const parts = dottedKey.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] == null) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

// ── Dashboard renderer ────────────────────────────────────────────────
function renderDashboard(config) {
  console.clear();
  console.log(gradient.pastel.multiline(BANNER));
  console.log();

  const maxWidth = Math.min(process.stdout.columns || 80, 80);
  const summaryWidth = maxWidth - 22;

  const lines = SECTION_DEFS.map((s) => {
    const val = s.virtual
      ? null
      : config[s.key];
    let summary;
    if (s.virtual) {
      const active = s.subKeys.filter((k) => config[k]);
      summary = active.length > 0 ? active.join(', ') : '(none enabled)';
    } else if (Array.isArray(val)) {
      summary = `${val.length} items`;
    } else if (typeof val === 'object' && val !== null) {
      const entries = Object.entries(val).slice(0, 2);
      summary = entries.map(([k, v]) => `${k}=${truncate(String(v), 18)}`).join(', ');
    } else {
      summary = String(val ?? '(not set)');
    }
    return `  ${chalk.cyan(s.label.padEnd(18))} ${chalk.dim(truncate(summary, summaryWidth))}`;
  });

  p.note(lines.join('\n'), 'Current Configuration');
}

// ── Field editor (single field) ───────────────────────────────────────
async function editField(field, currentValue) {
  switch (field.type) {
    case 'text': {
      const val = handleCancel(await p.text({
        message: field.label,
        defaultValue: currentValue != null ? String(currentValue) : '',
        validate: field.required ? validateRequired(field.label) : undefined,
      }));
      return val?.trim() || currentValue || '';
    }
    case 'url': {
      const val = handleCancel(await p.text({
        message: field.label,
        defaultValue: currentValue || '',
        validate: field.required ? validateRequiredUrl : validateUrl,
      }));
      return val?.trim() || currentValue || '';
    }
    case 'number': {
      const val = handleCancel(await p.text({
        message: field.label,
        defaultValue: currentValue != null ? String(currentValue) : '0',
        validate: validateNumber,
      }));
      return Number(val) || 0;
    }
    case 'boolean': {
      return handleCancel(await p.confirm({
        message: field.label,
        initialValue: currentValue ?? false,
      }));
    }
    case 'select': {
      return handleCancel(await p.select({
        message: field.label,
        options: field.options,
        initialValue: currentValue || field.options[0]?.value,
      }));
    }
    default:
      return currentValue;
  }
}

// ── String array editor ───────────────────────────────────────────────
async function editStringArray(label, arr) {
  const items = [...(arr || [])];

  while (true) {
    console.clear();
    p.note(
      items.map((item, i) => `  ${chalk.dim(`${i + 1}.`)} ${truncate(item, 60)}`).join('\n') || chalk.dim('  (empty)'),
      `Editing: ${label}`,
    );

    const choices = [
      ...items.map((item, i) => ({
        value: `edit:${i}`,
        label: `Edit #${i + 1}: ${truncate(item, 40)}`,
      })),
      { value: 'add', label: chalk.green('+ Add new item') },
      ...(items.length > 0
        ? [{ value: 'delete', label: chalk.red('- Delete an item') }]
        : []),
      { value: 'back', label: chalk.yellow('\u2190 Back') },
    ];

    const action = handleCancel(await p.select({
      message: 'Action',
      options: choices,
    }));

    if (action === 'back') return items;

    if (action === 'add') {
      const val = handleCancel(await p.text({
        message: `New ${label} entry`,
        validate: validateRequired('Entry'),
      }));
      if (val?.trim()) items.push(val.trim());
      continue;
    }

    if (action === 'delete') {
      const idx = handleCancel(await p.select({
        message: 'Delete which item?',
        options: items.map((item, i) => ({
          value: i,
          label: `#${i + 1}: ${truncate(item, 50)}`,
        })),
      }));
      items.splice(idx, 1);
      continue;
    }

    if (typeof action === 'string' && action.startsWith('edit:')) {
      const idx = Number(action.split(':')[1]);
      const val = handleCancel(await p.text({
        message: `Edit item #${idx + 1}`,
        defaultValue: items[idx],
      }));
      if (val?.trim()) items[idx] = val.trim();
    }
  }
}

// ── Key-value array editor ────────────────────────────────────────────
async function editKvArray(label, arr) {
  const items = [...(arr || [])].map((i) => ({ ...i }));

  while (true) {
    console.clear();
    p.note(
      items.map((item, i) => `  ${chalk.dim(`${i + 1}.`)} ${chalk.cyan(item.key)} = ${truncate(item.value, 40)}`).join('\n') || chalk.dim('  (empty)'),
      `Editing: ${label}`,
    );

    const choices = [
      ...items.map((item, i) => ({
        value: `edit:${i}`,
        label: `Edit #${i + 1}: ${item.key}`,
      })),
      { value: 'add', label: chalk.green('+ Add new entry') },
      ...(items.length > 0
        ? [{ value: 'delete', label: chalk.red('- Delete an entry') }]
        : []),
      { value: 'back', label: chalk.yellow('\u2190 Back') },
    ];

    const action = handleCancel(await p.select({
      message: 'Action',
      options: choices,
    }));

    if (action === 'back') return items;

    if (action === 'add') {
      const key = handleCancel(await p.text({
        message: 'Key (e.g. frontend, backend)',
        validate: validateRequired('Key'),
      }));
      const value = handleCancel(await p.text({
        message: 'Value (pipe-separated techs)',
        validate: validateRequired('Value'),
      }));
      if (key?.trim() && value?.trim()) items.push({ key: key.trim(), value: value.trim() });
      continue;
    }

    if (action === 'delete') {
      const idx = handleCancel(await p.select({
        message: 'Delete which entry?',
        options: items.map((item, i) => ({
          value: i,
          label: `#${i + 1}: ${item.key}`,
        })),
      }));
      items.splice(idx, 1);
      continue;
    }

    if (typeof action === 'string' && action.startsWith('edit:')) {
      const idx = Number(action.split(':')[1]);
      const key = handleCancel(await p.text({
        message: 'Key',
        defaultValue: items[idx].key,
        validate: validateRequired('Key'),
      }));
      const value = handleCancel(await p.text({
        message: 'Value',
        defaultValue: items[idx].value,
        validate: validateRequired('Value'),
      }));
      if (key?.trim()) items[idx].key = key.trim();
      if (value?.trim()) items[idx].value = value.trim();
    }
  }
}

// ── Tech items editor (for techStack categories) ──────────────────────
async function editTechItems(items) {
  const list = [...(items || [])].map((i) => ({ ...i }));

  while (true) {
    console.clear();
    p.note(
      list.map((item, i) => `  ${chalk.dim(`${i + 1}.`)} ${item.name}`).join('\n') || chalk.dim('  (empty)'),
      'Tech Items',
    );

    const choices = [
      ...list.map((item, i) => ({
        value: `edit:${i}`,
        label: `Edit: ${item.name}`,
      })),
      { value: 'add', label: chalk.green('+ Add new tech') },
      ...(list.length > 0
        ? [{ value: 'delete', label: chalk.red('- Delete a tech') }]
        : []),
      { value: 'back', label: chalk.yellow('\u2190 Back') },
    ];

    const action = handleCancel(await p.select({
      message: 'Action',
      options: choices,
    }));

    if (action === 'back') return list;

    if (action === 'add') {
      const name = handleCancel(await p.text({
        message: 'Tech name',
        validate: validateRequired('Name'),
      }));
      const icon = handleCancel(await p.text({
        message: 'Icon URL',
        defaultValue: '',
      }));
      const url = handleCancel(await p.text({
        message: 'Tech URL',
        defaultValue: '',
        validate: validateUrl,
      }));
      if (name?.trim()) {
        list.push({
          name: name.trim(),
          icon: icon?.trim() || '',
          url: url?.trim() || '',
        });
      }
      continue;
    }

    if (action === 'delete') {
      const idx = handleCancel(await p.select({
        message: 'Delete which tech?',
        options: list.map((item, i) => ({
          value: i,
          label: `#${i + 1}: ${item.name}`,
        })),
      }));
      list.splice(idx, 1);
      continue;
    }

    if (typeof action === 'string' && action.startsWith('edit:')) {
      const idx = Number(action.split(':')[1]);
      const item = list[idx];
      const name = handleCancel(await p.text({
        message: 'Tech name',
        defaultValue: item.name,
        validate: validateRequired('Name'),
      }));
      const icon = handleCancel(await p.text({
        message: 'Icon URL',
        defaultValue: item.icon || '',
      }));
      const url = handleCancel(await p.text({
        message: 'Tech URL',
        defaultValue: item.url || '',
        validate: validateUrl,
      }));
      if (name?.trim()) item.name = name.trim();
      if (icon != null) item.icon = icon.trim();
      if (url != null) item.url = url.trim();
    }
  }
}

// ── Object array editor ───────────────────────────────────────────────
async function editObjectArray(sectionDef, arr) {
  const items = [...(arr || [])].map((i) => ({ ...i }));
  const labelFn = sectionDef.labelFn || ((i) => JSON.stringify(i).slice(0, 40));

  while (true) {
    console.clear();
    p.note(
      items.map((item, i) => `  ${chalk.dim(`${i + 1}.`)} ${truncate(labelFn(item), 55)}`).join('\n') || chalk.dim('  (empty)'),
      `Editing: ${sectionDef.label} (${items.length} items)`,
    );

    const choices = [
      ...items.map((item, i) => ({
        value: `edit:${i}`,
        label: `Edit: ${truncate(labelFn(item), 45)}`,
      })),
      { value: 'add', label: chalk.green('+ Add new item') },
      ...(items.length > 0
        ? [{ value: 'delete', label: chalk.red('- Delete an item') }]
        : []),
      { value: 'back', label: chalk.yellow('\u2190 Back') },
    ];

    const action = handleCancel(await p.select({
      message: 'Action',
      options: choices,
    }));

    if (action === 'back') return items;

    if (action === 'add') {
      const newItem = {};
      for (const field of sectionDef.itemFields) {
        if (field.type === 'string-array') {
          newItem[field.key] = await editStringArray(field.label, []);
        } else if (field.type === 'kv-array') {
          newItem[field.key] = await editKvArray(field.label, []);
        } else if (field.type === 'tech-items') {
          newItem[field.key] = await editTechItems([]);
        } else {
          newItem[field.key] = await editField(field, '');
        }
      }
      items.push(newItem);
      continue;
    }

    if (action === 'delete') {
      const idx = handleCancel(await p.select({
        message: 'Delete which item?',
        options: items.map((item, i) => ({
          value: i,
          label: `#${i + 1}: ${truncate(labelFn(item), 50)}`,
        })),
      }));
      items.splice(idx, 1);
      continue;
    }

    if (typeof action === 'string' && action.startsWith('edit:')) {
      const idx = Number(action.split(':')[1]);
      const item = items[idx];
      await editObjectItem(sectionDef, item);
    }
  }
}

// ── Edit a single object item's fields ────────────────────────────────
async function editObjectItem(sectionDef, item) {
  const fields = sectionDef.itemFields;
  if (!fields) return;

  while (true) {
    console.clear();
    const labelFn = sectionDef.labelFn || (() => 'Item');
    p.note(
      fields.map((f) => {
        const val = item[f.key];
        const display = Array.isArray(val)
          ? `[${val.length} items]`
          : truncate(String(val ?? '(not set)'), 40);
        return `  ${chalk.cyan(f.label.padEnd(18))} ${chalk.dim(display)}`;
      }).join('\n'),
      `Editing: ${truncate(labelFn(item), 40)}`,
    );

    const choices = [
      ...fields.map((f) => ({
        value: f.key,
        label: `${f.label}: ${truncate(String(item[f.key] ?? '(not set)'), 35)}`,
      })),
      { value: 'back', label: chalk.yellow('\u2190 Back') },
    ];

    const fieldKey = handleCancel(await p.select({
      message: 'Edit field',
      options: choices,
    }));

    if (fieldKey === 'back') return;

    const field = fields.find((f) => f.key === fieldKey);
    if (!field) continue;

    if (field.type === 'string-array') {
      item[field.key] = await editStringArray(field.label, item[field.key]);
    } else if (field.type === 'kv-array') {
      item[field.key] = await editKvArray(field.label, item[field.key]);
    } else if (field.type === 'tech-items') {
      item[field.key] = await editTechItems(item[field.key]);
    } else {
      item[field.key] = await editField(field, item[field.key]);
    }
  }
}

// ── Scalar section editor ─────────────────────────────────────────────
async function editScalarSection(sectionDef, config) {
  const sectionData = config[sectionDef.key] || {};

  while (true) {
    console.clear();
    p.note(
      sectionDef.fields.map((f) => {
        const val = sectionData[f.key];
        const display = Array.isArray(val)
          ? `[${val.length} items]`
          : truncate(String(val ?? '(not set)'), 40);
        return `  ${chalk.cyan(f.label.padEnd(18))} ${chalk.dim(display)}`;
      }).join('\n'),
      `Editing: ${sectionDef.label}`,
    );

    const choices = [
      ...sectionDef.fields.map((f) => {
        const val = sectionData[f.key];
        const display = Array.isArray(val)
          ? `[${val.length} items]`
          : truncate(String(val ?? '(not set)'), 35);
        return { value: f.key, label: `${f.label}: ${display}` };
      }),
      { value: 'back', label: chalk.yellow('\u2190 Back') },
    ];

    const fieldKey = handleCancel(await p.select({
      message: 'Edit field',
      options: choices,
    }));

    if (fieldKey === 'back') break;

    const field = sectionDef.fields.find((f) => f.key === fieldKey);
    if (!field) continue;

    if (field.type === 'string-array') {
      sectionData[field.key] = await editStringArray(field.label, sectionData[field.key]);
    } else if (field.type === 'kv-array') {
      sectionData[field.key] = await editKvArray(field.label, sectionData[field.key]);
    } else {
      sectionData[field.key] = await editField(field, sectionData[field.key]);
    }
  }

  config[sectionDef.key] = sectionData;
}

// ── Integrations sub-menu ─────────────────────────────────────────────
async function editIntegrations(config) {
  const integrationKeys = ['github', 'leetcode', 'stackoverflow', 'hackerrank', 'chat', 'spotify', 'contributions', 'guestbook'];

  while (true) {
    console.clear();
    const lines = integrationKeys.map((key) => {
      const def = INTEGRATION_DEFS[key];
      const enabled = config[key] != null;
      const status = enabled ? chalk.green('enabled') : chalk.dim('disabled');
      let detail = '';
      if (enabled && config[key]) {
        const entries = Object.entries(config[key])
          .filter(([, v]) => typeof v !== 'object')
          .slice(0, 2);
        detail = entries.map(([k, v]) => `${k}=${truncate(String(v), 15)}`).join(', ');
      }
      return `  ${chalk.cyan(def.label.padEnd(18))} ${status}${detail ? ` (${detail})` : ''}`;
    });

    p.note(lines.join('\n'), 'Integrations');

    const choices = [
      ...integrationKeys.map((key) => {
        const def = INTEGRATION_DEFS[key];
        const enabled = config[key] != null;
        return {
          value: key,
          label: `${def.label} ${enabled ? chalk.green('[ON]') : chalk.dim('[OFF]')}`,
        };
      }),
      { value: 'back', label: chalk.yellow('\u2190 Back') },
    ];

    const selected = handleCancel(await p.select({
      message: 'Select integration',
      options: choices,
    }));

    if (selected === 'back') return;

    const def = INTEGRATION_DEFS[selected];
    const enabled = config[selected] != null;

    // Toggle or edit
    if (!def.required && !enabled) {
      const enable = handleCancel(await p.confirm({
        message: `Enable ${def.label}?`,
        initialValue: false,
      }));
      if (!enable) continue;
      // Create default
      config[selected] = {};
    }

    if (!def.required && enabled) {
      const action = handleCancel(await p.select({
        message: `${def.label}`,
        options: [
          { value: 'edit', label: 'Edit fields' },
          { value: 'disable', label: chalk.red('Disable') },
          { value: 'back', label: chalk.yellow('\u2190 Back') },
        ],
      }));
      if (action === 'back') continue;
      if (action === 'disable') {
        delete config[selected];
        continue;
      }
    }

    // Edit fields
    if (!config[selected]) config[selected] = {};
    const data = config[selected];

    while (true) {
      console.clear();
      p.note(
        def.fields.map((f) => {
          const val = deepGet(data, f.key);
          return `  ${chalk.cyan(f.label.padEnd(18))} ${chalk.dim(truncate(String(val ?? '(not set)'), 35))}`;
        }).join('\n'),
        `Editing: ${def.label}`,
      );

      const fieldChoices = [
        ...def.fields.map((f) => ({
          value: f.key,
          label: `${f.label}: ${truncate(String(deepGet(data, f.key) ?? '(not set)'), 30)}`,
        })),
        { value: 'back', label: chalk.yellow('\u2190 Back') },
      ];

      const fieldKey = handleCancel(await p.select({
        message: 'Edit field',
        options: fieldChoices,
      }));

      if (fieldKey === 'back') break;

      const field = def.fields.find((f) => f.key === fieldKey);
      if (!field) continue;

      const currentVal = deepGet(data, field.key);
      const newVal = await editField(field, currentVal);
      deepSet(data, field.key, newVal);
    }
  }
}

// ── Main TUI loop ─────────────────────────────────────────────────────
async function tuiMain() {
  if (!isInteractive) {
    console.error(chalk.red('TUI editor requires an interactive terminal.'));
    process.exit(1);
  }

  const configDest = path.join(ROOT, 'src/config/portfolio.config.ts');
  const existing = loadExistingConfig(configDest);

  if (!existing) {
    console.error(chalk.red('No existing config found. Run `npm run setup:init` first.'));
    process.exit(1);
  }

  // Deep clone the config for editing
  const config = JSON.parse(JSON.stringify(existing));
  const originalJson = JSON.stringify(existing);
  let dirty = false;

  while (true) {
    renderDashboard(config);

    const choices = [
      ...SECTION_DEFS.map((s) => ({ value: s.key, label: s.label })),
      { value: 'save', label: chalk.green('Save & Exit') },
      { value: 'discard', label: chalk.red('Discard & Exit') },
    ];

    const selected = handleCancel(await p.select({
      message: 'Select section to edit',
      options: choices,
    }));

    if (selected === 'save') {
      try {
        // Preserve unknown top-level keys
        const knownKeys = new Set(SECTION_DEFS.map((s) => s.key).filter((k) => k !== 'integrations'));
        const integrationSubKeys = new Set(SECTION_DEFS.find((s) => s.key === 'integrations')?.subKeys || []);
        for (const k of integrationSubKeys) knownKeys.add(k);

        const finalConfig = {};
        // Copy unknown keys from original
        for (const key of Object.keys(existing)) {
          if (!knownKeys.has(key)) finalConfig[key] = existing[key];
        }
        // Copy known keys from edited config
        for (const key of knownKeys) {
          if (config[key] !== undefined) finalConfig[key] = config[key];
        }

        saveConfig(finalConfig);

        console.clear();
        console.log();
        console.log(
          boxen(
            [
              `${chalk.green('Config saved successfully!')}`,
              '',
              `${chalk.cyan('1.')} Review ${chalk.bold('src/config/portfolio.config.ts')}`,
              `${chalk.cyan('2.')} Run ${chalk.bold('npm run dev')} to preview locally`,
            ].join('\n'),
            {
              title: 'Saved',
              titleAlignment: 'center',
              padding: 1,
              margin: { top: 0, bottom: 0, left: 2, right: 2 },
              borderStyle: 'round',
              borderColor: 'green',
            },
          ),
        );
        console.log();
        process.exit(0);
      } catch (err) {
        p.log.error(chalk.red(`Failed to save: ${err.message}`));
      }
      continue;
    }

    if (selected === 'discard') {
      const currentJson = JSON.stringify(config);
      if (currentJson !== originalJson) {
        const confirmDiscard = handleCancel(await p.confirm({
          message: 'You have unsaved changes. Discard them?',
          initialValue: false,
        }));
        if (!confirmDiscard) continue;
      }
      console.clear();
      p.outro(chalk.yellow('Changes discarded.'));
      process.exit(0);
    }

    // Edit section
    const sectionDef = SECTION_DEFS.find((s) => s.key === selected);
    if (!sectionDef) continue;

    if (sectionDef.virtual) {
      // Integrations sub-menu
      await editIntegrations(config);
    } else if (sectionDef.type === 'object-array') {
      config[sectionDef.key] = await editObjectArray(sectionDef, config[sectionDef.key]);
    } else if (sectionDef.fields) {
      await editScalarSection(sectionDef, config);
    }
  }
}

tuiMain().catch((err) => {
  console.error(err);
  process.exit(1);
});
