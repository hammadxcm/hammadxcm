import type { LangKey, LangVariant } from '../scripts/types';
import type { PortfolioConfig } from './types';

type About = PortfolioConfig['about'];

// ── Shared types ──

interface Line {
  d: string;
  c: string;
}

interface LanguageSyntax {
  key: LangKey;
  label: string;
  extension: string;
  commentPrefix: string;
  printTemplate: { display: string; copy: string };
  build(about: About, e: (s: string) => string): Line[];
}

// ── Shared helpers ──

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Standard 4-line comment header: separator, __COMMENT__, separator, blank */
function commentHeader(
  prefix: string,
  separator = '═══════════════════════════════════════',
): Line[] {
  const sep = `${prefix} ${separator}`;
  return [
    { d: `<span class="comment">${sep}</span>`, c: sep },
    { d: `<span class="comment">${prefix} __COMMENT__</span>`, c: `${prefix} __COMMENT__` },
    { d: `<span class="comment">${sep}</span>`, c: sep },
    { d: '', c: '' },
  ];
}

/** Shorthand for about data extraction used by every language builder */
function extract(about: About) {
  const vars: [string, string][] = [
    ['codename', about.codename],
    ['title', about.title],
    ['experience', about.experience],
    ['location', about.location],
    ['clearance', about.clearance],
    ['current_op', about.currentOp],
  ];
  return {
    vars,
    arsenal: about.arsenal,
    missionLog: about.missionLog,
    aliases: about.knownAliases,
    focus: about.currentFocus,
    philosophy: about.philosophy.join(' '),
  };
}

function toBin(s: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < s.length; i++) {
    chunks.push(s.charCodeAt(i).toString(2).padStart(8, '0'));
  }
  const lines: string[] = [];
  for (let i = 0; i < chunks.length; i += 4) {
    lines.push(chunks.slice(i, i + 4).join(' '));
  }
  return lines;
}

/** Convert Line[] + LanguageSyntax into a LangVariant */
function buildVariant(syntax: LanguageSyntax, lines: Line[]): LangVariant {
  const displayLines = lines.map((l) => l.d);
  const copyLines = lines.map((l) => l.c);
  return {
    displayLines,
    copyLines,
    extension: syntax.extension,
    langLabel: syntax.label,
    commentLineIndex: copyLines.indexOf(copyLines.find((l) => l.includes('__COMMENT__'))!),
    echoLineIndex: copyLines.indexOf(copyLines.find((l) => l.includes('__MSG__'))!),
    commentPrefix: syntax.commentPrefix,
    printTemplate: syntax.printTemplate,
  };
}

// ── buildAboutLines (bash default — kept as-is) ──

export function buildAboutLines(about: About): { displayLines: string[]; copyLines: string[] } {
  const displayLines: string[] = [];
  const copyLines: string[] = [];

  // Header
  displayLines.push('<span class="keyword">#!/bin/bash</span>');
  copyLines.push('#!/bin/bash');

  displayLines.push('<span class="comment"># ═══════════════════════════════════════</span>');
  copyLines.push('# ═══════════════════════════════════════');

  displayLines.push('<span class="comment"># CLASSIFIED — SECURITY CLEARANCE: ROOT</span>');
  copyLines.push('# CLASSIFIED — SECURITY CLEARANCE: ROOT');

  displayLines.push('<span class="comment"># ═══════════════════════════════════════</span>');
  copyLines.push('# ═══════════════════════════════════════');

  displayLines.push('');
  copyLines.push('');

  // Variables
  const vars: [string, string][] = [
    ['CODENAME', about.codename],
    ['TITLE', about.title],
    ['EXPERIENCE', about.experience],
    ['LOCATION', about.location],
    ['CLEARANCE', about.clearance],
    ['CURRENT_OP', about.currentOp],
  ];
  for (const [key, value] of vars) {
    displayLines.push(
      `<span class="const">${key}</span>=<span class="string">"${escapeHtml(value)}"</span>`,
    );
    copyLines.push(`${key}="${value}"`);
  }

  displayLines.push('');
  copyLines.push('');

  // Arsenal
  displayLines.push(
    '<span class="keyword">declare</span> -A <span class="const">ARSENAL</span>=<span class="bracket">(</span>',
  );
  copyLines.push('declare -A ARSENAL=(');

  for (const entry of about.arsenal) {
    displayLines.push(
      `  <span class="bracket">[</span><span class="property">${escapeHtml(entry.key)}</span><span class="bracket">]</span>=<span class="string">"${escapeHtml(entry.value)}"</span>`,
    );
    copyLines.push(`  [${entry.key}]="${entry.value}"`);
  }

  displayLines.push('<span class="bracket">)</span>');
  copyLines.push(')');

  displayLines.push('');
  copyLines.push('');

  // Mission Log
  displayLines.push('<span class="const">MISSION_LOG</span>=<span class="bracket">(</span>');
  copyLines.push('MISSION_LOG=(');

  for (const entry of about.missionLog) {
    displayLines.push(`  <span class="string">"${escapeHtml(entry)}"</span>`);
    copyLines.push(`  "${entry}"`);
  }

  displayLines.push('<span class="bracket">)</span>');
  copyLines.push(')');

  displayLines.push('');
  copyLines.push('');

  // Known Aliases
  const aliasesDisplay = about.knownAliases
    .map((a) => `<span class="string">"${escapeHtml(a)}"</span>`)
    .join(' ');
  displayLines.push(
    `<span class="const">KNOWN_ALIASES</span>=<span class="bracket">(</span>${aliasesDisplay}<span class="bracket">)</span>`,
  );
  copyLines.push(`KNOWN_ALIASES=(${about.knownAliases.map((a) => `"${a}"`).join(' ')})`);

  // Current Focus
  displayLines.push(
    `<span class="const">CURRENT_FOCUS</span>=<span class="string">"${escapeHtml(about.currentFocus)}"</span>`,
  );
  copyLines.push(`CURRENT_FOCUS="${about.currentFocus}"`);

  // Philosophy (single or multi-line)
  if (about.philosophy.length === 1) {
    displayLines.push(
      `<span class="const">PHILOSOPHY</span>=<span class="string">"${escapeHtml(about.philosophy[0])}"</span>`,
    );
    copyLines.push(`PHILOSOPHY="${about.philosophy[0]}"`);
  } else {
    displayLines.push(
      `<span class="const">PHILOSOPHY</span>=<span class="string">"${escapeHtml(about.philosophy[0])}</span>`,
    );
    copyLines.push(`PHILOSOPHY="${about.philosophy[0]}`);
    for (let i = 1; i < about.philosophy.length; i++) {
      const isLast = i === about.philosophy.length - 1;
      const suffix = isLast ? '"' : '';
      displayLines.push(
        `<span class="string">            ${escapeHtml(about.philosophy[i])}${suffix}</span>`,
      );
      copyLines.push(`            ${about.philosophy[i]}${suffix}`);
    }
  }

  displayLines.push('');
  copyLines.push('');

  // Echo
  displayLines.push(
    '<span class="keyword">echo</span> <span class="string">"[STATUS] Dossier loaded. Target identified."</span>',
  );
  copyLines.push('echo "[STATUS] Dossier loaded. Target identified."');

  return { displayLines, copyLines };
}

// ── Language syntax definitions ──

const languages: LanguageSyntax[] = [
  // ── Python ──
  {
    key: 'python',
    label: 'Python',
    extension: 'py',
    commentPrefix: '#',
    printTemplate: {
      display: '<span class="keyword">print</span>(<span class="string">"__MSG__"</span>)',
      copy: 'print("__MSG__")',
    },
    build(about, e) {
      const { vars, arsenal, missionLog, aliases, focus, philosophy } = extract(about);
      const L: Line[] = [];
      L.push({
        d: '<span class="keyword">#!/usr/bin/env python3</span>',
        c: '#!/usr/bin/env python3',
      });
      L.push(...commentHeader('#'));

      L.push({
        d: '<span class="const">profile</span> = <span class="bracket">{</span>',
        c: 'profile = {',
      });
      for (const [key, value] of vars) {
        L.push({
          d: `    <span class="string">"${e(key)}"</span>: <span class="string">"${e(value)}"</span>,`,
          c: `    "${key}": "${value}",`,
        });
      }
      L.push({
        d: `    <span class="string">"arsenal"</span>: <span class="bracket">{</span>`,
        c: '    "arsenal": {',
      });
      for (const entry of arsenal) {
        L.push({
          d: `        <span class="string">"${e(entry.key)}"</span>: <span class="string">"${e(entry.value)}"</span>,`,
          c: `        "${entry.key}": "${entry.value}",`,
        });
      }
      L.push({ d: '    <span class="bracket">}</span>,', c: '    },' });

      L.push({
        d: `    <span class="string">"mission_log"</span>: <span class="bracket">[</span>`,
        c: '    "mission_log": [',
      });
      for (const entry of missionLog) {
        L.push({
          d: `        <span class="string">"${e(entry)}"</span>,`,
          c: `        "${entry}",`,
        });
      }
      L.push({ d: '    <span class="bracket">]</span>,', c: '    ],' });

      const aD = aliases.map((a) => `<span class="string">"${e(a)}"</span>`).join(', ');
      const aC = aliases.map((a) => `"${a}"`).join(', ');
      L.push({
        d: `    <span class="string">"aliases"</span>: <span class="bracket">[</span>${aD}<span class="bracket">]</span>,`,
        c: `    "aliases": [${aC}],`,
      });
      L.push({
        d: `    <span class="string">"focus"</span>: <span class="string">"${e(focus)}"</span>,`,
        c: `    "focus": "${focus}",`,
      });
      L.push({
        d: `    <span class="string">"philosophy"</span>: <span class="string">"${e(philosophy)}"</span>,`,
        c: `    "philosophy": "${philosophy}",`,
      });

      L.push({ d: '<span class="bracket">}</span>', c: '}' });
      L.push({ d: '', c: '' });
      L.push({
        d: '<span class="keyword">print</span>(<span class="string">"__MSG__"</span>)',
        c: 'print("__MSG__")',
      });
      return L;
    },
  },

  // ── Ruby ──
  {
    key: 'ruby',
    label: 'Ruby',
    extension: 'rb',
    commentPrefix: '#',
    printTemplate: {
      display: '<span class="keyword">puts</span> <span class="string">"__MSG__"</span>',
      copy: 'puts "__MSG__"',
    },
    build(about, e) {
      const { vars, arsenal, missionLog, aliases, focus, philosophy } = extract(about);
      const L: Line[] = [];
      L.push({ d: '<span class="keyword">#!/usr/bin/env ruby</span>', c: '#!/usr/bin/env ruby' });
      L.push(...commentHeader('#'));

      L.push({
        d: '<span class="const">profile</span> = <span class="bracket">{</span>',
        c: 'profile = {',
      });
      for (const [key, value] of vars) {
        L.push({
          d: `  <span class="property">${e(key)}</span>: <span class="string">"${e(value)}"</span>,`,
          c: `  ${key}: "${value}",`,
        });
      }
      L.push({
        d: `  <span class="property">arsenal</span>: <span class="bracket">{</span>`,
        c: '  arsenal: {',
      });
      for (const entry of arsenal) {
        L.push({
          d: `    <span class="property">${e(entry.key)}</span>: <span class="string">"${e(entry.value)}"</span>,`,
          c: `    ${entry.key}: "${entry.value}",`,
        });
      }
      L.push({ d: '  <span class="bracket">}</span>,', c: '  },' });

      L.push({
        d: `  <span class="property">mission_log</span>: <span class="bracket">[</span>`,
        c: '  mission_log: [',
      });
      for (const entry of missionLog) {
        L.push({ d: `    <span class="string">"${e(entry)}"</span>,`, c: `    "${entry}",` });
      }
      L.push({ d: '  <span class="bracket">]</span>,', c: '  ],' });

      const aD = aliases.map((a) => `<span class="string">"${e(a)}"</span>`).join(', ');
      const aC = aliases.map((a) => `"${a}"`).join(', ');
      L.push({
        d: `  <span class="property">aliases</span>: <span class="bracket">[</span>${aD}<span class="bracket">]</span>,`,
        c: `  aliases: [${aC}],`,
      });
      L.push({
        d: `  <span class="property">focus</span>: <span class="string">"${e(focus)}"</span>,`,
        c: `  focus: "${focus}",`,
      });
      L.push({
        d: `  <span class="property">philosophy</span>: <span class="string">"${e(philosophy)}"</span>,`,
        c: `  philosophy: "${philosophy}",`,
      });

      L.push({ d: '<span class="bracket">}</span>', c: '}' });
      L.push({ d: '', c: '' });
      L.push({
        d: '<span class="keyword">puts</span> <span class="string">"__MSG__"</span>',
        c: 'puts "__MSG__"',
      });
      return L;
    },
  },

  // ── JavaScript ──
  {
    key: 'javascript',
    label: 'JavaScript',
    extension: 'js',
    commentPrefix: '//',
    printTemplate: {
      display:
        '<span class="property">console</span>.<span class="keyword">log</span>(<span class="string">"__MSG__"</span>);',
      copy: 'console.log("__MSG__");',
    },
    build(about, e) {
      const { vars, arsenal, missionLog, aliases, focus, philosophy } = extract(about);
      const L: Line[] = [];
      L.push(...commentHeader('//'));

      L.push({
        d: '<span class="keyword">const</span> <span class="const">profile</span> = <span class="bracket">{</span>',
        c: 'const profile = {',
      });
      for (const [key, value] of vars) {
        L.push({
          d: `  <span class="property">${e(key)}</span>: <span class="string">"${e(value)}"</span>,`,
          c: `  ${key}: "${value}",`,
        });
      }
      L.push({
        d: `  <span class="property">arsenal</span>: <span class="bracket">{</span>`,
        c: '  arsenal: {',
      });
      for (const entry of arsenal) {
        L.push({
          d: `    <span class="property">${e(entry.key)}</span>: <span class="string">"${e(entry.value)}"</span>,`,
          c: `    ${entry.key}: "${entry.value}",`,
        });
      }
      L.push({ d: '  <span class="bracket">}</span>,', c: '  },' });

      L.push({
        d: `  <span class="property">missionLog</span>: <span class="bracket">[</span>`,
        c: '  missionLog: [',
      });
      for (const entry of missionLog) {
        L.push({ d: `    <span class="string">"${e(entry)}"</span>,`, c: `    "${entry}",` });
      }
      L.push({ d: '  <span class="bracket">]</span>,', c: '  ],' });

      const aD = aliases.map((a) => `<span class="string">"${e(a)}"</span>`).join(', ');
      const aC = aliases.map((a) => `"${a}"`).join(', ');
      L.push({
        d: `  <span class="property">aliases</span>: <span class="bracket">[</span>${aD}<span class="bracket">]</span>,`,
        c: `  aliases: [${aC}],`,
      });
      L.push({
        d: `  <span class="property">focus</span>: <span class="string">"${e(focus)}"</span>,`,
        c: `  focus: "${focus}",`,
      });
      L.push({
        d: `  <span class="property">philosophy</span>: <span class="string">"${e(philosophy)}"</span>,`,
        c: `  philosophy: "${philosophy}",`,
      });

      L.push({ d: '<span class="bracket">}</span>;', c: '};' });
      L.push({ d: '', c: '' });
      L.push({
        d: '<span class="property">console</span>.<span class="keyword">log</span>(<span class="string">"__MSG__"</span>);',
        c: 'console.log("__MSG__");',
      });
      return L;
    },
  },

  // ── TypeScript ──
  {
    key: 'typescript',
    label: 'TypeScript',
    extension: 'ts',
    commentPrefix: '//',
    printTemplate: {
      display:
        '<span class="property">console</span>.<span class="keyword">log</span>(<span class="string">"__MSG__"</span>);',
      copy: 'console.log("__MSG__");',
    },
    build(about, e) {
      const { vars, arsenal, missionLog, aliases, focus, philosophy } = extract(about);
      const L: Line[] = [];
      L.push(...commentHeader('//'));

      // Interface definition
      L.push({
        d: '<span class="keyword">interface</span> <span class="const">Profile</span> <span class="bracket">{</span>',
        c: 'interface Profile {',
      });
      for (const [key] of vars) {
        L.push({
          d: `  <span class="property">${e(key)}</span>: <span class="keyword">string</span>;`,
          c: `  ${key}: string;`,
        });
      }
      L.push({
        d: `  <span class="property">arsenal</span>: <span class="keyword">Record</span><span class="bracket">&lt;</span><span class="keyword">string</span>, <span class="keyword">string</span><span class="bracket">&gt;</span>;`,
        c: '  arsenal: Record<string, string>;',
      });
      L.push({
        d: `  <span class="property">missionLog</span>: <span class="keyword">string</span><span class="bracket">[]</span>;`,
        c: '  missionLog: string[];',
      });
      L.push({
        d: `  <span class="property">aliases</span>: <span class="keyword">string</span><span class="bracket">[]</span>;`,
        c: '  aliases: string[];',
      });
      L.push({
        d: `  <span class="property">focus</span>: <span class="keyword">string</span>;`,
        c: '  focus: string;',
      });
      L.push({
        d: `  <span class="property">philosophy</span>: <span class="keyword">string</span>;`,
        c: '  philosophy: string;',
      });
      L.push({ d: '<span class="bracket">}</span>', c: '}' });
      L.push({ d: '', c: '' });

      // Instance
      L.push({
        d: '<span class="keyword">const</span> <span class="const">profile</span>: <span class="const">Profile</span> = <span class="bracket">{</span>',
        c: 'const profile: Profile = {',
      });
      for (const [key, value] of vars) {
        L.push({
          d: `  <span class="property">${e(key)}</span>: <span class="string">"${e(value)}"</span>,`,
          c: `  ${key}: "${value}",`,
        });
      }
      L.push({
        d: `  <span class="property">arsenal</span>: <span class="bracket">{</span>`,
        c: '  arsenal: {',
      });
      for (const entry of arsenal) {
        L.push({
          d: `    <span class="property">${e(entry.key)}</span>: <span class="string">"${e(entry.value)}"</span>,`,
          c: `    ${entry.key}: "${entry.value}",`,
        });
      }
      L.push({ d: '  <span class="bracket">}</span>,', c: '  },' });

      L.push({
        d: `  <span class="property">missionLog</span>: <span class="bracket">[</span>`,
        c: '  missionLog: [',
      });
      for (const entry of missionLog) {
        L.push({ d: `    <span class="string">"${e(entry)}"</span>,`, c: `    "${entry}",` });
      }
      L.push({ d: '  <span class="bracket">]</span>,', c: '  ],' });

      const aD = aliases.map((a) => `<span class="string">"${e(a)}"</span>`).join(', ');
      const aC = aliases.map((a) => `"${a}"`).join(', ');
      L.push({
        d: `  <span class="property">aliases</span>: <span class="bracket">[</span>${aD}<span class="bracket">]</span>,`,
        c: `  aliases: [${aC}],`,
      });
      L.push({
        d: `  <span class="property">focus</span>: <span class="string">"${e(focus)}"</span>,`,
        c: `  focus: "${focus}",`,
      });
      L.push({
        d: `  <span class="property">philosophy</span>: <span class="string">"${e(philosophy)}"</span>,`,
        c: `  philosophy: "${philosophy}",`,
      });

      L.push({ d: '<span class="bracket">}</span>;', c: '};' });
      L.push({ d: '', c: '' });
      L.push({
        d: '<span class="property">console</span>.<span class="keyword">log</span>(<span class="string">"__MSG__"</span>);',
        c: 'console.log("__MSG__");',
      });
      return L;
    },
  },

  // ── Java ──
  {
    key: 'java',
    label: 'Java',
    extension: 'java',
    commentPrefix: '//',
    printTemplate: {
      display:
        '<span class="property">System</span>.<span class="property">out</span>.<span class="keyword">println</span>(<span class="string">"__MSG__"</span>);',
      copy: 'System.out.println("__MSG__");',
    },
    build(about, e) {
      const { vars, arsenal, missionLog, aliases, focus, philosophy } = extract(about);
      const L: Line[] = [];
      L.push({ d: '<span class="keyword">import</span> java.util.*;', c: 'import java.util.*;' });
      L.push({ d: '', c: '' });
      L.push(...commentHeader('//'));

      L.push({
        d: '<span class="keyword">public class</span> <span class="const">Profile</span> <span class="bracket">{</span>',
        c: 'public class Profile {',
      });
      for (const [key, value] of vars) {
        L.push({
          d: `    <span class="keyword">String</span> <span class="property">${e(key)}</span> = <span class="string">"${e(value)}"</span>;`,
          c: `    String ${key} = "${value}";`,
        });
      }
      L.push({ d: '', c: '' });

      L.push({
        d: '    <span class="keyword">Map</span><span class="bracket">&lt;</span><span class="keyword">String</span>, <span class="keyword">String</span><span class="bracket">&gt;</span> <span class="property">arsenal</span> = <span class="keyword">Map</span>.<span class="keyword">of</span><span class="bracket">(</span>',
        c: '    Map<String, String> arsenal = Map.of(',
      });
      for (let i = 0; i < arsenal.length; i++) {
        const comma = i < arsenal.length - 1 ? ',' : '';
        L.push({
          d: `        <span class="string">"${e(arsenal[i].key)}"</span>, <span class="string">"${e(arsenal[i].value)}"</span>${comma}`,
          c: `        "${arsenal[i].key}", "${arsenal[i].value}"${comma}`,
        });
      }
      L.push({ d: '    <span class="bracket">)</span>;', c: '    );' });
      L.push({ d: '', c: '' });

      L.push({
        d: '    <span class="keyword">List</span><span class="bracket">&lt;</span><span class="keyword">String</span><span class="bracket">&gt;</span> <span class="property">missionLog</span> = <span class="keyword">List</span>.<span class="keyword">of</span><span class="bracket">(</span>',
        c: '    List<String> missionLog = List.of(',
      });
      for (let i = 0; i < missionLog.length; i++) {
        const comma = i < missionLog.length - 1 ? ',' : '';
        L.push({
          d: `        <span class="string">"${e(missionLog[i])}"</span>${comma}`,
          c: `        "${missionLog[i]}"${comma}`,
        });
      }
      L.push({ d: '    <span class="bracket">)</span>;', c: '    );' });
      L.push({ d: '', c: '' });

      const aD = aliases.map((a) => `<span class="string">"${e(a)}"</span>`).join(', ');
      const aC = aliases.map((a) => `"${a}"`).join(', ');
      L.push({
        d: `    <span class="keyword">List</span><span class="bracket">&lt;</span><span class="keyword">String</span><span class="bracket">&gt;</span> <span class="property">aliases</span> = <span class="keyword">List</span>.<span class="keyword">of</span><span class="bracket">(</span>${aD}<span class="bracket">)</span>;`,
        c: `    List<String> aliases = List.of(${aC});`,
      });
      L.push({
        d: `    <span class="keyword">String</span> <span class="property">focus</span> = <span class="string">"${e(focus)}"</span>;`,
        c: `    String focus = "${focus}";`,
      });
      L.push({
        d: `    <span class="keyword">String</span> <span class="property">philosophy</span> = <span class="string">"${e(philosophy)}"</span>;`,
        c: `    String philosophy = "${philosophy}";`,
      });
      L.push({ d: '', c: '' });

      L.push({
        d: '    <span class="keyword">public static void</span> <span class="property">main</span>(<span class="keyword">String</span><span class="bracket">[]</span> <span class="const">args</span>) <span class="bracket">{</span>',
        c: '    public static void main(String[] args) {',
      });
      L.push({
        d: '        <span class="property">System</span>.<span class="property">out</span>.<span class="keyword">println</span>(<span class="string">"__MSG__"</span>);',
        c: '        System.out.println("__MSG__");',
      });
      L.push({ d: '    <span class="bracket">}</span>', c: '    }' });
      L.push({ d: '<span class="bracket">}</span>', c: '}' });
      return L;
    },
  },

  // ── C++ ──
  {
    key: 'cpp',
    label: 'C++',
    extension: 'cpp',
    commentPrefix: '//',
    printTemplate: {
      display:
        '<span class="property">std::cout</span> <span class="keyword">&lt;&lt;</span> <span class="string">"__MSG__"</span> <span class="keyword">&lt;&lt;</span> <span class="property">std::endl</span>;',
      copy: 'std::cout << "__MSG__" << std::endl;',
    },
    build(about, e) {
      const { vars, arsenal, missionLog, aliases, focus, philosophy } = extract(about);
      const L: Line[] = [];
      L.push({
        d: '<span class="keyword">#include</span> <span class="string">&lt;iostream&gt;</span>',
        c: '#include <iostream>',
      });
      L.push({
        d: '<span class="keyword">#include</span> <span class="string">&lt;string&gt;</span>',
        c: '#include <string>',
      });
      L.push({
        d: '<span class="keyword">#include</span> <span class="string">&lt;map&gt;</span>',
        c: '#include <map>',
      });
      L.push({
        d: '<span class="keyword">#include</span> <span class="string">&lt;vector&gt;</span>',
        c: '#include <vector>',
      });
      L.push({ d: '', c: '' });
      L.push(...commentHeader('//'));

      L.push({
        d: '<span class="keyword">struct</span> <span class="const">Profile</span> <span class="bracket">{</span>',
        c: 'struct Profile {',
      });
      for (const [key, value] of vars) {
        L.push({
          d: `    <span class="keyword">std::string</span> <span class="property">${e(key)}</span> = <span class="string">"${e(value)}"</span>;`,
          c: `    std::string ${key} = "${value}";`,
        });
      }
      L.push({ d: '', c: '' });

      L.push({
        d: '    <span class="keyword">std::map</span><span class="bracket">&lt;</span><span class="keyword">std::string</span>, <span class="keyword">std::string</span><span class="bracket">&gt;</span> <span class="property">arsenal</span> = <span class="bracket">{</span>',
        c: '    std::map<std::string, std::string> arsenal = {',
      });
      for (const entry of arsenal) {
        L.push({
          d: `        <span class="bracket">{</span><span class="string">"${e(entry.key)}"</span>, <span class="string">"${e(entry.value)}"</span><span class="bracket">}</span>,`,
          c: `        {"${entry.key}", "${entry.value}"},`,
        });
      }
      L.push({ d: '    <span class="bracket">}</span>;', c: '    };' });
      L.push({ d: '', c: '' });

      L.push({
        d: '    <span class="keyword">std::vector</span><span class="bracket">&lt;</span><span class="keyword">std::string</span><span class="bracket">&gt;</span> <span class="property">mission_log</span> = <span class="bracket">{</span>',
        c: '    std::vector<std::string> mission_log = {',
      });
      for (const entry of missionLog) {
        L.push({
          d: `        <span class="string">"${e(entry)}"</span>,`,
          c: `        "${entry}",`,
        });
      }
      L.push({ d: '    <span class="bracket">}</span>;', c: '    };' });
      L.push({ d: '', c: '' });

      const aD = aliases.map((a) => `<span class="string">"${e(a)}"</span>`).join(', ');
      const aC = aliases.map((a) => `"${a}"`).join(', ');
      L.push({
        d: `    <span class="keyword">std::vector</span><span class="bracket">&lt;</span><span class="keyword">std::string</span><span class="bracket">&gt;</span> <span class="property">aliases</span> = <span class="bracket">{</span>${aD}<span class="bracket">}</span>;`,
        c: `    std::vector<std::string> aliases = {${aC}};`,
      });
      L.push({
        d: `    <span class="keyword">std::string</span> <span class="property">focus</span> = <span class="string">"${e(focus)}"</span>;`,
        c: `    std::string focus = "${focus}";`,
      });
      L.push({
        d: `    <span class="keyword">std::string</span> <span class="property">philosophy</span> = <span class="string">"${e(philosophy)}"</span>;`,
        c: `    std::string philosophy = "${philosophy}";`,
      });

      L.push({ d: '<span class="bracket">}</span>;', c: '};' });
      L.push({ d: '', c: '' });

      L.push({
        d: '<span class="keyword">int</span> <span class="property">main</span>() <span class="bracket">{</span>',
        c: 'int main() {',
      });
      L.push({
        d: '    <span class="const">Profile</span> <span class="property">p</span>;',
        c: '    Profile p;',
      });
      L.push({
        d: '    <span class="property">std::cout</span> <span class="keyword">&lt;&lt;</span> <span class="string">"__MSG__"</span> <span class="keyword">&lt;&lt;</span> <span class="property">std::endl</span>;',
        c: '    std::cout << "__MSG__" << std::endl;',
      });
      L.push({
        d: '    <span class="keyword">return</span> <span class="const">0</span>;',
        c: '    return 0;',
      });
      L.push({ d: '<span class="bracket">}</span>', c: '}' });
      return L;
    },
  },

  // ── Go ──
  {
    key: 'go',
    label: 'Go',
    extension: 'go',
    commentPrefix: '//',
    printTemplate: {
      display:
        '<span class="property">fmt</span>.<span class="keyword">Println</span>(<span class="string">"__MSG__"</span>)',
      copy: 'fmt.Println("__MSG__")',
    },
    build(about, e) {
      const { vars, arsenal, missionLog, aliases, focus, philosophy } = extract(about);
      const L: Line[] = [];
      L.push({
        d: '<span class="keyword">package</span> <span class="const">main</span>',
        c: 'package main',
      });
      L.push({ d: '', c: '' });
      L.push({
        d: '<span class="keyword">import</span> <span class="string">"fmt"</span>',
        c: 'import "fmt"',
      });
      L.push({ d: '', c: '' });
      L.push(...commentHeader('//'));

      // Struct definition
      L.push({
        d: '<span class="keyword">type</span> <span class="const">Profile</span> <span class="keyword">struct</span> <span class="bracket">{</span>',
        c: 'type Profile struct {',
      });
      for (const [key] of vars) {
        const goKey = key.charAt(0).toUpperCase() + key.slice(1);
        L.push({
          d: `    <span class="property">${e(goKey)}</span>    <span class="keyword">string</span>`,
          c: `    ${goKey}    string`,
        });
      }
      L.push({
        d: '    <span class="property">Arsenal</span>    <span class="keyword">map</span><span class="bracket">[</span><span class="keyword">string</span><span class="bracket">]</span><span class="keyword">string</span>',
        c: '    Arsenal    map[string]string',
      });
      L.push({
        d: '    <span class="property">MissionLog</span> <span class="bracket">[]</span><span class="keyword">string</span>',
        c: '    MissionLog []string',
      });
      L.push({
        d: '    <span class="property">Aliases</span>    <span class="bracket">[]</span><span class="keyword">string</span>',
        c: '    Aliases    []string',
      });
      L.push({
        d: '    <span class="property">Focus</span>      <span class="keyword">string</span>',
        c: '    Focus      string',
      });
      L.push({
        d: '    <span class="property">Philosophy</span> <span class="keyword">string</span>',
        c: '    Philosophy string',
      });
      L.push({ d: '<span class="bracket">}</span>', c: '}' });
      L.push({ d: '', c: '' });

      // main
      L.push({
        d: '<span class="keyword">func</span> <span class="property">main</span>() <span class="bracket">{</span>',
        c: 'func main() {',
      });
      L.push({
        d: '    <span class="const">p</span> := <span class="const">Profile</span><span class="bracket">{</span>',
        c: '    p := Profile{',
      });
      for (const [key, value] of vars) {
        const goKey = key.charAt(0).toUpperCase() + key.slice(1);
        L.push({
          d: `        <span class="property">${e(goKey)}</span>: <span class="string">"${e(value)}"</span>,`,
          c: `        ${goKey}: "${value}",`,
        });
      }

      L.push({
        d: '        <span class="property">Arsenal</span>: <span class="keyword">map</span><span class="bracket">[</span><span class="keyword">string</span><span class="bracket">]</span><span class="keyword">string</span><span class="bracket">{</span>',
        c: '        Arsenal: map[string]string{',
      });
      for (const entry of arsenal) {
        L.push({
          d: `            <span class="string">"${e(entry.key)}"</span>: <span class="string">"${e(entry.value)}"</span>,`,
          c: `            "${entry.key}": "${entry.value}",`,
        });
      }
      L.push({ d: '        <span class="bracket">}</span>,', c: '        },' });

      L.push({
        d: '        <span class="property">MissionLog</span>: <span class="bracket">[]</span><span class="keyword">string</span><span class="bracket">{</span>',
        c: '        MissionLog: []string{',
      });
      for (const entry of missionLog) {
        L.push({
          d: `            <span class="string">"${e(entry)}"</span>,`,
          c: `            "${entry}",`,
        });
      }
      L.push({ d: '        <span class="bracket">}</span>,', c: '        },' });

      const aD = aliases.map((a) => `<span class="string">"${e(a)}"</span>`).join(', ');
      const aC = aliases.map((a) => `"${a}"`).join(', ');
      L.push({
        d: `        <span class="property">Aliases</span>: <span class="bracket">[]</span><span class="keyword">string</span><span class="bracket">{</span>${aD}<span class="bracket">}</span>,`,
        c: `        Aliases: []string{${aC}},`,
      });
      L.push({
        d: `        <span class="property">Focus</span>:      <span class="string">"${e(focus)}"</span>,`,
        c: `        Focus:      "${focus}",`,
      });
      L.push({
        d: `        <span class="property">Philosophy</span>: <span class="string">"${e(philosophy)}"</span>,`,
        c: `        Philosophy: "${philosophy}",`,
      });

      L.push({ d: '    <span class="bracket">}</span>', c: '    }' });
      L.push({ d: '', c: '' });
      L.push({
        d: '    <span class="property">fmt</span>.<span class="keyword">Println</span>(<span class="string">"__MSG__"</span>)',
        c: '    fmt.Println("__MSG__")',
      });
      L.push({
        d: '    <span class="const">_</span> = <span class="const">p</span>',
        c: '    _ = p',
      });
      L.push({ d: '<span class="bracket">}</span>', c: '}' });
      return L;
    },
  },

  // ── Rust ──
  {
    key: 'rust',
    label: 'Rust',
    extension: 'rs',
    commentPrefix: '//',
    printTemplate: {
      display: '<span class="keyword">println!</span>(<span class="string">"__MSG__"</span>);',
      copy: 'println!("__MSG__");',
    },
    build(about, e) {
      const { vars, arsenal, missionLog, aliases, focus, philosophy } = extract(about);
      const L: Line[] = [];
      L.push({
        d: '<span class="keyword">use</span> std::collections::<span class="const">HashMap</span>;',
        c: 'use std::collections::HashMap;',
      });
      L.push({ d: '', c: '' });
      L.push(...commentHeader('//'));

      L.push({
        d: '<span class="keyword">struct</span> <span class="const">Profile</span> <span class="bracket">{</span>',
        c: 'struct Profile {',
      });
      for (const [key] of vars) {
        L.push({
          d: `    <span class="property">${e(key)}</span>: <span class="keyword">String</span>,`,
          c: `    ${key}: String,`,
        });
      }
      L.push({
        d: '    <span class="property">arsenal</span>: <span class="const">HashMap</span><span class="bracket">&lt;</span><span class="keyword">String</span>, <span class="keyword">String</span><span class="bracket">&gt;</span>,',
        c: '    arsenal: HashMap<String, String>,',
      });
      L.push({
        d: '    <span class="property">mission_log</span>: <span class="keyword">Vec</span><span class="bracket">&lt;</span><span class="keyword">String</span><span class="bracket">&gt;</span>,',
        c: '    mission_log: Vec<String>,',
      });
      L.push({
        d: '    <span class="property">aliases</span>: <span class="keyword">Vec</span><span class="bracket">&lt;</span><span class="keyword">String</span><span class="bracket">&gt;</span>,',
        c: '    aliases: Vec<String>,',
      });
      L.push({
        d: '    <span class="property">focus</span>: <span class="keyword">String</span>,',
        c: '    focus: String,',
      });
      L.push({
        d: '    <span class="property">philosophy</span>: <span class="keyword">String</span>,',
        c: '    philosophy: String,',
      });
      L.push({ d: '<span class="bracket">}</span>', c: '}' });
      L.push({ d: '', c: '' });

      L.push({
        d: '<span class="keyword">fn</span> <span class="property">main</span>() <span class="bracket">{</span>',
        c: 'fn main() {',
      });
      L.push({
        d: '    <span class="keyword">let</span> <span class="const">profile</span> = <span class="const">Profile</span> <span class="bracket">{</span>',
        c: '    let profile = Profile {',
      });
      for (const [key, value] of vars) {
        L.push({
          d: `        <span class="property">${e(key)}</span>: <span class="string">"${e(value)}"</span>.to_string(),`,
          c: `        ${key}: "${value}".to_string(),`,
        });
      }
      L.push({
        d: '        <span class="property">arsenal</span>: <span class="const">HashMap</span>::<span class="keyword">from</span>(<span class="bracket">[</span>',
        c: '        arsenal: HashMap::from([',
      });
      for (const entry of arsenal) {
        L.push({
          d: `            (<span class="string">"${e(entry.key)}"</span>.into(), <span class="string">"${e(entry.value)}"</span>.into()),`,
          c: `            ("${entry.key}".into(), "${entry.value}".into()),`,
        });
      }
      L.push({ d: '        <span class="bracket">]</span>),', c: '        ]),' });

      L.push({
        d: '        <span class="property">mission_log</span>: <span class="keyword">vec!</span><span class="bracket">[</span>',
        c: '        mission_log: vec![',
      });
      for (const entry of missionLog) {
        L.push({
          d: `            <span class="string">"${e(entry)}"</span>.into(),`,
          c: `            "${entry}".into(),`,
        });
      }
      L.push({ d: '        <span class="bracket">]</span>,', c: '        ],' });

      const aD = aliases.map((a) => `<span class="string">"${e(a)}"</span>.into()`).join(', ');
      const aC = aliases.map((a) => `"${a}".into()`).join(', ');
      L.push({
        d: `        <span class="property">aliases</span>: <span class="keyword">vec!</span><span class="bracket">[</span>${aD}<span class="bracket">]</span>,`,
        c: `        aliases: vec![${aC}],`,
      });
      L.push({
        d: `        <span class="property">focus</span>: <span class="string">"${e(focus)}"</span>.to_string(),`,
        c: `        focus: "${focus}".to_string(),`,
      });
      L.push({
        d: `        <span class="property">philosophy</span>: <span class="string">"${e(philosophy)}"</span>.to_string(),`,
        c: `        philosophy: "${philosophy}".to_string(),`,
      });
      L.push({ d: '    <span class="bracket">}</span>;', c: '    };' });
      L.push({ d: '', c: '' });
      L.push({
        d: '    <span class="keyword">println!</span>(<span class="string">"__MSG__"</span>);',
        c: '    println!("__MSG__");',
      });
      L.push({ d: '    <span class="keyword">drop</span>(profile);', c: '    drop(profile);' });
      L.push({ d: '<span class="bracket">}</span>', c: '}' });
      return L;
    },
  },

  // ── PHP ──
  {
    key: 'php',
    label: 'PHP',
    extension: 'php',
    commentPrefix: '//',
    printTemplate: {
      display: '<span class="keyword">echo</span> <span class="string">"__MSG__"</span>;',
      copy: 'echo "__MSG__";',
    },
    build(about, e) {
      const { vars, arsenal, missionLog, aliases, focus, philosophy } = extract(about);
      const L: Line[] = [];
      L.push({ d: '<span class="keyword">&lt;?php</span>', c: '<?php' });
      L.push(...commentHeader('//'));

      L.push({
        d: '<span class="const">$profile</span> = <span class="bracket">[</span>',
        c: '$profile = [',
      });
      for (const [key, value] of vars) {
        L.push({
          d: `    <span class="string">"${e(key)}"</span> <span class="keyword">=&gt;</span> <span class="string">"${e(value)}"</span>,`,
          c: `    "${key}" => "${value}",`,
        });
      }
      L.push({
        d: `    <span class="string">"arsenal"</span> <span class="keyword">=&gt;</span> <span class="bracket">[</span>`,
        c: '    "arsenal" => [',
      });
      for (const entry of arsenal) {
        L.push({
          d: `        <span class="string">"${e(entry.key)}"</span> <span class="keyword">=&gt;</span> <span class="string">"${e(entry.value)}"</span>,`,
          c: `        "${entry.key}" => "${entry.value}",`,
        });
      }
      L.push({ d: '    <span class="bracket">]</span>,', c: '    ],' });

      L.push({
        d: `    <span class="string">"mission_log"</span> <span class="keyword">=&gt;</span> <span class="bracket">[</span>`,
        c: '    "mission_log" => [',
      });
      for (const entry of missionLog) {
        L.push({
          d: `        <span class="string">"${e(entry)}"</span>,`,
          c: `        "${entry}",`,
        });
      }
      L.push({ d: '    <span class="bracket">]</span>,', c: '    ],' });

      const aD = aliases.map((a) => `<span class="string">"${e(a)}"</span>`).join(', ');
      const aC = aliases.map((a) => `"${a}"`).join(', ');
      L.push({
        d: `    <span class="string">"aliases"</span> <span class="keyword">=&gt;</span> <span class="bracket">[</span>${aD}<span class="bracket">]</span>,`,
        c: `    "aliases" => [${aC}],`,
      });
      L.push({
        d: `    <span class="string">"focus"</span> <span class="keyword">=&gt;</span> <span class="string">"${e(focus)}"</span>,`,
        c: `    "focus" => "${focus}",`,
      });
      L.push({
        d: `    <span class="string">"philosophy"</span> <span class="keyword">=&gt;</span> <span class="string">"${e(philosophy)}"</span>,`,
        c: `    "philosophy" => "${philosophy}",`,
      });

      L.push({ d: '<span class="bracket">]</span>;', c: '];' });
      L.push({ d: '', c: '' });
      L.push({
        d: '<span class="keyword">echo</span> <span class="string">"__MSG__"</span>;',
        c: 'echo "__MSG__";',
      });
      return L;
    },
  },

  // ── Perl ──
  {
    key: 'perl',
    label: 'Perl',
    extension: 'pl',
    commentPrefix: '#',
    printTemplate: {
      display: '<span class="keyword">print</span> <span class="string">"__MSG__\\n"</span>;',
      copy: 'print "__MSG__\\n";',
    },
    build(about, e) {
      const { vars, arsenal, missionLog, aliases, focus, philosophy } = extract(about);
      const L: Line[] = [];
      L.push({ d: '<span class="keyword">#!/usr/bin/env perl</span>', c: '#!/usr/bin/env perl' });
      L.push({ d: '<span class="keyword">use</span> strict;', c: 'use strict;' });
      L.push({ d: '<span class="keyword">use</span> warnings;', c: 'use warnings;' });
      L.push({ d: '', c: '' });
      L.push(...commentHeader('#'));

      L.push({
        d: '<span class="keyword">my</span> <span class="const">%profile</span> = <span class="bracket">(</span>',
        c: 'my %profile = (',
      });
      for (const [key, value] of vars) {
        L.push({
          d: `    <span class="property">${e(key)}</span> <span class="keyword">=&gt;</span> <span class="string">"${e(value)}"</span>,`,
          c: `    ${key} => "${value}",`,
        });
      }
      L.push({
        d: `    <span class="property">arsenal</span> <span class="keyword">=&gt;</span> <span class="bracket">{</span>`,
        c: '    arsenal => {',
      });
      for (const entry of arsenal) {
        L.push({
          d: `        <span class="property">${e(entry.key)}</span> <span class="keyword">=&gt;</span> <span class="string">"${e(entry.value)}"</span>,`,
          c: `        ${entry.key} => "${entry.value}",`,
        });
      }
      L.push({ d: '    <span class="bracket">}</span>,', c: '    },' });

      L.push({
        d: `    <span class="property">mission_log</span> <span class="keyword">=&gt;</span> <span class="bracket">[</span>`,
        c: '    mission_log => [',
      });
      for (const entry of missionLog) {
        L.push({
          d: `        <span class="string">"${e(entry)}"</span>,`,
          c: `        "${entry}",`,
        });
      }
      L.push({ d: '    <span class="bracket">]</span>,', c: '    ],' });

      const aD = aliases.map((a) => `<span class="string">"${e(a)}"</span>`).join(', ');
      const aC = aliases.map((a) => `"${a}"`).join(', ');
      L.push({
        d: `    <span class="property">aliases</span> <span class="keyword">=&gt;</span> <span class="bracket">[</span>${aD}<span class="bracket">]</span>,`,
        c: `    aliases => [${aC}],`,
      });
      L.push({
        d: `    <span class="property">focus</span> <span class="keyword">=&gt;</span> <span class="string">"${e(focus)}"</span>,`,
        c: `    focus => "${focus}",`,
      });
      L.push({
        d: `    <span class="property">philosophy</span> <span class="keyword">=&gt;</span> <span class="string">"${e(philosophy)}"</span>,`,
        c: `    philosophy => "${philosophy}",`,
      });

      L.push({ d: '<span class="bracket">)</span>;', c: ');' });
      L.push({ d: '', c: '' });
      L.push({
        d: '<span class="keyword">print</span> <span class="string">"__MSG__\\n"</span>;',
        c: 'print "__MSG__\\n";',
      });
      return L;
    },
  },

  // ── C# ──
  {
    key: 'csharp',
    label: 'C#',
    extension: 'cs',
    commentPrefix: '//',
    printTemplate: {
      display:
        '<span class="property">Console</span>.<span class="keyword">WriteLine</span>(<span class="string">"__MSG__"</span>);',
      copy: 'Console.WriteLine("__MSG__");',
    },
    build(about, e) {
      const { vars, arsenal, missionLog, aliases, focus, philosophy } = extract(about);
      const L: Line[] = [];
      L.push({ d: '<span class="keyword">using</span> System;', c: 'using System;' });
      L.push({
        d: '<span class="keyword">using</span> System.Collections.Generic;',
        c: 'using System.Collections.Generic;',
      });
      L.push({ d: '', c: '' });
      L.push(...commentHeader('//'));

      L.push({
        d: '<span class="keyword">class</span> <span class="const">Profile</span> <span class="bracket">{</span>',
        c: 'class Profile {',
      });
      for (const [key, value] of vars) {
        const csKey = key.charAt(0).toUpperCase() + key.slice(1);
        L.push({
          d: `    <span class="keyword">public string</span> <span class="property">${e(csKey)}</span> = <span class="string">"${e(value)}"</span>;`,
          c: `    public string ${csKey} = "${value}";`,
        });
      }
      L.push({ d: '', c: '' });

      L.push({
        d: '    <span class="keyword">public</span> <span class="const">Dictionary</span><span class="bracket">&lt;</span><span class="keyword">string</span>, <span class="keyword">string</span><span class="bracket">&gt;</span> <span class="property">Arsenal</span> = <span class="keyword">new</span>() <span class="bracket">{</span>',
        c: '    public Dictionary<string, string> Arsenal = new() {',
      });
      for (const entry of arsenal) {
        L.push({
          d: `        <span class="bracket">[</span><span class="string">"${e(entry.key)}"</span><span class="bracket">]</span> = <span class="string">"${e(entry.value)}"</span>,`,
          c: `        ["${entry.key}"] = "${entry.value}",`,
        });
      }
      L.push({ d: '    <span class="bracket">}</span>;', c: '    };' });
      L.push({ d: '', c: '' });

      L.push({
        d: '    <span class="keyword">public</span> <span class="const">List</span><span class="bracket">&lt;</span><span class="keyword">string</span><span class="bracket">&gt;</span> <span class="property">MissionLog</span> = <span class="keyword">new</span>() <span class="bracket">{</span>',
        c: '    public List<string> MissionLog = new() {',
      });
      for (const entry of missionLog) {
        L.push({
          d: `        <span class="string">"${e(entry)}"</span>,`,
          c: `        "${entry}",`,
        });
      }
      L.push({ d: '    <span class="bracket">}</span>;', c: '    };' });
      L.push({ d: '', c: '' });

      const aD = aliases.map((a) => `<span class="string">"${e(a)}"</span>`).join(', ');
      const aC = aliases.map((a) => `"${a}"`).join(', ');
      L.push({
        d: `    <span class="keyword">public</span> <span class="const">List</span><span class="bracket">&lt;</span><span class="keyword">string</span><span class="bracket">&gt;</span> <span class="property">Aliases</span> = <span class="keyword">new</span>() <span class="bracket">{</span> ${aD} <span class="bracket">}</span>;`,
        c: `    public List<string> Aliases = new() { ${aC} };`,
      });
      L.push({
        d: `    <span class="keyword">public string</span> <span class="property">Focus</span> = <span class="string">"${e(focus)}"</span>;`,
        c: `    public string Focus = "${focus}";`,
      });
      L.push({
        d: `    <span class="keyword">public string</span> <span class="property">Philosophy</span> = <span class="string">"${e(philosophy)}"</span>;`,
        c: `    public string Philosophy = "${philosophy}";`,
      });
      L.push({ d: '', c: '' });

      L.push({
        d: '    <span class="keyword">static void</span> <span class="property">Main</span>() <span class="bracket">{</span>',
        c: '    static void Main() {',
      });
      L.push({
        d: '        <span class="property">Console</span>.<span class="keyword">WriteLine</span>(<span class="string">"__MSG__"</span>);',
        c: '        Console.WriteLine("__MSG__");',
      });
      L.push({ d: '    <span class="bracket">}</span>', c: '    }' });
      L.push({ d: '<span class="bracket">}</span>', c: '}' });
      return L;
    },
  },

  // ── Swift ──
  {
    key: 'swift',
    label: 'Swift',
    extension: 'swift',
    commentPrefix: '//',
    printTemplate: {
      display: '<span class="keyword">print</span>(<span class="string">"__MSG__"</span>)',
      copy: 'print("__MSG__")',
    },
    build(about, e) {
      const { vars, arsenal, missionLog, aliases, focus, philosophy } = extract(about);
      const L: Line[] = [];
      L.push(...commentHeader('//'));

      L.push({
        d: '<span class="keyword">struct</span> <span class="const">Profile</span> <span class="bracket">{</span>',
        c: 'struct Profile {',
      });
      for (const [key, value] of vars) {
        L.push({
          d: `    <span class="keyword">let</span> <span class="property">${e(key)}</span>: <span class="keyword">String</span> = <span class="string">"${e(value)}"</span>`,
          c: `    let ${key}: String = "${value}"`,
        });
      }
      L.push({ d: '', c: '' });

      L.push({
        d: '    <span class="keyword">let</span> <span class="property">arsenal</span>: <span class="bracket">[</span><span class="keyword">String</span>: <span class="keyword">String</span><span class="bracket">]</span> = <span class="bracket">[</span>',
        c: '    let arsenal: [String: String] = [',
      });
      for (const entry of arsenal) {
        L.push({
          d: `        <span class="string">"${e(entry.key)}"</span>: <span class="string">"${e(entry.value)}"</span>,`,
          c: `        "${entry.key}": "${entry.value}",`,
        });
      }
      L.push({ d: '    <span class="bracket">]</span>', c: '    ]' });
      L.push({ d: '', c: '' });

      L.push({
        d: '    <span class="keyword">let</span> <span class="property">missionLog</span>: <span class="bracket">[</span><span class="keyword">String</span><span class="bracket">]</span> = <span class="bracket">[</span>',
        c: '    let missionLog: [String] = [',
      });
      for (const entry of missionLog) {
        L.push({
          d: `        <span class="string">"${e(entry)}"</span>,`,
          c: `        "${entry}",`,
        });
      }
      L.push({ d: '    <span class="bracket">]</span>', c: '    ]' });
      L.push({ d: '', c: '' });

      const aD = aliases.map((a) => `<span class="string">"${e(a)}"</span>`).join(', ');
      const aC = aliases.map((a) => `"${a}"`).join(', ');
      L.push({
        d: `    <span class="keyword">let</span> <span class="property">aliases</span>: <span class="bracket">[</span><span class="keyword">String</span><span class="bracket">]</span> = <span class="bracket">[</span>${aD}<span class="bracket">]</span>`,
        c: `    let aliases: [String] = [${aC}]`,
      });
      L.push({
        d: `    <span class="keyword">let</span> <span class="property">focus</span>: <span class="keyword">String</span> = <span class="string">"${e(focus)}"</span>`,
        c: `    let focus: String = "${focus}"`,
      });
      L.push({
        d: `    <span class="keyword">let</span> <span class="property">philosophy</span>: <span class="keyword">String</span> = <span class="string">"${e(philosophy)}"</span>`,
        c: `    let philosophy: String = "${philosophy}"`,
      });
      L.push({ d: '<span class="bracket">}</span>', c: '}' });
      L.push({ d: '', c: '' });

      L.push({
        d: '<span class="keyword">let</span> <span class="const">profile</span> = <span class="const">Profile</span>()',
        c: 'let profile = Profile()',
      });
      L.push({
        d: '<span class="keyword">print</span>(<span class="string">"__MSG__"</span>)',
        c: 'print("__MSG__")',
      });
      return L;
    },
  },

  // ── Kotlin ──
  {
    key: 'kotlin',
    label: 'Kotlin',
    extension: 'kt',
    commentPrefix: '//',
    printTemplate: {
      display: '<span class="keyword">println</span>(<span class="string">"__MSG__"</span>)',
      copy: 'println("__MSG__")',
    },
    build(about, e) {
      const { vars, arsenal, missionLog, aliases, focus, philosophy } = extract(about);
      const L: Line[] = [];
      L.push(...commentHeader('//'));

      L.push({
        d: '<span class="keyword">data class</span> <span class="const">Profile</span><span class="bracket">(</span>',
        c: 'data class Profile(',
      });
      for (const [key, value] of vars) {
        L.push({
          d: `    <span class="keyword">val</span> <span class="property">${e(key)}</span>: <span class="keyword">String</span> = <span class="string">"${e(value)}"</span>,`,
          c: `    val ${key}: String = "${value}",`,
        });
      }
      L.push({
        d: '    <span class="keyword">val</span> <span class="property">arsenal</span>: <span class="const">Map</span><span class="bracket">&lt;</span><span class="keyword">String</span>, <span class="keyword">String</span><span class="bracket">&gt;</span> = <span class="keyword">mapOf</span><span class="bracket">(</span>',
        c: '    val arsenal: Map<String, String> = mapOf(',
      });
      for (const entry of arsenal) {
        L.push({
          d: `        <span class="string">"${e(entry.key)}"</span> <span class="keyword">to</span> <span class="string">"${e(entry.value)}"</span>,`,
          c: `        "${entry.key}" to "${entry.value}",`,
        });
      }
      L.push({ d: '    <span class="bracket">)</span>,', c: '    ),' });

      L.push({
        d: '    <span class="keyword">val</span> <span class="property">missionLog</span>: <span class="const">List</span><span class="bracket">&lt;</span><span class="keyword">String</span><span class="bracket">&gt;</span> = <span class="keyword">listOf</span><span class="bracket">(</span>',
        c: '    val missionLog: List<String> = listOf(',
      });
      for (const entry of missionLog) {
        L.push({
          d: `        <span class="string">"${e(entry)}"</span>,`,
          c: `        "${entry}",`,
        });
      }
      L.push({ d: '    <span class="bracket">)</span>,', c: '    ),' });

      const aD = aliases.map((a) => `<span class="string">"${e(a)}"</span>`).join(', ');
      const aC = aliases.map((a) => `"${a}"`).join(', ');
      L.push({
        d: `    <span class="keyword">val</span> <span class="property">aliases</span>: <span class="const">List</span><span class="bracket">&lt;</span><span class="keyword">String</span><span class="bracket">&gt;</span> = <span class="keyword">listOf</span><span class="bracket">(</span>${aD}<span class="bracket">)</span>,`,
        c: `    val aliases: List<String> = listOf(${aC}),`,
      });
      L.push({
        d: `    <span class="keyword">val</span> <span class="property">focus</span>: <span class="keyword">String</span> = <span class="string">"${e(focus)}"</span>,`,
        c: `    val focus: String = "${focus}",`,
      });
      L.push({
        d: `    <span class="keyword">val</span> <span class="property">philosophy</span>: <span class="keyword">String</span> = <span class="string">"${e(philosophy)}"</span>,`,
        c: `    val philosophy: String = "${philosophy}",`,
      });
      L.push({ d: '<span class="bracket">)</span>', c: ')' });
      L.push({ d: '', c: '' });

      L.push({
        d: '<span class="keyword">fun</span> <span class="property">main</span>() <span class="bracket">{</span>',
        c: 'fun main() {',
      });
      L.push({
        d: '    <span class="keyword">val</span> <span class="const">profile</span> = <span class="const">Profile</span>()',
        c: '    val profile = Profile()',
      });
      L.push({
        d: '    <span class="keyword">println</span>(<span class="string">"__MSG__"</span>)',
        c: '    println("__MSG__")',
      });
      L.push({ d: '<span class="bracket">}</span>', c: '}' });
      return L;
    },
  },

  // ── COBOL ──
  {
    key: 'cobol',
    label: 'COBOL',
    extension: 'cob',
    commentPrefix: '*',
    printTemplate: {
      display:
        '          <span class="keyword">DISPLAY</span> <span class="string">"__MSG__"</span>.',
      copy: '          DISPLAY "__MSG__".',
    },
    build(about, e) {
      const { vars, arsenal, missionLog, focus, philosophy } = extract(about);
      const L: Line[] = [];
      L.push({
        d: '      <span class="keyword">IDENTIFICATION DIVISION</span>.',
        c: '      IDENTIFICATION DIVISION.',
      });
      L.push({
        d: '      <span class="keyword">PROGRAM-ID</span>. <span class="const">PROFILE</span>.',
        c: '      PROGRAM-ID. PROFILE.',
      });
      L.push({ d: '      <span class="comment">* __COMMENT__</span>', c: '      * __COMMENT__' });
      L.push({ d: '', c: '' });
      L.push({ d: '      <span class="keyword">DATA DIVISION</span>.', c: '      DATA DIVISION.' });
      L.push({
        d: '      <span class="keyword">WORKING-STORAGE SECTION</span>.',
        c: '      WORKING-STORAGE SECTION.',
      });

      for (const [key, value] of vars) {
        const cobKey = key.toUpperCase().replace(/_/g, '-');
        L.push({
          d: `      <span class="const">01</span> <span class="property">${cobKey}</span> <span class="keyword">PIC</span> X(60) <span class="keyword">VALUE</span> <span class="string">"${e(value)}"</span>.`,
          c: `      01 ${cobKey} PIC X(60) VALUE "${value}".`,
        });
      }
      for (const entry of arsenal) {
        const cobKey = `ARSENAL-${entry.key.toUpperCase().replace(/_/g, '-')}`;
        L.push({
          d: `      <span class="const">01</span> <span class="property">${cobKey}</span> <span class="keyword">PIC</span> X(60) <span class="keyword">VALUE</span> <span class="string">"${e(entry.value)}"</span>.`,
          c: `      01 ${cobKey} PIC X(60) VALUE "${entry.value}".`,
        });
      }
      for (let i = 0; i < missionLog.length; i++) {
        L.push({
          d: `      <span class="const">01</span> <span class="property">MISSION-${i + 1}</span> <span class="keyword">PIC</span> X(60) <span class="keyword">VALUE</span> <span class="string">"${e(missionLog[i])}"</span>.`,
          c: `      01 MISSION-${i + 1} PIC X(60) VALUE "${missionLog[i]}".`,
        });
      }
      L.push({
        d: `      <span class="const">01</span> <span class="property">FOCUS</span> <span class="keyword">PIC</span> X(60) <span class="keyword">VALUE</span> <span class="string">"${e(focus)}"</span>.`,
        c: `      01 FOCUS PIC X(60) VALUE "${focus}".`,
      });
      L.push({
        d: `      <span class="const">01</span> <span class="property">PHILOSOPHY</span> <span class="keyword">PIC</span> X(80) <span class="keyword">VALUE</span> <span class="string">"${e(philosophy)}"</span>.`,
        c: `      01 PHILOSOPHY PIC X(80) VALUE "${philosophy}".`,
      });
      L.push({ d: '', c: '' });
      L.push({
        d: '      <span class="keyword">PROCEDURE DIVISION</span>.',
        c: '      PROCEDURE DIVISION.',
      });
      L.push({
        d: '          <span class="keyword">DISPLAY</span> <span class="string">"__MSG__"</span>.',
        c: '          DISPLAY "__MSG__".',
      });
      L.push({ d: '          <span class="keyword">STOP RUN</span>.', c: '          STOP RUN.' });
      return L;
    },
  },

  // ── Fortran ──
  {
    key: 'fortran',
    label: 'Fortran',
    extension: 'f90',
    commentPrefix: '!',
    printTemplate: {
      display: '    <span class="keyword">print</span> *, <span class="string">"__MSG__"</span>',
      copy: '    print *, "__MSG__"',
    },
    build(about, e) {
      const { vars, arsenal, missionLog, focus, philosophy } = extract(about);
      const L: Line[] = [];
      L.push({
        d: '<span class="keyword">program</span> <span class="const">profile</span>',
        c: 'program profile',
      });
      L.push({ d: '    <span class="keyword">implicit none</span>', c: '    implicit none' });
      L.push({ d: '', c: '' });
      // Fortran uses indented comment header
      const sep = '! ═══════════════════════════════════════';
      L.push({ d: `    <span class="comment">${sep}</span>`, c: `    ${sep}` });
      L.push({ d: '    <span class="comment">! __COMMENT__</span>', c: '    ! __COMMENT__' });
      L.push({ d: `    <span class="comment">${sep}</span>`, c: `    ${sep}` });
      L.push({ d: '', c: '' });

      for (const [key, value] of vars) {
        L.push({
          d: `    <span class="keyword">character</span>(len=60) :: <span class="property">${e(key)}</span> = <span class="string">"${e(value)}"</span>`,
          c: `    character(len=60) :: ${key} = "${value}"`,
        });
      }
      L.push({ d: '', c: '' });
      for (const entry of arsenal) {
        const fKey = `arsenal_${entry.key}`;
        L.push({
          d: `    <span class="keyword">character</span>(len=60) :: <span class="property">${e(fKey)}</span> = <span class="string">"${e(entry.value)}"</span>`,
          c: `    character(len=60) :: ${fKey} = "${entry.value}"`,
        });
      }
      L.push({ d: '', c: '' });
      for (let i = 0; i < missionLog.length; i++) {
        L.push({
          d: `    <span class="keyword">character</span>(len=60) :: <span class="property">mission_${i + 1}</span> = <span class="string">"${e(missionLog[i])}"</span>`,
          c: `    character(len=60) :: mission_${i + 1} = "${missionLog[i]}"`,
        });
      }
      L.push({ d: '', c: '' });
      L.push({
        d: `    <span class="keyword">character</span>(len=60) :: <span class="property">focus</span> = <span class="string">"${e(focus)}"</span>`,
        c: `    character(len=60) :: focus = "${focus}"`,
      });
      L.push({
        d: `    <span class="keyword">character</span>(len=80) :: <span class="property">philosophy</span> = <span class="string">"${e(philosophy)}"</span>`,
        c: `    character(len=80) :: philosophy = "${philosophy}"`,
      });
      L.push({ d: '', c: '' });

      L.push({
        d: '    <span class="keyword">print</span> *, <span class="string">"__MSG__"</span>',
        c: '    print *, "__MSG__"',
      });
      L.push({
        d: '<span class="keyword">end program</span> <span class="const">profile</span>',
        c: 'end program profile',
      });
      return L;
    },
  },

  // ── Assembly ──
  {
    key: 'assembly',
    label: 'Assembly',
    extension: 'asm',
    commentPrefix: ';',
    printTemplate: {
      display:
        '    <span class="keyword">mov</span> <span class="const">rax</span>, <span class="const">1</span>          <span class="comment">; sys_write</span>',
      copy: '    mov rax, 1          ; sys_write',
    },
    build(about, e) {
      const { vars, arsenal, missionLog, focus, philosophy } = extract(about);
      const L: Line[] = [];
      L.push(...commentHeader(';'));

      L.push({
        d: '<span class="keyword">section</span> <span class="const">.data</span>',
        c: 'section .data',
      });
      for (const [key, value] of vars) {
        L.push({
          d: `    <span class="property">${e(key)}</span>    <span class="keyword">db</span> <span class="string">"${e(value)}"</span>, <span class="const">0</span>`,
          c: `    ${key}    db "${value}", 0`,
        });
      }
      L.push({ d: '', c: '' });
      for (const entry of arsenal) {
        L.push({
          d: `    <span class="property">a_${e(entry.key)}</span> <span class="keyword">db</span> <span class="string">"${e(entry.value)}"</span>, <span class="const">0</span>`,
          c: `    a_${entry.key} db "${entry.value}", 0`,
        });
      }
      L.push({ d: '', c: '' });
      for (let i = 0; i < missionLog.length; i++) {
        L.push({
          d: `    <span class="property">mission_${i}</span> <span class="keyword">db</span> <span class="string">"${e(missionLog[i])}"</span>, <span class="const">0</span>`,
          c: `    mission_${i} db "${missionLog[i]}", 0`,
        });
      }
      L.push({ d: '', c: '' });
      L.push({
        d: `    <span class="property">focus</span>     <span class="keyword">db</span> <span class="string">"${e(focus)}"</span>, <span class="const">0</span>`,
        c: `    focus     db "${focus}", 0`,
      });
      L.push({
        d: `    <span class="property">philosophy</span> <span class="keyword">db</span> <span class="string">"${e(philosophy)}"</span>, <span class="const">0</span>`,
        c: `    philosophy db "${philosophy}", 0`,
      });
      L.push({
        d: '    <span class="property">msg</span>       <span class="keyword">db</span> <span class="string">"__MSG__"</span>, <span class="const">0xA</span>, <span class="const">0</span>',
        c: '    msg       db "__MSG__", 0xA, 0',
      });
      L.push({ d: '', c: '' });
      L.push({
        d: '<span class="keyword">section</span> <span class="const">.text</span>',
        c: 'section .text',
      });
      L.push({
        d: '<span class="keyword">global</span> <span class="property">_start</span>',
        c: 'global _start',
      });
      L.push({ d: '', c: '' });
      L.push({ d: '<span class="property">_start</span>:', c: '_start:' });
      L.push({
        d: '    <span class="keyword">mov</span> <span class="const">rax</span>, <span class="const">1</span>          <span class="comment">; sys_write</span>',
        c: '    mov rax, 1          ; sys_write',
      });
      L.push({
        d: '    <span class="keyword">mov</span> <span class="const">rdi</span>, <span class="const">1</span>          <span class="comment">; stdout</span>',
        c: '    mov rdi, 1          ; stdout',
      });
      L.push({
        d: '    <span class="keyword">lea</span> <span class="const">rsi</span>, [<span class="property">msg</span>]     <span class="comment">; message</span>',
        c: '    lea rsi, [msg]     ; message',
      });
      L.push({
        d: '    <span class="keyword">mov</span> <span class="const">rdx</span>, <span class="const">48</span>         <span class="comment">; length</span>',
        c: '    mov rdx, 48         ; length',
      });
      L.push({ d: '    <span class="keyword">syscall</span>', c: '    syscall' });
      L.push({
        d: '    <span class="keyword">mov</span> <span class="const">rax</span>, <span class="const">60</span>         <span class="comment">; sys_exit</span>',
        c: '    mov rax, 60         ; sys_exit',
      });
      L.push({
        d: '    <span class="keyword">xor</span> <span class="const">rdi</span>, <span class="const">rdi</span>',
        c: '    xor rdi, rdi',
      });
      L.push({ d: '    <span class="keyword">syscall</span>', c: '    syscall' });
      return L;
    },
  },

  // ── Binary ──
  {
    key: 'binary',
    label: 'Binary',
    extension: 'bin',
    commentPrefix: ';',
    printTemplate: {
      display: '<span class="comment">; __MSG__</span>',
      copy: '; __MSG__',
    },
    build(about, e) {
      const { vars, arsenal, missionLog, focus, philosophy } = extract(about);
      const L: Line[] = [];
      L.push(...commentHeader('//'));

      for (const [key, value] of vars) {
        const label = `${key}: "${value}"`;
        L.push({ d: `<span class="comment">; ${e(label)}</span>`, c: `; ${label}` });
        for (const bl of toBin(value)) {
          L.push({ d: `<span class="const">${bl}</span>`, c: bl });
        }
      }
      L.push({ d: '', c: '' });

      L.push({ d: '<span class="comment">; arsenal</span>', c: '; arsenal' });
      for (const entry of arsenal) {
        const label = `${entry.key}: "${entry.value}"`;
        L.push({ d: `<span class="comment">; ${e(label)}</span>`, c: `; ${label}` });
        for (const bl of toBin(entry.value)) {
          L.push({ d: `<span class="const">${bl}</span>`, c: bl });
        }
      }
      L.push({ d: '', c: '' });

      L.push({ d: '<span class="comment">; mission_log</span>', c: '; mission_log' });
      for (const entry of missionLog) {
        L.push({ d: `<span class="comment">; ${e(entry)}</span>`, c: `; ${entry}` });
        for (const bl of toBin(entry)) {
          L.push({ d: `<span class="const">${bl}</span>`, c: bl });
        }
      }
      L.push({ d: '', c: '' });

      L.push({
        d: `<span class="comment">; focus: "${e(focus)}"</span>`,
        c: `; focus: "${focus}"`,
      });
      for (const bl of toBin(focus)) {
        L.push({ d: `<span class="const">${bl}</span>`, c: bl });
      }
      L.push({ d: '', c: '' });

      L.push({
        d: `<span class="comment">; philosophy: "${e(philosophy)}"</span>`,
        c: `; philosophy: "${philosophy}"`,
      });
      for (const bl of toBin(philosophy)) {
        L.push({ d: `<span class="const">${bl}</span>`, c: bl });
      }
      L.push({ d: '', c: '' });

      L.push({ d: '<span class="comment">; output:</span>', c: '; output:' });
      L.push({ d: '<span class="comment">; __MSG__</span>', c: '; __MSG__' });
      return L;
    },
  },
];

// ── Main export ──

export function buildAboutMultiLang(about: About): Record<LangKey, LangVariant> {
  const e = escapeHtml;

  // Bash is special — uses buildAboutLines directly
  const bash = buildAboutLines(about);
  const bashCommentIdx = 2;
  const bashEchoIdx = bash.displayLines.length - 1;

  const result: Partial<Record<LangKey, LangVariant>> = {
    bash: {
      displayLines: bash.displayLines,
      copyLines: bash.copyLines,
      extension: 'sh',
      langLabel: 'Bash',
      commentLineIndex: bashCommentIdx,
      echoLineIndex: bashEchoIdx,
      commentPrefix: '#',
      printTemplate: {
        display: '<span class="keyword">echo</span> <span class="string">"__MSG__"</span>',
        copy: 'echo "__MSG__"',
      },
    },
  };

  for (const syntax of languages) {
    const lines = syntax.build(about, e);
    result[syntax.key] = buildVariant(syntax, lines);
  }

  return result as Record<LangKey, LangVariant>;
}
