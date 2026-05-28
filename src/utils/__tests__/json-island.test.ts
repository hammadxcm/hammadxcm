import { describe, expect, it } from 'vitest';
import { safeJsonForScript } from '../json-island';

describe('safeJsonForScript', () => {
  it('serializes normally for plain data', () => {
    expect(safeJsonForScript({ a: 1, b: 'x' })).toBe('{"a":1,"b":"x"}');
  });

  it('escapes < so a "</script>" payload cannot break out', () => {
    const out = safeJsonForScript({ t: '</script><img src=x onerror=alert(1)>' });
    expect(out).not.toContain('</script>');
    expect(out).toContain('\\u003c/script>');
  });

  it('round-trips back to the original value via JSON.parse', () => {
    const value = { t: '1 < 2 </script>', arr: ['<a>', '<b>'] };
    expect(JSON.parse(safeJsonForScript(value))).toEqual(value);
  });
});
