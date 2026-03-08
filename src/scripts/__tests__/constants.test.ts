import { describe, expect, it } from 'vitest';
import { ALL_SECTIONS } from '../constants';

describe('ALL_SECTIONS', () => {
  it('contains exactly 10 sections', () => {
    expect(ALL_SECTIONS).toHaveLength(10);
  });

  it('includes expected section names', () => {
    expect(ALL_SECTIONS).toContain('hero');
    expect(ALL_SECTIONS).toContain('projects');
    expect(ALL_SECTIONS).toContain('guestbook');
  });
});
