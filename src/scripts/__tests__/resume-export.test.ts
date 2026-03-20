/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../achievements', () => ({ trackEvent: vi.fn() }));

import { initResumeExport } from '../interactions/resume-export';

describe('initResumeExport', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="resumeExportBtn">Export</button>
      <script id="resumeData" type="application/json">{"name":"Test","title":"Dev","location":"NYC","experience":"5y","arsenal":[],"missionLog":[],"jobs":[],"certifications":[]}</script>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing without button', () => {
    document.body.innerHTML = '';
    expect(() => initResumeExport()).not.toThrow();
  });

  it('does nothing without data element', () => {
    document.body.innerHTML = '<button id="resumeExportBtn">Export</button>';
    expect(() => initResumeExport()).not.toThrow();
  });

  it('attaches click listener to button', () => {
    const btn = document.getElementById('resumeExportBtn') as HTMLElement;
    const spy = vi.spyOn(btn, 'addEventListener');
    initResumeExport();
    expect(spy).toHaveBeenCalledWith('click', expect.any(Function));
  });
});
