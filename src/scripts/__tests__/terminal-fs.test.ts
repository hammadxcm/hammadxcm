/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import { buildFileSystem, type FSNode } from '../pages/terminal-fs';

function getNode(root: FSNode, path: string): FSNode | undefined {
  const parts = path.split('/').filter(Boolean);
  let node: FSNode = root;
  for (const part of parts) {
    if (node.type !== 'dir' || !node.children) return undefined;
    const child = node.children[part];
    if (!child) return undefined;
    node = child;
  }
  return node;
}

describe('buildFileSystem', () => {
  it('returns a root dir node', () => {
    const fs = buildFileSystem();
    expect(fs.type).toBe('dir');
    expect(fs.children).toBeDefined();
  });

  it('has /home directory', () => {
    const fs = buildFileSystem();
    const home = getNode(fs, 'home');
    expect(home).toBeDefined();
    expect(home?.type).toBe('dir');
  });

  it('has /home/hammad directory', () => {
    const fs = buildFileSystem();
    const hammad = getNode(fs, 'home/hammad');
    expect(hammad).toBeDefined();
    expect(hammad?.type).toBe('dir');
  });

  it('has about.txt file', () => {
    const fs = buildFileSystem();
    const about = getNode(fs, 'home/hammad/about.txt');
    expect(about).toBeDefined();
    expect(about?.type).toBe('file');
    expect(typeof about?.content).toBe('string');
    expect(about?.content).toContain('Hammad Khan');
  });

  it('has skills directory with files', () => {
    const fs = buildFileSystem();
    const skills = getNode(fs, 'home/hammad/skills');
    expect(skills).toBeDefined();
    expect(skills?.type).toBe('dir');

    const frontend = getNode(fs, 'home/hammad/skills/frontend.txt');
    expect(frontend?.type).toBe('file');
    expect(typeof frontend?.content).toBe('string');

    const backend = getNode(fs, 'home/hammad/skills/backend.txt');
    expect(backend?.type).toBe('file');
    expect(typeof backend?.content).toBe('string');

    const devops = getNode(fs, 'home/hammad/skills/devops.txt');
    expect(devops?.type).toBe('file');
    expect(typeof devops?.content).toBe('string');
  });

  it('has experience directory with files', () => {
    const fs = buildFileSystem();
    const current = getNode(fs, 'home/hammad/experience/current.txt');
    expect(current?.type).toBe('file');
    expect(current?.content).toContain('Toptal');

    const previous = getNode(fs, 'home/hammad/experience/previous.txt');
    expect(previous?.type).toBe('file');
    expect(typeof previous?.content).toBe('string');
  });

  it('has projects directory', () => {
    const fs = buildFileSystem();
    const projects = getNode(fs, 'home/hammad/projects');
    expect(projects?.type).toBe('dir');
    const readme = getNode(fs, 'home/hammad/projects/README.txt');
    expect(readme?.type).toBe('file');
  });

  it('has certifications directory', () => {
    const fs = buildFileSystem();
    const certs = getNode(fs, 'home/hammad/certifications');
    expect(certs?.type).toBe('dir');
    const readme = getNode(fs, 'home/hammad/certifications/README.txt');
    expect(readme?.type).toBe('file');
  });

  it('has .secret hidden file', () => {
    const fs = buildFileSystem();
    const secret = getNode(fs, 'home/hammad/.secret');
    expect(secret).toBeDefined();
    expect(secret?.type).toBe('file');
    expect(typeof secret?.content).toBe('string');
    expect(secret?.content).toContain('Achievement Unlocked');
  });

  it('all files have string content', () => {
    const fs = buildFileSystem();
    function checkFiles(node: FSNode): void {
      if (node.type === 'file') {
        expect(typeof node.content).toBe('string');
      }
      if (node.children) {
        for (const child of Object.values(node.children)) {
          checkFiles(child);
        }
      }
    }
    checkFiles(fs);
  });

  it('all dirs have children object', () => {
    const fs = buildFileSystem();
    function checkDirs(node: FSNode): void {
      if (node.type === 'dir') {
        expect(node.children).toBeDefined();
        expect(typeof node.children).toBe('object');
      }
      if (node.children) {
        for (const child of Object.values(node.children)) {
          checkDirs(child);
        }
      }
    }
    checkDirs(fs);
  });
});
