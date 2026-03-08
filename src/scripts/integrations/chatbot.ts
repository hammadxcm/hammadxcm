let initialized = false;
let widgetEl: HTMLElement | null = null;
let panelEl: HTMLElement | null = null;
let messageCount = 0;
const MAX_MESSAGES = 10;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const messages: Message[] = [];

function createUI(): void {
  widgetEl = document.createElement('button');
  widgetEl.className = 'chatbot-trigger';
  widgetEl.id = 'chatbotTrigger';
  widgetEl.setAttribute('aria-label', 'Open chat');
  widgetEl.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
  document.body.appendChild(widgetEl);

  panelEl = document.createElement('div');
  panelEl.className = 'chatbot-panel';
  panelEl.id = 'chatbotPanel';
  panelEl.innerHTML = `
    <div class="chatbot-header">
      <span class="chatbot-title">&gt; chat</span>
      <button class="chatbot-close" id="chatbotClose">&times;</button>
    </div>
    <div class="chatbot-messages" id="chatbotMessages">
      <div class="chatbot-msg assistant">Ask me anything about Hammad's work and skills.</div>
    </div>
    <div class="chatbot-input-area">
      <input type="text" class="chatbot-input" id="chatbotInput" placeholder="Type a message..." autocomplete="off" maxlength="500" />
      <button class="chatbot-send" id="chatbotSend">&#9654;</button>
    </div>
    <div class="chatbot-rate-limit" id="chatbotRateLimit"></div>
  `;
  document.body.appendChild(panelEl);

  widgetEl.addEventListener('click', toggle);
  document.getElementById('chatbotClose')?.addEventListener('click', close);

  const input = document.getElementById('chatbotInput') as HTMLInputElement;
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
  document.getElementById('chatbotSend')?.addEventListener('click', send);
}

function toggle(): void {
  panelEl?.classList.toggle('open');
  if (panelEl?.classList.contains('open')) {
    (document.getElementById('chatbotInput') as HTMLInputElement)?.focus();
  }
}

function close(): void {
  panelEl?.classList.remove('open');
}

function addMessage(role: 'user' | 'assistant', content: string): void {
  const container = document.getElementById('chatbotMessages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = `chatbot-msg ${role}`;
  div.textContent = content;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

async function send(): Promise<void> {
  const input = document.getElementById('chatbotInput') as HTMLInputElement;
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  if (messageCount >= MAX_MESSAGES) {
    const rateLimitEl = document.getElementById('chatbotRateLimit');
    if (rateLimitEl) rateLimitEl.textContent = 'Rate limit reached (10 messages/session)';
    return;
  }

  messageCount++;
  input.value = '';
  messages.push({ role: 'user', content: text });
  addMessage('user', text);

  const typingDiv = document.createElement('div');
  typingDiv.className = 'chatbot-msg assistant chatbot-typing';
  typingDiv.textContent = '...';
  document.getElementById('chatbotMessages')?.appendChild(typingDiv);

  try {
    const chatApi = document.documentElement.dataset.chatApi;
    if (!chatApi) {
      typingDiv.remove();
      addMessage('assistant', 'Chat is not configured.');
      return;
    }
    const res = await fetch(`${chatApi}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.slice(-6) }),
    });

    typingDiv.remove();

    if (!res.ok) {
      addMessage('assistant', 'Sorry, something went wrong. Try again later.');
      return;
    }

    const data = await res.json();
    const reply = data.reply || 'No response.';
    messages.push({ role: 'assistant', content: reply });
    addMessage('assistant', reply);

    if (messageCount === 1) {
      try {
        window.dispatchEvent(new CustomEvent('achievement-trigger', { detail: 'ai_chat' }));
      } catch {
        /* silent */
      }
    }
  } catch {
    typingDiv.remove();
    addMessage('assistant', 'Connection error. Please try again.');
  }
}

export function initChatbot(): void {
  if (initialized) return;
  initialized = true;
  createUI();
}

export function destroyChatbot(): void {
  if (widgetEl) {
    widgetEl.remove();
    widgetEl = null;
  }
  if (panelEl) {
    panelEl.remove();
    panelEl = null;
  }
  messageCount = 0;
  messages.length = 0;
  initialized = false;
}
