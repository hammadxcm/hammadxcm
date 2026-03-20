import { buildFileSystem, type FSNode } from './terminal-fs';

let initialized = false;

export function initTerminal(): void {
  if (initialized) return;
  const input = document.getElementById('terminalInput') as HTMLInputElement;
  const output = document.getElementById('terminalOutput');
  const prompt = document.getElementById('terminalPrompt');
  if (!input || !output || !prompt) return;
  initialized = true;
  const _input = input;
  const _output = output;

  const fs = buildFileSystem();
  let cwd = '/home/hammad';
  const history: string[] = [];
  let historyIndex = -1;

  function getPrompt(): string {
    const short = cwd === '/home/hammad' ? '~' : cwd.replace('/home/hammad', '~');
    return `visitor@portfolio:${short}$`;
  }

  function print(html: string, cls = 'term-output'): void {
    const div = document.createElement('div');
    div.className = `term-line ${cls}`;
    div.innerHTML = html;
    _output.appendChild(div);
  }

  function printCmd(cmd: string): void {
    print(`<span class="term-cmd">${getPrompt()}</span> ${escapeHtml(cmd)}`, 'term-cmd');
  }

  function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function resolve(path: string): string {
    if (path.startsWith('/')) return normalizePath(path);
    if (path.startsWith('~')) return normalizePath(`/home/hammad${path.slice(1)}`);
    return normalizePath(`${cwd}/${path}`);
  }

  function normalizePath(p: string): string {
    const parts = p.split('/').filter(Boolean);
    const stack: string[] = [];
    for (const part of parts) {
      if (part === '..') {
        stack.pop();
      } else if (part !== '.') {
        stack.push(part);
      }
    }
    return `/${stack.join('/')}`;
  }

  function getNode(path: string): FSNode | undefined {
    const resolved = resolve(path);
    if (resolved === '/') return fs;
    const parts = resolved.split('/').filter(Boolean);
    let node: FSNode = fs;
    for (const part of parts) {
      if (node.type !== 'dir' || !node.children) return undefined;
      const child = node.children[part];
      if (!child) return undefined;
      node = child;
    }
    return node;
  }

  // Welcome message
  print("Welcome to Hammad's Portfolio Terminal", 'term-success');
  print('Type <span class="term-cmd">help</span> for available commands.', 'term-output');
  print('', '');

  const commands: Record<string, (args: string[]) => void> = {
    help: () => {
      print('Available commands:', 'term-success');
      print('  ls [path]      - List directory contents');
      print('  cd <path>      - Change directory');
      print('  cat <file>     - Display file contents');
      print('  pwd            - Print working directory');
      print('  clear          - Clear terminal');
      print('  whoami         - Display user info');
      print('  tree [path]    - Show directory tree');
      print('  history        - Show command history');
      print('  echo <text>    - Echo text');
      print('  grep <pattern> <file> - Search file');
      print('  exit           - Return to portfolio');
    },

    ls: (args) => {
      const target = args[0] || cwd;
      const node = getNode(target);
      if (!node || node.type !== 'dir') {
        print(`ls: cannot access '${escapeHtml(target)}': No such directory`, 'term-error');
        return;
      }
      if (!node.children) return;
      const entries = Object.entries(node.children);
      const outputStr = entries
        .map(([name, child]) => {
          if (child.type === 'dir') return `<span class="term-dir">${escapeHtml(name)}/</span>`;
          if (name.startsWith('.'))
            return `<span class="term-output" style="opacity:0.5">${escapeHtml(name)}</span>`;
          return `<span class="term-file">${escapeHtml(name)}</span>`;
        })
        .join('  ');
      print(outputStr);
    },

    cd: (args) => {
      if (!args[0] || args[0] === '~') {
        cwd = '/home/hammad';
        prompt.textContent = getPrompt();
        return;
      }
      const target = resolve(args[0]);
      const node = getNode(args[0]);
      if (!node || node.type !== 'dir') {
        print(`cd: no such directory: ${escapeHtml(args[0])}`, 'term-error');
        return;
      }
      cwd = target;
      prompt.textContent = getPrompt();
    },

    cat: (args) => {
      if (!args[0]) {
        print('cat: missing file operand', 'term-error');
        return;
      }
      const node = getNode(args[0]);
      if (!node) {
        print(`cat: ${escapeHtml(args[0])}: No such file`, 'term-error');
        return;
      }
      if (node.type === 'dir') {
        print(`cat: ${escapeHtml(args[0])}: Is a directory`, 'term-error');
        return;
      }
      const content = node.content || '';
      for (const line of content.split('\n')) {
        print(escapeHtml(line));
      }
      // Achievement: reading .secret
      if (args[0].includes('.secret')) {
        try {
          window.dispatchEvent(
            new CustomEvent('achievement-trigger', { detail: 'terminal_secret' }),
          );
        } catch {
          /* ignore */
        }
      }
    },

    pwd: () => {
      print(cwd);
    },

    clear: () => {
      _output.innerHTML = '';
    },

    whoami: () => {
      print("visitor — welcome to hammad's portfolio terminal");
      print('Role: Curious Explorer');
    },

    tree: (args) => {
      const target = args[0] || cwd;
      const node = getNode(target);
      if (!node || node.type !== 'dir') {
        print(`tree: '${escapeHtml(target)}': No such directory`, 'term-error');
        return;
      }
      function printTree(n: FSNode, prefix: string, name: string): void {
        if (n.type === 'dir') {
          print(`${prefix}<span class="term-dir">${escapeHtml(name)}/</span>`);
          if (n.children) {
            const entries = Object.entries(n.children);
            entries.forEach(([childName, child], i) => {
              const isLast = i === entries.length - 1;
              const connector = isLast ? '└── ' : '├── ';
              // newPrefix not needed — printTree uses connector prefix directly
              printTree(child, prefix + connector, childName);
            });
          }
        } else {
          print(`${prefix}<span class="term-file">${escapeHtml(name)}</span>`);
        }
      }
      const resolved = resolve(target);
      const dirName = resolved === '/' ? '/' : resolved.split('/').pop() || '/';
      printTree(node, '', dirName);
    },

    history: () => {
      history.forEach((cmd, i) => {
        print(`  ${i + 1}  ${escapeHtml(cmd)}`);
      });
    },

    echo: (args) => {
      print(escapeHtml(args.join(' ')));
    },

    grep: (args) => {
      if (args.length < 2) {
        print('Usage: grep <pattern> <file>', 'term-error');
        return;
      }
      const pattern = args[0];
      const node = getNode(args[1]);
      if (!node || node.type === 'dir') {
        print(`grep: ${escapeHtml(args[1])}: No such file`, 'term-error');
        return;
      }
      const content = node.content || '';
      const lines = content.split('\n');
      let found = false;
      for (const line of lines) {
        if (line.toLowerCase().includes(pattern.toLowerCase())) {
          const highlighted = line.replace(
            new RegExp(`(${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
            '<span class="term-success">$1</span>',
          );
          print(highlighted);
          found = true;
        }
      }
      if (!found) print(`(no matches for '${escapeHtml(pattern)}')`, 'term-error');
    },

    exit: () => {
      window.location.href = '/';
    },
  };

  function execute(line: string): void {
    const trimmed = line.trim();
    if (!trimmed) return;

    history.push(trimmed);
    historyIndex = history.length;
    printCmd(trimmed);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (commands[cmd]) {
      commands[cmd](args);
    } else {
      print(
        `command not found: ${escapeHtml(cmd)}. Type <span class="term-cmd">help</span> for available commands.`,
        'term-error',
      );
    }

    // Track achievement
    try {
      const cmdCount = history.length;
      if (cmdCount >= 1) {
        window.dispatchEvent(
          new CustomEvent('achievement-trigger', { detail: 'terminal_explorer' }),
        );
      }
      if (cmdCount >= 15) {
        window.dispatchEvent(new CustomEvent('achievement-trigger', { detail: 'terminal_hacker' }));
      }
    } catch {
      /* ignore */
    }

    // Scroll to bottom
    const body = document.getElementById('terminalBody');
    if (body) body.scrollTop = body.scrollHeight;
  }

  function handleEnter(): void {
    execute(input.value);
    input.value = '';
  }

  function handleArrowUp(e: KeyboardEvent): void {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      input.value = history[historyIndex];
    }
  }

  function handleArrowDown(e: KeyboardEvent): void {
    e.preventDefault();
    if (historyIndex < history.length - 1) {
      historyIndex++;
      input.value = history[historyIndex];
    } else {
      historyIndex = history.length;
      input.value = '';
    }
  }

  function applyTabMatch(valParts: string[], dirPath: string, match: string): void {
    valParts[valParts.length - 1] = dirPath + match;
    const dirNode = getNode(dirPath || cwd);
    if (dirNode?.type === 'dir' && dirNode.children) {
      const matchNode = dirNode.children[match];
      if (matchNode?.type === 'dir') valParts[valParts.length - 1] += '/';
    }
    input.value = valParts.join(' ');
  }

  function handleTabCompletion(e: KeyboardEvent): void {
    e.preventDefault();
    const val = input.value.trim();
    const valParts = val.split(/\s+/);
    const last = valParts[valParts.length - 1] || '';
    if (!last) return;
    const dirPath = last.includes('/') ? last.substring(0, last.lastIndexOf('/') + 1) : '';
    const prefix = last.includes('/') ? last.substring(last.lastIndexOf('/') + 1) : last;
    const dirNode = getNode(dirPath || cwd);
    if (dirNode?.type !== 'dir' || !dirNode.children) return;
    const matches = Object.keys(dirNode.children).filter((n) => n.startsWith(prefix));
    if (matches.length === 1) {
      applyTabMatch(valParts, dirPath, matches[0]);
    } else if (matches.length > 1) {
      printCmd(val);
      print(matches.join('  '));
    }
  }

  function handleCtrlL(e: KeyboardEvent): void {
    e.preventDefault();
    commands.clear([]);
  }

  input.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEnter();
    } else if (e.key === 'ArrowUp') {
      handleArrowUp(e);
    } else if (e.key === 'ArrowDown') {
      handleArrowDown(e);
    } else if (e.key === 'Tab') {
      handleTabCompletion(e);
    } else if (e.key === 'l' && e.ctrlKey) {
      handleCtrlL(e);
    }
  });

  // Focus input on click anywhere in terminal
  document.getElementById('terminalBody')?.addEventListener('click', () => {
    _input.focus();
  });
}

export function destroyTerminal(): void {
  initialized = false;
}
