import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from '../sanitize';

describe('sanitizeHtml', () => {
  it('strips dangerous tags (open and close)', () => {
    expect(sanitizeHtml('<script>alert(1)</script>hi')).toBe('alert(1)hi');
    expect(sanitizeHtml('a<iframe src="x"></iframe>b')).toBe('ab');
    expect(sanitizeHtml('<object></object><embed><form></form>')).toBe('');
  });

  it('strips dangerous attributes', () => {
    expect(sanitizeHtml('<a onclick="evil()">x</a>')).toBe('<a>x</a>');
    expect(sanitizeHtml('<a formaction="x" data-bind="y">x</a>')).toBe('<a>x</a>');
    expect(sanitizeHtml('<img srcdoc="x" />')).toBe('<img />');
  });

  it('neutralizes javascript: hrefs', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).toBe('<a href="alert(1)">x</a>');
  });

  it('preserves safe markup', () => {
    const safe = '<strong>bold</strong> <em>italic</em> <a href="https://x.com">link</a>';
    expect(sanitizeHtml(safe)).toBe(safe);
  });

  it('returns empty string unchanged', () => {
    expect(sanitizeHtml('')).toBe('');
  });
});
