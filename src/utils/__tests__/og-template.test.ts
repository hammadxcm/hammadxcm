import { describe, expect, it } from 'vitest';
import { buildOGTemplate } from '../og-template';

describe('buildOGTemplate', () => {
  const data = { title: 'Hello', subtitle: 'world', accent: '#0f0', bg: '#000' };
  const tpl = buildOGTemplate(data) as {
    type: string;
    props: {
      style: Record<string, string>;
      children: { props: { children: string; style: Record<string, string> } }[];
    };
  };

  it('is a div with the provided background', () => {
    expect(tpl.type).toBe('div');
    expect(tpl.props.style.background).toBe('#000');
    expect(tpl.props.style.width).toBe('1200px');
    expect(tpl.props.style.height).toBe('630px');
  });

  it('renders title, prefixed subtitle, and footer', () => {
    const [titleNode, subtitleNode, footerNode] = tpl.props.children;
    expect(titleNode.props.children).toBe('Hello');
    expect(subtitleNode.props.children).toBe('> world');
    expect(subtitleNode.props.style.color).toBe('#0f0');
    expect(footerNode.props.children).toBe('hammadkhan.dev');
  });
});
