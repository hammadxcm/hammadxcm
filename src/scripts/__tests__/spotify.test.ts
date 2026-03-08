/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { destroySpotify, initSpotify } from '../integrations/spotify';

describe('spotify', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            isPlaying: true,
            track: 'Test Song',
            artist: 'Test Artist',
            albumArt: 'https://example.com/art.jpg',
            progress: 60000,
            duration: 180000,
          }),
      }),
    );
  });

  afterEach(() => {
    destroySpotify();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('initializes without error', () => {
    expect(() => initSpotify()).not.toThrow();
  });

  it('does not double-initialize', () => {
    initSpotify();
    initSpotify();
    const widgets = document.querySelectorAll('.spotify-widget');
    expect(widgets.length).toBeLessThanOrEqual(1);
  });

  it('creates widget element', () => {
    initSpotify();
    const widget = document.getElementById('spotifyWidget');
    expect(widget).toBeTruthy();
  });

  it('destroys cleanly', () => {
    initSpotify();
    destroySpotify();
    const widget = document.getElementById('spotifyWidget');
    expect(widget).toBeNull();
  });

  it('allows re-init after destroy', () => {
    initSpotify();
    destroySpotify();
    expect(() => initSpotify()).not.toThrow();
  });

  it('handles fetch error gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network')));
    initSpotify();
    // Should not crash
    await new Promise((r) => setTimeout(r, 50));
  });
});
