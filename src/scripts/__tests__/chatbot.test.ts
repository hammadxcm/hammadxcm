/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { destroyChatbot, initChatbot } from '../integrations/chatbot';

describe('chatbot', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.documentElement.dataset.chatApi = 'https://test-chat.workers.dev';
  });

  afterEach(() => {
    destroyChatbot();
    document.body.innerHTML = '';
    delete document.documentElement.dataset.chatApi;
    vi.restoreAllMocks();
  });

  it('initializes without error', () => {
    expect(() => initChatbot()).not.toThrow();
  });

  it('does not double-initialize', () => {
    initChatbot();
    initChatbot();
    const triggers = document.querySelectorAll('.chatbot-trigger');
    expect(triggers.length).toBe(1);
  });

  it('creates trigger button and panel', () => {
    initChatbot();
    expect(document.getElementById('chatbotTrigger')).toBeTruthy();
    expect(document.getElementById('chatbotPanel')).toBeTruthy();
  });

  it('toggles panel on trigger click', () => {
    initChatbot();
    const trigger = document.getElementById('chatbotTrigger');
    const panel = document.getElementById('chatbotPanel');
    if (!trigger || !panel) throw new Error('elements not found');
    expect(panel.classList.contains('open')).toBe(false);
    trigger.click();
    expect(panel.classList.contains('open')).toBe(true);
  });

  it('closes panel on close button click', () => {
    initChatbot();
    document.getElementById('chatbotTrigger')?.click();
    document.getElementById('chatbotClose')?.click();
    expect(document.getElementById('chatbotPanel')?.classList.contains('open')).toBe(false);
  });

  it('destroys cleanly', () => {
    initChatbot();
    destroyChatbot();
    expect(document.getElementById('chatbotTrigger')).toBeNull();
    expect(document.getElementById('chatbotPanel')).toBeNull();
  });

  it('allows re-init after destroy', () => {
    initChatbot();
    destroyChatbot();
    initChatbot();
    expect(document.getElementById('chatbotTrigger')).toBeTruthy();
  });

  it('sends message on Enter key', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ reply: 'Hello!' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    initChatbot();
    const input = document.getElementById('chatbotInput') as HTMLInputElement;
    input.value = 'Hi there';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('https://test-chat.workers.dev/api/chat', expect.any(Object));
    });
  });

  it('handles fetch error gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    initChatbot();
    const input = document.getElementById('chatbotInput') as HTMLInputElement;
    input.value = 'Hello';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    await vi.waitFor(() => {
      const msgs = document.querySelectorAll('.chatbot-msg');
      const lastMsg = msgs[msgs.length - 1];
      expect(lastMsg?.textContent).toContain('Connection error');
    });
  });

  it('dispatches achievement on first message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ reply: 'Hi!' }),
      }),
    );
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    initChatbot();
    const input = document.getElementById('chatbotInput') as HTMLInputElement;
    input.value = 'Hello';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    await vi.waitFor(() => {
      const events = dispatchSpy.mock.calls.filter(
        (c) => c[0] instanceof CustomEvent && (c[0] as CustomEvent).detail === 'ai_chat',
      );
      expect(events.length).toBe(1);
    });
  });

  it('does not send empty messages', () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    initChatbot();
    const input = document.getElementById('chatbotInput') as HTMLInputElement;
    input.value = '   ';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows user message in the panel', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ reply: 'Response' }),
      }),
    );

    initChatbot();
    const input = document.getElementById('chatbotInput') as HTMLInputElement;
    input.value = 'What are Hammad skills?';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    await vi.waitFor(() => {
      const userMsgs = document.querySelectorAll('.chatbot-msg.user');
      expect(userMsgs.length).toBe(1);
      expect(userMsgs[0]?.textContent).toBe('What are Hammad skills?');
    });
  });

  it('shows assistant reply in the panel', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ reply: 'Hammad is a Senior Full Stack Engineer.' }),
      }),
    );

    initChatbot();
    const input = document.getElementById('chatbotInput') as HTMLInputElement;
    input.value = 'Who is Hammad?';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    await vi.waitFor(() => {
      const assistantMsgs = document.querySelectorAll('.chatbot-msg.assistant');
      const lastMsg = assistantMsgs[assistantMsgs.length - 1];
      expect(lastMsg?.textContent).toBe('Hammad is a Senior Full Stack Engineer.');
    });
  });

  it('handles non-ok response gracefully', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      }),
    );

    initChatbot();
    const input = document.getElementById('chatbotInput') as HTMLInputElement;
    input.value = 'Hello';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    await vi.waitFor(() => {
      const msgs = document.querySelectorAll('.chatbot-msg.assistant');
      const lastMsg = msgs[msgs.length - 1];
      expect(lastMsg?.textContent).toContain('something went wrong');
    });
  });

  it('sends message via send button click', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ reply: 'Hi!' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    initChatbot();
    const input = document.getElementById('chatbotInput') as HTMLInputElement;
    input.value = 'Hello';
    document.getElementById('chatbotSend')?.click();

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('https://test-chat.workers.dev/api/chat', expect.any(Object));
    });
  });

  it('enforces rate limit after 10 messages', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ reply: 'Reply' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    initChatbot();
    const input = document.getElementById('chatbotInput') as HTMLInputElement;

    for (let i = 0; i < 10; i++) {
      input.value = `Message ${i}`;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(i + 1);
      });
    }

    mockFetch.mockClear();
    input.value = 'One more';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    const rateLimitEl = document.getElementById('chatbotRateLimit');
    expect(rateLimitEl?.textContent).toContain('Rate limit');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows fallback when chat API is not configured', async () => {
    delete document.documentElement.dataset.chatApi;
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    initChatbot();
    const input = document.getElementById('chatbotInput') as HTMLInputElement;
    input.value = 'Hello';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    await vi.waitFor(() => {
      const msgs = document.querySelectorAll('.chatbot-msg.assistant');
      const lastMsg = msgs[msgs.length - 1];
      expect(lastMsg?.textContent).toContain('not configured');
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sends only last 6 messages for context', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ reply: 'Reply' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    initChatbot();
    const input = document.getElementById('chatbotInput') as HTMLInputElement;

    for (let i = 0; i < 5; i++) {
      input.value = `Msg ${i}`;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(i + 1);
      });
    }

    const lastCall = mockFetch.mock.calls[4];
    const body = JSON.parse(lastCall[1].body);
    expect(body.messages.length).toBeLessThanOrEqual(6);
  });

  it('clears input after sending', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ reply: 'Hi!' }),
      }),
    );

    initChatbot();
    const input = document.getElementById('chatbotInput') as HTMLInputElement;
    input.value = 'Hello';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(input.value).toBe('');
  });
});
